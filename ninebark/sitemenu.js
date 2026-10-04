/* Mobile site menu: a full-screen, themed navigation drawer.
   Reads window.SITEMENU = { name, sub, bp, nav, mount, hide, links?, actions, info, hours, label }.
   hours: { 0:[openMin, closeMin] | null, ... } in New York time. */
(function () {
  'use strict';
  var C = window.SITEMENU; if (!C) return;
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  var links = C.links || [].map.call(document.querySelectorAll(C.nav + ' a'), function (a) {
    var c = a.cloneNode(true); [].forEach.call(c.querySelectorAll('span'), function (x) { x.remove(); });
    return [a.getAttribute('href'), c.textContent.trim()];
  });

  /* button */
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'sm-btn';
  btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'sm');
  btn.innerHTML = '<span class="sm-btn__i" aria-hidden="true"><i></i><i></i><i></i></span><span class="sm-btn__l">' + esc(C.label || 'Menu') + '</span>';
  var mount = document.querySelector(C.mount);
  if (C.mountMode === 'append') mount.appendChild(btn);
  else if (C.mountMode === 'after') mount.parentNode.insertBefore(btn, mount.nextSibling);
  else mount.parentNode.insertBefore(btn, mount);

  /* drawer */
  var d = document.createElement('div');
  d.className = 'sm'; d.id = 'sm'; d.hidden = true;
  d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', C.name + ' menu');
  d.innerHTML =
    '<div class="sm__top"><a class="sm__name" href="#top">' + esc(C.name) + (C.sub ? '<small>' + esc(C.sub) + '</small>' : '') + '</a>' +
    '<button class="sm__x" type="button"><span>Close</span><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
    '<div class="sm__body">' +
    (C.hours ? '<p class="sm__status" data-sm-status></p>' : '') +
    '<nav aria-label="Menu"><ol class="sm__list">' + links.map(function (l, i) {
      return '<li style="--i:' + i + '"><a href="' + esc(l[0]) + '"><span class="sm__n">' + ('0' + (i + 1)).slice(-2) + '</span><span class="sm__t">' + esc(l[1]) + '</span></a></li>';
    }).join('') + '</ol></nav>' +
    '<div class="sm__foot">' +
    (C.info ? '<p class="sm__info">' + C.info.map(esc).join('<br>') + '</p>' : '') +
    '<div class="sm__acts">' + (C.actions || []).map(function (a) {
      return '<a class="sm__a' + (a.primary ? ' sm__a--p' : '') + '" href="' + esc(a.href) + '">' + esc(a.label) + '</a>';
    }).join('') + '</div></div></div>';
  document.body.appendChild(d);

  /* live status */
  function status() {
    if (!C.hours) return;
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    var dow = DAYS.indexOf(o.weekday), t = ((+o.hour) % 24) * 60 + (+o.minute), h = C.hours[dow], txt, open = false;
    function clk(m) { m = m % 1440; var hh = Math.floor(m / 60), mm = m % 60; return ((hh % 12) || 12) + (mm ? ':' + ('0' + mm).slice(-2) : '') + (hh >= 12 ? ' pm' : ' am'); }
    if (h && t >= h[0] && t < h[1]) { open = true; txt = 'Open now · until ' + (h[1] >= 1440 ? 'midnight' : clk(h[1])); }
    else if (h && t < h[0]) txt = 'Closed · opens today at ' + clk(h[0]);
    else { var k = 1; while (!C.hours[(dow + k) % 7] && k < 7) k++; txt = 'Closed · opens ' + (k === 1 ? 'tomorrow' : DAYS[(dow + k) % 7]) + ' at ' + clk(C.hours[(dow + k) % 7][0]); }
    var el = d.querySelector('[data-sm-status]'); el.textContent = txt; el.classList.toggle('is-open', open);
  }

  var last;
  function open() {
    status(); last = document.activeElement; d.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add('is-open'); }); });
    btn.setAttribute('aria-expanded', 'true'); document.documentElement.classList.add('sm-lock');
    setTimeout(function () { d.querySelector('.sm__x').focus(); }, 80);
  }
  function close(nav) {
    d.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); document.documentElement.classList.remove('sm-lock');
    setTimeout(function () { if (!d.classList.contains('is-open')) d.hidden = true; }, 380);
    if (!nav && last) last.focus();
  }
  btn.addEventListener('click', open);
  d.querySelector('.sm__x').addEventListener('click', function () { close(); });
  d.addEventListener('click', function (e) { if (e.target.closest('a[href^="#"]')) close(true); });
  document.addEventListener('keydown', function (e) {
    if (!d.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      var q = d.querySelectorAll('a[href],button'), a = q[0], z = q[q.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });
  if (window.matchMedia) window.matchMedia('(min-width:' + (C.bp + 1) + 'px)').addEventListener('change', function (q) { if (q.matches && d.classList.contains('is-open')) close(true); });
})();
