"use strict";
(function () {
  const VERSION = "0.12.0";
  const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  ["scholars_first_meeting", "creatives_first_meeting", "athletics_first_meeting"].forEach((id) => {
    const event = STORY.events.minor[id];
    if (event?.effects?.stats) delete event.effects.stats;
  });

  function enforceVersion() {
    const footer = document.getElementById("versionLabel");
    const menu = document.getElementById("menuVersionLabel");
    if (footer) footer.textContent = `v${VERSION}`;
    if (menu) menu.textContent = `v${VERSION}`;
  }

  const priorRenderPlannerSelection = renderPlannerSelection;
  renderPlannerSelection = function () {
    priorRenderPlannerSelection();
    const ready = DAYS.every((day) => Boolean(state.planner?.[day]));
    ui.beginWeek.disabled = !ready;
  };

  ["menuBtn", "newGameMenuBtn", "continueMenuBtn"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", () => setTimeout(enforceVersion, 0));
  });

  enforceVersion();
})();
