# Deploy GraphLoom to GitHub Pages

## Quick Deploy (Using gh-pages)

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json scripts:**
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

3. **Update vite.config.ts:**
   ```typescript
   base: '/graphloom/',
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages:**
   - Go to Settings → Pages in your repo
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)
   - Save

Your app will be live at: https://kroffske.github.io/graphloom/

## Alternative: GitHub Actions

You can also set up automatic deployment using GitHub Actions, but this requires a token with workflow permissions. If you want to use this method, create `.github/workflows/deploy.yml` manually in your repository through the GitHub web interface.