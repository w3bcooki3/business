/* Overpass Coffee — status, spec drawings, rush meter, text-order builder, menu. No dependencies. */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("has-js");

  var PHONE = "+17185550186";
  var HOURS = { 0: [8, 18], 1: [7, 18], 2: [7, 18], 3: [7, 18], 4: [7, 18], 5: [7, 18], 6: [8, 18] };
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  /* ---------- New York time ---------- */
  function nyNow() {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23"
    }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday);
    return { day: day, h: parseInt(o.hour, 10) % 24, m: parseInt(o.minute, 10) };
  }
  function fmtHour(h) {
    var s = h % 12 === 0 ? 12 : h % 12;
    return s + (h < 12 ? " AM" : " PM");
  }
  function shortHour(h) {
    var s = h % 12 === 0 ? 12 : h % 12;
    return s + (h < 12 ? "a" : "p");
  }

  /* ---------- Open status ---------- */
  function status() {
    var t = nyNow();
    var mins = t.h * 60 + t.m;
    var today = HOURS[t.day];
    var open = mins >= today[0] * 60 && mins < today[1] * 60;
    var short, long;
    if (open) {
      var left = today[1] * 60 - mins;
      short = left <= 60 ? "Open · " + left + " min left" : "Open · til " + fmtHour(today[1]).replace(" ", "");
      long = left <= 60 ? "Open now — last call, closing at 6 PM" : "Open now — until " + fmtHour(today[1]) + " today";
    } else if (mins < today[0] * 60) {
      short = "Opens " + fmtHour(today[0]).replace(" ", "");
      long = "Closed now — opens " + fmtHour(today[0]) + " today";
    } else {
      var nd = (t.day + 1) % 7;
      short = "Closed · " + fmtHour(HOURS[nd][0]).replace(" ", "");
      long = "Closed now — opens " + fmtHour(HOURS[nd][0]) + " tomorrow (" + DAY_NAMES[nd] + ")";
    }
    doc.classList.toggle("is-open", open);
    document.querySelectorAll("[data-status-text]").forEach(function (el) { el.textContent = short; });
    document.querySelectorAll("[data-status-long]").forEach(function (el) { el.textContent = long; });
    document.querySelectorAll("[data-hours] tr").forEach(function (tr) {
      tr.classList.toggle("is-today", Number(tr.getAttribute("data-day")) === t.day);
    });
    return { t: t, open: open };
  }

  /* ---------- Drinks ---------- */
  var DRINKS = {
    espresso:   { name: "Espresso",   price: 4.0, milk: false, dose: 18, yld: 36, time: 28, cup: "Demitasse", cap: 90,  glass: false, layers: [["esp", 36, "36 g espresso"]] },
    macchiato:  { name: "Macchiato",  price: 4.5, milk: true,  dose: 18, yld: 36, time: 28, cup: "Demitasse", cap: 90,  glass: false, layers: [["esp", 36, "36 g espresso"], ["foam", 20, "20 ml foam"]] },
    cortado:    { name: "Cortado",    price: 5.0, milk: true,  dose: 18, yld: 36, time: 28, cup: "Gibraltar", cap: 135, glass: true,  layers: [["esp", 36, "36 g espresso"], ["milk", 50, "60 ml steamed milk"], ["foam", 10, "thin microfoam"]] },
    flatwhite:  { name: "Flat white", price: 5.5, milk: true,  dose: 18, yld: 30, time: 25, cup: "Cup, 165 ml", cap: 165, glass: false, layers: [["esp", 30, "30 g ristretto"], ["milk", 105, "120 ml steamed milk"], ["foam", 15, "velvet microfoam"]] },
    cappuccino: { name: "Cappuccino", price: 5.5, milk: true,  dose: 18, yld: 36, time: 28, cup: "Cup, 180 ml", cap: 180, glass: false, layers: [["esp", 36, "36 g espresso"], ["milk", 70, "140 ml steamed milk"], ["foam", 60, "deep foam cap"]] },
    latte:      { name: "Latte",      price: 6.0, milk: true,  dose: 18, yld: 36, time: 28, cup: "Cup, 300 ml", cap: 300, glass: false, layers: [["esp", 36, "36 g espresso"], ["milk", 215, "240 ml steamed milk"], ["foam", 25, "microfoam"]] },
    iced:       { name: "Iced latte", price: 6.5, milk: true,  dose: 18, yld: 36, time: 28, cup: "Glass, 350 ml", cap: 350, glass: true, ice: true, layers: [["milk", 200, "200 ml milk + ice"], ["esp", 36, "36 g espresso on top"]] },
    tonic:      { name: "Span tonic", price: 7.0, milk: false, dose: 18, yld: 36, time: 28, cup: "Glass, 300 ml", cap: 300, glass: true, ice: true, layers: [["tonic", 150, "150 ml tonic + ice"], ["esp", 36, "36 g espresso + peel"]] }
  };
  var ORDER = Object.keys(DRINKS);
  var money = function (n) { return "$" + n.toFixed(2); };

  /* ---------- Section drawing ---------- */
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, text) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text) n.textContent = text;
    return n;
  }
  var DEFS = '<defs>' +
    '<pattern id="dw-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#3a2418"/><path d="M0 0v6" stroke="#ff5b1f" stroke-width="1.6"/></pattern>' +
    '<pattern id="dw-dots" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="rgba(237,234,228,.28)"/><circle cx="3" cy="3" r="1.1" fill="#edeae4"/></pattern>' +
    '<pattern id="dw-lines" width="8" height="5" patternUnits="userSpaceOnUse"><rect width="8" height="5" fill="rgba(237,234,228,.08)"/><path d="M0 .5h8" stroke="#a2a8af" stroke-width="1"/></pattern>' +
    '</defs>';

  function drawCup(svg, d) {
    svg.innerHTML = DEFS;
    var base = 262, cx = 84;
    var h = Math.round(64 + d.cap * 0.42);
    var tw = Math.round(74 + d.cap * 0.12);
    var bw = Math.round(tw * (d.glass ? 0.84 : 0.66));
    var top = base - h;
    var halfAt = function (y) { var f = (base - y) / h; return (bw + (tw - bw) * f) / 2; };

    svg.appendChild(el("path", { "class": "dw-axis", d: "M" + cx + " " + (top - 24) + "V" + (base + 14) }));
    if (!d.glass) {
      svg.appendChild(el("path", { "class": "dw-cup", d: "M" + (cx - tw / 2 - 26) + " " + (base + 6) + "H" + (cx + tw / 2 + 26) }));
      var hy = top + h * 0.22;
      svg.appendChild(el("path", { "class": "dw-cup", d: "M" + (cx - halfAt(hy) - 1) + " " + hy + "c-22 0-26 30-4 34" }));
    }

    var fillTo = d.cap * 0.94, y = base, marks = [base];
    var total = d.layers.reduce(function (s, l) { return s + l[1]; }, 0);
    var scale = (h * Math.min(1, total / fillTo) * 0.94) / total;
    d.layers.forEach(function (l) {
      var lh = Math.max(l[1] * scale, 7);
      var y2 = y - lh;
      var a = halfAt(y), b = halfAt(y2);
      svg.appendChild(el("path", { "class": "dw-" + l[0], d: "M" + (cx - a) + " " + y + "L" + (cx + a) + " " + y + "L" + (cx + b) + " " + y2 + "L" + (cx - b) + " " + y2 + "Z" }));
      if (l[0] === "esp") svg.appendChild(el("path", { "class": "dw-tick", d: "M" + (cx - b) + " " + y2 + "H" + (cx + b) }));
      y = y2; marks.push(y);
    });
    if (d.ice) {
      [[-24, 30, 0], [6, 48, 12], [-14, 70, -8], [14, 92, 20]].forEach(function (c) {
        var cy = base - c[1] - 14;
        if (cy > top + 10) svg.appendChild(el("rect", { "class": "dw-ice", x: cx + c[0] - 12, y: cy, width: 24, height: 22, transform: "rotate(" + c[2] + " " + (cx + c[0]) + " " + (cy + 11) + ")" }));
      });
    }
    // cup outline drawn last so it sits on top of the fills
    svg.appendChild(el("path", { "class": "dw-cup", d: "M" + (cx - tw / 2) + " " + top + "L" + (cx - bw / 2) + " " + base + "H" + (cx + bw / 2) + "L" + (cx + tw / 2) + " " + top }));

    // dimension rail with ticks
    var dx = cx + tw / 2 + 22;
    svg.appendChild(el("path", { "class": "dw-dim", d: "M" + dx + " " + base + "V" + marks[marks.length - 1] }));
    marks.forEach(function (m) {
      svg.appendChild(el("path", { "class": "dw-tick", d: "M" + (dx - 5) + " " + m + "h10" }));
      svg.appendChild(el("path", { "class": "dw-ghost", d: "M" + (cx + halfAt(m) + 3) + " " + m + "H" + (dx - 6) }));
    });
    // labels, spaced so they never collide
    var lx = dx + 12, prev = 1e9;
    d.layers.forEach(function (l, i) {
      var mid = (marks[i] + marks[i + 1]) / 2 + 4;
      var ly = Math.min(mid, prev - 16);
      prev = ly;
      if (Math.abs(ly - mid) > 2) svg.appendChild(el("path", { "class": "dw-dim", d: "M" + (dx + 5) + " " + (mid - 4) + "L" + (lx - 2) + " " + (ly - 4) }));
      svg.appendChild(el("text", { "class": "dw-text", x: lx, y: ly }, l[2]));
    });
    svg.appendChild(el("text", { "class": "dw-text dw-text--o", x: 16, y: 26 }, "DOSE " + d.dose + " G → YIELD " + d.yld + " G"));
    svg.appendChild(el("text", { "class": "dw-text", x: 16, y: 44 }, d.time + " S @ 93 °C · " + d.cup.toUpperCase()));
  }

  var svg = document.querySelector("[data-drawing]");
  var fig = document.getElementById("drawing");
  var layout = document.querySelector(".spec__layout");
  var cap = document.querySelector("[data-drawing-cap]");
  var dwg = document.querySelector("[data-dwg]");
  var rows = Array.prototype.slice.call(document.querySelectorAll("[data-spec-list] .row"));
  var wide = window.matchMedia("(min-width: 900px)");
  var active = null;

  var orderLink = document.createElement("a");
  orderLink.className = "drawing__order";
  orderLink.href = "#order";
  fig.querySelector(".drawing__block").appendChild(orderLink);

  function select(key, fromTap) {
    var d = DRINKS[key];
    if (!wide.matches && fromTap && active === key) { // collapse on second tap (mobile)
      active = null;
      rows.forEach(function (r) { r.classList.remove("is-active"); r.querySelector("button").setAttribute("aria-pressed", "false"); });
      fig.classList.remove("is-shown");
      return;
    }
    active = key;
    rows.forEach(function (r) {
      var on = r.getAttribute("data-drink") === key;
      r.classList.toggle("is-active", on);
      r.querySelector("button").setAttribute("aria-pressed", String(on));
      if (on && !wide.matches) r.appendChild(fig);
    });
    drawCup(svg, d);
    dwg.textContent = "DWG 01-" + String(ORDER.indexOf(key) + 1).padStart(2, "0");
    cap.textContent = d.name + " — " + d.layers.map(function (l) { return l[2]; }).join(", ") + ". " + money(d.price) + ".";
    orderLink.innerHTML = "<span>Text-order " + (d.name === "Espresso" ? "an" : "a") + " " + d.name.toLowerCase() + "</span><span aria-hidden=\"true\">→</span>";
    orderLink.setAttribute("data-drink", key);
    fig.classList.add("is-shown");
  }
  function placeFigure() {
    if (wide.matches) {
      if (fig.parentNode !== layout) layout.appendChild(fig);
      select(active || "cortado");
    } else if (active) {
      select(active);
    } else {
      fig.classList.remove("is-shown");
    }
  }
  rows.forEach(function (r) {
    r.querySelector("button").addEventListener("click", function () { select(r.getAttribute("data-drink"), true); });
  });
  if (wide.addEventListener) wide.addEventListener("change", placeFigure);
  placeFigure();
  if (!wide.matches) drawCup(svg, DRINKS.cortado);

  /* ---------- Rush meter ---------- */
  var RUSH = {
    weekday: { start: 7, v: [55, 95, 85, 55, 40, 62, 55, 30, 34, 42, 26], laptop: [12, 18] },
    weekend: { start: 8, v: [32, 62, 90, 100, 94, 82, 72, 60, 46, 28], laptop: null }
  };
  var bars = document.querySelector("[data-rush-bars]");
  var readout = document.querySelector("[data-rush-readout]");
  var laptopEl = document.querySelector("[data-rush-laptop]");
  var chart = document.querySelector("[data-rush-chart]");
  var toggles = document.querySelectorAll("[data-rush-day]");
  var level = function (v) { return v >= 70 ? "Packed" : v >= 40 ? "Steady" : "Light"; };
  var summary = {
    weekday: "Weekdays: packed 8–10 AM, quietest 2–3 PM.",
    weekend: "Weekends: builds from 10 AM, peaks 11 AM–1 PM."
  };
  var currentDay;

  function renderRush(kind) {
    currentDay = kind;
    var s = status();
    var data = RUSH[kind];
    var isTodayKind = (s.t.day === 0 || s.t.day === 6) === (kind === "weekend");
    var nowIdx = s.open && isTodayKind ? s.t.h - data.start : -1;
    bars.innerHTML = "";
    bars.style.setProperty("--n", data.v.length);
    chart.style.setProperty("--n", data.v.length);
    data.v.forEach(function (v, i) {
      var h = data.start + i;
      var li = document.createElement("li");
      li.className = "bar" + (v >= 70 ? " is-hot" : "") + (i === nowIdx ? " is-now" : "");
      li.innerHTML = '<span class="bar__fill" style="--v:' + v + '%"></span>' +
        '<span class="bar__h" aria-hidden="true">' + shortHour(h) + "</span>" +
        '<span class="sr-only">' + fmtHour(h) + ": " + level(v) + (i === nowIdx ? " (now)" : "") + "</span>" +
        '<span class="bar__hit" aria-hidden="true"></span>';
      li.addEventListener("mouseenter", function () { readout.textContent = fmtHour(h) + " · usually " + level(v).toLowerCase(); });
      li.addEventListener("mouseleave", setReadout);
      bars.appendChild(li);
    });
    if (data.laptop) {
      laptopEl.hidden = false;
      chart.style.setProperty("--ls", data.laptop[0] - data.start);
      chart.style.setProperty("--lw", data.laptop[1] - data.laptop[0]);
    } else {
      laptopEl.hidden = true;
    }
    toggles.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-rush-day") === kind)); });
    function setReadout() {
      readout.textContent = nowIdx >= 0
        ? "Right now (" + fmtHour(s.t.h) + "): usually " + level(data.v[nowIdx]).toLowerCase() + "."
        : summary[kind];
    }
    bars.onmouseleave = setReadout;
    setReadout();
  }
  toggles.forEach(function (b) {
    b.addEventListener("click", function () { renderRush(b.getAttribute("data-rush-day")); });
  });
  var st = status();
  renderRush(st.t.day === 0 || st.t.day === 6 ? "weekend" : "weekday");

  /* ---------- Text-order builder ---------- */
  var MILKS = [["whole", "Whole", 0], ["oat", "Oat", 0.75], ["almond", "Almond", 0.75]];
  var PICKUPS = [5, 10, 15, 20];
  var order = { drink: "cortado", milk: "whole", pickup: 10 };
  var chipsDrink = document.querySelector('[data-chips="drink"]');
  var chipsMilk = document.querySelector('[data-chips="milk"]');
  var chipsPick = document.querySelector('[data-chips="pickup"]');
  var sms = document.querySelector("[data-sms]");
  var tk = {};
  document.querySelectorAll("[data-t]").forEach(function (n) { tk[n.getAttribute("data-t")] = n; });

  function chip(parent, value, label, onPick) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.setAttribute("data-value", value);
    b.setAttribute("aria-pressed", "false");
    b.innerHTML = label;
    b.addEventListener("click", function () { onPick(value); });
    parent.appendChild(b);
    return b;
  }
  ORDER.forEach(function (k) { chip(chipsDrink, k, DRINKS[k].name + "<small>" + money(DRINKS[k].price).replace(".00", "") + "</small>", function (v) { order.drink = v; renderOrder(); }); });
  MILKS.forEach(function (m) { chip(chipsMilk, m[0], m[1] + (m[2] ? "<small>+$0.75</small>" : ""), function (v) { order.milk = v; renderOrder(); }); });
  PICKUPS.forEach(function (p) { chip(chipsPick, String(p), p + " min", function (v) { order.pickup = Number(v); renderOrder(); }); });

  function press(parent, value) {
    parent.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c.getAttribute("data-value") === String(value))); });
  }
  function renderOrder() {
    var d = DRINKS[order.drink];
    var milk = MILKS.filter(function (m) { return m[0] === order.milk; })[0];
    chipsMilk.querySelectorAll(".chip").forEach(function (c) { c.disabled = !d.milk; });
    var total = d.price + (d.milk ? milk[2] : 0);
    var milkText = d.milk ? milk[1] + (milk[2] ? " (+$0.75)" : "") : "None in this one";
    press(chipsDrink, order.drink);
    press(chipsMilk, d.milk ? order.milk : "");
    press(chipsPick, order.pickup);
    tk.drink.textContent = d.name;
    tk.milk.textContent = milkText;
    tk.pickup.textContent = "In " + order.pickup + " min";
    tk.total.textContent = money(total);
    var body = "Hi Overpass! Order for pickup in " + order.pickup + " min: 1 " + d.name +
      (d.milk ? ", " + milk[1].toLowerCase() + " milk" : "") + ". Total " + money(total) + " + tax. Thanks!";
    sms.href = "sms:" + PHONE + "?&body=" + encodeURIComponent(body);
  }
  renderOrder();

  orderLink.addEventListener("click", function () {
    order.drink = orderLink.getAttribute("data-drink");
    renderOrder();
  });

  /* ---------- Menu dialog ---------- */
  var dlg = document.getElementById("menu-dialog");
  var opener = document.querySelector("[data-menu-open]");
  if (dlg && typeof dlg.showModal === "function") {
    opener.addEventListener("click", function () {
      dlg.showModal();
      opener.setAttribute("aria-expanded", "true");
      dlg.querySelector("[data-menu-close]").focus();
    });
    dlg.addEventListener("close", function () {
      opener.setAttribute("aria-expanded", "false");
      opener.focus();
    });
    dlg.querySelector("[data-menu-close]").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.querySelectorAll("[data-menu-link]").forEach(function (a) {
      a.addEventListener("click", function () { dlg.close(); });
    });
    dlg.addEventListener("keydown", function (e) { // keep Tab inside the sheet
      if (e.key !== "Tab") return;
      var f = dlg.querySelectorAll("a[href], button:not([disabled])");
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    opener.setAttribute("aria-expanded", "false");
  }

  /* ---------- Keep status fresh ---------- */
  setInterval(function () { status(); renderRush(currentDay); }, 60000);
})();
