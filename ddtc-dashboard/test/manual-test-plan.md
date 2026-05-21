# Manual Test Plan

## Scaffold

- Confirm `npx clasp push` uploads the manifest and Apps Script stubs.

## Templates

- Confirm DDC workbook has five required tabs.
- Confirm Dealer Profile protected ranges cannot be edited by DDC users.
- Confirm named ranges match `docs/data-schema.md`.
- Confirm Internal Contact Report has a visible internal-only banner.
- Confirm PM Dashboard has required tabs and a `Sync Log` tab.

## Sync

- Open the Apps Script project and run `syncNow` from the editor for runtime verification.
- Note: `npx clasp run syncNow` requires an Apps Script API executable deployment mode and may report that the function is unavailable even when source push succeeded.
- Confirm no-op sync processes 47 dummy workbook IDs across continuation invocations.
- Confirm sync cursor clears after completion.
- Confirm one invalid workbook ID does not stop the whole run.
- Confirm Program Manager Dashboard excludes Internal Contact Report fields.

## PDF

- Confirm PDF generation creates a Drive file.
- Confirm PDF URL is written back to the workbook.
- Confirm PDF contains Contact Report fields.
- Confirm PDF excludes Internal Contact Report fields.
