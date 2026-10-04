/* Concept 02 · Wycinanki Poster */
(function () {
  var L = window.KowalLive, K = L.K, B = L.B, esc = L.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  L.bindStatic();
  $$('.js-mailto').forEach(function (a) { a.href = 'mailto:' + B.email; });

  // Menu bands
  var bandClass = { rye: 'band--rye', sweet: 'band--sweet', weekend: 'band--weekend' };
  $('.js-menu').innerHTML = K.menu.map(function (g) {
    return '<section class="band ' + bandClass[g.id] + ' reveal" aria-labelledby="b-' + g.id + '">' +
      '<div class="band__label"><svg class="band__icon" aria-hidden="true"><use href="#rosette"/></svg>' +
      '<div><h3 id="b-' + g.id + '" class="band__title">' + esc(g.title) + '</h3><p class="band__lede">' + esc(g.lede) + '</p></div></div>' +
      '<ul class="items">' + g.items.map(function (i) {
        return '<li class="item' + (i.star ? ' item--star' : '') + '"><span class="item__name">' + esc(i.name) + '</span>' +
          '<span class="item__price">$' + esc(i.price) + '</span><span class="item__gloss">' + esc(i.gloss) +
          (i.star ? ' · the house loaf' : '') + '</span></li>';
      }).join('') + '</ul></section>';
  }).join('');

  $('.js-story').innerHTML = B.story.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
  $('.js-standing').innerHTML = K.standingOrders.map(function (s) { return '<li><h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p></li>'; }).join('');
  $('.js-transit').innerHTML = B.transit.map(function (t) { return '<li><b>' + esc(t.line) + '</b>' + esc(t.text) + '</li>'; }).join('');
  $('.js-hours-summary').textContent = L.hoursSummary().join(' · ');

  var lastDate = null;
  L.onTick(function (now) {
    var st = L.storeStatus(now);
    $$('.js-dot').forEach(function (d) { d.classList.toggle('dot--open', st.open); });
    $$('.js-status-line').forEach(function (e) { e.textContent = st.label + ', ' + st.detail; });

    // Sticker: what just came out, or what's next.
    var s = L.buildSheet(now), main, bot;
    if (s.isToday && s.freshest) { main = s.freshest.item; bot = 'just came out'; }
    else if (s.isToday && s.next) { main = s.next.item; bot = 'out at ' + L.formatTime(s.next.time); }
    else { main = s.rows[0].item; bot = (s.weekday === (now.weekday + 1) % 7 ? 'tomorrow ' : L.DAYS[s.weekday] + ' ') + L.formatTime(s.rows[0].time); }
    $('.js-sticker-main').textContent = main;
    $('.js-sticker-bot').textContent = bot;

    if (now.isoDate === lastDate) return;
    var first = lastDate === null;
    lastDate = now.isoDate;

    // Holiday posters
    $('.js-posters').innerHTML = L.upcomingOrders(now).map(function (o, i) {
      var closed = o.daysToOrder < 0;
      return '<li class="poster reveal' + (i === 0 ? ' is-next' : '') + '">' +
        '<div class="poster__top"><span>' + L.formatDate(o.date, { weekday: 'long' }) + '</span><span class="poster__flag">Next up</span></div>' +
        '<p class="poster__day">' + L.formatDate(o.date, { day: 'numeric' }) + '</p>' +
        '<p class="poster__month">' + L.formatDate(o.date, { month: 'long' }) + '</p>' +
        '<svg class="poster__tulip" aria-hidden="true"><use href="#tulip"/></svg>' +
        '<h3 class="poster__name" lang="pl">' + esc(o.name) + '</h3><p class="poster__en">' + esc(o.english) + '</p>' +
        '<p class="poster__items">' + esc(o.items) + '</p>' +
        '<p class="poster__deadline">' + (closed ? '<span>Orders closed</span><span>Walk-ins only</span>'
          : '<span>Order by ' + L.formatDate(o.orderBy) + '</span><span>' + L.countdown(o.daysTo) + '</span>') + '</p></li>';
    }).join('');

    $('.js-mornings').textContent = L.daysBetween(B.founded.starterBorn, now.isoDate).toLocaleString('en-US');

    $('.js-hours').innerHTML = [1, 2, 3, 4, 5, 6, 0].map(function (d) {
      var h = L.hoursFor(d);
      return '<tr' + (d === now.weekday ? ' class="is-today" aria-current="date"' : '') + '><th scope="row">' + h.label + '</th><td>' +
        (h.open ? L.formatTime(h.open, { suffix: true, compact: true }) + ' – ' + L.formatTime(h.close, { suffix: true, compact: true })
          : 'Closed<small>' + esc(h.note || '') + '</small>') + '</td></tr>';
    }).join('');
    if (first) L.reveal('.reveal');
  });

  L.menu($('.menu-btn'), $('#menu'), $('.menu__close'));

  // The hero rosette turns slowly as you scroll, like a paper cut on a string.
  var spin = $('.js-spin');
  if (spin && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var ticking = false;
    addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        spin.style.rotate = (scrollY * 0.06) + 'deg';
        ticking = false;
      });
    }, { passive: true });
  }
})();
