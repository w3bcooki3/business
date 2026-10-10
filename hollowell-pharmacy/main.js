(function () {
  "use strict";

  var PHONE = "+17185550142";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("site-nav");
  function setMenu(open, returnFocus) {
    menuBtn.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    if (!open && returnFocus) menuBtn.focus();
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) setMenu(false, true);
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !e.target.closest(".site-header")) setMenu(false);
    });
    window.matchMedia("(min-width: 1200px)").addEventListener("change", function () { setMenu(false); });
  }

  /* ---------- Open status (America/New_York) ---------- */
  var HOURS = { 0: [10, 18], 1: [9, 21], 2: [9, 21], 3: [9, 21], 4: [9, 21], 5: [9, 21], 6: [9, 21] };
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function fmt(h) { return (h % 12 || 12) + (h < 12 ? " am" : " pm"); }
  function nyNow() {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false
    }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday);
    return { day: day, mins: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
  }
  function updateStatus() {
    var el = document.getElementById("status");
    if (!el) return;
    var n = nyNow(), h = HOURS[n.day], text, open = false;
    if (n.mins >= h[0] * 60 && n.mins < h[1] * 60) {
      open = true;
      var left = h[1] * 60 - n.mins;
      text = left <= 60 ? "Open now, closing soon at " + fmt(h[1]) : "Open now until " + fmt(h[1]);
    } else if (n.mins < h[0] * 60) {
      text = "Closed now. Opens today at " + fmt(h[0]);
    } else {
      var nd = (n.day + 1) % 7;
      text = "Closed now. Opens " + (nd === 0 ? "Sunday" : "tomorrow") + " at " + fmt(HOURS[nd][0]);
    }
    el.classList.toggle("is-open", open);
    el.classList.toggle("is-closed", !open);
    el.querySelector(".status__text").textContent = text;

    var rows = document.querySelectorAll(".hours tr");
    rows.forEach(function (tr) {
      var today = Number(tr.getAttribute("data-day")) === n.day;
      tr.classList.toggle("is-today", today);
      var th = tr.querySelector("th");
      var tag = th.querySelector(".today-tag");
      if (today && !tag) {
        tag = document.createElement("span");
        tag.className = "today-tag";
        tag.textContent = "Today";
        th.appendChild(tag);
      } else if (!today && tag) {
        tag.remove();
      }
    });
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  /* ---------- Greeting cycle ---------- */
  var GREETINGS = [
    { w: "Bonjou!", l: "Kreyòl", lang: "ht" },
    { w: "¡Hola!", l: "Español", lang: "es" },
    { w: "Bonjour!", l: "Français", lang: "fr" },
    { w: "Hello!", l: "English", lang: "en" }
  ];
  var word = document.querySelector(".greet__word");
  var label = document.querySelector(".greet__lang");
  var pauseBtn = document.querySelector(".greet__pause");
  var gi = 0, timer = null, userPaused = false;

  function showGreeting(i) {
    var g = GREETINGS[i];
    word.textContent = g.w;
    word.setAttribute("lang", g.lang);
    label.textContent = g.l;
    if (!reduceMotion.matches) {
      word.classList.remove("is-swapping");
      void word.offsetWidth;
      word.classList.add("is-swapping");
    }
  }
  function setPauseUi(paused) {
    pauseBtn.setAttribute("aria-pressed", String(paused));
    pauseBtn.setAttribute("aria-label", paused ? "Play the greeting" : "Pause the greeting");
    pauseBtn.querySelector("use").setAttribute("href", paused ? "#i-play" : "#i-pause");
  }
  function start() {
    stop();
    timer = setInterval(function () { gi = (gi + 1) % GREETINGS.length; showGreeting(gi); }, 2600);
    setPauseUi(false);
  }
  function stop() { if (timer) clearInterval(timer); timer = null; setPauseUi(true); }
  if (word && label && pauseBtn) {
    pauseBtn.addEventListener("click", function () {
      userPaused = !!timer;
      if (timer) stop(); else start();
    });
    if (reduceMotion.matches) stop(); else start();
    reduceMotion.addEventListener("change", function () {
      if (reduceMotion.matches) stop(); else if (!userPaused) start();
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { if (timer) { clearInterval(timer); timer = null; } }
      else if (!userPaused && !reduceMotion.matches) start();
    });
  }

  /* ---------- Choice groups (single-select toggle buttons) ---------- */
  function value(group) {
    var b = document.querySelector('[data-group="' + group + '"] [aria-pressed="true"]');
    return b ? b.getAttribute("data-value") : "";
  }
  document.querySelectorAll(".choice__opts").forEach(function (grp) {
    grp.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      grp.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      updateBuilders();
    });
  });

  function smsHref(body) { return "sms:" + PHONE + "?body=" + encodeURIComponent(body); }

  var WHEN_NOTES = {
    "in more than 6 weeks": "Good timing. That leaves room for vaccines that need more than one dose.",
    "in 2 to 6 weeks": "Book soon. Most vaccines need about two weeks to start working.",
    "in less than 2 weeks": "Come in anyway. Some protection still helps, and we can sort your travel kit and refills."
  };

  function updateBuilders() {
    var dest = value("dest"), when = value("when");
    var consult = document.getElementById("consult-link");
    if (consult) {
      consult.href = smsHref("Hi Hollowell Pharmacy, I'm travelling to " + dest + " " + when +
        ". I'd like to book a travel health consult. When are you free?");
      document.getElementById("when-note").textContent = WHEN_NOTES[when] || "";
    }
    var how = value("how"), day = value("day"), lang = value("lang");
    var msg = "Hi Hollowell Pharmacy, I'd like to refill my prescription. " + how + ", " + day +
      ". Please reply in " + lang + ".";
    var full = msg + "\nName:\nDate of birth:\nRx number:";
    var prev = document.getElementById("refill-preview");
    if (prev) {
      prev.textContent = "";
      full.split("\n").forEach(function (line, i) {
        if (i) prev.appendChild(document.createElement("br"));
        prev.appendChild(document.createTextNode(line.replace("I'd", "I’d")));
      });
      document.getElementById("refill-link").href = smsHref(full);
    }
  }
  updateBuilders();

  /* ---------- Trip checklist (remembered on this device) ---------- */
  var KEY = "hollowell-trip";
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { saved = {}; }
  var ticks = document.querySelectorAll(".tick");
  var count = document.getElementById("check-count");
  function refreshCount() {
    var done = document.querySelectorAll('.tick[aria-pressed="true"]').length;
    if (count) count.textContent = done === ticks.length ? "All " + done + " done. Safe travels!" : done + " of " + ticks.length + " done";
  }
  ticks.forEach(function (t) {
    var k = t.getAttribute("data-key");
    if (saved[k]) t.setAttribute("aria-pressed", "true");
    t.addEventListener("click", function () {
      var on = t.getAttribute("aria-pressed") !== "true";
      t.setAttribute("aria-pressed", String(on));
      saved[k] = on;
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) { /* storage unavailable */ }
      refreshCount();
    });
  });
  refreshCount();
})();
