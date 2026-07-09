"use strict";
(function () {
  const VERSION = "0.15.0";
  const READ_KEY = "silvermont_fragments_read_events_v1";
  let previewSession = null;
  let lastGraph = null;

  function cloneSafe(value) { return JSON.parse(JSON.stringify(value)); }
  function allEvents() {
    return [
      ...Object.values(STORY.events.major || {}).map((event) => ({ ...event, __type: "major" })),
      ...Object.values(STORY.events.minor || {}).map((event) => ({ ...event, __type: "minor" }))
    ];
  }
  function eventById(id) { return STORY.events.major[id] || STORY.events.minor[id] || null; }
  function eventType(id) { return STORY.events.major[id] ? "major" : "minor"; }
  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  function flatten(value) {
    if (Array.isArray(value)) return value.flatMap(flatten);
    return value ? [value] : [];
  }
  function eventName(id) { return eventById(id)?.name || id; }

  function collectFlagsFromEffect(effect, output) {
    Object.keys(effect?.flags || {}).forEach((key) => output.add(key));
    (effect?.delayedConsequences || []).forEach((item) => collectFlagsFromEffect(item?.effects || {}, output));
  }

  function collectFlagsFromScenes(scenes, output) {
    (scenes || []).forEach((scene) => {
      (scene.choices || []).forEach((choice) => {
        collectFlagsFromEffect(choice.effect || {}, output);
        collectFlagsFromScenes(choice.scenes || [], output);
      });
    });
  }

  function buildFlagProducers(events) {
    const map = new Map();
    events.forEach((event) => {
      const flags = new Set();
      collectFlagsFromEffect(event.effects || {}, flags);
      collectFlagsFromScenes(event.scenes || [], flags);
      flags.forEach((flag) => {
        if (!map.has(flag)) map.set(flag, new Set());
        map.get(flag).add(event.id);
      });
    });
    return map;
  }

  function previousChainEvents(event) {
    if (!event?.chainId || Number(event.chainStep || 0) <= 0) return [];
    const chain = window.SilvermontEventChains?.definitions?.[event.chainId];
    if (!chain) return [];
    return flatten(chain[Number(event.chainStep) - 1]);
  }

  function dependencyMap(events) {
    const ids = new Set(events.map((event) => event.id));
    const flagProducers = buildFlagProducers(events);
    const result = new Map();

    events.forEach((event) => {
      const dependencies = new Set();
      (event.prerequisiteEvents || []).forEach((id) => dependencies.add(id));
      previousChainEvents(event).forEach((id) => dependencies.add(id));

      const req = event.requirements || {};
      [...(req.choiceMemoryAny || []), ...(req.choiceMemoryAll || [])]
        .forEach((rule) => { if (rule?.eventId) dependencies.add(rule.eventId); });

      [...(req.flagsAll || []), ...(req.flagsAny || [])].forEach((flag) => {
        (flagProducers.get(flag) || []).forEach((id) => dependencies.add(id));
      });

      dependencies.delete(event.id);
      result.set(event.id, [...dependencies].filter((id) => ids.has(id)));
    });
    return result;
  }

  function depthMap(events, dependencies) {
    const memo = new Map();
    const visiting = new Set();
    function depth(id) {
      if (memo.has(id)) return memo.get(id);
      if (visiting.has(id)) return 0;
      visiting.add(id);
      const deps = dependencies.get(id) || [];
      const value = deps.length ? Math.max(...deps.map((dep) => depth(dep) + 1)) : 0;
      visiting.delete(id);
      memo.set(id, Math.min(value, 12));
      return memo.get(id);
    }
    events.forEach((event) => depth(event.id));
    return memo;
  }

  function stateReady(event) {
    const reqOk = window.GameCore.eventRequirementMet(event, state);
    const prereqOk = (event.prerequisiteEvents || []).every((id) => state.eventHistory?.includes(id));
    const chainOk = previousChainEvents(event).length === 0 || previousChainEvents(event).some((id) => state.eventHistory?.includes(id));
    return reqOk && prereqOk && chainOk;
  }

  function statusFor(event) {
    if (state.eventHistory?.includes(event.id)) return "completed";
    if (state.missedEvents?.includes(event.id)) return "missed";
    return stateReady(event) ? "ready" : "locked";
  }

  function requirementRows(event) {
    const req = event.requirements || {};
    const rows = [];
    rows.push(["Type", event.__type || eventType(event.id)]);
    rows.push(["Priority", Number.isFinite(Number(event.priority)) ? String(event.priority) : "default"]);

    if (event.triggerDate) rows.push(["Exact date", `${event.triggerDate.month}/${event.triggerDate.day}`]);
    if (event.minDay !== undefined) rows.push(["Min day", String(event.minDay)]);
    if (event.maxDay !== undefined) rows.push(["Max day", String(event.maxDay)]);
    if (event.dayType) rows.push(["Day tag", event.dayType]);
    if (event.chance !== undefined && !event.triggerDate) rows.push(["Chance", `${Math.round(Number(event.chance) * 100)}%`]);
    if (event.chainId) rows.push(["Chain", `${event.chainId} · step ${Number(event.chainStep || 0)}`]);
    if (event.prerequisiteEvents?.length) rows.push(["Prerequisite", event.prerequisiteEvents.map(eventName).join(" · ")]);
    if (event.activityTags?.length) rows.push(["Activities", event.activityTags.join(", ")]);
    if (event.clubTags?.length) rows.push(["Clubs", event.clubTags.join(", ")]);
    if (req.flagsAll?.length) rows.push(["Flags all", req.flagsAll.join(", ")]);
    if (req.flagsAny?.length) rows.push(["Flags any", req.flagsAny.join(", ")]);
    if (req.relationshipMin && Object.keys(req.relationshipMin).length) {
      rows.push(["Relationship min", Object.entries(req.relationshipMin).map(([key, value]) => `${key} ≥ ${value}`).join(", ")]);
    }
    if (req.relationshipMax && Object.keys(req.relationshipMax).length) {
      rows.push(["Relationship max", Object.entries(req.relationshipMax).map(([key, value]) => `${key} ≤ ${value}`).join(", ")]);
    }
    if (req.choiceMemoryAny?.length) {
      rows.push(["Choice Memory any", req.choiceMemoryAny.map((rule) => `${eventName(rule.eventId)} → ${rule.choice || "any choice"}`).join(" · ")]);
    }
    if (req.choiceMemoryAll?.length) {
      rows.push(["Choice Memory all", req.choiceMemoryAll.map((rule) => `${eventName(rule.eventId)} → ${rule.choice || "any choice"}`).join(" · ")]);
    }
    return rows;
  }

  function buildGraph() {
    const events = allEvents();
    const dependencies = dependencyMap(events);
    const depths = depthMap(events, dependencies);
    return { events, dependencies, depths };
  }

  function installStyles() {
    if (document.getElementById("sfStoryFlowStyles")) return;
    const style = document.createElement("style");
    style.id = "sfStoryFlowStyles";
    style.textContent = `
      .sf-flow-shell{display:grid;gap:12px}
      .sf-flow-legend{display:flex;flex-wrap:wrap;gap:8px;font-size:.76rem}
      .sf-flow-legend span{padding:4px 8px;border-radius:999px;border:1px solid rgba(45,38,51,.16);background:#fffaf7}
      .sf-flow-scroll{overflow:auto;max-height:68vh;border:1px solid rgba(45,38,51,.14);border-radius:12px;background:rgba(255,255,255,.5)}
      .sf-flow-board{position:relative;display:flex;align-items:flex-start;gap:34px;width:max-content;min-width:100%;padding:24px}
      .sf-flow-svg{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:visible}
      .sf-flow-column{position:relative;z-index:1;width:300px;display:grid;align-content:start;gap:12px}
      .sf-flow-column>h3{position:sticky;top:0;z-index:3;margin:0;padding:7px 9px;border-radius:8px;background:rgba(239,229,225,.96);font-size:.78rem;text-transform:uppercase;letter-spacing:.08em}
      .sf-flow-node{width:100%;display:grid;gap:7px;text-align:left;padding:10px;border-radius:10px;border:1px solid rgba(45,38,51,.18);background:#fffaf7;color:inherit;cursor:pointer;box-shadow:0 3px 10px rgba(45,38,51,.06)}
      .sf-flow-node:hover{transform:translateY(-1px);box-shadow:0 7px 16px rgba(45,38,51,.12)}
      .sf-flow-node.completed{border-color:#6e9b78;background:#f2faf3}
      .sf-flow-node.ready{border-color:#b38b43;background:#fff9ec}
      .sf-flow-node.locked{opacity:.78}
      .sf-flow-node.missed{border-color:#a86666;background:#fff1f1}
      .sf-flow-head{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
      .sf-flow-head strong{font-size:.88rem;line-height:1.2}
      .sf-flow-badge{flex:none;font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;padding:3px 6px;border-radius:999px;background:#efe5e1}
      .sf-flow-id{font:600 .63rem/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;opacity:.58;overflow-wrap:anywhere}
      .sf-flow-req{display:grid;gap:3px;font-size:.66rem;line-height:1.25}
      .sf-flow-req div{display:grid;grid-template-columns:86px 1fr;gap:6px}
      .sf-flow-req b{font-weight:700;opacity:.7}
      .sf-flow-status{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
      .sf-flow-note{font-size:.74rem;color:var(--muted)}
      @media(max-width:680px){.sf-flow-column{width:260px}.sf-flow-board{gap:24px;padding:16px}}
    `;
    document.head.appendChild(style);
  }

  function nodeHtml(event) {
    const status = statusFor(event);
    const rows = requirementRows(event)
      .map(([label, value]) => `<div><b>${escapeHtml(label)}</b><span>${escapeHtml(value)}</span></div>`)
      .join("");
    const playable = Array.isArray(event.scenes) && event.scenes.length > 0;
    return `
      <button type="button" class="sf-flow-node ${status}" data-event-id="${escapeHtml(event.id)}" ${playable ? "" : "disabled"}>
        <span class="sf-flow-head"><strong>${escapeHtml(event.name || event.id)}</strong><span class="sf-flow-badge">${escapeHtml(event.__type)}</span></span>
        <span class="sf-flow-id">${escapeHtml(event.id)}</span>
        <span class="sf-flow-status">${escapeHtml(status)}${playable ? " · click to preview" : " · no scenes"}</span>
        <span class="sf-flow-req">${rows}</span>
      </button>`;
  }

  function drawEdges(graph) {
    const board = document.getElementById("sfFlowBoard");
    const svg = document.getElementById("sfFlowSvg");
    if (!board || !svg) return;
    const boardRect = board.getBoundingClientRect();
    const width = board.scrollWidth;
    const height = board.scrollHeight;
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.innerHTML = "";

    graph.dependencies.forEach((deps, targetId) => {
      const target = board.querySelector(`[data-event-id="${CSS.escape(targetId)}"]`);
      if (!target) return;
      const tr = target.getBoundingClientRect();
      deps.forEach((sourceId) => {
        const source = board.querySelector(`[data-event-id="${CSS.escape(sourceId)}"]`);
        if (!source) return;
        const sr = source.getBoundingClientRect();
        const x1 = sr.right - boardRect.left;
        const y1 = sr.top + sr.height / 2 - boardRect.top;
        const x2 = tr.left - boardRect.left;
        const y2 = tr.top + tr.height / 2 - boardRect.top;
        const bend = Math.max(28, (x2 - x1) * 0.45);
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "rgba(113,83,96,.32)");
        path.setAttribute("stroke-width", "2");
        svg.appendChild(path);
      });
    });
  }

  function renderFlowchart() {
    installStyles();
    const panel = document.getElementById("systemPanel");
    const title = document.getElementById("systemPanelTitle");
    const subtitle = document.getElementById("systemPanelSubtitle");
    const body = document.getElementById("systemPanelBody");
    if (!panel || !title || !subtitle || !body) return;

    const graph = buildGraph();
    lastGraph = graph;
    const columns = new Map();
    graph.events.forEach((event) => {
      const depth = graph.depths.get(event.id) || 0;
      if (!columns.has(depth)) columns.set(depth, []);
      columns.get(depth).push(event);
    });
    [...columns.values()].forEach((items) => items.sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0) || String(a.name || a.id).localeCompare(String(b.name || b.id))));

    title.textContent = "Story Flowchart";
    subtitle.textContent = "Auto-generated from current event metadata. Click any event to preview it; preview changes are rolled back.";
    const card = panel.querySelector(".modal-card");
    if (card) card.style.width = "min(1500px, 96vw)";

    body.innerHTML = `
      <div class="sf-flow-shell">
        <div class="sf-flow-legend">
          <span>Green: completed</span><span>Gold: requirements met now</span><span>Gray: locked</span><span>Red: missed</span>
          <span>${graph.events.length} events</span>
        </div>
        <p class="sf-flow-note">Connections are inferred from prerequisite events, chain steps, Choice Memory sources, and known flag-producing events.</p>
        <div class="sf-flow-scroll">
          <div id="sfFlowBoard" class="sf-flow-board">
            <svg id="sfFlowSvg" class="sf-flow-svg" aria-hidden="true"></svg>
            ${[...columns.entries()].sort((a, b) => a[0] - b[0]).map(([depth, items]) => `
              <section class="sf-flow-column">
                <h3>Stage ${depth + 1}</h3>
                ${items.map(nodeHtml).join("")}
              </section>`).join("")}
          </div>
        </div>
      </div>`;

    body.querySelectorAll(".sf-flow-node[data-event-id]").forEach((node) => {
      node.addEventListener("click", () => previewEvent(node.dataset.eventId));
    });
    panel.classList.remove("hidden");
    requestAnimationFrame(() => drawEdges(graph));
  }

  function finishPreview() {
    if (!previewSession) return;
    const session = previewSession;
    previewSession = null;
    state = session.state;
    if (session.readHistory === null) localStorage.removeItem(READ_KEY);
    else localStorage.setItem(READ_KEY, session.readHistory);
    hideAllModals();
    setPortrait(null);
    renderStats();
    updateStatus();
    renderFlowchart();
  }

  function previewEvent(id) {
    const event = eventById(id);
    if (!event?.scenes?.length) return;
    previewSession = {
      eventId: id,
      state: cloneSafe(state),
      readHistory: localStorage.getItem(READ_KEY)
    };

    document.getElementById("systemPanel")?.classList.add("hidden");
    state.finished = false;
    if (event.triggerDate) state.currentDate = { ...event.triggerDate };
    state.activeEvent = { type: eventType(id), id, resume: "story_flow_preview" };
    state.sceneQueue = cloneSafe(event.scenes);
    state.sceneIndex = 0;
    state.currentMode = "story";
    hideAllModals();
    showScene(state.sceneQueue[0]);
  }

  const previousCompleteActiveEvent = completeActiveEvent;
  completeActiveEvent = function () {
    if (previewSession && state.activeEvent?.resume === "story_flow_preview") {
      finishPreview();
      return;
    }
    previousCompleteActiveEvent();
  };

  document.getElementById("saveBtn")?.addEventListener("click", (event) => {
    if (!previewSession) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  document.getElementById("menuBtn")?.addEventListener("click", (event) => {
    if (!previewSession) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    finishPreview();
  }, true);

  window.addEventListener("resize", () => {
    if (lastGraph && !document.getElementById("systemPanel")?.classList.contains("hidden")) drawEdges(lastGraph);
  });

  window.SilvermontStoryFlow = {
    open: renderFlowchart,
    graph: buildGraph,
    preview: previewEvent,
    exitPreview: finishPreview
  };

  if (window.SilvermontDebug?.registerTool) {
    window.SilvermontDebug.registerTool("Story Flowchart", renderFlowchart);
  }

  const previousUpdateStatus = updateStatus;
  updateStatus = function () {
    previousUpdateStatus();
    const footer = document.getElementById("versionLabel");
    const menu = document.getElementById("menuVersionLabel");
    if (footer) footer.textContent = `v${VERSION}`;
    if (menu) menu.textContent = `v${VERSION}`;
  };
  updateStatus();
})();
