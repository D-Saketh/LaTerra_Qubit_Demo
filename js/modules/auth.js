(function (global) {
  "use strict";

  function getApi() {
    if (global.QubitFirebaseReady) return global.QubitFirebaseReady;
    return Promise.resolve(global.QubitFirebase || null);
  }

  function safeNext() {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next && /^[a-z0-9_-]+\.html$/i.test(next)) return next;
    return "dashboard.html";
  }

  function clearFeedback(form) {
    const success = form.querySelector(".form-success");
    const error = form.querySelector(".form-error");
    if (success) success.classList.remove("show");
    if (error) {
      error.classList.remove("show");
      error.textContent = "";
    }
  }

  function getErrorEl(form) {
    let error = form.querySelector(".form-error");
    if (error) return error;

    error = document.createElement("div");
    error.className = "form-error";
    error.setAttribute("role", "alert");

    const success = form.querySelector(".form-success");
    if (success) {
      success.parentNode.insertBefore(error, success);
    } else {
      form.appendChild(error);
    }
    return error;
  }

  function showError(form, message) {
    const success = form.querySelector(".form-success");
    if (success) success.classList.remove("show");
    const error = getErrorEl(form);
    error.textContent = message;
    error.classList.add("show");
  }

  function friendlyAuthError(error) {
    const code = error && error.code ? error.code : "";
    const messages = {
      "auth/invalid-credential": "Incorrect email or password.",
      "auth/invalid-email": "That email address is not valid.",
      "auth/user-not-found": "Incorrect email or password.",
      "auth/wrong-password": "Incorrect email or password.",
      "auth/user-disabled": "This account has been disabled.",
      "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
      "auth/network-request-failed": "Network error. Check your connection and try again.",
      "auth/operation-not-allowed": "Email/password sign-in is not enabled in Firebase yet.",
      "auth/invalid-api-key": "The Firebase API key is not valid. Check js/firebase-config.js."
    };
    return messages[code] || "Sign-in failed. Please try again.";
  }

  function initPasswordToggle() {
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

  function initLoginForm() {
    const form = document.querySelector('form[data-form="login"]');
    if (!form) return;

    const button = form.querySelector('button[type="submit"]');
    const success = form.querySelector(".form-success");
    const remember = form.querySelector('input[name="remember"]');

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearFeedback(form);

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const email = form.querySelector('input[name="email"]').value.trim();
      const password = form.querySelector('input[name="password"]').value;

      button.disabled = true;
      button.textContent = "Signing in...";

      getApi()
        .then(function (api) {
          if (!api) throw new Error("not-configured");

          const persistence = remember && remember.checked
            ? api.fns.browserLocalPersistence
            : api.fns.browserSessionPersistence;

          return api.fns
            .setPersistence(api.auth, persistence)
            .then(function () {
              return api.fns.signInWithEmailAndPassword(api.auth, email, password);
            });
        })
        .then(function () {
          button.disabled = false;
          button.textContent = "Sign In";
          if (success) {
            success.textContent = "Signed in. Redirecting to your dashboard...";
            success.classList.add("show");
          }
          window.setTimeout(function () {
            window.location.assign(safeNext());
          }, 500);
        })
        .catch(function (error) {
          button.disabled = false;
          button.textContent = "Sign In";
          if (error && error.message === "not-configured") {
            showError(
              form,
              "Authentication is not connected yet. Add your Firebase config to js/firebase-config.js."
            );
            return;
          }
          console.error("[Qubit] Sign-in failed:", error);
          showError(form, friendlyAuthError(error));
        });
    });
  }

  function initAuthState() {
    getApi().then(function (api) {
      if (!api) return;
      const loginForm = document.querySelector('form[data-form="login"]');

      api.fns.onAuthStateChanged(api.auth, function (user) {
        document.querySelectorAll("[data-auth-email]").forEach(function (el) {
          el.textContent = user && user.email ? user.email : "Not signed in";
        });

        if (user && loginForm) {
          const stay = new URLSearchParams(window.location.search).get("stay");
          if (stay !== "1") window.location.replace(safeNext());
        }
      });
    });
  }

  function initLogout() {
    document.querySelectorAll("[data-logout]").forEach(function (button) {
      button.addEventListener("click", function () {
        getApi().then(function (api) {
          if (!api) {
            window.location.assign("login.html");
            return;
          }
          button.disabled = true;
          button.textContent = "Signing out...";
          api.fns
            .signOut(api.auth)
            .then(function () {
              window.location.assign("login.html");
            })
            .catch(function (error) {
              console.error("[Qubit] Sign-out failed:", error);
              button.disabled = false;
              button.textContent = "Sign Out";
            });
        });
      });
    });
  }

  function initAuth() {
    initPasswordToggle();
    initLoginForm();
    initAuthState();
    initLogout();
  }

  global.QubitModules = global.QubitModules || {};
  global.QubitModules.auth = { init: initAuth };
})(window);
