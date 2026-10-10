/* Dobra Bakehouse — oven schedule, mobile nav, today highlights.
   Times are computed in America/New_York. For testing, append ?now=2026-10-15T08:20
   (read as Greenpoint wall-clock time). */
(function () {
  'use strict';

  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  // [open, close] in minutes after midnight; null = closed
  var HOURS = [[480, 960], null, null, [420, 900], [420, 900], [420, 900], [480, 960]];

  function fruitFor(month) { // 0-based month
    if (month >= 7 && month <= 9) return 'Italian plums';
    if (month === 10 || month === 11) return 'apples & quince';
    if (month <= 2) return 'poached pears';
    return 'rhubarb & strawberry';
  }

  // Each entry: [minutes, name, note, flag]
  function bakeFor(dow, month) {
    var t = function (h, m) { return h * 60 + m; };
    var cake = 'Plum cake';
    var cakeNote = 'Sheet cake with ' + fruitFor(month) + ', $6 a slice';
    if (!(month >= 7 && month <= 9)) cake = 'Fruit cake';
    if (dow === 1 || dow === 2) return null;
    if (dow === 0 || dow === 6) {
      return [
        [t(8, 0), dow === 6 ? 'First loaf: country sourdough & Babcia’s rye' : 'Country sourdough & Babcia’s rye', dow === 6 ? 'The Saturday line starts forming around 7:40' : 'First bake of the day'],
        [t(8, 30), 'Cardamom knots', 'Still sticky with sugar syrup'],
        [t(9, 0), 'Seeded spelt', 'Sunflower, flax, pumpkin, sesame'],
        [t(9, 30), 'Chocolate babka', 'Cardamom-chocolate, whole loaves'],
        [t(10, 0), 'Bialys', 'Onion & poppy seed centers'],
        [t(10, 45), dow === 6 ? 'Poppy seed roll' : 'Sernik', dow === 6 ? 'Makowiec, sliced or whole' : 'Polish cheesecake, out of the chiller'],
        [t(11, 30), 'Second sourdough bake', 'For the afternoon crowd'],
        [t(12, 30), cake, cakeNote],
        [t(13, 30), 'Rye chocolate-chip cookies', 'Warm until about 2'],
        [t(14, 30), 'Bialys, last tray', 'Then it’s what’s on the shelves']
      ];
    }
    var list = [
      [t(7, 0), 'Country sourdough & Babcia’s rye', 'On the shelves as the door opens'],
      [t(7, 30), 'Cardamom knots', 'Still sticky with sugar syrup'],
      [t(8, 15), 'Seeded spelt', 'Sunflower, flax, pumpkin, sesame'],
      [t(8, 30), 'Chocolate babka', 'Cardamom-chocolate, whole loaves'],
      [t(9, 30), 'Poppy seed roll', 'Makowiec, sliced or whole'],
      [t(10, 0), 'Bialys', 'Onion & poppy seed centers'],
      [t(11, 30), 'Second sourdough bake', 'For the lunch crowd'],
      [t(12, 15), cake, cakeNote],
      [t(13, 0), 'Rye chocolate-chip cookies', 'Warm until about 1:30'],
      [t(14, 0), 'Bialys, last tray', 'Then it’s what’s on the shelves']
    ];
    if (dow === 4) { // Thursday: paczki fry
      list.splice(1, 0, [t(7, 15), 'Pączki, first fry', 'Rose-hip jam or vanilla custard', 'fry']);
      list.splice(7, 0, [t(10, 30), 'Pączki, second fry', 'Usually gone by noon', 'fry']);
    }
    if (dow === 5) { // Friday: challah
      list.splice(3, 0, [t(8, 0), 'Challah', 'Braided, sesame or plain']);
      list.splice(8, 0, [t(11, 0), 'Challah, second bake', 'For Shabbat tables']);
    }
    list.sort(function (a, b) { return a[0] - b[0]; });
    return list;
  }

  // ---------- time ----------
  function nowNY() {
    var q = /[?&]now=([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})/.exec(location.search);
    var y, mo, d, h, mi;
    if (q) { y = +q[1]; mo = +q[2] - 1; d = +q[3]; h = +q[4]; mi = +q[5]; }
    else {
      var parts = {};
      try {
        new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
          .formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
        y = +parts.year; mo = +parts.month - 1; d = +parts.day; h = +parts.hour % 24; mi = +parts.minute;
      } catch (e) { var n = new Date(); y = n.getFullYear(); mo = n.getMonth(); d = n.getDate(); h = n.getHours(); mi = n.getMinutes(); }
    }
    var dow = new Date(Date.UTC(y, mo, d)).getUTCDay();
    return { y: y, mo: mo, d: d, dow: dow, min: h * 60 + mi, mocked: !!q };
  }
  function addDays(n, k) {
    var dt = new Date(Date.UTC(n.y, n.mo, n.d + k));
    return { y: dt.getUTCFullYear(), mo: dt.getUTCMonth(), d: dt.getUTCDate(), dow: dt.getUTCDay(), min: 0 };
  }
  function clock(m) {
    var h = Math.floor(m / 60), mm = m % 60;
    return h + ':' + (mm < 10 ? '0' : '') + mm;
  }
  function clock12(m) {
    var h = Math.floor(m / 60), mm = m % 60, s = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return h + (mm ? ':' + (mm < 10 ? '0' : '') + mm : '') + s;
  }
  function until(mins) {
    if (mins < 60) return mins + ' min';
    var h = Math.floor(mins / 60), m = mins % 60;
    return h + ' hr' + (m ? ' ' + m + ' min' : '');
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---------- state ----------
  var NOW = nowNY();

  function nextOpenDay(from, startOffset) {
    for (var k = startOffset; k < 8; k++) { var c = addDays(from, k); if (HOURS[c.dow]) return { day: c, offset: k }; }
    return null;
  }

  function computeState(n) {
    var hrs = HOURS[n.dow];
    var st = { mode: '', day: n, offset: 0 };
    if (!hrs) {
      var nx = nextOpenDay(n, 1); st.mode = 'closed'; st.day = nx.day; st.offset = nx.offset;
    } else if (n.min >= hrs[1]) {
      var nx2 = nextOpenDay(n, 1); st.mode = 'after'; st.day = nx2.day; st.offset = nx2.offset;
    } else if (n.min < hrs[0]) {
      st.mode = 'before';
    } else {
      st.mode = 'open';
    }
    st.list = bakeFor(st.day.dow, st.day.mo);
    st.hours = HOURS[st.day.dow];
    var just = -1, next = -1;
    if (st.mode === 'open' || st.mode === 'before') {
      st.list.forEach(function (it, i) {
        if (it[0] <= n.min) just = i;
        else if (next < 0) next = i;
      });
    }
    st.just = just; st.next = next;
    st.justFresh = just >= 0 && n.min - st.list[just][0] <= 45;
    return st;
  }

  function dayWord(st) {
    if (st.offset === 0) return 'Today';
    if (st.offset === 1) return 'Tomorrow';
    return DAYS[st.day.dow];
  }

  function statusText(st) {
    var n = NOW, L = st.list;
    if (st.mode === 'closed') return { closed: true, line: 'Closed today — see you ' + (st.offset === 1 ? 'tomorrow' : DAYS[st.day.dow]), sub: 'Doors open ' + clock12(st.hours[0]) + '. Here’s that bake.' };
    if (st.mode === 'after') return { closed: true, line: 'Sold through for today', sub: (st.offset === 1 ? 'Tomorrow' : DAYS[st.day.dow]) + '’s bake starts ' + clock12(st.hours[0]) + '.' };
    if (st.mode === 'before') {
      return { closed: false, line: 'Ovens are on — doors open at ' + clock12(st.hours[0]), sub: 'First out: ' + L[0][1] + ' in ' + until(L[0][0] - n.min) + '.' };
    }
    var j = st.just >= 0 ? L[st.just] : null, x = st.next >= 0 ? L[st.next] : null;
    var line = j ? 'Out of the oven: ' + j[1] : 'Shelves are filling';
    var sub = x ? 'Next: ' + x[1] + ' at ' + clock(x[0]) + ' (in ' + until(x[0] - n.min) + ')' : 'That’s the last bake. Open until ' + clock12(st.hours[1]) + ' or sold out.';
    return { closed: false, line: line, sub: sub };
  }

  // ---------- render sheet ----------
  function renderSheet(mount, st, viewDow) {
    var viewing = st, isOther = typeof viewDow === 'number' && viewDow !== st.day.dow;
    var dateLine;
    if (isOther) {
      viewing = { list: bakeFor(viewDow, NOW.mo), hours: HOURS[viewDow], mode: 'preview', just: -1, next: -1 };
      dateLine = 'A typical ' + DAYS[viewDow] + ' · ' + clock12(HOURS[viewDow][0]) + '–' + clock12(HOURS[viewDow][1]);
    } else {
      dateLine = DAYS[st.day.dow] + ', ' + MONTHS[st.day.mo] + ' ' + st.day.d + ' · open ' + clock12(st.hours[0]) + '–' + clock12(st.hours[1]);
    }
    var s = statusText(st);
    var title = isOther ? DAYS[viewDow] + '’s bake' : (st.mode === 'open' || st.mode === 'before' ? 'Today’s bake' : dayWord(st) + '’s bake');
    var h = '';
    h += '<div class="sheet__head"><div><h2 class="sheet__title" id="' + mount.id + '-t">' + esc(title) + '</h2><p class="sheet__date">' + esc(dateLine) + '</p></div>';
    var stampTxt = isOther ? 'Every<br>' + DAYS[viewDow] : (st.mode === 'open' || st.mode === 'before') ? 'Baked this<br>morning' : 'Ovens<br>resting';
    h += '<span class="stamp" aria-hidden="true">' + stampTxt + '</span></div>';
    h += '<p class="sheet__status' + (s.closed ? ' is-closed' : '') + '" role="status"><span><span class="dot" aria-hidden="true"></span>' + esc(s.line) + '</span><span>' + esc(s.sub) + '</span></p>';
    var outCount = (!isOther && (st.mode === 'open' || st.mode === 'before')) ? viewing.list.filter(function (x, i) { return i < st.just || (i === st.just && !st.justFresh); }).length : 0;
    if (outCount >= 2) h += '<button type="button" class="earlier" aria-expanded="false">Show ' + outCount + ' earlier trays</button>';
    h += '<ol class="bake">';
    viewing.list.forEach(function (it, i) {
      var cls = [], tag = '';
      if (!isOther && (st.mode === 'open' || st.mode === 'before')) {
        if (i < st.just || (i === st.just && !st.justFresh)) { cls.push('is-out'); tag = 'out'; }
        if (i === st.just && st.justFresh) { cls.push('is-just'); tag = '<span class="stamp">Just out</span>'; }
        if (i === st.next) { cls.push('is-next'); tag = 'in ' + until(it[0] - NOW.min); }
      }
      if (it[3] === 'fry') cls.push('is-fry');
      h += '<li class="' + cls.join(' ') + '"><time datetime="' + (it[0] < 600 ? '0' : '') + clock(it[0]) + '">' + clock(it[0]) + '</time>' +
        '<span class="what">' + esc(it[1]) + (it[3] === 'fry' ? ' <span class="fry" title="fried, not baked">\u2731</span>' : '') + '<small>' + esc(it[2]) + '</small></span><span class="tag">' + tag + '</span></li>';
    });
    h += '</ol>';
    h += '<div class="sheet__foot"><p>' + (viewing.list.some(function (x) { return x[3] === 'fry'; }) ? '✱ fried, not baked. ' : '') + 'Times are when trays come out, give or take ten minutes.</p></div>';
    h += '<div class="sheet__week" role="group" aria-label="See another day’s bake">';
    [3, 4, 5, 6, 0].forEach(function (d) {
      var pressed = (isOther ? d === viewDow : d === st.day.dow);
      h += '<button type="button" data-view="' + d + '" aria-pressed="' + pressed + '">' + SHORT[d] + '</button>';
    });
    h += '</div>';
    mount.innerHTML = '<span class="sheet__tape" aria-hidden="true"></span>' + h;
    var ol = mount.querySelector('.bake'), eb = mount.querySelector('.earlier');
    if (eb) {
      ol.classList.add('is-collapsed');
      eb.addEventListener('click', function () {
        var open = eb.getAttribute('aria-expanded') !== 'true';
        eb.setAttribute('aria-expanded', String(open)); ol.classList.toggle('is-collapsed', !open);
        eb.textContent = open ? 'Hide earlier trays' : 'Show ' + outCount + ' earlier trays';
      });
    }
    mount.setAttribute('aria-labelledby', mount.id + '-t');
    Array.prototype.forEach.call(mount.querySelectorAll('[data-view]'), function (b) {
      b.addEventListener('click', function () {
        var d = +b.getAttribute('data-view');
        renderSheet(mount, st, d === st.day.dow ? undefined : d);
        var nb = mount.querySelector('[data-view="' + d + '"]'); if (nb) nb.focus();
      });
    });
  }

  function renderChip(st) {
    var chip = document.querySelector('[data-chip]'); if (!chip) return;
    var L = st.list, a, b;
    if (st.mode === 'open') {
      a = st.just >= 0 ? 'Out of the oven: ' + L[st.just][1] : 'Shelves are filling';
      b = st.next >= 0 ? 'next: ' + L[st.next][1] + ' ' + clock(L[st.next][0]) : 'last bake is out · open till ' + clock12(st.hours[1]);
    } else if (st.mode === 'before') {
      a = 'Doors open ' + clock12(st.hours[0]);
      b = 'first out: ' + L[0][1].replace(/^First loaf: /, '') + ' ' + clock(L[0][0]);
    } else {
      a = st.mode === 'closed' ? 'Closed today' : 'Closed for the day';
      b = 'see you ' + (st.offset === 1 ? 'tomorrow' : DAYS[st.day.dow]) + ' at ' + clock12(st.hours[0]);
    }
    chip.querySelector('b').textContent = a;
    chip.querySelector('.chip__txt span').textContent = b;
    chip.setAttribute('aria-label', a + ', ' + b + '. Open the full bake schedule');
  }

  // ---------- today highlights ----------
  function markToday() {
    var rail = document.querySelector('.week'), td = rail && rail.querySelector('[data-dow="' + NOW.dow + '"]');
    if (rail && td && rail.scrollWidth > rail.clientWidth + 4) rail.scrollLeft = td.offsetLeft - rail.offsetLeft - 16;
    Array.prototype.forEach.call(document.querySelectorAll('[data-dow]'), function (el) {
      if (+el.getAttribute('data-dow') === NOW.dow) el.classList.add('is-today');
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-open-now]'), function (el) {
      var hrs = HOURS[NOW.dow];
      var open = hrs && NOW.min >= hrs[0] && NOW.min < hrs[1];
      el.textContent = open ? 'Open now until ' + clock12(hrs[1]) + ' (or sold out)' : 'Closed now — next open ' + (function () { var x = nextOpenDay(NOW, hrs && NOW.min < hrs[0] ? 0 : 1); return (x.offset === 0 ? 'today' : x.offset === 1 ? 'tomorrow' : DAYS[x.day.dow]) + ' at ' + clock12(HOURS[x.day.dow][0]); })();
    });
  }

  // ---------- specials calendar (menu page) ----------
  function renderCalendar() {
    var table = document.querySelector('[data-cal]'), list = document.querySelector('[data-cal-list]');
    if (!table) return;
    var y = NOW.y, mo = NOW.mo;
    var first = new Date(Date.UTC(y, mo, 1)).getUTCDay();
    var days = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate();
    var firstSun = 1 + ((7 - first) % 7);
    function events(d) {
      var dow = (first + d - 1) % 7, ev = [];
      if (!HOURS[dow]) return null;
      if (dow === 4) ev.push(['Pączki, fried 7:15 & 10:30', 'fry']);
      if (dow === 5) ev.push(['Challah, 8:00 & 11:00', '']);
      if (dow === 6) ev.push(['First-loaf line, 8:00', '']);
      if (dow === 0 && d === firstSun) ev.push(['Bread class, 5–8pm', 'class']);
      if (dow === 3 && d <= 7) ev.push(['New seasonal cake', '']);
      return ev;
    }
    var cap = table.querySelector('caption');
    if (cap) cap.textContent = 'Weekly specials, ' + MONTHS[mo] + ' ' + y;
    var tb = '<thead><tr>' + ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(function (s, i) { return '<th scope="col"><abbr title="' + DAYS[i] + '">' + s + '</abbr></th>'; }).join('') + '</tr></thead><tbody><tr>';
    var li = '';
    for (var i = 0; i < first; i++) tb += '<td class="out" aria-hidden="true"></td>';
    for (var d = 1; d <= days; d++) {
      var col = (first + d - 1) % 7, ev = events(d);
      var today = d === NOW.d ? ' today' : '';
      tb += '<td class="' + (ev ? '' : 'off') + today + '"><span class="d">' + d + '</span>' +
        (ev ? ev.map(function (e) { return '<span class="ev' + (e[1] ? ' ev--' + e[1] : '') + '">' + e[0] + '</span>'; }).join('') : '<span class="vh">Closed</span>') + '</td>';
      if (ev && ev.length && d >= NOW.d) li += '<li' + (today ? ' class="is-today"' : '') + '><span class="d">' + SHORT[col] + ' ' + MONTHS[mo].slice(0, 3) + ' ' + d + '</span><span>' + ev.map(function (e) { return e[0]; }).join('; ') + '</span></li>';
      if (col === 6 && d < days) tb += '</tr><tr>';
    }
    var end = (first + days) % 7;
    if (end) for (var k = end; k < 7; k++) tb += '<td class="out" aria-hidden="true"></td>';
    tb += '</tr></tbody>';
    table.insertAdjacentHTML('beforeend', tb);
    if (list) list.innerHTML = li;
  }

  // ---------- nav ----------
  function nav() {
    var btn = document.querySelector('.menu-btn'), menu = document.getElementById('site-nav');
    if (!btn || !menu) return;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { btn.click(); btn.focus(); }
    });
  }

  // ---------- menu tabs: highlight current category ----------
  function tabs() {
    var tabsEl = document.querySelector('[data-tabs]'); if (!tabsEl || !('IntersectionObserver' in window)) return;
    var links = tabsEl.querySelectorAll('a');
    var vis = {};
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis[e.target.id] = e.isIntersecting; });
      var first = null;
      Array.prototype.some.call(links, function (a) { var id = a.getAttribute('href').slice(1); if (vis[id]) { first = id; return true; } return false; });
      if (!first) return;
      Array.prototype.forEach.call(links, function (a) {
        var on = a.getAttribute('href') === '#' + first;
        a.classList.toggle('is-active', on);
        if (on) { a.setAttribute('aria-current', 'true'); } else { a.removeAttribute('aria-current'); }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Array.prototype.forEach.call(links, function (a) {
      var t = document.querySelector(a.getAttribute('href')); if (t) io.observe(t);
    });
  }

  function dayArt(st) {
    var fig = document.querySelector('[data-dayart]'); if (!fig) return;
    var d = st.day.dow, art = { 4: ['paczki', 'Thursday is p\u0105czki day: two fries, rose-hip jam or vanilla custard.'], 5: ['challah', 'Friday means challah, braided at dawn and baked twice.'] }[d] ||
      (d === 6 ? ['rye-loaf', 'Saturday\u2019s first loaf comes out at 8:00 sharp. The line starts around 7:40.'] : ['babka', 'Chocolate babka comes out mid-morning, still warm enough to tear.']);
    var img = fig.querySelector('img'), cap = fig.querySelector('figcaption');
    img.src = 'assets/img/' + art[0] + '.svg'; cap.textContent = (st.offset ? (st.offset === 1 ? 'Tomorrow: ' : DAYS[d] + ': ') : '') + art[1];
    img.alt = '';
  }

  // ---------- boot ----------
  var st = computeState(NOW);
  Array.prototype.forEach.call(document.querySelectorAll('[data-oven]'), function (m) { renderSheet(m, st); });
  renderChip(st);
  dayArt(st);
  markToday();
  renderCalendar();
  nav();
  tabs();

  var chip = document.querySelector('[data-chip]'), dlg = document.getElementById('oven-dialog');
  if (chip && dlg && dlg.showModal) {
    chip.addEventListener('click', function () { dlg.showModal(); chip.setAttribute('aria-expanded', 'true'); });
    dlg.addEventListener('close', function () { chip.setAttribute('aria-expanded', 'false'); chip.focus(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    var cl = dlg.querySelector('.close'); if (cl) cl.addEventListener('click', function () { dlg.close(); });
  } else if (chip) {
    chip.addEventListener('click', function () { location.href = (document.querySelector('[data-oven]') ? '#bake' : 'index.html#bake'); });
  }
  // On the home page, hide the chip while the hero bake sheet itself is on screen.
  var heroBoard = document.querySelector('.hero .board');
  if (chip && heroBoard && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      chip.classList.toggle('is-hidden', es[0].isIntersecting);
    }, { rootMargin: '0px 0px -60px 0px' }).observe(heroBoard);
  }
})();
