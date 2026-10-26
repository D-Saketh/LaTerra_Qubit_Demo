(function (global) {
  "use strict";

  function getApi() {
    if (global.QubitFirebaseReady) return global.QubitFirebaseReady;
    return Promise.resolve(global.QubitFirebase || null);
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

  function setLoading(button, loading, label) {
    if (!button) return;
    if (loading) {
      button.dataset.originalLabel = button.textContent;
      button.disabled = true;
      button.textContent = "Sending...";
    } else {
      button.disabled = false;
      button.textContent = label || button.dataset.originalLabel || button.textContent;
    }
  }

  function collect(form) {
    const data = {};
    new FormData(form).forEach(function (value, key) {
      if (key === "remember") return;
      data[key] = String(value).trim();
    });
    return data;
  }

  function friendlyError(error) {
    const code = error && error.code ? error.code : "";
    if (code === "permission-denied") {
      return "The server rejected this submission. Please check your Firestore security rules.";
    }
    if (code === "unavailable" || code === "network-request-failed") {
      return "Network error. Please check your connection and try again.";
    }
    if (code === "resource-exhausted") {
      return "Too many requests right now. Please try again in a moment.";
    }
    return "Something went wrong while sending. Please try again.";
  }

  function initForms() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll("form[data-form]").forEach(function (form) {
      if (form.dataset.form === "login") return;

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        clearFeedback(form);

        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const kind = form.dataset.form;
        const collectionName = kind === "consultation" ? "consultations" : "contactMessages";
        const button = form.querySelector('button[type="submit"]');
        const success = form.querySelector(".form-success");

        setLoading(button, true);

        getApi()
          .then(function (api) {
            if (!api) {
              throw new Error("not-configured");
            }
            const payload = collect(form);
            payload.status = "new";
            payload.createdAt = api.fns.serverTimestamp();
            return api.fns.addDoc(api.fns.collection(api.db, collectionName), payload);
          })
          .then(function () {
            form.reset();
            setLoading(button, false);
            if (success) {
              success.classList.add("show");
              try {
                success.scrollIntoView({
                  behavior: reduceMotion ? "auto" : "smooth",
                  block: "nearest"
                });
              } catch (error) {
                /* ignore scroll errors */
              }
            }
          })
          .catch(function (error) {
            setLoading(button, false);
            if (error && error.message === "not-configured") {
              showError(
                form,
                "The database is not connected yet. Add your Firebase config to js/firebase-config.js."
              );
              return;
            }
            console.error("[Qubit] Form submission failed:", error);
            showError(form, friendlyError(error));
          });
      });
    });
  }

  global.QubitModules = global.QubitModules || {};
  global.QubitModules.forms = { init: initForms };
})(window);
