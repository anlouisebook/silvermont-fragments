# Silvermont: Fragments v0.12.0

Text-based HTML otome/life-sim vertical slice.

## v0.12.0

- Fixed Continue/load-slot modal stacking: the main menu hides while Load Game is open and the slot panel is placed above menu overlays.
- Added event-chain state and ordering for:
  - Ethan intro → second meeting → shared swing
  - Fern intro → shared notes → library promise
  - Home guardian scenes
  - Accident fragments
  - Club fair → selected club first meeting
- Ported the missing Ethan and Fern follow-up scenes from the uploaded Life v63 Ren'Py project.
- Added actual stat-gain modifiers in addition to existing outcome-probability modifiers:
  - matching positive trait `+1`
  - matching negative trait `-1`
  - Calm: `+1 Help at Home`
  - Anxious: `+1 Study`, `-1 Socialize`
  - Guarded: `+1 Study`, `-1 Socialize`
  - Curious: `+1 Study`, `+1 Draw & Create`
  - weekend ×2 applies after these modifiers
  - failure remains exactly `-1`
- Added Life-based clubs with one-club-only membership and an option to join none:
  - Scholars Society — Wednesday — Intelligence +2 — Fern is a member
  - Creative Arts Club — Thursday — Creativity +2
  - Athletics Club — Friday — Fitness +2
- Club Fair becomes available after Fern's introduction.
- Attending a club meeting replaces that day's normal planner activity and disables activity selection for that day.
- The player may skip a club meeting and choose a normal activity instead.
- Skipping can permanently miss tagged club events; first-meeting events are currently missable.
- Club events use `clubTags`; first-meeting events trigger only for the joined club while attending.
- Added debug helpers for chain-state inspection and clearing club membership.

## v0.11.0 retained

- Week 1 exact-date events only.
- Prologue/End of Prologue/Chapter 1 section cards.
- Expanded 40-scene prologue.
- 3 manual save slots + autosave.
- Event Journal, Relationship Moments, and Choice Memory.
- Gated extensible Debug tools.

## Debug mode

The development build defaults Debug mode to on when no explicit value is supplied.

```js
window.SILVERMONT_DEBUG_MODE = false;
```

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

If requirements are false on the target date, the event waits for the earliest later eligible day.

## Validation

- `v012_life_events.js` syntax: pass
- `v012_features.js` syntax: pass
- v0.12 smoke test: pass for Life follow-ups, trait/personality gain modifiers, weekend ordering, failure `-1`, Club Fair chain, club join state, and Continue panel stacking
- Existing `tests.html` remains available for the older automated suite
