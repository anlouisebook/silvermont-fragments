"use strict";
(function () {
  const base = window.GameCore;
  const VERSION = "0.9.0";
  const SAVE_KEY = "silvermont_fragments_save_v0_9_0";
  const PROLOGUE_DATE = Object.freeze({ month: 9, day: 1 });
  const START_DATE = Object.freeze({ month: 9, day: 2 });
  const START_DAY_NAME = "Monday";
  const PLANNER_DAYS = Object.freeze(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]);

  function emptyPlanner() {
    return Object.fromEntries(PLANNER_DAYS.map((day) => [day, null]));
  }

  function initialState() {
    const state = base.initialState();
    state.version = VERSION;
    state.day = "Sunday";
    state.dayIndex = 0;
    state.currentDate = { ...PROLOGUE_DATE };
    state.planner = emptyPlanner();
    state.plannerHistory = {};
    return state;
  }

  function dayNameForOffset(offset) {
    const names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return names[((Number(offset) % 7) + 7) % 7];
  }

  function activitySlotForDay(dayName) {
    return String(dayName || "").toLowerCase();
  }

  function eventActivityEligible(event, activityId) {
    const tags = Array.isArray(event?.activityTags) && event.activityTags.length ? event.activityTags : ["any"];
    return tags.includes("any") || Boolean(activityId && tags.includes(activityId));
  }

  function eventEligible(event, state, dayIndex, currentDate, activityId = null) {
    if (!event || state.eventHistory?.includes(event.id)) return false;
    if (Number(dayIndex) < Number(event.minDay ?? 0)) return false;
    if (Number(dayIndex) > Number(event.maxDay ?? Infinity)) return false;
    if (!base.eventDayTypeEligible(event, dayNameForOffset(dayIndex))) return false;
    if (!eventActivityEligible(event, activityId)) return false;
    if (!base.eventRequirementMet(event, state)) return false;
    if (event.special === "birthday") return !state.birthdayCelebrated && base.sameDate(state.birthday, currentDate);
    return true;
  }

  function chooseDailyStoryEvent(
    majorEvents, minorEvents, state, dayIndex, currentDate,
    randomFn = Math.random,
    weeklyCounts = { major: 0, minor: 0 },
    limits = base.WEEKLY_EVENT_LIMITS,
    activityId = null
  ) {
    if (base.underWeeklyLimit("major", weeklyCounts, limits)) {
      const majors = Object.values(majorEvents || {})
        .filter((event) => eventEligible(event, state, dayIndex, currentDate, activityId))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      if (majors.length) {
        const overdue = majors.find((event) => Number(dayIndex) >= Number(event.guaranteedBy ?? Infinity));
        if (overdue) return { type: "major", id: overdue.id };
        const candidate = majors[0];
        if (Number(randomFn()) < Number(candidate.chance ?? 0)) return { type: "major", id: candidate.id };
      }
    }
    if (!base.underWeeklyLimit("minor", weeklyCounts, limits)) return null;
    const minors = Object.values(minorEvents || {})
      .filter((event) => eventEligible(event, state, dayIndex, currentDate, activityId));
    if (!minors.length) return null;
    const triggerRoll = Number(randomFn());
    const eligibleByChance = minors.filter((event) => triggerRoll < Number(event.chance ?? 0));
    if (!eligibleByChance.length) return null;
    const index = Math.min(eligibleByChance.length - 1, Math.floor(Number(randomFn()) * eligibleByChance.length));
    return { type: "minor", id: eligibleByChance[index].id };
  }

  function createWeekResolution(weekNumber, planner, activities, randomFn = Math.random) {
    const firstDayIndex = (Number(weekNumber) - 1) * base.WEEK_LENGTH;
    const activityMap = Object.fromEntries((activities || []).map((activity) => [activity.id, activity]));
    const days = [];
    for (let offset = 0; offset < base.WEEK_LENGTH; offset += 1) {
      const absoluteDayIndex = firstDayIndex + offset;
      const dayName = dayNameForOffset(absoluteDayIndex);
      const slot = activitySlotForDay(dayName);
      const activity = activityMap[planner?.[slot]];
      const weekendMultiplier = ["Saturday", "Sunday"].includes(dayName) ? 2 : 1;
      days.push({
        absoluteDayIndex,
        date: base.addDays(START_DATE, absoluteDayIndex),
        dayName,
        dayType: base.dayTypeForDayName(dayName),
        slot,
        activityId: activity?.id || null,
        stat: activity?.stat || null,
        activityName: activity?.name || "No activity",
        baseGain: activity?.gain || 0,
        weekendMultiplier,
        rawRoll: Number(randomFn()),
        applied: false,
        eventChoice: undefined,
        eventStarted: false
      });
    }
    return days;
  }

  function copyPlannerFromPreviousWeek(targetWeek, plannerHistory = {}, currentPlanner = null) {
    const previous = plannerHistory?.[Number(targetWeek) - 1];
    if (previous) return base.clone(previous);
    if (Number(targetWeek) > 1 && currentPlanner && PLANNER_DAYS.every((day) => Boolean(currentPlanner[day]))) return base.clone(currentPlanner);
    return emptyPlanner();
  }

  window.GameCore = {
    ...base,
    VERSION, SAVE_KEY, PROLOGUE_DATE, START_DATE, START_DAY_NAME, PLANNER_DAYS,
    initialState, dayNameForOffset, activitySlotForDay,
    eventActivityEligible, eventEligible, chooseDailyStoryEvent,
    createWeekResolution, emptyPlanner, copyPlannerFromPreviousWeek
  };
})();
