(function () {
  'use strict';
  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { y: +o.year, mo: +o.month, d: +o.day, h: (+o.hour) % 24, m: +o.minute, dow: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday] };
  }
  var now = ny();
  var DN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function dateIn(days) { var d = new Date(Date.UTC(now.y, now.mo - 1, now.d + days)); return MN[d.getUTCMonth()] + ' ' + d.getUTCDate(); }

  /* next roast (Tue/Fri) & cupping (Sat 11) */
  var add = 0;
  while ([2, 5].indexOf((now.dow + add) % 7) === -1 || (add === 0 && now.h >= 14)) add++;
  document.getElementById('roastDay').textContent = add === 0 ? 'Roasting today — drum’s hot' : 'Next roast: ' + DN[(now.dow + add) % 7] + ', ' + dateIn(add);
  var c = (6 - now.dow + 7) % 7; if (c === 0 && now.h >= 12) c = 7;
  document.getElementById('nextCup').textContent = 'Next session: ' + (c === 0 ? 'today' : DN[6] + ' ' + dateIn(c)) + ', 11:00 am';

  /* status */
  var t = now.h + now.m / 60, wk = now.dow >= 1 && now.dow <= 5, op = wk ? 7.5 : 8.5;
  document.getElementById('status').textContent = (t >= op && t < 16) ? '● Bar open now, until 4' : '○ Bar closed · opens ' + (t < op ? 'today' : 'tomorrow');

  /* nav */
  var nb = document.querySelector('.navbtn'), nav = document.getElementById('nav');
  function setNav(o) { document.documentElement.style.setProperty('--navtop', document.querySelector('.head').getBoundingClientRect().bottom + 'px'); nav.classList.toggle('open', o); nb.setAttribute('aria-expanded', String(o)); nb.textContent = o ? 'Close' : 'Index'; }
  nb.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setNav(false); nb.focus(); } });

  /* bags */
  document.querySelectorAll('.bag__face').forEach(function (b) {
    b.addEventListener('click', function () {
      var o = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!o));
      document.getElementById(b.getAttribute('aria-controls')).hidden = o;
      b.querySelector('.bag__flip').textContent = o ? 'Producer & details +' : 'Close details −';
    });
  });

  /* brew calculator */
  var M = {
    v60: { ratio: [17, 16, 15], grind: 'Medium-fine, like table salt', temp: '94 °C', time: '3:00', bloom: true, max: 3,
      steps: function (c, w) { return ['Rinse the filter with hot water; discard.', 'Add ' + c + ' g coffee, shake flat.', 'Bloom with ' + Math.round(c * 2) + ' g water, wait 40 seconds.', 'Pour in slow circles to ' + Math.round(w * 0.6) + ' g by 1:15.', 'Finish to ' + w + ' g by 1:45. Drawdown done by about 3:00.']; } },
    chemex: { ratio: [16, 15.5, 15], grind: 'Medium-coarse, like kosher salt', temp: '95 °C', time: '4:30', max: 4,
      steps: function (c, w) { return ['Rinse the thick filter well, triple-fold toward the spout.', 'Add ' + c + ' g coffee.', 'Bloom with ' + Math.round(c * 2) + ' g water for 45 seconds.', 'Pour in three stages to ' + w + ' g by 2:30.', 'Let it drain; total about 4:30.']; } },
    aero: { ratio: [14, 13, 12], grind: 'Fine, between espresso and filter', temp: '88 °C', time: '2:00', max: 1,
      steps: function (c, w) { return ['Inverted method. Add ' + c + ' g coffee.', 'Pour ' + w + ' g water, stir 10 times.', 'Cap with a rinsed paper filter, steep until 1:30.', 'Flip onto your cup, press gently for 30 seconds.', 'Top up with hot water to taste.']; } },
    press: { ratio: [16, 15, 14], grind: 'Coarse, like breadcrumbs', temp: '96 °C', time: '8:00', max: 4,
      steps: function (c, w) { return ['Add ' + c + ' g coffee to the press.', 'Pour ' + w + ' g water, all at once.', 'Wait 4 minutes. Break the crust and skim the foam.', 'Wait another 4 minutes — patience is the recipe.', 'Plunge just to the surface and pour.']; } }
  };
  var f = document.getElementById('calc');
  var strNames = ['Lighter', 'Balanced', 'Stronger'];
  function calc() {
    var m = f.querySelector('[name="m"]:checked').value, k = M[m];
    var cupsInput = f.cups;
    cupsInput.max = k.max;
    var cups = Math.min(+cupsInput.value, k.max);
    cupsInput.value = cups;
    var s = +f.str.value, r = k.ratio[s];
    var water = cups * 250, coffee = Math.round(water / r * 10) / 10;
    if (m === 'aero') water = 220, coffee = Math.round(220 / r * 10) / 10;
    document.getElementById('cupsOut').textContent = m === 'aero' ? '1 (single-serve)' : cups;
    document.getElementById('strOut').textContent = strNames[s];
    document.getElementById('rCoffee').textContent = coffee + ' g';
    document.getElementById('rWater').textContent = water + ' g';
    document.getElementById('rRatio').textContent = '1 : ' + r;
    document.getElementById('rGrind').textContent = k.grind.split(',')[0];
    document.getElementById('rTemp').textContent = k.temp;
    document.getElementById('rTime').textContent = k.time;
    var ol = document.getElementById('rSteps');
    ol.innerHTML = '';
    k.steps(coffee, water).forEach(function (txt) { var li = document.createElement('li'); li.textContent = txt; ol.appendChild(li); });
  }
  f.addEventListener('input', calc);
  f.addEventListener('change', calc);
  calc();

  /* subscription */
  var sf = document.getElementById('subForm'), sm = document.getElementById('subMsg');
  sf.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = sf.name.value.trim();
    if (!name) { sm.textContent = 'Add your name, please.'; sf.name.focus(); return; }
    var coffee = sf.querySelector('[name="coffee"]:checked').value, freq = sf.querySelector('[name="freq"]:checked').value;
    var body = 'Hi Orchard Street,\n\nI’d like to start a subscription.\n\nCoffee: ' + coffee + '\nEvery: ' + freq + '\nName: ' + name + '\nShipping address: \n\nThanks!';
    location.href = 'mailto:roastery@orchardstreet.coffee?subject=' + encodeURIComponent('Subscription — ' + coffee) + '&body=' + encodeURIComponent(body);
  });

  /* curve draw + reveal */
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduce) {
    var fig = document.querySelector('.curve__fig');
    var cio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { fig.classList.add('draw'); cio.disconnect(); } }); }, { threshold: 0.4 });
    cio.observe(fig);
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.bag, .sh, .calc, .cupping__text, .wholesale > div').forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();
