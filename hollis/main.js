/* Hollis Grooming Room — live status, menu, request builder, quiet motion */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EMAIL = 'appointments@hollis.nyc';

  /* ── Live open status (New York time) ───────────────────────── */
  var HOURS = { 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [9, 20], 6: [9, 16] }; // dow: [open, close] in 24h
  var DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { t: ((+o.hour) % 24) + (+o.minute) / 60, dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday) };
  }
  function hr(h) { return (h % 12 || 12) + (h >= 12 ? ' pm' : ' am'); }
  function status() {
    var n = ny(), h = HOURS[n.dow], open = !!h && n.t >= h[0] && n.t < h[1], txt;
    if (open) txt = 'Open today until ' + hr(h[1]);
    else if (h && n.t < h[0]) txt = 'Closed now · opens today at ' + hr(h[0]);
    else {
      var k = 1; while (!HOURS[(n.dow + k) % 7]) k++;
      txt = 'Closed now · opens ' + (k === 1 ? 'tomorrow' : DAY[(n.dow + k) % 7]) + ' at ' + hr(HOURS[(n.dow + k) % 7][0]);
    }
    [].forEach.call(document.querySelectorAll('[data-status]'), function (el) { el.textContent = txt; el.classList.toggle('is-open', open); });
    [].forEach.call(document.querySelectorAll('#hrs [data-d]'), function (row) {
      row.classList.toggle('is-today', row.getAttribute('data-d').split(' ').indexOf(String(n.dow)) > -1);
    });
  }
  status(); setInterval(status, 60000);

  /* ── Header background + mobile dock ────────────────────────── */
  var head = document.getElementById('head'), dock = document.querySelector('.dock'), hero = document.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY || 0;
    head.classList.toggle('is-solid', y > 40);
    dock.classList.toggle('is-on', y > hero.offsetHeight * 0.6);
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ── Overlay menu (dialog with focus trap) ──────────────────── */
  var mb = document.querySelector('.menu-btn'), ov = document.getElementById('overlay'), main = document.getElementById('main'), last = null;
  function focusables() { return [mb].concat([].slice.call(ov.querySelectorAll('a[href],button'))); }
  function setOv(open, restore) {
    ov.hidden = !open;
    mb.setAttribute('aria-expanded', String(open));
    mb.querySelector('.menu-btn__l').textContent = open ? 'Close' : 'Menu';
    document.documentElement.style.overflow = open ? 'hidden' : '';
    head.classList.toggle('is-solid', open || (window.scrollY || 0) > 40);
    [main, document.querySelector('.foot'), dock].forEach(function (el) { if (open) el.setAttribute('inert', ''); else el.removeAttribute('inert'); });
    if (open) { last = document.activeElement; ov.querySelector('nav a').focus(); }
    else if (restore) mb.focus();
  }
  mb.addEventListener('click', function () { setOv(ov.hidden, true); });
  ov.addEventListener('click', function (e) { if (e.target.closest('nav a')) setOv(false, false); });
  document.addEventListener('keydown', function (e) {
    if (ov.hidden) return;
    if (e.key === 'Escape') { setOv(false, true); return; }
    if (e.key === 'Tab') {
      var q = focusables(), a = q[0], z = q[q.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });

  /* ── Request builder: chips → prefilled email ───────────────── */
  var rq = document.getElementById('rq'), noteBody = document.getElementById('noteBody'), mail = document.getElementById('rqMail');
  function picked(name) {
    return [].map.call(rq.querySelectorAll('[data-name="' + name + '"] [aria-pressed="true"]'), function (b) { return b.getAttribute('data-v'); });
  }
  function list(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' or ' + a[a.length - 1]; }
  function compose() {
    var svc = picked('service')[0], add = picked('addons'), days = picked('days'), tod = picked('tod')[0], first = picked('first')[0];
    var standing = svc === 'A Standing Appointment';
    var dayTxt = days.length ? (days.length === 5 ? 'any day Tuesday to Saturday' : list(days)) : 'any day Tuesday to Saturday';
    var todShort = tod.split(' (')[0].toLowerCase();
    var line = (standing ? 'A Standing Appointment' : svc) + (add.length ? ', with ' + list(add) : '') + ', ' + dayTxt + ', ' + todShort + '. ' +
      (first === 'I have been before' ? 'I’ve been before.' : 'First visit.') +
      (todShort === 'evening' && days.indexOf('Saturday') > -1 ? ' (Saturdays close at 4.)' : '');
    noteBody.textContent = line;
    var body = 'Good day,\n\n' +
      (standing ? 'I would like to ask about a place for the Standing Appointment.\n\n' : 'I would like to request an appointment.\n\n') +
      'Service: ' + svc + '\n' +
      (add.length ? 'Add-ons: ' + add.join(', ') + '\n' : '') +
      'Days that suit me: ' + (days.length ? days.join(', ') : 'Any, Tuesday to Saturday') + '\n' +
      'Time of day: ' + tod + '\n' +
      'Visit: ' + first + '\n\n' +
      'Thank you,\n';
    var subj = standing ? 'Standing Appointment enquiry' : 'Appointment request — ' + svc;
    mail.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body);
  }
  rq.addEventListener('click', function (e) {
    var b = e.target.closest('.chips button'); if (!b) return;
    var group = b.parentNode;
    if (group.hasAttribute('data-single')) {
      [].forEach.call(group.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    } else {
      b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
    }
    // Add-ons don't apply to a standing appointment enquiry
    var standing = picked('service')[0] === 'A Standing Appointment';
    [].forEach.call(rq.querySelectorAll('[data-name="addons"] button'), function (x) { x.disabled = standing; if (standing) x.setAttribute('aria-pressed', 'false'); });
    compose();
  });
  // "Ask about a place" in the Standing section preselects that option
  var pick = document.querySelector('[data-pick="standing"]');
  if (pick) pick.addEventListener('click', function () {
    var b = rq.querySelector('[data-v="A Standing Appointment"]');
    if (b.getAttribute('aria-pressed') !== 'true') b.click();
  });
  compose();

  /* ── Quiet motion: parallax + reveal (skipped for reduced motion) ── */
  if (reduce) return;
  document.documentElement.classList.add('js-motion');
  var par = document.querySelectorAll('[data-parallax]'), ticking = false;
  function upd() {
    [].forEach.call(par, function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      var p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      el.style.transform = 'translate3d(0,' + (p * -50).toFixed(1) + 'px,0)';
    });
    ticking = false;
  }
  addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(upd); ticking = true; } }, { passive: true });
  upd();
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    [].forEach.call(document.querySelectorAll('.room__text, .room__img, .svc li, blockquote, .steps li, .terms div, .faq__list'), function (el) { el.classList.add('reveal'); io.observe(el); });
    [].forEach.call(document.querySelectorAll('.bar'), function (b) { io.observe(b); });
  } else {
    document.documentElement.classList.remove('js-motion');
  }
})();
