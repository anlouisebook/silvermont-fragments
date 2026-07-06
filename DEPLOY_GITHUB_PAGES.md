# GitHub Pages deployment

1. Create a GitHub repository and place this project at the repository root.
2. Push it to the `main` branch.
3. In GitHub: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Run or wait for `.github/workflows/deploy-pages.yml`.
5. Copy the published Pages URL.
6. Open `js/config.js` and set:

```js
window.SILVERMONT_CONFIG = Object.freeze({
  onlinePlayUrl: "YOUR_PUBLISHED_PAGES_URL"
});
```

7. Commit and push that change. The main-menu **Play Online** button will then redirect to the hosted game.

The game is static HTML/CSS/JavaScript; no server-side runtime is required.
