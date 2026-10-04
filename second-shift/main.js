(function () {
  'use strict';
  var root = document.documentElement;
  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { h: (+o.hour) % 24, m: +o.minute, dow: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday] };
  }
  var now = ny();
  var t = now.h + now.m / 60;
  var autoShift = (t >= 17 || t < 7) ? 'night' : 'day';
  var meta = document.querySelector('meta[name="theme-color"]');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

  function selTab(name) {
    tabs.forEach(function (b) {
      var on = b.id === 't-' + name;
      b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1;
      document.getElementById(b.getAttribute('aria-controls')).hidden = !on;
    });
  }
  function setShift(s) {
    root.setAttribute('data-shift', s);
    document.getElementById('pillTxt').textContent = s === 'day' ? 'First shift' : 'Second shift';
    document.getElementById('toggle').setAttribute('aria-pressed', String(s === 'night'));
    meta.setAttribute('content', s === 'day' ? '#f3efe6' : '#1a0f0e');
    selTab(s);
  }
  setShift(autoShift);
  document.getElementById('toggle').addEventListener('click', function () {
    setShift(root.getAttribute('data-shift') === 'day' ? 'night' : 'day');
  });
  tabs.forEach(function (b, i) {
    b.addEventListener('click', function () { selTab(b.id.slice(2)); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var n = tabs[(i + 1) % 2]; selTab(n.id.slice(2)); n.focus(); }
    });
  });

  /* clock marker: 7 → 24 */
  var nowEl = document.getElementById('clockNow');
  var pct = (t - 7) / 17 * 100;
  var label = ((now.h % 12) || 12) + ':' + String(now.m).padStart(2, '0') + (now.h >= 12 ? ' pm' : ' am');
  if (t >= 7) { nowEl.style.left = 'calc(' + Math.min(pct, 100) + '% - 1px)'; if (pct > 85) nowEl.style.setProperty('--tx', '-100%'); if (pct < 10) nowEl.style.setProperty('--tx', '0%'); document.getElementById('clockTime').textContent = 'Now ' + label; }
  else nowEl.classList.add('closed');
  document.getElementById('clockBar').setAttribute('aria-label', 'Open 7 am to midnight. It is ' + label + ' in New York.');

  /* status */
  var st = document.getElementById('status');
  if (t >= 7) { st.classList.add('open'); st.textContent = 'Open now · ' + (t < 17 ? 'first shift until 5' : 'second shift until midnight'); }
  else st.textContent = 'Closed · doors open at 7 am';

  /* weekly */
  var li = document.querySelector('#cal li[data-d="' + now.dow + '"]');
  if (li) li.classList.add('today');

  /* reveal */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.board__col, .shift, .cal li, .space__text, .space__imgs figure, .find__card').forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();
