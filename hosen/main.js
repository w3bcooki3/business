/* Hōsen — page behaviour. Vanilla JS, no dependencies.
   Service days live in OPEN_DAYS (0 = Sunday) and in the JSON-LD, footer copy and SITEMENU.hours in index.html. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var OPEN_DAYS = [0, 3, 4, 5, 6];
  var PRICE = 245, MAX_PARTY = 4, BOOK_AHEAD = 14;
  var EMAIL = 'seats@hosen.nyc', SMS = '+12125550177';
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DAYS_L = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  requestAnimationFrame(function () { document.body.classList.add('is-loaded'); });

  /* ---- New York clock ---- */
  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { y: +o.year, mo: +o.month, d: +o.day, h: (+o.hour) % 24, m: +o.minute, dow: DAYS.indexOf(o.weekday) };
  }
  var now = ny();

  /* ---- Tonight line (side index, mobile bar, footer) ---- */
  (function () {
    var t = now.h * 60 + now.m, serviceDay = OPEN_DAYS.indexOf(now.dow) > -1, long, short, live = false;
    if (serviceDay && t < 18 * 60) { long = 'Tonight · seatings 6:00 & 8:45'; short = 'Tonight 6:00 · 8:45'; }
    else if (serviceDay && t < 20 * 60 + 45) { long = 'Service in progress · next seating 8:45'; short = 'In service · 8:45 next'; live = true; }
    else if (serviceDay && t < 23 * 60) { long = 'Second seating in progress'; short = 'In service'; live = true; }
    else {
      var k = 1; while (OPEN_DAYS.indexOf((now.dow + k) % 7) === -1) k++;
      var next = k === 1 ? 'tomorrow' : DAYS_L[(now.dow + k) % 7];
      long = (serviceDay ? 'Closed for tonight' : 'Dark tonight') + ' · next service ' + next;
      short = 'Next: ' + (k === 1 ? 'tomorrow' : DAYS[(now.dow + k) % 7]) + ' 6:00';
    }
    document.querySelectorAll('[data-tonight]').forEach(function (el) {
      el.textContent = el.hasAttribute('data-short') ? short : long;
      el.classList.toggle('is-open', live);
    });
  })();

  /* ---- Active link in the side index ---- */
  var links = document.querySelectorAll('.index a');
  if ('IntersectionObserver' in window) {
    var secIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + e.target.id;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { secIO.observe(s); });
  }

  /* ---- Course procession: pieces "arrive" as you scroll ---- */
  if ('IntersectionObserver' in window && !reduce) {
    var items = document.querySelectorAll('#seq li');
    items.forEach(function (li) { li.classList.add('dim'); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -30% 0px' });
    items.forEach(function (li) { io.observe(li); });
  }

  /* ---- Reveal ---- */
  if ('IntersectionObserver' in window && !reduce) {
    var r = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); r.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('.counter__text, .facts, .chef__text, .sake__list, .rules li, .reserve__intro, .night__text').forEach(function (el) {
      el.classList.add('reveal'); r.observe(el);
    });
  }

  /* ---- Seat request builder: buttons compose a mailto / sms link (no form, no personal data collected) ---- */
  var datesEl = document.getElementById('dates');
  if (!datesEl) return;
  var state = { date: null, time: '6:00 pm', party: 2 };
  var base = Date.UTC(now.y, now.mo - 1, now.d);
  for (var i = 0; i <= BOOK_AHEAD; i++) {
    var dt = new Date(base + i * 864e5), dow = dt.getUTCDay();
    if (OPEN_DAYS.indexOf(dow) === -1) continue;
    if (i === 0 && now.h >= 20) continue; // too late to ask for tonight
    var b = document.createElement('button');
    b.type = 'button';
    b.dataset.date = DAYS_L[dow] + ', ' + MON[dt.getUTCMonth()] + ' ' + dt.getUTCDate();
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = '<span>' + (i === 0 ? 'Tonight' : DAYS[dow]) + '</span> <b>' + dt.getUTCDate() + '</b> <span>' + MON[dt.getUTCMonth()] + '</span>';
    datesEl.appendChild(b);
  }

  function press(group, btn) {
    group.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === btn)); });
  }
  datesEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    press(datesEl, b); state.date = b.dataset.date; update();
  });
  var seg = document.querySelector('.seg');
  seg.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    press(seg, b); state.time = b.dataset.time; update();
  });
  var minus = document.querySelector('[data-step="-1"]'), plus = document.querySelector('[data-step="1"]');
  var partyEl = document.getElementById('party');
  function step(d) {
    state.party = Math.min(MAX_PARTY, Math.max(1, state.party + d)); update();
    if (document.activeElement && document.activeElement.disabled) (d > 0 ? minus : plus).focus(); // keep keyboard focus
  }
  minus.addEventListener('click', function () { step(-1); });
  plus.addEventListener('click', function () { step(1); });

  var first = datesEl.querySelector('button');
  if (first) { press(datesEl, first); state.date = first.dataset.date; }

  var line = document.getElementById('sumLine'), price = document.getElementById('sumPrice');
  var mail = document.getElementById('sendMail'), sms = document.getElementById('sendSms');
  function update() {
    var guests = state.party + (state.party === 1 ? '\u00a0guest' : '\u00a0guests');
    partyEl.innerHTML = '<b>' + state.party + '</b>' + (state.party === 1 ? ' guest' : ' guests');
    minus.disabled = state.party <= 1;
    plus.disabled = state.party >= MAX_PARTY;
    line.textContent = (state.date || 'Choose an evening') + ' · ' + state.time + ' · ' + guests;
    price.textContent = '$' + (PRICE * state.party).toLocaleString('en-US') + ' omakase for ' + guests + ', before beverage & gratuity';
    var req = 'Evening: ' + state.date + '\nSeating: ' + state.time + '\nGuests: ' + state.party;
    var body = 'Hello Hōsen,\n\nI would like to request seats at the counter.\n\n' + req +
      '\n\nName for the booking: \nPhone: \nAllergies or occasion: \n\nThank you.';
    mail.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Seat request — ' + state.date + ', ' + state.time) + '&body=' + encodeURIComponent(body);
    sms.href = 'sms:' + SMS + '?&body=' + encodeURIComponent('Seat request for Hōsen — ' + state.date + ', ' + state.time + ', ' + guests + '. Name: ');
  }
  update();
})();
