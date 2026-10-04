/* Concept 01 · Bake Sheet — renders the live parts from shared/data.js */
(function () {
  var L = window.KowalLive, K = L.K, B = L.B, esc = L.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var SCORE = '<svg class="score" viewBox="0 0 30 16" aria-hidden="true"><path d="M3 14 L9 2 M12 14 L18 2 M21 14 L27 2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  var stampId = 0;

  /** Circular rubber stamp as inline SVG. */
  function stamp(center, sub, ring) {
    var id = 'st' + (stampId++);
    ring = ring || 'KOWAL I CÓRKA · PIEKARNIA · GREENPOINT · ';
    return '<svg class="stamp" viewBox="0 0 200 200" aria-hidden="true"><defs>' +
      '<path id="r-' + id + '" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0"/>' +
      '<filter id="f-' + id + '" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="3" result="n"/>' +
      '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.25" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter></defs>' +
      '<g filter="url(#f-' + id + ')" fill="currentColor" stroke="currentColor">' +
      '<circle cx="100" cy="100" r="94" fill="none" stroke-width="4"/><circle cx="100" cy="100" r="56" fill="none" stroke-width="2"/>' +
      '<text class="stamp__ring" font-size="15" stroke="none"><textPath href="#r-' + id + '" textLength="446" lengthAdjust="spacing">' + esc(ring) + '</textPath></text>' +
      '<text x="100" y="' + (sub ? 104 : 114) + '" text-anchor="middle" class="stamp__center" font-size="' + (center.length > 4 ? 30 : 40) + '" stroke="none">' + esc(center) + '</text>' +
      (sub ? '<text x="100" y="128" text-anchor="middle" class="stamp__sub" font-size="13" letter-spacing="2" stroke="none">' + esc(sub) + '</text>' : '') +
      '</g></svg>';
  }

  /* ---------- things that never change ---------- */
  L.bindStatic();
  $$('.js-mailto').forEach(function (a) { a.href = 'mailto:' + B.email; });
  var closed = B.hours.filter(function (h) { return !h.open; }).map(function (h) { return h.label + 's'; });
  $('.strip__muted').textContent = closed.length ? 'Closed ' + closed.join(' & ') : '';
  $('.js-hold').textContent = B.holdPolicy;
  $('.js-footer-stamp').innerHTML = stamp('K&D', String(B.founded.year));

  // Menu
  function priceList(group, size) {
    return '<section class="prices prices--' + size + ' reveal" aria-labelledby="menu-' + group.id + '">' +
      '<h3 id="menu-' + group.id + '" class="prices__title">' + esc(group.title) + '</h3>' +
      '<p class="prices__lede">' + esc(group.lede) + '</p><ul class="prices__list">' +
      group.items.map(function (i) {
        return '<li class="prices__row"><span class="prices__name">' + esc(i.name) +
          (i.star ? '<span class="prices__star" title="The one we’re known for">' + SCORE + '<span class="sr-only">(house loaf)</span></span>' : '') +
          '</span><span class="prices__leader" aria-hidden="true"></span><span class="prices__price">$' + esc(i.price) + '</span>' +
          '<span class="prices__gloss">' + esc(i.gloss) + '</span></li>';
      }).join('') + '</ul></section>';
  }
  $('.js-menu-main').innerHTML = priceList(K.menu[0], 'lg');
  $('.js-menu-side').innerHTML = K.menu.slice(1).map(function (g) { return priceList(g, 'sm'); }).join('');

  // Story
  $('.js-story').innerHTML = B.story.map(function (p, i) { return '<p' + (i === 0 ? ' class="starter__drop"' : '') + '>' + esc(p) + '</p>'; }).join('') +
    '<p class="starter__sign">Teresa &amp; Ania</p>';

  // Standing orders + transit
  $('.js-standing').innerHTML = K.standingOrders.map(function (s) {
    return '<li><h3 class="standing__title">' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p></li>';
  }).join('');
  $('.js-transit').innerHTML = B.transit.map(function (t) {
    return '<li><span class="transit__line' + (t.line === 'G' ? ' is-g' : '') + '">' + esc(t.line) + '</span>' + esc(t.text) + '</li>';
  }).join('');
  $('.js-hours-summary').innerHTML = L.hoursSummary().map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('');

  /* ---------- live parts, refreshed every 30 s ---------- */
  var stampFor = null;
  L.onTick(function (now) {
    var st = L.storeStatus(now);
    $$('.js-dot').forEach(function (d) { d.classList.toggle('dot--open', st.open); });
    $$('.js-status').forEach(function (e) { e.textContent = st.label; });
    $$('.js-status-detail').forEach(function (e) { e.textContent = st.detail; });
    $$('.js-status-line').forEach(function (e) { e.textContent = st.label + ', ' + st.detail; });
    $('.js-hours-status').classList.toggle('is-open', st.open);
    $('.js-date').textContent = L.formatDate(now.isoDate, { weekday: 'long', month: 'long', day: 'numeric' });

    // Ticket
    var s = L.buildSheet(now), h = L.hoursFor(s.weekday);
    var short = function (t) { return L.formatTime(t, { suffix: true, compact: true }); };
    $('.js-ticket-no').textContent = 'Bake sheet · No. ' + String(now.day).padStart(2, '0') + String(now.month).padStart(2, '0');
    $('.js-ticket-day').textContent = s.isToday ? 'Today' : L.DAYS[s.weekday];
    $('.js-ticket-hours').textContent = short(h.open) + '–' + short(h.close);
    var nowLabel = L.formatTime(L.minutesToHHMM(now.minutes), { suffix: true });
    $('.js-ticket-now').textContent = s.isToday
      ? 'It’s ' + nowLabel + ' in Greenpoint. ' + (s.freshest ? 'The ' + s.freshest.item.toLowerCase() + ' just came out.' : 'Here’s where the ovens are.')
      : 'We’re closed right now. Here’s ' + (s.weekday === (now.weekday + 1) % 7 ? 'tomorrow' : L.DAYS[s.weekday]) + '’s bake.';
    $('.js-ticket-rows').innerHTML = s.rows.map(function (r) {
      return '<li class="ticket__row is-' + r.status + '"><time class="ticket__time" datetime="' + r.time + '">' + L.formatTime(r.time) + '</time>' +
        '<span class="ticket__item"><span class="ticket__name">' + esc(r.item) + '</span><span class="ticket__gloss">' + esc(r.gloss) + (r.note ? ' · ' + esc(r.note) : '') + '</span></span>' +
        '<span class="ticket__status">' + L.STATUS[r.status] + '</span></li>';
    }).join('');
    if (stampFor !== s.isToday) {
      stampFor = s.isToday;
      $('.js-ticket-stamp').innerHTML = s.isToday ? stamp('FRESH', 'DZIŚ') : stamp('K&D', '');
    }

    // Starter
    var mornings = L.daysBetween(B.founded.starterBorn, now.isoDate).toLocaleString('en-US');
    $$('.js-mornings').forEach(function (e) { e.textContent = mornings; });

    // Calendar
    var up = L.upcomingOrders(now);
    $('.js-calendar').innerHTML = up.map(function (o, i) {
      var closedOrders = o.daysToOrder < 0;
      return '<li class="calendar__row' + (i === 0 ? ' is-next' : '') + '">' +
        '<time class="calendar__date" datetime="' + o.date + '"><span class="calendar__month">' + L.formatDate(o.date, { month: 'short' }) + '</span>' +
        '<span class="calendar__day">' + L.formatDate(o.date, { day: 'numeric' }) + '</span></time>' +
        '<div class="calendar__body"><h3 class="calendar__name">' + esc(o.name) + ' <span class="calendar__en">' + esc(o.english) + '</span></h3>' +
        '<p class="calendar__items">' + esc(o.items) + '</p></div>' +
        '<p class="calendar__deadline">' + (closedOrders ? 'Orders closed · walk-ins only'
          : 'Order by <strong>' + L.formatDate(o.orderBy) + '</strong><span class="calendar__count">' + L.countdown(o.daysTo) + '</span>') + '</p>' +
        (i === 0 ? '<div class="calendar__stamp">' + stamp('NEXT', 'UP', 'ZAMÓWIENIA · ORDERS · ZAMÓWIENIA · ORDERS · ') + '</div>' : '') +
        '</li>';
    }).join('');

    // Hours table
    $('.js-hours').innerHTML = [1, 2, 3, 4, 5, 6, 0].map(function (d) {
      var x = L.hoursFor(d), today = d === now.weekday;
      return '<tr' + (today ? ' class="is-today" aria-current="date"' : '') + '><th scope="row">' + x.label +
        (today ? '<span class="hours__today">Today</span>' : '') + '</th><td>' +
        (x.open ? L.formatTime(x.open, { suffix: true }) + ' – ' + L.formatTime(x.close, { suffix: true })
          : '<span class="hours__closed">Closed <span class="hours__note">' + esc(x.note || '') + '</span></span>') + '</td></tr>';
    }).join('');
  });

  /* ---------- behaviour ---------- */
  L.menu($('.index-toggle'), $('#index-sheet'), $('.sheet__close'));
  L.reveal('.reveal');

  // Highlight the section in view in the index nav.
  if ('IntersectionObserver' in window) {
    var links = $$('.index a');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['today', 'counter', 'starter', 'order', 'visit'].forEach(function (id) { io.observe(document.getElementById(id)); });
  }
})();
