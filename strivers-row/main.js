/* Strivers Row Barbers — page behaviour (no dependencies). */
(function () {
  'use strict';

  var PHONE = '+12125550149', EMAIL = 'book@striversrowbarbers.com';
  /* opening hours in minutes after midnight, New York time. 0 = Sunday, Monday closed */
  var HOURS = { 0: [660, 960], 2: [600, 1200], 3: [600, 1200], 4: [600, 1200], 5: [600, 1200], 6: [480, 1140] };
  var DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var IMG = 'https://images.unsplash.com/photo-';

  function $(id) { return document.getElementById(id); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { m: ((+o.hour) % 24) * 60 + (+o.minute), dow: SHORT.indexOf(o.weekday) };
  }
  function clock(m) { var h = Math.floor(m / 60), mm = m % 60; return ((h % 12) || 12) + (mm ? ':' + ('0' + mm).slice(-2) : '') + (h >= 12 ? ' pm' : ' am'); }
  function smsHref(body) { return 'sms:' + PHONE + '?&body=' + encodeURIComponent(body); }

  var now = ny();
  var openNow = !!(HOURS[now.dow] && now.m >= HOURS[now.dow][0] && now.m < HOURS[now.dow][1]);

  /* ── Open status ─────────────────────────────────────────── */
  function nextOpen() {
    for (var k = 0; k < 7; k++) {
      var d = (now.dow + k) % 7, h = HOURS[d];
      if (h && (k > 0 || now.m < h[0])) return { k: k, d: d, h: h };
    }
  }
  (function status() {
    var h = HOURS[now.dow], txt, today;
    if (openNow) txt = 'Open now · until ' + clock(h[1]);
    else { var n = nextOpen(); txt = 'Closed · opens ' + (n.k === 0 ? 'today' : n.k === 1 ? 'tomorrow' : DAY[n.d]) + ' ' + clock(n.h[0]); }
    $('liveTxt').textContent = txt;
    $('live').classList.toggle('is-open', openNow);
    today = h ? 'Today ' + clock(h[0]) + '–' + clock(h[1]) + (now.dow === 0 ? ' · appointments' : '') : 'Closed Mondays · open Tue 10 am';
    $('todayHrs').textContent = (openNow ? '● ' : '') + today;
    each(document.querySelectorAll('#hrs li'), function (li) {
      if (li.dataset.d.split(',').indexOf(String(now.dow)) > -1) li.classList.add('is-today');
    });
  })();

  /* ── Barbers ─────────────────────────────────────────────── */
  var B = [
    { n: 'Andre Wallace', s: 'Skin fades', ig: 'andre.cuts.uptown', days: 'Tue–Sat', dd: [2, 3, 4, 5, 6], img: '1593702275687-f8b402bf1fb5', alt: 'A close-up of a skin fade being blended with clippers', bio: 'Fourteen years in, trained in the Bronx, taught half the barbers on this block how to blend. If it starts at zero and ends somewhere beautiful, it’s Andre’s.' },
    { n: 'Keisha Monroe', s: 'Tapers & sponge twists', ig: 'keishamonroe.barber', days: 'Tue–Fri, Sun', dd: [0, 2, 3, 4, 5], img: '1622286342621-4bd786c2447c', alt: 'The back of a client’s head showing a clean textured crop', bio: 'The patient hand for texture. Twists that hold, tapers that grow out right, and the honest product advice nobody else gives you.' },
    { n: 'Rafael “Rafa” Peña', first: 'Rafa', s: 'Beard sculpting', ig: 'rafa.beardwork', days: 'Wed–Sat', dd: [3, 4, 5, 6], img: '1599351431202-1e0f0137899a', alt: 'A barber trimming and combing a beard', bio: 'Dominican, from Washington Heights. Straight-razor lines, beard shaping that respects your face, hot towels like his uncle’s shop in Santiago.' },
    { n: 'Jamal Okeke', s: 'Designs & hard parts', ig: 'jamal.lines', days: 'Thu–Sat', dd: [4, 5, 6], img: '1598524374912-6b0b0bab43dd', alt: 'A finishing spray being applied to a styled haircut', bio: 'Freehand designs, geometric parts, the occasional portrait on the back of someone’s head for a birthday. Bring a reference; he’ll improve it.' },
    { n: 'Tasha Greene', s: 'Kids & first cuts', ig: 'tasha.littlecuts', days: 'Tue–Sat', dd: [2, 3, 4, 5, 6], img: '1584316712724-f5d4b188fee2', alt: 'A smiling man in a coat against a bright yellow wall', bio: 'Mother of three, unshakeable. Booster seat, cartoon on the tablet, a lollipop after. Grown men also request her because she doesn’t rush.' },
    { n: 'Marcus Bell', s: 'Locs maintenance', ig: 'striversrowbarbers', days: 'Sat–Sun', dd: [0, 6], img: '1567894340315-735d7c361db0', alt: 'A barber cutting a client’s textured hair in a warm shop', bio: 'The owner, still cutting on weekends. Retwists, interlocking and the scalp-care routine that keeps locs healthy for decades.' }
  ];
  B.forEach(function (b) { if (!b.first) b.first = b.n.split(' ')[0]; });

  var tabs = $('barbers'), current = 0;
  B.forEach(function (b, i) {
    var t = document.createElement('button');
    t.className = 'rb'; t.type = 'button'; t.id = 'tab' + i;
    t.setAttribute('role', 'tab'); t.setAttribute('aria-controls', 'profile');
    t.innerHTML = '<small>0' + (i + 1) + '</small><b>' + b.first + '</b><span>' + b.s + '</span>';
    t.addEventListener('click', function () { show(i); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, j = null;
      if (k === 'ArrowDown' || k === 'ArrowRight') j = (i + 1) % B.length;
      if (k === 'ArrowUp' || k === 'ArrowLeft') j = (i - 1 + B.length) % B.length;
      if (k === 'Home') j = 0;
      if (k === 'End') j = B.length - 1;
      if (j !== null) { e.preventDefault(); show(j, true); }
    });
    tabs.appendChild(t);
  });
  function show(i, focus) {
    var b = B[i], profile = $('profile'); current = i;
    each(tabs.children, function (x, j) {
      x.setAttribute('aria-selected', String(j === i)); x.tabIndex = j === i ? 0 : -1;
      if (j === i) {
        if (focus) x.focus();
        /* keep the active chip in view inside the horizontal rail (mobile) without scrolling the page */
        if (tabs.scrollWidth > tabs.clientWidth) {
          var l = x.offsetLeft - tabs.offsetLeft, r = l + x.offsetWidth;
          if (l < tabs.scrollLeft) tabs.scrollLeft = l - 16;
          else if (r > tabs.scrollLeft + tabs.clientWidth) tabs.scrollLeft = r - tabs.clientWidth + 16;
        }
      }
    });
    profile.setAttribute('aria-labelledby', 'tab' + i);
    profile.classList.remove('swap'); void profile.offsetWidth; profile.classList.add('swap');
    var img = $('pImg'), base = IMG + b.img + '?auto=format&fit=crop&q=75';
    img.src = base + '&w=800&h=1000';
    img.srcset = base + '&w=500&h=625 500w, ' + base + '&w=800&h=1000 800w, ' + base + '&w=1100&h=1375 1100w';
    img.sizes = '(min-width: 1100px) 30vw, (min-width: 700px) 40vw, 100vw';
    img.alt = b.alt;
    $('pFig').setAttribute('data-no', '0' + (i + 1));
    $('pNo').textContent = 'Chair ' + (i + 1);
    $('pName').textContent = b.n;
    $('pSpec').textContent = b.s;
    $('pBio').textContent = b.bio;
    $('pDays').textContent = b.days + (b.dd.indexOf(now.dow) > -1 ? ' · in today' : '');
    var ig = $('pIg'); ig.textContent = '@' + b.ig; ig.href = 'https://www.instagram.com/' + b.ig + '/';
    var sms = $('pSms');
    sms.textContent = 'Text ' + b.first;
    sms.href = smsHref('Hi, I’d like to book with ' + b.first + ' (' + b.s.toLowerCase() + '). What do you have this week?');
    $('pBook').textContent = 'Book with ' + b.first;
  }
  show(0);
  $('pBook').addEventListener('click', function () { pick('bar', current + 1); });

  /* ── Walk-in board (from the schedule, not live) ─────────── */
  var board = $('wkBoard');
  var boardDay = HOURS[now.dow] && now.m < HOURS[now.dow][1] ? now.dow : nextOpen().d;
  $('wkWhen').textContent = boardDay === now.dow ? 'Today' : DAY[boardDay];
  B.forEach(function (b, i) {
    var inDay = b.dd.indexOf(boardDay) > -1, walk = (i === 1 || i === 4);
    var st = !inDay ? ['Off', 'off'] : boardDay === 0 ? ['Appts', 'in'] : walk ? ['Walk-in chair', 'free'] : ['By appt', 'in'];
    var row = document.createElement('li');
    row.className = 'wk__row';
    row.innerHTML = '<i>0' + (i + 1) + '</i><b>' + b.first + '<small>' + b.s + '</small></b><span class="' + st[1] + '">' + st[0] + '</span>';
    board.appendChild(row);
  });

  /* ── Booking builder ─────────────────────────────────────── */
  var SVC = [];
  each(document.querySelectorAll('#svc li'), function (li) {
    SVC.push({ n: li.querySelector('h3').textContent, p: li.querySelector('b').textContent });
  });
  var BAR = [{ n: 'First available', first: 'First available', dd: [0, 2, 3, 4, 5, 6] }].concat(B);
  var DAYS_BOOK = [2, 3, 4, 5, 6, 0];
  var TIMES = ['Morning', 'Afternoon', 'Evening'];
  var sel = { svc: 1, bar: 0, day: null, time: 1 };

  function chipGroup(el, items, key, label) {
    items.forEach(function (it, i) {
      var c = document.createElement('button');
      c.type = 'button'; c.className = 'chip'; c.dataset.i = i;
      c.innerHTML = label(it);
      c.addEventListener('click', function () { pick(key, i); });
      el.appendChild(c);
    });
  }
  chipGroup($('cSvc'), SVC, 'svc', function (s) { return '<span>' + s.n + '</span><small>' + s.p + '</small>'; });
  chipGroup($('cBar'), BAR, 'bar', function (b) { return '<span>' + b.first + '</span>'; });
  chipGroup($('cDay'), DAYS_BOOK, 'day', function (d) { return '<span>' + SHORT[d] + '</span>'; });
  chipGroup($('cTime'), TIMES, 'time', function (t) { return '<span>' + t + '</span>'; });

  /* first bookable day: today if still open, else the next open day */
  var firstDay = HOURS[now.dow] && now.m < HOURS[now.dow][1] - 60 ? now.dow : nextOpen().d;
  sel.day = DAYS_BOOK.indexOf(firstDay);

  function pick(key, i) { sel[key] = i; render(); }
  function setGroup(el, idx) {
    each(el.children, function (c, j) { c.setAttribute('aria-pressed', String(j === idx)); });
  }
  function render() {
    var bar = BAR[sel.bar], note = '';
    /* days the chosen barber works */
    each($('cDay').children, function (c, j) {
      var ok = bar.dd.indexOf(DAYS_BOOK[j]) > -1;
      c.disabled = !ok; c.title = ok ? '' : bar.first + ' is off ' + DAY[DAYS_BOOK[j]] + 's';
    });
    if (bar.dd.indexOf(DAYS_BOOK[sel.day]) < 0) {
      var j = 0; while (bar.dd.indexOf(DAYS_BOOK[j]) < 0) j++;
      note = bar.first + ' cuts ' + bar.days + ' — moved you to ' + DAY[DAYS_BOOK[j]] + '.';
      sel.day = j;
    } else if (sel.bar > 0) note = bar.first + ' cuts ' + bar.days + '.';
    var day = DAYS_BOOK[sel.day];
    /* Sunday closes at 4: no evenings */
    var evening = $('cTime').children[2];
    evening.disabled = day === 0; evening.title = day === 0 ? 'Sundays close at 4 pm' : '';
    if (day === 0 && sel.time === 2) { sel.time = 1; note += (note ? ' ' : '') + 'Sundays close at 4, so afternoon it is.'; }
    if (day === 0) note += (note ? ' ' : '') + 'Sunday is appointments only.';
    setGroup($('cSvc'), sel.svc); setGroup($('cBar'), sel.bar); setGroup($('cDay'), sel.day); setGroup($('cTime'), sel.time);
    $('dayNote').textContent = note;

    var s = SVC[sel.svc];
    var who = sel.bar === 0 ? 'whoever’s free' : bar.first;
    var msg = 'Hi Strivers Row — I’d like to book a ' + s.n + ' (' + s.p + ') with ' + who + ', ' + DAY[day] + ' ' + TIMES[sel.time].toLowerCase() + '. Name: ';
    $('bMsg').textContent = msg + '…';
    $('bSms').href = smsHref(msg);
    $('bMail').href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Booking request — ' + s.n + ', ' + DAY[day]) + '&body=' + encodeURIComponent(msg);
  }
  render();

  /* ── Mobile menu ─────────────────────────────────────────── */
  var mb = document.querySelector('.menu-btn'), full = $('full'), mast = $('mast');
  var outside = [document.querySelector('main'), document.querySelector('.foot'), $('dock')];
  function setFull(o, restore) {
    if (o) document.documentElement.style.setProperty('--mast-h', mast.getBoundingClientRect().height + 'px');
    full.hidden = !o;
    mb.setAttribute('aria-expanded', String(o));
    mb.querySelector('.menu-btn__l').textContent = o ? 'Close' : 'Menu';
    document.documentElement.classList.toggle('lock', o);
    outside.forEach(function (el) { if (o) el.setAttribute('inert', ''); else el.removeAttribute('inert'); });
    if (o) full.querySelector('a').focus();
    else if (restore) mb.focus();
  }
  mb.addEventListener('click', function () { setFull(full.hidden, true); });
  full.addEventListener('click', function (e) { if (e.target.closest('a[href^="#"]')) setFull(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !full.hidden) setFull(false, true); });
  matchMedia('(min-width: 1100px)').addEventListener('change', function (q) { if (q.matches && !full.hidden) setFull(false); });
  mast.addEventListener('click', function (e) { if (!full.hidden && e.target.closest('a[href^="#"]')) setFull(false); });

  /* ── Dock: show after the cover, hide at the footer ──────── */
  if ('IntersectionObserver' in window) {
    var dock = $('dock'), coverVis = true, footVis = false;
    function sync() { dock.classList.toggle('is-on', !coverVis && !footVis); }
    new IntersectionObserver(function (es) { coverVis = es[0].isIntersecting; sync(); }).observe(document.querySelector('.cover'));
    new IntersectionObserver(function (es) { footVis = es[0].isIntersecting; sync(); }).observe(document.querySelector('.foot'));
  }

  /* ── Reveal ──────────────────────────────────────────────── */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    each(document.querySelectorAll('.svc li, .spread figure, .spread__pull, .block__grid article'), function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();
