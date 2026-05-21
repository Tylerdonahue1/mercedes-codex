/**
 * Generates branded Contact Report PDFs from a Google Docs template.
 */

const CONTACT_REPORT_PDF_TOKENS = [
  'dealer_name',
  'dealer_address',
  'region',
  'dpg',
  'som',
  'current_meeting_date',
  'next_meeting_date',
  'dealer_attendees',
  'mbusa_attendees',
  'mystery_shop_score',
  'meeting_summary',
  'q3_action_plan_1',
  'q3_action_plan_2',
  'q3_action_plan_3'
];

/**
 * Generates a branded Contact Report PDF from a DDC workbook.
 * @param {string} workbookId
 * @return {string}
 */
function generateContactReportPdf(workbookId) {
  if (!CONFIG.CONTACT_REPORT_DOC_TEMPLATE_ID || !CONFIG.PDF_OUTPUT_FOLDER_ID) {
    throw new Error('CONTACT_REPORT_DOC_TEMPLATE_ID and PDF_OUTPUT_FOLDER_ID must be configured before PDF generation.');
  }

  const dealerProfile = readDealerProfile(workbookId);
  const contactReport = readContactReport(workbookId);
  const tokenValues = buildContactReportTokenValues_(dealerProfile, contactReport);
  const fileName = buildContactReportFileName_(dealerProfile, contactReport);
  const templateFile = DriveApp.getFileById(CONFIG.CONTACT_REPORT_DOC_TEMPLATE_ID);
  const outputFolder = DriveApp.getFolderById(CONFIG.PDF_OUTPUT_FOLDER_ID);
  const workingDocFile = templateFile.makeCopy(`${fileName} Working Copy`, outputFolder);
  const document = DocumentApp.openById(workingDocFile.getId());
  const body = document.getBody();

  Object.keys(tokenValues).forEach((token) => {
    body.replaceText(`{{${token}}}`, String(tokenValues[token] || ''));
  });

  document.saveAndClose();

  const pdfBlob = workingDocFile.getBlob().getAs(MimeType.PDF).setName(`${fileName}.pdf`);
  const pdfFile = outputFolder.createFile(pdfBlob);
  workingDocFile.setTrashed(true);
  writeGeneratedPdfUrl_(workbookId, pdfFile.getUrl());
  return pdfFile.getUrl();
}

/**
 * Builds token values for the Contact Report PDF.
 * @param {Object} dealerProfile
 * @param {Object} contactReport
 * @return {Object}
 */
function buildContactReportTokenValues_(dealerProfile, contactReport) {
  const source = Object.assign({}, dealerProfile, contactReport);
  return CONTACT_REPORT_PDF_TOKENS.reduce((tokens, token) => {
    tokens[token] = source[token] || '';
    return tokens;
  }, {});
}

/**
 * Builds a stable PDF file name.
 * @param {Object} dealerProfile
 * @param {Object} contactReport
 * @return {string}
 */
function buildContactReportFileName_(dealerProfile, contactReport) {
  const dealerName = dealerProfile.dealer_name || 'Dealer';
  const meetingDate = contactReport.current_meeting_date
    ? Utilities.formatDate(new Date(contactReport.current_meeting_date), Session.getScriptTimeZone(), 'yyyy-MM-dd')
    : Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return `${CONFIG.ASSET_NAME_PREFIX} - ${dealerName} Contact Report ${meetingDate}`.replace(/[\\/:*?"<>|]/g, '-');
}

/**
 * Writes the generated PDF URL back to the workbook when the named range exists.
 * @param {string} workbookId
 * @param {string} pdfUrl
 * @return {void}
 */
function writeGeneratedPdfUrl_(workbookId, pdfUrl) {
  const spreadsheet = SpreadsheetApp.openById(workbookId);
  const range = spreadsheet.getRangeByName('generated_pdf_url');
  if (range) {
    range.setValue(pdfUrl);
  }
}
