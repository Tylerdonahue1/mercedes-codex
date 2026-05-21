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

## Asset Naming

Codex-generated assets should use the prefix `DDTC Dashboard - Codex`.

- Apps Script project: `DDTC Dashboard - Codex`
- DDC workbook copies: `DDTC Dashboard - Codex - DDC Workbook - <DDC Name>`
- Contact Report PDFs: `DDTC Dashboard - Codex - <Dealer Name> Contact Report <Date>`
