# MBUSA DDTC Dashboard — Build Brief

You are building a production Google Sheets + Apps Script system for Mercedes-Benz USA. Field consultants (DDCs) use individual workbooks to manage dealership relationships and visits. A Program Manager dashboard aggregates everything for network-wide oversight.

**Target go-live:** June 2026. **Network size:** ~47 dealerships, ~5–10 DDCs.

---

## What you're building

Two connected components in Google Workspace:

### 1. DDC Individual Workbook (one per consultant)

Google Sheet with 5 tabs:

- **Tab 1 — Dealer Profile.** Pre-loaded dealer details (name, address, region, DPG, SOM) in protected ranges. Editable management-team block (Dealer Principal, GSM, GM, SM, BDC Manager, Digital Manager + 3 custom roles). Dealer selector dropdown to switch the active dealer within the workbook.
- **Tab 2 — Contact Report / Action Plan.** Client-facing. Fields: current meeting date, next meeting date, dealer attendees, MBUSA attendees, monthly Mystery Shop score (numeric), meeting summary, Q3 action plan (1–3 bullets). Dealer details auto-populate from Tab 1. **Custom menu button generates a branded PDF** via a Google Docs template.
- **Tab 3 — Internal Contact Report.** Internal-only notes. Visually distinct (colored banner). **Must never appear in PDFs or in the PM Dashboard.**
- **Tab 4 — Pre-Assessment.** Structured form. Exact fields TBD (owner: Shirl). Build the framework with placeholder fields; design so fields can be added without rewriting the sync.
- **Tab 5 — In-Store Assessment.** Structured form. Exact fields TBD (owner: Pamelina). Same placeholder approach as Tab 4.

### 2. Program Manager Dashboard (one master sheet)

Google Sheet with 3 tabs, populated by a scheduled Apps Script that reads all DDC workbooks:

- **Tab 1 — Consolidated Dealer Profiles & Activity.** Master table of every dealer with key metrics and engagement status. Summary cards (total dealers, active DDCs, total meetings, average scores). Filters: region, DDC, DPG.
- **Tab 2 — Meeting Schedule Overview.** This week / completed / upcoming / overdue stats. Chronological tables with "days until" countdown. Optional .ics export.
- **Tab 3 — IDA (In-Dealership Assessment) Data.** Consolidated Pre + In-Store assessment data per dealer. Completion-status table. Network-wide training-needs rollup.

---

## Critical architecture decisions (already made — don't relitigate)

| Decision | Choice | Why |
|---|---|---|
| Workbook structure | One workbook per DDC, multiple dealers per workbook | Matches how DDCs work; fewer files to provision |
| Sync method | **Apps Script aggregation, NOT IMPORTRANGE** | IMPORTRANGE is too fragile at 47 sources — silent breakage on tab rename, unpredictable refresh, no transforms, cell-limit pressure |
| Sync cadence | Daily time-driven trigger + on-demand "Sync Now" button | Real-time per-edit sync is brittle and noisy |
| PDF generation | Google Docs template populated by Apps Script, exported to PDF | Best brand fidelity, native to Workspace, no third-party dependency |
| Internal notes (Tab 3) | Stays in DDC workbook, never aggregated | Requirement: internal-only |
| Permissions | DDC = edit own workbook; PM = view all DDC workbooks + edit PM Dashboard | Per Requirements doc |

---

## The single biggest technical risk

**Apps Script has a 6-minute execution limit per invocation.** Iterating ~47 workbooks in one run will time out. You must batch with continuation tokens:

1. On each invocation, process a chunk of workbooks (e.g., 10).
2. Store progress in `PropertiesService` (last-processed workbook ID + timestamp).
3. If `Date.now() - startTime > 4.5 minutes`, save progress and exit.
4. Set up a self-rescheduling trigger that resumes where the previous run stopped.
5. On completion, recompute summary stats and write a sync-log entry.

Build this batching first, before adding sync logic. Get a no-op batch loop running end-to-end across 47 dummy workbook IDs before writing any real read/write code. **This is where this kind of project usually fails.**

---

## Repository structure

Build this as a `clasp`-managed Apps Script project (lets you develop locally and push to Google):

```
ddtc-dashboard/
├── README.md
├── .clasp.json                    # clasp config (script ID, root dir)
├── .claspignore
├── appsscript.json                # Apps Script manifest (timezone, scopes)
├── src/
│   ├── Config.gs                  # Constants: PM dashboard ID, sync settings, dealer registry sheet ID
│   ├── Main.gs                    # Entry points: onOpen menus, runDailySync, syncNow
│   ├── Aggregator.gs              # Core batched sync engine with continuation tokens
│   ├── WorkbookRegistry.gs        # Read/manage list of DDC workbook IDs
│   ├── DealerProfile.gs           # Read Tab 1 from a DDC workbook
│   ├── ContactReport.gs           # Read Tab 2 (meetings, scores)
│   ├── Assessments.gs             # Read Tabs 4 + 5 (Pre + In-Store)
│   ├── PMDashboard.gs             # Write to PM Dashboard tabs + compute summaries
│   ├── PDFGenerator.gs            # Populate Docs template, export PDF
│   ├── Provisioning.gs            # One-time: copy template per DDC, set permissions, pre-load dealers
│   ├── Triggers.gs                # Install/remove time-based + onEdit triggers
│   ├── Logger.gs                  # Sync log writer, error reporter
│   └── Utils.gs                   # Date math, named-range helpers, validation
├── templates/
│   ├── ddc-workbook-template-notes.md   # Manual setup steps (tab structure, named ranges, protected ranges, data validation)
│   ├── pm-dashboard-template-notes.md   # Manual setup steps for PM Dashboard
│   └── contact-report-doc-template-notes.md  # Google Docs PDF template structure with placeholder tokens like {{dealer_name}}
├── docs/
│   ├── architecture.md
│   ├── deployment.md              # Provisioning runbook
│   ├── data-schema.md             # Field-by-field schema for all 5 DDC tabs and all 3 PM tabs
│   └── open-questions.md          # Tracks blockers (assessment specs from Shirl/Pamelina)
└── test/
    ├── fixtures/                  # Sample DDC workbook IDs for integration testing
    └── manual-test-plan.md
```

---

## Build order (do these in sequence)

### Phase 0 — Local setup (start here)
1. `npm install -g @google/clasp`
2. `clasp login`
3. Create a standalone Apps Script project: `clasp create --type standalone --title "DDTC Dashboard"`
4. Initialize the repo structure above. All `.gs` files are empty stubs with a comment header describing their purpose.
5. First commit: scaffold only, no logic.

### Phase 1 — Templates (manual, in Google UI, documented in markdown)
1. Build the DDC workbook template by hand in Google Sheets: 5 tabs, headers, data validation, protected ranges, named ranges, conditional formatting. Document every step in `templates/ddc-workbook-template-notes.md`.
2. Build the PM Dashboard template by hand: 3 tabs, summary card cells, filter views. Document in `templates/pm-dashboard-template-notes.md`.
3. Build the Google Docs Contact Report template by hand with `{{token}}` placeholders. Document in `templates/contact-report-doc-template-notes.md`.
4. Put their file IDs into `Config.gs`.

### Phase 2 — Batched aggregator skeleton
1. Build `WorkbookRegistry.gs` — reads a config sheet listing DDC workbook IDs.
2. Build `Aggregator.gs` with continuation-token batching. **No real reads/writes yet** — just iterate IDs, log "would process X", save progress to `PropertiesService`, resume correctly across invocations.
3. Verify with 47 dummy IDs that it completes across multiple invocations without timing out.

### Phase 3 — Real sync
1. Implement `DealerProfile.gs`, `ContactReport.gs`, `Assessments.gs` as pure read functions: given a workbook ID, return structured JS objects. No side effects.
2. Implement `PMDashboard.gs` write functions: given arrays of objects, write rows to each PM Dashboard tab.
3. Wire them into the aggregator. Test against 2–3 real DDC workbooks.

### Phase 4 — PDF generation
1. `PDFGenerator.gs`: open the Docs template, copy it, replace `{{tokens}}` from Tab 2 data, export PDF to a Drive folder, return the share URL.
2. Add `onOpen` menu in DDC workbook: "Generate Contact Report PDF".

### Phase 5 — Triggers + provisioning
1. Install daily time-driven trigger for `runDailySync`.
2. Build `Provisioning.gs` to copy the template per DDC, set sharing permissions, pre-load dealer rows.

### Phase 6 — Pilot + deploy
1. Pilot with 2–3 DDCs. Fix issues.
2. Roll out to all DDCs. Pre-load all 47 dealerships.

---

## Data schema (start here — fill in as you build)

Create `docs/data-schema.md` and define every field with: name, source tab, type, validation, whether it syncs to PM, whether it appears in the PDF. This document is the contract between the DDC workbook and the PM Dashboard. **Get this right before writing sync code.**

Example row:

```
field: dealer_name
source: DDC Tab 1, named range "dealer_name"
type: string, read-only (protected)
syncs_to_pm: yes (Tab 1, column A)
in_pdf: yes (header)
```

---

## What's blocking and out of scope

**Blocked, not in scope until delivered:**
- Pre-Assessment field list (owner: Shirl)
- In-Store Assessment field list (owner: Pamelina)

Build Tabs 4 and 5 with a placeholder schema (~10 generic fields each: dropdowns + numeric). Design `Assessments.gs` so adding/removing fields requires only updating a schema constant, not changing logic.

**Out of scope unless explicitly requested later:**
- Real-time per-edit sync
- Email notifications
- Calendar (.ics) export — design for it, don't build it
- Mobile apps
- Anything that touches financial or PII data beyond what's already in the dealer profile

---

## Style and quality bar

- Apps Script is JavaScript — use modern syntax (`const`, `let`, arrow functions, destructuring, template literals).
- Every public function gets a JSDoc block with `@param` and `@return`.
- No logic in `Main.gs` beyond dispatch — put real work in the named-domain `.gs` files.
- All hardcoded IDs and magic numbers go in `Config.gs`.
- Every write to the PM Dashboard goes through `PMDashboard.gs` — no other file writes to it.
- Every batch run writes a row to a sync log (timestamp, workbooks processed, errors, duration).
- Errors in one workbook must not abort the whole run — catch, log, continue.
- Use `LockService` around the aggregator so two concurrent invocations can't corrupt state.

---

## First task

Set up the repo, get `clasp` connected to a fresh Apps Script project, and create the scaffold of empty files described above. Then write `docs/data-schema.md` for Tabs 1, 2, and 3 (the ones with known fields). Do not start writing Apps Script logic until the schema doc is reviewed.

Stop and ask before:
- Adding any third-party library or service.
- Changing any of the architecture decisions in the table above.
- Building anything in the "out of scope" list.
- Deviating from the build order.

When in doubt, ask. The Requirements document and Technical Implementation Guide are the source of truth — the HTML prototype in the original handoff is reference only and does not match the 5-tab spec.
