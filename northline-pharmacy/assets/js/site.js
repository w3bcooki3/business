(function () {
  'use strict';
  document.documentElement.classList.add('js');

  /* Mobile menu */
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (btn && nav) {
    var label = btn.querySelector('.menu-label');
    var setOpen = function (open) {
      btn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('open', open);
      if (label) label.textContent = open ? 'Close' : 'Menu';
    };
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setOpen(false); btn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 900) setOpen(false); });
  }

  /* Open-now status, in New York time */
  var HOURS = { 0: [10, 17], 1: [8, 21], 2: [8, 21], 3: [8, 21], 4: [8, 21], 5: [8, 21], 6: [9, 19] };
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function nyNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
      var wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday);
      return { day: wd, mins: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    } catch (e) { var d = new Date(); return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() }; }
  }
  function fmt(h) { var s = h > 12 ? h - 12 : h; return s + (h >= 12 ? 'pm' : 'am'); }
  var now = nyNow();
  document.querySelectorAll('[data-status]').forEach(function (el) {
    var t = HOURS[now.day], open = now.mins >= t[0] * 60 && now.mins < t[1] * 60;
    var txt = el.querySelector('.status-text');
    el.classList.add(open ? 'is-open' : 'is-closed');
    if (open) {
      var left = t[1] * 60 - now.mins;
      txt.textContent = left <= 60 ? 'Open now, closing soon at ' + fmt(t[1]) : 'Open now until ' + fmt(t[1]);
    } else {
      var nd = now.mins < t[0] * 60 ? now.day : (now.day + 1) % 7;
      var when = nd === now.day ? 'today' : (nd === (now.day + 1) % 7 ? 'tomorrow' : DAYS[nd]);
      txt.textContent = 'Closed now. Opens ' + when + ' at ' + fmt(HOURS[nd][0]);
    }
  });
  // highlight today in hours lists
  var key = now.day === 0 ? 'sun' : (now.day === 6 ? 'sat' : 'wk');
  document.querySelectorAll('.hours [data-day="' + key + '"]').forEach(function (el) { el.classList.add('today'); });
  // chalkboard day
  document.querySelectorAll('[data-chalk-day]').forEach(function (el) { el.textContent = 'Today, ' + DAYS[now.day]; });

  /* Tabs (services) */
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') n = tabs[0];
        if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
    select(tabs[0]);
  });

  /* Insurance finder: a live filter, never submits */
  document.querySelectorAll('[data-finder]').forEach(function (root) {
    var form = root.querySelector('form');
    var input = root.querySelector('input');
    var out = root.querySelector('.finder-result');
    var items = Array.prototype.slice.call(root.querySelectorAll('.plan-list li'));
    var tel = root.getAttribute('data-tel'), phone = root.getAttribute('data-phone');
    var norm = function (s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); };
    var icon = function (n) { return '<svg class="i" aria-hidden="true"><use href="assets/img/icons.svg#' + n + '"/></svg>'; };
    var initial = out.innerHTML;
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); });
    function run() {
      var q = norm(input.value);
      if (q.length < 2) {
        items.forEach(function (li) { li.hidden = false; li.classList.remove('hit'); });
        out.className = 'finder-result'; out.innerHTML = initial; return;
      }
      var hits = [];
      items.forEach(function (li) {
        var hay = norm(li.textContent + ' ' + (li.getAttribute('data-k') || ''));
        var m = q.split(' ').every(function (w) { return hay.indexOf(w) !== -1; });
        li.hidden = !m; li.classList.toggle('hit', m);
        if (m) hits.push(li);
      });
      if (hits.length) {
        var names = hits.slice(0, 3).map(function (li) { return li.getAttribute('data-name'); });
        var more = hits.length > 3 ? ' and ' + (hits.length - 3) + ' more' : '';
        out.className = 'finder-result yes';
        out.innerHTML = icon('check') + '<span>Yes, we take ' + names.join(', ') + more + '. Bring your card and we’ll take care of the rest.</span>';
      } else {
        items.forEach(function (li) { li.hidden = false; });
        out.className = 'finder-result no';
        out.innerHTML = icon('phone') + '<span>Not on our list yet. <a href="' + tel + '">Call ' + phone + '</a> and we’ll check your plan in about 2 minutes.</span>';
      }
    }
    input.addEventListener('input', run);
  });
})();
