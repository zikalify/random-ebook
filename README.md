# Random Standard Ebooks Cover Generator

A beautiful, responsive web application that displays a random book cover from standardebooks.org every time you load or click. Built with HTML, CSS, and vanilla JS, this site features a clean glassmorphic library card design with smooth gradient backgrounds and cover tilt animations.

Live Demo is ready to be hosted on **GitHub Pages**!

## Features

- **Random Book Selector**: Instantly chooses from the entire catalog of over 1,400+ Standard Ebooks.
- **Visual Design**: Sleek library theme with glowing animated background blobs, gold accents, and 3D cover tilt effects.
- **Fast Image Loading**: Preloads cover art in the background, displaying a low-resolution blurry thumbnail placeholder first to avoid content flashing.
- **Mobile First**: Fully optimized layout for desktops, tablets, and mobile screens.
- **Keyboard Shortcut**: Press `Spacebar` to discover the next ebook.

## How it Works

Standard Ebooks employs strict rate-limiting and does not expose CORS headers for direct client-side searches. 

To overcome this, a pre-compiled dataset `books.json` containing metadata (titles, authors, pages, and static cover URLs) is included in the project. The website fetches this local file (taking microseconds) and randomly selects a book.

## Local Development

To run the application locally:

1. Clone this repository to your computer.
2. Open a terminal in the folder and start a simple local server. For example:
   ```bash
   # Python 3
   python3 -m http.server 8000
   
   # Node.js
   npx serve
   ```
3. Open your browser to `http://localhost:8000` (or the address shown by your server).

## Updating the Catalog

Standard Ebooks continuously publishes new books. You can update the catalog in two ways:

### 1. Automated Updates (Recommended)
This project includes a **GitHub Actions workflow** (`.github/workflows/update_catalog.yml`) that runs automatically every day at midnight. It will:
- Run `fetch_books.py` to retrieve any new releases.
- Commit and push changes back to your repository, which automatically redeploys your website.
- You can also trigger it manually from the "Actions" tab of your GitHub repository.

### 2. Manual Updates
If you want to update it locally:
1. Open your terminal in the project directory.
2. Run the update script:
   ```bash
   python3 fetch_books.py
   ```
This will fetch the latest repository list from the official Standard Ebooks GitHub organization and save it into `books.json`.

## Deploying to GitHub Pages

1. Create a new repository on GitHub (e.g. `random-ebooks`).
2. Push this project to your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/random-ebooks.git
   git push -u origin main
   ```
3. Go to your repository settings on GitHub, navigate to **Pages** under the "Code and automation" sidebar.
4. Under "Build and deployment", set the source to **Deploy from a branch** and select `main` (and `/root` folder), then click **Save**.
5. Within a minute, your website will be live at `https://YOUR_USERNAME.github.io/random-ebooks/`!
