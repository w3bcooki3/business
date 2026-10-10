/* Track 42 — text-order builder (composes an sms: link), split-flap board, train planner, clock/status, mobile dock. */
(function () {
  'use strict';
  var PHONE = '+12125550186';
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
  function each(sel, fn) { [].forEach.call(document.querySelectorAll(sel), fn); }
  function plural(n) { return n + (n === 1 ? ' item' : ' items'); }

  /* ── Menu + ticket ───────────────────────────────────────────── */
  var list = document.getElementById('list'), cart = [], line = 'express', eta = '10';
  function qty(name) { var c = cart.filter(function (x) { return x.n === name; })[0]; return c ? c.q : 0; }
  function renderList() {
    var L = MENU[line];
    list.innerHTML = L.items.map(function (it, i) {
      var q = qty(it[0]);
      return '<li class="item" style="--lc:' + L.c + '"><b class="item__n">' + it[0] + '</b><p class="item__d">' + it[1] + '</p>' +
        '<p class="item__p">$' + it[2] + (q ? '<span class="item__q">' + q + ' in order</span>' : '') + '</p>' +
        '<button type="button" class="item__add" data-i="' + i + '" aria-label="Add ' + it[0] + ', $' + it[2] + '"><span aria-hidden="true">+</span>Add</button></li>';
    }).join('');
  }
  var lines = document.querySelector('.lines');
  lines.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    line = b.dataset.l;
    [].forEach.call(lines.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    renderList();
  });
  list.addEventListener('click', function (e) {
    var b = e.target.closest('.item__add'); if (!b) return;
    var i = +b.dataset.i, it = MENU[line].items[i];
    var found = cart.filter(function (c) { return c.n === it[0]; })[0];
    if (found) found.q++; else cart.push({ n: it[0], p: it[2], q: 1 });
    renderTicket(); renderList();
    var nb = list.querySelector('.item__add[data-i="' + i + '"]');
    nb.focus(); nb.classList.add('added'); nb.lastChild.textContent = 'Added';
    setTimeout(function () { nb.classList.remove('added'); nb.lastChild.textContent = 'Add'; }, 1100);
  });

  var tk = document.getElementById('ticket'), send = document.getElementById('send');
  var dock = document.getElementById('dock'), cartbar = document.getElementById('cartbar');
  function renderTicket() {
    var n = cart.reduce(function (a, c) { return a + c.q; }, 0), tot = cart.reduce(function (a, c) { return a + c.q * c.p; }, 0);
    document.getElementById('count').textContent = plural(n);
    document.getElementById('total').textContent = '$' + tot;
    tk.innerHTML = cart.length ? cart.map(function (c, i) {
      return '<li><span>' + c.q + ' × ' + c.n + '</span><em>$' + c.q * c.p + '</em><button type="button" data-r="' + i + '" aria-label="Remove one ' + c.n + '">−</button></li>';
    }).join('') : '<li class="ticket__empty">Nothing yet. Add a smoothie.</li>';
    cartbar.hidden = !n; dock.classList.toggle('has-cart', !!n);
    document.getElementById('cartN').textContent = plural(n) + ' · $' + tot;
    if (n) {
      send.setAttribute('aria-disabled', 'false');
      send.href = 'sms:' + PHONE + '?&body=' + encodeURIComponent('Pickup order: ' + cart.map(function (c) { return c.q + ' ' + c.n; }).join(', ') +
        '. Walking in in ' + eta + ' minutes. Name for the cup: ');
    } else { send.setAttribute('aria-disabled', 'true'); send.removeAttribute('href'); }
    updateDock();
  }
  tk.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var r = +b.dataset.r, c = cart[r]; c.q--; if (!c.q) cart.splice(r, 1);
    renderTicket(); renderList();
    var next = tk.querySelector('button[data-r="' + Math.min(r, cart.length - 1) + '"]');
    (next || document.getElementById('tk-t')).focus();
  });
  var etaBox = document.getElementById('eta');
  etaBox.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    eta = b.dataset.v;
    [].forEach.call(etaBox.children, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    renderTicket();
  });
  send.addEventListener('click', function (e) { if (send.getAttribute('aria-disabled') === 'true') e.preventDefault(); });

  /* ── Split-flap board ────────────────────────────────────────── */
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
      var ready = i < 2;
      flap(li.querySelector('.t'), hm(n.t + (ready ? -1 + i : 1 + i * 2)));
      flap(li.querySelector('.n'), ALL[(seed + i * 4) % ALL.length].toUpperCase());
      li.querySelector('.s').textContent = ((seed * 5 + i * 7) % 12) + 1;
      var st = li.querySelector('.st'); st.textContent = ready ? 'ON SHELF' : 'BLENDING'; st.classList.toggle('b', !ready);
    });
    seed++;
  }
  board(); if (!reduce) setInterval(board, 9000);

  /* ── Train planner ───────────────────────────────────────────── */
  var dep = document.getElementById('dep'), plan = document.getElementById('plan');
  function depMin() { var p = (dep.value || '17:42').split(':'); return (+p[0]) * 60 + (+p[1]); }
  function renderPlan() {
    var d = depMin();
    var steps = [
      [d - 12, 'Text your order', 'From the train or the platform.', 'is-key'],
      [d - 8, 'It’s on your shelf', 'About four minutes to blend. We text the shelf number.', ''],
      [d - 6, 'Grab it and go', 'Two minutes back to the 42nd Street doors.', ''],
      [d - 4, 'Main Concourse', 'Check the big board for your track.', ''],
      [d, 'Departure', 'Smoothie in hand.', 'is-go']
    ];
    plan.innerHTML = steps.map(function (s, i) {
      return '<li class="' + s[3] + '"><b>' + hm(s[0]) + '</b><span>' + s[1] + '<small>' + s[2] + '</small>' +
        (i === 0 ? '<a href="#order">Build the text now</a>' : '') + '</span></li>';
    }).join('');
  }
  dep.addEventListener('input', renderPlan);
  each('.dep__s', function (b) {
    b.addEventListener('click', function () { dep.value = hm(depMin() + (+b.dataset.step)); renderPlan(); });
  });
  renderPlan();

  /* ── Clock + open status ─────────────────────────────────────── */
  var H = { 1: [360, 1200], 2: [360, 1200], 3: [360, 1200], 4: [360, 1200], 5: [360, 1200], 6: [480, 960] };
  function nextOpen(dow) { for (var k = 1; k < 8; k++) { var d = (dow + k) % 7; if (H[d]) return [k, d]; } }
  function tick() {
    var n = ny(), h = H[n.dow], open = !!h && n.t >= h[0] && n.t < h[1], long, short;
    if (open) { long = 'Open now · until ' + hm(h[1]); short = 'Open til ' + hm(h[1]); }
    else if (h && n.t < h[0]) { long = 'Closed · opens today ' + hm(h[0]); short = 'Opens ' + hm(h[0]); }
    else {
      var x = nextOpen(n.dow), when = x[0] === 1 ? 'tomorrow' : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][x[1]];
      long = 'Closed · opens ' + when + ' ' + hm(H[x[1]][0]); short = 'Opens ' + when + ' ' + hm(H[x[1]][0]);
    }
    each('[data-clock]', function (el) { el.textContent = hm(n.t); });
    each('[data-status]', function (el) { el.textContent = open ? 'OPEN TIL ' + hm(h[1]) : 'CLOSED'; });
    each('[data-status-long]', function (el) { el.textContent = long; });
    each('[data-status-short]', function (el) { el.textContent = short; });
    each('[data-open]', function (el) { el.classList.toggle('is-open', open); });
    each('#hrs tr', function (r) { r.classList.toggle('today', +r.dataset.d === n.dow); });
  }
  tick(); setInterval(tick, 15000);

  /* ── Mobile dock: off over the hero, the visible ticket, the visit section and footer;
        over the order section it only appears once there is something in the cart. ── */
  var seen = {};
  function updateDock() {
    var hasCart = cart.length > 0;
    var off = seen.hero || seen.ticket || seen.visit || seen.ft || (seen.order && !hasCart);
    dock.classList.toggle('is-on', !off);
  }
  if ('IntersectionObserver' in window) {
    var map = [['hero', '.hero'], ['ticket', '#ticketBox'], ['order', '#order'], ['visit', '#visit'], ['ft', '.ft']];
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { map.forEach(function (m) { if (e.target === document.querySelector(m[1])) seen[m[0]] = e.isIntersecting; }); });
      updateDock();
    }, { rootMargin: '-25% 0px -25% 0px' });
    map.forEach(function (m) { io.observe(document.querySelector(m[1])); });
  }

  renderList(); renderTicket();
})();
