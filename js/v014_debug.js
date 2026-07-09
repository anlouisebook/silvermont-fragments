"use strict";
(function () {
  const VERSION = "0.14.0";
  const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const PACK_IDS = window.SilvermontStoryPack?.ids || [];

  function ensure() {
    state.flags = state.flags || {};
    state.relationships = state.relationships || {};
    state.choiceMemory = Array.isArray(state.choiceMemory) ? state.choiceMemory : [];
    state.eventHistory = Array.isArray(state.eventHistory) ? state.eventHistory : [];
    state.missedEvents = Array.isArray(state.missedEvents) ? state.missedEvents : [];
    state.clubAttendance = state.clubAttendance && typeof state.clubAttendance === "object" ? state.clubAttendance : {};
  }

  function addHistory(...ids) {
    ensure();
    ids.forEach((id) => { if (!state.eventHistory.includes(id)) state.eventHistory.push(id); });
  }

  function addMemory(eventId, choice) {
    ensure();
    if (!state.choiceMemory.some((item) => item.eventId === eventId && item.choice === choice)) {
      state.choiceMemory.push({ eventId, choice, date: { ...(state.currentDate || { month: 9, day: 1 }) }, week: Number(state.week || 0) });
    }
  }

  function toast(message) {
    let node = document.getElementById("v014DebugToast");
    if (!node) {
      node = document.createElement("div");
      node.id = "v014DebugToast";
      Object.assign(node.style, {
        position: "fixed", left: "50%", bottom: "24px", transform: "translateX(-50%)",
        zIndex: "23000", maxWidth: "min(720px,92vw)", padding: "10px 14px",
        borderRadius: "10px", border: "1px solid rgba(45,38,51,.18)",
        background: "rgba(255,250,247,.98)", color: "#2d2633",
        boxShadow: "0 8px 28px rgba(45,38,51,.2)"
      });
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { node.hidden = true; }, 3200);
  }

  function openPreparedWeek(week, activityId) {
    ensure();
    openPlanner(week);
    DAYS.forEach((day) => { state.planner[day] = activityId; });
    renderPlannerSelection();
  }

  function prepExactDate() {
    state.flags = state.flags || {};
    openPreparedWeek(3, "study");
    toast("Week 3 prepared. Sept 16 exact-date Founders' Assembly is eligible.");
  }

  function prepPriorityCollision() {
    addHistory("mystery_necklace_echo", "mystery_broken_glass_flash", "mystery_hospital_record_gap");
    state.flags.found_hospital_timeline_gap = true;
    openPreparedWeek(3, "study");
    toast("Priority collision prepared: mystery archive 105 vs Founders' Assembly 92 on Sept 16.");
  }

  function prepMysteryPayoff() {
    addHistory("mystery_necklace_echo", "mystery_broken_glass_flash", "mystery_hospital_record_gap", "mystery_archive_receipt");
    state.flags.found_hospital_timeline_gap = true;
    state.flags.archive_receipt_found = true;
    state.flags.anonymous_envelope_arrived = true;
    openPreparedWeek(3, "study");
    toast("Anonymous-envelope payoff prepared.");
  }

  function prepEthanThreshold() {
    addHistory("ethan_playground_intro", "ethan_second_meeting", "ethan_playground_friendship");
    state.relationships.ethan = 14;
    addMemory("ethan_second_meeting", "Ask if you can sit with him.");
    openPreparedWeek(4, "socialize");
    toast("Ethan 14+, chain complete, Choice Memory callback prepared.");
  }

  function prepFernThreshold() {
    addHistory("fern_school_intro", "fern_shared_notes", "fern_library_promise");
    state.relationships.fern = 14;
    addMemory("fern_shared_notes", "Offer to study together.");
    openPreparedWeek(4, "study");
    toast("Fern 14+, chain complete, Choice Memory callback prepared.");
  }

  function prepClub(clubId, firstEventId, activityId, dayKey) {
    addHistory("fern_school_intro", "club_fair", firstEventId);
    state.clubId = clubId;
    state.clubAttendance[`3:${dayKey}`] = "attend";
    openPreparedWeek(3, activityId);
    toast(`${clubId} follow-up prepared. Attend the meeting day to test clubTags and missable content.`);
  }

  function queueConsequenceDemo() {
    ensure();
    window.SilvermontConsequences?.queue({
      id: "v014_debug_consequence",
      delayDays: 1,
      effects: { relationships: { ethan: 1 }, flags: { v014_debug_consequence_applied: true } },
      message: "Debug consequence applied exactly once."
    }, "v014_debug");
    toast("One-day delayed consequence queued.");
  }

  function showState() {
    ensure();
    const snapshot = {
      week: state.week,
      date: state.currentDate,
      relationships: state.relationships,
      clubId: state.clubId,
      pendingConsequences: state.pendingConsequences || [],
      consequenceHistory: state.consequenceHistory || [],
      packEventsCompleted: state.eventHistory.filter((id) => PACK_IDS.includes(id)),
      packEventsMissed: state.missedEvents.filter((id) => PACK_IDS.includes(id)),
      recentChoices: state.choiceMemory.slice(-8)
    };
    console.log("Silvermont v0.14 story state", snapshot);
    toast("Story state printed to the browser console.");
  }

  function resetPack() {
    ensure();
    const pack = new Set(PACK_IDS);
    state.eventHistory = state.eventHistory.filter((id) => !pack.has(id));
    state.missedEvents = state.missedEvents.filter((id) => !pack.has(id));
    state.choiceMemory = state.choiceMemory.filter((item) => !pack.has(item.eventId));
    state.pendingConsequences = (state.pendingConsequences || []).filter((item) =>
      !String(item.id || "").startsWith("assembly_") &&
      !String(item.id || "").startsWith("anonymous_") &&
      !String(item.id || "").startsWith("fern_checks_") &&
      !String(item.id || "").startsWith("scholars_") &&
      item.id !== "canvas_donor_record" &&
      item.id !== "v014_debug_consequence"
    );
    [
      "founders_assembly_seen", "assembly_m17_noticed", "assembly_program_recalled", "assembly_m17_ignored",
      "archive_receipt_found", "archive_numbers_copied", "anonymous_envelope_arrived", "anonymous_envelope_opened",
      "fern_saw_archive_receipt", "fern_checked_archive_code", "archive_code_payoff_seen",
      "ethan_knows_necklace_belonged_to_mother", "ethan_respected_boundary", "ethan_choice_memory_paid_off",
      "fern_shared_uncertainty", "fern_accepts_uncertainty", "fern_choice_memory_paid_off",
      "scholars_missing_citation_seen", "scholars_catalog_search_started", "scholars_catalog_result_ready", "renumbered_source_found",
      "creatives_hidden_layer_seen", "creatives_map_sketch_saved", "canvas_donor_record_found",
      "athletics_last_lap_seen", "athletics_ran_with_student", "athletics_called_coach_back",
      "old_yearbook_found", "margin_map_drawn", "old_service_road_seen", "attic_box_marked_later_seen", "hospital_rumor_heard",
      "v014_debug_consequence_applied"
    ].forEach((key) => delete state.flags[key]);
    toast("v0.14 story-pack state reset.");
  }

  if (window.SilvermontDebug?.registerTool) {
    window.SilvermontDebug.registerTool("v0.14 Prep Exact-Date Story", prepExactDate);
    window.SilvermontDebug.registerTool("v0.14 Test Priority Collision", prepPriorityCollision);
    window.SilvermontDebug.registerTool("v0.14 Prep Mystery Payoff", prepMysteryPayoff);
    window.SilvermontDebug.registerTool("v0.14 Prep Ethan Threshold + Memory", prepEthanThreshold);
    window.SilvermontDebug.registerTool("v0.14 Prep Fern Threshold + Memory", prepFernThreshold);
    window.SilvermontDebug.registerTool("v0.14 Prep Scholars Follow-up", () => prepClub("scholars", "scholars_first_meeting", "study", "wednesday"));
    window.SilvermontDebug.registerTool("v0.14 Prep Creative Arts Follow-up", () => prepClub("creatives", "creatives_first_meeting", "create", "thursday"));
    window.SilvermontDebug.registerTool("v0.14 Prep Athletics Follow-up", () => prepClub("athletics", "athletics_first_meeting", "exercise", "friday"));
    window.SilvermontDebug.registerTool("v0.14 Queue Consequence Demo", queueConsequenceDemo);
    window.SilvermontDebug.registerTool("v0.14 Show Story State", showState);
    window.SilvermontDebug.registerTool("v0.14 Reset Story Pack", resetPack);
  }

  const previousUpdateStatus = updateStatus;
  updateStatus = function () {
    previousUpdateStatus();
    const footer = document.getElementById("versionLabel");
    const menu = document.getElementById("menuVersionLabel");
    if (footer) footer.textContent = `v${VERSION}`;
    if (menu) menu.textContent = `v${VERSION}`;
  };

  ["menuBtn", "newGameMenuBtn", "continueMenuBtn"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", () => setTimeout(updateStatus, 0));
  });

  updateStatus();
})();
