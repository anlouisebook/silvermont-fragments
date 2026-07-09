"use strict";
(function () {
  const eventById = (id) => STORY.events.major[id] || STORY.events.minor[id] || null;
  const clubFollowUps = {
    scholars: { followUp: "scholars_missing_citation", first: "scholars_first_meeting", dayOffset: 2 },
    creatives: { followUp: "creatives_hidden_layer", first: "creatives_first_meeting", dayOffset: 3 },
    athletics: { followUp: "athletics_last_lap", first: "athletics_first_meeting", dayOffset: 4 }
  };

  // Keep the priority collision debug scenario deterministic once its prerequisites are prepared.
  const archive = eventById("mystery_archive_receipt");
  if (archive) archive.chance = 1;

  // v0.12 only marked first club meetings missed. Extend that behavior to eligible follow-up scenes.
  document.addEventListener("click", (event) => {
    const button = event.target.closest?.(".club-skip-btn");
    if (!button || !state.clubId) return;
    const config = clubFollowUps[state.clubId];
    if (!config) return;
    const followUp = eventById(config.followUp);
    if (!followUp) return;

    state.eventHistory = Array.isArray(state.eventHistory) ? state.eventHistory : [];
    state.missedEvents = Array.isArray(state.missedEvents) ? state.missedEvents : [];

    const meetingDayIndex = (Number(state.week || 1) - 1) * 7 + config.dayOffset;
    const firstMeetingComplete = state.eventHistory.includes(config.first);
    const followUpReached = meetingDayIndex >= Number(followUp.minDay ?? 0);

    if (firstMeetingComplete && followUpReached && !state.eventHistory.includes(config.followUp) && !state.missedEvents.includes(config.followUp)) {
      state.missedEvents.push(config.followUp);
    }
  }, true);

  // Hide the Debug modal before presets open the planner.
  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("button");
    if (!button || !String(button.textContent || "").startsWith("v0.14 ")) return;
    if (/Prep|Test Priority/.test(button.textContent)) {
      document.getElementById("systemPanel")?.classList.add("hidden");
    }
  }, true);

  function prepActivityMatrix() {
    document.getElementById("systemPanel")?.classList.add("hidden");
    openPlanner(2);
    Object.assign(state.planner, {
      monday: "study",
      tuesday: "create",
      wednesday: "exercise",
      thursday: "help",
      friday: "socialize",
      saturday: "study",
      sunday: "create"
    });
    renderPlannerSelection();
  }

  if (window.SilvermontDebug?.registerTool) {
    window.SilvermontDebug.registerTool("v0.14 Prep Activity Tag Matrix", prepActivityMatrix);
    window.SilvermontDebug.registerTool("v0.14 Run Due Consequences Now", () => window.SilvermontConsequences?.runDue());
  }

  if (window.SilvermontStoryPack) {
    window.SilvermontStoryPack.coverage = Object.freeze({
      exactDate: ["school_founders_assembly"],
      priority: ["mystery_archive_receipt", "mystery_anonymous_envelope"],
      relationshipThresholds: ["ethan_unfinished_question", "fern_margin_promise"],
      choiceMemory: ["ethan_choice_memory_callback", "fern_choice_memory_callback"],
      delayedConsequences: ["school_founders_assembly", "mystery_archive_receipt", "scholars_missing_citation", "creatives_hidden_layer"],
      clubs: ["scholars_missing_citation", "creatives_hidden_layer", "athletics_last_lap"],
      activityTags: ["study_old_yearbook", "create_margin_map", "exercise_fence_shortcut", "help_attic_box", "socialize_lunch_rumor"],
      eventChains: ["mystery_archive_receipt", "ethan_unfinished_question", "fern_margin_promise", "scholars_missing_citation", "creatives_hidden_layer", "athletics_last_lap"]
    });
  }
})();
