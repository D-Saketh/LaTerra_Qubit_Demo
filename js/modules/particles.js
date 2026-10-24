(function (global) {
  "use strict";

  function initParticles() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
  }

  global.QubitModules = global.QubitModules || {};
  global.QubitModules.particles = { init: initParticles };
})(window);
