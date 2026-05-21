/**
 * Reads and manages the list of DDC workbook IDs.
 */

/**
 * Returns active DDC workbook registry rows.
 * @return {Array<{ddcName: string, workbookId: string}>}
 */
function getActiveWorkbookRegistryRows() {
  if (!CONFIG.DEALER_REGISTRY_SHEET_ID) {
    return DUMMY_WORKBOOK_REGISTRY.slice();
  }

  const spreadsheet = SpreadsheetApp.openById(CONFIG.DEALER_REGISTRY_SHEET_ID);
  const sheet = spreadsheet.getSheets()[0];
  const values = sheet.getDataRange().getValues();
  const [headers, ...rows] = values;
  const ddcNameIndex = headers.indexOf('ddc_name');
  const workbookIdIndex = headers.indexOf('workbook_id');
  const statusIndex = headers.indexOf('status');

  if (ddcNameIndex === -1 || workbookIdIndex === -1 || statusIndex === -1) {
    throw new Error('Registry sheet must include ddc_name, workbook_id, and status columns.');
  }

  return rows
    .filter((row) => String(row[statusIndex]).toLowerCase() === 'active')
    .map((row) => ({
      ddcName: String(row[ddcNameIndex]).trim(),
      workbookId: String(row[workbookIdIndex]).trim()
    }))
    .filter((row) => row.ddcName && row.workbookId);
}
