(function (global) {
  "use strict";

  let started = false;
  const unsubscribes = [];
  let serviceCache = {};

  const STATUS_OPTIONS = {
    messages: ["new", "read", "replied"],
    consultations: ["new", "contacted", "closed"]
  };

  function ready() {
    if (global.QubitFirebaseReady) return global.QubitFirebaseReady;
    return Promise.resolve(global.QubitFirebase || null);
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(timestamp) {
    try {
      if (!timestamp || typeof timestamp.toDate !== "function") return "—";
      return timestamp.toDate().toLocaleString();
    } catch (error) {
      return "—";
    }
  }

  function normalizeStatus(panel, status) {
    const allowed = STATUS_OPTIONS[panel];
    return allowed.indexOf(status) >= 0 ? status : allowed[0];
  }

  function statusOptions(panel, current) {
    return STATUS_OPTIONS[panel]
      .map(function (status) {
        return (
          '<option value="' + status + '"' + (status === current ? " selected" : "") + ">" +
          status +
          "</option>"
        );
      })
      .join("");
  }

  function showStatus(message, type) {
    const el = document.querySelector("[data-dash-status]");
    if (!el) return;
    el.textContent = message;
    el.className = "dash-status show " + (type || "info");
    window.clearTimeout(showStatus.timer);
    showStatus.timer = window.setTimeout(function () {
      el.classList.remove("show");
    }, 5000);
  }

  function listError(panel, error) {
    const list = document.querySelector('[data-list="' + panel + '"]');
    if (!list) return;
    console.error("[Qubit] Dashboard listener failed:", error);
    list.innerHTML =
      '<p class="dash-empty">Could not load data. Check Firestore rules and your connection.</p>';
  }

  function bindListActions(api, panel, collectionName) {
    const list = document.querySelector('[data-list="' + panel + '"]');
    if (!list) return;

    list.addEventListener("change", function (event) {
      if (!event.target.matches("[data-status]")) return;
      const item = event.target.closest(".dash-item");
      if (!item) return;

      api.fns
        .updateDoc(api.fns.doc(api.db, collectionName, item.dataset.id), {
          status: event.target.value
        })
        .then(function () {
          showStatus("Status updated.", "success");
        })
        .catch(function (error) {
          console.error(error);
          showStatus("Could not update status.", "error");
        });
    });

    list.addEventListener("click", function (event) {
      const button = event.target.closest("[data-delete]");
      if (!button) return;
      const item = button.closest(".dash-item");
      if (!item) return;
      if (!window.confirm("Delete this entry permanently?")) return;

      api.fns
        .deleteDoc(api.fns.doc(api.db, collectionName, item.dataset.id))
        .then(function () {
          showStatus("Entry deleted.", "success");
        })
        .catch(function (error) {
          console.error(error);
          showStatus("Could not delete entry.", "error");
        });
    });
  }

  function renderMessages(items) {
    const list = document.querySelector('[data-list="messages"]');
    if (!list) return;

    list.innerHTML =
      items
        .map(function (item) {
          const status = normalizeStatus("messages", item.status);
          const meta = [item.company, item.topic, formatDate(item.createdAt)]
            .filter(Boolean)
            .map(esc)
            .join(" &middot; ");

          return (
            '<article class="dash-item" data-id="' + esc(item.id) + '">' +
            '<div class="dash-item-head">' +
            "<div><strong>" + esc(item.name || "Unknown") + "</strong> " +
            '<a class="dash-link" href="mailto:' + esc(item.email || "") + '">' + esc(item.email || "") + "</a></div>" +
            '<span class="status-pill status-' + status + '">' + status + "</span>" +
            "</div>" +
            '<p class="dash-meta">' + meta + "</p>" +
            '<p class="dash-body">' + esc(item.message || "") + "</p>" +
            '<div class="dash-item-actions">' +
            '<label class="dash-inline">Status <select data-status>' + statusOptions("messages", status) + "</select></label>" +
            '<button class="btn btn-secondary" type="button" data-delete>Delete</button>' +
            "</div>" +
            "</article>"
          );
        })
        .join("") || '<p class="dash-empty">No contact messages yet.</p>';

    updateStats("messages", items);
  }

  function renderConsultations(items) {
    const list = document.querySelector('[data-list="consultations"]');
    if (!list) return;

    list.innerHTML =
      items
        .map(function (item) {
          const status = normalizeStatus("consultations", item.status);
          const meta = [item.company, item.interest, formatDate(item.createdAt)]
            .filter(Boolean)
            .map(esc)
            .join(" &middot; ");

          return (
            '<article class="dash-item" data-id="' + esc(item.id) + '">' +
            '<div class="dash-item-head">' +
            "<div><strong>" + esc(item.name || "Unknown") + "</strong> " +
            '<a class="dash-link" href="mailto:' + esc(item.email || "") + '">' + esc(item.email || "") + "</a></div>" +
            '<span class="status-pill status-' + status + '">' + status + "</span>" +
            "</div>" +
            '<p class="dash-meta">' + meta + "</p>" +
            '<p class="dash-body">' + esc(item.message || "") + "</p>" +
            '<div class="dash-item-actions">' +
            '<label class="dash-inline">Status <select data-status>' + statusOptions("consultations", status) + "</select></label>" +
            '<button class="btn btn-secondary" type="button" data-delete>Delete</button>' +
            "</div>" +
            "</article>"
          );
        })
        .join("") || '<p class="dash-empty">No consultation requests yet.</p>';

    updateStats("consultations", items);
  }

  function updateStats(panel, items) {
    if (panel === "services") {
      setStat("services", items.length);
      return;
    }
    setStat(panel, items.length);
    if (panel === "messages") {
      setStat(
        "new",
        items.filter(function (item) {
          return normalizeStatus("messages", item.status) === "new";
        }).length
      );
    }
  }

  function setStat(name, value) {
    document.querySelectorAll('[data-stat="' + name + '"]').forEach(function (el) {
      el.textContent = String(value);
    });
  }

  function renderServices(items) {
    const list = document.querySelector('[data-list="services"]');
    if (!list) return;

    serviceCache = {};
    items.forEach(function (item) {
      serviceCache[item.id] = item;
    });

    list.innerHTML =
      items
        .map(function (item) {
          const active = item.active !== false;
          const status = active ? "active" : "inactive";
          return (
            '<article class="dash-item" data-id="' + esc(item.id) + '">' +
            '<div class="dash-item-head">' +
            "<div><strong>" + esc(item.title || "Untitled service") + "</strong> " +
            '<span class="dash-meta-inline">order ' + esc(item.order == null ? "—" : item.order) + "</span></div>" +
            '<span class="status-pill status-' + status + '">' + status + "</span>" +
            "</div>" +
            '<p class="dash-body">' + esc(item.description || "") + "</p>" +
            '<div class="dash-item-actions">' +
            '<button class="btn btn-secondary" type="button" data-edit>Edit</button>' +
            '<button class="btn btn-secondary" type="button" data-toggle>' + (active ? "Deactivate" : "Activate") + "</button>" +
            '<button class="btn btn-secondary" type="button" data-delete>Delete</button>' +
            "</div>" +
            "</article>"
          );
        })
        .join("") || '<p class="dash-empty">No services in the database. Use "Load default content" above.</p>';

    updateStats("services", items);
  }

  function listenCollection(api, name, render) {
    const field = name === "services" ? "order" : "createdAt";
    const direction = name === "services" ? "asc" : "desc";
    unsubscribes.push(
      api.fns.onSnapshot(
        api.fns.query(api.fns.collection(api.db, name), api.fns.orderBy(field, direction)),
        function (snapshot) {
          const items = [];
          snapshot.forEach(function (docSnap) {
            items.push(Object.assign({}, docSnap.data(), { id: docSnap.id }));
          });
          render(items);
        },
        function (error) {
          listError(name === "contactMessages" ? "messages" : name, error);
        }
      )
    );
  }

  function initServiceForm(api) {
    const form = document.querySelector("[data-service-form]");
    if (!form) return;

    const fields = {
      id: form.querySelector('[name="serviceId"]'),
      title: form.querySelector('[name="title"]'),
      description: form.querySelector('[name="description"]'),
      bullets: form.querySelector('[name="bullets"]'),
      icon: form.querySelector('[name="icon"]'),
      order: form.querySelector('[name="order"]'),
      active: form.querySelector('[name="active"]')
    };
    const submit = form.querySelector('button[type="submit"]');
    const cancel = form.querySelector("[data-cancel-edit]");

    function reset() {
      form.reset();
      fields.id.value = "";
      fields.active.checked = true;
      submit.textContent = "Add service";
      if (cancel) cancel.hidden = true;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const payload = {
        title: fields.title.value.trim(),
        description: fields.description.value.trim(),
        icon: fields.icon.value,
        order: Number(fields.order.value) || 0,
        active: fields.active.checked,
        bullets: fields.bullets.value
          .split("\n")
          .map(function (line) {
            return line.trim();
          })
          .filter(Boolean),
        updatedAt: api.fns.serverTimestamp()
      };

      if (!payload.title || !payload.description) {
        showStatus("Title and description are required.", "error");
        return;
      }

      submit.disabled = true;
      const editingId = fields.id.value;
      const operation = editingId
        ? api.fns.updateDoc(api.fns.doc(api.db, "services", editingId), payload)
        : api.fns.addDoc(api.fns.collection(api.db, "services"), payload);

      operation
        .then(function () {
          showStatus(editingId ? "Service updated." : "Service added.", "success");
          reset();
        })
        .catch(function (error) {
          console.error(error);
          showStatus("Could not save the service.", "error");
        })
        .finally(function () {
          submit.disabled = false;
        });
    });

    if (cancel) {
      cancel.addEventListener("click", reset);
    }

    form.addEventListener("click", function (event) {
      if (!event.target.matches("[data-cancel-edit]")) return;
      reset();
    });

    const list = document.querySelector('[data-list="services"]');
    if (!list) return;

    list.addEventListener("click", function (event) {
      const item = event.target.closest(".dash-item");
      if (!item) return;
      const data = serviceCache[item.dataset.id];
      if (!data) return;

      if (event.target.matches("[data-edit]")) {
        fields.id.value = data.id;
        fields.title.value = data.title || "";
        fields.description.value = data.description || "";
        fields.bullets.value = Array.isArray(data.bullets) ? data.bullets.join("\n") : "";
        fields.icon.value = data.icon || "quantum";
        fields.order.value = data.order == null ? 0 : data.order;
        fields.active.checked = data.active !== false;
        submit.textContent = "Update service";
        if (cancel) cancel.hidden = false;
        form.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      if (event.target.matches("[data-toggle]")) {
        api.fns
          .updateDoc(api.fns.doc(api.db, "services", data.id), { active: data.active === false })
          .then(function () {
            showStatus(data.active === false ? "Service activated." : "Service deactivated.", "success");
          })
          .catch(function (error) {
            console.error(error);
            showStatus("Could not update the service.", "error");
          });
      }

      if (event.target.matches("[data-delete]")) {
        if (!window.confirm("Delete this service permanently?")) return;
        api.fns
          .deleteDoc(api.fns.doc(api.db, "services", data.id))
          .then(function () {
            showStatus("Service deleted.", "success");
          })
          .catch(function (error) {
            console.error(error);
            showStatus("Could not delete the service.", "error");
          });
      }
    });
  }

  function initSiteForm(api) {
    const form = document.querySelector("[data-site-form]");
    if (!form) return;

    const fieldNames = [
      "heroTitleBefore",
      "heroTitleHighlight",
      "heroTitleAfter",
      "heroSubtitle",
      "servicesSubtitle",
      "footerDescription",
      "contactEmail",
      "contactPhone",
      "contactAddress"
    ];

    api.fns
      .getDoc(api.fns.doc(api.db, "site", "main"))
      .then(function (snapshot) {
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        fieldNames.forEach(function (name) {
          const input = form.querySelector('[name="' + name + '"]');
          if (input && typeof data[name] === "string") input.value = data[name];
        });
      })
      .catch(function (error) {
        console.warn("[Qubit] Could not load site content:", error);
      });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const payload = { updatedAt: api.fns.serverTimestamp() };
      fieldNames.forEach(function (name) {
        const input = form.querySelector('[name="' + name + '"]');
        if (!input) return;
        // Preserve the spaces around the hero highlight span.
        payload[name] =
          name === "heroTitleBefore" || name === "heroTitleAfter"
            ? input.value
            : input.value.trim();
      });

      const save = form.querySelector('button[type="submit"]');
      save.disabled = true;
      save.textContent = "Saving...";

      api.fns
        .setDoc(api.fns.doc(api.db, "site", "main"), payload, { merge: true })
        .then(function () {
          showStatus("Site content saved. Public pages update live.", "success");
        })
        .catch(function (error) {
          console.error(error);
          showStatus("Could not save site content.", "error");
        })
        .finally(function () {
          save.disabled = false;
          save.textContent = "Save content";
        });
    });
  }

  function initSeed(api) {
    const button = document.querySelector("[data-seed]");
    if (!button) return;

    button.addEventListener("click", function () {
      const defaults = global.QUBIT_DEFAULT_CONTENT;
      if (!defaults) {
        showStatus("Default content file is missing.", "error");
        return;
      }
      if (
        !window.confirm(
          "This writes the default site content and 10 services to Firestore. Existing values for these fields will be overwritten. Continue?"
        )
      ) {
        return;
      }

      button.disabled = true;
      button.textContent = "Loading...";

      const batch = api.fns.writeBatch(api.db);
      batch.set(
        api.fns.doc(api.db, "site", "main"),
        Object.assign({}, defaults.site, { updatedAt: api.fns.serverTimestamp() }),
        { merge: true }
      );

      defaults.services.forEach(function (service) {
        const id = service.id;
        const data = Object.assign({}, service);
        delete data.id;
        data.updatedAt = api.fns.serverTimestamp();
        batch.set(api.fns.doc(api.db, "services", id), data, { merge: true });
      });

      batch
        .commit()
        .then(function () {
          showStatus("Default content loaded into Firestore.", "success");
        })
        .catch(function (error) {
          console.error(error);
          showStatus("Could not seed content. Are you signed in as an admin?", "error");
        })
        .finally(function () {
          button.disabled = false;
          button.textContent = "Load default content";
        });
    });
  }

  function start(api) {
    bindListActions(api, "messages", "contactMessages");
    bindListActions(api, "consultations", "consultations");

    listenCollection(api, "contactMessages", renderMessages);
    listenCollection(api, "consultations", renderConsultations);
    listenCollection(api, "services", renderServices);

    initServiceForm(api);
    initSiteForm(api);
    initSeed(api);
  }

  function initDashboard() {
    const root = document.querySelector("[data-dash-root]");
    if (!root) return;

    const loading = document.querySelector("[data-dash-loading]");
    const setup = document.querySelector("[data-dash-setup]");

    ready().then(function (api) {
      if (!api) {
        if (loading) loading.hidden = true;
        if (setup) setup.hidden = false;
        root.hidden = false;
        return;
      }

      api.fns.onAuthStateChanged(api.auth, function (user) {
        if (!user) {
          window.location.replace("login.html?next=dashboard.html");
          return;
        }
        if (started) return;
        started = true;

        document.querySelectorAll("[data-auth-email]").forEach(function (el) {
          el.textContent = user.email || "admin";
        });

        if (loading) loading.hidden = true;
        root.hidden = false;
        start(api);
      });
    });
  }

  global.QubitModules = global.QubitModules || {};
  global.QubitModules.dashboard = { init: initDashboard };
})(window);
