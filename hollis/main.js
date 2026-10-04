(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { h: (+o.hour) % 24, m: +o.minute, dow: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday] };
  }
  var now = ny(), t = now.h + now.m / 60;
  var H = { 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [9, 20], 6: [9, 16] };
  var td = document.getElementById('today');
  if (H[now.dow] && t >= H[now.dow][0] && t < H[now.dow][1]) { td.classList.add('open'); td.textContent = 'The room is open today until ' + (H[now.dow][1] - 12) + ' pm'; }
  else td.textContent = 'The room is quiet now. We open ' + (now.dow === 6 || now.dow === 0 ? 'Tuesday' : (now.dow === 1 ? 'tomorrow' : 'tomorrow')) + ' at 9.';

  /* overlay */
  var mb = document.querySelector('.menu-btn'), ov = document.getElementById('overlay'), head = document.querySelector('.head');
  function setOv(o) {
    ov.hidden = !o; mb.setAttribute('aria-expanded', String(o)); mb.querySelector('span').textContent = o ? 'Close' : 'Menu';
    document.body.style.overflow = o ? 'hidden' : '';
    if (o) ov.querySelector('a').focus();
  }
  mb.addEventListener('click', function () { setOv(ov.hidden); });
  ov.addEventListener('click', function (e) { if (e.target.closest('nav a')) setOv(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !ov.hidden) { setOv(false); mb.focus(); } });

  /* parallax */
  var par = document.querySelectorAll('[data-parallax]');
  if (!reduce && par.length) {
    var ticking = false;
    function upd() {
      par.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        var p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        el.style.transform = 'translate3d(0,' + (p * -60).toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(upd); ticking = true; } }, { passive: true });
    upd();
  }

  /* reveal + bars */
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('.room__text, .room__img, .svc li, blockquote, .steps li, .terms div, .request__intro, .faq__list').forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
    document.querySelectorAll('.bar').forEach(function (b) { io.observe(b); });
  } else document.documentElement.classList.add('no-io');

  /* request */
  var f = document.getElementById('rq'), err = document.getElementById('rqErr');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = f.name.value.trim();
    var days = Array.prototype.map.call(f.querySelectorAll('[name="days"]:checked'), function (c) { return c.value; });
    if (!name) { err.textContent = 'Please add your name.'; f.name.focus(); return; }
    if (!days.length) { err.textContent = 'Choose at least one day that suits you.'; f.querySelector('[name="days"]').focus(); return; }
    err.textContent = '';
    var g = function (n) { return f.querySelector('[name="' + n + '"]:checked').value; };
    var body = 'Good day,\n\nI would like to request an appointment.\n\nService: ' + g('service') + '\nPreferred days: ' + days.join(', ') + '\nTime of day: ' + g('tod') + '\nFirst visit: ' + g('first') + '\nName: ' + name + (f.notes.value.trim() ? '\nNotes: ' + f.notes.value.trim() : '') + '\n\nThank you.';
    location.href = 'mailto:appointments@hollis.nyc?subject=' + encodeURIComponent('Appointment request — ' + name) + '&body=' + encodeURIComponent(body);
  });
})();
