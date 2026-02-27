/**
 * Google Apps Script for casperholden.com portfolio
 * Deploy as Web app: Execute as me, Who has access: Anyone
 * Returns JSON: { projects: [...], copy: { bio, headline, visit, ... } }
 */
function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const projects = getProjects(ss);
  const copy = getCopy(ss);
  const out = JSON.stringify({ projects: projects, copy: copy });
  return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
}

function getProjects(ss) {
  const sheet = ss.getSheetByName('index') || ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  if (!data.length) return [];
  const headers = data[0].map(h => String(h || '').trim().toLowerCase().replace(/\s+/g, '_'));
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    data[i].forEach((cell, j) => {
      const key = headers[j];
      if (key) row[key] = cell != null ? String(cell).trim() : '';
    });
    if (row.year !== undefined || row.title !== undefined || row.show !== undefined) {
      rows.push(row);
    }
  }
  return rows;
}

function getCopy(ss) {
  const sheet = ss.getSheetByName('indexcopy') || ss.getSheetByName('copy') || ss.getSheets()[1];
  if (!sheet) return {};
  const data = sheet.getDataRange().getValues();
  if (!data.length) return {};
  const copy = {};
  for (let i = 0; i < data.length; i++) {
    const label = data[i][0] != null ? String(data[i][0]).trim().toLowerCase().replace(/\s+/g, '_') : '';
    if (!label) continue;
    const value = data[i][1] != null ? String(data[i][1]).trim() : '';
    copy[label] = value;
  }
  return copy;
}
