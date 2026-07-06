"use strict";
(function () {
  const VERSION = "0.12.0";
  const PLAN_START = Object.freeze({ month: 9, day: 2 });
  const PLAN_DAYS = Object.freeze(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]);
  const DAY_NAMES = Object.freeze(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
  const CLUBS = Object.freeze({
    scholars: Object.freeze({ name: "Scholars Society", day: "Wednesday", stat: "Intelligence", baseGain: 2, activityId: "study", members: ["fern"] }),
    creatives: Object.freeze({ name: "Creative Arts Club", day: "Thursday", stat: "Creativity", baseGain: 2, activityId: "create", members: [] }),
    athletics: Object.freeze({ name: "Athletics Club", day: "Friday", stat: "Fitness", baseGain: 2, activityId: "exercise", members: [] })
  });
  const CLUB_FIRST_EVENTS = Object.freeze({ scholars: "scholars_first_meeting", creatives: "creatives_first_meeting", athletics: "athletics_first_meeting" });
  const EVENT_CHAINS = Object.freeze({
    ethan_intro_chain: Object.freeze(["ethan_playground_intro", "ethan_second_meeting", "ethan_playground_friendship"]),
    fern_intro_chain: Object.freeze(["fern_school_intro", "fern_shared_notes", "fern_library_promise"]),
    home_guardian_chain: Object.freeze(["home_family_breakfast", "dorian_desk_light", "agnes_evening_tea"]),
    accident_fragments_chain: Object.freeze(["mystery_necklace_echo", "mystery_broken_glass_flash", "mystery_hospital_record_gap"]),
    club_intro_chain: Object.freeze(["club_fair", Object.freeze(["scholars_first_meeting", "creatives_first_meeting", "athletics_first_meeting"])])
  });
  const POSITIVE_GAIN_TRAITS = Object.freeze({ Studious: ["study"], Sociable: ["socialize"], Creative: ["create"], Athletic: ["exercise"], Compassionate: ["help"] });
  const NEGATIVE_GAIN_TRAITS = Object.freeze({ Shy: ["socialize"], Impulsive: ["study"], Stubborn: ["help"], Sensitive: ["exercise"], Distractible: ["study", "create"] });
  const PERSONALITY_GAINS = Object.freeze({
    Calm: Object.freeze({ help: 1 }),
    Anxious: Object.freeze({ study: 1, socialize: -1 }),
    Guarded: Object.freeze({ study: 1, socialize: -1 }),
    Curious: Object.freeze({ study: 1, create: 1 })
  });

  function cloneSafe(value) { return JSON.parse(JSON.stringify(value)); }
  function allEvents() { return { ...STORY.events.major, ...STORY.events.minor }; }
  function eventById(id) { return STORY.events.major[id] || STORY.events.minor[id] || null; }
  function choiceType(id) { return STORY.events.major[id] ? "major" : "minor"; }
  function dayNameForIndex(index) { return DAY_NAMES[((Number(index) % 7) + 7) % 7]; }
  function dayKeyForName(name) { return String(name || "").toLowerCase(); }

  function ensureV012State() {
    state.eventChains = state.eventChains && typeof state.eventChains === "object" ? state.eventChains : {};
    state.missedEvents = Array.isArray(state.missedEvents) ? state.missedEvents : [];
    state.clubId = Object.prototype.hasOwnProperty.call(state, "clubId") ? state.clubId : null;
    state.clubAttendance = state.clubAttendance && typeof state.clubAttendance === "object" ? state.clubAttendance : {};
    state.flags = state.flags || {};
  }

  function toast(message) {
    let node = document.getElementById("v012Toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "v012Toast";
      Object.assign(node.style, { position: "fixed", left: "50%", bottom: "24px", transform: "translateX(-50%)", zIndex: "20000", padding: "10px 14px", borderRadius: "10px", background: "rgba(255,250,247,.97)", color: "#2d2633", boxShadow: "0 8px 28px rgba(45,38,51,.2)", border: "1px solid rgba(45,38,51,.18)" });
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { node.hidden = true; }, 2500);
  }

  // Continue modal bug: keep load slots above the menu and hide the menu while loading.
  const systemPanel = document.getElementById("systemPanel");
  const mainMenu = document.getElementById("mainMenuScreen");
  if (systemPanel) {
    systemPanel.style.zIndex = "15000";
    const syncLoadPanel = () => {
      const visible = !systemPanel.classList.contains("hidden");
      const isLoad = document.getElementById("systemPanelTitle")?.textContent === "Load Game";
      if (visible && isLoad && mainMenu && !mainMenu.classList.contains("hidden")) {
        mainMenu.dataset.hiddenForLoadSlots = "1";
        mainMenu.classList.add("hidden");
      } else if (!visible && mainMenu?.dataset.hiddenForLoadSlots === "1") {
        delete mainMenu.dataset.hiddenForLoadSlots;
        if (state.currentMode === "menu") mainMenu.classList.remove("hidden");
      }
    };
    new MutationObserver(syncLoadPanel).observe(systemPanel, { attributes: true, attributeFilter: ["class"] });
  }

  // Event chain metadata.
  const chainTags = {
    ethan_playground_intro: ["ethan_intro_chain", 0],
    ethan_second_meeting: ["ethan_intro_chain", 1],
    ethan_playground_friendship: ["ethan_intro_chain", 2],
    fern_school_intro: ["fern_intro_chain", 0],
    fern_shared_notes: ["fern_intro_chain", 1],
    fern_library_promise: ["fern_intro_chain", 2],
    home_family_breakfast: ["home_guardian_chain", 0],
    dorian_desk_light: ["home_guardian_chain", 1],
    agnes_evening_tea: ["home_guardian_chain", 2],
    mystery_necklace_echo: ["accident_fragments_chain", 0],
    mystery_broken_glass_flash: ["accident_fragments_chain", 1],
    mystery_hospital_record_gap: ["accident_fragments_chain", 2],
    club_fair: ["club_intro_chain", 0],
    scholars_first_meeting: ["club_intro_chain", 1],
    creatives_first_meeting: ["club_intro_chain", 1],
    athletics_first_meeting: ["club_intro_chain", 1]
  };
  Object.entries(chainTags).forEach(([id, [chainId, chainStep]]) => {
    const event = eventById(id);
    if (event) { event.chainId = chainId; event.chainStep = chainStep; }
  });

  if (STORY.events.minor.club_fair) STORY.events.minor.club_fair.prerequisiteEvents = ["fern_school_intro"];
  Object.entries(CLUB_FIRST_EVENTS).forEach(([clubId, eventId]) => {
    const event = STORY.events.minor[eventId];
    if (!event) return;
    event.clubTags = [clubId];
    event.activityTags = ["any"];
    event.missableOnSkip = true;
    event.chance = 1;
  });

  function completedStep(step) {
    if (Array.isArray(step)) return step.some((id) => state.eventHistory?.includes(id));
    return state.eventHistory?.includes(step);
  }
  function chainReady(event) {
    if (!event?.chainId) return true;
    const chain = EVENT_CHAINS[event.chainId];
    if (!chain) return true;
    const step = Number(event.chainStep || 0);
    if (step <= 0) return true;
    return completedStep(chain[step - 1]);
  }
  function prerequisitesReady(event) {
    return (event?.prerequisiteEvents || []).every((id) => state.eventHistory?.includes(id));
  }
  function syncChainProgress() {
    ensureV012State();
    Object.entries(EVENT_CHAINS).forEach(([chainId, chain]) => {
      let completed = 0;
      chain.forEach((step) => { if (completedStep(step)) completed += 1; });
      state.eventChains[chainId] = { completedSteps: completed, totalSteps: chain.length };
    });
  }
  window.SilvermontEventChains = { definitions: EVENT_CHAINS, progress: () => cloneSafe(state.eventChains || {}) };

  // Club membership and attendance.
  function attendanceKey(week, dayKey) { return `${Number(week)}:${dayKey}`; }
  function meetingAttendance(week, clubId) {
    const club = CLUBS[clubId];
    if (!club) return "skip";
    const key = attendanceKey(week, dayKeyForName(club.day));
    if (!state.clubAttendance[key]) state.clubAttendance[key] = "attend";
    return state.clubAttendance[key];
  }
  function setMeetingAttendance(week, clubId, value) {
    const club = CLUBS[clubId];
    if (!club) return;
    state.clubAttendance[attendanceKey(week, dayKeyForName(club.day))] = value;
  }
  function applyClubJoin(clubId) {
    ensureV012State();
    state.clubId = clubId && CLUBS[clubId] ? clubId : null;
    state.flags.club_fair_complete = true;
    if (state.clubId) {
      setMeetingAttendance(state.week, state.clubId, "attend");
      toast(`Joined ${CLUBS[state.clubId].name}.`);
      updateFutureClubDay();
    } else {
      toast("You chose not to join a club.");
    }
  }
  function updateFutureClubDay() {
    if (!state.clubId || !state.resolution?.days) return;
    const club = CLUBS[state.clubId];
    const day = state.resolution.days.find((item, index) => item.dayName === club.day && index >= state.resolution.index);
    if (!day || meetingAttendance(state.week, state.clubId) !== "attend") return;
    day.clubId = state.clubId;
    day.clubAttending = true;
    day.activityId = `club:${state.clubId}`;
    day.activityName = club.name;
    day.stat = club.stat;
    day.baseGain = club.baseGain;
    day.weekendMultiplier = 1;
  }

  const priorApplyChoiceEffect = applyChoiceEffect;
  applyChoiceEffect = function (effect = {}) {
    priorApplyChoiceEffect(effect);
    if (Object.prototype.hasOwnProperty.call(effect, "clubJoin")) applyClubJoin(effect.clubJoin);
  };

  function syncClubPlannerUi() {
    ensureV012State();
    const calendar = document.getElementById("plannerCalendar");
    if (!calendar || !state.clubId) return;
    const club = CLUBS[state.clubId];
    const dayKey = dayKeyForName(club.day);
    const index = PLAN_DAYS.indexOf(dayKey);
    const column = calendar.children[index];
    if (!column) return;
    let controls = column.querySelector(".club-meeting-controls");
    if (!controls) {
      controls = document.createElement("div");
      controls.className = "club-meeting-controls";
      Object.assign(controls.style, { margin: "6px", padding: "7px", borderRadius: "8px", background: "rgba(200,150,88,.13)", border: "1px solid rgba(200,150,88,.35)" });
      const heading = column.querySelector("h3");
      if (heading) heading.after(controls); else column.prepend(controls);
    }
    const mode = meetingAttendance(state.week, state.clubId);
    controls.innerHTML = `<strong style="display:block;font-size:.75rem">${club.name}</strong><small style="display:block;margin:3px 0 6px">Club meeting</small><button type="button" class="ghost-btn club-attend-btn" style="padding:5px 7px">Attend</button> <button type="button" class="ghost-btn club-skip-btn" style="padding:5px 7px">Skip</button>`;
    controls.querySelector(".club-attend-btn").classList.toggle("selected", mode === "attend");
    controls.querySelector(".club-skip-btn").classList.toggle("selected", mode === "skip");
    controls.querySelector(".club-attend-btn").onclick = () => { setMeetingAttendance(state.week, state.clubId, "attend"); state.planner[dayKey] = `club:${state.clubId}`; renderPlannerSelection(); };
    controls.querySelector(".club-skip-btn").onclick = () => { setMeetingAttendance(state.week, state.clubId, "skip"); if (String(state.planner[dayKey] || "").startsWith("club:")) state.planner[dayKey] = null; renderPlannerSelection(); };

    const attending = mode === "attend";
    column.querySelectorAll(".calendar-activity-btn").forEach((button) => { button.disabled = attending; button.style.opacity = attending ? ".42" : "1"; });
    if (attending) state.planner[dayKey] = `club:${state.clubId}`;
  }

  const priorShowPlannerView = showPlannerView;
  showPlannerView = function () { priorShowPlannerView(); syncClubPlannerUi(); };
  const priorRenderPlannerSelection = renderPlannerSelection;
  renderPlannerSelection = function () {
    priorRenderPlannerSelection();
    syncClubPlannerUi();
    if (state.clubId) {
      const club = CLUBS[state.clubId];
      const mode = meetingAttendance(state.week, state.clubId);
      if (mode === "attend") ui.plannerPreview.textContent += ` ${club.day}: ${club.name} meeting replaces the normal activity.`;
      else ui.plannerPreview.textContent += ` ${club.day}: club meeting skipped; choose a normal activity. Missable club events may be lost.`;
    }
  };

  function buildResolutionDays(weekNumber) {
    const firstIndex = (Number(weekNumber) - 1) * 7;
    const activityMap = Object.fromEntries(ACTIVITIES.map((activity) => [activity.id, activity]));
    return PLAN_DAYS.map((dayKey, offset) => {
      const absoluteDayIndex = firstIndex + offset;
      const dayName = dayNameForIndex(absoluteDayIndex);
      const selected = state.planner[dayKey];
      const clubId = String(selected || "").startsWith("club:") ? String(selected).slice(5) : null;
      const club = clubId ? CLUBS[clubId] : null;
      const activity = club ? null : activityMap[selected];
      return {
        absoluteDayIndex,
        date: addDays(PLAN_START, absoluteDayIndex),
        dayName,
        dayType: ["Saturday", "Sunday"].includes(dayName) ? "weekend" : "weekday",
        slot: dayKey,
        activityId: club ? `club:${clubId}` : activity?.id || null,
        clubId: clubId || null,
        clubAttending: Boolean(club),
        stat: club ? club.stat : activity?.stat || null,
        activityName: club ? club.name : activity?.name || "No activity",
        baseGain: club ? club.baseGain : activity?.gain || 0,
        weekendMultiplier: club ? 1 : (["Saturday", "Sunday"].includes(dayName) ? 2 : 1),
        rawRoll: Math.random(),
        applied: false,
        eventChoice: undefined,
        eventStarted: false
      };
    });
  }

  function markSkippedClubEvents() {
    ensureV012State();
    if (!state.clubId || meetingAttendance(state.week, state.clubId) !== "skip") return;
    const eventId = CLUB_FIRST_EVENTS[state.clubId];
    const event = eventById(eventId);
    if (event?.missableOnSkip && !state.eventHistory.includes(eventId) && chainReady(event)) {
      if (!state.missedEvents.includes(eventId)) state.missedEvents.push(eventId);
    }
  }

  ui.beginWeek.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    ensureV012State();
    markSkippedClubEvents();
    ui.plannerScreen.classList.add("hidden");
    state.plannerHistory = state.plannerHistory || {};
    state.plannerHistory[state.week] = cloneSafe(state.planner);
    state.resolution = { week: state.week, before: cloneSafe(state.stats), days: buildResolutionDays(state.week), index: 0, skip: false, awaitingContinue: false, eventCounts: { major: 0, minor: 0 } };
    state.pendingSummary = null;
    state.currentMode = "resolving";
    processCurrentResolutionDay();
  }, true);

  // Trait and personality modifiers affect the actual gain, not only outcome chance.
  function gainActivityId(day) {
    if (day.clubId && CLUBS[day.clubId]) return CLUBS[day.clubId].activityId;
    return day.activityId;
  }
  function statGainModifier(activityId) {
    let amount = 0;
    (state.positiveTraits || []).forEach((trait) => { if (POSITIVE_GAIN_TRAITS[trait]?.includes(activityId)) amount += 1; });
    (state.negativeTraits || []).forEach((trait) => { if (NEGATIVE_GAIN_TRAITS[trait]?.includes(activityId)) amount -= 1; });
    amount += Number(PERSONALITY_GAINS[state.emotionalState]?.[activityId] || 0);
    return amount;
  }
  calculateDayResult = function (day) {
    const activityId = gainActivityId(day);
    const adjustedRoll = applyTraitRollModifier(day.rawRoll, activityId, state.positiveTraits, state.negativeTraits, state.emotionalState);
    const outcome = rollOutcomeFromNumber(adjustedRoll);
    const modifierDirection = adjustedRoll < day.rawRoll ? "helped" : adjustedRoll > day.rawRoll ? "hindered" : "neutral";
    if (outcome.key === "failure") return { adjustedRoll, outcomeKey: outcome.key, outcomeLabel: outcome.label, gain: -1, modifierDirection, statGainModifier: 0 };
    const modifier = statGainModifier(activityId);
    const beforeWeekend = Math.max(0, Math.round(Number(day.baseGain || 0) * Number(outcome.multiplier || 1) + modifier));
    const gain = beforeWeekend * Number(day.weekendMultiplier || 1);
    return { adjustedRoll, outcomeKey: outcome.key, outcomeLabel: outcome.label, gain, modifierDirection, statGainModifier: modifier };
  };

  const priorApplyDailyResult = applyDailyResult;
  applyDailyResult = function (day) {
    priorApplyDailyResult(day);
    if (!day.clubAttending || day.clubRelationshipApplied || !day.clubId) return;
    const club = CLUBS[day.clubId];
    (club?.members || []).forEach((member) => { state.relationships[member] = Number(state.relationships[member] || 0) + 1; });
    day.clubRelationshipApplied = true;
  };

  // Event eligibility and chain ordering.
  function activityEligible(event, day) {
    const tags = event?.activityTags?.length ? event.activityTags : ["any"];
    if (tags.includes("any")) return true;
    return tags.includes(gainActivityId(day));
  }
  function clubEligible(event, day) {
    if (!event?.clubTags?.length) return true;
    return Boolean(day.clubAttending && day.clubId && event.clubTags.includes(day.clubId));
  }
  function eventAllowed(event, day) {
    ensureV012State();
    if (!event || state.eventHistory?.includes(event.id) || state.missedEvents.includes(event.id)) return false;
    if (!event.triggerDate && Number(day.absoluteDayIndex) < Number(event.minDay ?? 0)) return false;
    if (!event.triggerDate && Number(day.absoluteDayIndex) > Number(event.maxDay ?? Infinity)) return false;
    if (!window.GameCore.eventDayTypeEligible(event, day.dayName)) return false;
    if (!activityEligible(event, day) || !clubEligible(event, day)) return false;
    if (!window.GameCore.eventRequirementMet(event, state)) return false;
    if (!prerequisitesReady(event) || !chainReady(event)) return false;
    return true;
  }
  function toOrdinalSafe(date) {
    const md = [31,29,31,30,31,30,31,31,30,31,30,31];
    let total = Number(date?.day || 0);
    for (let month = 1; month < Number(date?.month || 1); month += 1) total += md[month - 1];
    return total;
  }
  function dueExactEvent(day) {
    return Object.values(allEvents()).filter((event) => event.triggerDate && eventAllowed(event, day) && toOrdinalSafe(day.date) >= toOrdinalSafe(event.triggerDate))
      .sort((a, b) => toOrdinalSafe(a.triggerDate) - toOrdinalSafe(b.triggerDate))[0] || null;
  }
  function readyChainEvent(day) {
    const priorities = { accident_fragments_chain: 100, club_intro_chain: 80, ethan_intro_chain: 60, fern_intro_chain: 60, home_guardian_chain: 40 };
    const candidates = Object.values(allEvents()).filter((event) => event.chainId && !event.triggerDate && eventAllowed(event, day));
    const roll = Math.random();
    return candidates.filter((event) => roll < Number(event.chance ?? 0)).sort((a, b) => Number(priorities[b.chainId] || 0) - Number(priorities[a.chainId] || 0) || Number(a.chainStep || 0) - Number(b.chainStep || 0))[0] || null;
  }

  const priorChooseEventForDay = chooseEventForDay;
  chooseEventForDay = function (day) {
    ensureV012State();
    if (Number(state.week) === 1) {
      const choice = priorChooseEventForDay(day);
      const event = choice ? eventById(choice.id) : null;
      return event && eventAllowed(event, day) ? choice : null;
    }

    const exact = dueExactEvent(day);
    if (exact) {
      const counts = state.resolution?.eventCounts || { major: 0, minor: 0 };
      const type = choiceType(exact.id);
      if (Number(counts[type] || 0) < Number(WEEKLY_EVENT_LIMITS[type])) return { type, id: exact.id };
    }

    if (day.clubAttending && day.clubId) {
      const firstId = CLUB_FIRST_EVENTS[day.clubId];
      const first = eventById(firstId);
      const counts = state.resolution?.eventCounts || { major: 0, minor: 0 };
      if (first && eventAllowed(first, day) && Number(counts.minor || 0) < WEEKLY_EVENT_LIMITS.minor) return { type: "minor", id: firstId };
    }

    const chainEvent = readyChainEvent(day);
    if (chainEvent) {
      const type = choiceType(chainEvent.id);
      const counts = state.resolution?.eventCounts || { major: 0, minor: 0 };
      if (Number(counts[type] || 0) < Number(WEEKLY_EVENT_LIMITS[type])) return { type, id: chainEvent.id };
    }

    const choice = priorChooseEventForDay(day);
    if (!choice) return null;
    const event = eventById(choice.id);
    return eventAllowed(event, day) ? choice : null;
  };

  const priorCompleteActiveEvent = completeActiveEvent;
  completeActiveEvent = function () {
    const completedId = state.activeEvent?.id || null;
    priorCompleteActiveEvent();
    if (completedId) syncChainProgress();
  };

  // Version and debug exposure.
  ensureV012State();
  syncChainProgress();
  window.SilvermontClubs = { definitions: CLUBS, current: () => state.clubId, attendance: () => cloneSafe(state.clubAttendance || {}) };
  if (window.SilvermontDebug?.registerTool) {
    window.SilvermontDebug.registerTool("Show Chain State", () => toast(JSON.stringify(state.eventChains || {})));
    window.SilvermontDebug.registerTool("Clear Club Membership", () => { state.clubId = null; toast("Club membership cleared."); });
  }

  const priorUpdateStatus = updateStatus;
  updateStatus = function () {
    priorUpdateStatus();
    document.getElementById("versionLabel").textContent = `v${VERSION}`;
    document.getElementById("menuVersionLabel").textContent = `v${VERSION}`;
  };
  updateStatus();
})();
