/* ══ Care — interactive layer below the hero ═══════════════════════════════ */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* New York clock */
  function ny() {
    var o = {};
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hour12: false, weekday: "short" })
        .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
      return { h: (+o.hour) % 24, m: +o.minute, s: +o.second, dow: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday] };
    } catch (e) { var d = new Date(); return { h: d.getHours(), m: d.getMinutes(), s: d.getSeconds(), dow: d.getDay() }; }
  }
  function ampm(h, m) { return ((h % 12) || 12) + (m ? ":" + String(m).padStart(2, "0") : "") + (h >= 12 ? " pm" : " am"); }
  var HRS = (window.RX_HOURS || []).map(function (r) { return r[1] ? [parseInt(r[1], 10) + (+r[1].split(":")[1]) / 60, parseInt(r[2], 10) + (+r[2].split(":")[1]) / 60] : null; });

  /* ── 01 concierge ─────────────────────────────────────────────────────── */
  var PATHS = {
    refill: { t: "About 2 minutes of your time", h: "Refills, without the phone tree.",
      s: ["Text your Rx number — or just the medicine’s name and your date of birth — to (718) 555-0100.",
          "We reply when it’s in the bag, usually within the hour, with the price before we charge you.",
          "Pick it up, or say “delivery” and it’s on today’s 4–8 pm run if you text by 3."],
      a: [["sms:+17185550100?&body=" + encodeURIComponent("Refill please — Rx #: ____ , date of birth: ____"), "Text a refill"], ["tel:+17185550175", "Or call the counter"]] },
    "new": { t: "Ready in about 15 minutes", h: "New prescription? Have it sent here.",
      s: ["Ask your doctor to send it electronically to Durán & Hossain, 74-20 Roosevelt Avenue.",
          "We check your coverage and tell you the price — and whether cash would be cheaper — before we fill it.",
          "A pharmacist walks you through it at the counter, in your language, without rushing."],
      a: [["tel:+17185550175", "Call to check it arrived"], ["#insurance", "Which card do I bring?"]] },
    shot: { t: "Walk in · about 10 minutes", h: "No appointment. Just come in.",
      s: ["Check what we’re permitted to give at your age — the finder below does it in a second.",
          "Bring a photo ID and your insurance card. Most vaccines are $0 with insurance.",
          "Ten minutes in the chair, fifteen sitting with us afterwards, and a record for your doctor."],
      a: [["#vaccines", "Open the vaccine finder"], ["#hours", "Today’s hours"]] },
    "switch": { t: "One phone call — yours", h: "Switching? We do the moving.",
      s: ["Call or stop by with your name, date of birth, and the pharmacy you use now.",
          "We call them, move every prescription with refills left, and check your insurance.",
          "Usually done the same day. Nothing for you to sign, nothing to chase."],
      a: [["tel:+17185550175", "Call to switch"], ["sms:+17185550100?&body=" + encodeURIComponent("I’d like to transfer my prescriptions. My current pharmacy is: ____"), "Start by text"]] },
    unwell: { t: "Talk to a pharmacist first", h: "Not sure what to take? Ask before you buy.",
      s: ["A pharmacist can talk through over-the-counter options and check them against everything else you take.",
          "We’ll be honest when it’s something for your doctor or urgent care instead — and say which.",
          "Chest pain, trouble breathing, a severe reaction or an overdose: call 911 first, then us."],
      a: [["tel:+17185550175", "Call a pharmacist"], ["tel:911", "Emergency: 911"]] },
    shop: { t: "Six aisles · free delivery", h: "Everything on the shelf rides along free.",
      s: ["Browse the shelf below — prices are typical ranges; brands vary.",
          "Can’t find it? Text a photo of the box and we’ll check the stockroom.",
          "Add it to a prescription delivery, or have it delivered on its own. No minimum."],
      a: [["#shop", "See the shelf"], ["sms:+17185550100", "Text us a photo"]] }
  };
  var intents = $$(".c-intents button"), path = $("#c-path");
  function pick(btn, focus) {
    intents.forEach(function (b) { var on = b === btn; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; });
    var p = PATHS[btn.getAttribute("data-i")];
    $("#cp-time").textContent = p.t; $("#cp-title").textContent = p.h;
    $("#cp-steps").innerHTML = p.s.map(function (x) { return "<li>" + x + "</li>"; }).join("");
    $("#cp-acts").innerHTML = p.a.map(function (x) { return '<a href="' + x[0] + '">' + x[1] + "</a>"; }).join("");
    if (!reduce) { path.classList.remove("is-swap"); void path.offsetWidth; path.classList.add("is-swap"); }
    if (focus) btn.focus();
  }
  intents.forEach(function (b, i) {
    b.addEventListener("click", function () { pick(b); });
    b.addEventListener("keydown", function (e) {
      var n = null, k = e.key;
      if (k === "ArrowRight" || k === "ArrowDown") n = intents[(i + 1) % intents.length];
      if (k === "ArrowLeft" || k === "ArrowUp") n = intents[(i - 1 + intents.length) % intents.length];
      if (n) { e.preventDefault(); pick(n, true); }
    });
  });
  if (intents[0]) pick(intents[0]);

  /* ── 02 right-now board ───────────────────────────────────────────────── */
  var DUTY = ["Luz Durán", "Luz Durán", "Nasir Hossain", "Luz Durán", "Nasir Hossain", "Nasir Hossain", "Luz & Nasir"];
  var DUTYL = ["Español · English", "Español · English", "বাংলা · हिन्दी · English", "Español · English", "বাংলা · हिन्दी · English", "বাংলা · हिन्दी · English", "Both owners in on Saturdays"];
  var WAIT = { 9: 5, 10: 8, 11: 10, 12: 18, 13: 15, 14: 10, 15: 8, 16: 12, 17: 20, 18: 14 };
  function board() {
    var n = ny(), t = n.h + n.m / 60, today = HRS[n.dow];
    $("#c-clock").textContent = "New York · " + ampm(n.h, n.m) + " · " + ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][n.dow];
    var open = today && t >= today[0] && t < today[1];
    var back = (today && t < today[0]) ? ["today", today[0]] : ["tomorrow", (HRS[(n.dow + 1) % 7] || [9])[0]];
    $("#c-duty").textContent = open ? DUTY[n.dow] : "Back " + back[0] + ", " + ampm(Math.floor(back[1]), 0);
    $("#c-duty-s").textContent = open ? DUTYL[n.dow] : "The pharmacy line still takes voicemail overnight.";
    var runDay = n.dow !== 0;
    if (runDay && t < 15) {
      var left = Math.round((15 - t) * 60), hh = Math.floor(left / 60), mm = left % 60;
      $("#c-run").textContent = (hh ? hh + "h " : "") + String(mm).padStart(2, "0") + "m left";
      $("#c-run-s").textContent = "Order by 3 pm · at your door 4–8 pm today";
    } else {
      $("#c-run").textContent = "Next: " + (n.dow === 6 ? "Monday" : "tomorrow");
      $("#c-run-s").textContent = "Order by 3 pm for same-day · runs Mon–Sat";
    }
    var w = WAIT[n.h];
    $("#c-wait").textContent = open && w ? "~" + w + " min" : "Closed now";
  }
  var spark = $("#c-spark");
  if (spark) {
    var nn = ny();
    spark.innerHTML = Object.keys(WAIT).map(function (k) { return '<i style="height:' + Math.round(WAIT[k] / 20 * 100) + '%"' + (+k === nn.h ? ' class="is-now"' : "") + "></i>"; }).join("");
  }
  board(); setInterval(board, 30000);

  /* ── 03 barcode ───────────────────────────────────────────────────────── */
  var bc = $(".c-barcode");
  if (bc) {
    var seed = 74201137, x = 0, out = "";
    while (x < 160) { seed = (seed * 9301 + 49297) % 233280; var w2 = 1 + Math.floor(seed / 233280 * 3); out += '<rect x="' + x + '" y="0" width="' + w2 + '" height="34"/>'; x += w2 + 1 + (seed % 3); }
    bc.innerHTML = out;
  }

  /* ── 04 med sync simulator ────────────────────────────────────────────── */
  var sim = $(".c-sim"), sbtn = $("#sim-btn"), rows = $$("#sim-rows li"), line = $("#sim-line");
  rows.forEach(function (li) { li.querySelector("em").style.setProperty("--d", li.getAttribute("data-d")); });
  function placeLine() {
    var track = rows[0] && rows[0].querySelector("i"); if (!track) return;
    var r = track.getBoundingClientRect(), s = sim.getBoundingClientRect();
    line.style.left = (r.left - s.left + (14 / 29) * r.width) + "px";
    line.style.top = (rows[0].getBoundingClientRect().top - s.top) + "px";
    line.style.bottom = (s.bottom - rows[rows.length - 1].getBoundingClientRect().bottom) + "px";
  }
  if (sbtn) {
    sbtn.addEventListener("click", function () {
      var on = sbtn.getAttribute("aria-pressed") !== "true";
      sbtn.setAttribute("aria-pressed", String(on));
      sbtn.textContent = on ? "Undo — show it unsynced" : "Synchronize";
      sim.classList.toggle("is-sync", on);
      rows.forEach(function (li) { li.querySelector("em").style.setProperty("--d", on ? li.getAttribute("data-s") : li.getAttribute("data-d")); });
      $("#sim-trips").textContent = on ? "1" : "4";
      placeLine();
    });
    addEventListener("resize", placeLine); placeLine();
  }

  /* ── 05 shelf aisles ──────────────────────────────────────────────────── */
  var aisleTabs = $$(".c-aisle button"), boxes = $$(".c-box");
  aisleTabs.forEach(function (b, i) {
    b.addEventListener("click", function () {
      aisleTabs.forEach(function (x) { x.setAttribute("aria-selected", String(x === b)); x.tabIndex = x === b ? 0 : -1; });
      var a = b.getAttribute("data-a");
      boxes.forEach(function (bx) { bx.classList.toggle("is-dim", a !== "all" && bx.getAttribute("data-a") !== a); });
    });
    b.addEventListener("keydown", function (e) {
      var n = null;
      if (e.key === "ArrowRight") n = aisleTabs[(i + 1) % aisleTabs.length];
      if (e.key === "ArrowLeft") n = aisleTabs[(i - 1 + aisleTabs.length) % aisleTabs.length];
      if (n) { e.preventDefault(); n.click(); n.focus(); }
    });
  });

  /* ── 06 delivery area — tap a neighborhood, no typing ───────────────── */
  var zbtns = $$("#c-zip button"), zout = $("#zip-out");
  zbtns.forEach(function (b) {
    b.addEventListener("click", function () {
      zbtns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      var z = b.getAttribute("data-z"), name = b.textContent;
      zout.textContent = z === "same" ? "✓ " + name + " is same-day. Order by 3 pm, at your door 4–8 pm."
        : z === "next" ? name + " is next-morning delivery — still free."
        : "Outside our usual area. Call (718) 555-0175 — we can usually arrange something.";
    });
  });

  /* ── 07 vaccine finder — age group + optional reasons, all buttons ────── */
  var VX = [
    ["Influenza (flu)", 2, "Yearly, September through March", ["season"]],
    ["COVID-19", 3, "Current formulation", ["season"]],
    ["Tdap", 18, "Tetanus, diphtheria, pertussis", ["cut", "travel"]],
    ["Meningococcal", 18, "Often asked for before a dorm move-in", ["college"]],
    ["MMR", 18, "If you’re unsure you had it as a child", ["college", "travel"]],
    ["HPV", 18, "Two or three doses over six months", ["college"]],
    ["Hepatitis A", 18, "Two doses, six months apart", ["travel"]],
    ["Hepatitis B", 18, "Two or three doses, by brand", ["travel", "college"]],
    ["Shingles", 18, "Two doses, two to six months apart", ["50"]],
    ["Pneumococcal", 18, "Usually once, sometimes twice", ["50"]],
    ["Varicella (chickenpox)", 18, "Two doses, four weeks apart", []]
  ];
  var ageBtns = $$("#vx-age button"), whyBtns = $$("#vx-why button");
  function vx() {
    var sel = ageBtns.filter(function (b) { return b.getAttribute("aria-pressed") === "true"; })[0];
    if (!sel) return;
    var a = +sel.getAttribute("data-age"), lbl = sel.getAttribute("data-lbl");
    var why = whyBtns.filter(function (b) { return b.getAttribute("aria-pressed") === "true"; }).map(function (b) { return b.getAttribute("data-v"); });
    if (a >= 50) why.push("50");
    var ok = 0;
    $("#vx-list").innerHTML = VX.map(function (v) {
      var can = a >= v[1]; if (can) ok++;
      var hi = can && v[3].some(function (t) { return why.indexOf(t) > -1; });
      return '<li class="' + (can ? (hi ? "is-hi" : "") : "is-no") + '"><b>' + v[0] + "</b><small>" + v[2] + "</small><em>" +
        (can ? (hi ? "Ask about this" : "We can give") : "From age " + v[1]) + "</em></li>";
    }).join("");
    $("#vx-n").textContent = ok;
    $("#vx-lbl").textContent = (ok === 1 ? "vaccine" : "vaccines") + " we can give, " + lbl;
    var note = "";
    if (a < 18) note = "Under 19, most vaccines are free through the Vaccines for Children program at a doctor’s office. We can do flu from age 2 and COVID-19 from 3.";
    if (why.indexOf("travel") > -1) note += (note ? " " : "") + "Yellow fever, typhoid, rabies and Japanese encephalitis aren’t allowed at New York pharmacies — we’ll name a travel clinic nearby.";
    $("#vx-note").textContent = note;
  }
  ageBtns.forEach(function (b) { b.addEventListener("click", function () { ageBtns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); vx(); }); });
  whyBtns.forEach(function (b) { b.addEventListener("click", function () { b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")); vx(); }); });
  vx();

  /* ── 08 which card ────────────────────────────────────────────────────── */
  var CARDS = {
    mmc: { c: [["state", "New York State", "Benefit Identification Card", "NYRx · prescriptions"], ["plan", "Your Medicaid plan", "Healthfirst · Fidelis · MetroPlus…", "Doctor & hospital"]],
      h: "Bring both cards.", b: "Your plan card still covers your doctor, hospital and specialists. Your medicines are billed to NYRx using the white New York State Benefit card. You don’t need the plan’s permission to use us. (Managed Long-Term Care members: prescriptions still go through the plan.)" },
    partd: { c: [["med", "Medicare", "Part D or Advantage plan", "Your drug plan card"]],
      h: "Your Part D or Advantage card.", b: "We bill the drug plan on that card. Bring your red, white and blue Medicare card on your first visit too, and we’ll keep both on file. Many Part D members qualify for a free medication review." },
    ep: { c: [["plan", "Essential Plan", "or Child Health Plus", "Prescriptions through the plan"]],
      h: "Just your plan card.", b: "The Essential Plan and Child Health Plus didn’t move to NYRx — prescriptions still run through your plan, so the plan card is all you need." },
    work: { c: [["med", "Your insurer", "Aetna · Cigna · UHC · 1199SEIU…", "Rx BIN · PCN · Group"]],
      h: "The card with “Rx BIN” on it.", b: "Some plans issue a separate pharmacy card; it’s the one with Rx BIN and PCN numbers. Not sure? Bring whatever you have and we’ll work it out at the counter." },
    none: { c: [["cash", "No insurance", "Ask for the cash price", "Quoted before we fill"]],
      h: "Ask for the cash price.", b: "We quote before we fill, and for many common generics the cash price beats a copay anyway. If you might qualify for coverage, we’ll point you to free enrollment help nearby." }
  };
  var covs = $$(".c-cov button");
  function cov(btn, focus) {
    covs.forEach(function (b) { var on = b === btn; b.setAttribute("aria-checked", String(on)); b.tabIndex = on ? 0 : -1; });
    var d = CARDS[btn.getAttribute("data-c")];
    $("#wallet").innerHTML = d.c.map(function (c) { return '<div class="c-ic c-ic--' + c[0] + ' is-in"><small>' + c[1] + "</small><b>" + c[2] + "</b><i>" + c[3] + "</i></div>"; }).join("");
    $("#w-title").textContent = d.h; $("#w-body").textContent = d.b;
    if (focus) btn.focus();
  }
  covs.forEach(function (b, i) {
    b.addEventListener("click", function () { cov(b); });
    b.addEventListener("keydown", function (e) {
      var n = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") n = covs[(i + 1) % covs.length];
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = covs[(i - 1 + covs.length) % covs.length];
      if (n) { e.preventDefault(); cov(n, true); }
    });
  });
  if (covs[0]) cov(covs[0]);

  /* ── 09 hours ring ────────────────────────────────────────────────────── */
  function pt(h, r) { var a = (h / 24) * 2 * Math.PI - Math.PI / 2; return [120 + r * Math.cos(a), 120 + r * Math.sin(a)]; }
  var arc = $("#ring-arc");
  if (arc) {
    var n2 = ny(), td = HRS[n2.dow];
    if (td) { var p1 = pt(td[0], 96), p2 = pt(td[1], 96), large = (td[1] - td[0]) > 12 ? 1 : 0;
      arc.setAttribute("d", "M" + p1[0] + " " + p1[1] + " A96 96 0 " + large + " 1 " + p2[0] + " " + p2[1]); }
    var tk = "";
    [[0, "12a"], [6, "6a"], [12, "noon"], [18, "6p"]].forEach(function (q) { var p = pt(q[0], 120); tk += '<text x="' + p[0] + '" y="' + (p[1] + 3) + '" text-anchor="middle">' + q[1] + "</text>"; });
    $("#ring-ticks").innerHTML = tk;
    var hand = $("#ring-hand");
    function tickHand() { var n3 = ny(); hand.style.transform = "rotate(" + ((n3.h + n3.m / 60) / 24 * 360) + "deg)"; }
    tickHand(); setInterval(tickHand, 60000);
  }

  /* ── 10 hello ─────────────────────────────────────────────────────────── */
  var chips = $$(".c-hello__chips button"), big = $("#hello-big"), sub = $("#hello-sub");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      chips.forEach(function (x) { x.setAttribute("aria-selected", String(x === c)); });
      big.classList.add("is-out");
      setTimeout(function () {
        big.textContent = c.getAttribute("data-w"); big.setAttribute("lang", c.getAttribute("data-l"));
        big.setAttribute("dir", c.getAttribute("data-l") === "ur" ? "rtl" : "ltr");
        sub.textContent = c.getAttribute("data-n") + " — your directions go home written in " + c.getAttribute("data-n") + ".";
        big.classList.remove("is-out");
      }, reduce ? 0 : 200);
    });
  });
  var auto = 0, autoT = !reduce && setInterval(function () { auto = (auto + 1) % chips.length; chips[auto].click(); }, 3200);
  chips.forEach(function (c) { c.addEventListener("pointerdown", function () { clearInterval(autoT); }); c.addEventListener("keydown", function () { clearInterval(autoT); }); });
  var helloSec = $(".c-hello");
  if (helloSec) helloSec.addEventListener("focusin", function () { clearInterval(autoT); });

  /* ── reveals ──────────────────────────────────────────────────────────── */
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    $$(".c-tile, .c-label, .c-sim, .c-progs article, .c-box, .c-map, .c-vx__out, .c-wallet, .c-ring, .c-line li, .c-vows li, .c-phone, .c-dial > *").forEach(function (el) { el.classList.add("c-rv"); io.observe(el); });
  }
})();
