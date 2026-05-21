/**
 * Copies workbook templates, configures permissions, and preloads dealer data.
 */

/**
 * Provisions one DDC workbook from the configured template.
 * @param {string} ddcName
 * @param {string} ddcEmail
 * @param {Array<string>} pmViewerEmails
 * @param {Array<Object>} dealerRows
 * @return {{workbookId: string, workbookUrl: string}}
 */
function provisionDdcWorkbook(ddcName, ddcEmail, pmViewerEmails, dealerRows) {
  if (!CONFIG.DDC_TEMPLATE_ID) {
    throw new Error('DDC_TEMPLATE_ID must be configured before provisioning.');
  }

  const templateFile = DriveApp.getFileById(CONFIG.DDC_TEMPLATE_ID);
  const workbookFile = templateFile.makeCopy(`${CONFIG.ASSET_NAME_PREFIX} - DDC Workbook - ${ddcName}`);
  workbookFile.addEditor(ddcEmail);
  (pmViewerEmails || []).forEach((email) => workbookFile.addViewer(email));

  const spreadsheet = SpreadsheetApp.openById(workbookFile.getId());
  preloadDealerRows_(spreadsheet, dealerRows || []);
  appendWorkbookRegistryRow_(ddcName, workbookFile.getId());

  return {
    workbookId: workbookFile.getId(),
    workbookUrl: workbookFile.getUrl()
  };
}

/**
 * Preloads dealer rows into the Dealer Profile tab.
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet
 * @param {Array<Object>} dealerRows
 * @return {void}
 */
function preloadDealerRows_(spreadsheet, dealerRows) {
  if (dealerRows.length === 0) {
    return;
  }

  const sheet = getOrCreateSheet_(spreadsheet, CONFIG.TABS.DEALER_PROFILE);
  const headers = ['dealer_id', 'dealer_name', 'dealer_address', 'region', 'dpg', 'som'];
  const values = dealerRows.map((dealer) => headers.map((header) => dealer[header] || ''));
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, values.length, headers.length).setValues(values);
}

/**
 * Appends a provisioned workbook to the registry sheet.
 * @param {string} ddcName
 * @param {string} workbookId
 * @return {void}
 */
function appendWorkbookRegistryRow_(ddcName, workbookId) {
  if (!CONFIG.DEALER_REGISTRY_SHEET_ID) {
    console.log(`Provisioned workbook ${workbookId} for ${ddcName}; registry sheet not configured.`);
    return;
  }

  const spreadsheet = SpreadsheetApp.openById(CONFIG.DEALER_REGISTRY_SHEET_ID);
  const sheet = spreadsheet.getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['ddc_name', 'workbook_id', 'status']);
  }
  sheet.appendRow([ddcName, workbookId, 'active']);
}
