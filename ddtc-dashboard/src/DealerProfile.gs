/**
 * Reads Dealer Profile data from a DDC workbook.
 */

/**
 * Reads Dealer Profile data from a DDC workbook.
 * @param {string} workbookId
 * @return {Object}
 */
function readDealerProfile(workbookId) {
  const spreadsheet = SpreadsheetApp.openById(workbookId);
  return readNamedFields(spreadsheet, DEALER_PROFILE_FIELDS);
}
