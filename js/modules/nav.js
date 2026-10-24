(function (global) {
  "use strict";

  function initNav() {
    const navbar = document.querySelector(".navbar");
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");
    if (!navbar || !navToggle || !navMenu) return;

    function closeMenu() {
      navMenu.classList.remove("open");
      document.body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation");
    }

    navToggle.addEventListener("click", function () {
      const isOpen = navMenu.classList.toggle("open");
      document.body.classList.toggle("nav-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) closeMenu();
    });

    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-link:not(.nav-cta)").forEach(function (link) {
      const target = link.getAttribute("href").split("#")[0];
      if (target === path) link.classList.add("active");
    });

    function onScroll() {
      navbar.classList.toggle("scrolled", window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  global.QubitModules = global.QubitModules || {};
  global.QubitModules.nav = { init: initNav };
})(window);
