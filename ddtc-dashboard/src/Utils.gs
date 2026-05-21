/**
 * Shared helpers for dates, named ranges, validation, and row formatting.
 */

/**
 * Gets or creates a sheet by name.
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet
 * @param {string} sheetName
 * @return {SpreadsheetApp.Sheet}
 */
function getOrCreateSheet_(spreadsheet, sheetName) {
  return spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
}

/**
 * Creates a durable run ID for logging.
 * @return {string}
 */
function createRunId() {
  return `sync-${Date.now()}`;
}

/**
 * Reads a named range value from a spreadsheet.
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet
 * @param {string} rangeName
 * @return {*}
 */
function getNamedValue(spreadsheet, rangeName) {
  const range = spreadsheet.getRangeByName(rangeName);
  if (!range) {
    console.log(`Missing named range: ${rangeName}`);
    return '';
  }
  return range.getValue();
}

/**
 * Reads multiple named range values into an object keyed by field name.
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet
 * @param {Array<string>} fields
 * @return {Object}
 */
function readNamedFields(spreadsheet, fields) {
  return fields.reduce((result, field) => {
    result[field] = getNamedValue(spreadsheet, field);
    return result;
  }, {});
}

/**
 * Reads schema field values into an object keyed by schema key.
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet
 * @param {Array<{key: string, label: string, type: string}>} schemaFields
 * @return {Object}
 */
function readSchemaFields(spreadsheet, schemaFields) {
  return schemaFields.reduce((result, field) => {
    result[field.key] = getNamedValue(spreadsheet, field.key);
    return result;
  }, {});
}

/**
 * Returns an integer countdown to a future date, or blank for missing dates.
 * @param {*} value
 * @return {number|string}
 */
function getDaysUntil(value) {
  if (!value) {
    return '';
  }
  const targetDate = new Date(value);
  if (Number.isNaN(targetDate.getTime())) {
    return '';
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  return Math.ceil((targetDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Classifies a next meeting date for dashboard display.
 * @param {*} nextMeetingDate
 * @return {string}
 */
function getMeetingStatus(nextMeetingDate) {
  const daysUntil = getDaysUntil(nextMeetingDate);
  if (daysUntil === '') {
    return 'unscheduled';
  }
  if (daysUntil < 0) {
    return 'overdue';
  }
  if (daysUntil <= 7) {
    return 'this_week';
  }
  return 'upcoming';
}
