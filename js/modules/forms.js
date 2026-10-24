(function (global) {
  "use strict";

  function initForms() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll("form[data-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        const success = form.querySelector(".form-success");
        const button = form.querySelector('button[type="submit"]');
        const originalLabel = button ? button.textContent : "";
        if (button) {
          button.disabled = true;
          button.textContent = "Sending...";
        }
        window.setTimeout(function () {
          form.reset();
          if (button) {
            button.disabled = false;
            button.textContent = originalLabel;
          }
          if (success) {
            success.classList.add("show");
            try {
              success.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
            } catch (e) {}
          }
        }, 550);
      });
    });
  }

  global.QubitModules = global.QubitModules || {};
  global.QubitModules.forms = { init: initForms };
})(window);
