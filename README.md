# Casper Holden Portfolio

One-page portfolio site. Data is loaded from Google Sheets on each page load. Built with vanilla HTML/CSS/JS for easy hosting on one.com.

## Project structure

- `index.html` – Page structure
- `style.css` – Design tokens and layout (see DESIGN_SYSTEM.md)
- `main.js` – Fetch data, render projects, grow effect, panel (G/P)
- `project/` – Project image folders: one folder per project, e.g. `project/paradigm/`, `project/zipline/`
  - Images named `1`, `2`, `3`, … with extension `.jpg`, `.png`, `.gif`, or `.mp4`
  - The site uses the first image (`1.jpg` / `1.png` / `1.gif`) as the row thumbnail

## Google Sheets setup

**→ Step-by-step guide: see [SHEETS_SETUP.md](SHEETS_SETUP.md)**

1. Open your [portfolio spreadsheet](https://docs.google.com/spreadsheets/d/1pHsk_NMpbmSaTt8oWXWu4wORQniflgzZBq3QX1JnH18/edit).
2. **Extensions → Apps Script.** Delete any sample code and paste the contents of `sheets-appscript.js`.
3. Save the project (e.g. “Portfolio API”).
4. **Deploy → New deployment → Type: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy. Copy the **Web app URL**.
5. In `main.js`, set `SHEETS_JSON_URL` to that URL:
   ```js
   const SHEETS_JSON_URL = 'https://script.google.com/macros/s/xxxxxxxx/exec';
   ```

### Index sheet (project list)

First row = headers. Rows with **show** = `Yes` are included.

| Column           | Usage |
|------------------|--------|
| year             | Displayed as-is |
| image_visibility | `Yes` = show image from folder, `No` = placeholder, `Locked` = placeholder + “Locked” |
| folder_name      | Folder under `project/`, e.g. `paradigm`, `zipline` (no leading slash) |
| show             | `Yes` = row appears on site |
| title            | Combined with project (space between) for display |
| project          | Combined with title |
| description      | Project description |
| discipline       | Comma-separated; shown as `(a) (b) (c)` lowercase, brackets added in code |
| link_out         | Optional URL; adds “(Visit)” after title, opens in new tab |

### Copy sheet (all site copy)

Use a sheet named **indexcopy** (or **copy**). Columns:

| A (label) | B (copy) |
|-----------|----------|
| bio       | Intro paragraph in header |
| headline  | Centered name, e.g. “Casper Holden” |
| linkedin  | Link text, e.g. “linkedin” |
| linkedin_url | Full LinkedIn URL |
| mail     | Link text, e.g. “mail” |
| mail_url | mailto: or contact URL |
| visit     | Label for project link, e.g. “Visit” |

Labels are lowercased and spaces replaced with `_` (e.g. `mail_url`). The site reads copy on each load; update the sheet and refresh the page to see changes.

## Keyboard shortcuts

- **G** – Toggle grid overlay
- **P** – Toggle panel (Grow / Ver 1 / Ver 2)

## Hosting on one.com

1. Upload the repo contents (including `project/` and your images) to your web space via FTP or File Manager.
2. Ensure `index.html` is in the root (or point the domain to the folder that contains it).
3. Keep `SHEETS_JSON_URL` in `main.js` pointing to your deployed Apps Script URL.

No build step required.
