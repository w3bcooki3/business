/* Orchard Street Roasting Co. — live status, roast/cupping dates, coffee details,
   brew calculator, subscription builder (composes an email), mobile dock. */
(function () {
  'use strict';

  /* ── New York time ─────────────────────────────────────────────── */
  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    var h = (+o.hour) % 24, m = +o.minute;
    return { y: +o.year, mo: +o.month, d: +o.day, h: h, min: h * 60 + m, dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday) };
  }
  var now = ny();
  var DN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function dateIn(days) { var d = new Date(Date.UTC(now.y, now.mo - 1, now.d + days)); return MN[d.getUTCMonth()] + ' ' + d.getUTCDate(); }
  function clock(m) { var h = Math.floor(m / 60), mm = m % 60; return ((h % 12) || 12) + (mm ? ':' + ('0' + mm).slice(-2) : '') + (h >= 12 ? ' pm' : ' am'); }

  /* ── Open / closed (hours live in window.SITEMENU.hours, minutes after midnight) ── */
  var HOURS = (window.SITEMENU && window.SITEMENU.hours) || null;
  if (HOURS) {
    var today = HOURS[now.dow], open = !!(today && now.min >= today[0] && now.min < today[1]), long, short;
    if (open) { long = 'Bar open now · until ' + clock(today[1]); short = 'Open · until ' + clock(today[1]); }
    else if (today && now.min < today[0]) { long = 'Closed · opens today at ' + clock(today[0]); short = 'Opens ' + clock(today[0]); }
    else {
      var k = 1; while (!HOURS[(now.dow + k) % 7] && k < 7) k++;
      var nd = (now.dow + k) % 7, when = k === 1 ? 'tomorrow' : DN[nd];
      long = 'Closed · opens ' + when + ' at ' + clock(HOURS[nd][0]);
      short = 'Opens ' + (k === 1 ? 'tmrw' : DN[nd].slice(0, 3)) + ' ' + clock(HOURS[nd][0]);
    }
    document.querySelectorAll('[data-status]').forEach(function (el) {
      el.textContent = el.hasAttribute('data-short') ? short : long;
      el.classList.toggle('is-open', open);
    });
    document.querySelectorAll('.hours tr[data-days]').forEach(function (tr) {
      if (tr.getAttribute('data-days').split(',').indexOf(String(now.dow)) > -1) tr.classList.add('is-today');
    });
  }

  /* ── Next roast (Tue/Fri, drum done by 2 pm) & next cupping (Sat 11) ── */
  var add = 0;
  while ([2, 5].indexOf((now.dow + add) % 7) === -1 || (add === 0 && now.h >= 14)) add++;
  document.getElementById('roastDay').textContent = add === 0 ? 'Roasting today — the drum’s hot' : 'Next roast: ' + DN[(now.dow + add) % 7] + ', ' + dateIn(add);
  var c = (6 - now.dow + 7) % 7; if (c === 0 && now.h >= 12) c = 7;
  document.getElementById('nextCup').textContent = 'Next session: ' + (c === 0 ? 'today' : 'Saturday, ' + dateIn(c)) + ', 11:00 am';

  /* ── Coffee details ────────────────────────────────────────────── */
  document.querySelectorAll('.bag__flip').forEach(function (b) {
    b.addEventListener('click', function () {
      var o = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!o));
      document.getElementById(b.getAttribute('aria-controls')).hidden = o;
    });
  });

  /* ── Pressed-button groups ─────────────────────────────────────── */
  function group(sel, onPick) {
    var btns = document.querySelectorAll(sel);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        onPick(b);
      });
    });
    return function () { var p = null; btns.forEach(function (x) { if (x.getAttribute('aria-pressed') === 'true') p = x; }); return p; };
  }

  /* ── Brew calculator ───────────────────────────────────────────── */
  var M = {
    v60: { name: 'V60', ratio: [17, 16, 15], grind: 'Medium-fine', temp: '94 °C', time: '3:00', max: 3,
      steps: function (c, w) { return ['Rinse the filter with hot water; discard.', 'Add ' + c + ' g coffee, shake flat.', 'Bloom with ' + Math.round(c * 2) + ' g water, wait 40 seconds.', 'Pour in slow circles to ' + Math.round(w * 0.6) + ' g by 1:15.', 'Finish to ' + w + ' g by 1:45. Drawdown done by about 3:00.']; } },
    chemex: { name: 'Chemex', ratio: [16, 15.5, 15], grind: 'Medium-coarse', temp: '95 °C', time: '4:30', max: 4,
      steps: function (c, w) { return ['Rinse the thick filter well, triple-fold toward the spout.', 'Add ' + c + ' g coffee.', 'Bloom with ' + Math.round(c * 2) + ' g water for 45 seconds.', 'Pour in three stages to ' + w + ' g by 2:30.', 'Let it drain; total about 4:30.']; } },
    aero: { name: 'AeroPress', ratio: [14, 13, 12], grind: 'Fine', temp: '88 °C', time: '2:00', max: 1, fixed: 220,
      steps: function (c, w) { return ['Inverted method. Add ' + c + ' g coffee.', 'Pour ' + w + ' g water, stir 10 times.', 'Cap with a rinsed paper filter, steep until 1:30.', 'Flip onto your cup, press gently for 30 seconds.', 'Top up with hot water to taste.']; } },
    press: { name: 'French press', ratio: [16, 15, 14], grind: 'Coarse', temp: '96 °C', time: '8:00', max: 4,
      steps: function (c, w) { return ['Add ' + c + ' g coffee to the press.', 'Pour ' + w + ' g water, all at once.', 'Wait 4 minutes. Break the crust and skim the foam.', 'Wait another 4 minutes — patience is the recipe.', 'Plunge just to the surface and pour.']; } }
  };
  var STR = ['lighter', 'balanced', 'stronger'];
  var cups = 1;
  var getMethod = group('.methods button', calc);
  var getStrength = group('.seg button', calc);
  var stepBtns = document.querySelectorAll('.stepper button');
  stepBtns.forEach(function (b) { b.addEventListener('click', function () { cups += +b.getAttribute('data-step'); calc(); }); });
  function set(id, v) { document.getElementById(id).textContent = v; }
  function calc() {
    var key = getMethod().getAttribute('data-m'), k = M[key], s = +getStrength().getAttribute('data-s'), r = k.ratio[s];
    cups = Math.max(1, Math.min(cups, k.max));
    var water = k.fixed || cups * 250, coffee = Math.round(water / r * 10) / 10;
    set('cupsOut', cups);
    stepBtns[0].disabled = cups <= 1;
    stepBtns[1].disabled = cups >= k.max;
    set('cupsNote', k.max === 1 ? 'AeroPress makes one cup at a time.' : 'Up to ' + k.max + ' cups in a ' + k.name + '.');
    set('rTitle', k.name + ' · ' + cups + (cups > 1 ? ' cups' : ' cup') + ' · ' + STR[s]);
    set('rCoffee', coffee + ' g'); set('rWater', water + ' g'); set('rRatio', '1 : ' + r);
    set('rGrind', k.grind); set('rTemp', k.temp); set('rTime', k.time);
    var ol = document.getElementById('rSteps'); ol.textContent = '';
    k.steps(coffee, water).forEach(function (t) { var li = document.createElement('li'); li.textContent = t; ol.appendChild(li); });
  }
  calc();

  /* ── Subscription builder: no personal data collected, it only writes an email ── */
  var getCoffee = group('[data-coffee]', sub), getFreq = group('[data-freq]', sub);
  function sub() {
    var cb = getCoffee(), coffee = cb.getAttribute('data-coffee'), price = cb.getAttribute('data-price'), freq = getFreq().getAttribute('data-freq');
    var short = coffee.replace(/ \(.*\)/, '');
    set('subSum', short + ', every ' + freq);
    set('subPrice', '$' + price + ' a bag · shipping free');
    var body = 'Hi Orchard Street,\n\nI’d like to start a subscription.\n\nCoffee: ' + coffee + ' ($' + price + ' a bag)\nEvery: ' + freq + '\n\nPlease send the payment link — I’ll reply with my shipping address.\n\nThanks!';
    document.getElementById('subGo').href = 'mailto:roastery@orchardstreet.coffee?subject=' + encodeURIComponent('Subscription — ' + short + ', every ' + freq) + '&body=' + encodeURIComponent(body);
  }
  sub();

  /* ── Header tabs: mark the section in view ─────────────────────── */
  var tabs = document.querySelectorAll('.tabs a');
  if ('IntersectionObserver' in window && tabs.length) {
    var tio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        tabs.forEach(function (a) { if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    tabs.forEach(function (a) { var t = document.querySelector(a.getAttribute('href')); if (t) tio.observe(t); });
  }

  /* ── Mobile dock: shows once the hero's buttons scroll away, hides over Visit + footer ── */
  var dock = document.getElementById('dock');
  if (dock && 'IntersectionObserver' in window) {
    var seen = { hero: true, visit: false, foot: false };
    var watch = function (el, key) {
      new IntersectionObserver(function (es) { seen[key] = es[0].isIntersecting; dock.classList.toggle('is-on', !seen.hero && !seen.visit && !seen.foot); }).observe(el);
    };
    watch(document.getElementById('heroCta'), 'hero');
    watch(document.getElementById('visit'), 'visit');
    watch(document.querySelector('.foot'), 'foot');
  }

  /* ── Curve draw + gentle reveals ───────────────────────────────── */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var fig = document.querySelector('.curve__fig');
    var cio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { fig.classList.add('draw'); cio.disconnect(); } }, { threshold: 0.4 });
    cio.observe(fig);
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.bag, .calc, .cupping__text, .builder, .wholesale__text').forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();
