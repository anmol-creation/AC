# Blog Theme Setup

This is a modern, clean, SEO-friendly blog theme built with React, Vite, and Tailwind CSS. It features a local file-based admin interface for managing Markdown posts.

## Getting Started

1.  **Install dependencies:**
    ```bash
    cd blog
    npm install
    ```

2.  **Start the development server and admin backend:**
    We use `concurrently` to run both the React dev server and the Admin backend API.
    ```bash
    npm run dev:all
    ```
    *   **Frontend:** http://localhost:5173
    *   **Admin Backend:** http://localhost:3001

    To access the Admin Dashboard, go to `http://localhost:5173/admin`.

## Admin Interface

The admin interface is **local-only** by default. It connects to the Node.js server running on port 3001 which reads/writes files in `content/posts`.

*   **Create Post:** Creates a new Markdown file in `content/posts`.
*   **Edit Post:** Updates existing Markdown file.
*   **Upload Image:** Uploads images to `public/assets/images`.

**Note:** Since this is a static site architecture, the "Admin" changes modify the source files. You must commit these changes to Git to deploy them.

## Deployment to GitHub Pages

1.  **Build the project:**
    ```bash
    npm run build
    ```

2.  **Deploy:**
    You can use a GitHub Action to deploy the `dist` folder to the `gh-pages` branch.

    Example workflow (`.github/workflows/deploy-blog.yml`):
    ```yaml
    name: Deploy Blog
    on:
      push:
        branches: [main]
        paths: ['blog/**']
    jobs:
      build-and-deploy:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v3
          - uses: actions/setup-node@v3
            with:
              node-version: 18
          - run: cd blog && npm install && npm run build
          - uses: JamesIves/github-pages-deploy-action@v4
            with:
              folder: blog/dist
    ```

## SEO Checklist

*   [x] **Meta Tags:** Each post has dynamic Title, Description, and OG Image tags using `react-helmet-async`.
*   [x] **Semantic HTML:** Uses `<article>`, `<header>`, `<time>`, etc.
*   [ ] **Sitemap:** Generate a `sitemap.xml` during build (recommend `vite-plugin-sitemap`).
*   [ ] **Structured Data:** Add JSON-LD schema to posts (Article schema).

## Project Structure

*   `content/posts/*.md`: Blog posts in Markdown.
*   `public/assets/images/`: Uploaded images.
*   `src/pages/`: React components for pages.
*   `server/`: Local Node.js server for Admin API.
