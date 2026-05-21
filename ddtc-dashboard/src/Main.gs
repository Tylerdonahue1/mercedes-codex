/**
 * Public Apps Script entry points and custom menus.
 */

/**
 * Adds custom menus when a DDC workbook opens.
 * @return {void}
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(`${CONFIG.PROJECT_NAME} (${CONFIG.BUILDER_TAG})`)
    .addItem('Generate Codex Contact Report PDF', 'generateContactReportPdfForActiveWorkbook')
    .addToUi();
}

/**
 * Runs the daily PM Dashboard sync.
 * @return {void}
 */
function runDailySync() {
  runBatchedSync();
}

/**
 * Resumes an in-progress PM Dashboard sync.
 * @return {void}
 */
function continueBatchedSync() {
  runBatchedSync();
}

/**
 * Runs the PM Dashboard sync on demand.
 * @return {void}
 */
function syncNow() {
  runBatchedSync();
}

/**
 * Generates a Contact Report PDF for the active DDC workbook.
 * @return {string}
 */
function generateContactReportPdfForActiveWorkbook() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return generateContactReportPdf(spreadsheet.getId());
}
