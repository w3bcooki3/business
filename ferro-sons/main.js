(function () {
  'use strict';
  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { h: (+o.hour) % 24, m: +o.minute, dow: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday] };
  }
  var now = ny(), t = now.h + now.m / 60;
  var HRS = { 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19], 6: [8, 17] };
  var DN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /* typical waits (minutes) — shop's own estimates */
  var W = {
    2: { 9: 5, 10: 10, 11: 10, 12: 20, 13: 15, 14: 10, 15: 10, 16: 20, 17: 30, 18: 20 },
    3: { 9: 5, 10: 10, 11: 15, 12: 20, 13: 15, 14: 10, 15: 15, 16: 25, 17: 35, 18: 20 },
    4: { 9: 10, 10: 10, 11: 15, 12: 25, 13: 20, 14: 15, 15: 15, 16: 25, 17: 40, 18: 25 },
    5: { 9: 15, 10: 20, 11: 25, 12: 30, 13: 25, 14: 25, 15: 30, 16: 40, 17: 45, 18: 30 },
    6: { 8: 20, 9: 40, 10: 55, 11: 60, 12: 45, 13: 35, 14: 30, 15: 25, 16: 15 }
  };

  /* hours + open */
  var tr = document.querySelector('#hrs tr[data-d="' + now.dow + '"]');
  if (tr) tr.classList.add('today');
  var op = document.getElementById('open'), h = HRS[now.dow];
  function nextOpen() { var d = now.dow, i = 0; do { d = (d + 1) % 7; i++; } while (!HRS[d] && i < 8); return (i === 1 ? 'tomorrow' : DL[d]) + ' at ' + HRS[d][0] + ' am'; }
  if (h && t >= h[0] && t < h[1]) { op.classList.add('is-open'); op.textContent = 'Open now — chairs are turning'; }
  else if (h && t < h[0]) op.textContent = 'Opens today at ' + h[0] + ' am';
  else op.textContent = 'Closed — back ' + nextOpen();

  /* nav */
  var nb = document.querySelector('.navbtn'), nav = document.getElementById('nav');
  nb.addEventListener('click', function () { var o = !nav.classList.contains('open'); nav.classList.toggle('open', o); nb.setAttribute('aria-expanded', String(o)); nb.textContent = o ? 'Close ▴' : 'Menu ▾'; });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) { nav.classList.remove('open'); nb.setAttribute('aria-expanded', 'false'); nb.textContent = 'Menu ▾'; } });

  /* wait chart */
  var days = document.getElementById('days'), chart = document.getElementById('chart'), wn = document.getElementById('waitNow');
  var sel = W[now.dow] ? now.dow : 2;
  [2, 3, 4, 5, 6].forEach(function (d) {
    var b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.d = d;
    b.textContent = DN[d] + (d === now.dow ? ' · today' : '');
    b.addEventListener('click', function () { draw(d); });
    days.appendChild(b);
  });
  function fmt(hh) { return ((hh % 12) || 12) + (hh >= 12 ? 'p' : 'a'); }
  function draw(d) {
    sel = d;
    days.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-selected', String(+b.dataset.d === d)); });
    chart.innerHTML = '';
    var data = W[d], max = 60, desc = [];
    Object.keys(data).forEach(function (k) {
      var hh = +k, v = data[k], pct = Math.round(v / max * 100);
      var bar = document.createElement('div');
      bar.className = 'bar' + (d === now.dow && now.h === hh ? ' is-now' : '');
      bar.style.setProperty('--h', pct + '%');
      bar.innerHTML = '<span class="bar__min">' + v + 'm</span><span class="bar__fill" style="height:0"></span><span class="bar__lbl">' + fmt(hh) + '</span>';
      chart.appendChild(bar);
      requestAnimationFrame(function () { bar.querySelector('.bar__fill').style.height = pct + '%'; });
      desc.push(fmt(hh) + ' about ' + v + ' minutes');
    });
    chart.setAttribute('aria-label', 'Typical wait on ' + DL[d] + ': ' + desc.join(', '));
    if (d === now.dow && data[now.h] !== undefined) wn.textContent = 'Right about now: usually a ' + data[now.h] + '-minute wait.';
    else {
      var best = Object.keys(data).reduce(function (a, b) { return data[a] <= data[b] ? a : b; });
      wn.textContent = 'Quietest on ' + DL[d] + ': around ' + fmt(+best) + 'm, usually ' + data[best] + ' minutes or less.';
    }
  }
  draw(sel);

  /* reveal */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.chair, .tl li, .cert, .first__text, .shave li').forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();
