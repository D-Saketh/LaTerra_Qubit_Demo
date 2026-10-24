(function (global) {
  "use strict";

  function initAuth() {
    const passwordToggle = document.getElementById("togglePassword");
    if (!passwordToggle) return;
    const passwordInput = document.getElementById("login-password");
    passwordToggle.addEventListener("click", function () {
      if (!passwordInput) return;
      const show = passwordInput.type === "password";
      passwordInput.type = show ? "text" : "password";
      passwordToggle.textContent = show ? "Hide" : "Show";
      passwordToggle.setAttribute("aria-label", show ? "Hide password" : "Show password");
      passwordToggle.setAttribute("aria-pressed", String(show));
      passwordInput.focus();
    });
  }

  global.QubitModules = global.QubitModules || {};
  global.QubitModules.auth = { init: initAuth };
})(window);
