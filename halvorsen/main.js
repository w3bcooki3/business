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

  /* chip groups: one choice per group */
  function chips(el, cb) {
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      [].forEach.call(el.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      cb();
    });
  }
  function picked(root, key) { var b = root.querySelector('[data-key="' + key + '"] [aria-pressed="true"]'); return b ? b.dataset.v : ''; }

  /* refill email builder: no personal data typed on this site */
  var rb = document.getElementById('rb');
  if (rb) {
    var n = 1, nOut = document.getElementById('rbN'), pre = document.getElementById('rbPre'), go = document.getElementById('rbGo');
    var BLANK = '[ ]';
    var buildRefill = function () {
      var when = picked(rb, 'when'), del = picked(rb, 'how') === 'delivery', lines = ['Hello Halvorsen,', '', 'Please refill ' + (n === 1 ? 'this prescription' : 'these ' + n + ' prescriptions') + ':'];
      for (var i = 1; i <= n; i++) lines.push('Rx number' + (n > 1 ? ' ' + i : '') + ': H-' + BLANK);
      lines.push('', del ? 'Please deliver ' + (n === 1 ? 'it' : 'them') + ' ' + when + '.' : 'I’ll pick ' + (n === 1 ? 'it' : 'them') + ' up at the counter ' + when + '.');
      if (del) lines.push('Delivery address: ' + BLANK);
      lines.push('Name on the label: ' + BLANK, 'Best number to call me: ' + BLANK, '', 'Thank you.');
      var body = lines.join('\n');
      pre.innerHTML = body.replace(/&/g, '&amp;').replace(/</g, '&lt;').split(BLANK).join('<mark>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</mark>');
      nOut.textContent = n;
      rb.querySelector('[data-step="-1"]').disabled = n <= 1;
      rb.querySelector('[data-step="1"]').disabled = n >= 6;
      go.href = 'mailto:rx@halvorsenapothecary.com?subject=' + encodeURIComponent('Refill request (' + n + ')') + '&body=' + encodeURIComponent(body.split(BLANK).join(''));
    };
    [].forEach.call(rb.querySelectorAll('.chips'), function (g) { chips(g, buildRefill); });
    [].forEach.call(rb.querySelectorAll('[data-step]'), function (b) {
      b.addEventListener('click', function () { n = Math.min(6, Math.max(1, n + +b.dataset.step)); buildRefill(); });
    });
    buildRefill();
  }

  /* delivery zone: side + cross street, on-page only */
  var zone = document.getElementById('zone');
  if (zone) {
    var out = document.getElementById('zoneR'), pin = document.getElementById('zpin'), sel = document.getElementById('z-st');
    var ord = function (k) { var t = k % 100; return k + ((t > 10 && t < 14) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' })[k % 10] || 'th'); };
    var opts = '<option value="49">Below 50th St</option>';
    for (var k = 50; k <= 125; k++) opts += '<option value="' + k + '"' + (k === 81 ? ' selected' : '') + '>' + ord(k) + ' St</option>';
    sel.innerHTML = opts + '<option value="126">Above 125th St</option>';
    var check = function () {
      var st = +sel.value, side = picked(zone, 'side');
      var y = 186 - (Math.min(Math.max(st, 52), 117) - 59) / 51 * 172;
      pin.setAttribute('transform', 'translate(' + (side === 'e' ? 122 : 38) + ' ' + Math.max(12, Math.min(188, y)).toFixed(0) + ')');
      out.className = 'zone__r';
      if (st >= 59 && st <= 110) { out.classList.add('ok'); out.innerHTML = '<b>You’re in the free zone.</b> Order by 3 pm on weekdays (noon Saturday) and it arrives the same day.'; }
      else { out.classList.add('no'); out.innerHTML = '<b>Just outside the free zone.</b> Call <a href="tel:+12125550136">' + PHONE + '</a> and we’ll work something out.'; }
    };
    chips(zone.querySelector('.chips'), check);
    sel.addEventListener('change', check);
    check();
  }

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
