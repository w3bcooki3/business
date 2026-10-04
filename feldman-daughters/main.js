(function () {
  'use strict';
  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { h: (+o.hour) % 24, m: +o.minute, dow: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday] };
  }
  var now = ny(), t = now.h + now.m / 60;
  var sat = now.dow === 6, H = sat ? [7, 14] : [6, 15];
  var open = t >= H[0] && t < H[1];

  /* next tray: every 20 min from opening */
  var nt = document.getElementById('nextTray');
  if (open) {
    var mins = now.h * 60 + now.m, start = H[0] * 60;
    var next = start + Math.ceil((mins - start + 0.01) / 20) * 20;
    var wait = next - mins;
    nt.textContent = wait + ' min';
  } else nt.textContent = 'tomorrow, ' + ((now.dow + 1) % 7 === 6 ? '7:00' : '6:00') + ' am';

  /* hours */
  document.querySelector('#hrs li[data-d="' + (sat ? 'sat' : 'wk') + '"]').classList.add('today');
  document.getElementById('live').textContent = open ? '● Open now — bagels are hot' : (t < H[0] ? '○ Opens at ' + H[0] + ' am today' : '○ Closed — the kettle is resting');

  /* nav */
  var bg = document.querySelector('.burger'), nav = document.getElementById('nav');
  function setNav(o) { document.documentElement.style.setProperty('--navtop', document.querySelector('.top').getBoundingClientRect().bottom + 'px'); nav.classList.toggle('open', o); bg.setAttribute('aria-expanded', String(o)); bg.textContent = o ? 'Close' : 'Menu'; }
  bg.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setNav(false); bg.focus(); } });

  /* take a number */
  var tips = [
    'Number 48! Tip: ask for it “scooped” and Rachel will pretend not to hear you.',
    'Number 49! Tip: the bialy is better than the bagel. Don’t tell Grandpa Abe.',
    'Number 50! Tip: Sunday before 8 am, no line. After 9, bring a friend.',
    'Number 51! Tip: whitefish salad on pumpernickel. Thank us later.',
    'Number 52! Tip: day-olds are half price after 1 pm, perfect for bagel chips.',
    'Number 53! Tip: the halvah babka sells out by noon on Fridays.'
  ];
  var n = 47, disp = document.getElementById('dispenser'), num = document.getElementById('num'), tip = document.getElementById('ticketTip');
  disp.addEventListener('click', function () {
    n = n >= 53 ? 48 : n + 1;
    disp.classList.remove('pulled'); void disp.offsetWidth; disp.classList.add('pulled');
    num.textContent = n;
    tip.textContent = tips[(n - 48) % tips.length];
  });

  /* baker's dozen */
  var flavors = [['Plain', '#e8c48f'], ['Everything', '#a77b4e'], ['Sesame', '#dcb57a'], ['Poppy', '#6b5a4a'], ['Salt', '#e6cfa4'], ['Onion', '#c99a5c'], ['Garlic', '#d9b27c'], ['Pumpernickel', '#4a2f22'], ['Cinnamon raisin', '#b07a4a'], ['Bialy', '#e9d2a8']];
  var list = document.getElementById('dzList'), counts = {};
  flavors.forEach(function (f) {
    counts[f[0]] = 0;
    var li = document.createElement('li');
    li.innerHTML = '<span class="bn"><i style="--c:' + f[1] + '"></i>' + f[0] + '</span><span class="step"><button type="button" data-d="-1" aria-label="Remove one ' + f[0] + '">−</button><output aria-live="polite">0</output><button type="button" data-d="1" aria-label="Add one ' + f[0] + '">+</button></span>';
    li.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        var tot = total();
        var d = +b.dataset.d;
        if (d > 0 && tot >= 13) return;
        counts[f[0]] = Math.max(0, counts[f[0]] + d);
        li.querySelector('output').textContent = counts[f[0]];
        render();
      });
    });
    list.appendChild(li);
  });
  var form = document.getElementById('dozenForm');
  function total() { var s = 0; for (var k in counts) s += counts[k]; return s; }
  var schPrice = { 'Plain cream cheese ½ lb': 7, 'Scallion ½ lb': 8, 'Lox spread ½ lb': 11 };
  function render() {
    var tot = total();
    document.getElementById('count').textContent = tot;
    document.getElementById('meter').style.width = (tot / 13 * 100) + '%';
    list.querySelectorAll('button[data-d="1"]').forEach(function (b) { b.disabled = tot >= 13; });
    var money = tot === 13 ? 26 : tot * 2.25;
    form.querySelectorAll('[name="schmear"]:checked').forEach(function (c) { money += schPrice[c.value]; });
    document.getElementById('dzTotal').textContent = '$' + money.toFixed(2);
    return money;
  }
  form.addEventListener('change', render);
  render();
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = document.getElementById('dzMsg'), tot = total(), name = form.name.value.trim();
    if (tot === 0) { msg.textContent = 'Pick some bagels first.'; return; }
    if (!name) { msg.textContent = 'What name goes on the bag?'; form.name.focus(); return; }
    msg.textContent = tot < 13 ? 'Heads up: ' + (13 - tot) + ' more and the 13th is on us.' : '';
    var lines = []; for (var k in counts) if (counts[k]) lines.push(counts[k] + ' × ' + k);
    form.querySelectorAll('[name="schmear"]:checked').forEach(function (c) { lines.push('+ ' + c.value); });
    var body = 'Hi Feldman & Daughters,\n\nPickup order for ' + name + ' at ' + form.time.value + ':\n\n' + lines.join('\n') + '\n\nEstimated total: $' + render().toFixed(2) + '\n\nThanks!';
    location.href = 'mailto:orders@feldmananddaughters.com?subject=' + encodeURIComponent('Pickup order — ' + name) + '&body=' + encodeURIComponent(body);
  });

  /* babka rail */
  var rail = document.getElementById('rail');
  function step(d) { var card = rail.querySelector('.bk'); rail.scrollBy({ left: d * (card.getBoundingClientRect().width + 18), behavior: 'smooth' }); }
  document.getElementById('prev').addEventListener('click', function () { step(-1); });
  document.getElementById('next').addEventListener('click', function () { step(1); });

  /* reveal */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.board, .yrs li, .tray, .visit__card').forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();
