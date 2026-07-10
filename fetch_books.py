import urllib.request
import json
import re
import time
import sys


def fetch_all_repos():
    repos = []
    page = 1

    while True:
        print(f"Fetching page {page}...", file=sys.stderr)

        url = f"https://api.github.com/orgs/standardebooks/repos?per_page=100&page={page}"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0"},
        )

        try:
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode("utf-8"))

            if not data:
                break

            repos.extend(data)
            page += 1
            time.sleep(0.2)

        except Exception as e:
            print(f"Error fetching page {page}: {e}", file=sys.stderr)
            break

    return repos


def process_repos(repos):
    books = []

    pattern = re.compile(
        r"^Epub source for the Standard Ebooks edition of (.*?),\s+by\s+(.*?)(?:\.\s+Translated\s+by\s+(.*))?$"
    )

    for repo in repos:
        name = repo["name"]
        description = repo.get("description", "")

        # Skip non-book repositories
        if (
            "_" not in name
            or name.startswith(".")
            or name in ("feed-books", "website-assets", "epub-css")
        ):
            continue

        title = None
        author = None
        translators = None

        if description:
            m = pattern.match(description)
            if m:
                title = m.group(1).strip()
                author = m.group(2).strip()

                if author.endswith("."):
                    author = author[:-1]

                translators = m.group(3).strip() if m.group(3) else None

                if translators and translators.endswith("."):
                    translators = translators[:-1]

        # Fallback if description doesn't match
        if not title or not author:
            parts = name.split("_")

            author_slug = parts[0] if len(parts) > 0 else ""
            title_slug = parts[1] if len(parts) > 1 else ""

            author = " ".join(word.capitalize() for word in author_slug.split("-"))
            title = " ".join(word.capitalize() for word in title_slug.split("-"))

            if len(parts) > 2:
                translators = " ".join(
                    word.capitalize() for word in parts[2].split("-")
                )

        # Use the repository homepage if available.
        # This gives the correct URL for books with multiple authors.
        book_url = (repo.get("homepage") or "").rstrip("/")

        # Fallback if homepage is missing.
        if not book_url:
            book_url = (
                "https://standardebooks.org/ebooks/"
                + "/".join(name.split("_"))
            )

        cover_url = f"{book_url}/downloads/cover.jpg"
        thumbnail_url = f"{book_url}/downloads/cover-thumbnail.jpg"

        books.append(
            {
                "id": name,
                "title": title,
                "author": author,
                "translators": translators,
                "url": book_url,
                "cover_url": cover_url,
                "thumbnail_url": thumbnail_url,
            }
        )

    return books


if __name__ == "__main__":
    repos = fetch_all_repos()
    print(f"Fetched {len(repos)} repositories total.", file=sys.stderr)

    books = process_repos(repos)
    print(f"Compiled {len(books)} books.", file=sys.stderr)

    with open("books.json", "w", encoding="utf-8") as f:
        json.dump(books, f, indent=2, ensure_ascii=False)

    print("Saved books.json successfully.", file=sys.stderr)
