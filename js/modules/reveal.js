(function (global) {
  "use strict";

  let observer = null;
  let reduceMotion = false;

  function observe(elements) {
    elements.forEach(function (el, index) {
      if (el.classList.contains("visible")) return;
      el.style.transitionDelay = Math.min(index % 3, 2) * 70 + "ms";
      observer.observe(el);
    });
  }

  function initReveal() {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealEls = document.querySelectorAll(".reveal");

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) {
        el.classList.add("visible");
      });
      return;
    }

    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observe(revealEls);
  }

  function refresh() {
    const revealEls = document.querySelectorAll(".reveal:not(.visible)");
    if (!revealEls.length) return;

    if (reduceMotion || !observer) {
      revealEls.forEach(function (el) {
        el.classList.add("visible");
      });
      return;
    }

    observe(revealEls);
  }

  global.QubitModules = global.QubitModules || {};
  global.QubitModules.reveal = { init: initReveal, refresh: refresh };
})(window);
