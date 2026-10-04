(function () {
  'use strict';
  var PHONE = '(212) 555-0136';
  // [open, close] in hours, by weekday (0 = Sunday)
  var H = { 0: [10, 16], 1: [8, 20], 2: [8, 20], 3: [8, 20], 4: [8, 20], 5: [8, 20], 6: [9, 18] };
  // delivery: [order-by hour, arrives-by label] — none on Sunday
  var D = { 0: null, 1: [15, '7 pm'], 2: [15, '7 pm'], 3: [15, '7 pm'], 4: [15, '7 pm'], 5: [15, '7 pm'], 6: [12, '4 pm'] };
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { y: +o.year, mo: +o.month, d: +o.day, h: (+o.hour) % 24, m: +o.minute, dow: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday] };
  }
  function fmt(h) { return ((h % 12) || 12) + (h >= 12 ? ' pm' : ' am'); }
  function dur(mins) { var h = Math.floor(mins / 60), m = mins % 60; return (h ? h + ' hr ' : '') + m + ' min'; }

  function render() {
    var n = ny(), t = n.h * 60 + n.m, d = H[n.dow], open = t >= d[0] * 60 && t < d[1] * 60, txt;
    if (open) txt = 'Open now · until ' + fmt(d[1]);
    else if (t < d[0] * 60) txt = 'Closed · opens ' + fmt(d[0]);
    else txt = 'Closed · opens ' + DAYS[(n.dow + 1) % 7].slice(0, 3) + ' ' + fmt(H[(n.dow + 1) % 7][0]);
    [].forEach.call(document.querySelectorAll('[data-status]'), function (el) { el.textContent = txt; el.classList.toggle('is-open', open); });
    var th = document.querySelector('[data-today-hours]'); if (th) th.textContent = fmt(d[0]) + ' – ' + fmt(d[1]);

    var dl = document.querySelector('[data-delivery]'), dd = D[n.dow];
    if (dl) {
      if (dd && t < dd[0] * 60 && t >= d[0] * 60) dl.textContent = 'Order in ' + dur(dd[0] * 60 - t) + ', arrives by ' + dd[1];
      else if (dd && t < d[0] * 60) dl.textContent = 'Order by ' + fmt(dd[0]) + ', arrives by ' + dd[1];
      else {
        var k = 1; while (!D[(n.dow + k) % 7]) k++;
        var nd = D[(n.dow + k) % 7];
        dl.textContent = 'Next: ' + (k === 1 ? 'tomorrow' : DAYS[(n.dow + k) % 7]) + ', order by ' + fmt(nd[0]);
      }
    }
    var row = document.querySelector('#hrs tr[data-d="' + n.dow + '"]');
    [].forEach.call(document.querySelectorAll('#hrs tr'), function (r) { r.classList.toggle('today', r === row); });

    // Medicare open enrollment: Oct 15 – Dec 7 every year
    var today = Date.UTC(n.y, n.mo - 1, n.d), day = 864e5;
    var s = Date.UTC(n.y, 9, 15), e = Date.UTC(n.y, 11, 7), lab, num;
    if (today < s) { lab = 'Open enrollment starts in'; num = Math.round((s - today) / day); }
    else if (today <= e) { lab = 'Open enrollment ends in'; num = Math.round((e - today) / day); }
    else { lab = 'Next open enrollment in'; num = Math.round((Date.UTC(n.y + 1, 9, 15) - today) / day); }
    document.querySelector('[data-oe-label]').textContent = lab;
    document.querySelector('[data-oe-num]').textContent = num;
    document.querySelector('[data-oe-unit]').textContent = num === 1 ? 'day' : 'days';
  }
  render(); setInterval(render, 60000);

  /* text size */
  var root = document.documentElement;
  function setSize(v) {
    root.classList.toggle('is-big', v === '2');
    [].forEach.call(document.querySelectorAll('.tsz button'), function (b) { b.setAttribute('aria-pressed', b.dataset.size === v); });
    try { localStorage.setItem('halvorsen-size', v); } catch (e) {}
  }
  [].forEach.call(document.querySelectorAll('.tsz'), function (g) { g.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setSize(b.dataset.size); }); });
  try { if (localStorage.getItem('halvorsen-size') === '2') setSize('2'); } catch (e) {}

  /* refill email */
  var rf = document.getElementById('rfForm'), go = document.getElementById('rfGo');
  function v(id) { return document.getElementById(id).value.trim(); }
  function build() {
    var del = rf.querySelector('input[name=how]:checked').value === 'deliver';
    var body = 'Refill request\n\nRx number: ' + (v('f-rx') || '') + '\nName: ' + v('f-nm') + '\nDate of birth: ' + v('f-dob') + '\nPhone: ' + v('f-ph') + '\nPickup or delivery: ' + (del ? 'Same-day delivery' : 'Pick up at the counter') + '\n';
    go.href = 'mailto:rx@halvorsenapothecary.com?subject=' + encodeURIComponent('Refill ' + (v('f-rx') || 'request')) + '&body=' + encodeURIComponent(body);
  }
  rf.addEventListener('input', build); rf.addEventListener('change', build); build();
  rf.addEventListener('submit', function (e) { e.preventDefault(); go.click(); });

  /* delivery zone */
  var zone = document.getElementById('zone'), out = document.getElementById('zoneR'), pin = document.getElementById('zpin');
  zone.addEventListener('submit', function (e) {
    e.preventDefault();
    var st = parseInt(v('z-st'), 10), side = document.getElementById('z-av').value;
    out.className = 'zone__r';
    if (!st) { out.textContent = 'Enter the cross street number, for example 86.'; return; }
    var y = 102 - (Math.min(Math.max(st, 50), 118) - 59) / 51 * 84;
    pin.setAttribute('transform', 'translate(' + (side === 'e' ? 215 : 85) + ' ' + Math.max(10, Math.min(112, y)).toFixed(0) + ')');
    if (st >= 59 && st <= 110) { out.classList.add('ok'); out.textContent = '✓ You’re in the free zone. Delivery is on us.'; }
    else { out.classList.add('no'); out.textContent = 'That’s outside the free zone. Call ' + PHONE + ' and we’ll work something out.'; }
  });

  /* header: shadow + scroll-spy + drawer */
  var hdr = document.querySelector('.hdr');
  function onScroll() { hdr.classList.toggle('is-stuck', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var links = [].slice.call(document.querySelectorAll('.nav a'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + en.target.id ? 'true' : 'false'); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) io.observe(s); });
  }
  var dr = document.getElementById('drawer'), mb = document.querySelector('.mbtn'), last;
  function openD() { last = document.activeElement; dr.hidden = false; requestAnimationFrame(function () { dr.classList.add('is-open'); }); mb.setAttribute('aria-expanded', 'true'); document.body.classList.add('is-locked'); setTimeout(function () { dr.querySelector('.drawer__x').focus(); }, 60); }
  function closeD(nav) { dr.classList.remove('is-open'); mb.setAttribute('aria-expanded', 'false'); document.body.classList.remove('is-locked'); setTimeout(function () { if (!dr.classList.contains('is-open')) dr.hidden = true; }, 350); if (!nav && last) last.focus(); }
  mb.addEventListener('click', openD);
  dr.querySelector('.drawer__x').addEventListener('click', function () { closeD(); });
  dr.querySelector('.drawer__scrim').addEventListener('click', function () { closeD(); });
  dr.addEventListener('click', function (e) { if (e.target.closest('a[href^="#"]')) closeD(true); });
  document.addEventListener('keydown', function (e) {
    if (!dr.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeD();
    if (e.key === 'Tab') {
      var q = dr.querySelectorAll('a[href],button:not([tabindex="-1"])'), a = q[0], z = q[q.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });
})();
