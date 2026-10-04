(function () {
  'use strict';
  var JUICES = [
    { n: 'Bedford Green', t: 'green', c: '#4c9a2a', i: ['Kale', 'Cucumber', 'Celery', 'Green apple', 'Lemon'], d: 'Our bestseller. Bright and clean, with just enough apple.', p: 11 },
    { n: 'Beet Street', t: 'root', c: '#a3123f', i: ['Beet', 'Carrot', 'Apple', 'Ginger', 'Lemon'], d: 'Earthy and sweet. The ginger arrives late.', p: 10 },
    { n: 'Carrot Top', t: 'root', c: '#f07a12', i: ['Carrot', 'Orange', 'Turmeric', 'Black pepper'], d: 'Like orange juice that went to college.', p: 10 },
    { n: 'Pine & Mint', t: 'citrus', c: '#d9d23a', i: ['Pineapple', 'Mint', 'Cucumber', 'Lime'], d: 'Summer in a bottle, even in February.', p: 10 },
    { n: 'Grapefruit 7', t: 'citrus', c: '#f2726f', i: ['Grapefruit', 'Orange', 'Lemon', 'Rosemary'], d: 'Tart and a little bitter, in a good way.', p: 9 },
    { n: 'Deep Green', t: 'green', c: '#2f6b2a', i: ['Spinach', 'Romaine', 'Parsley', 'Celery', 'Cucumber', 'Lemon'], d: 'No fruit at all. For people who say “greener.”', p: 12 },
    { n: 'Ginger Shot', t: 'shot', c: '#e5b31d', i: ['Ginger', 'Lemon', 'Cayenne'], d: '2 oz. Strong. Have it with water nearby.', p: 4, s: 1 },
    { n: 'Turmeric Shot', t: 'shot', c: '#f29e0c', i: ['Turmeric', 'Orange', 'Black pepper'], d: '2 oz. Warm, peppery, gone in one sip.', p: 4, s: 1 }
  ];
  function bottle(j, fill) {
    return '<span class="b' + (j.s ? ' b--s' : '') + '" style="--c:' + j.c + ';--fill:' + (fill || 88) + '%" aria-hidden="true"><span class="b__cap"></span><span class="b__neck"></span><span class="b__body"><span class="b__liq"></span><span class="b__lab">' + j.n + '</span></span></span>';
  }

  /* hero shelf */
  var shelf = document.getElementById('heroShelf');
  shelf.innerHTML = [0, 1, 2, 3, 5].map(function (k, i) { return bottle(JUICES[k], [92, 84, 88, 80, 90][i]); }).join('');

  /* wall */
  var grid = document.getElementById('wallGrid'), det = document.getElementById('detail');
  grid.innerHTML = JUICES.map(function (j, k) {
    return '<li data-t="' + j.t + '"><button type="button" aria-pressed="' + (k === 0) + '" data-k="' + k + '">' + bottle(j) + '<span class="wall__n">' + j.n + '</span></button></li>';
  }).join('');
  var TAGS = { green: 'Green', root: 'Root', citrus: 'Citrus', shot: 'Shot' };
  function show(k) {
    var j = JUICES[k];
    det.innerHTML = '<div class="detail__top">' + bottle(j) + '<div><h3>' + j.n + '</h3><span class="detail__tag">' + TAGS[j.t] + (j.s ? ' · 2 oz' : ' · 12 oz') + '</span></div></div>' +
      '<ul class="detail__ing" aria-label="Ingredients">' + j.i.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
      '<p class="detail__note">' + j.d + '</p><p class="detail__price"><span>Price</span><b>$' + j.p + '</b></p>';
    [].forEach.call(grid.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', b.dataset.k == k); });
  }
  grid.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; show(+b.dataset.k); if (window.innerWidth < 980) det.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
  show(0);
  document.querySelector('.filters').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var f = b.dataset.f, first = null;
    [].forEach.call(this.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', x === b); });
    [].forEach.call(grid.children, function (li) { var ok = f === 'all' || li.dataset.t === f; li.hidden = !ok; if (ok && first === null) first = +li.querySelector('button').dataset.k; });
    if (first !== null) show(first);
  });

  /* bottle-return card */
  var dots = document.getElementById('dots'), msg = document.getElementById('dotsMsg');
  dots.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true');
    var n = dots.querySelectorAll('[aria-pressed="true"]').length;
    msg.textContent = n === 5 ? 'Five! Your next juice is on us.' : 'Tap to try it: ' + n + ' of 5';
  });

  /* live: open status + freshness clock (New York time) */
  var H = { 0: [480, 1080], 1: [420, 1140], 2: [420, 1140], 3: [420, 1140], 4: [420, 1140], 5: [420, 1140], 6: [480, 1080] };
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function clk(m) { var h = Math.floor(m / 60), mm = m % 60; return ((h % 12) || 12) + (mm ? ':' + ('0' + mm).slice(-2) : '') + (h >= 12 ? ' pm' : ' am'); }
  function tick() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    var dow = DAYS.indexOf(o.weekday), t = ((+o.hour) % 24) * 60 + (+o.minute), h = H[dow], open = t >= h[0] && t < h[1], txt;
    if (open) txt = 'Open · until ' + clk(h[1]);
    else if (t < h[0]) txt = 'Opens ' + clk(h[0]);
    else txt = 'Closed · opens ' + clk(H[(dow + 1) % 7][0]) + ' tomorrow';
    [].forEach.call(document.querySelectorAll('[data-status]'), function (el) { el.textContent = txt; });
    document.querySelector('.hdr__live').classList.toggle('is-open', open);
    var ago = document.getElementById('ago'), sub = document.getElementById('agoSub'), press = 330;
    if (t >= press && t < h[1]) { var m = t - press; ago.textContent = (Math.floor(m / 60) ? Math.floor(m / 60) + ' hr ' : '') + (m % 60) + ' min ago'; sub.textContent = 'pressed at 5:30 am, sold today'; }
    else if (t < press) { var w = press - t; ago.textContent = 'Pressing in ' + (Math.floor(w / 60) ? Math.floor(w / 60) + ' hr ' : '') + (w % 60) + ' min'; sub.textContent = 'today’s batch starts at 5:30 am'; }
    else { ago.textContent = 'Sold through'; sub.textContent = 'next batch pressed at 5:30 am'; }
    var row = document.querySelector('#hrs tr[data-d="' + dow + '"]');
    [].forEach.call(document.querySelectorAll('#hrs tr'), function (r) { r.classList.toggle('today', r === row); });
  }
  tick(); setInterval(tick, 30000);
})();
