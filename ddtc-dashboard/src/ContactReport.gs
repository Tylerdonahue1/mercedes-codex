/**
 * Reads Contact Report and Action Plan data from a DDC workbook.
 */

/**
 * Reads Contact Report and Action Plan data from a DDC workbook.
 * @param {string} workbookId
 * @return {Object}
 */
function readContactReport(workbookId) {
  const spreadsheet = SpreadsheetApp.openById(workbookId);
  return readNamedFields(spreadsheet, CONTACT_REPORT_FIELDS);
}
