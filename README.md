# Silvermont: Fragments v0.11.0

Text-based HTML otome/life-sim vertical slice.

## v0.11.0

- Week 1 runs exact-date events only; random major/minor events resume from Week 2.
- Added visible story section cards:
  - `PROLOGUE — Arrival in Silvermont`
  - `END OF PROLOGUE — A New Week Begins`
  - `CHAPTER 1 — First Days`
- Expanded the prologue to 40 scenes using established Silvermont canon: Agnes, Dorian, Whitmore Estates, Mother's Necklace, the new home, and an early accident-memory fragment.
- Added 3 manual save slots plus 1 autosave slot.
- Save opens slot selection; Continue opens load-slot selection.
- Slot metadata shows week, date, age, and save timestamp.
- Autosaves when a planned week opens and after weekly summary progression.
- Added Event Journal sections for completed events, clues, important people, unresolved mysteries, and remembered choices.
- Added Relationship Moments: hidden relationship changes surface as qualitative messages without exposing numeric values.
- Added Choice Memory stored in game state and save slots. Recent choices appear in the Journal.
- Added `window.SilvermontChoiceMemory` helper for future dialogue references.
- Added gated Debug tools. The button appears only when `window.SILVERMONT_DEBUG_MODE` is true.
- Debug tools include event trigger, date/week editing, stat editing, flag toggles, event history, read-history reset, and save-slot reset.
- Added `window.SilvermontDebug.registerTool(label, action)` for future debug features.

## Debug mode

The current development build defaults Debug mode to on when no explicit value is supplied.

To disable it before `v011_features.js` loads:

```js
window.SILVERMONT_DEBUG_MODE = false;
```

## v0.10.0 retained

- Exact-date scheduling with `triggerDate: { month, day }` and earliest-eligible fallback.
- Ethan protected for September 1; Fern protected for September 2.
- Narrator label removed.
- Persistent `Skip Read` for completed content.
- Detailed 64×64 canvas pixel portraits.
- Play Online menu item removed.

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

Open `tests.html` for the existing automated suite. v0.11 also passed JavaScript syntax validation and a module-initialization smoke test.
