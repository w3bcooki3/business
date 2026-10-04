(function () {
  'use strict';
  var doc = document.documentElement;

  /* ---- New York clock ---- */
  function ny() {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short', timeZoneName: 'short'
    }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { y: +o.year, mo: +o.month, d: +o.day, h: (+o.hour) % 24, m: +o.minute, dow: days[o.weekday], dst: /EDT/.test(o.timeZoneName) };
  }
  var now = ny();

  /* ---- Header + chart overlay ---- */
  var bar = document.querySelector('.bar');
  var btn = document.querySelector('.menu-btn');
  var chart = document.getElementById('chart');
  function onScroll() { bar.classList.toggle('is-solid', window.scrollY > window.innerHeight * 0.7 && chart.hidden); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  function setChart(open) {
    chart.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.firstChild.nodeValue = open ? 'Close ' : 'Menu ';
    doc.classList.toggle('chart-open', open);
    bar.classList.remove('is-solid');
    if (open) chart.querySelector('a').focus(); else onScroll();
  }
  btn.addEventListener('click', function () { setChart(chart.hidden); });
  chart.addEventListener('click', function (e) { if (e.target.closest('a[href^="#"]')) setChart(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !chart.hidden) { setChart(false); btn.focus(); } });

  /* ---- Sunset (approximate, NYC) ---- */
  var start = Date.UTC(now.y, 0, 0), today = Date.UTC(now.y, now.mo - 1, now.d);
  var doy = Math.round((today - start) / 864e5);
  var stdHours = 18.03 + 1.5 * Math.sin(2 * Math.PI * (doy - 81) / 365) + 0.12 * Math.sin(4 * Math.PI * (doy - 5) / 365);
  if (now.dst) stdHours += 1;
  var sh = Math.floor(stdHours), sm = Math.round((stdHours - sh) * 60);
  if (sm === 60) { sh++; sm = 0; }
  var sunsetTxt = ((sh % 12) || 12) + ':' + String(sm).padStart(2, '0') + ' pm';
  var sl = document.getElementById('sunsetLine');
  if (sl) sl.innerHTML = 'Sunset tonight, approx. ' + sunsetTxt + '<br>Ask for a window seat.';

  /* ---- Today's landing board ---- */
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var dateEl = document.getElementById('landingDate');
  if (dateEl) dateEl.textContent = dayNames[now.dow] + ', ' + months[now.mo - 1] + ' ' + now.d;

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
  // deterministic daily pick so the board looks "live" but stable through the day
  var seed = now.y * 400 + doy;
  function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  var picks = pool.slice().sort(function () { return rnd() - 0.5; }).slice(0, 7);
  var outIndex = Math.floor(rnd() * 7);
  var rows = document.getElementById('boardRows');
  if (rows) {
    picks.forEach(function (p, i) {
      var r = document.createElement('div');
      r.className = 'board__row' + (i === outIndex && now.h >= 19 ? ' is-out' : '');
      r.setAttribute('role', 'row');
      r.innerHTML = '<b role="cell">' + p[0] + '</b><span role="cell">' + p[1] + '</span><span role="cell">' + p[2] + '</span><span role="cell">' +
        (i === outIndex && now.h >= 19 ? '<span class="out">86’d</span>' : p[3]) + '</span>';
      rows.appendChild(r);
    });
  }

  /* ---- Menu tabs ---- */
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
      var k = e.key, n = null;
      if (k === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (k === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (n) { e.preventDefault(); select(n); n.focus(); }
    });
  });

  /* ---- Hours + open status ---- */
  var hours = { 0: [12, 21], 3: [17, 22], 4: [17, 22], 5: [17, 23], 6: [17, 23] };
  var tr = document.querySelector('#hoursBody tr[data-d="' + now.dow + '"]');
  if (tr) tr.classList.add('is-today');
  var st = document.getElementById('status');
  if (st) {
    var t = now.h + now.m / 60, h = hours[now.dow];
    var fmt = function (x) { return x === 12 ? 'noon' : ((x % 12) || 12) + ' pm'; };
    if (h && t >= h[0] && t < h[1]) { st.classList.add('is-open'); st.textContent = 'Open now — kitchen closes at ' + fmt(h[1]); }
    else if (h && t < h[0]) { st.textContent = 'Closed now — doors open at ' + fmt(h[0]) + ' today'; }
    else {
      var d = now.dow, i2 = 0;
      do { d = (d + 1) % 7; i2++; } while (!hours[d] && i2 < 8);
      st.textContent = 'Closed now — next service ' + dayNames[d] + ' at ' + fmt(hours[d][0]);
    }
  }

  /* ---- Reveal ---- */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var els = document.querySelectorAll('.landing__head, .board, .dish li, .story__text, .boats li, .strip figure, .loft__card, .ways > div, .sunset p');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();
