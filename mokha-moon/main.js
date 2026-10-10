/* Mokha & Moon — live open status, the qamariya that lights at dusk (New York time),
   menu filters, the gathering-order builder and the mobile navigation dialog.
   The page is complete without JS; this layer only adds live detail. */
(function () {
  'use strict';

  var TZ = 'America/New_York';
  var LAT = 40.633, LON = -74.022;            // Fifth Ave & 72nd St, Bay Ridge
  var OPEN = 8 * 60;                          // 8 am every day
  var CLOSE = [1440, 1440, 1440, 1440, 1440, 1500, 1500]; // Sun..Sat, minutes after midnight (1500 = 1 am next day)
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- New York clock ---------- */
  function nyParts(date) {
    var o = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, hourCycle: 'h23', weekday: 'short',
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'
    }).formatToParts(date).forEach(function (p) { o[p.type] = p.value; });
    var h = (+o.hour) % 24;
    return { y: +o.year, mo: +o.month, d: +o.day, dow: DAYS.indexOf(o.weekday), min: h * 60 + (+o.minute) };
  }
  function clock(mins) {
    mins = ((mins % 1440) + 1440) % 1440;
    if (mins === 0) return 'midnight';
    var h = Math.floor(mins / 60), m = mins % 60;
    return ((h % 12) || 12) + (m ? ':' + ('0' + m).slice(-2) : '') + (h >= 12 ? '\u00a0pm' : '\u00a0am');
  }

  /* ---------- Sunset in Bay Ridge (NOAA-style approximation, ±10 min) ---------- */
  function sunsetMinutes(p) {
    var rad = Math.PI / 180;
    var start = Date.UTC(p.y, 0, 0), dayMs = 864e5;
    var n = Math.round((Date.UTC(p.y, p.mo - 1, p.d) - start) / dayMs);
    var decl = -23.44 * Math.cos(rad * (360 / 365) * (n + 10));
    var b = rad * (360 / 365) * (n - 81);
    var eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
    var cosH = (Math.sin(-0.833 * rad) - Math.sin(LAT * rad) * Math.sin(decl * rad)) /
               (Math.cos(LAT * rad) * Math.cos(decl * rad));
    var H = Math.acos(Math.max(-1, Math.min(1, cosH))) / rad;
    var utcMin = 720 - 4 * LON - eot + 4 * H;   // minutes after 00:00 UTC
    var local = nyParts(new Date(Date.UTC(p.y, p.mo - 1, p.d) + utcMin * 6e4));
    return local.min;
  }

  /* ---------- Open status (handles hours that run past midnight) ---------- */
  function status(p) {
    var y = (p.dow + 6) % 7;
    var spill = CLOSE[y] - 1440;
    if (spill > 0 && p.min < spill) return { state: p.min >= spill - 45 ? 'soon' : 'open', until: CLOSE[y] };
    if (p.min >= OPEN && p.min < CLOSE[p.dow]) return { state: CLOSE[p.dow] - p.min <= 45 ? 'soon' : 'open', until: CLOSE[p.dow] };
    return { state: 'closed', until: null };
  }

  var now = nyParts(new Date());
  var st = status(now);
  var texts;
  if (st.state === 'closed') {
    var opensToday = now.min < OPEN;
    texts = {
      short: 'Closed · opens 8 am',
      long: 'Closed now · opens ' + (opensToday ? 'at 8 am' : 'tomorrow at 8 am'),
      dock: 'Closed · opens 8 am'
    };
  } else {
    var u = clock(st.until), cu = st.until % 1440 === 0 ? '12 am' : clock(st.until);
    texts = st.state === 'soon'
      ? { short: 'Closing soon · ' + u, long: 'Open now · last orders before ' + u, dock: 'Closing at ' + cu }
      : { short: 'Open now · until ' + u, long: 'Open now · until ' + u + ' tonight', dock: 'Open till ' + cu };
  }
  [].forEach.call(document.querySelectorAll('[data-status]'), function (el) {
    el.textContent = texts[el.getAttribute('data-status')] || texts.long;
    el.classList.add('is-' + st.state);
  });
  [].forEach.call(document.querySelectorAll('#hours tr'), function (tr) {
    if (+tr.getAttribute('data-d') === now.dow) tr.classList.add('today');
  });

  /* ---------- The qamariya: evening level from New York time ---------- */
  var hero = document.querySelector('.hero');
  var note = document.getElementById('windowNote');
  var duskBtn = document.getElementById('duskBtn');
  var sunset = sunsetMinutes(now);
  var real = { level: 0, note: '' };

  function compute() {
    var p = nyParts(new Date());
    var s = status(p);
    var lv, msg;
    if (s.state === 'closed') {
      lv = 0.12;
      msg = 'We’re closed — the lamps come back on at 8 am.';
    } else {
      var t = p.min - sunset;
      if (p.min < 300) t = p.min + 1440 - sunset;          // after midnight: still night
      lv = Math.max(0, Math.min(1, (t + 60) / 120));
      if (lv <= 0) msg = 'Daylight on Fifth Avenue. The glass starts to glow near sunset, about ' + clock(sunset) + ' today.';
      else if (lv < 1) msg = 'Dusk in Bay Ridge — sunset ' + clock(sunset) + '. The lamps are coming on.';
      else msg = 'Lit for the evening · open until ' + clock(s.until) + '.';
    }
    real = { level: Math.round(lv * 1000) / 1000, note: msg };
  }

  function setLevel(v) {
    hero.style.setProperty('--level', v);
    hero.classList.toggle('is-lit', v >= 0.95);
  }

  var duskLabel = 'Watch dusk fall';
  if (hero) {
    compute();
    note.textContent = real.note;
    if (real.level >= 0.95) duskLabel = 'Replay nightfall';
    duskBtn.querySelector('span').textContent = duskLabel;
    if (reduce.matches) {
      setLevel(real.level);
      hero.classList.add('is-live');
    } else {
      // two frames so the 0 → level transition actually plays on load
      requestAnimationFrame(function () {
        hero.classList.add('is-live');
        requestAnimationFrame(function () { setLevel(real.level); });
      });
    }
    // keep in step with the real clock while the page is open
    setInterval(function () {
      if (duskBtn.getAttribute('aria-pressed') === 'true') return;
      compute();
      setLevel(real.level);
      note.textContent = real.note;
    }, 60000);

    duskBtn.addEventListener('click', function () {
      var on = duskBtn.getAttribute('aria-pressed') !== 'true';
      duskBtn.setAttribute('aria-pressed', String(on));
      duskBtn.querySelector('span').textContent = on ? 'Back to now' : duskLabel;
      if (on) {
        note.textContent = 'Preview: the window from sunset to full dark.';
        if (!reduce.matches) {
          hero.classList.remove('is-live');
          setLevel(0);
          void hero.offsetWidth;                // commit the daylight state before animating
          hero.classList.add('is-live', 'is-preview');
        }
        setLevel(1);
      } else {
        hero.classList.remove('is-preview');
        compute();
        setLevel(real.level);
        note.textContent = real.note;
      }
    });
  }

  /* ---------- Navigation dialog ---------- */
  var drawer = document.getElementById('drawer');
  var burger = document.querySelector('.burger');
  if (drawer && burger && typeof drawer.showModal === 'function') {
    burger.addEventListener('click', function () {
      drawer.showModal();
      burger.setAttribute('aria-expanded', 'true');
    });
    drawer.querySelector('.drawer__close').addEventListener('click', function () { drawer.close(); });
    var viaLink = false;
    // keep Tab / Shift+Tab inside the open dialog
    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = drawer.querySelectorAll('a[href], button:not([disabled])');
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    drawer.addEventListener('click', function (e) {
      if (e.target === drawer) drawer.close();                 // backdrop
      if (e.target.closest('a[href^="#"]')) { viaLink = true; drawer.close(); } // in-page link: close, then follow
    });
    drawer.addEventListener('close', function () {
      burger.setAttribute('aria-expanded', 'false');
      if (!viaLink) burger.focus();                            // return focus to the opener
      viaLink = false;
    });
  }

  /* ---------- Menu filters ---------- */
  var chips = document.querySelectorAll('.chip');
  var items = document.querySelectorAll('.item');
  var count = document.getElementById('filterCount');
  var tests = {
    all: function () { return true; },
    light: function (el) { return el.hasAttribute('data-light'); },
    spice: function (el) { return +el.getAttribute('data-spice') >= 2; },
    lesssweet: function (el) { return +el.getAttribute('data-sweet') <= 1; }
  };
  [].forEach.call(chips, function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      [].forEach.call(chips, function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      var shown = 0;
      [].forEach.call(items, function (it) {
        var ok = tests[f](it);
        it.classList.toggle('is-out', !ok);
        if (ok) shown++;
      });
      [].forEach.call(document.querySelectorAll('.cat'), function (cat) {
        cat.classList.toggle('is-empty', !cat.querySelector('.item:not(.is-out)'));
      });
      count.textContent = f === 'all' ? '' : 'Showing ' + shown + ' of ' + items.length + ' items · ' + chip.textContent.toLowerCase();
    });
  });

  /* ---------- Gathering builder (composes a prefilled text message) ---------- */
  var POT = { 'Qishr': { 6: 32, 12: 58 }, 'Adeni chai': { 6: 30, 12: 55 }, 'Jubani coffee': { 6: 36, 12: 66 } };
  var SWEET = { 'Whole honey cake': 48, 'Large bint al-sahn': 26, 'Large sabaya': 24, '': 0 };
  var order = { drink: 'Qishr', size: '6', sweet: 'Whole honey cake', when: 'today' };
  var line = document.getElementById('orderLine');
  var total = document.getElementById('orderTotal');
  var sms = document.getElementById('orderSms');

  function render() {
    var pot = order.drink + ' pot for ' + order.size;
    var sweet = order.sweet ? ' + ' + order.sweet.charAt(0).toLowerCase() + order.sweet.slice(1) : '';
    var sum = POT[order.drink][order.size] + SWEET[order.sweet];
    line.textContent = pot + sweet + ', pickup ' + order.when;
    total.textContent = '$' + sum;
    var body = 'Hi Mokha & Moon! I’d like ' + (/^[AEIOU]/.test(pot) ? 'an ' : 'a ') + pot + sweet +
      ', pickup ' + order.when + ' (est. $' + sum + '). What time works?';
    sms.href = 'sms:+17185550142?&body=' + encodeURIComponent(body);
  }
  [].forEach.call(document.querySelectorAll('.choice'), function (btn) {
    btn.addEventListener('click', function () {
      var k = btn.getAttribute('data-k');
      [].forEach.call(document.querySelectorAll('.choice[data-k="' + k + '"]'), function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      order[k] = btn.getAttribute('data-v');
      render();
    });
  });
  if (line) render();
})();
