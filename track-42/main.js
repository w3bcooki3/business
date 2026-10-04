(function () {
  'use strict';
  var MENU = {
    express: { c: '#ffb400', items: [
      ['Peak Hour', 'Peanut butter, banana, oats, whey, milk', 11],
      ['Cold Brew Shake', 'Cold brew, banana, whey, oat milk, cinnamon', 11],
      ['Berry Express', 'Mixed berries, Greek yogurt, whey, honey', 11]] },
    local: { c: '#ff5e5b', items: [
      ['Lexington', 'Strawberry, banana, orange juice', 9],
      ['Tropic Transfer', 'Mango, pineapple, coconut water, lime', 9],
      ['Red Cap', 'Raspberry, beet, apple, lime', 10]] },
    peak: { c: '#16c47f', items: [
      ['Hudson Green', 'Spinach, kale, pineapple, banana, ginger', 10],
      ['Avocado Local', 'Avocado, spinach, apple, lime, almond milk', 10],
      ['Concourse Matcha', 'Matcha, banana, spinach, oat milk', 11]] }
  };
  var ALL = [];
  Object.keys(MENU).forEach(function (k) { MENU[k].items.forEach(function (it) { ALL.push(it[0]); }); });

  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { t: ((+o.hour) % 24) * 60 + (+o.minute), dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday) };
  }
  function hm(m) { m = ((m % 1440) + 1440) % 1440; return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + m % 60).slice(-2); }

  /* menu + ticket */
  var list = document.getElementById('list'), cart = [], line = 'express';
  function renderList() {
    var L = MENU[line];
    list.innerHTML = L.items.map(function (it, i) {
      return '<li style="--lc:' + L.c + '"><b>' + it[0] + '</b><span class="pr">$' + it[2] + '</span><p>' + it[1] + '</p><button type="button" data-i="' + i + '" aria-label="Add ' + it[0] + ' to text order">Add</button></li>';
    }).join('');
  }
  document.querySelector('.lines').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    line = b.dataset.l;
    [].forEach.call(this.querySelectorAll('button'), function (x) { x.setAttribute('aria-selected', x === b); });
    renderList();
  });
  list.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var it = MENU[line].items[+b.dataset.i];
    var found = cart.filter(function (c) { return c.n === it[0]; })[0];
    if (found) found.q++; else cart.push({ n: it[0], p: it[2], q: 1 });
    b.textContent = 'Added'; b.classList.add('added');
    setTimeout(function () { b.textContent = 'Add'; b.classList.remove('added'); }, 1100);
    renderTicket();
  });
  var tk = document.getElementById('ticket'), send = document.getElementById('send');
  function renderTicket() {
    var n = cart.reduce(function (a, c) { return a + c.q; }, 0), tot = cart.reduce(function (a, c) { return a + c.q * c.p; }, 0);
    document.getElementById('count').textContent = n + (n === 1 ? ' item' : ' items');
    document.getElementById('total').textContent = '$' + tot;
    tk.innerHTML = cart.length ? cart.map(function (c, i) {
      return '<li><span>' + c.q + ' × ' + c.n + '</span><em>$' + c.q * c.p + '</em><button type="button" data-r="' + i + '" aria-label="Remove one ' + c.n + '">−</button></li>';
    }).join('') : '<li class="ticket__empty">Nothing yet. Add a smoothie.</li>';
    var cb = document.getElementById('cartbar'); cb.hidden = !n; document.getElementById('cartN').textContent = n + (n === 1 ? ' item' : ' items') + ' · $' + tot;
    var name = document.getElementById('nm').value.trim(), eta = document.getElementById('eta').value;
    if (cart.length) {
      send.setAttribute('aria-disabled', 'false');
      send.href = 'sms:+12125550186?&body=' + encodeURIComponent('Order for ' + (name || '…') + ': ' + cart.map(function (c) { return c.q + ' ' + c.n; }).join(', ') + '. Walking in ' + eta + '. Thanks!');
    } else { send.setAttribute('aria-disabled', 'true'); send.removeAttribute('href'); }
  }
  tk.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var c = cart[+b.dataset.r]; c.q--; if (!c.q) cart.splice(+b.dataset.r, 1); renderTicket();
  });
  document.getElementById('nm').addEventListener('input', renderTicket);
  document.getElementById('eta').addEventListener('change', renderTicket);
  send.addEventListener('click', function (e) { if (send.getAttribute('aria-disabled') === 'true') e.preventDefault(); });
  renderList(); renderTicket();

  /* split-flap board */
  var rows = document.getElementById('rows'), CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function flap(el, text) {
    if (reduce) { el.textContent = text; return; }
    el.innerHTML = text.split('').map(function () { return '<span class="c"> </span>'; }).join('');
    var cells = el.children, step = 0;
    var iv = setInterval(function () {
      step++;
      for (var i = 0; i < cells.length; i++) {
        cells[i].textContent = step > 4 + i * 0.6 ? text[i] : (text[i] === ' ' ? ' ' : CH[Math.floor(Math.random() * CH.length)]);
      }
      if (step > 6 + cells.length * 0.6) clearInterval(iv);
    }, 55);
  }
  var seed = 0;
  function board() {
    var n = ny(), html = '';
    for (var i = 0; i < 6; i++) html += '<li><span class="t"></span><span class="n"></span><span class="s"></span><span class="st"></span></li>';
    rows.innerHTML = html;
    [].forEach.call(rows.children, function (li, i) {
      var name = ALL[(seed + i * 4) % ALL.length].toUpperCase(), ready = i < 2;
      flap(li.querySelector('.t'), hm(n.t + (ready ? -1 + i : 1 + i * 2)));
      flap(li.querySelector('.n'), name);
      li.querySelector('.s').textContent = ((seed * 5 + i * 7) % 12) + 1;
      var st = li.querySelector('.st'); st.textContent = ready ? 'ON SHELF' : 'BLENDING'; st.classList.toggle('b', !ready);
    });
    seed++;
  }
  board(); if (!reduce) setInterval(board, 9000);

  /* train planner */
  var dep = document.getElementById('dep'), plan = document.getElementById('plan');
  function renderPlan() {
    var p = (dep.value || '17:42').split(':'), d = (+p[0]) * 60 + (+p[1]);
    var steps = [
      [d - 12, 'Text your order', 'From the train or the platform.', 'is-key'],
      [d - 8, 'It’s on your shelf', 'About four minutes to blend. We text the shelf number.', ''],
      [d - 6, 'Grab it and go', 'Two minutes back to the 42nd Street doors.', ''],
      [d - 4, 'Main Concourse', 'Check the big board for your track.', ''],
      [d, 'Departure', 'Smoothie in hand.', 'is-go']
    ];
    plan.innerHTML = steps.map(function (s) { return '<li class="' + s[3] + '"><b>' + hm(s[0]) + '</b><span>' + s[1] + '<small>' + s[2] + '</small></span></li>'; }).join('');
  }
  dep.addEventListener('input', renderPlan); renderPlan();

  /* clock + status */
  var H = { 1: [360, 1200], 2: [360, 1200], 3: [360, 1200], 4: [360, 1200], 5: [360, 1200], 6: [480, 960] };
  function tick() {
    var n = ny(), h = H[n.dow], open = !!h && n.t >= h[0] && n.t < h[1];
    [].forEach.call(document.querySelectorAll('[data-clock]'), function (el) { el.textContent = hm(n.t); });
    var st = document.querySelector('.hdr__clock [data-status]');
    st.textContent = open ? 'OPEN TIL ' + hm(h[1]) : 'CLOSED';
    st.classList.toggle('is-open', open);
    var row = document.querySelector('#hrs tr[data-d="' + n.dow + '"]');
    [].forEach.call(document.querySelectorAll('#hrs tr'), function (r) { r.classList.toggle('today', r === row); });
  }
  tick(); setInterval(tick, 15000);
})();
