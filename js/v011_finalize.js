"use strict";
(function () {
  const VERSION = "0.11.0";
  const continueButton = document.getElementById("continueMenuBtn");
  const menuVersion = document.getElementById("menuVersionLabel");
  const footerVersion = document.getElementById("versionLabel");

  function enforceV011Ui() {
    if (continueButton) continueButton.disabled = false;
    if (menuVersion) menuVersion.textContent = `v${VERSION}`;
    if (footerVersion) footerVersion.textContent = `v${VERSION}`;
  }

  const priorUpdateStatus = updateStatus;
  updateStatus = function () {
    priorUpdateStatus();
    enforceV011Ui();
  };

  document.getElementById("menuBtn")?.addEventListener("click", enforceV011Ui);
  document.getElementById("newGameMenuBtn")?.addEventListener("click", enforceV011Ui);
  enforceV011Ui();
})();
