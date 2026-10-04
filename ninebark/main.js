(function () {
  'use strict';
  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { h: (+o.hour) % 24, m: +o.minute, dow: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday] };
  }
  var now = ny(), t = now.h + now.m / 60;
  var openDay = [0, 3, 4, 5, 6].indexOf(now.dow) > -1;
  var DN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function nextOpen() { var d = now.dow, i = 0; do { d = (d + 1) % 7; i++; } while ([0, 3, 4, 5, 6].indexOf(d) === -1 && i < 8); return i === 1 ? 'tomorrow' : DN[d]; }

  /* head status */
  var hs = document.getElementById('headStatus');
  if (openDay && t >= 7 && t < 14) hs.innerHTML = '<b>●</b> Open — bread on the shelves';
  else if (openDay && t < 7) hs.textContent = 'Opens at 7 — ovens are on';
  else hs.textContent = 'Closed · back ' + nextOpen() + ' at 7';

  /* oven timeline */
  var items = Array.prototype.slice.call(document.querySelectorAll('#bakes li'));
  var live = document.getElementById('ovenLive'), dot = document.getElementById('trackNow');
  var weekend = now.dow === 0 || now.dow === 6;
  if (openDay && t >= 6 && t < 14) {
    var next = null;
    items.forEach(function (li) {
      var bt = parseFloat(li.dataset.t);
      if (!weekend && li.querySelector('b').textContent.indexOf('Spelt') === 0) { li.classList.add('done'); return; }
      if (bt <= t) li.classList.add('done');
      else if (!next) { next = li; li.classList.add('next'); }
    });
    var pos = Math.max(0, Math.min(1, (t - 7) / 6.5));
    dot.hidden = false; dot.style.left = (pos * 100) + '%';
    if (next) {
      var mins = Math.round((parseFloat(next.dataset.t) - t) * 60);
      live.textContent = next.querySelector('b').textContent + ' comes out in ' + (mins >= 60 ? Math.floor(mins / 60) + ' hr ' + (mins % 60) + ' min' : mins + ' minutes') + '.';
    } else live.textContent = 'Last bake is out. Whatever’s on the shelf is what we’ve got.';
  } else {
    live.textContent = openDay && t < 6 ? 'The levain is waking up. First loaves at 7:00.' : 'Ovens are cooling. Next bake: ' + nextOpen() + ', first loaves at 7:00.';
  }

  /* nav */
  var nb = document.querySelector('.nav-btn'), nav = document.getElementById('nav');
  function setNav(o) { document.documentElement.style.setProperty('--navtop', document.querySelector('.head').getBoundingClientRect().bottom + 'px'); nav.classList.toggle('open', o); nb.setAttribute('aria-expanded', String(o)); }
  nb.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setNav(false); nb.focus(); } });

  /* stepper */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.stepper [role="tab"]'));
  function sel(tb) { tabs.forEach(function (x) { var on = x === tb; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; }); }
  tabs.forEach(function (tb, i) {
    tb.addEventListener('click', function () { sel(tb); });
    tb.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (n) { e.preventDefault(); sel(n); n.focus(); }
    });
  });

  /* bread share */
  var form = document.getElementById('shareForm'), totalEl = document.getElementById('total'), msg = document.getElementById('shareMsg');
  var outs = form.querySelectorAll('output');
  function total() { var s = 0; outs.forEach(function (o) { s += (+o.value || +o.textContent) * +o.dataset.price; }); totalEl.textContent = '$' + s; return s; }
  form.querySelectorAll('.qty button').forEach(function (b) {
    b.addEventListener('click', function () {
      var o = b.parentNode.querySelector('output');
      var v = Math.max(0, Math.min(6, +o.textContent + +b.dataset.d));
      o.textContent = v; total();
    });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var lines = [];
    outs.forEach(function (o) { if (+o.textContent > 0) lines.push(o.textContent + ' × ' + o.dataset.name); });
    var name = form.name.value.trim();
    if (!lines.length) { msg.textContent = 'Pick at least one loaf.'; return; }
    if (!name) { msg.textContent = 'Add your name so we can label the bag.'; form.name.focus(); return; }
    msg.textContent = '';
    var day = form.querySelector('[name="day"]:checked').value;
    var body = 'Hi Ninebark,\n\nI’d like a weekly bread share:\n\n' + lines.join('\n') + '\n\nPickup: ' + day + 's\nName: ' + name + '\nWeekly total: $' + total() + ' (pay at pickup)\n\nThank you!';
    location.href = 'mailto:bread@ninebark.bakery?subject=' + encodeURIComponent('Bread share — ' + name) + '&body=' + encodeURIComponent(body);
  });

  /* reveal */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.loaves tbody tr, .breads__intro, .hannah > div, .share__intro, .slow__img').forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();
