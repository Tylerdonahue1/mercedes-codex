# DDTC Dashboard

Google Sheets and Apps Script system for Mercedes-Benz USA DDTC field operations.

## What This Builds

- DDC individual workbooks for dealer profile, contact reports, internal notes, and assessments.
- A Program Manager dashboard that aggregates DDC workbook data.
- Batched Apps Script sync with continuation state for Apps Script runtime limits.
- Google Docs based PDF generation for client-facing contact reports.

## Local Setup

```bash
npm install
npx clasp login
npx clasp create --type standalone --title "DDTC Dashboard"
npx clasp push
```

## Project Layout

- `src/`: Apps Script source files.
- `templates/`: manual setup notes for Google Sheets and Docs templates.
- `docs/`: architecture, deployment, schema, and open questions.
- `test/`: manual test plans and fixtures.

## Implementation Order

1. Scaffold local clasp project.
2. Document schema and templates.
3. Build batched no-op aggregator.
4. Add real workbook reads and dashboard writes.
5. Add PDF generation.
6. Add triggers and provisioning.
7. Pilot with 2-3 DDCs before rollout.

