"use strict";

/* v0.8.0 runtime patch: Life branching + daily result icons + stale save text fix. */
(function () {
  const icon = document.getElementById("resolutionIcon");

  const originalFlashMessage = flashMessage;
  flashMessage = function (message) {
    originalFlashMessage(String(message || "").replace("v0.7.0", "v0.8.0"));
  };

  selectStoryChoice = function (choice) {
    applyChoiceEffect(choice.effect || {});
    if (Array.isArray(choice.scenes) && choice.scenes.length) {
      state.sceneQueue.splice(state.sceneIndex + 1, 0, ...clone(choice.scenes));
    }
    advanceScene();
  };

  renderDailyResolution = function (day) {
    ui.resolutionTitle.textContent = `Week ${state.week} · Day ${state.resolution.index + 1} of 7`;
    ui.resolutionDate.textContent = `${dateLabel(day.date)} · ${day.dayName}`;
    ui.resolutionActivity.textContent = day.activityName;
    ui.resolutionOutcome.textContent = day.outcomeLabel;
    if (icon) {
      icon.textContent = outcomeIcon(day.outcomeKey);
      icon.className = `resolution-icon outcome-${day.outcomeKey || "neutral"}`;
    }
    ui.resolutionGain.textContent = `${signedDelta(day.gain)} ${day.stat}`;
    ui.resolutionGain.classList.toggle("zero", day.gain === 0);
    ui.resolutionGain.classList.toggle("negative", day.gain < 0);
    renderResolutionProgress();
    ui.resolutionScreen.classList.remove("hidden");
    updateStatus();
  };
})();
