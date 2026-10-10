(function () {
  'use strict';
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
    return ((h % 12) || 12) + (mm ? ':' + ('0' + mm).slice(-2) : '') + (h >= 12 ? ' pm' : ' am');
  }
  var now = ny();

  /* Open / closed status (hero + visit section) */
  function statusText() {
    var h = HOURS[now.dow];
    if (h && now.min >= h[0] && now.min < h[1]) {
      return { open: true, text: 'Open now · kitchen until ' + clock(h[1]) };
    }
    if (h && now.min < h[0]) return { open: false, text: 'Opens today at ' + clock(h[0]) + ' · walk-ins welcome' };
    var k = 1; while (!HOURS[(now.dow + k) % 7] && k < 7) k++;
    var next = HOURS[(now.dow + k) % 7];
    return { open: false, text: 'Closed now · back ' + (k === 1 ? 'tomorrow' : DAYS[(now.dow + k) % 7]) + ' at ' + clock(next[0]) };
  }
  var st = statusText();
  [].forEach.call(document.querySelectorAll('[data-status]'), function (el) {
    el.textContent = st.text; el.classList.toggle('is-open', st.open);
  });
  [].forEach.call(document.querySelectorAll('#hours li'), function (li) {
    if (li.getAttribute('data-days').split(' ').indexOf(String(now.dow)) > -1) {
      li.classList.add('is-today'); li.setAttribute('aria-current', 'date');
    }
  });

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
    var li = document.createElement('li'), b = document.createElement('b'), s = document.createElement('span');
    b.textContent = specials[d][0]; s.textContent = specials[d][1];
    if (d === now.dow) { li.className = 'is-today'; li.setAttribute('aria-current', 'date'); }
    li.appendChild(b); li.appendChild(s); week.appendChild(li);
  });

  /* Menu tabs (roving tabindex, arrow keys, Home/End) */
  var tabs = [].slice.call(document.querySelectorAll('.menu__tabs [role="tab"]'));
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
      var n = null, L = tabs.length;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = tabs[(i + 1) % L];
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = tabs[(i - 1 + L) % L];
      if (e.key === 'Home') n = tabs[0];
      if (e.key === 'End') n = tabs[L - 1];
      if (n) { e.preventDefault(); sel(n); n.focus(); }
    });
  });

  /* Ticker pause */
  var ticker = document.querySelector('.ticker'), pause = document.querySelector('.ticker__pause');
  if (pause) pause.addEventListener('click', function () {
    var p = ticker.classList.toggle('is-paused');
    pause.setAttribute('aria-pressed', String(p));
    pause.setAttribute('aria-label', p ? 'Play scrolling' : 'Pause scrolling');
  });

  /* Gentle reveal on scroll */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.nonna__card, .nonna__week, .timeline li, .garden__text, .visit__col').forEach(function (el) {
      el.classList.add('reveal'); io.observe(el);
    });
  }
})();
