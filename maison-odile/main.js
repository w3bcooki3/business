/* Maison Odile — open status, "sorti du four", cake builder (prefilled email), glossary, mobile dock.
   Hours live in window.SHOP (index.html). Everything degrades to readable static HTML without JS. */
(function () {
  'use strict';
  var HOURS = (window.SHOP || {}).hours || {};
  var DN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var JRS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var MS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  /* Current date and time in New York, whatever the visitor's time zone. */
  function nyNow() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    var h = (+o.hour) % 24, m = +o.minute;
    return { y: +o.year, mo: +o.month, d: +o.day, h: h, min: h * 60 + m, t: h + m / 60, dow: DN.indexOf(o.weekday) };
  }
  function clock(mins) { var h = Math.floor(mins / 60), m = mins % 60; return ((h % 12) || 12) + (m ? ':' + ('0' + m).slice(-2) : '') + (h >= 12 ? ' pm' : ' am'); }
  function nextOpen(dow) { for (var i = 1; i <= 7; i++) { var d = (dow + i) % 7; if (HOURS[d]) return { d: d, inDays: i }; } return null; }

  var now = nyNow(), today = HOURS[now.dow];
  var isOpen = !!(today && now.min >= today[0] && now.min < today[1]);
  var long, short;
  if (isOpen) { long = 'Ouvert · open until ' + clock(today[1]); short = 'Ouvert'; }
  else if (today && now.min < today[0]) { long = 'Fermé · opens today at ' + clock(today[0]); short = 'Ouvre à ' + (today[0] / 60) + ' h'; }
  else {
    var n = nextOpen(now.dow);
    long = 'Fermé · opens ' + (n.inDays === 1 ? 'tomorrow' : DL[n.d]) + ' at ' + clock(HOURS[n.d][0]);
    short = 'Fermé';
  }
  $$('[data-status]').forEach(function (el) {
    el.classList.add(isOpen ? 'is-open' : 'is-closed');
    var l = $('[data-status-long]', el), s = $('[data-status-short]', el);
    if (l) l.textContent = long;
    if (s) s.textContent = short;
  });
  $$('#hrs tr').forEach(function (tr) {
    if (tr.getAttribute('data-d').split(' ').indexOf(String(now.dow)) > -1) tr.classList.add('is-today');
  });

  /* Viennoiserie: mark what has already left the oven today. */
  if (today && now.min >= today[0] - 60 && now.min < today[1]) {
    var any = false;
    $$('#times li').forEach(function (li) { if (parseFloat(li.dataset.h) <= now.t) { li.classList.add('ready'); any = true; } });
    if (any) $('#timesKey').hidden = false;
  }

  /* ── Cake builder ─────────────────────────────────────────────── */
  var EMAIL = 'commandes@maisonodile.com';
  var steps = $('#steps'), cake = $('#cake'), send = $('#send');

  /* Pickup dates: at least 72 hours out (one more day after noon), open days only. */
  var dates = $('#dates'), start = Date.UTC(now.y, now.mo - 1, now.d) + (3 + (now.h >= 12 ? 1 : 0)) * 864e5, html = '', count = 0;
  for (var k = 0; count < 10 && k < 21; k++) {
    var dt = new Date(start + k * 864e5);
    if (!HOURS[dt.getUTCDay()]) continue;
    var iso = dt.toISOString().slice(0, 10);
    html += '<label><input type="radio" name="date" value="' + iso + '"' + (count ? '' : ' checked') + '>' +
      '<span><small aria-hidden="true">' + JRS[dt.getUTCDay()] + '</small><b aria-hidden="true">' + dt.getUTCDate() + '</b><small aria-hidden="true">' + MS[dt.getUTCMonth()] + '</small>' +
      '<i class="sr">' + JOURS[dt.getUTCDay()] + ' ' + dt.getUTCDate() + ' ' + MOIS[dt.getUTCMonth()] + '</i></span></label>';
    count++;
  }
  dates.innerHTML = html;
  $('#datesHint').hidden = false;
  function frDate(iso) { var d = new Date(iso + 'T12:00:00Z'); return JOURS[d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + MOIS[d.getUTCMonth()]; }
  function val(n) { return $('[name="' + n + '"]:checked', steps); }

  function update() {
    var s = val('size'), sp = val('sponge'), fi = val('filling'), fn = val('finish'), pl = val('plaque'), dt = val('date');
    var total = [s, sp, fi, fn, pl].reduce(function (a, r) { return a + +r.dataset.p; }, 0);
    $('#price').textContent = '$' + total;
    $('#dockPrice').textContent = '$' + total;
    cake.style.setProperty('--w', s.dataset.w + 'px'); cake.style.setProperty('--h', s.dataset.h + 'px');
    cake.style.setProperty('--sp', sp.dataset.c); cake.style.setProperty('--fl', fi.dataset.c); cake.style.setProperty('--tp', fn.dataset.c);
    cake.classList.toggle('has-plaque', !!pl.value);
    var rows = [['Taille', s.value + ' · serves ' + s.dataset.s], ['Biscuit', sp.value], ['Garniture', fi.value], ['Finition', fn.value]];
    if (pl.value) rows.push(['Plaque (+$6)', pl.value]);
    if (dt) rows.push(['Retrait', frDate(dt.value) + ', from noon']);
    var dl = $('#summary'); dl.textContent = '';
    rows.forEach(function (r) {
      var d = document.createElement('div'), a = document.createElement('dt'), b = document.createElement('dd');
      a.textContent = r[0]; b.textContent = r[1]; d.appendChild(a); d.appendChild(b); dl.appendChild(d);
    });
    var body = 'Bonjour Maison Odile,\n\nI would like to order a celebration cake:\n\n' +
      rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') +
      '\nEstimated total: $' + total +
      '\n\nName for the order: \nBest phone number for the deposit call: ' + (pl.value && pl.value.indexOf('own words') > -1 ? '\nWords for the plaque (30 characters max): ' : '') +
      '\n\nMerci !';
    var subj = 'Commande gâteau — ' + s.value + (dt ? ', ' + frDate(dt.value) : '');
    send.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body);
  }
  steps.addEventListener('change', update);
  update();

  /* ── Glossary: one definition panel, no floating tooltips ─────── */
  var words = $$('#words button'), defW = $('#defW'), defT = $('#defT');
  words.forEach(function (w) {
    w.addEventListener('click', function () {
      words.forEach(function (x) { x.setAttribute('aria-pressed', String(x === w)); });
      defW.textContent = w.textContent; defT.textContent = w.dataset.def;
    });
  });

  /* ── Mobile dock: status + call + directions; switches to the cake total inside the builder ── */
  var dock = $('#dock'), base = $('.dock__base', dock), cakeBar = $('.dock__cake', dock);
  if ('IntersectionObserver' in window) {
    var st = { heroOut: false, footIn: false, steps: false, ticket: false };
    var render = function () {
      var cakeMode = st.steps && !st.ticket;
      base.hidden = cakeMode; cakeBar.hidden = !cakeMode;
      dock.classList.toggle('is-on', st.heroOut && !st.footIn && !st.ticket);
    };
    var watch = function (el, key, opts, invert) {
      new IntersectionObserver(function (es) { st[key] = invert ? !es[0].isIntersecting : es[0].isIntersecting; render(); }, opts).observe(el);
    };
    watch($('.hero'), 'heroOut', { rootMargin: '-120px 0px 0px 0px' }, true);
    watch($('.foot'), 'footIn', {});
    watch(steps, 'steps', { rootMargin: '0px 0px -30% 0px' });
    watch($('#ticket'), 'ticket', { rootMargin: '0px 0px -25% 0px' });
  }

  /* Gentle reveal on scroll (skipped with reduced motion). */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.sec, .odile__txt, .visit__col').forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();
