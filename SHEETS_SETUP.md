# How to connect your Google Sheet to the portfolio

Follow these steps once. After that, the site will load data from your sheet every time someone opens the page.

---

## Step 1: Open your sheet and start Apps Script

1. Open your portfolio spreadsheet:  
   https://docs.google.com/spreadsheets/d/1pHsk_NMpbmSaTt8oWXWu4wORQniflgzZBq3QX1JnH18/edit  
2. In the menu, click **Extensions** → **Apps Script**.  
3. A new tab opens with a code editor. You’ll see something like `function myFunction() { }`.  
4. **Select all** the code in the editor (Ctrl+A / Cmd+A) and **delete** it.

---

## Step 2: Paste the portfolio script

1. Open the file **`sheets-appscript.js`** from this repo (in the `github` folder).  
2. **Copy all** of its contents.  
3. **Paste** into the empty Apps Script editor (replacing everything there).  
4. Click **File** → **Save** (or the disk icon).  
5. Name the project if asked (e.g. “Portfolio API”).  

The script reads your **index** sheet (project list) and your **indexcopy** sheet (bio, headline, links, etc.) and turns them into JSON for the website.

---

## Step 3: Deploy as a web app

1. In the Apps Script editor, click **Deploy** → **New deployment**.  
2. Click the pencil icon next to “Select type”.  
3. Choose **Web app**.  
4. Set:
   - **Description:** e.g. “Portfolio data” (optional).
   - **Execute as:** **Me** (your Google account).
   - **Who has access:** **Anyone** (so the site can load data without logging in).  
5. Click **Deploy**.  
6. The first time, Google may ask you to **Authorize access**: click **Authorize**, choose your Google account, then **Advanced** → “Go to Portfolio API (unsafe)” → **Allow**.  
7. When the deployment is done, you’ll see **Web app URL**.  
8. **Copy that URL** (it looks like `https://script.google.com/macros/s/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec`).  
   - Use the **Copy** link next to it; the URL is long and easy to break if you type it.

---

## Step 4: Put the URL in your site

1. Open **`main.js`** in this repo.  
2. Find this line near the top:
   ```js
   const SHEETS_JSON_URL = ''; // e.g. 'https://script.google.com/macros/s/xxx/exec'
   ```  
3. Paste your copied URL **between the quotes**:
   ```js
   const SHEETS_JSON_URL = 'https://script.google.com/macros/s/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec';
   ```  
4. Save the file.

---

## Step 5: Check your sheets

**Project list (index)**  
- The script uses the first sheet if it’s not named “index”.  
- Row 1 must be headers: `year`, `image_visibility`, `folder_name`, `show`, `title`, `project`, `description`, `discipline`, `link_out`.  
- Only rows where **show** = `Yes` appear on the site.

**Copy (indexcopy)**  
- Add a second sheet and name it **indexcopy** (or **copy**).  
- Column A = label, Column B = text or URL:

  | A          | B                                      |
  |------------|----------------------------------------|
  | bio        | Your intro paragraph…                  |
  | headline   | Casper Holden                          |
  | linkedin   | linkedin                               |
  | linkedin_url | https://linkedin.com/in/yourprofile |
  | mail       | mail                                   |
  | mail_url   | mailto:you@example.com                 |
  | visit      | Visit                                  |

---

## Done

Open your site (e.g. http://localhost:8000 if you’re testing locally). The projects and copy should load from the sheet. If you change the sheet and refresh the page, you’ll see the updates.

**If nothing loads:**  
- Open the browser’s Developer Tools (F12) → **Console** tab.  
- Look for errors mentioning “fetch” or “Sheets”; that usually means the URL is wrong, the deployment isn’t “Anyone”, or the sheet/copy structure doesn’t match the table above.

**If you change the script later:**  
- In Apps Script: **Deploy** → **Manage deployments** → pencil icon on your deployment → **Version** → **New version** → **Deploy**.  
- You don’t need to change the URL in `main.js`; it stays the same.
