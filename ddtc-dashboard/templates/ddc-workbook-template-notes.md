# DDC Workbook Template Notes

Create one Google Sheets workbook template with these tabs:

1. `Dealer Profile`
2. `Contact Report / Action Plan`
3. `Internal Contact Report`
4. `Pre-Assessment`
5. `In-Store Assessment`

## Dealer Profile

- Add protected dealer detail fields for dealer ID, dealer name, dealer address, region, DPG, and SOM.
- Add editable management-team fields for Dealer Principal, GSM, GM, SM, BDC Manager, Digital Manager, and three custom roles.
- Create named ranges matching `docs/data-schema.md`.
- Add a dealer selector dropdown for switching active dealer context.
- Protect the dealer detail ranges from DDC edits.

## Contact Report / Action Plan

- Add fields for current meeting date, next meeting date, dealer attendees, MBUSA attendees, Mystery Shop score, meeting summary, and three Q3 action plan bullets.
- Create named ranges matching `docs/data-schema.md`.
- Reserve a read-only cell for `generated_pdf_url`.

## Internal Contact Report

- Add a visually distinct internal-only banner.
- Use named ranges for internal notes, risks, and followups.
- Do not reference this tab from dashboard sync or PDF generation.

## Pre-Assessment

- Add placeholder fields from `PRE_ASSESSMENT_FIELDS` in `Config.gs`.
- Use one named range per field key.

## In-Store Assessment

- Add placeholder fields from `IN_STORE_ASSESSMENT_FIELDS` in `Config.gs`.
- Use one named range per field key.

