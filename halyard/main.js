/* Halyard — page behaviour. Vanilla JS, no dependencies.
   Hours live in HOURS below (24h clock, New York time) and in the
   <table class="hours"> + JSON-LD in index.html. Keep them in sync. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var HOURS = { 0: [12, 21], 3: [17, 22], 4: [17, 22], 5: [17, 23], 6: [17, 23] }; // 0 = Sunday
  var DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- New York clock (whatever the visitor's time zone) ---- */
  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short', timeZoneName: 'short'
    }).formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { y: +o.year, mo: +o.month, d: +o.day, h: (+o.hour) % 24, m: +o.minute,
      dow: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday], dst: /EDT/.test(o.timeZoneName) };
  }
  var now = ny();

  /* ---- Open / closed status ---- */
  function hr(x) { return x === 12 ? 'noon' : ((x % 12) || 12) + (x < 12 ? ' am' : ' pm'); }
  function status() {
    var t = now.h + now.m / 60, h = HOURS[now.dow];
    if (h && t >= h[0] && t < h[1]) return { open: true, long: 'Open now · kitchen until ' + hr(h[1]), short: 'Open · until ' + hr(h[1]) };
    if (h && t < h[0]) return { open: false, long: 'Closed now · doors open at ' + hr(h[0]) + ' today', short: 'Opens ' + hr(h[0]) + ' today' };
    var d = now.dow, k = 0;
    do { d = (d + 1) % 7; k++; } while (!HOURS[d] && k < 8);
    var when = k === 1 ? 'tomorrow' : DAY[d];
    return { open: false, long: 'Closed now · next service ' + when + ' at ' + hr(HOURS[d][0]), short: 'Opens ' + (k === 1 ? 'tomorrow' : DAY[d].slice(0, 3)) + ' ' + hr(HOURS[d][0]) };
  }
  var st = status();
  document.querySelectorAll('[data-status]').forEach(function (el) {
    el.textContent = el.hasAttribute('data-short') ? st.short : st.long;
    el.classList.toggle('is-open', st.open);
  });
  var today = document.querySelector('#hoursBody tr[data-d="' + now.dow + '"]');
  if (today) today.classList.add('is-today');

  /* ---- Header, chart overlay (site menu) and mobile dock ---- */
  var bar = document.querySelector('.bar');
  var btn = document.querySelector('.menu-btn');
  var btnLabel = btn.querySelector('.menu-btn__l');
  var chart = document.getElementById('chart');
  var dock = document.getElementById('dock');
  var hero = document.querySelector('.hero');
  var foot = document.querySelector('.foot');

  function onScroll() {
    var y = window.scrollY, vh = window.innerHeight;
    bar.classList.toggle('is-solid', y > hero.offsetHeight - 80);
    var footTop = foot.getBoundingClientRect().top;
    dock.classList.toggle('is-on', y > vh * 0.6 && footTop > vh - 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  function focusables() {
    return [btn].concat(Array.prototype.slice.call(chart.querySelectorAll('a[href]')));
  }
  function setChart(open, returnFocus) {
    chart.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btnLabel.textContent = open ? 'Close' : 'Menu';
    doc.classList.toggle('chart-open', open);
    if (open) chart.querySelector('a').focus();
    else if (returnFocus) btn.focus();
  }
  btn.addEventListener('click', function () { setChart(chart.hidden); });
  chart.addEventListener('click', function (e) { if (e.target.closest('a[href^="#"]')) setChart(false); });
  document.addEventListener('keydown', function (e) {
    if (chart.hidden) return;
    if (e.key === 'Escape') { setChart(false, true); return; }
    if (e.key === 'Tab') { // keep focus inside header button + overlay while it is open
      var f = focusables(), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (f.indexOf(document.activeElement) === -1) { e.preventDefault(); first.focus(); }
    }
  });
  if (window.matchMedia) {
    // the bar's own menu-btn stays visible; nothing to do on resize except keep state sane
    matchMedia('(min-width: 900px)').addEventListener('change', onScroll);
  }

  /* ---- Sunset (approximate, NYC) ---- */
  var doy = Math.round((Date.UTC(now.y, now.mo - 1, now.d) - Date.UTC(now.y, 0, 0)) / 864e5);
  var sun = 18.03 + 1.5 * Math.sin(2 * Math.PI * (doy - 81) / 365) + 0.12 * Math.sin(4 * Math.PI * (doy - 5) / 365);
  if (now.dst) sun += 1;
  var sh = Math.floor(sun), sm = Math.round((sun - sh) * 60);
  if (sm === 60) { sh++; sm = 0; }
  var sl = document.getElementById('sunsetLine');
  if (sl) sl.textContent = 'Sunset around ' + ((sh % 12) || 12) + ':' + String(sm).padStart(2, '0') + ' pm — ask for a window seat.';

  /* ---- Today's landing board (demo: a stable daily rotation of the regular catch) ---- */
  var dateEl = document.getElementById('landingDate');
  if (dateEl) dateEl.textContent = DAY[now.dow] + ', ' + MONTH[now.mo - 1] + ' ' + now.d;
  var pool = [
    ['Black sea bass', 'F/V Ellen Marie', 'Montauk', '62 lb'],
    ['Fluke', 'F/V Ellen Marie', 'Montauk', '40 lb'],
    ['Swordfish', 'F/V Kestrel', 'Block Island', '1 fish'],
    ['Striped bass', 'F/V Second Wind', 'Montauk', '28 lb'],
    ['Monkfish', 'F/V Ellen Marie', 'Montauk', '35 lb'],
    ['Porgy (scup)', 'F/V Second Wind', 'Montauk', '30 lb'],
    ['Moonstone oysters', 'Moonstone Farm', 'Pt. Judith', '600 ct'],
    ['Littleneck clams', 'Great South Bay', 'Islip', '400 ct'],
    ['Bluefish', 'F/V Second Wind', 'Montauk', '22 lb'],
    ['Sea scallops', 'F/V Kestrel', 'Block Island', '18 lb'],
    ['Tilefish', 'F/V Ellen Marie', 'Montauk', '26 lb']
  ];
  var seed = now.y * 400 + doy;
  function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  var picks = pool.slice().sort(function () { return rnd() - 0.5; }).slice(0, 7);
  var outIndex = Math.floor(rnd() * 7), late = now.h >= 19;
  var rows = document.getElementById('boardRows');
  if (rows) {
    picks.forEach(function (p, i) {
      var out = i === outIndex && late;
      var r = document.createElement('div');
      r.className = 'board__row' + (out ? ' is-out' : '');
      r.setAttribute('role', 'row');
      [['b', p[0]], ['span', p[1]], ['span', p[2]], ['span', out ? '' : p[3]]].forEach(function (c) {
        var el = document.createElement(c[0]);
        el.setAttribute('role', 'cell');
        el.textContent = c[1];
        r.appendChild(el);
      });
      if (out) {
        var tag = document.createElement('span');
        tag.className = 'out'; tag.textContent = 'Sold out';
        r.lastChild.appendChild(tag);
      }
      rows.appendChild(r);
    });
  }

  /* ---- Menu tabs (WAI-ARIA tabs pattern) ---- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function select(t) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t); });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') n = tabs[0];
      if (e.key === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); select(n); n.focus(); }
    });
  });

  /* ---- Gentle reveal on scroll ---- */
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.landing__head, .board, .story__text, .boats, .loft__card, .ways > div, .sunset p').forEach(function (el) {
      el.classList.add('reveal'); io.observe(el);
    });
  }
})();
