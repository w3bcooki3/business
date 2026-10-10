/* Stoop Coffee — small, dependency-free behaviours */
(function () {
  "use strict";

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  /* ---------- New York time ---------- */
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  // [open hour, close hour] for Sun..Sat
  var HOURS = [[8, 16], [7, 15], [7, 15], [7, 15], [7, 15], [7, 15], [8, 16]];

  function nyNow() {
    var d = new Date();
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York", hour12: false, weekday: "short", month: "numeric", hour: "numeric", minute: "numeric"
      }).formatToParts(d);
      var o = {};
      parts.forEach(function (p) { o[p.type] = p.value; });
      var wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday);
      var h = parseInt(o.hour, 10) % 24;
      return { day: wd, month: parseInt(o.month, 10) - 1, hour: h, min: parseInt(o.minute, 10) };
    } catch (e) {
      return { day: d.getDay(), month: d.getMonth(), hour: d.getHours(), min: d.getMinutes() };
    }
  }
  function fmtHour(h) {
    var s = h >= 12 ? "pm" : "am";
    var hh = h % 12 === 0 ? 12 : h % 12;
    return hh + s;
  }

  var now = nyNow();
  var today = HOURS[now.day];
  var mins = now.hour * 60 + now.min;
  var isOpen = mins >= today[0] * 60 && mins < today[1] * 60;
  var sub;
  if (isOpen) {
    var left = today[1] * 60 - mins;
    sub = left <= 45 ? "Closing soon: last call by " + fmtHour(today[1]) : "Till " + fmtHour(today[1]) + " today";
  } else if (mins < today[0] * 60) {
    sub = "Opens " + fmtHour(today[0]) + " today";
  } else {
    var nd = (now.day + 1) % 7;
    sub = "Opens " + fmtHour(HOURS[nd][0]) + " tomorrow";
  }
  var hoursToday = fmtHour(today[0]) + "–" + fmtHour(today[1]);

  document.querySelectorAll("[data-status]").forEach(function (el) {
    el.classList.remove("is-open", "is-closed");
    el.classList.add(isOpen ? "is-open" : "is-closed");
  });
  document.querySelectorAll("[data-open-word]").forEach(function (el) {
    el.lastChild.nodeValue = isOpen ? "Open" : "Closed";
  });
  document.querySelectorAll("[data-open-sub]").forEach(function (el) { el.textContent = sub; });
  document.querySelectorAll("[data-today-hours]").forEach(function (el) {
    el.textContent = DAYS[now.day] + " " + hoursToday;
  });
  document.querySelectorAll("[data-chip]").forEach(function (el) {
    el.textContent = (isOpen ? "Open now · " : "Closed · ") + sub.toLowerCase().replace(/^till/, "till");
  });
  document.querySelectorAll(".hours tr[data-day]").forEach(function (tr) {
    var days = tr.getAttribute("data-day").split(",").map(Number);
    if (days.indexOf(now.day) > -1) tr.classList.add("today");
  });

  /* ---------- stoop weather ---------- */
  function stoopLine(m, h) {
    var line;
    if (m === 11 || m <= 1) line = h < 11 ? "stoop weather for the brave. Lid on, gloves on, sit for one sip." : "sun hits the top step around now. Coat, hat, and a hot one to hold.";
    else if (m === 2) line = "the stoop is thawing. Coat on, face to the sun, latte in both hands.";
    else if (m === 3 || m === 4) line = h < 10 ? "crisp morning stoop. A light jacket and a hot cortado." : "the block is back outside. Grab a step before the neighbors do.";
    else if (m >= 5 && m <= 7) line = h >= 12 ? "hot one out there. Iced, and take the shady side of the steps." : "cool enough for the top step. Cold brew before it gets steamy.";
    else if (m === 8) line = "best month on the block. Warm steps, cool coffee, nobody in a rush.";
    else if (m === 9) line = h < 11 ? "prime stoop weather. Bring a sweater." : "prime stoop weather. Sun on the steps, leaves on the sidewalk.";
    else line = "last good stoop days of the year. Scarf, hot chai, sit while you can.";
    return line;
  }
  var wl = MONTHS[now.month] + ", " + fmtHour(now.hour);
  var cap = function (t) { return t.charAt(0).toUpperCase() + t.slice(1); };
  var wtext = cap(stoopLine(now.month, now.hour));
  if (!isOpen) {
    wtext = mins < today[0] * 60
      ? "The window opens at " + fmtHour(today[0]) + ". " + wtext
      : "Window's shut for today, but the stoop's still there. " + wtext;
  }
  document.querySelectorAll("[data-weather]").forEach(function (el) {
    el.innerHTML = "";
    var s = document.createElement("strong");
    s.textContent = "Stoop weather · " + wl;
    el.appendChild(s);
    el.appendChild(document.createTextNode(wtext));
  });

  /* ---------- hot / iced menu ---------- */
  document.querySelectorAll("[data-board]").forEach(function (board) {
    var buttons = board.querySelectorAll(".toggle button");
    var items = board.querySelectorAll(".drinks li");
    var cup = board.querySelector(".board-cup img");
    var live = board.querySelector("[data-board-live]");
    function set(mode, animate) {
      board.setAttribute("data-mode", mode);
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-mode") === mode)); });
      var n = 0;
      items.forEach(function (li) {
        var price = li.getAttribute("data-" + mode);
        if (!price) { li.hidden = true; return; }
        li.hidden = false; n++;
        li.querySelector(".drink-price").textContent = "$" + price;
        var name = li.getAttribute("data-name-" + mode);
        if (name) li.querySelector(".drink-name").textContent = name;
        var desc = li.getAttribute("data-desc-" + mode);
        if (desc) li.querySelector(".drink-desc").textContent = desc;
      });
      if (cup) {
        cup.src = cup.getAttribute("data-" + mode);
        cup.alt = mode === "iced" ? "Iced coffee in a clear cup with the Stoop stair logo" : "Hot coffee in a paper cup with the Stoop stair logo";
      }
      if (live) live.textContent = (mode === "iced" ? "Showing iced drinks" : "Showing hot drinks") + ", " + n + " items.";
      if (animate) {
        board.classList.remove("is-flipping"); void board.offsetWidth; board.classList.add("is-flipping");
      }
    }
    buttons.forEach(function (b) {
      b.addEventListener("click", function () { set(b.getAttribute("data-mode"), true); });
    });
    // summer months open on iced
    set(now.month >= 5 && now.month <= 8 ? "iced" : "hot", false);
  });

  /* ---------- punch card ---------- */
  var card = document.querySelector("[data-punchcard]");
  if (card) {
    var KEY = "stoop-card-v1";
    var holes = card.querySelectorAll(".hole");
    var msg = card.querySelector(".card-msg");
    var reset = card.querySelector(".reset");
    var state = [];
    try { state = JSON.parse(localStorage.getItem(KEY) || "[]"); if (!Array.isArray(state)) state = []; } catch (e) { state = []; }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode: fine */ } }
    function render(justIdx) {
      var count = 0;
      holes.forEach(function (h, i) {
        var on = state.indexOf(i) > -1;
        if (on) count++;
        h.classList.toggle("is-punched", on);
        h.setAttribute("aria-pressed", String(on));
        h.classList.toggle("just", i === justIdx);
      });
      var t;
      if (count === 0) t = "Tap a circle to punch it.";
      else if (count < 9) t = count + " punched, " + (10 - count) + " to go.";
      else if (count === 9) t = "Nine down. The next one's on us.";
      else t = "Full card. Tenth coffee's free, at the real window.";
      msg.textContent = t;
    }
    holes.forEach(function (h, i) {
      h.addEventListener("click", function () {
        var at = state.indexOf(i);
        if (at > -1) state.splice(at, 1); else state.push(i);
        save(); render(at > -1 ? -1 : i);
      });
    });
    if (reset) reset.addEventListener("click", function () { state = []; save(); render(-1); });
    render(-1);
  }

  /* ---------- next stoop sale (first Saturday, 9am–1pm) ---------- */
  var ns = document.querySelector("[data-next-sale]");
  if (ns) {
    try {
      var ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date()).split("-").map(Number);
      var y = ymd[0], m = ymd[1] - 1, dd = ymd[2];
      var firstSat = function (yy, mm) { var d = new Date(Date.UTC(yy, mm, 1)); return 1 + ((6 - d.getUTCDay() + 7) % 7); };
      var fs = firstSat(y, m);
      var label;
      if (dd === fs && now.hour < 13) label = "It's today, till 1pm. Come down.";
      else {
        if (dd >= fs) { m++; if (m > 11) { m = 0; y++; } fs = firstSat(y, m); }
        label = "Next one: Saturday, " + MONTHS[m] + " " + fs;
      }
      ns.textContent = label;
    } catch (e) { /* keep static text */ }
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
