"use strict";

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assert(condition, message = "Assertion failed") { if (!condition) throw new Error(message); }
function randomSequence(values) { let index = 0; return () => values[Math.min(index++, values.length - 1)]; }
function flattenScenes(scenes = []) {
  return scenes.flatMap((scene) => [scene, ...(scene.choices || []).flatMap((choice) => flattenScenes(choice.scenes || []))]);
}
function allStoryText() {
  const events = [...Object.values(STORY.events.major), ...Object.values(STORY.events.minor)];
  return flattenScenes([...STORY.prologue, ...events.flatMap((event) => event.scenes || [])])
    .map((scene) => `${scene.speaker || ""} ${scene.text || ""}`).join(" ");
}
const core = window.GameCore;

test("TC-V080-001 Version is 0.8.0", () => assert(core.VERSION === "0.8.0"));
test("TC-V080-002 Initial state opens at main menu", () => assert(core.initialState().currentMode === "menu"));
test("TC-V080-003 Vertical slice starts September 1", () => { assert(core.START_DATE.month === 9 && core.START_DATE.day === 1); assert(core.dateLabel(core.START_DATE) === "September 1"); });
test("TC-V080-004 Blank first name falls back to Lilianna", () => { assert(core.normalizeFirstName("") === "Lilianna"); assert(core.normalizeFirstName(" Mara ") === "Mara"); });
test("TC-V080-005 Female canon and hidden scar persist", () => { const state = core.initialState(); assert(state.canonGender === "female"); assert(state.hiddenBackScar === true); assert(!Object.prototype.hasOwnProperty.call(state.appearance, "scar")); });
test("TC-V080-006 Pronoun sets remain supported", () => { assert(core.pronounSet("she").subject === "she"); assert(core.pronounSet("he").object === "him"); assert(core.pronounSet("they").possessiveDeterminer === "their"); });

test("TC-V080-007 Event dictionaries contain major and minor events", () => { assert(Object.keys(STORY.events.major).length >= 3); assert(Object.keys(STORY.events.minor).length >= 6); });
test("TC-V080-008 Fixed weekEvents dictionary remains removed", () => assert(!Object.prototype.hasOwnProperty.call(STORY, "weekEvents")));
test("TC-V080-009 Every event has weekday/weekend/both tagging", () => { [...Object.values(STORY.events.major), ...Object.values(STORY.events.minor)].forEach((event) => assert(["weekday", "weekend", "both"].includes(event.dayType), `${event.id} missing valid dayType`)); });
test("TC-V080-010 School events are weekday-only and a weekend-only event exists", () => {
  ["mystery_hospital_record_gap"].forEach((id) => assert(STORY.events.major[id].dayType === "weekday"));
  ["fern_school_intro", "scholars_first_meeting", "creatives_first_meeting", "athletics_first_meeting"].forEach((id) => assert(STORY.events.minor[id].dayType === "weekday"));
  assert(STORY.events.minor.shopping_district_first_visit.dayType === "weekend");
});
test("TC-V080-011 Weekday event is blocked on weekend", () => { const state = core.initialState(); assert(core.dayNameForOffset(0) === "Sunday"); assert(!core.eventEligible(STORY.events.minor.fern_school_intro, state, 0, core.START_DATE)); assert(core.eventEligible(STORY.events.minor.fern_school_intro, state, 1, core.addDays(core.START_DATE, 1))); });
test("TC-V080-012 Weekend-only event is blocked on weekday and allowed on weekend", () => { const state = core.initialState(); assert(!core.eventEligible(STORY.events.minor.shopping_district_first_visit, state, 5, core.addDays(core.START_DATE, 5))); assert(core.dayNameForOffset(5) === "Friday"); assert(core.eventEligible(STORY.events.minor.shopping_district_first_visit, state, 6, core.addDays(core.START_DATE, 6))); assert(core.dayNameForOffset(6) === "Saturday"); });
test("TC-V080-013 Both-tag event is eligible on weekend when other requirements pass", () => { const state = core.initialState(); state.flags.mystery_started = true; assert(core.eventEligible(STORY.events.major.mystery_broken_glass_flash, state, 14, core.addDays(core.START_DATE, 14))); assert(core.dayNameForOffset(14) === "Sunday"); });
test("TC-V080-014 Major events preserve Life mystery prerequisite order", () => { const major = STORY.events.major; assert(major.mystery_necklace_echo.order === 1); assert(major.mystery_broken_glass_flash.requirements.flagsAll.includes("mystery_started")); assert(major.mystery_hospital_record_gap.requirements.flagsAll.includes("remembered_second_headlights")); });
test("TC-V080-015 Major event is blocked before prerequisite", () => { const state = core.initialState(); assert(!core.eventEligible(STORY.events.major.mystery_broken_glass_flash, state, 8, core.addDays(core.START_DATE, 8))); state.flags.mystery_started = true; assert(core.eventEligible(STORY.events.major.mystery_broken_glass_flash, state, 8, core.addDays(core.START_DATE, 8))); });
test("TC-V080-016 Guaranteed major fallback still works within cap", () => { const state = core.initialState(); const day = STORY.events.major.mystery_necklace_echo.guaranteedBy; const choice = core.chooseDailyStoryEvent(STORY.events.major, {}, state, day, core.addDays(core.START_DATE, day), () => 0.99, { major: 0, minor: 0 }); assert(choice?.type === "major" && choice.id === "mystery_necklace_echo"); });

test("TC-V080-017 Weekly limits are max 1 major and 2 minor", () => { assert(core.WEEKLY_EVENT_LIMITS.major === 1); assert(core.WEEKLY_EVENT_LIMITS.minor === 2); });
test("TC-V080-018 Major cap blocks additional major events", () => { const state = core.initialState(); const day = STORY.events.major.mystery_necklace_echo.guaranteedBy; const choice = core.chooseDailyStoryEvent(STORY.events.major, {}, state, day, core.addDays(core.START_DATE, day), () => 0, { major: 1, minor: 0 }); assert(choice === null); });
test("TC-V080-019 Minor cap blocks additional minor events", () => { const state = core.initialState(); const choice = core.chooseDailyStoryEvent({}, STORY.events.minor, state, 2, core.addDays(core.START_DATE, 2), () => 0, { major: 0, minor: 2 }); assert(choice === null); });
test("TC-V080-020 A week may have zero events", () => { const state = core.initialState(); const choice = core.chooseDailyStoryEvent(STORY.events.major, {}, state, 1, core.addDays(core.START_DATE, 1), () => 0.99, { major: 0, minor: 0 }); assert(choice === null); });
test("TC-V080-021 Minor events can trigger on ordinary weekdays", () => { const state = core.initialState(); state.eventHistory = Object.keys(STORY.events.minor).filter((id) => id !== "fern_school_intro"); const choice = core.chooseDailyStoryEvent({}, STORY.events.minor, state, 2, core.addDays(core.START_DATE, 2), randomSequence([0.1, 0]), { major: 0, minor: 0 }); assert(choice?.type === "minor" && choice.id === "fern_school_intro"); assert(core.dayNameForOffset(2) === "Tuesday"); });
test("TC-V080-022 Seen events do not repeat", () => { const state = core.initialState(); state.eventHistory.push("mystery_necklace_echo"); assert(!core.eventEligible(STORY.events.major.mystery_necklace_echo, state, 2, core.addDays(core.START_DATE, 2))); });
test("TC-V080-023 Birthday event is date-driven", () => { const state = core.initialState(); state.birthday = { month: 9, day: 3 }; assert(core.eventEligible(STORY.events.minor.birthday, state, 2, { month: 9, day: 3 })); assert(!core.eventEligible(STORY.events.minor.birthday, state, 1, { month: 9, day: 2 })); });

test("TC-V080-024 Calendar day names advance daily", () => { assert(core.dayNameForOffset(0) === "Sunday"); assert(core.dayNameForOffset(1) === "Monday"); assert(core.dayNameForOffset(6) === "Saturday"); assert(core.dayNameForOffset(7) === "Sunday"); });
test("TC-V080-025 Planner slot is selected by actual day", () => { assert(core.activitySlotForDay("Monday") === "weekday"); assert(core.activitySlotForDay("Saturday") === "saturday"); assert(core.activitySlotForDay("Sunday") === "sunday"); });
test("TC-V080-026 Week resolution creates seven dated days", () => { const planner = { weekday: "study", saturday: "exercise", sunday: "help" }; const days = core.createWeekResolution(1, planner, ACTIVITIES, () => 0.5); assert(days.length === 7); assert(core.dateLabel(days[0].date) === "September 1"); assert(core.dateLabel(days[6].date) === "September 7"); });
test("TC-V080-027 Daily resolution uses separate activity focus by day", () => { const planner = { weekday: "study", saturday: "exercise", sunday: "help" }; const days = core.createWeekResolution(1, planner, ACTIVITIES, () => 0.5); assert(days[0].activityId === "help"); assert(days[1].activityId === "study"); assert(days[6].activityId === "exercise"); });
test("TC-V080-028 Previous planner copies forward without shared mutation", () => { const previous = { weekday: "study", saturday: "exercise", sunday: "help" }; const history = { 1: previous }; const copied = core.copyPlannerFromPreviousWeek(2, history, null); assert(copied.weekday === "study" && copied.saturday === "exercise" && copied.sunday === "help"); copied.weekday = "create"; assert(history[1].weekday === "study"); });
test("TC-V080-029 First week planner starts empty", () => { const copied = core.copyPlannerFromPreviousWeek(1, {}, { weekday: "study", saturday: "exercise", sunday: "help" }); assert(Object.values(copied).every((value) => value === null)); });

test("TC-V080-030 Outcome thresholds are 15/65/20", () => { assert(core.rollOutcomeFromNumber(0.1499).key === "great"); assert(core.rollOutcomeFromNumber(0.15).key === "success"); assert(core.rollOutcomeFromNumber(0.7999).key === "success"); assert(core.rollOutcomeFromNumber(0.80).key === "failure"); });
test("TC-V080-031 Weekend doubles positive gains", () => { const outcome = core.rollOutcomeFromNumber(0.5); assert(core.calculateActivityDelta(2, 2, outcome) === core.calculateActivityDelta(2, 1, outcome) * 2); });
test("TC-V080-032 Failure deducts only one stat on weekday and weekend", () => { const fail = core.rollOutcomeFromNumber(0.9); assert(core.calculateActivityDelta(2, 1, fail) === -1); assert(core.calculateActivityDelta(2, 2, fail) === -1); });
test("TC-V080-033 Great success uses 1.5x before weekend multiplier", () => { const great = core.rollOutcomeFromNumber(0.1); assert(core.calculateActivityDelta(2, 1, great) === 3); assert(core.calculateActivityDelta(2, 2, great) === 6); });
test("TC-V080-034 Trait and emotion roll shift is capped at ±10 points", () => { const helped = core.applyTraitRollModifier(0.5, "study", ["Studious", "Studious", "Studious"], [], "Curious"); const hindered = core.applyTraitRollModifier(0.5, "study", [], ["Impulsive", "Distractible", "Impulsive"], "Anxious"); assert(Math.abs(helped - 0.4) < 1e-9, `Expected 0.4, got ${helped}`); assert(Math.abs(hindered - 0.6) < 1e-9, `Expected 0.6, got ${hindered}`); });
test("TC-V080-035 Trait point economy remains valid", () => { assert(core.traitBudget([], []) === 3); assert(core.isValidTraitSelection(["Studious", "Creative", "Athletic", "Sociable"], ["Shy"])); assert(!core.isValidTraitSelection([], ["Shy", "Impulsive", "Stubborn"])); });

test("TC-V080-036 Minor events include skill and relationship effects", () => { const events = Object.values(STORY.events.minor); assert(events.some((event) => Object.keys(event.effects?.stats || {}).length > 0)); assert(events.some((event) => Object.keys(event.effects?.relationships || {}).length > 0)); });
test("TC-V080-037 Canon characters remain present and removed routes stay absent", () => { const text = allStoryText(); ["Ethan Blackwell", "Fern Holloway", "Dorian Evans", "Agnes Cole"].forEach((name) => assert(text.includes(name), `${name} missing`)); ["Julian Cross", "Rowan Hale", "Maya Reyes"].forEach((name) => assert(!text.includes(name), `${name} should not remain`)); });
test("TC-V080-038 Life mystery escalation remains present", () => { const text = allStoryText().toLowerCase(); ["m-17 / 04:20", "white headlights", "missing hour", "fix the timeline before she wakes"].forEach((beat) => assert(text.includes(beat), `${beat} missing`)); });
test("TC-V080-039 Dialogue history starts empty and preserves entries", () => { const state = core.initialState(); assert(Array.isArray(state.history) && state.history.length === 0); const entry = core.historyEntry("Fern Holloway", "Hello"); assert(entry.speaker === "Fern Holloway" && entry.text === "Hello"); });
test("TC-V080-040 Activities cover all five stats", () => { const stats = new Set(ACTIVITIES.map((activity) => activity.stat)); ["Intelligence", "Fitness", "Charisma", "Creativity", "Kindness"].forEach((stat) => assert(stats.has(stat), `${stat} activity missing`)); });
test("TC-V080-041 Skip logic still pauses for scheduled story events", () => { assert(core.shouldPauseForStoryEvent({ eventChoice: { type: "major", id: "mystery_necklace_echo" }, eventStarted: false })); assert(!core.shouldPauseForStoryEvent({ eventChoice: null, eventStarted: false })); assert(!core.shouldPauseForStoryEvent({ eventChoice: { type: "major", id: "mystery_necklace_echo" }, eventStarted: true })); });
test("TC-V080-042 Initial state includes planner history for copy-forward", () => { const state = core.initialState(); assert(state.plannerHistory && typeof state.plannerHistory === "object"); });
test("TC-V080-043 Daily result icons map great/success/failure", () => { assert(core.outcomeIcon("great") === "⭐"); assert(core.outcomeIcon("success") === "👍"); assert(core.outcomeIcon("failure") === "👎"); });
test("TC-V080-044 Ported events retain Life source labels", () => { const events = [...Object.values(STORY.events.major), ...Object.values(STORY.events.minor)]; ["event_ethan_intro", "event_fern_school_intro", "event_home_family_breakfast", "event_mystery_necklace_echo"].forEach((label) => assert(events.some((event) => event.sourceLabel === label), `${label} missing`)); });
test("TC-V080-045 Ported menu choices preserve branch scene dialogue", () => { const event = STORY.events.minor.ethan_playground_intro; const choiceScene = flattenScenes(event.scenes).find((scene) => Array.isArray(scene.choices) && scene.choices.length); assert(choiceScene); assert(choiceScene.choices.some((choice) => Array.isArray(choice.scenes) && choice.scenes.length > 0)); });
test("TC-V080-046 Life dialogue samples are present", () => { const text = allStoryText(); ["Rules keep people safe.", "future top of the class", "Everything here feels neat. Expensive. Watched."].forEach((line) => assert(text.includes(line), `${line} missing`)); });

const details = [];
let passed = 0;
tests.forEach(({ name, fn }) => {
  try { fn(); passed += 1; details.push({ name, passed: true, message: "" }); }
  catch (error) { details.push({ name, passed: false, message: error.message }); }
});
window.TEST_RESULTS = { passed, total: tests.length, details };
if (typeof document !== "undefined") {
  const results = document.getElementById("results"); const summary = document.getElementById("summary");
  if (results && summary) {
    details.forEach((result) => { const item = document.createElement("li"); item.className = result.passed ? "pass" : "fail"; item.textContent = result.passed ? `PASS — ${result.name}` : `FAIL — ${result.name}: ${result.message}`; results.appendChild(item); });
    summary.textContent = `${passed}/${tests.length} tests passed.`;
  }
}
