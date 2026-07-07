"use strict";
(function () {
  const previous = window.GameCore.eventRequirementMet;

  window.GameCore.eventRequirementMet = function (event, stateArg) {
    if (!previous(event, stateArg)) return false;
    const req = event?.requirements || {};
    const rel = stateArg?.relationships || {};

    for (const [key, min] of Object.entries(req.relationshipMin || {})) {
      if (Number(rel[key] || 0) < Number(min)) return false;
    }
    for (const [key, max] of Object.entries(req.relationshipMax || {})) {
      if (Number(rel[key] || 0) > Number(max)) return false;
    }
    return true;
  };

  function setMin(id, key, value) {
    const event = STORY.events.major[id] || STORY.events.minor[id];
    if (!event) return;
    event.requirements = event.requirements || {};
    event.requirements.relationshipMin = { ...(event.requirements.relationshipMin || {}), [key]: value };
  }

  setMin("ethan_second_meeting", "ethan", 5);
  setMin("ethan_playground_friendship", "ethan", 8);
  setMin("fern_shared_notes", "fern", 5);
  setMin("fern_library_promise", "fern", 8);

  window.SilvermontRelationships = {
    meets: (requirements = {}) => window.GameCore.eventRequirementMet({ requirements }, state)
  };
})();
