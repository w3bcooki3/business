/* Bellcrest Pharmacy — text size, live open status, "What do you need today?" rows,
   refill text builder, A–Z index, mobile menu. Plain JS, no dependencies. */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement;

  /* ---------- Text size (A / A+ / A++) ---------- */
  var KEY = 'bellcrest-text-size';
  var sizeBtns = $$('[data-size-set]');
  function setSize(v, save) {
    root.setAttribute('data-size', v);
    sizeBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-size-set') === v)); });
    if (save) { try { localStorage.setItem(KEY, v); } catch (e) { /* storage blocked */ } }
  }
  setSize(root.getAttribute('data-size') || '1', false);
  sizeBtns.forEach(function (b) {
    b.addEventListener('click', function () { setSize(b.getAttribute('data-size-set'), true); });
  });

  /* ---------- New York time ---------- */
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // [open, close] in minutes after midnight, America/New_York. Index 0 = Sunday.
  var HOURS = [[600, 900], [540, 1200], [540, 1200], [540, 1200], [540, 1200], [540, 1200], [540, 1080]];

  function nyNow() {
    var parts = {};
    try {
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric',
        weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
      }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    } catch (e) {
      var d = new Date();
      return { dow: d.getDay(), min: d.getHours() * 60 + d.getMinutes(), y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() };
    }
    var dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
    return { dow: dow, min: (+parts.hour % 24) * 60 + +parts.minute, y: +parts.year, m: +parts.month, d: +parts.day };
  }
  function clock(min) {
    var h = Math.floor(min / 60), m = min % 60, ap = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return h + (m ? ':' + (m < 10 ? '0' : '') + m : '') + ' ' + ap;
  }

  var now = nyNow();

  function statusText() {
    var t = HOURS[now.dow];
    if (now.min >= t[0] && now.min < t[1]) {
      return { open: true, text: 'Open now, until ' + clock(t[1]) + ' today' };
    }
    if (now.min < t[0]) return { open: false, text: 'Closed now. Opens today at ' + clock(t[0]) };
    var next = (now.dow + 1) % 7;
    return { open: false, text: 'Closed now. Opens tomorrow, ' + DAYS[next] + ', at ' + clock(HOURS[next][0]) };
  }
  function paintStatus() {
    now = nyNow();
    var s = statusText();
    $$('[data-status]').forEach(function (el) {
      el.classList.toggle('is-open', s.open);
      el.classList.toggle('is-closed', !s.open);
      var t = $('[data-status-text]', el);
      if (t) t.textContent = s.text;
    });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  // Today in the hours table and on the drawn pill strip.
  $$('.hours tr[data-dow]').forEach(function (tr) {
    tr.classList.toggle('is-today', +tr.getAttribute('data-dow') === now.dow);
  });
  $$('.strip__day[data-dow]').forEach(function (d) {
    d.classList.toggle('is-today', +d.getAttribute('data-dow') === now.dow);
  });

  /* ---------- Medicare open enrollment (Oct 15 – Dec 7) ---------- */
  (function () {
    var y = now.y;
    var today = Date.UTC(y, now.m - 1, now.d);
    var start = Date.UTC(y, 9, 15), end = Date.UTC(y, 11, 7);
    var long, short;
    if (today < start) {
      var days = Math.round((start - today) / 86400000);
      long = days === 1 ? 'Open enrollment starts tomorrow. Book your time now.'
        : 'Open enrollment starts in ' + days + ' days. Book your time now.';
      short = 'Opens October 15. Free 30-minute review';
    } else if (today <= end) {
      var left = Math.round((end - today) / 86400000);
      long = left === 0 ? 'Open enrollment ends today.' : 'Open enrollment is on now, ' + left + (left === 1 ? ' day' : ' days') + ' left.';
      short = 'Open enrollment is on now. Free 30-minute review';
    } else {
      long = 'This year’s enrollment has closed. The next one starts October 15, ' + (y + 1) + '.';
      short = 'Free 30-minute plan comparison';
    }
    var a = $('[data-enroll]'), b = $('[data-enroll-short]');
    if (a) a.textContent = long;
    if (b) b.textContent = short;
  })();

  /* ---------- "What do you need today?" rows ---------- */
  var needBtns = $$('.need__btn');
  function setNeed(btn, open) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded', String(open));
    if (panel) panel.hidden = !open;
  }
  needBtns.forEach(function (btn) {
    setNeed(btn, false); // without JS every row stays open
    btn.addEventListener('click', function () {
      setNeed(btn, btn.getAttribute('aria-expanded') !== 'true');
    });
  });
  function openNeed(id, focus) {
    var btn = $('.need__btn[aria-controls="' + id + '"]');
    if (!btn) return false;
    setNeed(btn, true);
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    btn.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    if (focus) btn.focus({ preventScroll: true });
    return true;
  }
  $$('[data-open-need]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (openNeed(a.getAttribute('data-open-need'), true)) e.preventDefault();
    });
  });
  if (location.hash && /^#need-/.test(location.hash)) openNeed(location.hash.slice(1), false);

  /* ---------- Refill text builder ---------- */
  var builder = $('[data-builder]');
  if (builder) {
    var state = { get: 'pickup', lang: 'English' };
    var preview = $('[data-preview]', builder);
    var sms = $('[data-sms]');
    var render = function () {
      var lines = [
        'Hi Bellcrest, I’d like to refill a prescription. ' +
        (state.get === 'delivery' ? 'Please deliver it to my home.' : 'I’ll pick it up.') +
        ' Please reply in ' + state.lang + '.',
        'Name:', 'Date of birth:', 'Rx number:'
      ];
      preview.textContent = '';
      lines.forEach(function (l, i) {
        if (i) preview.appendChild(document.createElement('br'));
        preview.appendChild(document.createTextNode(l));
      });
      if (sms) sms.href = 'sms:+17185550147?&body=' + encodeURIComponent(lines.join('\n') + ' ');
    };
    $$('.choice', builder).forEach(function (c) {
      c.addEventListener('click', function () {
        var k = c.getAttribute('data-key');
        state[k] = c.getAttribute('data-val');
        $$('.choice[data-key="' + k + '"]', builder).forEach(function (o) {
          o.setAttribute('aria-pressed', String(o === c));
        });
        render();
      });
    });
    render();
  }

  /* ---------- A–Z index ---------- */
  var az = $('[data-az]');
  if (az) {
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function (L) {
      var li = document.createElement('li');
      var target = document.getElementById('ins-' + L.toLowerCase());
      if (target) {
        var a = document.createElement('a');
        a.href = '#ins-' + L.toLowerCase();
        a.textContent = L;
        li.appendChild(a);
      } else {
        var s = document.createElement('span');
        s.textContent = L;
        s.setAttribute('aria-hidden', 'true');
        li.appendChild(s);
        li.setAttribute('aria-hidden', 'true');
      }
      az.appendChild(li);
    });
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('[data-menu-btn]');
  var nav = $('#site-nav');
  if (menuBtn && nav) {
    var close = function (refocus) {
      nav.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      if (refocus) menuBtn.focus();
    };
    menuBtn.addEventListener('click', function () {
      var open = menuBtn.getAttribute('aria-expanded') !== 'true';
      nav.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      if (open) { var first = $('a', nav); if (first) first.focus(); }
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) close(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') close(true);
    });
    document.addEventListener('click', function (e) {
      if (menuBtn.getAttribute('aria-expanded') === 'true' && !e.target.closest('.masthead')) close(false);
    });
  }
})();
