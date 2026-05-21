/**
 * Writes sync logs and workbook-level error reports.
 */

/**
 * Writes a sync-run log entry to the PM Dashboard when configured, otherwise logs to console.
 * @param {Object} entry
 * @return {void}
 */
function writeSyncLog(entry) {
  const normalizedEntry = {
    timestamp: new Date(),
    runId: entry.runId || '',
    status: entry.status || '',
    processedCount: entry.processedCount || 0,
    errorCount: entry.errorCount || 0,
    durationMs: entry.durationMs || 0,
    cursor: entry.cursor || 0,
    message: entry.message || ''
  };

  console.log(JSON.stringify(normalizedEntry));

  if (!CONFIG.PM_DASHBOARD_ID) {
    return;
  }

  const spreadsheet = SpreadsheetApp.openById(CONFIG.PM_DASHBOARD_ID);
  const sheet = getOrCreateSheet_(spreadsheet, CONFIG.TABS.SYNC_LOG);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'timestamp',
      'run_id',
      'status',
      'processed_count',
      'error_count',
      'duration_ms',
      'cursor',
      'message'
    ]);
  }
  sheet.appendRow([
    normalizedEntry.timestamp,
    normalizedEntry.runId,
    normalizedEntry.status,
    normalizedEntry.processedCount,
    normalizedEntry.errorCount,
    normalizedEntry.durationMs,
    normalizedEntry.cursor,
    normalizedEntry.message
  ]);
}

/**
 * Writes a workbook-level error to the sync log.
 * @param {string} runId
 * @param {string} workbookId
 * @param {Error} error
 * @return {void}
 */
function writeWorkbookError(runId, workbookId, error) {
  writeSyncLog({
    runId,
    status: 'workbook_error',
    errorCount: 1,
    message: `${workbookId}: ${error.message}`
  });
}
