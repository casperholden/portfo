# AGENTS.md

## Cursor Cloud specific instructions

This is a vanilla HTML/CSS/JS portfolio site with **zero dependencies** — no package manager, no build step, no framework.

### Running the dev server

Serve static files from the repo root with any HTTP server:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/` in Chrome.

### Key notes

- **No lint/test/build tooling exists** — there are no `package.json`, ESLint, Prettier, or test frameworks configured. Validation is done visually in the browser.
- Project data is fetched from an external Google Sheets Apps Script URL configured in `main.js` (`SHEETS_JSON_URL`). If the fetch fails, the site falls back to hardcoded dummy data in `useFallbackData()`.
- Project media assets live under `project/<folder_name>/` with files named `1.jpg`, `1.png`, `1.gif`, `1.webp`, or `1.mp4`. The code tries each extension in order.
- Keyboard shortcuts: **G** toggles grid overlay, **P** toggles the settings panel.
- Light/dark mode toggle is in the header contact-links area.
- See `README.md` for project structure and Google Sheets setup; see `DESIGN_SYSTEM.md` for design tokens and layout rules.
