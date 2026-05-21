# Mercedes DDTC Dashboard

This workspace contains the build brief, implementation plan, and clasp-managed Apps Script project for the Mercedes-Benz USA DDTC dashboard.

## Contents

- `mercedes-brief.md`: original build brief.
- `docs/superpowers/plans/2026-05-20-ddtc-dashboard.md`: implementation plan.
- `ddtc-dashboard/`: Google Apps Script project managed with clasp.

## Local Setup

```bash
cd ddtc-dashboard
npm install
npm test
```

## Apps Script

The clasp project is linked in `ddtc-dashboard/.clasp.json`.

```bash
cd ddtc-dashboard
npx clasp push --force
```

Open the Apps Script project:

```bash
cd ddtc-dashboard
npx clasp open
```

## Publishing To GitHub

Create an empty GitHub repository, then connect and push:

```bash
git remote add origin git@github.com:OWNER/REPO.git
git push -u origin main
```

If using an HTTPS remote:

```bash
git remote add origin https://github.com/OWNER/REPO.git
git push -u origin main
```

