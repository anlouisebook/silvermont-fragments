"use strict";
(function () {
  const RELEASE_VERSION = "0.11.0";
  const SLOT_PREFIX = "silvermont_fragments_slot_v1_";
  const READ_KEY = "silvermont_fragments_read_events_v1";
  const DEBUG_MODE = window.SILVERMONT_DEBUG_MODE ?? true;
  const REL_NAMES = { ethan: "Ethan", fern: "Fern", agnes: "Agnes", dorian: "Dorian" };

  window.SILVERMONT_DEBUG_MODE = DEBUG_MODE;

  function cloneSafe(value) { return JSON.parse(JSON.stringify(value)); }
  function allEvents() { return { ...STORY.events.major, ...STORY.events.minor }; }
  function slotKey(id) { return `${SLOT_PREFIX}${id}`; }
  function dateText(date) { return window.GameCore.dateLabel(date); }
  function currentMeta() {
    return {
      week: Number(state.week || 0),
      date: cloneSafe(state.currentDate || { month: 9, day: 1 }),
      age: Number(state.age || 8),
      savedAt: new Date().toISOString()
    };
  }

  function ensureStateExtensions() {
    state.choiceMemory = Array.isArray(state.choiceMemory) ? state.choiceMemory : [];
    state.flags = state.flags || {};
  }

  function showToast(message) {
    let toast = document.getElementById("systemToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "systemToast";
      Object.assign(toast.style, {
        position: "fixed", left: "50%", bottom: "24px", transform: "translateX(-50%)",
        zIndex: "9999", maxWidth: "min(560px, 90vw)", padding: "10px 14px",
        border: "1px solid rgba(45,38,51,.2)", borderRadius: "10px",
        background: "rgba(255,250,247,.96)", color: "#2d2633", boxShadow: "0 8px 28px rgba(45,38,51,.18)"
      });
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => { toast.hidden = true; }, 2600);
  }

  // ---------- Prologue and section cards ----------
  STORY.prologue = [
    { sectionCard: { eyebrow: "PROLOGUE", title: "Arrival in Silvermont" }, speaker: "Narrator", text: "Prologue — Arrival in Silvermont" },
    { speaker: "Narrator", text: "Silvermont first appears through the car window as rows of old trees, polished gates, and houses set too far apart to feel accidental." },
    { speaker: "Narrator", text: "You keep one hand closed around Mother's Necklace." },
    { speaker: "Narrator", text: "The metal is warm from your palm. Familiar. Heavier today than it was yesterday." },
    { speaker: "Agnes Cole", text: "We're almost there, dear.", portrait: { character: "agnes", emotion: "gentle" } },
    { speaker: "{firstName}", text: "Is this Silvermont?" },
    { speaker: "Agnes Cole", text: "Yes. Whitmore Estates is just ahead.", portrait: { character: "agnes", emotion: "neutral" } },
    { speaker: "Narrator", text: "Ahead, a guard raises the gate after checking the car twice." },
    { speaker: "Narrator", text: "Beyond it, the streets are quiet enough that every passing engine sounds important." },
    { speaker: "{firstName}", text: "Do people always look at new cars here?" },
    { speaker: "Agnes Cole", text: "People look at anything they do not understand yet.", portrait: { character: "agnes", emotion: "concerned" } },
    { speaker: "Narrator", text: "She says it lightly, but her eyes stay on the window." },
    { speaker: "Narrator", text: "The Evans house waits at the end of a curved drive." },
    { speaker: "Narrator", text: "It is larger than the places you remember and quieter than any home should be." },
    { speaker: "Dorian Evans", text: "{firstName}.", portrait: { character: "dorian", emotion: "serious" } },
    { speaker: "Narrator", text: "Your uncle stands in the doorway as if he has been rehearsing this moment and forgotten every line." },
    { speaker: "{firstName}", text: "Hi, Uncle Dorian." },
    { speaker: "Dorian Evans", text: "You can call me Dorian if that is easier.", portrait: { character: "dorian", emotion: "neutral" } },
    { speaker: "Agnes Cole", text: "And you can let the child enter the house before discussing naming conventions.", portrait: { character: "agnes", emotion: "neutral" } },
    { speaker: "Narrator", text: "For one second, Dorian looks offended. Then tired. Then almost amused." },
    { speaker: "Dorian Evans", text: "Right. Of course. Come inside.", portrait: { character: "dorian", emotion: "neutral" } },
    { speaker: "Narrator", text: "Your suitcase is carried upstairs. Your shoes sound too loud against the floor." },
    { speaker: "Narrator", text: "On the wall is a family photograph you do not recognize." },
    { speaker: "Narrator", text: "You look for your mother before you can stop yourself." },
    { speaker: "Narrator", text: "She is not there." },
    { speaker: "Narrator", text: "Your fingers tighten around the necklace." },
    { speaker: "Dorian Evans", text: "Your room is ready. If anything is wrong, tell Agnes. Or me.", portrait: { character: "dorian", emotion: "concerned" } },
    { speaker: "{firstName}", text: "Okay." },
    { speaker: "Dorian Evans", text: "I know this is not the life you expected.", portrait: { character: "dorian", emotion: "serious" } },
    { speaker: "Narrator", text: "The words stop there. Whatever should come next does not." },
    { speaker: "Agnes Cole", text: "One day at a time, Mr. Evans.", portrait: { character: "agnes", emotion: "gentle" } },
    { speaker: "Narrator", text: "Later, alone in the new room, you sit beside a window overlooking Whitmore Estates." },
    { speaker: "Narrator", text: "A playground is visible beyond the trees." },
    { speaker: "Narrator", text: "For a moment, rain flashes across your memory where sunlight should be." },
    { speaker: "Narrator", text: "A road. A sharp sound. Glass. Then nothing." },
    { speaker: "{firstName}", text: "...Mom." },
    { speaker: "Narrator", text: "The memory is gone before you can hold it." },
    { speaker: "Agnes Cole", text: "Fresh air might help. Only if you feel ready.", portrait: { character: "agnes", emotion: "gentle" } },
    { speaker: "Narrator", text: "You look once more toward the playground." },
    { speaker: "Narrator", text: "You do not know it yet, but someone is already there." }
  ];

  const priorShowScene = showScene;
  showScene = function (scene, options = {}) {
    priorShowScene(scene, options);
    if (!scene?.sectionCard) return;
    setPortrait(null);
    ui.speaker.textContent = "";
    ui.speaker.style.display = "none";
    ui.text.innerHTML = `<span style="display:block;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;opacity:.7;margin-bottom:8px">${scene.sectionCard.eyebrow}</span><strong style="display:block;font-size:clamp(1.35rem,3vw,2.2rem);line-height:1.15">${scene.sectionCard.title}</strong>`;
  };

  const priorOpenPlanner = openPlanner;
  openPlanner = function (targetWeek) {
    state.flags = state.flags || {};
    if (Number(targetWeek) === 1 && !state.flags.prologue_section_complete) {
      state.flags.prologue_section_complete = true;
      state.currentMode = "story";
      state.sceneQueue = [
        { sectionCard: { eyebrow: "END OF PROLOGUE", title: "A New Week Begins" }, speaker: "Narrator", text: "End of Prologue — A New Week Begins" },
        { sectionCard: { eyebrow: "CHAPTER 1", title: "First Days" }, speaker: "Narrator", text: "Chapter 1 — First Days" }
      ];
      state.sceneIndex = 0;
      showScene(state.sceneQueue[0]);
      return;
    }
    priorOpenPlanner(targetWeek);
    if (Number(targetWeek) >= 1) autosave();
  };

  // ---------- Week 1: exact-date events only ----------
  function ordinal(date) {
    const md = [31,29,31,30,31,30,31,31,30,31,30,31];
    let total = Number(date?.day || 0);
    for (let month = 1; month < Number(date?.month || 1); month += 1) total += md[month - 1];
    return total;
  }
  function exactEligible(event, day) {
    if (!event?.triggerDate || state.eventHistory?.includes(event.id)) return false;
    if (ordinal(day.date) < ordinal(event.triggerDate)) return false;
    if (!window.GameCore.eventDayTypeEligible(event, day.dayName)) return false;
    const tags = event.activityTags?.length ? event.activityTags : ["any"];
    if (!tags.includes("any") && !tags.includes(day.activityId)) return false;
    return window.GameCore.eventRequirementMet(event, state);
  }
  function dueExact(events, day) {
    return Object.values(events || {}).filter((event) => exactEligible(event, day))
      .sort((a, b) => ordinal(a.triggerDate) - ordinal(b.triggerDate))[0] || null;
  }
  const priorChooseEventForDay = chooseEventForDay;
  chooseEventForDay = function (day) {
    if (Number(state.week) !== 1) return priorChooseEventForDay(day);
    const counts = state.resolution?.eventCounts || { major: 0, minor: 0 };
    const major = dueExact(STORY.events.major, day);
    if (major && Number(counts.major || 0) < WEEKLY_EVENT_LIMITS.major) return { type: "major", id: major.id };
    const minor = dueExact(STORY.events.minor, day);
    if (minor && Number(counts.minor || 0) < WEEKLY_EVENT_LIMITS.minor) return { type: "minor", id: minor.id };
    return null;
  };

  // ---------- Choice Memory ----------
  ensureStateExtensions();
  const priorSelectStoryChoice = selectStoryChoice;
  selectStoryChoice = function (choice) {
    ensureStateExtensions();
    state.choiceMemory.push({
      eventId: state.activeEvent?.id || (Number(state.week) === 0 ? "__prologue__" : "story"),
      choice: String(choice?.text || "Choice"),
      date: cloneSafe(state.currentDate),
      week: Number(state.week || 0)
    });
    priorSelectStoryChoice(choice);
  };
  window.SilvermontChoiceMemory = {
    all: () => cloneSafe(state.choiceMemory || []),
    lastFor: (eventId) => cloneSafe([...(state.choiceMemory || [])].reverse().find((item) => item.eventId === eventId) || null)
  };

  // ---------- Relationship Moments ----------
  function relationshipMoment(before, after) {
    const warmer = [];
    const distant = [];
    Object.keys(after || {}).forEach((key) => {
      const delta = Number(after[key] || 0) - Number(before[key] || 0);
      if (delta > 0) warmer.push(REL_NAMES[key] || key);
      if (delta < 0) distant.push(REL_NAMES[key] || key);
    });
    if (warmer.length) showToast(`${warmer.join(" and ")} seem${warmer.length === 1 ? "s" : ""} more comfortable around you.`);
    else if (distant.length) showToast(`${distant.join(" and ")} seem${distant.length === 1 ? "s" : ""} more distant.`);
  }
  const priorApplyEventEffects = applyEventEffects;
  applyEventEffects = function (event) {
    const before = cloneSafe(state.relationships || {});
    priorApplyEventEffects(event);
    relationshipMoment(before, state.relationships || {});
  };
  const priorApplyChoiceEffect = applyChoiceEffect;
  applyChoiceEffect = function (effect) {
    const before = cloneSafe(state.relationships || {});
    priorApplyChoiceEffect(effect);
    relationshipMoment(before, state.relationships || {});
  };

  // ---------- Save slots ----------
  function readSlot(id) {
    try { return JSON.parse(localStorage.getItem(slotKey(id)) || "null"); } catch (_) { return null; }
  }
  function writeSlot(id) {
    ensureStateExtensions();
    const payload = { meta: currentMeta(), state: cloneSafe(state) };
    localStorage.setItem(slotKey(id), JSON.stringify(payload));
    return payload;
  }
  function autosave() { try { writeSlot("auto"); } catch (_) {} }
  function loadSlot(id) {
    const payload = readSlot(id);
    if (!payload?.state) return false;
    const defaults = initialState();
    const loaded = payload.state;
    state = { ...defaults, ...loaded };
    state.stats = { ...defaults.stats, ...(loaded.stats || {}) };
    state.relationships = { ...defaults.relationships, ...(loaded.relationships || {}) };
    state.appearance = { ...defaults.appearance, ...(loaded.appearance || {}) };
    state.currentDate = { ...defaults.currentDate, ...(loaded.currentDate || {}) };
    state.birthday = { ...defaults.birthday, ...(loaded.birthday || {}) };
    state.history = Array.isArray(loaded.history) ? loaded.history : [];
    state.eventHistory = Array.isArray(loaded.eventHistory) ? loaded.eventHistory : [];
    state.choiceMemory = Array.isArray(loaded.choiceMemory) ? loaded.choiceMemory : [];
    state.plannerHistory = loaded.plannerHistory && typeof loaded.plannerHistory === "object" ? loaded.plannerHistory : {};
    hideAllModals();
    restoreView();
    updateStatus();
    return true;
  }
  function resetSlots() { ["auto", "1", "2", "3"].forEach((id) => localStorage.removeItem(slotKey(id))); }

  // ---------- Journal ----------
  function journalData() {
    const events = allEvents();
    const completed = (state.eventHistory || []).map((id) => events[id]?.name || id);
    const clues = [];
    if (state.flags?.clue_hidden_engraving) clues.push("A hidden engraving inside Mother's Necklace: M-17 / 04:20.");
    if (state.flags?.remembered_second_headlights) clues.push("A memory of headlights already waiting before the impact.");
    if (state.flags?.found_hospital_timeline_gap) clues.push("The hospital timeline contains a missing hour.");
    const people = ["Dorian", "Agnes"];
    if (state.flags?.met_ethan || state.eventHistory?.includes("ethan_playground_intro")) people.push("Ethan");
    if (state.flags?.met_fern || state.eventHistory?.includes("fern_school_intro")) people.push("Fern");
    const unresolved = [];
    if (state.flags?.mystery_started && !state.flags?.truth_story_does_not_fit) unresolved.push("What does the necklace engraving mean?");
    if (state.flags?.remembered_second_headlights && !state.flags?.found_hospital_timeline_gap) unresolved.push("Who was waiting near the crash?");
    if (state.flags?.found_hospital_timeline_gap) unresolved.push("Who changed the accident timeline, and why?");
    return { completed, clues, people, unresolved, choices: state.choiceMemory || [] };
  }

  // ---------- Shared modal UI ----------
  const overlay = document.createElement("section");
  overlay.id = "systemPanel";
  overlay.className = "modal-screen hidden";
  overlay.innerHTML = `<div class="modal-card wide" style="max-height:86vh;overflow:auto"><div class="modal-heading"><div><h2 id="systemPanelTitle">Panel</h2><p id="systemPanelSubtitle"></p></div><button id="systemPanelClose" class="ghost-btn" type="button">Close</button></div><div id="systemPanelBody"></div></div>`;
  document.getElementById("game").appendChild(overlay);
  const panelTitle = document.getElementById("systemPanelTitle");
  const panelSubtitle = document.getElementById("systemPanelSubtitle");
  const panelBody = document.getElementById("systemPanelBody");
  document.getElementById("systemPanelClose").addEventListener("click", () => overlay.classList.add("hidden"));

  function openPanel(title, subtitle, html) {
    panelTitle.textContent = title;
    panelSubtitle.textContent = subtitle || "";
    panelBody.innerHTML = html;
    overlay.classList.remove("hidden");
  }
  function slotLabel(id) {
    const payload = readSlot(id);
    if (!payload?.meta) return "Empty";
    const when = new Date(payload.meta.savedAt).toLocaleString();
    return `Week ${payload.meta.week} · ${dateText(payload.meta.date)} · Age ${payload.meta.age}<br><small>${when}</small>`;
  }
  function slotButtons(mode) {
    const ids = mode === "load" ? ["auto", "1", "2", "3"] : ["1", "2", "3"];
    return ids.map((id) => `<button class="activity-btn slot-action" data-slot="${id}" style="width:100%;margin:6px 0;text-align:left"><strong>${id === "auto" ? "Autosave" : `Slot ${id}`}</strong><small style="display:block;margin-top:4px">${slotLabel(id)}</small></button>`).join("");
  }
  function openSaveSlots() {
    openPanel("Save Game", "Choose a manual slot.", slotButtons("save"));
    panelBody.querySelectorAll(".slot-action").forEach((button) => button.addEventListener("click", () => {
      writeSlot(button.dataset.slot); showToast(`Saved to Slot ${button.dataset.slot}.`); openSaveSlots();
    }));
  }
  function openLoadSlots() {
    openPanel("Load Game", "Choose a saved slot.", slotButtons("load"));
    panelBody.querySelectorAll(".slot-action").forEach((button) => button.addEventListener("click", () => {
      if (!loadSlot(button.dataset.slot)) { showToast("That slot is empty."); return; }
      overlay.classList.add("hidden"); showToast(button.dataset.slot === "auto" ? "Autosave loaded." : `Slot ${button.dataset.slot} loaded.`);
    }));
  }
  function openJournal() {
    ensureStateExtensions();
    const data = journalData();
    const list = (items, empty) => items.length ? `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>` : `<p>${empty}</p>`;
    const choices = data.choices.length ? `<ul>${data.choices.slice(-12).reverse().map((item) => `<li>${dateText(item.date)} — ${item.choice}</li>`).join("")}</ul>` : "<p>No remembered choices yet.</p>";
    openPanel("Event Journal", "Clues, people, unresolved questions, and remembered choices.", `<h3>Events</h3>${list(data.completed,"No events recorded yet.")}<h3>Clues</h3>${list(data.clues,"No clues discovered yet.")}<h3>Important People</h3>${list(data.people,"No one recorded yet.")}<h3>Unresolved Mysteries</h3>${list(data.unresolved,"No unresolved mystery recorded yet.")}<h3>Choice Memory</h3>${choices}`);
  }

  // Capture existing Save/Continue handlers.
  const saveButton = document.getElementById("saveBtn");
  saveButton.addEventListener("click", (event) => { event.preventDefault(); event.stopImmediatePropagation(); openSaveSlots(); }, true);
  const continueButton = document.getElementById("continueMenuBtn");
  continueButton.addEventListener("click", (event) => { event.preventDefault(); event.stopImmediatePropagation(); openLoadSlots(); }, true);

  const journalButton = document.createElement("button");
  journalButton.id = "journalBtn";
  journalButton.className = "ghost-btn";
  journalButton.type = "button";
  journalButton.textContent = "Journal";
  journalButton.addEventListener("click", openJournal);
  document.querySelector(".topbar-actions")?.prepend(journalButton);

  // ---------- Debug tools ----------
  const debugTools = [];
  function registerDebugTool(label, action) { debugTools.push({ label, action }); }
  window.SilvermontDebug = { registerTool: registerDebugTool, get enabled() { return DEBUG_MODE; } };

  function openDebug() {
    const eventOptions = Object.entries(allEvents()).map(([id, event]) => `<option value="${id}">${event.name || id}</option>`).join("");
    openPanel("Debug Tools", "Developer-only test controls.", `
      <div style="display:grid;gap:12px">
        <label>Trigger Event<select id="debugEventSelect">${eventOptions}</select></label><button id="debugTriggerEvent" class="primary-btn" type="button">Trigger Selected Event</button>
        <div class="form-row two"><label>Month<input id="debugMonth" type="number" min="1" max="12" value="${state.currentDate.month}"></label><label>Day<input id="debugDay" type="number" min="1" max="31" value="${state.currentDate.day}"></label></div><button id="debugSetDate" class="ghost-btn" type="button">Set Date</button>
        <label>Week<input id="debugWeek" type="number" min="0" value="${state.week}"></label><button id="debugSetWeek" class="ghost-btn" type="button">Set Week</button>
        <h3>Edit Stats</h3><div id="debugStats"></div><button id="debugApplyStats" class="ghost-btn" type="button">Apply Stats</button>
        <h3>Toggle Flag</h3><label>Flag name<input id="debugFlagName" type="text" placeholder="mystery_started"></label><label><input id="debugFlagValue" type="checkbox"> True</label><button id="debugApplyFlag" class="ghost-btn" type="button">Apply Flag</button>
        <button id="debugEventHistory" class="ghost-btn" type="button">View Event History</button>
        <button id="debugClearReads" class="ghost-btn" type="button">Clear Read History</button>
        <button id="debugResetSlots" class="ghost-btn" type="button">Reset Save Slots</button>
        <div id="debugCustomTools"></div><pre id="debugOutput" style="white-space:pre-wrap"></pre>
      </div>`);
    const stats = document.getElementById("debugStats");
    stats.innerHTML = Object.entries(state.stats).map(([key, value]) => `<label>${key}<input data-stat="${key}" type="number" value="${value}"></label>`).join("");
    document.getElementById("debugTriggerEvent").onclick = () => triggerDebugEvent(document.getElementById("debugEventSelect").value);
    document.getElementById("debugSetDate").onclick = () => { state.currentDate = { month: Number(document.getElementById("debugMonth").value), day: Number(document.getElementById("debugDay").value) }; updateStatus(); showToast("Date updated."); };
    document.getElementById("debugSetWeek").onclick = () => { state.week = Math.max(0, Number(document.getElementById("debugWeek").value)); updateStatus(); showToast("Week updated."); };
    document.getElementById("debugApplyStats").onclick = () => { stats.querySelectorAll("[data-stat]").forEach((input) => { state.stats[input.dataset.stat] = Number(input.value); }); renderStats(); showToast("Stats updated."); };
    document.getElementById("debugApplyFlag").onclick = () => { const name = document.getElementById("debugFlagName").value.trim(); if (name) state.flags[name] = document.getElementById("debugFlagValue").checked; showToast("Flag updated."); };
    document.getElementById("debugEventHistory").onclick = () => { document.getElementById("debugOutput").textContent = JSON.stringify(state.eventHistory || [], null, 2); };
    document.getElementById("debugClearReads").onclick = () => { localStorage.removeItem(READ_KEY); showToast("Read history cleared."); };
    document.getElementById("debugResetSlots").onclick = () => { resetSlots(); showToast("Save slots reset."); };
    const custom = document.getElementById("debugCustomTools");
    debugTools.forEach((tool) => { const button = document.createElement("button"); button.className = "ghost-btn"; button.type = "button"; button.textContent = tool.label; button.onclick = tool.action; custom.appendChild(button); });
  }

  function triggerDebugEvent(id) {
    const entries = ["major", "minor"];
    const type = entries.find((key) => STORY.events[key]?.[id]);
    const event = type ? STORY.events[type][id] : null;
    if (!event) return;
    overlay.classList.add("hidden");
    state.activeEvent = { type, id, resume: "debug" };
    state.sceneQueue = cloneSafe(event.scenes || []);
    state.sceneIndex = 0;
    state.currentMode = "story";
    hideAllModals();
    if (state.sceneQueue.length) showScene(state.sceneQueue[0]);
  }
  const priorCompleteActiveEvent = completeActiveEvent;
  completeActiveEvent = function () {
    const debugReturn = state.activeEvent?.resume === "debug";
    priorCompleteActiveEvent();
    if (debugReturn) { state.currentMode = "story"; openDebug(); }
  };

  if (DEBUG_MODE) {
    const debugButton = document.createElement("button");
    debugButton.id = "debugBtn";
    debugButton.className = "ghost-btn";
    debugButton.type = "button";
    debugButton.textContent = "Debug";
    debugButton.addEventListener("click", openDebug);
    document.querySelector(".topbar-actions")?.appendChild(debugButton);
  }

  // Autosave after completed summaries too.
  const priorContinueAfterSummary = continueAfterSummary;
  continueAfterSummary = function () { priorContinueAfterSummary(); autosave(); };

  // Migrate active state and visible version.
  ensureStateExtensions();
  document.getElementById("versionLabel").textContent = `v${RELEASE_VERSION}`;
  document.getElementById("menuVersionLabel").textContent = `v${RELEASE_VERSION}`;
})();
