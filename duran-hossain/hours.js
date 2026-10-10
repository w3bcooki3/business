/* ═══════════════════════════════════════════════════════════════════════════
   Durán & Hossain — opening hours and holiday policy (shared by both directions).
   EDIT HERE when the real hours are confirmed. Index 0 = Sunday. Times are 24 h.
   Holiday kinds: "closed", "short" (with "HH:MM-HH:MM"), or "open".
   ═══════════════════════════════════════════════════════════════════════════ */
window.RX_HOURS = [["Sunday", "10:00", "14:00"], ["Monday", "09:00", "19:00"], ["Tuesday", "09:00", "19:00"], ["Wednesday", "09:00", "19:00"], ["Thursday", "09:00", "19:00"], ["Friday", "09:00", "19:00"], ["Saturday", "09:00", "17:00"]];
window.RX_HOLIDAYS = {
  newyear: ["New Year's Day", "closed", "", "Back to regular hours the next day."],
  mlk: ["Martin Luther King Jr. Day", "open", "", "Open regular hours."],
  presidents: ["Presidents' Day", "open", "", "Open regular hours."],
  memorial: ["Memorial Day", "short", "10:00-14:00", "Short day — the pharmacist is in all morning."],
  juneteenth: ["Juneteenth", "open", "", "Open regular hours."],
  independence: ["Independence Day", "closed", "", "Order refills the day before — we are busy on the 3rd."],
  labor: ["Labor Day", "short", "10:00-14:00", "Delivery runs as usual in the afternoon."],
  columbus: ["Indigenous Peoples' Day", "open", "", "Open regular hours."],
  veterans: ["Veterans Day", "open", "", "Open regular hours."],
  thanksgiving: ["Thanksgiving Day", "closed", "", "We deliver the Wednesday before — call Tuesday to get on the run."],
  christmas: ["Christmas Day", "closed", "", "Open again on the 26th at regular hours."],
  xmaseve: ["Christmas Eve", "short", "09:00-15:00", "Last delivery run leaves at 1 pm."],
  nyeve: ["New Year's Eve", "short", "09:00-17:00", "Back to regular hours on the 2nd."]
};

/* ═══════════════════════════════════════════════════════════════════════════
   Store hours, and the federal holidays — computed, not listed.

   The point of this file is that nobody ever has to edit it. Every US federal
   holiday is defined by a rule ("third Monday of January", "fourth Thursday of
   November"), so the page works the dates out for whatever year it happens to
   be. A hardcoded list would be wrong by next January.

   It does three things:
     1. says whether the pharmacy is open right now, against today's real hours
     2. applies the holiday policy to today if today is one
     3. shows the next few schedule changes so people can plan around them

   No forms, no network, no storage. Pure computation on the visitor's clock.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var REG = window.RX_HOURS;        // [[label, "09:00", "19:00"] ...] index 0 = Sunday
  var POLICY = window.RX_HOLIDAYS;  // { key: [name, kind, "HH:MM-HH:MM", note] }
  if (!REG || !POLICY) return;

  /* ── date helpers ──────────────────────────────────────────────────────── */
  function d(y, m, day) { return new Date(y, m, day); }      // m is 0-indexed

  // the nth given weekday of a month, e.g. nth(2026, 10, 4, 4) = 4th Thursday of November
  function nth(y, m, weekday, n) {
    var first = new Date(y, m, 1);
    var shift = (weekday - first.getDay() + 7) % 7;
    return new Date(y, m, 1 + shift + (n - 1) * 7);
  }

  // the last given weekday of a month, e.g. Memorial Day
  function last(y, m, weekday) {
    var endOfMonth = new Date(y, m + 1, 0);
    var shift = (endOfMonth.getDay() - weekday + 7) % 7;
    return new Date(y, m + 1, 0 - shift);
  }

  // federal rule: a fixed-date holiday falling on Saturday is observed on the
  // Friday before, and one falling on Sunday on the Monday after
  function observed(dt) {
    var g = dt.getDay();
    if (g === 6) return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - 1);
    if (g === 0) return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + 1);
    return dt;
  }

  /* ── the eleven federal holidays, plus the two eves every pharmacy posts ── */
  function holidaysFor(y) {
    return [
      { key: "newyear",      date: observed(d(y, 0, 1)),   actual: d(y, 0, 1) },
      { key: "mlk",          date: nth(y, 0, 1, 3) },                 // 3rd Monday, January
      { key: "presidents",   date: nth(y, 1, 1, 3) },                 // 3rd Monday, February
      { key: "memorial",     date: last(y, 4, 1) },                   // last Monday, May
      { key: "juneteenth",   date: observed(d(y, 5, 19)),  actual: d(y, 5, 19) },
      { key: "independence", date: observed(d(y, 6, 4)),   actual: d(y, 6, 4) },
      { key: "labor",        date: nth(y, 8, 1, 1) },                 // 1st Monday, September
      { key: "columbus",     date: nth(y, 9, 1, 2) },                 // 2nd Monday, October
      { key: "veterans",     date: observed(d(y, 10, 11)), actual: d(y, 10, 11) },
      { key: "thanksgiving", date: nth(y, 10, 4, 4) },                // 4th Thursday, November
      { key: "xmaseve",      date: d(y, 11, 24) },
      { key: "christmas",    date: observed(d(y, 11, 25)), actual: d(y, 11, 25) },
      { key: "nyeve",        date: d(y, 11, 31) }
    ].filter(function (h) { return POLICY[h.key]; });
  }

  /* ── formatting ────────────────────────────────────────────────────────── */
  var MON = ["January", "February", "March", "April", "May", "June", "July",
             "August", "September", "October", "November", "December"];
  var DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function pretty(dt) { return DAY[dt.getDay()] + " " + MON[dt.getMonth()] + " " + dt.getDate(); }
  function key(dt) { return dt.getFullYear() + "-" + dt.getMonth() + "-" + dt.getDate(); }
  function mins(hhmm) { var p = hhmm.split(":"); return (+p[0]) * 60 + (+p[1]); }
  function clock(hhmm) {
    var p = hhmm.split(":"), h = +p[0], m = p[1];
    var ap = h >= 12 ? "pm" : "am", hr = h % 12 === 0 ? 12 : h % 12;
    return hr + (m === "00" ? "" : ":" + m) + " " + ap;
  }
  function span(range) {
    var p = range.split("-");
    return clock(p[0]) + " – " + clock(p[1]);
  }

  /* ── what applies on a given day ───────────────────────────────────────── */
  function scheduleFor(dt) {
    var list = holidaysFor(dt.getFullYear());
    var k = key(dt);
    for (var i = 0; i < list.length; i++) {
      if (key(list[i].date) === k) {
        var pol = POLICY[list[i].key];
        return { holiday: pol[0], kind: pol[1], range: pol[2], note: pol[3] };
      }
    }
    var reg = REG[dt.getDay()];
    if (!reg || !reg[1]) return { kind: "closed", holiday: null, note: "" };
    return { kind: "open", holiday: null, range: reg[1] + "-" + reg[2], note: "" };
  }

  /* ── render ────────────────────────────────────────────────────────────── */
  var now = (function(){try{var p={};new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date()).forEach(function(x){p[x.type]=x.value});return new Date(+p.year,+p.month-1,+p.day,(+p.hour)%24,+p.minute);}catch(e){return new Date();}})(); // New York time
  var today = scheduleFor(now);
  var nowMins = now.getHours() * 60 + now.getMinutes();
  var openNow = false, until = "";

  if (today.kind !== "closed" && today.range) {
    var a = mins(today.range.split("-")[0]), b = mins(today.range.split("-")[1]);
    openNow = nowMins >= a && nowMins < b;
    until = openNow ? clock(today.range.split("-")[1]) : clock(today.range.split("-")[0]);
  }

  function tomorrowAt() {
    var t = scheduleFor(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
    return t.kind !== "closed" && t.range ? " " + clock(t.range.split("-")[0]) : "";
  }

  // 1. the live status pill
  var statusEls = document.querySelectorAll("[data-rx-status]");
  for (var s = 0; s < statusEls.length; s++) {
    var el = statusEls[s];
    el.classList.toggle("is-open", openNow);
    el.classList.toggle("is-shut", !openNow);
    var label = openNow
      ? "Open now · until " + until
      : (today.kind === "closed"
          ? "Closed today" + (today.holiday ? " · " + today.holiday : "")
          : (nowMins < mins(today.range.split("-")[0])
              ? "Closed · opens " + until
              : "Closed · opens tomorrow" + tomorrowAt()));
    el.textContent = label;
  }

  // 2. today's line under the hours table
  var todayEls = document.querySelectorAll("[data-rx-today]");
  for (var t = 0; t < todayEls.length; t++) {
    todayEls[t].textContent = today.holiday
      ? today.holiday + " — " + (today.kind === "closed" ? "closed all day" : span(today.range))
      : (today.kind === "closed" ? "Closed today" : "Today " + span(today.range));
  }

  // 3. highlight the current weekday in the hours list
  var rows = document.querySelectorAll("[data-rx-day]");
  for (var r = 0; r < rows.length; r++) {
    if (+rows[r].getAttribute("data-rx-day") === now.getDay()) rows[r].classList.add("is-today");
  }

  // 4. a banner when a special day is today or close
  var banner = document.querySelector("[data-rx-banner]");
  if (banner) {
    var upcoming = null, soon = holidaysFor(now.getFullYear())
      .concat(holidaysFor(now.getFullYear() + 1));
    for (var u = 0; u < soon.length; u++) {
      var diff = Math.round((soon[u].date - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
      var pol2 = POLICY[soon[u].key];
      if (diff >= 0 && diff <= 14 && pol2[1] !== "open") { upcoming = { h: soon[u], diff: diff, pol: pol2 }; break; }
    }
    if (upcoming) {
      var when = upcoming.diff === 0 ? "Today" : upcoming.diff === 1 ? "Tomorrow" : pretty(upcoming.h.date);
      banner.innerHTML =
        '<b>' + when + ' · ' + upcoming.pol[0] + '</b> ' +
        (upcoming.pol[1] === "closed"
          ? "We are closed all day."
          : "Open " + span(upcoming.pol[2]) + ".") +
        (upcoming.pol[3] ? " " + upcoming.pol[3] : "");
      banner.hidden = false;
    }
  }

  // 5. the upcoming-changes list
  var listEl = document.querySelector("[data-rx-upcoming]");
  if (listEl) {
    var all = holidaysFor(now.getFullYear()).concat(holidaysFor(now.getFullYear() + 1));
    var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var out = [];
    for (var i2 = 0; i2 < all.length && out.length < 5; i2++) {
      if (all[i2].date < midnight) continue;
      var pol3 = POLICY[all[i2].key];
      if (pol3[1] === "open") continue;
      out.push(
        '<div class="hol"><span class="hol__d">' + pretty(all[i2].date) + '</span>' +
        '<span class="hol__n">' + pol3[0] + '</span>' +
        '<span class="hol__s ' + (pol3[1] === "closed" ? "is-shut" : "is-short") + '">' +
        (pol3[1] === "closed" ? "Closed" : span(pol3[2])) + '</span></div>');
    }
    listEl.innerHTML = out.join("") ||
      '<p class="hol__none">No changes to the schedule in the next few months.</p>';
  }

  // 6. the year, so the footer never goes stale either
  var yrs = document.querySelectorAll("[data-rx-year]");
  for (var y2 = 0; y2 < yrs.length; y2++) yrs[y2].textContent = now.getFullYear();
})();
