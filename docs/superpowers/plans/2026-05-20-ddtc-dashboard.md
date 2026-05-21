# DDTC Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a simple clasp-managed Google Sheets + Apps Script system for DDC workbooks, a Program Manager dashboard, batched daily aggregation, and branded contact-report PDF generation.

**Architecture:** Keep the system as plain Apps Script modules with one responsibility per `.gs` file. Treat `docs/data-schema.md` and schema constants as the contract between the workbook tabs, dashboard writes, and PDF output. Build batching first with dummy workbook IDs, then add pure read functions and dashboard write functions.

**Tech Stack:** Google Apps Script, Google Sheets, Google Docs templates, Google Drive, `@google/clasp`, markdown docs.

---

## Scope

Build only the June 2026 go-live baseline:

- One DDC workbook template with 5 tabs.
- One PM Dashboard template with 3 tabs.
- Apps Script aggregator using continuation state and `LockService`.
- Apps Script PDF generator using a Google Docs template.
- Provisioning helpers for copying templates and assigning access.
- Documentation for deployment, schemas, templates, testing, and open questions.

Do not build real-time sync, notifications, mobile apps, financial workflows, or `.ics` export in this version.

## File Structure

- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/README.md`: project overview and local setup.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/.clasp.json`: script ID after `clasp create`.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/.claspignore`: exclude local-only files from Apps Script push.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/appsscript.json`: manifest with timezone and required scopes.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/Config.gs`: IDs, tab names, batch settings, schema constants.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/Main.gs`: menu and public entry-point dispatch only.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/Aggregator.gs`: batched sync loop and continuation state.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/WorkbookRegistry.gs`: reads DDC workbook registry rows.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/DealerProfile.gs`: pure reads for DDC Tab 1.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/ContactReport.gs`: pure reads for DDC Tab 2.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/Assessments.gs`: schema-driven pure reads for Tabs 4 and 5.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/PMDashboard.gs`: all PM Dashboard writes and summary formulas.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/PDFGenerator.gs`: Google Docs template copy, token replacement, PDF export.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/Provisioning.gs`: copy DDC templates, set permissions, preload dealers.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/Triggers.gs`: install and remove scheduled triggers.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/Logger.gs`: sync log and workbook-level error logging.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/Utils.gs`: named-range, date, row, and validation helpers.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/templates/ddc-workbook-template-notes.md`: manual DDC workbook setup.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/templates/pm-dashboard-template-notes.md`: manual PM dashboard setup.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/templates/contact-report-doc-template-notes.md`: manual Docs PDF template setup.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/docs/architecture.md`: module responsibilities and data flow.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/docs/deployment.md`: runbook for clasp, templates, triggers, and rollout.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/docs/data-schema.md`: field-by-field contract.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/docs/open-questions.md`: assessment field ownership and unresolved decisions.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/test/fixtures/dummy-workbook-registry.csv`: 47 dummy workbook IDs.
- Create `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/test/manual-test-plan.md`: manual verification checklist.

## Key Hurdles And Simple Solutions

1. Apps Script 6-minute execution limit.
   Solution: implement no-op batching first, process 10 workbooks per invocation, stop at 4.5 minutes, persist cursor in `PropertiesService`, and self-reschedule until complete.

2. Concurrent sync invocations corrupting cursor state.
   Solution: wrap `runBatchedSync` with `LockService.getScriptLock()`, fail gracefully if lock cannot be acquired, and write a sync-log row.

3. Tab names or named ranges drifting after manual edits.
   Solution: centralize tab names and named ranges in `Config.gs`; add `validateWorkbookStructure(workbookId)` before reads; log missing fields per workbook instead of aborting.

4. Assessment fields are not final.
   Solution: define `PRE_ASSESSMENT_FIELDS` and `IN_STORE_ASSESSMENT_FIELDS` arrays in `Config.gs`; make `Assessments.gs` loop over schema fields so changing fields is a config change.

5. Internal notes leaking to dashboard or PDF.
   Solution: do not create any Tab 3 read function used by the aggregator or PDF generator. `Internal Contact Report` appears only in docs and workbook template setup.

6. PDF brand fidelity.
   Solution: use a manually built Google Docs template with `{{tokens}}`; Apps Script only copies, replaces tokens, exports, and records the PDF URL.

7. Permissions confusion across DDCs and PMs.
   Solution: provisioning has one clear function that copies the template, shares edit access to one DDC, shares view access to PM, and logs the workbook ID.

8. Hidden spreadsheet formulas or filters breaking dashboard output.
   Solution: Apps Script writes raw data to defined data ranges; summary cards and filter views live in the manual PM template.

## Task 1: Local Scaffold

**Files:**
- Create: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/README.md`
- Create: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/.claspignore`
- Create: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/appsscript.json`
- Create: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/*.gs`
- Create: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/templates/*.md`
- Create: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/docs/*.md`
- Create: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/test/fixtures/dummy-workbook-registry.csv`
- Create: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/test/manual-test-plan.md`

- [ ] **Step 1: Create directories**

```bash
mkdir -p /Users/mac-mini/Mercedes-Codex/ddtc-dashboard/{src,templates,docs,test/fixtures}
```

Expected: command exits with no output.

- [ ] **Step 2: Initialize npm and install clasp locally**

```bash
cd /Users/mac-mini/Mercedes-Codex/ddtc-dashboard
npm init -y
npm install --save-dev @google/clasp
```

Expected: `package.json`, `package-lock.json`, and `node_modules/` are created.

- [ ] **Step 3: Authenticate clasp**

```bash
cd /Users/mac-mini/Mercedes-Codex/ddtc-dashboard
npx clasp login
```

Expected: browser login succeeds and clasp can access Google Apps Script.

- [ ] **Step 4: Create the Apps Script project**

```bash
cd /Users/mac-mini/Mercedes-Codex/ddtc-dashboard
npx clasp create --type standalone --title "DDTC Dashboard"
```

Expected: `.clasp.json` is created with the script ID.

- [ ] **Step 5: Create manifest**

Write `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/appsscript.json`:

```json
{
  "timeZone": "America/New_York",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/script.scriptapp"
  ]
}
```

- [ ] **Step 6: Create `.claspignore`**

Write `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/.claspignore`:

```text
node_modules/**
docs/**
templates/**
test/**
README.md
package.json
package-lock.json
```

- [ ] **Step 7: Create Apps Script stubs**

Create each `.gs` file with a purpose comment and no business logic yet. Example for `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/Aggregator.gs`:

```javascript
/**
 * Batched sync engine for reading DDC workbooks and writing PM Dashboard data.
 */
```

Use equivalent one-sentence comments for the other `.gs` files.

- [ ] **Step 8: Push scaffold**

```bash
cd /Users/mac-mini/Mercedes-Codex/ddtc-dashboard
npx clasp push
```

Expected: clasp uploads the manifest and `.gs` stubs without syntax errors.

## Task 2: Schema Contract For Known Tabs

**Files:**
- Create: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/docs/data-schema.md`
- Modify: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/Config.gs`

- [ ] **Step 1: Write `docs/data-schema.md` for Tabs 1, 2, and 3**

Include these fields:

```markdown
# Data Schema

## Rules

- Protected dealer-profile fields sync to the PM Dashboard and may appear in PDFs.
- Contact Report fields sync to the PM Dashboard unless marked PDF-only.
- Internal Contact Report fields never sync to the PM Dashboard and never appear in PDFs.
- Assessment field schemas are intentionally configurable because final field lists are pending from Shirl and Pamelina.

## DDC Tab 1: Dealer Profile

| Field | Named range | Type | Editable | Validation | Syncs to PM | In PDF |
|---|---|---|---|---|---|---|
| dealer_id | dealer_id | string | no | required, unique | yes | no |
| dealer_name | dealer_name | string | no | required | yes | yes |
| dealer_address | dealer_address | string | no | required | yes | yes |
| region | region | string | no | required | yes | yes |
| dpg | dpg | string | no | required | yes | yes |
| som | som | string | no | required | yes | yes |
| dealer_principal | dealer_principal | string | yes | optional | yes | yes |
| gsm | gsm | string | yes | optional | yes | yes |
| gm | gm | string | yes | optional | yes | yes |
| sm | sm | string | yes | optional | yes | yes |
| bdc_manager | bdc_manager | string | yes | optional | yes | yes |
| digital_manager | digital_manager | string | yes | optional | yes | yes |
| custom_role_1_title | custom_role_1_title | string | yes | optional | no | no |
| custom_role_1_name | custom_role_1_name | string | yes | optional | yes | yes |
| custom_role_2_title | custom_role_2_title | string | yes | optional | no | no |
| custom_role_2_name | custom_role_2_name | string | yes | optional | yes | yes |
| custom_role_3_title | custom_role_3_title | string | yes | optional | no | no |
| custom_role_3_name | custom_role_3_name | string | yes | optional | yes | yes |

## DDC Tab 2: Contact Report / Action Plan

| Field | Named range | Type | Editable | Validation | Syncs to PM | In PDF |
|---|---|---|---|---|---|---|
| current_meeting_date | current_meeting_date | date | yes | valid date | yes | yes |
| next_meeting_date | next_meeting_date | date | yes | valid date or blank | yes | yes |
| dealer_attendees | dealer_attendees | string | yes | optional | yes | yes |
| mbusa_attendees | mbusa_attendees | string | yes | optional | yes | yes |
| mystery_shop_score | mystery_shop_score | number | yes | 0-100 or blank | yes | yes |
| meeting_summary | meeting_summary | string | yes | optional | yes | yes |
| q3_action_plan_1 | q3_action_plan_1 | string | yes | optional | yes | yes |
| q3_action_plan_2 | q3_action_plan_2 | string | yes | optional | yes | yes |
| q3_action_plan_3 | q3_action_plan_3 | string | yes | optional | yes | yes |
| generated_pdf_url | generated_pdf_url | url | no | generated by script | yes | no |

## DDC Tab 3: Internal Contact Report

| Field | Named range | Type | Editable | Validation | Syncs to PM | In PDF |
|---|---|---|---|---|---|---|
| internal_notes | internal_notes | string | yes | optional | no | no |
| internal_risks | internal_risks | string | yes | optional | no | no |
| internal_followups | internal_followups | string | yes | optional | no | no |
```

- [ ] **Step 2: Add schema constants to `Config.gs`**

Write `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/Config.gs`:

```javascript
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
```

## Task 3: Manual Template Documentation

**Files:**
- Create: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/templates/ddc-workbook-template-notes.md`
- Create: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/templates/pm-dashboard-template-notes.md`
- Create: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/templates/contact-report-doc-template-notes.md`

- [ ] **Step 1: Document the DDC workbook template**

The document must specify five tabs, exact tab names, named ranges from `docs/data-schema.md`, protected ranges for dealer details, dealer selector data validation, Tab 3 colored banner, and placeholder fields for Tabs 4 and 5.

- [ ] **Step 2: Document the PM Dashboard template**

The document must specify three tabs, summary-card cells, raw table start rows, filters for region/DDC/DPG, and a `Sync Log` tab used by Apps Script.

- [ ] **Step 3: Document the Google Docs PDF template**

The document must list the supported tokens:

```text
{{dealer_name}}
{{dealer_address}}
{{region}}
{{dpg}}
{{som}}
{{current_meeting_date}}
{{next_meeting_date}}
{{dealer_attendees}}
{{mbusa_attendees}}
{{mystery_shop_score}}
{{meeting_summary}}
{{q3_action_plan_1}}
{{q3_action_plan_2}}
{{q3_action_plan_3}}
```

## Task 4: Batched Aggregator Skeleton

**Files:**
- Modify: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/Main.gs`
- Modify: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/Aggregator.gs`
- Modify: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/WorkbookRegistry.gs`
- Modify: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/Logger.gs`
- Modify: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/Triggers.gs`
- Modify: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/test/fixtures/dummy-workbook-registry.csv`

- [ ] **Step 1: Add 47 dummy workbook rows**

Write `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/test/fixtures/dummy-workbook-registry.csv`:

```csv
ddc_name,workbook_id,status
DDC 01,dummy-workbook-001,active
DDC 02,dummy-workbook-002,active
DDC 03,dummy-workbook-003,active
DDC 04,dummy-workbook-004,active
DDC 05,dummy-workbook-005,active
DDC 06,dummy-workbook-006,active
DDC 07,dummy-workbook-007,active
DDC 08,dummy-workbook-008,active
DDC 09,dummy-workbook-009,active
DDC 10,dummy-workbook-010,active
DDC 11,dummy-workbook-011,active
DDC 12,dummy-workbook-012,active
DDC 13,dummy-workbook-013,active
DDC 14,dummy-workbook-014,active
DDC 15,dummy-workbook-015,active
DDC 16,dummy-workbook-016,active
DDC 17,dummy-workbook-017,active
DDC 18,dummy-workbook-018,active
DDC 19,dummy-workbook-019,active
DDC 20,dummy-workbook-020,active
DDC 21,dummy-workbook-021,active
DDC 22,dummy-workbook-022,active
DDC 23,dummy-workbook-023,active
DDC 24,dummy-workbook-024,active
DDC 25,dummy-workbook-025,active
DDC 26,dummy-workbook-026,active
DDC 27,dummy-workbook-027,active
DDC 28,dummy-workbook-028,active
DDC 29,dummy-workbook-029,active
DDC 30,dummy-workbook-030,active
DDC 31,dummy-workbook-031,active
DDC 32,dummy-workbook-032,active
DDC 33,dummy-workbook-033,active
DDC 34,dummy-workbook-034,active
DDC 35,dummy-workbook-035,active
DDC 36,dummy-workbook-036,active
DDC 37,dummy-workbook-037,active
DDC 38,dummy-workbook-038,active
DDC 39,dummy-workbook-039,active
DDC 40,dummy-workbook-040,active
DDC 41,dummy-workbook-041,active
DDC 42,dummy-workbook-042,active
DDC 43,dummy-workbook-043,active
DDC 44,dummy-workbook-044,active
DDC 45,dummy-workbook-045,active
DDC 46,dummy-workbook-046,active
DDC 47,dummy-workbook-047,active
```

- [ ] **Step 2: Implement registry reader**

`WorkbookRegistry.gs` should expose `getActiveWorkbookRegistryRows()` returning active rows from the registry sheet with `{ ddcName, workbookId }`.

- [ ] **Step 3: Implement no-op batch loop**

`Aggregator.gs` should expose `runBatchedSync()` and process only IDs. It must:

- acquire a script lock,
- load cursor index from `PropertiesService`,
- process at most `CONFIG.BATCH_SIZE` rows,
- stop early when elapsed time exceeds `CONFIG.MAX_RUN_MS`,
- save the next cursor index,
- create a one-time resume trigger when more rows remain,
- clear the cursor on completion,
- write a sync-log row.

- [ ] **Step 4: Add public entry points**

`Main.gs` should expose:

```javascript
/**
 * Runs the daily PM Dashboard sync.
 * @return {void}
 */
function runDailySync() {
  runBatchedSync();
}

/**
 * Runs the PM Dashboard sync on demand.
 * @return {void}
 */
function syncNow() {
  runBatchedSync();
}
```

- [ ] **Step 5: Verify against 47 dummy IDs**

Run from Apps Script editor:

```javascript
syncNow();
```

Expected: multiple invocations complete, 47 dummy IDs are logged, cursor clears after final invocation, and no invocation approaches 6 minutes.

## Task 5: Pure Read Functions

**Files:**
- Modify: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/DealerProfile.gs`
- Modify: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/ContactReport.gs`
- Modify: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/Assessments.gs`
- Modify: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/Utils.gs`

- [ ] **Step 1: Implement named-range helper**

`Utils.gs` should expose `getNamedValue(spreadsheet, rangeName)` and return `''` when the named range is absent after logging the missing field.

- [ ] **Step 2: Implement dealer profile reader**

`DealerProfile.gs` should expose `readDealerProfile(workbookId)` and return one object containing all `DEALER_PROFILE_FIELDS`.

- [ ] **Step 3: Implement contact report reader**

`ContactReport.gs` should expose `readContactReport(workbookId)` and return one object containing all `CONTACT_REPORT_FIELDS`.

- [ ] **Step 4: Add assessment schema constants**

Add to `Config.gs`:

```javascript
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
```

- [ ] **Step 5: Implement assessment reader**

`Assessments.gs` should expose `readAssessments(workbookId)` and return `{ preAssessment, inStoreAssessment }` by looping over the schema arrays.

## Task 6: PM Dashboard Writes

**Files:**
- Modify: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/PMDashboard.gs`
- Modify: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/Aggregator.gs`

- [ ] **Step 1: Implement dashboard writer functions**

`PMDashboard.gs` should expose:

```javascript
/**
 * Writes consolidated profile and activity rows.
 * @param {Array<Object>} rows
 * @return {void}
 */
function writeProfileActivityRows(rows) {}

/**
 * Writes meeting schedule rows.
 * @param {Array<Object>} rows
 * @return {void}
 */
function writeMeetingScheduleRows(rows) {}

/**
 * Writes IDA assessment rows.
 * @param {Array<Object>} rows
 * @return {void}
 */
function writeIdaRows(rows) {}

/**
 * Recomputes PM Dashboard summary cells.
 * @return {void}
 */
function recomputeDashboardSummaries() {}
```

- [ ] **Step 2: Wire real read/write sync**

Update `Aggregator.gs` so each workbook is read inside a `try/catch`. Errors must be logged with workbook ID and the run must continue.

- [ ] **Step 3: Verify with 2-3 real DDC workbooks**

Run:

```javascript
syncNow();
```

Expected: PM Dashboard tabs update, Tab 3 content is absent, workbook-level failures appear in the sync log, and successful workbooks still write rows.

## Task 7: PDF Generation

**Files:**
- Modify: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/PDFGenerator.gs`
- Modify: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/Main.gs`

- [ ] **Step 1: Implement PDF token mapping**

`PDFGenerator.gs` should build token values only from Dealer Profile and Contact Report data.

- [ ] **Step 2: Implement Docs copy and export**

`PDFGenerator.gs` should copy `CONFIG.CONTACT_REPORT_DOC_TEMPLATE_ID`, replace tokens, export a PDF to `CONFIG.PDF_OUTPUT_FOLDER_ID`, and return the PDF URL.

- [ ] **Step 3: Add DDC workbook custom menu**

`Main.gs` should expose `onOpen()` with a custom menu item named `Generate Contact Report PDF`.

- [ ] **Step 4: Verify PDF exclusions**

Generate a PDF from one workbook.

Expected: PDF contains Dealer Profile and Contact Report data, and contains no Internal Contact Report fields.

## Task 8: Triggers And Provisioning

**Files:**
- Modify: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/Triggers.gs`
- Modify: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/src/Provisioning.gs`
- Modify: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/docs/deployment.md`

- [ ] **Step 1: Implement trigger install/remove**

`Triggers.gs` should expose `installDailySyncTrigger()` and `removeDailySyncTriggers()`.

- [ ] **Step 2: Implement provisioning**

`Provisioning.gs` should copy the DDC template per DDC, share edit access with that DDC, share view access with PM, and write the workbook ID to the registry.

- [ ] **Step 3: Write deployment runbook**

`docs/deployment.md` should include:

```markdown
# Deployment Runbook

1. Confirm Google templates exist.
2. Add template IDs to `CONFIG`.
3. Push Apps Script with `npx clasp push`.
4. Run `installDailySyncTrigger`.
5. Provision 2-3 pilot DDC workbooks.
6. Run `syncNow`.
7. Review PM Dashboard and sync log.
8. Provision remaining DDC workbooks.
9. Run `syncNow` again.
10. Confirm all 47 dealerships appear in PM Dashboard.
```

## Task 9: Manual Test Plan And Pilot

**Files:**
- Modify: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/test/manual-test-plan.md`
- Modify: `/Users/mac-mini/Mercedes-Codex/ddtc-dashboard/docs/open-questions.md`

- [ ] **Step 1: Write manual test plan**

Include checks for:

- DDC workbook tab setup and protected ranges.
- Dealer selector auto-population.
- PM dashboard sync across 47 dummy IDs.
- PM dashboard sync across 2-3 real workbooks.
- One bad workbook ID does not stop the sync.
- Internal Contact Report is absent from PM Dashboard and PDF.
- PDF generation creates a Drive file and returns a URL.
- Daily trigger exists and calls `runDailySync`.

- [ ] **Step 2: Track open questions**

`docs/open-questions.md` should contain:

```markdown
# Open Questions

| Question | Owner | Needed by | Current plan |
|---|---|---|---|
| Final Pre-Assessment field list | Shirl | Before full rollout | Use schema-driven placeholder fields until delivered |
| Final In-Store Assessment field list | Pamelina | Before full rollout | Use schema-driven placeholder fields until delivered |
| Final PM recipient list for dashboard access | Program Manager | Before pilot | Provisioning supports one or more PM viewer emails |
| Final PDF branding assets | Program Manager | Before PDF pilot | Use Docs template so branding changes do not require code changes |
```

- [ ] **Step 3: Pilot signoff**

Pilot with 2-3 DDCs before provisioning all workbooks.

Expected: no blocking sync errors, PDFs are accepted by PM, and any template changes are documented before full rollout.

## Review Checklist

- The 6-minute Apps Script limit is addressed before real sync logic.
- Every module has one clear responsibility.
- Internal notes are excluded from every aggregation and PDF path.
- Assessment uncertainty is isolated to schema constants.
- The PM Dashboard is the only write target for aggregation.
- Manual Google UI work is documented instead of hidden in memory.
- The system has one daily trigger and one on-demand sync path.
- Pilot happens before full 47-dealer rollout.

