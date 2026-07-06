"use strict";

const {
  VERSION,
  SAVE_KEY,
  START_DATE,
  SLICE_WEEKS,
  WEEK_LENGTH,
  initialState,
  clone,
  normalizeFirstName,
  pronounSet,
  rollOutcomeFromNumber,
  calculateActivityGain,
  calculateActivityDelta,
  applyTraitRollModifier,
  traitBudget,
  isValidTraitSelection,
  portraitKey,
  historyEntry,
  daysInMonth,
  addDays,
  dateLabel,
  dayNameForOffset,
  eventEligible,
  chooseDailyStoryEvent,
  createWeekResolution,
  shouldPauseForStoryEvent,
  copyPlannerFromPreviousWeek,
  WEEKLY_EVENT_LIMITS
} = window.GameCore;

let state = initialState();
let resolutionTimer = null;

const $ = (id) => document.getElementById(id);
const ui = {
  dialoguePanel: $("dialoguePanel"),
  chapter: $("chapterLabel"),
  age: $("ageLabel"),
  week: $("weekLabel"),
  day: $("dayLabel"),
  portrait: $("portrait"),
  portraitPixel: $("portraitPixel"),
  speaker: $("speakerName"),
  text: $("dialogueText"),
  choices: $("choiceArea"),
  stats: $("statsGrid"),
  mainMenuScreen: $("mainMenuScreen"),
  continueMenuBtn: $("continueMenuBtn"),
  creatorScreen: $("creatorScreen"),
  plannerScreen: $("plannerScreen"),
  resolutionScreen: $("dayResolutionScreen"),
  summaryScreen: $("summaryScreen"),
  historyScreen: $("historyScreen"),
  historyList: $("historyList"),
  plannerTitle: $("plannerTitle"),
  plannerPreview: $("plannerPreview"),
  beginWeek: $("beginWeekBtn"),
  resolutionTitle: $("resolutionTitle"),
  resolutionDate: $("resolutionDate"),
  resolutionActivity: $("resolutionActivity"),
  resolutionOutcome: $("resolutionOutcome"),
  resolutionGain: $("resolutionGain"),
  resolutionProgress: $("resolutionProgress"),
  skipResolution: $("skipResolutionBtn"),
  summaryTitle: $("summaryTitle"),
  summaryResults: $("summaryResults"),
  statChanges: $("statChanges"),
  traitPointsBadge: $("traitPointsBadge"),
  creatorError: $("creatorError")
};

function capitalize(value) {
  const text = String(value || "");
  return text ? text[0].toUpperCase() + text.slice(1) : text;
}

function interpolate(text) {
  const pronouns = pronounSet(state.pronounsKey);
  const values = {
    firstName: state.firstName,
    nickname: state.nickname,
    subjectPronoun: pronouns.subject,
    SubjectPronoun: capitalize(pronouns.subject),
    PossessiveDeterminer: capitalize(pronouns.possessiveDeterminer),
    objectPronoun: pronouns.object,
    possessiveDeterminer: pronouns.possessiveDeterminer,
    possessivePronoun: pronouns.possessivePronoun,
    reflexivePronoun: pronouns.reflexive,
    birthdayLabel: dateLabel(state.birthday),
    emotionalState: state.emotionalState,
    emotionalStateLower: state.emotionalState.toLowerCase(),
    hairColor: state.appearance.hairColor,
    hairColorLower: state.appearance.hairColor.toLowerCase(),
    hairStyle: state.appearance.hairStyle,
    hairStyleLower: state.appearance.hairStyle.toLowerCase(),
    eyeColor: state.appearance.eyeColor,
    skinTone: state.appearance.skinTone,
    heightImpression: state.appearance.heightImpression,
    heightImpressionLower: state.appearance.heightImpression.toLowerCase(),
    buildImpression: state.appearance.buildImpression,
    buildImpressionLower: state.appearance.buildImpression.toLowerCase()
  };

  return String(text || "").replace(/\{([A-Za-z]+)\}/g, (match, key) => (
    Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match
  ));
}

function updateStatus() {
  ui.age.textContent = `Age ${state.age}`;
  ui.week.textContent = `Week ${state.week} / ${SLICE_WEEKS}`;
  ui.day.textContent = `${dateLabel(state.currentDate)} · ${state.day}`;
  ui.chapter.textContent = state.week === 0 ? "Prologue" : `Act I · Week ${state.week}`;
  $("versionLabel").textContent = `v${VERSION}`;
  renderStats();
}

function renderStats() {
  ui.stats.innerHTML = "";
  Object.entries(state.stats).forEach(([name, value]) => {
    const card = document.createElement("div");
    card.className = "stat-card";
    card.innerHTML = `<strong>${value}</strong><span>${name}</span>`;
    ui.stats.appendChild(card);
  });
}

function setPortrait(portrait) {
  if (!portrait) {
    ui.portrait.classList.add("hidden");
    ui.dialoguePanel.classList.add("no-portrait");
    ui.portraitPixel.className = "pixel-portrait";
    ui.portraitPixel.innerHTML = "";
    return;
  }
  const character = portrait.character || "generic";
  const emotion = portrait.emotion || "neutral";
  ui.portrait.classList.remove("hidden");
  ui.dialoguePanel.classList.remove("no-portrait");
  ui.portraitPixel.className = `pixel-portrait ${portraitKey(character, emotion)}`;
  renderPixelFace(character, emotion);
}

function renderPixelFace(character, emotion) {
  const sprite = buildPixelSprite(character, emotion);
  const fragment = document.createDocumentFragment();
  ui.portraitPixel.innerHTML = "";
  sprite.forEach((token) => {
    const cell = document.createElement("span");
    cell.className = `pixel ${token}`;
    fragment.appendChild(cell);
  });
  ui.portraitPixel.appendChild(fragment);
}

function buildPixelSprite(character, emotion) {
  const size = 12;
  const grid = Array(size * size).fill("px-clear");
  const set = (x, y, token) => { if (x >= 0 && x < size && y >= 0 && y < size) grid[y * size + x] = token; };
  const fill = (x1, y1, x2, y2, token) => {
    for (let y = y1; y <= y2; y += 1) for (let x = x1; x <= x2; x += 1) set(x, y, token);
  };

  fill(2, 10, 9, 11, "px-clothes");
  fill(3, 3, 8, 9, "px-skin");
  set(2, 5, "px-skin"); set(9, 5, "px-skin");
  const hair = {
    agnes: [[3,1,8,2],[2,2,9,4],[2,5,2,7],[9,5,9,7]],
    dorian: [[3,1,8,1],[2,2,9,3],[2,4,3,4],[8,4,9,4]],
    ethan: [[2,1,9,2],[2,3,9,3],[2,4,3,5],[8,4,9,5]],
    fern: [[3,1,8,1],[2,2,9,4],[1,4,2,8],[9,4,10,8],[2,8,3,9],[8,8,9,9]],
    mother: [[3,1,8,1],[2,2,9,4],[2,5,2,9],[9,5,9,9]],
    generic: [[3,1,8,2],[2,2,9,4]]
  };
  (hair[character] || hair.generic).forEach(([x1, y1, x2, y2]) => fill(x1, y1, x2, y2, "px-hair"));
  set(4, 5, "px-eye"); set(7, 5, "px-eye");

  if (emotion === "happy") {
    set(4, 5, "px-hair"); set(7, 5, "px-hair");
    set(4, 7, "px-mouth"); set(7, 7, "px-mouth"); set(5, 8, "px-mouth"); set(6, 8, "px-mouth");
  } else if (emotion === "sad" || emotion === "concerned") {
    set(3, 4, "px-brow"); set(4, 4, "px-brow"); set(7, 4, "px-brow"); set(8, 4, "px-brow");
    set(5, 8, "px-mouth"); set(6, 8, "px-mouth"); set(4, 9, "px-mouth"); set(7, 9, "px-mouth");
  } else if (["tense", "serious", "guarded"].includes(emotion)) {
    set(3, 4, "px-brow"); set(4, 4, "px-brow"); set(7, 4, "px-brow"); set(8, 4, "px-brow"); fill(4, 8, 7, 8, "px-mouth");
  } else if (emotion === "afraid") {
    set(4, 5, "px-white"); set(7, 5, "px-white"); set(4, 6, "px-eye"); set(7, 6, "px-eye");
    set(5, 8, "px-mouth"); set(6, 8, "px-mouth"); set(5, 9, "px-mouth"); set(6, 9, "px-mouth");
  } else if (emotion === "nostalgic" || emotion === "gentle") {
    set(4, 8, "px-mouth"); set(7, 8, "px-mouth"); set(5, 9, "px-mouth"); set(6, 9, "px-mouth");
  } else {
    fill(5, 8, 6, 8, "px-mouth");
  }
  return grid;
}

function appendHistory(scene) {
  const entry = historyEntry(interpolate(scene.speaker || "Narrator"), interpolate(scene.text || ""));
  const previous = state.history[state.history.length - 1];
  if (!previous || previous.speaker !== entry.speaker || previous.text !== entry.text) state.history.push(entry);
}

function showScene(scene, options = {}) {
  const { log = true } = options;
  state.currentMode = "story";
  ui.speaker.textContent = interpolate(scene.speaker || "Narrator");
  ui.text.textContent = interpolate(scene.text || "");
  setPortrait(scene.portrait);
  ui.choices.innerHTML = "";
  if (log) appendHistory(scene);

  (scene.choices || []).forEach((choice) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn";
    btn.textContent = interpolate(choice.text);
    btn.addEventListener("click", () => selectStoryChoice(choice));
    ui.choices.appendChild(btn);
  });
  updateStatus();
}

function applyChoiceEffect(effect = {}) {
  if (effect.stat && effect.amount) state.stats[effect.stat] += Number(effect.amount);
  if (effect.flag) state.flags[effect.flag] = true;
  if (effect.relationship?.key && effect.relationship.amount) {
    const key = effect.relationship.key;
    state.relationships[key] = Number(state.relationships[key] || 0) + Number(effect.relationship.amount);
  }
}

function selectStoryChoice(choice) {
  applyChoiceEffect(choice.effect || {});
  advanceScene();
}

function beginPrologue() {
  state.currentMode = "story";
  state.currentDate = { ...START_DATE };
  state.day = dayNameForOffset(0);
  state.dayIndex = 0;
  state.sceneQueue = clone(STORY.prologue);
  state.sceneIndex = 0;
  showScene(state.sceneQueue[0]);
}

function advanceScene() {
  if (state.finished) return;
  state.sceneIndex += 1;
  if (state.sceneIndex < state.sceneQueue.length) {
    showScene(state.sceneQueue[state.sceneIndex]);
    return;
  }

  if (state.activeEvent) {
    completeActiveEvent();
    return;
  }
  if (state.week === 0) {
    openPlanner(1);
    return;
  }
}

function activityById(id) { return ACTIVITIES.find((item) => item.id === id); }

function buildActivityButtons(containerId, slot) {
  const container = $(containerId);
  container.innerHTML = "";
  ACTIVITIES.forEach((activity) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "activity-btn";
    btn.dataset.activityId = activity.id;
    btn.innerHTML = `<strong>${activity.name}</strong><small>${activity.note}</small>`;
    btn.addEventListener("click", () => {
      state.planner[slot] = activity.id;
      renderPlannerSelection();
    });
    container.appendChild(btn);
  });
}

function showPlannerView() {
  ui.plannerTitle.textContent = `Plan Week ${state.week}`;
  buildActivityButtons("weekdayChoices", "weekday");
  buildActivityButtons("saturdayChoices", "saturday");
  buildActivityButtons("sundayChoices", "sunday");
  renderPlannerSelection();
  ui.plannerScreen.classList.remove("hidden");
  updateStatus();
}

function openPlanner(targetWeek) {
  clearResolutionTimer();
  state.currentMode = "planner";
  state.week = targetWeek;
  state.dayIndex = (targetWeek - 1) * WEEK_LENGTH;
  state.currentDate = addDays(START_DATE, state.dayIndex);
  state.day = dayNameForOffset(state.dayIndex);
  state.plannerHistory = state.plannerHistory || {};
  state.planner = copyPlannerFromPreviousWeek(targetWeek, state.plannerHistory, state.planner);
  state.resolution = null;
  showPlannerView();
}

function renderPlannerSelection() {
  [["weekdayChoices", "weekday"], ["saturdayChoices", "saturday"], ["sundayChoices", "sunday"]]
    .forEach(([containerId, slot]) => {
      $(containerId).querySelectorAll(".activity-btn").forEach((btn) => {
        btn.classList.toggle("selected", btn.dataset.activityId === state.planner[slot]);
      });
    });

  const ready = Object.values(state.planner).every(Boolean);
  ui.beginWeek.disabled = !ready;
  if (!ready) {
    ui.plannerPreview.textContent = "Select all three focuses.";
    return;
  }
  const weekday = activityById(state.planner.weekday);
  const saturday = activityById(state.planner.saturday);
  const sunday = activityById(state.planner.sunday);
  const copied = state.week > 1 && state.plannerHistory?.[state.week - 1] ? `Copied from Week ${state.week - 1}. ` : "";
  ui.plannerPreview.textContent = `${copied}Weekdays — ${weekday.name}; Saturday — ${saturday.name} ×2; Sunday — ${sunday.name} ×2. Update any focus or begin.`;
}

function beginWeek() {
  ui.plannerScreen.classList.add("hidden");
  state.plannerHistory = state.plannerHistory || {};
  state.plannerHistory[state.week] = clone(state.planner);
  const days = createWeekResolution(state.week, state.planner, ACTIVITIES, Math.random);
  state.resolution = {
    week: state.week,
    before: clone(state.stats),
    days,
    index: 0,
    skip: false,
    awaitingContinue: false,
    eventCounts: { major: 0, minor: 0 }
  };
  state.pendingSummary = null;
  state.currentMode = "resolving";
  processCurrentResolutionDay();
}

function calculateDayResult(day) {
  const adjustedRoll = applyTraitRollModifier(
    day.rawRoll,
    day.activityId,
    state.positiveTraits,
    state.negativeTraits,
    state.emotionalState
  );
  const outcome = rollOutcomeFromNumber(adjustedRoll);
  const gain = calculateActivityDelta(day.baseGain, day.weekendMultiplier, outcome);
  const modifierDirection = adjustedRoll < day.rawRoll ? "helped" : adjustedRoll > day.rawRoll ? "hindered" : "neutral";
  return { adjustedRoll, outcomeKey: outcome.key, outcomeLabel: outcome.label, gain, modifierDirection };
}

function applyDailyResult(day) {
  if (day.applied) return;
  const result = calculateDayResult(day);
  Object.assign(day, result);
  if (day.stat) {
    const before = Number(state.stats[day.stat] || 0);
    const after = Math.max(0, before + Number(day.gain || 0));
    state.stats[day.stat] = after;
    day.gain = after - before;
  }
  day.applied = true;
}

function birthdayEventChoice(day) {
  const event = STORY.events.minor.birthday;
  const counts = state.resolution?.eventCounts || { major: 0, minor: 0 };
  if (counts.minor >= WEEKLY_EVENT_LIMITS.minor) return null;
  if (eventEligible(event, state, day.absoluteDayIndex, day.date)) return { type: "minor", id: "birthday" };
  return null;
}

function chooseEventForDay(day) {
  const counts = state.resolution?.eventCounts || { major: 0, minor: 0 };
  return birthdayEventChoice(day) || chooseDailyStoryEvent(
    STORY.events.major,
    STORY.events.minor,
    state,
    day.absoluteDayIndex,
    day.date,
    Math.random,
    counts,
    WEEKLY_EVENT_LIMITS
  );
}

function reserveEventChoice(choice) {
  if (!choice || !state.resolution) return;
  const counts = state.resolution.eventCounts || (state.resolution.eventCounts = { major: 0, minor: 0 });
  counts[choice.type] = Number(counts[choice.type] || 0) + 1;
}

function renderResolutionProgress() {
  ui.resolutionProgress.innerHTML = "";
  state.resolution.days.forEach((day, index) => {
    const cell = document.createElement("span");
    cell.className = "day-progress-cell";
    if (index < state.resolution.index) cell.classList.add("done");
    if (index === state.resolution.index) cell.classList.add("active");
    if (day.eventChoice) cell.classList.add("has-event");
    cell.textContent = day.dayName.slice(0, 2);
    ui.resolutionProgress.appendChild(cell);
  });
}

function signedDelta(value) {
  const number = Number(value || 0);
  return number > 0 ? `+${number}` : String(number);
}

function renderDailyResolution(day) {
  ui.resolutionTitle.textContent = `Week ${state.week} · Day ${state.resolution.index + 1} of 7`;
  ui.resolutionDate.textContent = `${dateLabel(day.date)} · ${day.dayName}`;
  ui.resolutionActivity.textContent = day.activityName;
  ui.resolutionOutcome.textContent = day.outcomeLabel;
  ui.resolutionGain.textContent = `${signedDelta(day.gain)} ${day.stat}`;
  ui.resolutionGain.classList.toggle("zero", day.gain === 0);
  ui.resolutionGain.classList.toggle("negative", day.gain < 0);
  renderResolutionProgress();
  ui.resolutionScreen.classList.remove("hidden");
  updateStatus();
}

function clearResolutionTimer() {
  if (resolutionTimer !== null) {
    window.clearTimeout(resolutionTimer);
    resolutionTimer = null;
  }
}

function processCurrentResolutionDay() {
  clearResolutionTimer();
  const resolution = state.resolution;
  if (!resolution) return;
  if (resolution.index >= resolution.days.length) {
    finishWeekResolution();
    return;
  }

  state.currentMode = "resolving";
  const day = resolution.days[resolution.index];
  state.dayIndex = day.absoluteDayIndex;
  state.currentDate = { ...day.date };
  state.day = day.dayName;
  applyDailyResult(day);
  if (day.eventChoice === undefined) {
    day.eventChoice = chooseEventForDay(day);
    reserveEventChoice(day.eventChoice);
  }
  renderDailyResolution(day);

  if (resolution.skip) {
    resolution.awaitingContinue = false;
    resolutionTimer = window.setTimeout(finishCurrentResolutionDay, 0);
  } else {
    resolution.awaitingContinue = true;
  }
}

function finishCurrentResolutionDay() {
  clearResolutionTimer();
  const resolution = state.resolution;
  if (!resolution || resolution.index >= resolution.days.length) return;
  resolution.awaitingContinue = false;
  const day = resolution.days[resolution.index];

  if (shouldPauseForStoryEvent(day)) {
    day.eventStarted = true;
    startStoryEvent(day.eventChoice);
    return;
  }

  resolution.index += 1;
  processCurrentResolutionDay();
}

function skipResolution() {
  if (!state.resolution) return;
  state.resolution.skip = true;
  finishCurrentResolutionDay();
}

function advanceResolutionByClick(event) {
  if (event.target?.closest?.("button, a, input, select, label")) return;
  if (state.currentMode !== "resolving" || !state.resolution || state.resolution.skip) return;
  if (!state.resolution.awaitingContinue) return;
  finishCurrentResolutionDay();
}

function eventFromChoice(choice) {
  return STORY.events?.[choice?.type]?.[choice?.id] || null;
}

function startStoryEvent(choice) {
  const event = eventFromChoice(choice);
  if (!event) {
    state.resolution.index += 1;
    processCurrentResolutionDay();
    return;
  }

  if (!state.eventHistory.includes(event.id)) state.eventHistory.push(event.id);
  state.activeEvent = { type: choice.type, id: choice.id, resume: "resolution" };
  state.sceneQueue = clone(event.scenes || []);
  state.sceneIndex = 0;
  state.currentMode = "story";
  ui.resolutionScreen.classList.add("hidden");
  if (state.sceneQueue.length) showScene(state.sceneQueue[0]);
  else completeActiveEvent();
}

function applyEventEffects(event) {
  const effects = event?.effects || {};
  Object.entries(effects.stats || {}).forEach(([stat, amount]) => {
    state.stats[stat] = Math.max(0, Number(state.stats[stat] || 0) + Number(amount));
  });
  Object.entries(effects.relationships || {}).forEach(([key, amount]) => {
    state.relationships[key] = Number(state.relationships[key] || 0) + Number(amount);
  });
  Object.entries(effects.flags || {}).forEach(([flag, value]) => { state.flags[flag] = value; });
  if (effects.birthdayCelebrated) state.birthdayCelebrated = true;
}

function completeActiveEvent() {
  const active = state.activeEvent;
  const event = eventFromChoice(active);
  applyEventEffects(event);
  state.activeEvent = null;

  if (active?.resume === "resolution" && state.resolution) {
    state.resolution.index += 1;
    state.currentMode = "resolving";
    ui.resolutionScreen.classList.remove("hidden");
    processCurrentResolutionDay();
  }
}

function finishWeekResolution() {
  clearResolutionTimer();
  const resolution = state.resolution;
  state.pendingSummary = {
    week: state.week,
    before: clone(resolution.before),
    results: clone(resolution.days)
  };
  state.currentMode = "summary";
  state.resolution = null;
  ui.resolutionScreen.classList.add("hidden");
  showSummary();
}

function showSummary() {
  const summary = state.pendingSummary;
  if (!summary) return;
  ui.summaryTitle.textContent = `Week ${summary.week} Summary`;
  ui.summaryResults.innerHTML = "";
  summary.results.forEach((result) => {
    const item = document.createElement("div");
    item.className = "summary-item";
    const eventMark = result.eventChoice ? " · Story event" : "";
    item.innerHTML = `<strong>${result.dayName}, ${dateLabel(result.date)}</strong><br>${result.activityName} — ${result.outcomeLabel}, ${signedDelta(result.gain)} ${result.stat}${eventMark}`;
    ui.summaryResults.appendChild(item);
  });

  ui.statChanges.innerHTML = "";
  Object.entries(state.stats).forEach(([stat, value]) => {
    const delta = value - Number(summary.before[stat] || 0);
    const chip = document.createElement("span");
    chip.className = `change-chip${delta === 0 ? " zero" : ""}${delta < 0 ? " negative" : ""}`;
    chip.textContent = `${stat} ${signedDelta(delta)}`;
    ui.statChanges.appendChild(chip);
  });
  ui.summaryScreen.classList.remove("hidden");
  updateStatus();
}

function continueAfterSummary() {
  ui.summaryScreen.classList.add("hidden");
  state.pendingSummary = null;
  if (state.week < SLICE_WEEKS) {
    openPlanner(state.week + 1);
    return;
  }
  state.finished = true;
  state.currentMode = "finished";
  ui.speaker.textContent = "Narrator";
  ui.text.textContent = "Four weeks have passed in Silvermont. The calendar will continue in future versions.";
  ui.choices.innerHTML = "";
  setPortrait(null);
  updateStatus();
}

function renderHistory() {
  ui.historyList.innerHTML = "";
  if (!state.history.length) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = "No dialogue yet.";
    ui.historyList.appendChild(empty);
    return;
  }
  state.history.forEach((entry) => {
    const item = document.createElement("article");
    item.className = "history-entry";
    const speaker = document.createElement("strong");
    speaker.textContent = entry.speaker;
    const text = document.createElement("p");
    text.textContent = entry.text;
    item.append(speaker, text);
    ui.historyList.appendChild(item);
  });
  ui.historyList.scrollTop = ui.historyList.scrollHeight;
}

function openHistory() { renderHistory(); ui.historyScreen.classList.remove("hidden"); }
function closeHistory() { ui.historyScreen.classList.add("hidden"); }

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    flashMessage("Game saved in this browser.");
  } catch (error) {
    flashMessage("Save failed. Browser storage may be unavailable.");
  }
}

function loadGame(options = {}) {
  const { silent = false } = options;
  let raw = null;
  try { raw = localStorage.getItem(SAVE_KEY); } catch (error) { raw = null; }
  if (!raw) {
    if (!silent) flashMessage("No v0.7.0 save found.");
    return false;
  }

  try {
    const loaded = JSON.parse(raw);
    const defaults = initialState();
    state = { ...defaults, ...loaded };
    state.stats = { ...defaults.stats, ...(loaded.stats || {}) };
    state.relationships = { ...defaults.relationships, ...(loaded.relationships || {}) };
    state.appearance = { ...defaults.appearance, ...(loaded.appearance || {}) };
    state.currentDate = { ...defaults.currentDate, ...(loaded.currentDate || {}) };
    state.birthday = { ...defaults.birthday, ...(loaded.birthday || {}) };
    state.history = Array.isArray(loaded.history) ? loaded.history : [];
    state.eventHistory = Array.isArray(loaded.eventHistory) ? loaded.eventHistory : [];
    state.positiveTraits = Array.isArray(loaded.positiveTraits) ? loaded.positiveTraits : [];
    state.negativeTraits = Array.isArray(loaded.negativeTraits) ? loaded.negativeTraits : [];
    state.plannerHistory = loaded.plannerHistory && typeof loaded.plannerHistory === "object" ? loaded.plannerHistory : {};
    if (state.resolution) {
      state.resolution.eventCounts = { major: 0, minor: 0, ...(state.resolution.eventCounts || {}) };
      state.resolution.awaitingContinue = Boolean(state.resolution.awaitingContinue);
    }
    hideAllModals();
    restoreView();
    if (!silent) flashMessage("Save loaded.");
    return true;
  } catch (error) {
    if (!silent) flashMessage("Save data could not be loaded.");
    return false;
  }
}

function hideAllModals() {
  [ui.mainMenuScreen, ui.creatorScreen, ui.plannerScreen, ui.resolutionScreen, ui.summaryScreen, ui.historyScreen]
    .forEach((screen) => screen.classList.add("hidden"));
}

function restoreView() {
  updateStatus();
  if (state.currentMode === "creator") {
    populateCreatorFromState();
    ui.creatorScreen.classList.remove("hidden");
    return;
  }
  if (state.currentMode === "planner") {
    showPlannerView();
    return;
  }
  if (state.currentMode === "resolving" && state.resolution) {
    processCurrentResolutionDay();
    return;
  }
  if (state.currentMode === "summary" && state.pendingSummary) {
    showSummary();
    return;
  }
  if (state.currentMode === "story" && state.sceneQueue?.length) {
    showScene(state.sceneQueue[state.sceneIndex] || state.sceneQueue[0], { log: false });
    return;
  }
  if (state.finished) {
    ui.speaker.textContent = "Narrator";
    ui.text.textContent = "Four weeks have passed in Silvermont. The calendar will continue in future versions.";
    ui.choices.innerHTML = "";
    setPortrait(null);
    return;
  }
  showMainMenu();
}

function flashMessage(message) {
  const previousSpeaker = ui.speaker.textContent;
  const previousText = ui.text.textContent;
  ui.speaker.textContent = "System";
  ui.text.textContent = message;
  window.setTimeout(() => {
    if (state.currentMode === "story" && state.sceneQueue?.length) {
      const scene = state.sceneQueue[state.sceneIndex];
      if (scene) {
        ui.speaker.textContent = interpolate(scene.speaker || "Narrator");
        ui.text.textContent = interpolate(scene.text || "");
      }
    } else {
      ui.speaker.textContent = previousSpeaker;
      ui.text.textContent = previousText;
    }
  }, 1200);
}

function selectedValues(containerId) {
  return [...$(containerId).querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
}

function updateTraitEconomy() {
  const positives = selectedValues("positiveTraitChoices");
  const negatives = selectedValues("negativeTraitChoices");
  const remaining = traitBudget(positives, negatives);
  ui.traitPointsBadge.textContent = `${remaining} point${remaining === 1 ? "" : "s"} remaining`;
  ui.traitPointsBadge.classList.toggle("invalid", remaining < 0);
  $("positiveTraitChoices").querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.disabled = !input.checked && remaining <= 0;
  });
  $("negativeTraitChoices").querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.disabled = !input.checked && negatives.length >= 2;
  });
}

function handleTraitChange(event) {
  const positives = selectedValues("positiveTraitChoices");
  const negatives = selectedValues("negativeTraitChoices");
  if (!isValidTraitSelection(positives, negatives)) {
    event.target.checked = !event.target.checked;
    ui.creatorError.textContent = negatives.length > 2 ? "Choose at most two negative traits." : "You do not have enough trait points.";
    ui.creatorError.classList.remove("hidden");
  } else {
    ui.creatorError.classList.add("hidden");
  }
  updateTraitEconomy();
}

function populateBirthdayDays() {
  const month = Number($("birthMonthSelect").value);
  const daySelect = $("birthDaySelect");
  const previous = Number(daySelect.value) || 1;
  daySelect.innerHTML = "";
  for (let day = 1; day <= daysInMonth(month); day += 1) {
    const option = document.createElement("option");
    option.value = String(day);
    option.textContent = String(day);
    daySelect.appendChild(option);
  }
  daySelect.value = String(Math.min(previous, daysInMonth(month)));
}

function populateCreatorFromState() {
  $("firstNameInput").value = state.firstName === "Lilianna" ? "" : state.firstName;
  $("pronounsSelect").value = state.pronounsKey;
  $("birthMonthSelect").value = String(state.birthday.month);
  populateBirthdayDays();
  $("birthDaySelect").value = String(state.birthday.day);
  $("hairColorSelect").value = state.appearance.hairColor;
  $("hairStyleSelect").value = state.appearance.hairStyle;
  $("eyeColorSelect").value = state.appearance.eyeColor;
  $("skinToneSelect").value = state.appearance.skinTone;
  $("heightSelect").value = state.appearance.heightImpression;
  $("buildSelect").value = state.appearance.buildImpression;
  document.querySelectorAll('input[name="emotion"]').forEach((input) => { input.checked = input.value === state.emotionalState; });
  $("positiveTraitChoices").querySelectorAll('input[type="checkbox"]').forEach((input) => { input.checked = state.positiveTraits.includes(input.value); });
  $("negativeTraitChoices").querySelectorAll('input[type="checkbox"]').forEach((input) => { input.checked = state.negativeTraits.includes(input.value); });
  updateTraitEconomy();
}

function confirmCharacter() {
  const positives = selectedValues("positiveTraitChoices");
  const negatives = selectedValues("negativeTraitChoices");
  if (!isValidTraitSelection(positives, negatives)) {
    ui.creatorError.textContent = "Trait selection is invalid.";
    ui.creatorError.classList.remove("hidden");
    return;
  }

  const firstName = normalizeFirstName($("firstNameInput").value);
  state.firstName = firstName;
  state.nickname = firstName === "Lilianna" ? "Lili" : firstName;
  state.pronounsKey = $("pronounsSelect").value;
  state.birthday = { month: Number($("birthMonthSelect").value), day: Number($("birthDaySelect").value) };
  state.appearance = {
    hairColor: $("hairColorSelect").value,
    hairStyle: $("hairStyleSelect").value,
    eyeColor: $("eyeColorSelect").value,
    skinTone: $("skinToneSelect").value,
    heightImpression: $("heightSelect").value,
    buildImpression: $("buildSelect").value
  };
  state.emotionalState = document.querySelector('input[name="emotion"]:checked')?.value || "Calm";
  state.positiveTraits = positives;
  state.negativeTraits = negatives;
  state.traitPointsRemaining = traitBudget(positives, negatives);
  ui.creatorScreen.classList.add("hidden");
  beginPrologue();
}


function configureOnlinePlayButton() {
  const button = $("onlinePlayMenuBtn");
  if (!button) return;
  const url = String(window.SILVERMONT_CONFIG?.onlinePlayUrl || "").trim();
  button.disabled = !url;
  button.title = url ? "Open the hosted browser version" : "Set onlinePlayUrl in js/config.js after GitHub Pages deployment";
  button.dataset.url = url;
}

function openOnlinePlay() {
  const button = $("onlinePlayMenuBtn");
  const url = String(button?.dataset?.url || "").trim();
  if (!url) return;
  window.location.assign(url);
}

function hasSavedGame() {
  try { return Boolean(localStorage.getItem(SAVE_KEY)); } catch (error) { return false; }
}

function updateContinueButton() {
  const hasActiveSession = state.currentMode !== "menu";
  ui.continueMenuBtn.disabled = !hasActiveSession && !hasSavedGame();
}

function showMainMenu() {
  clearResolutionTimer();
  updateContinueButton();
  ui.mainMenuScreen.classList.remove("hidden");
  $("menuVersionLabel").textContent = `v${VERSION}`;
}

function startNewGame() {
  clearResolutionTimer();
  state = initialState();
  state.currentMode = "creator";
  hideAllModals();
  ui.creatorScreen.classList.remove("hidden");
  ui.speaker.textContent = "Narrator";
  ui.text.textContent = "Your story has not begun yet.";
  ui.choices.innerHTML = "";
  setPortrait(null);
  populateCreatorFromState();
  updateStatus();
}

function continueFromMenu() {
  if (state.currentMode !== "menu") {
    ui.mainMenuScreen.classList.add("hidden");
    restoreView();
    return;
  }
  if (loadGame({ silent: true })) ui.mainMenuScreen.classList.add("hidden");
}

function modalOpen() {
  return [ui.mainMenuScreen, ui.creatorScreen, ui.plannerScreen, ui.resolutionScreen, ui.summaryScreen, ui.historyScreen]
    .some((screen) => !screen.classList.contains("hidden"));
}

function handleDialogueAdvance(event) {
  if (event.target?.closest?.("button, input, select, label, .choice-area")) return;
  if (modalOpen()) return;
  if (state.currentMode === "story" && !state.sceneQueue[state.sceneIndex]?.choices?.length) advanceScene();
}

ui.dialoguePanel.addEventListener("click", handleDialogueAdvance);
document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  if (event.target?.closest?.("input, select, textarea, button")) return;
  event.preventDefault();
  handleDialogueAdvance(event);
});

$("birthMonthSelect").addEventListener("change", populateBirthdayDays);
$("positiveTraitChoices").addEventListener("change", handleTraitChange);
$("negativeTraitChoices").addEventListener("change", handleTraitChange);
$("confirmCharacterBtn").addEventListener("click", confirmCharacter);
ui.beginWeek.addEventListener("click", beginWeek);
ui.skipResolution.addEventListener("click", skipResolution);
ui.resolutionScreen.addEventListener("click", advanceResolutionByClick);
$("continueSummaryBtn").addEventListener("click", continueAfterSummary);
$("historyBtn").addEventListener("click", openHistory);
$("closeHistoryBtn").addEventListener("click", closeHistory);
$("saveBtn").addEventListener("click", saveGame);
$("menuBtn").addEventListener("click", showMainMenu);
$("newGameMenuBtn").addEventListener("click", startNewGame);
ui.continueMenuBtn.addEventListener("click", continueFromMenu);
$("onlinePlayMenuBtn").addEventListener("click", openOnlinePlay);

configureOnlinePlayButton();
updateStatus();
renderStats();
showMainMenu();
