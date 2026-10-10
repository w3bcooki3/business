(function () {
  'use strict';
  var root = document.documentElement;
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var HOURS = (window.SITEMENU && window.SITEMENU.hours) || {};

  /* Current time in New York, whatever the visitor's time zone. */
  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { dow: DAYS.indexOf(o.weekday), min: ((+o.hour) % 24) * 60 + (+o.minute) };
  }
  function clock(m) {
    var h = Math.floor(m / 60) % 24, mm = m % 60;
    if (m >= 1440) return 'midnight';
    return ((h % 12) || 12) + (mm ? ':' + ('0' + mm).slice(-2) : '') + (h >= 12 ? ' pm' : ' am');
  }
  var now = ny();
  var SHIFT_CHANGE = 17 * 60;

  /* Day / night switch */
  var meta = document.querySelector('meta[name="theme-color"]');
  var sw = [].slice.call(document.querySelectorAll('.switch button'));
  var tabs = [].slice.call(document.querySelectorAll('.seg [role="tab"]'));

  function selTab(name) {
    tabs.forEach(function (b) {
      var on = b.id === 't-' + name;
      b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1;
      document.getElementById(b.getAttribute('aria-controls')).hidden = !on;
    });
  }
  function setShift(s) {
    root.setAttribute('data-shift', s);
    sw.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set') === s)); });
    if (meta) meta.setAttribute('content', s === 'day' ? '#f3efe6' : '#1a0f0e');
    selTab(s);
  }
  setShift(root.getAttribute('data-shift') === 'night' ? 'night' : 'day');
  sw.forEach(function (b) { b.addEventListener('click', function () { setShift(b.getAttribute('data-set')); }); });

  tabs.forEach(function (b, i) {
    b.addEventListener('click', function () { selTab(b.id.slice(2)); });
    b.addEventListener('keydown', function (e) {
      if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].indexOf(e.key) < 0) return;
      e.preventDefault();
      var n = e.key === 'Home' ? tabs[0] : e.key === 'End' ? tabs[tabs.length - 1] : tabs[(i + 1) % tabs.length];
      selTab(n.id.slice(2)); n.focus();
    });
  });

  /* Open status */
  var h = HOURS[now.dow], open = !!(h && now.min >= h[0] && now.min < h[1]), txt;
  if (open) txt = 'Open now · ' + (now.min < SHIFT_CHANGE ? 'first shift until 5 pm' : 'second shift until ' + clock(h[1]));
  else if (h && now.min < h[0]) txt = 'Closed · doors open at ' + clock(h[0]);
  else txt = 'Closed · back tomorrow at ' + clock(HOURS[(now.dow + 1) % 7][0]);
  [].forEach.call(document.querySelectorAll('[data-status]'), function (el) { el.textContent = txt; el.classList.toggle('is-open', open); });

  /* Clock marker across the 7 am – midnight bar */
  var start = 7 * 60, end = 24 * 60;
  var nowEl = document.getElementById('clockNow'), bar = document.getElementById('clockBar');
  if (now.min >= start && now.min < end) {
    var pct = (now.min - start) / (end - start) * 100;
    nowEl.style.left = pct + '%';
    nowEl.style.setProperty('--tx', pct > 80 ? '-100%' : pct < 20 ? '0%' : '-50%');
    document.getElementById('clockTime').textContent = 'Now ' + clock(now.min);
    nowEl.hidden = false;
    bar.setAttribute('aria-label', bar.getAttribute('aria-label') + ' It is ' + clock(now.min) + ' in New York.');
  }

  /* Weekly: mark today */
  var li = document.querySelector('#cal li[data-d="' + now.dow + '"]');
  if (li) { li.classList.add('today'); li.setAttribute('aria-current', 'date'); }

  /* Gentle reveal on scroll */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.board__col, .shift, .space__text, .find__card').forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();
