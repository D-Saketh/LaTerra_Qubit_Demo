(function () {
  "use strict";

  const navbar = document.querySelector(".navbar");
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile navigation ---------- */
  function closeMenu() {
    if (!navMenu) return;
    navMenu.classList.remove("open");
    document.body.classList.remove("nav-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation");
    }
  }

  if (navToggle && navMenu) {
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
  }

  /* ---------- Active navigation link ---------- */
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link:not(.nav-cta)").forEach(function (link) {
    const target = link.getAttribute("href").split("#")[0];
    if (target === path) link.classList.add("active");
  });

  /* ---------- Navbar shadow on scroll ---------- */
  function onScroll() {
    if (!navbar) return;
    navbar.classList.toggle("scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Footer year ---------- */
  document.querySelectorAll("#year").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("visible");
    });
  } else {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el, index) {
      el.style.transitionDelay = Math.min(index % 3, 2) * 70 + "ms";
      observer.observe(el);
    });
  }

  /* ---------- Forms (front-end demo handling) ---------- */
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
          success.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
        }
      }, 550);
    });
  });

  /* ---------- Password visibility (login) ---------- */
  const passwordToggle = document.getElementById("togglePassword");
  if (passwordToggle) {
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

  /* ---------- Subtle particle field ---------- */
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dots = [];
  let animationId = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(24, Math.min(64, Math.round(width / 26)));
    dots = Array.from({ length: count }, function () {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.6 + 0.6,
        hue: Math.random() > 0.5 ? "79, 70, 229" : "6, 182, 212",
      };
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];

      if (!reduceMotion) {
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (dot.x < -20) dot.x = width + 20;
        if (dot.x > width + 20) dot.x = -20;
        if (dot.y < -20) dot.y = height + 20;
        if (dot.y > height + 20) dot.y = -20;
      }

      ctx.beginPath();
      ctx.fillStyle = "rgba(" + dot.hue + ", 0.45)";
      ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < dots.length; j++) {
        const other = dots[j];
        const dx = dot.x - other.x;
        const dy = dot.y - other.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 130) {
          ctx.beginPath();
          ctx.strokeStyle = "rgba(79, 70, 229, " + (0.09 * (1 - distance / 130)).toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.moveTo(dot.x, dot.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    }

    if (!reduceMotion) animationId = window.requestAnimationFrame(draw);
  }

  resize();
  draw();

  let resizeTimer;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      window.cancelAnimationFrame(animationId);
      resize();
      draw();
    }, 180);
  });
})();
