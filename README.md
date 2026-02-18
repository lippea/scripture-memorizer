# Scripture Memorizer

Simple static web app for Scripture memorization practice.

## Run locally

Because the app loads JSON files with `fetch`, use a local HTTP server instead of opening `index.html` directly.

Example with Python:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Data files

- Verse files live in `verses/*.json`
- Group mapping is in `groups.json`

For GitHub Pages, keep `groups.json` committed and up to date.

## Deploy to GitHub Pages (automatic)

This repo includes GitHub Actions workflow:

- `.github/workflows/deploy-pages.yml`

It deploys automatically whenever `main` is updated.

### One-time GitHub setup

1. Open repository `Settings` -> `Pages`
2. Under **Build and deployment**, set **Source** to **GitHub Actions**

### Push flow

```bash
git add .
git commit -m "Update site"
git push origin main
```

After push, GitHub Actions deploys the latest version to Pages.

## URL format

The site URL is usually:

`https://<your-github-username>.github.io/scripture-memorizer/`
