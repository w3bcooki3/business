/* Farmacia Luz — language toggle, menu, open-now status. No dependencies. */
(function () {
  "use strict";
  var root = document.documentElement;
  var KEY = "luz-lang";

  /* ---------- Language ---------- */
  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* storage blocked */ } }
  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }

  function applyLang(lang) {
    lang = lang === "es" ? "es" : "en";
    root.setAttribute("lang", lang);
    var t = root.getAttribute("data-title-" + lang);
    if (t) document.title = t;
    var md = document.querySelector('meta[name="description"]');
    var d = root.getAttribute("data-desc-" + lang);
    if (md && d) md.setAttribute("content", d);
    // attributes that carry text: data-en-aria-label / data-es-aria-label, data-en-href / data-es-href
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(/\s+/).forEach(function (attr) {
        var v = el.getAttribute("data-" + lang + "-" + attr);
        if (v !== null) el.setAttribute(attr, v);
      });
    });
    document.querySelectorAll(".lang-toggle button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-set-lang") === lang ? "true" : "false");
    });
  }

  var initial = saved();
  if (!initial) {
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
    initial = /^es\b/i.test(nav) ? "es" : "en";
  }
  applyLang(initial);

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-set-lang]");
    if (!b) return;
    var l = b.getAttribute("data-set-lang");
    applyLang(l); store(l);
  });

  /* ---------- Mobile menu ---------- */
  var btn = document.querySelector(".menu-btn");
  var menu = document.getElementById("site-nav");
  if (btn && menu) {
    function setOpen(open) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      menu.classList.toggle("is-open", open);
    }
    btn.addEventListener("click", function () { setOpen(btn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { setOpen(false); btn.focus(); }
    });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
  }

  /* ---------- Open now (America/New_York) ---------- */
  // [open, close] in minutes after midnight; index 0 = Sunday
  var HOURS = [[600, 1080], [540, 1260], [540, 1260], [540, 1260], [540, 1260], [540, 1260], [540, 1260]];
  var DAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function nyNow() {
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23"
      }).formatToParts(new Date());
      var o = {};
      parts.forEach(function (p) { o[p.type] = p.value; });
      return { day: DAYS[o.weekday], min: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }
  function fmt(min, lang) {
    var h = Math.floor(min / 60), m = min % 60;
    if (lang === "es") return h + (m ? ":" + (m < 10 ? "0" : "") + m : ":00");
    var h12 = h % 12 || 12;
    return h12 + (m ? ":" + (m < 10 ? "0" : "") + m : "") + (h < 12 ? " am" : " pm");
  }
  var dayEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var dayEs = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

  function status() {
    var n = nyNow(), h = HOURS[n.day], en, es, cls = "";
    if (n.min >= h[0] && n.min < h[1]) {
      var left = h[1] - n.min;
      if (left <= 60) {
        cls = "is-soon";
        en = "Open — closes at " + fmt(h[1], "en");
        es = "Abierto — cerramos a las " + fmt(h[1], "es");
      } else {
        en = "Open now until " + fmt(h[1], "en");
        es = "Abierto ahora hasta las " + fmt(h[1], "es");
      }
    } else {
      cls = "is-closed";
      var nd = n.day, when;
      if (n.min < h[0]) { when = "today"; }
      else { nd = (n.day + 1) % 7; when = "tomorrow"; }
      var o = HOURS[nd][0];
      en = "Closed — opens " + (when === "today" ? "today" : "tomorrow") + " at " + fmt(o, "en");
      es = "Cerrado — abrimos " + (when === "today" ? "hoy" : "mañana") + " a las " + fmt(o, "es");
    }
    document.querySelectorAll("[data-status]").forEach(function (el) {
      el.classList.remove("is-closed", "is-soon");
      if (cls) el.classList.add(cls);
      var e1 = el.querySelector('[data-l="en"]'), e2 = el.querySelector('[data-l="es"]');
      if (e1) e1.textContent = en;
      if (e2) e2.textContent = es;
    });
    document.querySelectorAll("[data-day]").forEach(function (row) {
      row.classList.toggle("today", +row.getAttribute("data-day") === n.day);
    });
  }
  status();
  setInterval(status, 60000);

  /* footer year */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
