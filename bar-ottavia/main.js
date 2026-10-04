(function () {
  'use strict';
  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { h: (+o.hour) % 24, m: +o.minute, dow: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday] };
  }
  var now = ny();

  /* nav */
  var burger = document.querySelector('.burger'), nav = document.getElementById('nav');
  function setNav(o) { nav.classList.toggle('open', o); burger.setAttribute('aria-expanded', String(o)); burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); }
  burger.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setNav(false); burger.focus(); } });

  /* Nonna's week */
  var specials = [
    ['Domenica', 'Sunday gravy', 'Pork ribs, braciole and meatballs in a sauce that started at 7 am. Rigatoni underneath. Kids eat cacio e pepe free before 6.', 29],
    ['Lunedì', 'Pasta e fagioli', 'Ditalini, borlotti beans, rosemary, a parm rind that’s been simmering since lunch. Free corkage tonight.', 19],
    ['Martedì', 'Pollo alla cacciatora', 'Braised chicken thighs, peppers, olives, white wine, soft polenta.', 28],
    ['Mercoledì', 'Lasagna di Nonna', 'The old-school one: ricotta, tiny meatballs, hard-boiled egg. Yes, egg. Trust her.', 27],
    ['Giovedì', 'Stuffed calamari', 'Squid filled with breadcrumbs, pecorino and raisins, braised in tomato.', 31],
    ['Venerdì', 'Spaghetti con le alici', 'Anchovies, toasted breadcrumbs, chili, lemon. The Friday fish, as it’s always been.', 24],
    ['Sabato', 'Pork chop Calabrese', 'Thick-cut, pan-roasted with hot cherry peppers and potatoes.', 34]
  ];
  var t = specials[now.dow];
  document.getElementById('nonnaDay').textContent = 'Oggi · ' + t[0];
  document.getElementById('nonnaDish').textContent = t[1];
  document.getElementById('nonnaDesc').textContent = t[2];
  document.getElementById('nonnaPrice').textContent = '$' + t[3];
  var week = document.getElementById('week');
  [1, 2, 3, 4, 5, 6, 0].forEach(function (d) {
    var li = document.createElement('li');
    if (d === now.dow) { li.className = 'is-today'; li.setAttribute('aria-current', 'date'); }
    li.innerHTML = '<b>' + specials[d][0] + '</b><span>' + specials[d][1] + '</span>';
    week.appendChild(li);
  });

  /* menu tabs */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function sel(tab) {
    tabs.forEach(function (x) {
      var on = x === tab;
      x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { sel(tab); });
    tab.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (n) { e.preventDefault(); sel(n); n.focus(); }
    });
  });

  /* hours / live status */
  var H = { 0: [13, 21.5], 1: [17, 22.5], 2: [17, 22.5], 3: [17, 22.5], 4: [17, 22.5], 5: [17, 23.5], 6: [17, 23.5] };
  var key = now.dow === 0 ? 0 : (now.dow >= 5 ? 5 : 1);
  var row = document.querySelector('#hours li[data-d="' + key + '"]');
  if (row) row.classList.add('is-today');
  var live = document.getElementById('live'), tt = now.h + now.m / 60, hh = H[now.dow];
  function f(x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return ((h % 12) || 12) + (m ? ':' + String(m).padStart(2, '0') : '') + (h >= 12 ? ' pm' : ' am'); }
  if (tt >= hh[0] && tt < hh[1]) { live.classList.add('is-open'); live.textContent = 'Open now — kitchen until ' + f(hh[1]); }
  else if (tt < hh[0]) live.textContent = 'Opens today at ' + f(hh[0]);
  else live.textContent = 'Closed for the night — back tomorrow';

  /* reveal */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.nonna__card, .week, .card, .timeline li, .garden__text, .visit__grid > div, .family__intro').forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();
