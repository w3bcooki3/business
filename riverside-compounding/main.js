/* Riverside Formulary — interactions (vanilla, no dependencies) */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Live open status (America/New_York) ---------- */
  // [day 0=Sun..6=Sat] -> [openMinute, closeMinute] or null
  var HOURS = { 0: null, 1: [540, 1140], 2: [540, 1140], 3: [540, 1140], 4: [540, 1140], 5: [540, 1140], 6: [600, 960] };
  var DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function nyNow() {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
    }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    return { day: DAY.indexOf(o.weekday), min: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
  }
  function fmt(m) {
    var h = Math.floor(m / 60), mm = m % 60, suf = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return h + (mm ? ':' + String(mm).padStart(2, '0') : '') + ' ' + suf;
  }
  function nextOpening(day, min) {
    for (var i = 0; i < 8; i++) {
      var d = (day + i) % 7, h = HOURS[d];
      if (!h) continue;
      if (i === 0 && min >= h[0]) continue;
      var when = i === 0 ? 'today' : i === 1 ? 'tomorrow' : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d];
      return { when: when, at: fmt(h[0]) };
    }
    return null;
  }
  function updateStatus() {
    var now = nyNow(), h = HOURS[now.day], state, html;
    if (h && now.min >= h[0] && now.min < h[1]) {
      var left = h[1] - now.min;
      state = left <= 30 ? 'is-soon' : 'is-open';
      html = left <= 30 ? '<b>Closing soon</b> · until ' + fmt(h[1]) : '<b>Open now</b> · until ' + fmt(h[1]);
    } else {
      var n = nextOpening(now.day, now.min);
      state = 'is-closed';
      html = '<b>Closed</b>' + (n ? ' · opens ' + (n.when === 'today' ? 'at ' + n.at : n.when + ' ' + n.at) : '');
    }
    document.querySelectorAll('[data-status]').forEach(function (el) {
      el.classList.remove('is-open', 'is-soon', 'is-closed');
      el.classList.add(state);
      var t = el.querySelector('.status__text');
      if (t) t.innerHTML = html;
    });
    document.querySelectorAll('.hours tr').forEach(function (tr) {
      tr.classList.toggle('is-today', tr.getAttribute('data-days') === String(now.day));
    });
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  /* ---------- Menu dialog: focus trap, Escape, focus return ---------- */
  var menu = document.getElementById('menu');
  var opener = document.querySelector('[data-menu-open]');
  var lastFocus = null;
  function focusables() {
    return Array.prototype.slice.call(menu.querySelectorAll('a[href], button:not([disabled])'));
  }
  function openMenu() {
    lastFocus = document.activeElement;
    if (typeof menu.showModal === 'function') menu.showModal(); else menu.setAttribute('open', '');
    opener.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    var first = menu.querySelector('[data-menu-close]');
    if (first) first.focus();
  }
  function closeMenu() {
    if (!menu.open) return;
    if (typeof menu.close === 'function') menu.close(); else menu.removeAttribute('open');
  }
  if (menu && opener) {
    opener.addEventListener('click', openMenu);
    menu.addEventListener('close', function () {
      opener.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    });
    menu.querySelector('[data-menu-close]').addEventListener('click', closeMenu);
    menu.addEventListener('click', function (e) {
      if (e.target === menu) { closeMenu(); return; }
      var a = e.target.closest('a[href^="#"]');
      if (a) { lastFocus = null; closeMenu(); }
    });
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
      if (e.key !== 'Tab') return;
      var f = focusables(), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    window.matchMedia('(min-width: 1200px)').addEventListener('change', function (m) { if (m.matches) closeMenu(); });
  }

  /* ---------- Process sequence: diagram follows the step being read ---------- */
  var figure = document.querySelector('.process__figure');
  var steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
  var track = document.querySelectorAll('.track__item');
  var numEl = document.querySelector('[data-stage-num]');
  var nameEl = document.querySelector('[data-stage-name]');
  var trackOl = document.querySelector('.track');
  var readout = document.querySelector('[data-readout]');
  var current = 0, ticking = false, readoutRaf = 0;

  function setStage(n) {
    if (n === current) return;
    current = n;
    figure.setAttribute('data-stage', String(n));
    numEl.textContent = String(n).padStart(2, '0');
    nameEl.textContent = steps[n - 1].getAttribute('data-name');
    trackOl.style.setProperty('--p', String((n - 1) / 5));
    track.forEach(function (li, i) {
      li.classList.toggle('is-done', i < n);
      li.classList.toggle('is-now', i === n - 1);
    });
    steps.forEach(function (s, i) { s.classList.toggle('is-current', i === n - 1); });
    if (n === 3) countReadout();
    toggleOrbit(n === 4);
  }
  function countReadout() {
    if (!readout) return;
    cancelAnimationFrame(readoutRaf);
    if (reduceMotion.matches) { readout.textContent = '0.2500 g'; return; }
    var start = null, dur = 1100;
    (function frame(t) {
      if (start === null) start = t;
      var k = Math.min(1, (t - start) / dur), e = 1 - Math.pow(1 - k, 3);
      readout.textContent = (0.25 * e).toFixed(4) + ' g';
      if (k < 1) readoutRaf = requestAnimationFrame(frame);
    })(performance.now());
  }
  // Pestle trituration: outer rotates about the bowl centre, inner counter-rotates -> circular grind
  var orbit = document.querySelector('.orbit'), orbitIn = document.querySelector('.orbit__inner');
  var anims = [];
  function toggleOrbit(on) {
    if (!orbit || !orbit.animate) return;
    if (on && !reduceMotion.matches && !anims.length) {
      var opts = { duration: 2200, iterations: Infinity, easing: 'linear' };
      anims = [
        orbit.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], opts),
        orbitIn.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-360deg)' }], opts)
      ];
    } else if (!on && anims.length) {
      anims.forEach(function (a) { a.cancel(); });
      anims = [];
    }
  }
  function pickStep() {
    ticking = false;
    var line = window.innerHeight * (window.innerWidth < 960 ? 0.66 : 0.55), n = 1;
    steps.forEach(function (s, i) { if (s.getBoundingClientRect().top < line) n = i + 1; });
    setStage(n);
  }
  if (figure && steps.length) {
    current = 0;
    pickStep();
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(pickStep); }
    }, { passive: true });
    window.addEventListener('resize', pickStep);
  }

  /* ---------- Refill text composer (buttons only, no personal-data inputs) ---------- */
  var state = { need: 'refill', when: 'today', count: 1 };
  var preview = document.querySelector('[data-preview]');
  var smsLink = document.querySelector('[data-sms]');
  var countEl = document.querySelector('[data-count]');
  var countWrap = document.querySelector('[data-count-wrap]');
  var PHONE = '+12125550147';

  function plural(n) { return n + ' prescription' + (n === 1 ? '' : 's'); }
  function message() {
    var c = state.count, what;
    if (state.need === 'refill') what = 'I’d like to refill ' + plural(c);
    else if (state.need === 'compound') what = 'I’d like to refill ' + (c === 1 ? 'a compounded prescription' : c + ' compounded prescriptions');
    else if (state.need === 'transfer') what = 'I’d like to transfer ' + plural(c) + ' to you from another pharmacy';
    else what = 'could you let me know if my order is ready';
    if (state.need === 'status') {
      return 'Hello Riverside Formulary — could you let me know if my order is ready? ' +
        (state.when === 'delivery' ? 'I’d like it delivered.' : 'I’d like to pick it up ' + state.when + '.') + ' My name is: ';
    }
    var when = state.when === 'delivery' ? 'for local delivery' : 'for pickup ' + state.when;
    return 'Hello Riverside Formulary — ' + what + ', ' + when + '. My name is: ';
  }
  function render() {
    var msg = message();
    preview.textContent = msg;
    smsLink.setAttribute('href', 'sms:' + PHONE + '?&body=' + encodeURIComponent(msg));
    countEl.textContent = String(state.count);
    countWrap.hidden = state.need === 'status';
    document.querySelector('[data-step-dir="-1"]').disabled = state.count <= 1;
    document.querySelector('[data-step-dir="1"]').disabled = state.count >= 9;
  }
  if (preview && smsLink) {
    document.querySelectorAll('.chips').forEach(function (group) {
      group.addEventListener('click', function (e) {
        var btn = e.target.closest('.chip');
        if (!btn) return;
        group.querySelectorAll('.chip').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        state[group.getAttribute('data-group')] = btn.getAttribute('data-value');
        render();
      });
    });
    document.querySelectorAll('[data-step-dir]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.count = Math.max(1, Math.min(9, state.count + parseInt(b.getAttribute('data-step-dir'), 10)));
        render();
      });
    });
    render();
  }

  /* ---------- Copy fax number ---------- */
  var copyStatus = document.querySelector('[data-copy-status]');
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var label = btn.textContent;
    btn.addEventListener('click', function () {
      var val = btn.getAttribute('data-copy');
      var done = function () {
        btn.textContent = 'Copied';
        btn.classList.add('is-done');
        if (copyStatus) copyStatus.textContent = 'Fax number copied to clipboard';
        setTimeout(function () { btn.textContent = label; btn.classList.remove('is-done'); }, 2200);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(val).then(done, function () { if (copyStatus) copyStatus.textContent = 'Fax: ' + val; });
      } else if (copyStatus) {
        copyStatus.textContent = 'Fax: ' + val;
        btn.textContent = val;
      }
    });
  });

  /* ---------- Sticky mobile action bar: appears once the hero buttons scroll away ---------- */
  var bar = document.querySelector('[data-actionbar]');
  var heroActions = document.querySelector('[data-hero-actions]');
  if (bar && heroActions && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      bar.classList.toggle('is-visible', !e.isIntersecting);
    }).observe(heroActions);
  } else if (bar) {
    bar.classList.add('is-visible');
  }
})();
