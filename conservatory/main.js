(function () {
  'use strict';
  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { y: +o.year, mo: +o.month, d: +o.day, h: (+o.hour) % 24, m: +o.minute, dow: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday] };
  }
  var now = ny(), t = now.h + now.m / 60;

  /* light line */
  var light = t < 6 ? 'Moonlight on the skylights — we open at 8' :
    t < 11 ? 'Morning light through the east windows' :
    t < 15 ? 'High sun under the skylights' :
    t < 18.5 ? 'Golden hour on the fiddle-leaf figs' : 'Evening — lamps on, plants resting';
  document.getElementById('light').textContent = light;

  /* hours / status */
  var we = now.dow === 0 || now.dow === 6, H = we ? [8.5, 18] : [8, 17];
  document.getElementById(we ? 'hrsWe' : 'hrsWk').classList.add('today');
  var st = document.getElementById('status');
  if (t >= H[0] && t < H[1]) { st.classList.add('open'); st.textContent = 'Open now — kitchen until close'; }
  else st.textContent = t < H[0] ? 'Opens this morning at ' + (we ? '8:30' : '8') : 'Closed for the evening — open tomorrow from ' + ((now.dow === 5 || now.dow === 6) ? '8:30' : '8');

  /* next swap */
  var add = (7 - now.dow) % 7; if (add === 0 && t >= 11) add = 7;
  var d = new Date(Date.UTC(now.y, now.mo - 1, now.d + add));
  var M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('nextSwap').textContent = add === 0 ? 'Swap is on right now, until 11' : 'Next swap: Sunday, ' + M[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', 9 am';

  /* overlay */
  var mb = document.querySelector('.menu-btn'), ov = document.getElementById('overlay');
  function setOv(o) { ov.hidden = !o; mb.setAttribute('aria-expanded', String(o)); mb.textContent = o ? 'Close' : 'Menu'; document.body.style.overflow = o ? 'hidden' : ''; }
  mb.addEventListener('click', function () { setOv(ov.hidden); });
  ov.addEventListener('click', function (e) { if (e.target.closest('a')) setOv(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !ov.hidden) { setOv(false); mb.focus(); } });

  /* filters */
  var btns = document.querySelectorAll('.filters button'), items = document.querySelectorAll('#items li');
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      var f = b.dataset.f;
      items.forEach(function (li) { li.classList.toggle('off', f !== 'all' && li.dataset.t.split(' ').indexOf(f) === -1); });
    });
  });

  /* specimens */
  document.querySelectorAll('.spec').forEach(function (s) {
    s.addEventListener('click', function () {
      var o = s.getAttribute('aria-expanded') === 'true';
      s.setAttribute('aria-expanded', String(!o));
      s.nextElementSibling.hidden = o;
    });
  });

  /* reveal */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.story h2, .story__cols, .matcha__text, .specs li, .swap__card, .gallery figure, .visit__grid > div').forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();
