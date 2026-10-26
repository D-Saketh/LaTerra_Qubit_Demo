(function () {
  "use strict";
  const modules = window.QubitModules || {};
  function init() {
    if (modules.nav && typeof modules.nav.init === "function") modules.nav.init();
    if (modules.footer && typeof modules.footer.init === "function") modules.footer.init();
    if (modules.reveal && typeof modules.reveal.init === "function") modules.reveal.init();
    if (modules.forms && typeof modules.forms.init === "function") modules.forms.init();
    if (modules.auth && typeof modules.auth.init === "function") modules.auth.init();
    if (modules.content && typeof modules.content.init === "function") modules.content.init();
    if (modules.dashboard && typeof modules.dashboard.init === "function") modules.dashboard.init();
    if (modules.particles && typeof modules.particles.init === "function") modules.particles.init();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
