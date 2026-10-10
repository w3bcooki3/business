/* Feldman & Daughters — page behaviour (no dependencies). */
(function () {
  'use strict';

  var SHOP = {
    phone: '+12125550158',
    email: 'orders@feldmananddaughters.com',
    /* minutes after midnight, New York time. 0 = Sunday */
    hours: { 0: [360, 900], 1: [360, 900], 2: [360, 900], 3: [360, 900], 4: [360, 900], 5: [360, 900], 6: [420, 840] }
  };
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { m: ((+o.hour) % 24) * 60 + (+o.minute), dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday) };
  }
  function clock(m) { var h = Math.floor(m / 60), mm = m % 60; return ((h % 12) || 12) + (mm ? ':' + ('0' + mm).slice(-2) : '') + (h >= 12 ? ' pm' : ' am'); }
  function $(id) { return document.getElementById(id); }

  /* ── Open status ─────────────────────────────────────────── */
  function status() {
    var now = ny(), h = SHOP.hours[now.dow], open = now.m >= h[0] && now.m < h[1], txt, sub;
    if (open) { txt = 'Open now · until ' + clock(h[1]); sub = 'Bagels are hot'; }
    else if (now.m < h[0]) { txt = 'Opens today at ' + clock(h[0]); sub = 'The kettle is heating up'; }
    else { var n = (now.dow + 1) % 7; txt = 'Closed · opens ' + (n === 6 ? 'Saturday' : 'tomorrow') + ' at ' + clock(SHOP.hours[n][0]); sub = 'The kettle is resting'; }
    $('liveTxt').textContent = txt; $('liveSub').textContent = sub;
    $('live').textContent = (open ? '● ' : '○ ') + txt;
    document.querySelector('.today__status').classList.toggle('is-open', open);
    [].forEach.call(document.querySelectorAll('#hrs li'), function (li) {
      li.classList.toggle('is-today', li.dataset.days.split(',').indexOf(String(now.dow)) > -1);
    });
    /* next tray: every 20 minutes from opening */
    if (open) { var wait = 20 - ((now.m - h[0]) % 20); $('nextTray').textContent = wait + ' min'; }
    else { var nd = now.m < h[0] ? now.dow : (now.dow + 1) % 7; $('nextTray').textContent = (nd === now.dow ? 'at ' : (nd === 6 ? 'Sat ' : 'tmrw ')) + clock(SHOP.hours[nd][0]); }
  }
  status();
  setInterval(status, 60000);

  /* ── Take a number ───────────────────────────────────────── */
  var tips = [
    'Number 48! Tip: ask for it “scooped” and Rachel will pretend not to hear you.',
    'Number 49! Tip: the bialy is better than the bagel. Don’t tell Grandpa Abe.',
    'Number 50! Tip: Sunday before 8 am, no line. After 9, bring a friend.',
    'Number 51! Tip: whitefish salad on pumpernickel. Thank us later.',
    'Number 52! Tip: day-olds are half price after 1 pm, perfect for bagel chips.',
    'Number 53! Tip: the halvah babka sells out by noon on Fridays.'
  ];
  var n = 47, disp = $('dispenser');
  disp.addEventListener('click', function () {
    n = n >= 53 ? 48 : n + 1;
    disp.classList.remove('pulled'); void disp.offsetWidth; disp.classList.add('pulled');
    $('num').textContent = n;
    $('ticketTip').textContent = tips[n - 48];
  });

  /* ── Baker's dozen builder ───────────────────────────────── */
  var FLAVORS = [
    ['Plain', '#e8c48f', 2.25], ['Everything', '#a77b4e', 2.25], ['Sesame', '#dcb57a', 2.25], ['Poppy', '#6b5a4a', 2.25],
    ['Salt', '#e6cfa4', 2.25], ['Onion', '#c99a5c', 2.25], ['Garlic', '#d9b27c', 2.25], ['Pumpernickel', '#4a2f22', 2.50],
    ['Cinnamon raisin', '#b07a4a', 2.50], ['Bialy', '#e9d2a8', 2.50]
  ];
  var MAX = 13, counts = {}, list = $('dzList');
  FLAVORS.forEach(function (f) {
    counts[f[0]] = 0;
    var li = document.createElement('li');
    li.innerHTML = '<span class="bn"><i style="--c:' + f[1] + '" aria-hidden="true"></i><span>' + f[0] + '<small>$' + f[2].toFixed(2) + '</small></span></span>' +
      '<span class="step"><button type="button" data-d="-1" aria-label="One less ' + f[0] + '">−</button>' +
      '<output aria-live="polite" aria-label="' + f[0] + ' count">0</output>' +
      '<button type="button" data-d="1" aria-label="One more ' + f[0] + '">+</button></span>';
    li.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var d = +b.dataset.d;
      if (d > 0 && total() >= MAX) return;
      counts[f[0]] = Math.max(0, counts[f[0]] + d);
      li.querySelector('output').textContent = counts[f[0]];
      li.classList.toggle('has', counts[f[0]] > 0);
      render();
    });
    list.appendChild(li);
  });
  function total() { var s = 0; for (var k in counts) s += counts[k]; return s; }

  var schmears = $('schmears'), times = $('times');
  schmears.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); render();
  });
  times.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    [].forEach.call(times.querySelectorAll('.chip'), function (c) { c.setAttribute('aria-pressed', String(c === b)); }); render();
  });

  function money() {
    var tot = total(), m = 0;
    if (tot === MAX) m = 26;
    else FLAVORS.forEach(function (f) { m += counts[f[0]] * f[2]; });
    [].forEach.call(schmears.querySelectorAll('[aria-pressed="true"]'), function (c) { m += +c.dataset.price; });
    return m;
  }
  function render() {
    var tot = total(), m = money();
    $('count').textContent = tot; $('tallyN').textContent = tot;
    $('meter').style.width = (tot / MAX * 100) + '%';
    $('dzTotal').textContent = $('tallyT').textContent = '$' + m.toFixed(2);
    [].forEach.call(list.querySelectorAll('button'), function (b) {
      var name = b.closest('li').querySelector('.bn > span').firstChild.textContent;
      b.disabled = +b.dataset.d > 0 ? tot >= MAX : counts[name] === 0;
    });
    $('dzHint').textContent = tot === 0 ? 'Thirteen for $26, or $2.25–$2.50 each.'
      : tot < MAX ? (MAX - tot) + ' to go — at 13 the price drops to $26.'
      : 'That’s a baker’s dozen. The thirteenth is on us.';
    $('dzSide').classList.toggle('full', tot === MAX);
    var lines = [];
    FLAVORS.forEach(function (f) { if (counts[f[0]]) lines.push(counts[f[0]] + ' × ' + f[0]); });
    [].forEach.call(schmears.querySelectorAll('[aria-pressed="true"]'), function (c) { lines.push('+ ' + c.dataset.name); });
    var t = times.querySelector('[aria-pressed="true"]').textContent.trim();
    var when = t === 'Noon' ? 'noon' : t + ' am';
    var body = 'Hi Feldman & Daughters,\n\nA pickup order, please:\n\n' + lines.join('\n') +
      '\n\nEstimated total: $' + m.toFixed(2) + '\nPickup time: ' + when + '\nPickup day: \nName for the bag: \n\nThanks!';
    $('dzSend').href = 'mailto:' + SHOP.email + '?subject=' + encodeURIComponent('Pickup order — ' + tot + ' bagels at ' + when) + '&body=' + encodeURIComponent(body);
    $('dzSend').setAttribute('aria-disabled', String(tot === 0));
    if (tot > 0) $('dzMsg').textContent = '';
  }
  $('dzSend').addEventListener('click', function (e) {
    if (total() === 0) { e.preventDefault(); $('dzMsg').textContent = 'Pick some bagels first — tap + next to a flavor.'; }
  });
  $('dzClear').addEventListener('click', function () {
    for (var k in counts) counts[k] = 0;
    [].forEach.call(list.querySelectorAll('li'), function (li) { li.classList.remove('has'); li.querySelector('output').textContent = '0'; });
    [].forEach.call(schmears.querySelectorAll('.chip'), function (c) { c.setAttribute('aria-pressed', 'false'); });
    $('dzMsg').textContent = 'Cleared. Start again whenever you’re ready.';
    render();
    list.querySelector('button[data-d="1"]').focus();
  });
  render();

  /* ── Babka rail ──────────────────────────────────────────── */
  var rail = $('rail');
  function step(d) {
    var card = rail.querySelector('.bk'), gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    rail.scrollBy({ left: d * (card.getBoundingClientRect().width + gap), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  function arrows() {
    $('prev').disabled = rail.scrollLeft < 4;
    $('next').disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 4;
  }
  $('prev').addEventListener('click', function () { step(-1); });
  $('next').addEventListener('click', function () { step(1); });
  rail.addEventListener('scroll', arrows, { passive: true });
  window.addEventListener('resize', arrows);
  arrows();

  /* ── Mobile dock + tally ─────────────────────────────────── */
  var dock = $('dock'), tally = $('tally');
  if ('IntersectionObserver' in window) {
    var heroVis = true, listVis = false, sideVis = false, footVis = false;
    function sync() {
      var showTally = listVis && !sideVis;
      tally.classList.toggle('is-on', showTally);
      dock.classList.toggle('is-on', !heroVis && !showTally && !footVis);
    }
    new IntersectionObserver(function (es) { heroVis = es[0].isIntersecting; sync(); }).observe(document.querySelector('.hero'));
    new IntersectionObserver(function (es) { listVis = es[0].isIntersecting; sync(); }, { rootMargin: '-30% 0px -20% 0px' }).observe(list);
    new IntersectionObserver(function (es) { sideVis = es[0].isIntersecting; sync(); }).observe($('dzSide'));
    new IntersectionObserver(function (es) { footVis = es[0].isIntersecting; sync(); }).observe(document.querySelector('.foot__fine'));
  }

  /* ── Reveal on scroll ────────────────────────────────────── */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    [].forEach.call(document.querySelectorAll('.board, .yrs li, .tray'), function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();
