(function (global) {
  "use strict";

  const ICONS = {
    quantum:
      '<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-60 12 12)"/>',
    pqc:
      '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1.3"/>',
    cloud:
      '<path d="M17.5 19a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.2 9.3 4 4 0 0 0 7 17.9"/><path d="M12 12v7"/><path d="m9 16 3 3 3-3"/>',
    qkd:
      '<circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M7.3 10.8 16.7 7.2"/><path d="m7.3 13.2 9.4 3.6"/>',
    hardware:
      '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    software: '<path d="m8 9-3 3 3 3"/><path d="m16 9 3 3-3 3"/><path d="m13 7-2 10"/>',
    hybrid:
      '<circle cx="9" cy="9" r="4.5"/><circle cx="15" cy="15" r="4.5"/><path d="M4.5 15h9"/>',
    ai: '<path d="M12 3v3"/><path d="M12 18v3"/><path d="M3 12h3"/><path d="M18 12h3"/><rect x="7" y="7" width="10" height="10" rx="2"/><circle cx="12" cy="12" r="2"/>',
    enterprise:
      '<path d="M4 20h16"/><path d="M6 20V9l6-5 6 5v11"/><path d="M10 20v-5h4v5"/><path d="M9 11h.01M15 11h.01"/>',
    research:
      '<path d="M9 3h6"/><path d="M10 3v5l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 17l-5-9V3"/><path d="M8 14h8"/>'
  };

  function iconMarkup(key) {
    const inner = ICONS[key] || ICONS.quantum;
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round">' +
      inner +
      "</svg>"
    );
  }

  function setField(name, value) {
    if (typeof value !== "string" || !value.trim()) return;
    document.querySelectorAll('[data-site="' + name + '"]').forEach(function (el) {
      el.textContent = value;
      if (el.tagName === "A" && name === "contact.email") el.href = "mailto:" + value;
      if (el.tagName === "A" && name === "contact.phone") el.href = "tel:" + value.replace(/[^\d+]/g, "");
    });
  }

  function applySite(data) {
    if (!data) return;
    setField("hero.titleBefore", data.heroTitleBefore);
    setField("hero.titleHighlight", data.heroTitleHighlight);
    setField("hero.titleAfter", data.heroTitleAfter);
    setField("hero.subtitle", data.heroSubtitle);
    setField("services.subtitle", data.servicesSubtitle);
    setField("footer.description", data.footerDescription);
    setField("contact.email", data.contactEmail);
    setField("contact.phone", data.contactPhone);
    setField("contact.address", data.contactAddress);
  }

  function renderServices(grid, services) {
    const variant = grid.dataset.servicesVariant || "summary";
    grid.innerHTML = "";

    services.forEach(function (service) {
      const card = document.createElement("article");
      card.className = "service-card reveal";
      card.dataset.serviceId = service.id || "";

      const icon = document.createElement("div");
      icon.className = "service-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML = iconMarkup(service.icon);

      const title = document.createElement("h3");
      title.textContent = service.title || "";

      const description = document.createElement("p");
      description.textContent = service.description || "";

      card.appendChild(icon);
      card.appendChild(title);
      card.appendChild(description);

      if (variant === "full" && Array.isArray(service.bullets) && service.bullets.length) {
        const list = document.createElement("ul");
        list.className = "service-list";
        service.bullets.forEach(function (bullet) {
          const item = document.createElement("li");
          item.textContent = String(bullet);
          list.appendChild(item);
        });
        card.appendChild(list);
      }

      grid.appendChild(card);
    });

    if (global.QubitModules && global.QubitModules.reveal && global.QubitModules.reveal.refresh) {
      global.QubitModules.reveal.refresh();
    }
  }

  function initContent() {
    const ready = global.QubitFirebaseReady || Promise.resolve(global.QubitFirebase || null);

    ready.then(function (api) {
      if (!api) return;
      const db = api.db;
      const f = api.fns;

      try {
        f.onSnapshot(
          f.doc(db, "site", "main"),
          function (snapshot) {
            if (snapshot.exists()) applySite(snapshot.data());
          },
          function (error) {
            console.warn("[Qubit] Could not load site content:", error);
          }
        );

        document.querySelectorAll("[data-services-grid]").forEach(function (grid) {
          f.onSnapshot(
            f.query(f.collection(db, "services"), f.orderBy("order")),
            function (snapshot) {
              if (snapshot.size === 0) return;
              const services = [];
              snapshot.forEach(function (docSnap) {
                const data = docSnap.data();
                if (data.active === false) return;
                services.push(Object.assign({}, data, { id: docSnap.id }));
              });
              renderServices(grid, services);
            },
            function (error) {
              console.warn("[Qubit] Could not load services:", error);
            }
          );
        });
      } catch (error) {
        console.warn("[Qubit] Content hydration skipped:", error);
      }
    });
  }

  global.QubitModules = global.QubitModules || {};
  global.QubitModules.content = { init: initContent };
})(window);
