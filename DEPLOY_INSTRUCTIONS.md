# GitHub Pages Deployment Instructions

Since the repository is now public, you can deploy to GitHub Pages using these methods:

## Option 1: Use GitHub's Web Interface (Recommended)

1. Go to your repository: https://github.com/kroffske/graphloom
2. Click on "Actions" tab
3. Click "New workflow"
4. Search for "Deploy static content to Pages"
5. Click "Configure" on the workflow by GitHub Actions
6. Replace the workflow content with this:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Install dependencies
        run: npm ci
        
      - name: Build with Vite
        run: npm run build
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

7. Click "Commit changes"
8. Go to Settings → Pages
9. Under "Source", select "GitHub Actions"

## Option 2: Manual Deployment with gh-pages

1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to package.json scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

4. In GitHub Settings → Pages:
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)

## Important Notes

- The app is configured with base path `/graphloom/`
- Your app will be available at: https://kroffske.github.io/graphloom/
- First deployment may take a few minutes to become active