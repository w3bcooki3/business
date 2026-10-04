(function () {
  'use strict';
  var FRUITS = [
    ['Lechosa', 'papaya', '#ff8a4c'], ['Mango', 'mango', '#ffb020'], ['Chinola', 'passion fruit', '#f6d33c'],
    ['Zapote', 'mamey', '#d9643a'], ['Guanábana', 'soursop', '#f3eedc'], ['Fresa', 'strawberry', '#ef3b5a'],
    ['Guineo', 'banana', '#f5e08a'], ['Piña', 'pineapple', '#f2d250']
  ];
  var box = document.getElementById('fruits');
  box.innerHTML = FRUITS.map(function (f, i) {
    return '<label><input type="checkbox" name="fruit" value="' + i + '"' + (i === 1 ? ' checked' : '') + '><span><i style="--fc:' + f[2] + '"></i>' + f[0] + ' <small>' + f[1] + '</small></span></label>';
  }).join('');

  function hex(h) { return [1, 3, 5].map(function (k) { return parseInt(h.substr(k, 2), 16); }); }
  function mix(cols, w) {
    var t = [0, 0, 0], s = 0;
    cols.forEach(function (c, i) { var r = hex(c), ww = w ? w[i] : 1; t[0] += r[0] * ww; t[1] += r[1] * ww; t[2] += r[2] * ww; s += ww; });
    return 'rgb(' + t.map(function (v) { return Math.round(v / s); }).join(',') + ')';
  }

  var f = document.getElementById('bf'), cup = document.getElementById('bcup'), nm = document.getElementById('bname'), en = document.getElementById('ben'), pr = document.getElementById('bprice'), go = document.getElementById('bgo');
  function update() {
    var picked = [].filter.call(f.querySelectorAll('input[name=fruit]'), function (x) { return x.checked; }).map(function (x) { return FRUITS[+x.value]; });
    [].forEach.call(f.querySelectorAll('input[name=fruit]'), function (x) { x.disabled = !x.checked && picked.length >= 2; });
    var base = f.querySelector('input[name=base]:checked'), size = f.querySelector('input[name=size]:checked').value, sug = f.querySelector('input[name=sug]:checked').value;
    var price = (size === '24' ? 8 : 6) + (base.value === 'Leche de avena' ? 1 : 0);
    if (!picked.length) {
      nm.textContent = 'Escoge una fruta'; en.textContent = 'Pick at least one fruit'; pr.textContent = '—';
      cup.style.setProperty('--c', '#fff6e3'); go.removeAttribute('href'); go.setAttribute('aria-disabled', 'true'); return;
    }
    go.setAttribute('aria-disabled', 'false');
    var cols = picked.map(function (p) { return p[2]; }), w = picked.map(function () { return 1; });
    if (base.value !== 'Agua') { cols.push(base.value === 'Leche' ? '#fffaf0' : '#efe2c7'); w.push(picked.length * 0.55); }
    cup.style.setProperty('--c', mix(cols, w));
    var name = picked.map(function (p) { return p[0]; }).join(' y ') + (base.value === 'Agua' ? ' con agua' : ' con ' + base.value.toLowerCase());
    nm.textContent = name;
    en.textContent = picked.map(function (p) { return p[1]; }).join(' & ') + ' with ' + base.dataset.en + ' · ' + size + ' oz · ' + sug;
    pr.textContent = '$' + price;
    go.href = 'sms:+12125550193?&body=' + encodeURIComponent('Hola! Un batido de ' + name + ', ' + size + ' oz, ' + sug + '. Lo recojo en 15 minutos. Gracias!');
  }
  f.addEventListener('change', update); update();
  go.addEventListener('click', function (e) { if (go.getAttribute('aria-disabled') === 'true') e.preventDefault(); });

  /* hours (New York time) */
  var H = { 0: [420, 1320], 1: [420, 1320], 2: [420, 1320], 3: [420, 1320], 4: [420, 1320], 5: [420, 1380], 6: [420, 1380] };
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function clk(m) { var h = Math.floor(m / 60); return ((h % 12) || 12) + (h >= 12 ? ' pm' : ' am'); }
  function tick() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    var dow = DAYS.indexOf(o.weekday), t = ((+o.hour) % 24) * 60 + (+o.minute), h = H[dow], open = t >= h[0] && t < h[1];
    var txt = open ? 'Abierto ahora · open until ' + clk(h[1]) : (t < h[0] ? 'Abrimos a las 7 · opens 7 am' : 'Cerrado · opens 7 am tomorrow');
    [].forEach.call(document.querySelectorAll('[data-status]'), function (el) { el.textContent = txt; });
    document.querySelector('.open').classList.toggle('is-open', open);
    var row = document.querySelector('#hrs tr[data-d="' + dow + '"]');
    [].forEach.call(document.querySelectorAll('#hrs tr'), function (r) { r.classList.toggle('today', r === row); });
  }
  tick(); setInterval(tick, 60000);
})();
