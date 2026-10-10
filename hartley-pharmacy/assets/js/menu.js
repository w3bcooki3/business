/* Full-screen mobile menu. Builds an overlay from the page's own nav links,
   replacing the old dropdown. Site-specific settings live in CFG below. */
(function () {
  'use strict';
  var CFG = {
 "label": "Hartley Pharmacy menu",
 "kicker": "Hartley Pharmacy · on this corner since 1911",
 "hours": [
  [
   600,
   960
  ],
  [
   510,
   1200
  ],
  [
   510,
   1200
  ],
  [
   510,
   1200
  ],
  [
   510,
   1200
  ],
  [
   510,
   1200
  ],
  [
   540,
   1080
  ]
 ],
 "desc": {
  "index.html": "Start here",
  "services.html": "Prescriptions, vaccines, delivery",
  "insurance.html": "Plans we take & paperwork help",
  "about.html": "Our family, hours & directions"
 },
 "actions": [
  {
   "label": "Call us",
   "href": "tel:+12125550142",
   "icon": "phone"
  },
  {
   "label": "Text a refill",
   "href": "sms:+12125550143",
   "icon": "text"
  },
  {
   "label": "Directions",
   "href": "https://maps.google.com/?q=312+Bleecker+Street+New+York+NY+10014",
   "icon": "pin"
  }
 ],
 "info": [
  {
   "k": "Address",
   "v": "312 Bleecker St at Grove St"
  },
  {
   "k": "Pharmacy",
   "v": "Mon–Fri 8:30am–8pm · Sat 9–6 · Sun 10–4"
  },
  {
   "k": "Subway",
   "v": "1 to Christopher St, 2 min walk"
  }
 ],
 "note": "Medical emergency? Call <a href=\"tel:911\">911</a>. Poison Control: <a href=\"tel:18002221222\">1-800-222-1222</a>.",
 "deco": "<span class=\"d-awning\"></span><span class=\"d-rx\">Rx</span>"
};

  var ICONS = {
    phone: '<svg viewBox="0 0 24 24"><path d="M6.6 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6.1 6.1l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    text: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 9.5h8M8 12.5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="9.8" r="2.4" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.2A8.8 8.8 0 1 0 12 3.2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 8.6c.3 2.9 2.6 5.6 5.7 6.3l1-1.4-1.8-1-1 .7a5 5 0 0 1-2.2-2.3l.7-1-1-1.8z" fill="currentColor"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="13" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    cup: '<svg viewBox="0 0 24 24"><path d="M5 8h11v5a5.5 5.5 0 0 1-11 0z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M16 9.5h1.5a2.5 2.5 0 0 1 0 5H16M4 20.5h13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };

  var btn = document.querySelector('button[aria-controls="site-nav"]');
  var nav = document.getElementById('site-nav');
  if (!btn || !nav) return;

  // Drop the old dropdown behaviour: a clean copy of the button has no listeners.
  var fresh = btn.cloneNode(true);
  btn.parentNode.replaceChild(fresh, btn);
  btn = fresh;
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'fsm');
  nav.classList.remove('open', 'is-open');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function t(v) { // value may be a string or {en, es}
    if (typeof v === 'string') return v;
    return '<span data-l="en">' + v.en + '</span><span data-l="es" lang="es">' + v.es + '</span>';
  }

  /* ---------- open / closed status in New York time ---------- */
  function nyNow() {
    var q = /[?&]now=([^&]+)/.exec(location.search);
    if (q) { var d = new Date(decodeURIComponent(q[1])); if (!isNaN(d)) return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() }; }
    var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
    var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: days[o.weekday], min: (+o.hour % 24) * 60 + (+o.minute) };
  }
  function fmt(m) {
    var h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return h + (mm ? ':' + (mm < 10 ? '0' : '') + mm : '') + ap;
  }
  var DAYN = { en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'] };
  function statusFor(lang) {
    var n = nyNow(), h = CFG.hours, today = h[n.day];
    var es = lang === 'es';
    if (today && n.min >= today[0] && n.min < today[1]) {
      var soon = today[1] - n.min <= 45;
      return { open: true, soon: soon, text: (es ? 'Abierto ahora · hasta las ' : (soon ? 'Closing soon · open until ' : 'Open now · until ')) + fmt(today[1]) };
    }
    if (today && n.min < today[0]) return { open: false, text: (es ? 'Cerrado · abrimos hoy a las ' : 'Closed · opens today at ') + fmt(today[0]) };
    for (var i = 1; i <= 7; i++) {
      var d = (n.day + i) % 7;
      if (h[d]) {
        var when = i === 1 ? (es ? 'mañana' : 'tomorrow') : (es ? 'el ' + DAYN.es[d] : DAYN.en[d]);
        return { open: false, text: (es ? 'Cerrado · abrimos ' : 'Closed · opens ') + when + (es ? ' a las ' : ' at ') + fmt(h[d][0]) };
      }
    }
    return { open: false, text: 'Closed' };
  }

  /* ---------- build the overlay ---------- */
  var ov = el('div', 'fsm');
  ov.id = 'fsm';
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-modal', 'true');
  ov.setAttribute('aria-label', CFG.label || 'Menu');
  ov.hidden = true;

  var deco = el('div', 'fsm-deco');
  deco.setAttribute('aria-hidden', 'true');
  if (CFG.deco) deco.innerHTML = CFG.deco;
  ov.appendChild(deco);

  var top = el('div', 'fsm-top');
  var brand = document.querySelector('header .brand, header .logo');
  if (brand) {
    var b = brand.cloneNode(true);
    b.classList.add('fsm-brand');
    b.removeAttribute('id');
    top.appendChild(b);
  }
  var tools = el('div', 'fsm-tools');
  var lang = document.querySelector('.lang-toggle');
  if (lang && CFG.bilingual) {
    var lc = lang.cloneNode(true);
    lc.classList.add('fsm-lang');
    var orig = lang.querySelectorAll('button');
    lc.querySelectorAll('button').forEach(function (bt, i) {
      bt.addEventListener('click', function () {
        if (orig[i]) orig[i].click();
        sync();
      });
    });
    tools.appendChild(lc);
  }
  var close = el('button', 'fsm-close', '<span class="fsm-x" aria-hidden="true"></span><span class="fsm-close-t">' + t(CFG.closeLabel || 'Close') + '</span>');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close menu');
  tools.appendChild(close);
  top.appendChild(tools);
  ov.appendChild(top);

  var scroll = el('div', 'fsm-scroll');
  if (CFG.kicker) scroll.appendChild(el('p', 'fsm-kicker fsm-in', t(CFG.kicker)));

  var list = el('ul', 'fsm-links');
  var here = (location.pathname.split('/').pop() || 'index.html');
  var n = 0;
  nav.querySelectorAll('a').forEach(function (a) {
    if (a.classList.contains('nav-call') || /^tel:/.test(a.getAttribute('href'))) return;
    n++;
    var href = a.getAttribute('href');
    var li = el('li', 'fsm-in');
    var link = el('a', 'fsm-link');
    link.href = href;
    var cur = a.getAttribute('aria-current') === 'page' || (href === here && href.indexOf('#') < 0);
    if (cur) link.setAttribute('aria-current', 'page');
    var desc = CFG.desc && CFG.desc[href];
    link.innerHTML =
      '<span class="fsm-num" aria-hidden="true">' + (n < 10 ? '0' : '') + n + '</span>' +
      '<span class="fsm-label"><span class="fsm-name">' + a.innerHTML + '</span>' +
      (desc ? '<span class="fsm-desc">' + t(desc) + '</span>' : '') + '</span>' +
      (cur ? '<span class="fsm-here">' + t(CFG.hereLabel || 'You’re here') + '</span>'
           : '<span class="fsm-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>');
    li.appendChild(link);
    list.appendChild(li);
  });
  scroll.appendChild(list);

  var acts = el('div', 'fsm-actions fsm-in');
  (CFG.actions || []).forEach(function (x, i) {
    var a = el('a', 'fsm-act' + (i === 0 ? ' fsm-act--main' : ''));
    a.href = x.href;
    if (/^https?:/.test(x.href)) { a.target = '_blank'; a.rel = 'noopener'; }
    a.innerHTML = '<span class="fsm-ico" aria-hidden="true">' + (ICONS[x.icon] || '') + '</span><span>' + t(x.label) + '</span>';
    acts.appendChild(a);
  });
  scroll.appendChild(acts);

  var info = el('div', 'fsm-info fsm-in');
  var st = el('p', 'fsm-status');
  info.appendChild(st);
  (CFG.info || []).forEach(function (row) {
    info.appendChild(el('p', 'fsm-row', '<span class="fsm-row-k">' + t(row.k) + '</span><span class="fsm-row-v">' + t(row.v) + '</span>'));
  });
  scroll.appendChild(info);
  if (CFG.note) scroll.appendChild(el('p', 'fsm-note fsm-in', t(CFG.note)));
  ov.appendChild(scroll);
  document.body.appendChild(ov);

  // stagger index for the entrance animation
  ov.querySelectorAll('.fsm-in').forEach(function (x, i) { x.style.setProperty('--i', i); });

  function sync() {
    var l = document.documentElement.lang === 'es' ? 'es' : 'en';
    var s = statusFor(l);
    st.className = 'fsm-status ' + (s.open ? (s.soon ? 'is-soon' : 'is-open') : 'is-closed');
    st.innerHTML = '<span class="fsm-dot" aria-hidden="true"></span>' + s.text;
  }

  /* ---------- open / close ---------- */
  var lastFocus = null, closing = null;
  function origin() {
    var r = btn.getBoundingClientRect();
    ov.style.setProperty('--ox', (r.left + r.width / 2) + 'px');
    ov.style.setProperty('--oy', (r.top + r.height / 2) + 'px');
  }
  function open() {
    if (closing) { clearTimeout(closing); closing = null; }
    lastFocus = document.activeElement;
    sync();
    origin();
    ov.hidden = false;
    document.documentElement.classList.add('fsm-lock');
    btn.setAttribute('aria-expanded', 'true');
    void ov.offsetWidth; // start transition from the closed state
    ov.classList.add('is-open');
    setTimeout(function () { close.focus({ preventScroll: true }); }, reduce.matches ? 0 : 120);
  }
  function shut(restore) {
    if (ov.hidden) return;
    origin();
    ov.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('fsm-lock');
    closing = setTimeout(function () { ov.hidden = true; closing = null; }, reduce.matches ? 0 : 460);
    if (restore !== false && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  btn.addEventListener('click', function () { ov.hidden || !ov.classList.contains('is-open') ? open() : shut(); });
  close.addEventListener('click', function () { shut(); });
  ov.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    // same-page anchors: close first so the page can scroll
    if (href.indexOf('#') > -1 && (href.split('#')[0] === '' || href.split('#')[0] === here)) shut(false);
  });
  document.addEventListener('keydown', function (e) {
    if (ov.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); shut(); return; }
    if (e.key === 'Tab') {
      var f = Array.prototype.filter.call(ov.querySelectorAll('a[href], button:not([disabled])'), function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // If the window grows past the breakpoint where the button hides, close the menu.
  window.addEventListener('resize', function () {
    if (!ov.hidden && btn.offsetParent === null) shut(false);
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) shut(false); });

})();
