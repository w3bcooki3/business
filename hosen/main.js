(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(function () { document.body.classList.add('is-loaded'); });

  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { y: +o.year, mo: +o.month, d: +o.day, h: (+o.hour) % 24, m: +o.minute, dow: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday] };
  }
  var now = ny();
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DAYS_L = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var open = [0, 3, 4, 5, 6];

  /* ---- Mobile index sheet ---- */
  var sb = document.querySelector('.mbar__btn');
  var sheet = document.getElementById('sheet');
  function setSheet(o) { sheet.hidden = !o; sb.setAttribute('aria-expanded', String(o)); sb.textContent = o ? 'Close' : 'Index'; }
  if (sb) {
    sb.addEventListener('click', function () { setSheet(sheet.hidden); });
    sheet.addEventListener('click', function (e) { if (e.target.closest('a')) setSheet(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) { setSheet(false); sb.focus(); } });
  }

  /* ---- Active index link ---- */
  var links = document.querySelectorAll('.index a');
  if ('IntersectionObserver' in window) {
    var secIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { secIO.observe(s); });
  }

  /* ---- Course procession ---- */
  var items = document.querySelectorAll('#seq li');
  var counter = document.getElementById('seqNow');
  if ('IntersectionObserver' in window && !reduce) {
    items.forEach(function (li) { li.classList.add('dim'); });
    var shown = 0;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !e.target.classList.contains('on')) {
          e.target.classList.add('on'); shown++; counter.textContent = shown; io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -35% 0px' });
    items.forEach(function (li) { io.observe(li); });
  } else if (counter) { counter.textContent = items.length; }

  /* ---- Reveal ---- */
  if ('IntersectionObserver' in window && !reduce) {
    var r = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); r.unobserve(e.target); } }); }, { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('.counter > div, .facts, .chef__text, .sake__list, .rules li, .reserve__intro, .night__text').forEach(function (el) { el.classList.add('reveal'); r.observe(el); });
  }

  /* ---- Reservation request ---- */
  var datesEl = document.getElementById('dates');
  var base = new Date(Date.UTC(now.y, now.mo - 1, now.d));
  var count = 0;
  for (var i = 0; i <= 14; i++) {
    var dt = new Date(base.getTime() + i * 864e5);
    var dow = dt.getUTCDay();
    if (open.indexOf(dow) === -1) continue;
    if (i === 0 && now.h >= 20) continue;
    var label = DAYS_L[dow] + ', ' + MON[dt.getUTCMonth()] + ' ' + dt.getUTCDate();
    var lab = document.createElement('label');
    lab.innerHTML = '<input type="radio" name="date" value="' + label + '"' + (count === 0 ? ' checked' : '') + '><span>' + DAYS[dow] + '<b>' + dt.getUTCDate() + '</b>' + MON[dt.getUTCMonth()] + '</span>';
    datesEl.appendChild(lab);
    count++;
  }

  var form = document.getElementById('req');
  var sum = document.getElementById('summary');
  function val(n) { var el = form.querySelector('[name="' + n + '"]:checked') || form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; }
  function update() {
    var p = val('party');
    sum.classList.remove('err');
    sum.textContent = val('date') + ' · ' + val('time') + ' · ' + p + (p === '1' ? ' guest' : ' guests') + ' · $' + (245 * +p).toLocaleString() + ' before beverage & gratuity';
  }
  form.addEventListener('change', update);
  update();
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = val('name');
    if (!name) { sum.classList.add('err'); sum.textContent = 'Please add the name the seats should be held under.'; form.querySelector('[name="name"]').focus(); return; }
    var body = 'Hello Hōsen,\n\nI would like to request seats:\n\nEvening: ' + val('date') + '\nSeating: ' + val('time') + '\nGuests: ' + val('party') + '\nName: ' + name + '\nNotes: ' + (val('notes') || '—') + '\n\nThank you.';
    location.href = 'mailto:seats@hosen.nyc?subject=' + encodeURIComponent('Seat request — ' + val('date') + ', ' + val('time')) + '&body=' + encodeURIComponent(body);
  });

  /* ---- Tonight note ---- */
  var on = document.getElementById('openNote');
  if (on) {
    if (open.indexOf(now.dow) > -1 && now.h < 23) on.textContent = now.h < 18 ? 'Tonight: first seating at 6:00' : 'Service in progress';
    else on.textContent = 'Dark tonight · next service ' + (now.dow === 1 || now.dow === 2 ? 'Wednesday' : 'tomorrow');
  }
})();
