# Silvermont: Fragments v0.10.0

Text-based HTML otome/life-sim vertical slice.

## v0.10.0

- Exact-date scheduling supported with `triggerDate: { month, day }`.
- Date-locked events never trigger early; if other requirements are not met, they fall forward to the earliest later eligible day.
- Ethan introduction is protected for September 1, arrival day.
- Fern introduction is protected for September 2, first school day.
- Major events may also use `triggerDate`; existing prerequisite checks still apply.
- Narrator label removed from dialogue and narration entries in History.
- Added persistent `Skip Read` across New Game for fully read events and prologue content.
- Existing event history from loaded saves is imported into the persistent read list when possible.
- Portraits now render as detailed 64×64 pixel-art canvases instead of thousands of DOM cells.
- Removed Play Online from the game menu because GitHub Pages already hosts the game.
- v0.9 calendar planner, per-day activities, activity tags, weekend ×2, and weekly event caps remain.

## Exact-date event example

```js
mystery_event: {
  id: "mystery_event",
  type: "major",
  triggerDate: { month: 9, day: 12 },
  requirements: { flagsAll: ["prior_clue_found"] },
  activityTags: ["any"],
  scenes: []
}
```

If `prior_clue_found` is false on September 12, the event waits and triggers on the earliest later eligible day after the flag becomes true.

## Tests

Open `tests.html` for the existing automated suite.
