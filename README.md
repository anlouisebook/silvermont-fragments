# Silvermont: Fragments v0.7.0

Text-based HTML otome/life-sim vertical slice.

## Run locally

Open `index.html` in a browser. For local development, open the folder in VS Code and use Live Server.

## Browser/mobile deployment

A GitHub Pages workflow is included at `.github/workflows/deploy-pages.yml`.

See `DEPLOY_GITHUB_PAGES.md`. After deployment, put the published URL in `js/config.js`; the main-menu **Play Online** button will become active and redirect to that hosted version.

## v0.7.0 changes

- Added event day tagging: `weekday`, `weekend`, or `both`.
- School-context events are blocked on weekends.
- Weekly event caps are maximums only:
  - 0–1 major event.
  - 0–2 minor events.
- Balanced activity outcomes:
  - 15% Great success.
  - 65% Success.
  - 20% Failure.
- Trait/emotional-state roll shifts are capped at ±10 percentage points.
- Failure deducts at most 1 point from the affected stat.
- Stats never fall below 0.
- Weekend ×2 applies only to positive gains, never failure penalties.
- Daily pixel result screen now waits for click/tap before continuing.
- `Skip` still fast-resolves days and still pauses for scheduled story events.
- Week 2+ planners copy the previous week's three focuses automatically; the player can edit before starting.
- Added configurable `Play Online` main-menu option.
- Added GitHub Pages deployment files.
- Save key/version updated to v0.7.0.

## Event data

```js
pop_quiz: {
  id: "pop_quiz",
  type: "minor",
  dayType: "weekday",
  minDay: 1,
  maxDay: 27,
  chance: 0.17,
  effects: { stats: { Intelligence: 1 } },
  scenes: []
}
```

Use `dayType: "weekend"` for weekend-only events or `dayType: "both"` for either.

## Tests

Open `tests.html`.

Current suite: **42 tests** covering versioning, event dictionaries, day tags, school/weekend blocking, plot prerequisites, randomized triggers, weekly event caps with zero-event weeks allowed, birthday dates, calendar progression, planner copy-forward, 15/65/20 outcome balance, failure penalties, weekend gains, ±10 modifier caps, traits, relationships/skills, canon characters, mystery beats, history, and stat coverage.
