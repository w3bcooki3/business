/* The Conservatory — light line, live open status, next plant swap, menu filters,
   plant care cards, active nav, mobile dock. Hours live in window.SITEMENU.hours. */
(function () {
  'use strict';
  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    var h = (+o.hour) % 24;
    return { y: +o.year, mo: +o.month, d: +o.day, min: h * 60 + (+o.minute), dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday) };
  }
  var now = ny(), t = now.min / 60;
  var DN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function clock(m) { var h = Math.floor(m / 60), mm = m % 60; return ((h % 12) || 12) + (mm ? ':' + ('0' + mm).slice(-2) : '') + (h >= 12 ? ' pm' : ' am'); }

  /* light line (desktop header) */
  document.getElementById('light').textContent =
    t < 6 ? 'Moonlight on the skylights' :
    t < 11 ? 'Morning light through the east windows' :
    t < 15 ? 'High sun under the skylights' :
    t < 18.5 ? 'Golden hour on the fiddle-leaf figs' : 'Evening — lamps on, plants resting';

  /* open / closed */
  var HOURS = (window.SITEMENU && window.SITEMENU.hours) || null;
  if (HOURS) {
    var today = HOURS[now.dow], open = !!(today && now.min >= today[0] && now.min < today[1]), long, short;
    if (open) { long = 'Open now · kitchen until ' + clock(today[1]); short = 'Open · until ' + clock(today[1]); }
    else if (today && now.min < today[0]) { long = 'Opens this morning at ' + clock(today[0]); short = 'Opens ' + clock(today[0]); }
    else {
      var k = 1; while (!HOURS[(now.dow + k) % 7] && k < 7) k++;
      var nd = (now.dow + k) % 7;
      long = 'Closed for the evening · open ' + (k === 1 ? 'tomorrow' : DN[nd]) + ' from ' + clock(HOURS[nd][0]);
      short = 'Opens ' + (k === 1 ? 'tmrw' : DN[nd].slice(0, 3)) + ' ' + clock(HOURS[nd][0]);
    }
    document.querySelectorAll('[data-status]').forEach(function (el) {
      el.textContent = el.hasAttribute('data-short') ? short : long;
      el.classList.toggle('is-open', open);
    });
    document.querySelectorAll('.hours tr[data-days]').forEach(function (tr) {
      if (tr.getAttribute('data-days').split(',').indexOf(String(now.dow)) > -1) tr.classList.add('is-today');
    });
  }

  /* next swap: Sundays 9–11 */
  var add = (7 - now.dow) % 7; if (add === 0 && now.min >= 660) add = 7;
  var d = new Date(Date.UTC(now.y, now.mo - 1, now.d + add));
  var M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('nextSwap').textContent = (add === 0 && now.min >= 540) ? 'The swap is on right now, until 11' : 'Next swap: Sunday, ' + M[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', 9 am';

  /* menu filters */
  var btns = document.querySelectorAll('.filters button'), items = document.querySelectorAll('#items li'), count = document.getElementById('menuCount');
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      var f = b.getAttribute('data-f'), n = 0;
      items.forEach(function (li) {
        var off = f !== 'all' && li.getAttribute('data-t').split(' ').indexOf(f) === -1;
        li.classList.toggle('off', off); if (!off) n++;
      });
      count.textContent = 'Showing ' + n + ' ' + (f === 'all' ? 'items' : f + ' items');
    });
  });

  /* plant care cards */
  document.querySelectorAll('.spec').forEach(function (s) {
    s.addEventListener('click', function () {
      var o = s.getAttribute('aria-expanded') === 'true';
      s.setAttribute('aria-expanded', String(!o));
      document.getElementById(s.getAttribute('aria-controls')).hidden = o;
    });
  });

  if (!('IntersectionObserver' in window)) return;

  /* active section in the desktop nav */
  var links = document.querySelectorAll('.nav a');
  var nio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (a) { if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  links.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) nio.observe(s); });

  /* mobile dock: after the hero buttons scroll away, hidden over Visit + footer */
  var dock = document.getElementById('dock'), seen = { hero: true, visit: false, foot: false };
  function watch(el, key) { new IntersectionObserver(function (es) { seen[key] = es[0].isIntersecting; dock.classList.toggle('is-on', !seen.hero && !seen.visit && !seen.foot); }).observe(el); }
  watch(document.getElementById('heroCta'), 'hero');
  watch(document.getElementById('visit'), 'visit');
  watch(document.querySelector('.foot'), 'foot');

  /* gentle reveals */
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.story h2, .story__cols, .matcha__text, .swap__card, .gallery figure').forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();
