/**
 * Writes consolidated data and summaries to the Program Manager Dashboard.
 */

const PROFILE_ACTIVITY_HEADERS = [
  'dealer_id',
  'dealer_name',
  'dealer_address',
  'region',
  'dpg',
  'som',
  'ddc_name',
  'current_meeting_date',
  'next_meeting_date',
  'mystery_shop_score',
  'dealer_attendees',
  'mbusa_attendees',
  'meeting_summary',
  'q3_action_plan_1',
  'q3_action_plan_2',
  'q3_action_plan_3',
  'generated_pdf_url'
];

const MEETING_SCHEDULE_HEADERS = [
  'dealer_id',
  'dealer_name',
  'ddc_name',
  'current_meeting_date',
  'next_meeting_date',
  'days_until_next_meeting',
  'meeting_status'
];

const IDA_HEADERS = [
  'dealer_id',
  'dealer_name',
  'ddc_name',
  'pre_completion_status',
  'pre_sales_process_score',
  'pre_digital_readiness_score',
  'pre_inventory_readiness_score',
  'pre_training_need_1',
  'pre_training_need_2',
  'pre_training_need_3',
  'pre_owner',
  'pre_due_date',
  'store_completion_status',
  'store_facility_score',
  'store_sales_observation_score',
  'store_bdc_score',
  'store_training_need_1',
  'store_training_need_2',
  'store_training_need_3',
  'store_owner',
  'store_due_date'
];

const DASHBOARD_TABLE_HEADER_ROW = 3;

/**
 * Clears PM Dashboard data tables before a full sync run starts.
 * @return {void}
 */
function clearDashboardData() {
  if (!CONFIG.PM_DASHBOARD_ID) {
    return;
  }

  const spreadsheet = SpreadsheetApp.openById(CONFIG.PM_DASHBOARD_ID);
  resetTable_(spreadsheet, CONFIG.TABS.PM_PROFILE_ACTIVITY, PROFILE_ACTIVITY_HEADERS);
  resetTable_(spreadsheet, CONFIG.TABS.PM_MEETING_SCHEDULE, MEETING_SCHEDULE_HEADERS);
  resetTable_(spreadsheet, CONFIG.TABS.PM_IDA_DATA, IDA_HEADERS);
}

/**
 * Writes consolidated profile and activity rows.
 * @param {Array<Object>} rows
 * @return {void}
 */
function writeProfileActivityRows(rows) {
  appendObjectsToDashboard_(CONFIG.TABS.PM_PROFILE_ACTIVITY, PROFILE_ACTIVITY_HEADERS, rows);
}

/**
 * Writes meeting schedule rows.
 * @param {Array<Object>} rows
 * @return {void}
 */
function writeMeetingScheduleRows(rows) {
  appendObjectsToDashboard_(CONFIG.TABS.PM_MEETING_SCHEDULE, MEETING_SCHEDULE_HEADERS, rows);
}

/**
 * Writes IDA assessment rows.
 * @param {Array<Object>} rows
 * @return {void}
 */
function writeIdaRows(rows) {
  appendObjectsToDashboard_(CONFIG.TABS.PM_IDA_DATA, IDA_HEADERS, rows);
}

/**
 * Recomputes PM Dashboard summary cells.
 * @return {void}
 */
function recomputeDashboardSummaries() {
  if (!CONFIG.PM_DASHBOARD_ID) {
    return;
  }

  const spreadsheet = SpreadsheetApp.openById(CONFIG.PM_DASHBOARD_ID);
  const sheet = getOrCreateSheet_(spreadsheet, CONFIG.TABS.PM_PROFILE_ACTIVITY);
  const lastRow = sheet.getLastRow();
  const dataRowCount = Math.max(lastRow - DASHBOARD_TABLE_HEADER_ROW, 0);
  const scoreValues = dataRowCount
    ? sheet.getRange(DASHBOARD_TABLE_HEADER_ROW + 1, 10, dataRowCount, 1).getValues().flat().filter((value) => value !== '')
    : [];
  const scoreTotal = scoreValues.reduce((sum, value) => sum + Number(value || 0), 0);
  const averageScore = scoreValues.length ? scoreTotal / scoreValues.length : '';
  const ddcNames = dataRowCount
    ? new Set(sheet.getRange(DASHBOARD_TABLE_HEADER_ROW + 1, 7, dataRowCount, 1).getValues().flat().filter(Boolean))
    : new Set();

  sheet.getRange('A1').setValue('Total Dealers');
  sheet.getRange('B1').setValue(dataRowCount);
  sheet.getRange('C1').setValue('Active DDCs');
  sheet.getRange('D1').setValue(ddcNames.size);
  sheet.getRange('E1').setValue('Total Meetings');
  sheet.getRange('F1').setValue(dataRowCount);
  sheet.getRange('G1').setValue('Average Mystery Shop Score');
  sheet.getRange('H1').setValue(averageScore);
}

/**
 * Appends objects to a configured PM Dashboard table.
 * @param {string} tabName
 * @param {Array<string>} headers
 * @param {Array<Object>} rows
 * @return {void}
 */
function appendObjectsToDashboard_(tabName, headers, rows) {
  if (!CONFIG.PM_DASHBOARD_ID || rows.length === 0) {
    return;
  }

  const spreadsheet = SpreadsheetApp.openById(CONFIG.PM_DASHBOARD_ID);
  const sheet = getOrCreateSheet_(spreadsheet, tabName);
  ensureHeaders_(sheet, headers);
  const values = rows.map((row) => headers.map((header) => row[header] || ''));
  sheet.getRange(sheet.getLastRow() + 1, 1, values.length, headers.length).setValues(values);
}

/**
 * Resets a dashboard table to only its header row.
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet
 * @param {string} tabName
 * @param {Array<string>} headers
 * @return {void}
 */
function resetTable_(spreadsheet, tabName, headers) {
  const sheet = getOrCreateSheet_(spreadsheet, tabName);
  sheet.clearContents();
  sheet.getRange(DASHBOARD_TABLE_HEADER_ROW, 1, 1, headers.length).setValues([headers]);
}

/**
 * Ensures a dashboard table has headers.
 * @param {SpreadsheetApp.Sheet} sheet
 * @param {Array<string>} headers
 * @return {void}
 */
function ensureHeaders_(sheet, headers) {
  if (sheet.getLastRow() < DASHBOARD_TABLE_HEADER_ROW) {
    sheet.getRange(DASHBOARD_TABLE_HEADER_ROW, 1, 1, headers.length).setValues([headers]);
  }
}
