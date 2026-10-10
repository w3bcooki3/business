/* Verbena Pharmacy: menu, open-now status, today's hours, insurance finder. No dependencies. */
(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("site-nav");
  if (btn && nav) {
    var label = btn.querySelector(".lbl");
    var setOpen = function (open) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (label) label.textContent = open ? "Close" : "Menu";
      nav.classList.toggle("is-open", open);
    };
    btn.addEventListener("click", function () { setOpen(btn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { setOpen(false); btn.focus(); }
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 779) setOpen(false); });
  }

  /* ---------- Open now (America/New_York) ---------- */
  // [open, close] minutes after midnight; index 0 = Sunday
  var HOURS = [[600, 960], [540, 1200], [540, 1200], [540, 1200], [540, 1200], [540, 1200], [540, 1080]];
  var DAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  var NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function nyNow() {
    try {
      var o = {};
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23"
      }).formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
      return { day: DAYS[o.weekday], min: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }
  function fmt(min) {
    var h = Math.floor(min / 60), m = min % 60, ap = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return h + (m ? ":" + (m < 10 ? "0" : "") + m : "") + ap;
  }
  function statusText() {
    var n = nyNow(), t = HOURS[n.day];
    if (n.min >= t[0] && n.min < t[1]) {
      var left = t[1] - n.min;
      return { open: true, text: left <= 60 ? "Open now, closing soon at " + fmt(t[1]) : "Open now until " + fmt(t[1]) };
    }
    if (n.min < t[0]) return { open: false, text: "Closed now. Opens today at " + fmt(t[0]) };
    var nd = (n.day + 1) % 7;
    return { open: false, text: "Closed now. Opens " + (nd === 0 ? "Sunday" : "tomorrow") + " at " + fmt(HOURS[nd][0]) };
  }
  var st = statusText(), now = nyNow();
  document.querySelectorAll("[data-status]").forEach(function (el) {
    el.classList.toggle("is-closed", !st.open);
    var t = el.querySelector(".txt");
    if (t) t.textContent = st.text;
  });
  document.querySelectorAll("[data-day]").forEach(function (row) {
    var days = row.getAttribute("data-day").split(",").map(Number);
    if (days.indexOf(now.day) !== -1) row.classList.add("today");
  });
  document.querySelectorAll("[data-today-hours]").forEach(function (el) {
    var t = HOURS[now.day];
    el.textContent = NAMES[now.day] + " " + fmt(t[0]) + "–" + fmt(t[1]);
  });

  /* ---------- Insurance finder (filter only, never submits) ---------- */
  document.querySelectorAll("[data-finder]").forEach(function (box) {
    var form = box.querySelector("form");
    var input = box.querySelector("input");
    var out = box.querySelector(".verdict");
    var items = Array.prototype.slice.call(box.querySelectorAll(".plans li"));
    if (!input || !out) return;
    var idle = out.innerHTML;

    function norm(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
    function run() {
      var q = norm(input.value);
      var hits = [];
      items.forEach(function (li) {
        var hay = norm(li.textContent + " " + (li.getAttribute("data-alt") || ""));
        var match = q.length > 0 && hay.indexOf(q) !== -1;
        li.classList.toggle("hit", match);
        li.hidden = q.length > 1 && !match;
        if (match) hits.push(li.textContent.trim());
      });
      if (!q) {
        out.removeAttribute("data-state"); out.innerHTML = idle;
        items.forEach(function (li) { li.hidden = false; });
        return;
      }
      if (hits.length) {
        out.setAttribute("data-state", "yes");
        out.textContent = hits.length === 1
          ? "Yes, we take " + hits[0] + ". Bring your card the first time, or text us a photo of it."
          : "Yes, we take " + hits.slice(0, 3).join(", ") + (hits.length > 3 ? " and " + (hits.length - 3) + " more" : "") + ".";
      } else {
        out.setAttribute("data-state", "no");
        out.innerHTML = "Not on our list yet. Call <a href=\"tel:+17185550116\">(718) 555-0116</a> and we’ll check your plan in about 2 minutes. Many plans run through a manager we already take.";
      }
    }
    input.addEventListener("input", run);
    if (form) form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  });
})();
