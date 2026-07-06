"use strict";
(function () {
  const RELEASE_VERSION = "0.9.0";
  const PLAN_START_DATE = Object.freeze({ month: 9, day: 2 });
  const PLAN_DAYS = Object.freeze(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]);
  const PLAN_DAY_NAMES = Object.freeze(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
  const icon = document.getElementById("resolutionIcon");

  function emptyPlanner() { return Object.fromEntries(PLAN_DAYS.map((day) => [day, null])); }
  function planDayName(index) { return PLAN_DAY_NAMES[((Number(index) % 7) + 7) % 7]; }
  function isWeekendName(name) { return name === "Saturday" || name === "Sunday"; }

  function migratePlanner(planner) {
    if (planner && PLAN_DAYS.every((day) => Object.prototype.hasOwnProperty.call(planner, day))) return clone(planner);
    if (planner?.weekday || planner?.saturday || planner?.sunday) {
      return { monday: planner.weekday || null, tuesday: planner.weekday || null, wednesday: planner.weekday || null, thursday: planner.weekday || null, friday: planner.weekday || null, saturday: planner.saturday || null, sunday: planner.sunday || null };
    }
    return emptyPlanner();
  }

  function migrateStatePlanner() {
    state.planner = migratePlanner(state.planner);
    state.plannerHistory = state.plannerHistory || {};
    Object.keys(state.plannerHistory).forEach((week) => { state.plannerHistory[week] = migratePlanner(state.plannerHistory[week]); });
  }

  function eventActivityEligible(event, activityId) {
    const tags = Array.isArray(event?.activityTags) && event.activityTags.length ? event.activityTags : ["any"];
    return tags.includes("any") || Boolean(activityId && tags.includes(activityId));
  }

  function tagEvents() {
    Object.values(STORY.events.major).forEach((event) => { event.activityTags = ["any"]; });
    const tags = {
      birthday: ["any"],
      home_family_breakfast: ["help"],
      dorian_desk_light: ["help", "study"],
      agnes_evening_tea: ["help"],
      ethan_playground_intro: ["socialize", "exercise"],
      fern_school_intro: ["study", "socialize"],
      scholars_first_meeting: ["study"],
      creatives_first_meeting: ["create"],
      athletics_first_meeting: ["exercise"],
      shopping_district_first_visit: ["socialize"]
    };
    Object.entries(tags).forEach(([id, activityTags]) => { if (STORY.events.minor[id]) STORY.events.minor[id].activityTags = activityTags; });
  }

  function eventEligibleForActivity(event, day, activityId) {
    if (!event || state.eventHistory?.includes(event.id)) return false;
    if (Number(day.absoluteDayIndex) < Number(event.minDay ?? 0)) return false;
    if (Number(day.absoluteDayIndex) > Number(event.maxDay ?? Infinity)) return false;
    if (!window.GameCore.eventDayTypeEligible(event, day.dayName)) return false;
    if (!eventActivityEligible(event, activityId)) return false;
    if (!window.GameCore.eventRequirementMet(event, state)) return false;
    if (event.special === "birthday") return !state.birthdayCelebrated && window.GameCore.sameDate(state.birthday, day.date);
    return true;
  }

  function chooseTaggedEvent(day) {
    const counts = state.resolution?.eventCounts || { major: 0, minor: 0 };
    if (Number(counts.major || 0) < WEEKLY_EVENT_LIMITS.major) {
      const majors = Object.values(STORY.events.major)
        .filter((event) => eventEligibleForActivity(event, day, day.activityId))
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
      if (majors.length) {
        const overdue = majors.find((event) => Number(day.absoluteDayIndex) >= Number(event.guaranteedBy ?? Infinity));
        if (overdue) return { type: "major", id: overdue.id };
        if (Math.random() < Number(majors[0].chance ?? 0)) return { type: "major", id: majors[0].id };
      }
    }
    if (Number(counts.minor || 0) >= WEEKLY_EVENT_LIMITS.minor) return null;
    const minors = Object.values(STORY.events.minor).filter((event) => eventEligibleForActivity(event, day, day.activityId));
    if (!minors.length) return null;
    const roll = Math.random();
    const matched = minors.filter((event) => roll < Number(event.chance ?? 0));
    if (!matched.length) return null;
    return { type: "minor", id: matched[Math.floor(Math.random() * matched.length)].id };
  }

  function createPerDayResolution(weekNumber, planner) {
    const firstIndex = (Number(weekNumber) - 1) * WEEK_LENGTH;
    const activityMap = Object.fromEntries(ACTIVITIES.map((activity) => [activity.id, activity]));
    return PLAN_DAYS.map((dayKey, offset) => {
      const absoluteDayIndex = firstIndex + offset;
      const dayName = planDayName(absoluteDayIndex);
      const activity = activityMap[planner[dayKey]];
      return {
        absoluteDayIndex,
        date: addDays(PLAN_START_DATE, absoluteDayIndex),
        dayName,
        dayType: isWeekendName(dayName) ? "weekend" : "weekday",
        slot: dayKey,
        activityId: activity?.id || null,
        stat: activity?.stat || null,
        activityName: activity?.name || "No activity",
        baseGain: activity?.gain || 0,
        weekendMultiplier: isWeekendName(dayName) ? 2 : 1,
        rawRoll: Math.random(),
        applied: false,
        eventChoice: undefined,
        eventStarted: false
      };
    });
  }

  const originalFlashMessage = flashMessage;
  flashMessage = function (message) { originalFlashMessage(String(message || "").replace(/v0\.[78]\.0/g, `v${RELEASE_VERSION}`)); };

  const originalUpdateStatus = updateStatus;
  updateStatus = function () {
    originalUpdateStatus();
    $("versionLabel").textContent = `v${RELEASE_VERSION}`;
    $("menuVersionLabel").textContent = `v${RELEASE_VERSION}`;
  };

  selectStoryChoice = function (choice) {
    applyChoiceEffect(choice.effect || {});
    if (Array.isArray(choice.scenes) && choice.scenes.length) state.sceneQueue.splice(state.sceneIndex + 1, 0, ...clone(choice.scenes));
    advanceScene();
  };

  beginPrologue = function () {
    state.currentMode = "story";
    state.currentDate = { month: 9, day: 1 };
    state.day = "Sunday";
    state.dayIndex = 0;
    state.sceneQueue = clone(STORY.prologue);
    state.sceneIndex = 0;
    showScene(state.sceneQueue[0]);
  };

  ui.portraitPixel.style.gridTemplateColumns = "repeat(16, 1fr)";
  ui.portraitPixel.style.gridTemplateRows = "repeat(16, 1fr)";

  buildPixelSprite = function (character, emotion) {
    const size = 16;
    const grid = Array(size * size).fill("px-clear");
    const set = (x, y, token) => { if (x >= 0 && x < size && y >= 0 && y < size) grid[y * size + x] = token; };
    const fill = (x1, y1, x2, y2, token) => { for (let y = y1; y <= y2; y += 1) for (let x = x1; x <= x2; x += 1) set(x, y, token); };

    fill(3, 13, 12, 15, "px-clothes");
    fill(6, 11, 9, 13, "px-skin");
    fill(4, 4, 11, 11, "px-skin");
    fill(3, 6, 3, 9, "px-skin"); fill(12, 6, 12, 9, "px-skin");
    set(4, 10, "px-mouth"); set(11, 9, "px-mouth");

    const hair = {
      agnes: [[5,1,10,1],[3,2,12,4],[2,4,4,10],[11,4,13,10],[3,10,4,12],[11,10,12,12]],
      dorian: [[5,1,11,1],[3,2,12,3],[2,3,5,5],[10,3,13,5],[3,5,3,7]],
      ethan: [[4,1,11,1],[2,2,13,3],[2,4,5,5],[10,4,13,6],[3,6,3,8]],
      fern: [[4,1,11,1],[2,2,13,4],[1,4,3,11],[12,4,14,11],[2,11,4,13],[11,11,13,13]],
      mother: [[4,1,11,1],[2,2,13,4],[2,5,3,12],[12,5,13,12],[3,12,5,14],[10,12,12,14]],
      generic: [[4,1,11,2],[3,2,12,4],[3,4,4,6],[11,4,12,6]]
    };
    (hair[character] || hair.generic).forEach(([x1, y1, x2, y2]) => fill(x1, y1, x2, y2, "px-hair"));
    set(5, 6, "px-brow"); set(6, 6, "px-brow"); set(9, 6, "px-brow"); set(10, 6, "px-brow");
    set(5, 7, "px-white"); set(6, 7, "px-eye"); set(9, 7, "px-eye"); set(10, 7, "px-white");
    set(7, 9, "px-brow");
    if (emotion === "happy") { set(5, 7, "px-hair"); set(10, 7, "px-hair"); set(6, 10, "px-mouth"); set(9, 10, "px-mouth"); fill(7, 11, 8, 11, "px-mouth"); }
    else if (emotion === "sad" || emotion === "concerned") { set(5, 5, "px-brow"); set(10, 5, "px-brow"); fill(7, 10, 8, 10, "px-mouth"); set(6, 11, "px-mouth"); set(9, 11, "px-mouth"); }
    else if (["tense", "serious", "guarded"].includes(emotion)) { fill(5, 6, 6, 6, "px-brow"); fill(9, 6, 10, 6, "px-brow"); fill(6, 10, 9, 10, "px-mouth"); }
    else if (emotion === "afraid") { fill(5, 7, 6, 8, "px-white"); fill(9, 7, 10, 8, "px-white"); set(6, 8, "px-eye"); set(9, 8, "px-eye"); fill(7, 10, 8, 11, "px-mouth"); }
    else if (emotion === "nostalgic" || emotion === "gentle") { set(6, 10, "px-mouth"); set(9, 10, "px-mouth"); fill(7, 11, 8, 11, "px-mouth"); }
    else fill(7, 10, 8, 10, "px-mouth");
    return grid;
  };

  const oldPlannerGrid = ui.plannerScreen.querySelector(".planner-grid");
  if (oldPlannerGrid) {
    oldPlannerGrid.id = "plannerCalendar";
    Object.assign(oldPlannerGrid.style, { display: "grid", gridTemplateColumns: "repeat(7, minmax(120px, 1fr))", gap: "8px", overflowX: "auto", paddingBottom: "6px" });
  }
  const plannerCopy = ui.plannerScreen.querySelector(".modal-heading p");
  if (plannerCopy) plannerCopy.textContent = "Choose one activity for each day. Week 1 starts Monday, September 2.";

  function buildCalendarPlanner() {
    const calendar = $("plannerCalendar");
    calendar.innerHTML = "";
    PLAN_DAYS.forEach((dayKey, index) => {
      const column = document.createElement("section");
      Object.assign(column.style, { minWidth: "120px", border: "1px solid rgba(45,38,51,.14)", borderRadius: "10px", overflow: "hidden", background: ["saturday", "sunday"].includes(dayKey) ? "#fff7ea" : "rgba(255,255,255,.62)" });
      const date = addDays(PLAN_START_DATE, (state.week - 1) * WEEK_LENGTH + index);
      const heading = document.createElement("h3");
      heading.innerHTML = `<span>${capitalize(dayKey.slice(0, 3))}</span><small>${dateLabel(date)}</small>`;
      Object.assign(heading.style, { display: "grid", gap: "2px", margin: "0", padding: "9px 8px", textAlign: "center", fontSize: ".9rem", background: ["saturday", "sunday"].includes(dayKey) ? "#f0dfc9" : "#efe5e1" });
      const list = document.createElement("div");
      Object.assign(list.style, { display: "grid", gap: "5px", padding: "7px" });
      ACTIVITIES.forEach((activity) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "activity-btn calendar-activity-btn";
        btn.dataset.dayKey = dayKey;
        btn.dataset.activityId = activity.id;
        btn.innerHTML = `<strong>${activity.name}</strong><small>${activity.note}</small>`;
        Object.assign(btn.style, { minHeight: "48px", padding: "7px 8px" });
        btn.addEventListener("click", () => { state.planner[dayKey] = activity.id; renderPlannerSelection(); });
        list.appendChild(btn);
      });
      column.append(heading, list);
      calendar.appendChild(column);
    });
  }

  showPlannerView = function () {
    migrateStatePlanner();
    ui.plannerTitle.textContent = `Plan Week ${state.week}`;
    buildCalendarPlanner();
    renderPlannerSelection();
    ui.plannerScreen.classList.remove("hidden");
    updateStatus();
  };

  openPlanner = function (targetWeek) {
    clearResolutionTimer();
    state.currentMode = "planner";
    state.week = targetWeek;
    state.dayIndex = (targetWeek - 1) * WEEK_LENGTH;
    state.currentDate = addDays(PLAN_START_DATE, state.dayIndex);
    state.day = planDayName(state.dayIndex);
    state.plannerHistory = state.plannerHistory || {};
    const previous = state.plannerHistory[targetWeek - 1];
    state.planner = previous ? migratePlanner(previous) : (targetWeek > 1 ? migratePlanner(state.planner) : emptyPlanner());
    state.resolution = null;
    showPlannerView();
  };

  renderPlannerSelection = function () {
    $("plannerCalendar").querySelectorAll(".calendar-activity-btn").forEach((btn) => btn.classList.toggle("selected", state.planner[btn.dataset.dayKey] === btn.dataset.activityId));
    const ready = PLAN_DAYS.every((day) => Boolean(state.planner[day]));
    ui.beginWeek.disabled = !ready;
    if (!ready) {
      const remaining = PLAN_DAYS.filter((day) => !state.planner[day]).length;
      ui.plannerPreview.textContent = `Choose one activity for each day. ${remaining} day${remaining === 1 ? "" : "s"} remaining.`;
      return;
    }
    const copied = state.week > 1 && state.plannerHistory?.[state.week - 1] ? `Copied from Week ${state.week - 1}. ` : "";
    ui.plannerPreview.textContent = `${copied}All seven days are planned. Weekend positive gains remain ×2.`;
  };

  const originalBeginWeek = beginWeek;
  ui.beginWeek.removeEventListener("click", originalBeginWeek);
  beginWeek = function () {
    ui.plannerScreen.classList.add("hidden");
    migrateStatePlanner();
    state.plannerHistory[state.week] = clone(state.planner);
    state.resolution = { week: state.week, before: clone(state.stats), days: createPerDayResolution(state.week, state.planner), index: 0, skip: false, awaitingContinue: false, eventCounts: { major: 0, minor: 0 } };
    state.pendingSummary = null;
    state.currentMode = "resolving";
    processCurrentResolutionDay();
  };
  ui.beginWeek.addEventListener("click", beginWeek);

  birthdayEventChoice = function (day) {
    const event = STORY.events.minor.birthday;
    const counts = state.resolution?.eventCounts || { major: 0, minor: 0 };
    if (counts.minor >= WEEKLY_EVENT_LIMITS.minor) return null;
    return eventEligibleForActivity(event, day, day.activityId) ? { type: "minor", id: "birthday" } : null;
  };
  chooseEventForDay = function (day) { return birthdayEventChoice(day) || chooseTaggedEvent(day); };

  renderDailyResolution = function (day) {
    ui.resolutionTitle.textContent = `Week ${state.week} · Day ${state.resolution.index + 1} of 7`;
    ui.resolutionDate.textContent = `${dateLabel(day.date)} · ${day.dayName}`;
    ui.resolutionActivity.textContent = day.activityName;
    ui.resolutionOutcome.textContent = day.outcomeLabel;
    if (icon) {
      icon.textContent = window.GameCore.outcomeIcon(day.outcomeKey);
      icon.className = `resolution-icon outcome-${day.outcomeKey || "neutral"}`;
    }
    ui.resolutionGain.textContent = `${signedDelta(day.gain)} ${day.stat}`;
    ui.resolutionGain.classList.toggle("zero", day.gain === 0);
    ui.resolutionGain.classList.toggle("negative", day.gain < 0);
    renderResolutionProgress();
    ui.resolutionScreen.classList.remove("hidden");
    updateStatus();
  };

  const movingPixels = document.querySelector(".pixel-loading");
  if (movingPixels) movingPixels.remove();

  const originalStartNewGame = startNewGame;
  $("newGameMenuBtn").removeEventListener("click", originalStartNewGame);
  startNewGame = function () {
    clearResolutionTimer();
    state = initialState();
    state.planner = emptyPlanner();
    state.plannerHistory = {};
    state.currentDate = { month: 9, day: 1 };
    state.day = "Sunday";
    state.currentMode = "creator";
    hideAllModals();
    ui.creatorScreen.classList.remove("hidden");
    ui.speaker.textContent = "Narrator";
    ui.text.textContent = "Your story has not begun yet.";
    ui.choices.innerHTML = "";
    setPortrait(null);
    populateCreatorFromState();
    updateStatus();
  };
  $("newGameMenuBtn").addEventListener("click", startNewGame);

  const originalLoadGame = loadGame;
  loadGame = function (options = {}) {
    const ok = originalLoadGame(options);
    if (ok) { migrateStatePlanner(); restoreView(); updateStatus(); }
    return ok;
  };

  const originalShowMainMenu = showMainMenu;
  $("menuBtn").removeEventListener("click", originalShowMainMenu);
  showMainMenu = function () {
    originalShowMainMenu();
    $("menuVersionLabel").textContent = `v${RELEASE_VERSION}`;
  };
  $("menuBtn").addEventListener("click", showMainMenu);

  tagEvents();
  migrateStatePlanner();
  updateStatus();
})();
