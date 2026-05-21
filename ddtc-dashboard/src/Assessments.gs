/**
 * Reads Pre-Assessment and In-Store Assessment data from a DDC workbook.
 */

/**
 * Reads assessment data from a DDC workbook.
 * @param {string} workbookId
 * @return {{preAssessment: Object, inStoreAssessment: Object}}
 */
function readAssessments(workbookId) {
  const spreadsheet = SpreadsheetApp.openById(workbookId);
  return {
    preAssessment: readSchemaFields(spreadsheet, PRE_ASSESSMENT_FIELDS),
    inStoreAssessment: readSchemaFields(spreadsheet, IN_STORE_ASSESSMENT_FIELDS)
  };
}
