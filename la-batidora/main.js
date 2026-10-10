/* La Batidora — batido builder (composes an sms: link), live open status, mobile dock. */
(function () {
  'use strict';
  var PHONE = '+12125550193';

  /* ── Builder ─────────────────────────────────────────────────── */
  var FRUITS = [
    ['Lechosa', 'papaya', '#ff8a4c'], ['Mango', 'mango', '#ffb020'], ['Chinola', 'passion fruit', '#f6d33c'],
    ['Zapote', 'mamey', '#d9643a'], ['Guanábana', 'soursop', '#f3eedc'], ['Fresa', 'strawberry', '#ef3b5a'],
    ['Guineo', 'banana', '#f5e08a'], ['Piña', 'pineapple', '#f2d250']
  ];
  var box = document.getElementById('fruits');
  box.innerHTML = FRUITS.map(function (f, i) {
    return '<button type="button" class="fruit-b" aria-pressed="false" data-i="' + i + '">' +
      '<i style="--fc:' + f[2] + '" aria-hidden="true"></i><span><span lang="es">' + f[0] + '</span><small>' + f[1] + '</small></span></button>';
  }).join('');

  var picked = [1]; // indices, in the order they were chosen (Mango to start)
  var hint = document.getElementById('fhint');

  box.addEventListener('click', function (e) {
    var b = e.target.closest('.fruit-b'); if (!b) return;
    var i = +b.dataset.i, at = picked.indexOf(i);
    hint.textContent = '';
    if (at > -1) picked.splice(at, 1);
    else {
      if (picked.length === 2) {
        var out = picked.shift();
        hint.textContent = 'Two fruits max: swapped ' + FRUITS[out][0] + ' for ' + FRUITS[i][0] + '.';
      }
      picked.push(i);
    }
    update();
  });

  [].forEach.call(document.querySelectorAll('.seg'), function (g) {
    g.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      [].forEach.call(g.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      update();
    });
  });
  function sel(group) { return document.querySelector('.seg[data-group="' + group + '"] [aria-pressed="true"]'); }

  function hex(h) { return [1, 3, 5].map(function (k) { return parseInt(h.substr(k, 2), 16); }); }
  function mix(cols, w) {
    var t = [0, 0, 0], s = 0;
    cols.forEach(function (c, i) { var r = hex(c); t[0] += r[0] * w[i]; t[1] += r[1] * w[i]; t[2] += r[2] * w[i]; s += w[i]; });
    return 'rgb(' + t.map(function (v) { return Math.round(v / s); }).join(',') + ')';
  }

  var cup = document.getElementById('bcup'), nm = document.getElementById('bname'), en = document.getElementById('ben'),
    pr = document.getElementById('bprice'), go = document.getElementById('bgo');

  function update() {
    [].forEach.call(box.children, function (b) {
      var k = picked.indexOf(+b.dataset.i);
      b.setAttribute('aria-pressed', k > -1 ? 'true' : 'false');
      b.querySelector('i').textContent = k > -1 ? String(k + 1) : '';
    });
    var base = sel('base'), size = sel('size'), sug = sel('sug');
    var fr = picked.map(function (i) { return FRUITS[i]; });
    if (!fr.length) {
      nm.textContent = 'Escoge una fruta'; en.textContent = 'Pick at least one fruit'; pr.textContent = '—';
      cup.style.setProperty('--c', '#fff6e3');
      go.removeAttribute('href'); go.setAttribute('aria-disabled', 'true');
      return;
    }
    var price = +size.dataset.p + +base.dataset.add;
    var cols = fr.map(function (p) { return p[2]; }), w = fr.map(function () { return 1; });
    if (base.dataset.v !== 'Agua') { cols.push(base.dataset.v === 'Leche' ? '#fffaf0' : '#efe2c7'); w.push(fr.length * 0.55); }
    cup.style.setProperty('--c', mix(cols, w));
    var name = fr.map(function (p) { return p[0]; }).join(' y ') + ' con ' + base.dataset.v.toLowerCase();
    nm.textContent = name;
    en.textContent = fr.map(function (p) { return p[1]; }).join(' & ') + ' with ' + base.dataset.en + ' · ' + size.dataset.v + ' oz · ' + sug.dataset.en;
    pr.textContent = '$' + price;
    go.setAttribute('aria-disabled', 'false');
    go.href = 'sms:' + PHONE + '?&body=' + encodeURIComponent('Hola! Un batido de ' + name + ', ' + size.dataset.v + ' oz, ' + sug.dataset.v + '. Lo recojo en 15 minutos. Gracias!');
  }
  go.addEventListener('click', function (e) { if (go.getAttribute('aria-disabled') === 'true') e.preventDefault(); });
  update();

  /* ── Hours (New York time) ───────────────────────────────────── */
  var H = { 0: [420, 1320], 1: [420, 1320], 2: [420, 1320], 3: [420, 1320], 4: [420, 1320], 5: [420, 1380], 6: [420, 1380] };
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function clk(m) { var h = Math.floor(m / 60); return ((h % 12) || 12) + (h >= 12 ? ' pm' : ' am'); }
  function tick() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    var dow = DAYS.indexOf(o.weekday), t = ((+o.hour) % 24) * 60 + (+o.minute), h = H[dow], open = t >= h[0] && t < h[1];
    var txt, short;
    if (open) { txt = 'Abierto ahora · open until ' + clk(h[1]); short = ['Abierto', 'until ' + clk(h[1])]; }
    else if (t < h[0]) { txt = 'Cerrado · opens today at 7 am'; short = ['Cerrado', 'opens 7 am']; }
    else { txt = 'Cerrado · opens tomorrow at 7 am'; short = ['Cerrado', 'opens 7 am tomorrow']; }
    [].forEach.call(document.querySelectorAll('[data-status]'), function (el) { el.textContent = txt; });
    [].forEach.call(document.querySelectorAll('[data-status-short]'), function (el) { el.firstChild.textContent = short[0]; el.lastChild.textContent = short[1]; });
    [].forEach.call(document.querySelectorAll('[data-open]'), function (el) { el.classList.toggle('is-open', open); });
    [].forEach.call(document.querySelectorAll('#hrs tr'), function (r) { r.classList.toggle('today', +r.dataset.d === dow); });
  }
  tick(); setInterval(tick, 60000);

  /* ── Mobile dock: hidden over the hero, the builder (it has its own order bar), the visit section and footer ── */
  var dock = document.getElementById('dock');
  if (dock && 'IntersectionObserver' in window) {
    var hide = {};
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { hide[e.target.id || e.target.className] = e.isIntersecting; });
      dock.classList.toggle('is-on', !Object.keys(hide).some(function (k) { return hide[k]; }));
    }, { rootMargin: '-30% 0px -30% 0px' });
    ['.hero', '#builder', '#visit', '.ft'].forEach(function (s) { var el = document.querySelector(s); if (el) io.observe(el); });
  }
})();
