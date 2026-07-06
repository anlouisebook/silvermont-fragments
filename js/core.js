(function () {
  "use strict";

  const VERSION = "0.7.0";
  const SAVE_KEY = "silvermont_fragments_save_v0_7_0";
  const START_DATE = Object.freeze({ month: 9, day: 1 });
  const START_DAY_NAME = "Sunday";
  const SLICE_WEEKS = 4;
  const WEEK_LENGTH = 7;
  const BASE_TRAIT_POINTS = 3;
  const MAX_NEGATIVE_TRAITS = 2;
  const MAX_TRAIT_ROLL_SHIFT = 0.10;
  const WEEKLY_EVENT_LIMITS = Object.freeze({ major: 1, minor: 2 });
  const BIRTHDAY_BONUS = Object.freeze({ Charisma: 1, Kindness: 1 });
  const DAY_NAMES = Object.freeze(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);

  const PRONOUNS = Object.freeze({
    she: Object.freeze({ subject: "she", object: "her", possessiveDeterminer: "her", possessivePronoun: "hers", reflexive: "herself" }),
    he: Object.freeze({ subject: "he", object: "him", possessiveDeterminer: "his", possessivePronoun: "his", reflexive: "himself" }),
    they: Object.freeze({ subject: "they", object: "them", possessiveDeterminer: "their", possessivePronoun: "theirs", reflexive: "themself" })
  });

  const POSITIVE_TRAITS = Object.freeze({
    Studious: Object.freeze({ activities: ["study"] }),
    Sociable: Object.freeze({ activities: ["socialize"] }),
    Creative: Object.freeze({ activities: ["create"] }),
    Athletic: Object.freeze({ activities: ["exercise"] }),
    Compassionate: Object.freeze({ activities: ["help"] })
  });

  const NEGATIVE_TRAITS = Object.freeze({
    Shy: Object.freeze({ activities: ["socialize"] }),
    Impulsive: Object.freeze({ activities: ["study"] }),
    Stubborn: Object.freeze({ activities: ["help"] }),
    Sensitive: Object.freeze({ activities: ["exercise"] }),
    Distractible: Object.freeze({ activities: ["study", "create"] })
  });

  const EMOTIONAL_STATES = Object.freeze(["Calm", "Anxious", "Guarded", "Curious"]);

  function initialState() {
    return {
      version: VERSION,
      firstName: "Lilianna",
      nickname: "Lili",
      surname: "Evans",
      canonGender: "female",
      hiddenBackScar: true,
      pronounsKey: "she",
      birthday: { month: 9, day: 1 },
      appearance: {
        hairColor: "Dark Brown",
        hairStyle: "Shoulder-length",
        eyeColor: "Brown",
        skinTone: "Medium",
        heightImpression: "Average",
        buildImpression: "Average"
      },
      emotionalState: "Calm",
      positiveTraits: [],
      negativeTraits: [],
      traitPointsRemaining: BASE_TRAIT_POINTS,
      age: 8,
      week: 0,
      day: START_DAY_NAME,
      dayIndex: 0,
      currentDate: { ...START_DATE },
      sceneQueue: [],
      sceneIndex: 0,
      currentMode: "menu",
      activeEvent: null,
      stats: {
        Intelligence: 1,
        Fitness: 1,
        Charisma: 1,
        Creativity: 1,
        Kindness: 1
      },
      relationships: {
        ethan: 0,
        fern: 0,
        agnes: 0,
        dorian: 0
      },
      flags: {},
      eventHistory: [],
      planner: { weekday: null, saturday: null, sunday: null },
      plannerHistory: {},
      resolution: null,
      pendingSummary: null,
      history: [],
      birthdayCelebrated: false,
      finished: false
    };
  }

  function clone(data) { return JSON.parse(JSON.stringify(data)); }
  function normalizeFirstName(value) { return String(value || "").trim() || "Lilianna"; }
  function pronounSet(key) { return PRONOUNS[key] || PRONOUNS.she; }

  // Balanced outcome table: 15% great, 65% success, 20% failure.
  function rollOutcomeFromNumber(roll) {
    if (roll < 0.15) return { key: "great", label: "Great success", multiplier: 1.5, penalty: 0 };
    if (roll < 0.80) return { key: "success", label: "Success", multiplier: 1, penalty: 0 };
    return { key: "failure", label: "Failure", multiplier: 0, penalty: -1 };
  }

  function calculateActivityGain(baseGain, days, weekendMultiplier, outcomeMultiplier) {
    return Math.round(Number(baseGain) * Number(days) * Number(weekendMultiplier) * Number(outcomeMultiplier));
  }

  function calculateActivityDelta(baseGain, weekendMultiplier, outcome) {
    if (outcome?.key === "failure") return -1;
    return calculateActivityGain(baseGain, 1, weekendMultiplier, outcome?.multiplier ?? 1);
  }

  function clampRoll(value) { return Math.max(0, Math.min(0.9999, Number(value))); }

  function applyTraitRollModifier(roll, activityId, positiveTraits = [], negativeTraits = [], emotionalState = "Calm") {
    let shift = 0;
    positiveTraits.forEach((trait) => {
      if (POSITIVE_TRAITS[trait]?.activities.includes(activityId)) shift -= 0.05;
    });
    negativeTraits.forEach((trait) => {
      if (NEGATIVE_TRAITS[trait]?.activities.includes(activityId)) shift += 0.05;
    });
    if (emotionalState === "Calm") shift -= 0.02;
    if (emotionalState === "Anxious") shift += 0.03;
    if (emotionalState === "Curious" && ["study", "create"].includes(activityId)) shift -= 0.03;
    const cappedShift = Math.max(-MAX_TRAIT_ROLL_SHIFT, Math.min(MAX_TRAIT_ROLL_SHIFT, shift));
    return clampRoll(Number(roll) + cappedShift);
  }

  function traitBudget(positiveTraits = [], negativeTraits = []) {
    return BASE_TRAIT_POINTS + negativeTraits.length - positiveTraits.length;
  }

  function isValidTraitSelection(positiveTraits = [], negativeTraits = []) {
    return negativeTraits.length <= MAX_NEGATIVE_TRAITS && traitBudget(positiveTraits, negativeTraits) >= 0;
  }

  function portraitKey(character, emotion) {
    const safeCharacter = String(character || "generic").toLowerCase().replace(/[^a-z0-9-]/g, "");
    const safeEmotion = String(emotion || "neutral").toLowerCase().replace(/[^a-z0-9-]/g, "");
    return `pixel-${safeCharacter} emotion-${safeEmotion}`;
  }

  function historyEntry(speaker, text) { return { speaker: speaker || "Narrator", text: text || "" }; }

  function daysInMonth(month) {
    const monthNumber = Number(month);
    return [1, 3, 5, 7, 8, 10, 12].includes(monthNumber) ? 31
      : [4, 6, 9, 11].includes(monthNumber) ? 30
        : monthNumber === 2 ? 29
          : 30;
  }

  function toOrdinal(date) {
    let total = Number(date.day);
    for (let month = 1; month < Number(date.month); month += 1) total += daysInMonth(month);
    return total;
  }

  function fromOrdinal(ordinal) {
    const yearDays = 366;
    let remaining = ((Number(ordinal) - 1) % yearDays + yearDays) % yearDays + 1;
    let month = 1;
    while (remaining > daysInMonth(month)) {
      remaining -= daysInMonth(month);
      month += 1;
    }
    return { month, day: remaining };
  }

  function addDays(date, amount) { return fromOrdinal(toOrdinal(date) + Number(amount)); }

  function birthdayInRange(birthday, startDate, lengthDays) {
    const start = toOrdinal(startDate);
    const end = start + Number(lengthDays) - 1;
    let birthdayOrdinal = toOrdinal(birthday);
    if (birthdayOrdinal < start) birthdayOrdinal += 366;
    return birthdayOrdinal >= start && birthdayOrdinal <= end;
  }

  function sameDate(a, b) {
    return Number(a?.month) === Number(b?.month) && Number(a?.day) === Number(b?.day);
  }

  function dateLabel(date) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${months[Number(date.month) - 1]} ${Number(date.day)}`;
  }

  function dayNameForOffset(offset) {
    const startIndex = DAY_NAMES.indexOf(START_DAY_NAME);
    return DAY_NAMES[(startIndex + Number(offset)) % DAY_NAMES.length];
  }

  function activitySlotForDay(dayName) {
    if (dayName === "Saturday") return "saturday";
    if (dayName === "Sunday") return "sunday";
    return "weekday";
  }

  function dayTypeForDayName(dayName) {
    return ["Saturday", "Sunday"].includes(dayName) ? "weekend" : "weekday";
  }

  function eventDayTypeEligible(event, dayName) {
    const tag = String(event?.dayType || "both").toLowerCase();
    return tag === "both" || tag === dayTypeForDayName(dayName);
  }

  function eventRequirementMet(event, state) {
    const requirements = event.requirements || {};
    if ((requirements.flagsAll || []).some((flag) => !state.flags?.[flag])) return false;
    if ((requirements.flagsNone || []).some((flag) => state.flags?.[flag])) return false;
    if (requirements.flagsAny?.length && !requirements.flagsAny.some((flag) => state.flags?.[flag])) return false;
    if (requirements.positiveTraitsAny?.length && !requirements.positiveTraitsAny.some((trait) => state.positiveTraits?.includes(trait))) return false;
    if (requirements.emotionalStates?.length && !requirements.emotionalStates.includes(state.emotionalState)) return false;
    return true;
  }

  function eventEligible(event, state, dayIndex, currentDate) {
    if (!event || state.eventHistory?.includes(event.id)) return false;
    if (Number(dayIndex) < Number(event.minDay ?? 0)) return false;
    if (Number(dayIndex) > Number(event.maxDay ?? Infinity)) return false;
    if (!eventDayTypeEligible(event, dayNameForOffset(dayIndex))) return false;
    if (!eventRequirementMet(event, state)) return false;
    if (event.special === "birthday") {
      return !state.birthdayCelebrated && sameDate(state.birthday, currentDate);
    }
    return true;
  }

  function underWeeklyLimit(type, weeklyCounts = {}, limits = WEEKLY_EVENT_LIMITS) {
    return Number(weeklyCounts?.[type] || 0) < Number(limits?.[type] ?? Infinity);
  }

  function chooseDailyStoryEvent(
    majorEvents,
    minorEvents,
    state,
    dayIndex,
    currentDate,
    randomFn = Math.random,
    weeklyCounts = { major: 0, minor: 0 },
    limits = WEEKLY_EVENT_LIMITS
  ) {
    if (underWeeklyLimit("major", weeklyCounts, limits)) {
      const majors = Object.values(majorEvents || {})
        .filter((event) => eventEligible(event, state, dayIndex, currentDate))
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      if (majors.length) {
        const overdue = majors.find((event) => Number(dayIndex) >= Number(event.guaranteedBy ?? Infinity));
        if (overdue) return { type: "major", id: overdue.id };
        const candidate = majors[0];
        if (Number(randomFn()) < Number(candidate.chance ?? 0)) return { type: "major", id: candidate.id };
      }
    }

    if (!underWeeklyLimit("minor", weeklyCounts, limits)) return null;

    const minors = Object.values(minorEvents || {})
      .filter((event) => eventEligible(event, state, dayIndex, currentDate));
    if (!minors.length) return null;

    const triggerRoll = Number(randomFn());
    const eligibleByChance = minors.filter((event) => triggerRoll < Number(event.chance ?? 0));
    if (!eligibleByChance.length) return null;
    const index = Math.min(eligibleByChance.length - 1, Math.floor(Number(randomFn()) * eligibleByChance.length));
    return { type: "minor", id: eligibleByChance[index].id };
  }

  function createWeekResolution(weekNumber, planner, activities, randomFn = Math.random) {
    const firstDayIndex = (Number(weekNumber) - 1) * WEEK_LENGTH;
    const activityMap = Object.fromEntries((activities || []).map((activity) => [activity.id, activity]));
    const days = [];

    for (let offset = 0; offset < WEEK_LENGTH; offset += 1) {
      const absoluteDayIndex = firstDayIndex + offset;
      const dayName = dayNameForOffset(absoluteDayIndex);
      const slot = activitySlotForDay(dayName);
      const activity = activityMap[planner?.[slot]];
      const weekendMultiplier = slot === "weekday" ? 1 : 2;
      const rawRoll = Number(randomFn());
      days.push({
        absoluteDayIndex,
        date: addDays(START_DATE, absoluteDayIndex),
        dayName,
        dayType: dayTypeForDayName(dayName),
        slot,
        activityId: activity?.id || null,
        stat: activity?.stat || null,
        activityName: activity?.name || "No activity",
        baseGain: activity?.gain || 0,
        weekendMultiplier,
        rawRoll,
        applied: false,
        eventChoice: undefined,
        eventStarted: false
      });
    }
    return days;
  }

  function shouldPauseForStoryEvent(day) {
    return Boolean(day?.eventChoice && !day?.eventStarted);
  }

  function copyPlannerFromPreviousWeek(targetWeek, plannerHistory = {}, currentPlanner = null) {
    const previous = plannerHistory?.[Number(targetWeek) - 1];
    if (previous) return clone(previous);
    if (Number(targetWeek) > 1 && currentPlanner && Object.values(currentPlanner).every(Boolean)) return clone(currentPlanner);
    return { weekday: null, saturday: null, sunday: null };
  }

  function isMobileAdvancePointer(pointerType) {
    return pointerType === "touch" || pointerType === "pen";
  }

  window.GameCore = {
    VERSION,
    SAVE_KEY,
    START_DATE,
    START_DAY_NAME,
    SLICE_WEEKS,
    WEEK_LENGTH,
    BASE_TRAIT_POINTS,
    MAX_NEGATIVE_TRAITS,
    MAX_TRAIT_ROLL_SHIFT,
    WEEKLY_EVENT_LIMITS,
    BIRTHDAY_BONUS,
    DAY_NAMES,
    PRONOUNS,
    POSITIVE_TRAITS,
    NEGATIVE_TRAITS,
    EMOTIONAL_STATES,
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
    birthdayInRange,
    sameDate,
    dateLabel,
    dayNameForOffset,
    activitySlotForDay,
    dayTypeForDayName,
    eventDayTypeEligible,
    eventRequirementMet,
    eventEligible,
    underWeeklyLimit,
    chooseDailyStoryEvent,
    createWeekResolution,
    shouldPauseForStoryEvent,
    copyPlannerFromPreviousWeek,
    isMobileAdvancePointer
  };
})();
