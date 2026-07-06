# Silvermont: Fragments v0.8.0

Text-based HTML otome/life-sim vertical slice.

## Run locally

Open `index.html` in a browser. For local development, open the folder in VS Code and use Live Server.

## Browser/mobile deployment

GitHub Pages workflow: `.github/workflows/deploy-pages.yml`.

## v0.8.0 changes

- Disabled text selection across gameplay UI while preserving text entry in form fields.
- Added daily result icons:
  - `⭐` Great success
  - `👍` Success
  - `👎` Failure
- Replaced custom HTML story content with dialogue/events ported from the uploaded `Life_refactored_v63` Ren'Py project.
- Ported actual v63 event dialogue for:
  - Ethan Blackwell childhood introduction
  - Fern Holloway school introduction
  - Dorian Evans / Agnes Cole home scenes
  - accident-memory mystery fragments
  - club introductions
  - birthday morning
  - first Shopping District visit
- Added branch-scene support so Ren'Py menu choices can preserve their original follow-up dialogue.
- Event scheduling remains randomized with weekday/weekend/both tags and weekly caps.
- Major mystery events preserve prerequisite order with fallback progression.
- Save key/version updated to v0.8.0.

## Event model

- Major: plot-critical mystery events.
- Minor: relationship or skill events.
- Weekly maximums remain:
  - 0–1 major
  - 0–2 minor

## Tests

Open `tests.html`.

The suite covers versioning, event dictionaries, day tags, weekly caps, randomized progression, planner copy-forward, outcome balance, failure penalties, result icons, Life source labels, branch scenes, dialogue samples, identity, calendar, history, and stats.
