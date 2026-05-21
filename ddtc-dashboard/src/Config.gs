/**
 * Project-wide constants for DDTC Dashboard.
 */
const CONFIG = {
  PM_DASHBOARD_ID: '',
  DEALER_REGISTRY_SHEET_ID: '',
  DDC_TEMPLATE_ID: '',
  CONTACT_REPORT_DOC_TEMPLATE_ID: '',
  PDF_OUTPUT_FOLDER_ID: '',
  BATCH_SIZE: 10,
  MAX_RUN_MS: 4.5 * 60 * 1000,
  RESUME_DELAY_MS: 60 * 1000,
  SYNC_CURSOR_PROPERTY: 'DDTC_SYNC_CURSOR_INDEX',
  SYNC_RUN_ID_PROPERTY: 'DDTC_SYNC_RUN_ID',
  TABS: {
    DEALER_PROFILE: 'Dealer Profile',
    CONTACT_REPORT: 'Contact Report / Action Plan',
    INTERNAL_CONTACT_REPORT: 'Internal Contact Report',
    PRE_ASSESSMENT: 'Pre-Assessment',
    IN_STORE_ASSESSMENT: 'In-Store Assessment',
    PM_PROFILE_ACTIVITY: 'Consolidated Dealer Profiles & Activity',
    PM_MEETING_SCHEDULE: 'Meeting Schedule Overview',
    PM_IDA_DATA: 'IDA Data',
    SYNC_LOG: 'Sync Log'
  }
};

const DUMMY_WORKBOOK_REGISTRY = [
  { ddcName: 'DDC 01', workbookId: 'dummy-workbook-001' },
  { ddcName: 'DDC 02', workbookId: 'dummy-workbook-002' },
  { ddcName: 'DDC 03', workbookId: 'dummy-workbook-003' },
  { ddcName: 'DDC 04', workbookId: 'dummy-workbook-004' },
  { ddcName: 'DDC 05', workbookId: 'dummy-workbook-005' },
  { ddcName: 'DDC 06', workbookId: 'dummy-workbook-006' },
  { ddcName: 'DDC 07', workbookId: 'dummy-workbook-007' },
  { ddcName: 'DDC 08', workbookId: 'dummy-workbook-008' },
  { ddcName: 'DDC 09', workbookId: 'dummy-workbook-009' },
  { ddcName: 'DDC 10', workbookId: 'dummy-workbook-010' },
  { ddcName: 'DDC 11', workbookId: 'dummy-workbook-011' },
  { ddcName: 'DDC 12', workbookId: 'dummy-workbook-012' },
  { ddcName: 'DDC 13', workbookId: 'dummy-workbook-013' },
  { ddcName: 'DDC 14', workbookId: 'dummy-workbook-014' },
  { ddcName: 'DDC 15', workbookId: 'dummy-workbook-015' },
  { ddcName: 'DDC 16', workbookId: 'dummy-workbook-016' },
  { ddcName: 'DDC 17', workbookId: 'dummy-workbook-017' },
  { ddcName: 'DDC 18', workbookId: 'dummy-workbook-018' },
  { ddcName: 'DDC 19', workbookId: 'dummy-workbook-019' },
  { ddcName: 'DDC 20', workbookId: 'dummy-workbook-020' },
  { ddcName: 'DDC 21', workbookId: 'dummy-workbook-021' },
  { ddcName: 'DDC 22', workbookId: 'dummy-workbook-022' },
  { ddcName: 'DDC 23', workbookId: 'dummy-workbook-023' },
  { ddcName: 'DDC 24', workbookId: 'dummy-workbook-024' },
  { ddcName: 'DDC 25', workbookId: 'dummy-workbook-025' },
  { ddcName: 'DDC 26', workbookId: 'dummy-workbook-026' },
  { ddcName: 'DDC 27', workbookId: 'dummy-workbook-027' },
  { ddcName: 'DDC 28', workbookId: 'dummy-workbook-028' },
  { ddcName: 'DDC 29', workbookId: 'dummy-workbook-029' },
  { ddcName: 'DDC 30', workbookId: 'dummy-workbook-030' },
  { ddcName: 'DDC 31', workbookId: 'dummy-workbook-031' },
  { ddcName: 'DDC 32', workbookId: 'dummy-workbook-032' },
  { ddcName: 'DDC 33', workbookId: 'dummy-workbook-033' },
  { ddcName: 'DDC 34', workbookId: 'dummy-workbook-034' },
  { ddcName: 'DDC 35', workbookId: 'dummy-workbook-035' },
  { ddcName: 'DDC 36', workbookId: 'dummy-workbook-036' },
  { ddcName: 'DDC 37', workbookId: 'dummy-workbook-037' },
  { ddcName: 'DDC 38', workbookId: 'dummy-workbook-038' },
  { ddcName: 'DDC 39', workbookId: 'dummy-workbook-039' },
  { ddcName: 'DDC 40', workbookId: 'dummy-workbook-040' },
  { ddcName: 'DDC 41', workbookId: 'dummy-workbook-041' },
  { ddcName: 'DDC 42', workbookId: 'dummy-workbook-042' },
  { ddcName: 'DDC 43', workbookId: 'dummy-workbook-043' },
  { ddcName: 'DDC 44', workbookId: 'dummy-workbook-044' },
  { ddcName: 'DDC 45', workbookId: 'dummy-workbook-045' },
  { ddcName: 'DDC 46', workbookId: 'dummy-workbook-046' },
  { ddcName: 'DDC 47', workbookId: 'dummy-workbook-047' }
];

const DEALER_PROFILE_FIELDS = [
  'dealer_id',
  'dealer_name',
  'dealer_address',
  'region',
  'dpg',
  'som',
  'dealer_principal',
  'gsm',
  'gm',
  'sm',
  'bdc_manager',
  'digital_manager',
  'custom_role_1_title',
  'custom_role_1_name',
  'custom_role_2_title',
  'custom_role_2_name',
  'custom_role_3_title',
  'custom_role_3_name'
];

const CONTACT_REPORT_FIELDS = [
  'current_meeting_date',
  'next_meeting_date',
  'dealer_attendees',
  'mbusa_attendees',
  'mystery_shop_score',
  'meeting_summary',
  'q3_action_plan_1',
  'q3_action_plan_2',
  'q3_action_plan_3',
  'generated_pdf_url'
];

const PRE_ASSESSMENT_FIELDS = [
  { key: 'pre_completion_status', label: 'Completion Status', type: 'string' },
  { key: 'pre_sales_process_score', label: 'Sales Process Score', type: 'number' },
  { key: 'pre_digital_readiness_score', label: 'Digital Readiness Score', type: 'number' },
  { key: 'pre_inventory_readiness_score', label: 'Inventory Readiness Score', type: 'number' },
  { key: 'pre_training_need_1', label: 'Training Need 1', type: 'string' },
  { key: 'pre_training_need_2', label: 'Training Need 2', type: 'string' },
  { key: 'pre_training_need_3', label: 'Training Need 3', type: 'string' },
  { key: 'pre_notes', label: 'Notes', type: 'string' },
  { key: 'pre_owner', label: 'Owner', type: 'string' },
  { key: 'pre_due_date', label: 'Due Date', type: 'date' }
];

const IN_STORE_ASSESSMENT_FIELDS = [
  { key: 'store_completion_status', label: 'Completion Status', type: 'string' },
  { key: 'store_facility_score', label: 'Facility Score', type: 'number' },
  { key: 'store_sales_observation_score', label: 'Sales Observation Score', type: 'number' },
  { key: 'store_bdc_score', label: 'BDC Score', type: 'number' },
  { key: 'store_training_need_1', label: 'Training Need 1', type: 'string' },
  { key: 'store_training_need_2', label: 'Training Need 2', type: 'string' },
  { key: 'store_training_need_3', label: 'Training Need 3', type: 'string' },
  { key: 'store_notes', label: 'Notes', type: 'string' },
  { key: 'store_owner', label: 'Owner', type: 'string' },
  { key: 'store_due_date', label: 'Due Date', type: 'date' }
];
