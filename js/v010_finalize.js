"use strict";
(function () {
  const READ_KEY = "silvermont_fragments_read_events_v1";
  const PROLOGUE_ID = "__prologue__";

  const ethan = STORY.events.minor.ethan_playground_intro;
  if (ethan) {
    ethan.triggerDate = { month: 9, day: 1 };
    ethan.activityTags = ["any"];
    ethan.protectedDate = true;
  }

  const fern = STORY.events.minor.fern_school_intro;
  if (fern) {
    fern.triggerDate = { month: 9, day: 2 };
    fern.activityTags = ["any"];
    fern.protectedDate = true;
  }

  function importCompletedReads() {
    let stored = [];
    try { stored = JSON.parse(localStorage.getItem(READ_KEY) || "[]"); } catch (_) { stored = []; }
    const read = new Set(Array.isArray(stored) ? stored : []);
    (state.eventHistory || []).forEach((id) => {
      if (id !== state.activeEvent?.id) read.add(id);
    });
    if (Number(state.week || 0) > 0) read.add(PROLOGUE_ID);
    localStorage.setItem(READ_KEY, JSON.stringify([...read]));

    const currentId = state.activeEvent?.id || (state.currentMode === "story" && state.week === 0 ? PROLOGUE_ID : null);
    const button = document.getElementById("skipReadDialogueBtn");
    if (button) button.classList.toggle("hidden", !currentId || !read.has(currentId));
  }

  renderHistory = function () {
    ui.historyList.innerHTML = "";
    if (!state.history.length) {
      const empty = document.createElement("p");
      empty.className = "history-empty";
      empty.textContent = "No dialogue yet.";
      ui.historyList.appendChild(empty);
      return;
    }
    state.history.forEach((entry) => {
      const item = document.createElement("article");
      item.className = "history-entry";
      if (entry.speaker && entry.speaker !== "Narrator") {
        const speaker = document.createElement("strong");
        speaker.textContent = entry.speaker;
        item.appendChild(speaker);
      }
      const text = document.createElement("p");
      text.textContent = entry.text;
      item.appendChild(text);
      ui.historyList.appendChild(item);
    });
    ui.historyList.scrollTop = ui.historyList.scrollHeight;
  };

  const priorLoadGame = loadGame;
  loadGame = function (options = {}) {
    const loaded = priorLoadGame(options);
    if (loaded) importCompletedReads();
    return loaded;
  };

  importCompletedReads();
})();
