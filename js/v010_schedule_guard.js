"use strict";
(function () {
  const priorBirthday = birthdayEventChoice;
  const ordinal = (date) => {
    const days = [31,29,31,30,31,30,31,31,30,31,30,31];
    let total = Number(date?.day || 0);
    for (let month = 1; month < Number(date?.month || 1); month += 1) total += days[month - 1];
    return total;
  };
  const due = (event, day) => {
    if (!event?.triggerDate || state.eventHistory?.includes(event.id)) return false;
    if (ordinal(day.date) < ordinal(event.triggerDate)) return false;
    if (!window.GameCore.eventDayTypeEligible(event, day.dayName)) return false;
    const tags = event.activityTags?.length ? event.activityTags : ["any"];
    if (!tags.includes("any") && !tags.includes(day.activityId)) return false;
    return window.GameCore.eventRequirementMet(event, state);
  };
  birthdayEventChoice = function (day) {
    const exactDue = [...Object.values(STORY.events.major), ...Object.values(STORY.events.minor)]
      .some((event) => due(event, day));
    return exactDue ? null : priorBirthday(day);
  };
})();
