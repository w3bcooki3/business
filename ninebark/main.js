/* Ninebark — open status, oven schedule, process tabs, bread-share builder, mobile dock.
   Hours live in window.SHOP (index.html). Everything degrades to readable static HTML without JS. */
(function () {
  'use strict';
  var HOURS = (window.SHOP || {}).hours || {};
  var DN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  /* Current time in New York, whatever the visitor's time zone. */
  function nyNow() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    var h = (+o.hour) % 24, m = +o.minute;
    return { dow: DN.indexOf(o.weekday), min: h * 60 + m, t: h + m / 60 };
  }
  function clock(mins) { var h = Math.floor(mins / 60), m = mins % 60; return ((h % 12) || 12) + (m ? ':' + ('0' + m).slice(-2) : '') + (h >= 12 ? ' pm' : ' am'); }
  function nextOpen(dow) { for (var i = 1; i <= 7; i++) { var d = (dow + i) % 7; if (HOURS[d]) return { d: d, inDays: i }; } return null; }

  var now = nyNow(), today = HOURS[now.dow];
  var isOpen = !!(today && now.min >= today[0] && now.min < today[1]);
  var long, short;
  if (isOpen) { long = 'Open now · bread on the shelves'; short = 'Open now'; }
  else if (today && now.min < today[0]) { long = 'Opens today at ' + clock(today[0]) + ' · ovens are on'; short = 'Opens at ' + clock(today[0]); }
  else {
    var n = nextOpen(now.dow);
    long = n ? 'Closed · back ' + (n.inDays === 1 ? 'tomorrow' : DL[n.d]) + ' at ' + clock(HOURS[n.d][0]) : 'Closed';
    short = n ? 'Closed · back ' + (n.inDays === 1 ? 'tomorrow' : DN[n.d]) + ' ' + clock(HOURS[n.d][0]) : 'Closed';
  }
  $$('[data-status]').forEach(function (el) {
    el.classList.add(isOpen ? 'is-open' : 'is-closed');
    $('[data-status-txt]', el).textContent = el.classList.contains('dock__s') ? short : long;
  });
  $$('#hours tr').forEach(function (tr) {
    if (+tr.getAttribute('data-d') === now.dow) { tr.classList.add('is-today'); tr.querySelector('th').insertAdjacentHTML('beforeend', ' <span class="today-tag">Today</span>'); }
  });

  /* Oven schedule: mark what's out and what's next. */
  var items = $$('#bakes li'), live = $('#ovenLive'), dot = $('#trackNow');
  var weekend = now.dow === 0 || now.dow === 6, t = now.t;
  if (today && t >= 6 && t < 14) {
    var next = null;
    items.forEach(function (li) {
      if (!weekend && li.hasAttribute('data-weekend')) { li.classList.add("is-off"); return; }
      if (parseFloat(li.dataset.t) <= t) li.classList.add('done');
      else if (!next) { next = li; li.classList.add('next'); }
    });
    if (dot) {
      /* Columns are evenly spaced, the bakes are not: place the dot between the two bakes it falls between. */
      var ts = items.map(function (li) { return parseFloat(li.dataset.t); }), k = -1;
      while (k + 1 < ts.length && ts[k + 1] <= t) k++;
      var frac = k < 0 ? 0 : Math.min(1, (t - ts[k]) / ((ts[k + 1] || ts[k] + 1.5) - ts[k]));
      dot.hidden = false; dot.style.left = (Math.max(0, k + frac) / ts.length * 100) + '%';
    }
    if (next) {
      var mins = Math.round((parseFloat(next.dataset.t) - t) * 60);
      live.textContent = next.querySelector('b').textContent + ' comes out in ' + (mins >= 60 ? Math.floor(mins / 60) + ' hr ' + (mins % 60) + ' min' : mins + ' minutes') + '.';
    } else live.textContent = 'Last bake is out. Whatever’s on the shelf is what we’ve got.';
  } else if (today && t < 6) {
    live.textContent = 'The levain is waking up. First loaves at 7:00.';
  } else {
    var nx = nextOpen(now.dow);
    live.textContent = 'Ovens are cooling. Next bake: ' + (nx && nx.inDays === 1 ? 'tomorrow' : DL[nx ? nx.d : 3]) + ', first loaves at 7:00.';
  }

  /* Process tabs (ARIA tabs pattern: arrows, Home, End). */
  var tabs = $$('.stepper [role="tab"]');
  function sel(tb, focus) {
    tabs.forEach(function (x) {
      var on = x === tb;
      x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tb.focus();
  }
  tabs.forEach(function (tb, i) {
    tb.addEventListener('click', function () { sel(tb); });
    tb.addEventListener('keydown', function (e) {
      var k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (k === undefined) return;
      e.preventDefault(); sel(tabs[(k + tabs.length) % tabs.length], true);
    });
  });

  /* Bread share: steppers + day chips compose a prefilled email. No personal data is collected on the page. */
  var picks = $$('.pick'), go = $('#shareGo'), msg = $('#shareMsg');
  var totalEl = $('#total'), itemsEl = $('#tallyItems');
  var EMAIL = 'bread@ninebark.bakery';
  function day() { var r = $('.days input:checked'); return r ? r.value : 'Saturday'; }
  function tally() {
    var sum = 0, count = 0, lines = [];
    picks.forEach(function (p) {
      var q = +$('.qty__n', p).textContent;
      $('[data-d="-1"]', p).disabled = q === 0;
      $('[data-d="1"]', p).disabled = q === 6;
      p.classList.toggle('is-on', q > 0);
      if (q) { sum += q * +p.dataset.price; count += q; lines.push(q + ' × ' + p.dataset.name + ' ($' + q * +p.dataset.price + ')'); }
    });
    totalEl.textContent = '$' + sum;
    itemsEl.textContent = count ? count + (count === 1 ? ' item' : ' items') + ' · ' + day() + 's' : 'No loaves yet';
    var body = 'Hi Ninebark,\n\nI’d like to start a weekly bread share:\n\n' + lines.join('\n') +
      '\n\nPickup: ' + day() + 's\nWeekly total: $' + sum + ' (pay at pickup)\nName for the bag: \n\nThank you!';
    go.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Weekly bread share — ' + day() + 's') + '&body=' + encodeURIComponent(body);
    go.setAttribute('aria-disabled', String(!count));
    if (count) msg.textContent = '';
    return count;
  }
  picks.forEach(function (p) {
    $$('.qty button', p).forEach(function (b) {
      b.addEventListener('click', function () {
        var n = $('.qty__n', p);
        n.textContent = Math.max(0, Math.min(6, +n.textContent + +b.dataset.d));
        tally();
        if (b.disabled) $('button:not([disabled])', p).focus();
      });
    });
  });
  $$('.days input').forEach(function (r) { r.addEventListener('change', tally); });
  go.addEventListener('click', function (e) {
    if (!tally()) { e.preventDefault(); msg.textContent = 'Add at least one loaf first.'; picks[0].querySelector('[data-d="1"]').focus(); }
  });
  tally();

  /* Mobile dock: appears once the hero has scrolled away; hidden over the footer. */
  var dock = $('#dock'), hero = $('.hero'), foot = $('.foot');
  if (dock && 'IntersectionObserver' in window) {
    var heroOut = false, footIn = false;
    var upd = function () { dock.classList.toggle('is-on', heroOut && !footIn); };
    new IntersectionObserver(function (es) { heroOut = !es[0].isIntersecting; upd(); }, { rootMargin: '-120px 0px 0px 0px' }).observe(hero);
    new IntersectionObserver(function (es) { footIn = es[0].isIntersecting; upd(); }).observe(foot);
  }

  /* Gentle reveal on scroll (skipped with reduced motion). */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.breads__intro, .hannah__txt, .share__intro, .slow__img, .visit__grid > div').forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();
