"use strict";

window.SILVERMONT_CONFIG = Object.freeze({ onlinePlayUrl: "" });

(function bootFeatureLayersWhenReady() {
  if (window.__SILVERMONT_V013_BOOT__) return;

  function load(src, next) {
    const script = document.createElement("script");
    script.src = src;
    script.onload = next || null;
    document.body.appendChild(script);
  }

  function waitForV012() {
    if (!window.SilvermontClubs || !window.SilvermontEventChains) {
      window.setTimeout(waitForV012, 50);
      return;
    }
    if (window.__SILVERMONT_V013_BOOT__) return;
    window.__SILVERMONT_V013_BOOT__ = true;
    load("js/v013_relationships.js", () => {
      load("js/v013_features.js", () => {
        load("js/v013_consequences.js", () => {
          load("js/v014_story.js", () => {
            load("js/v014_debug.js", () => load("js/v014_finalize.js"));
          });
        });
      });
    });
  }

  window.addEventListener("DOMContentLoaded", waitForV012, { once: true });
})();
