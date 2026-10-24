(function (global) {
  "use strict";

  function initFooter() {
    document.querySelectorAll("#year").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  global.QubitModules = global.QubitModules || {};
  global.QubitModules.footer = { init: initFooter };
})(window);
