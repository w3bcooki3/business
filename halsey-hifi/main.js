/* Halsey Hi-Fi — receiver (dial, VU meters, display), live open status, Album Night seat builder,
   navigation dialog. Everything is progressive: the HTML reads fine without this file. */
(function () {
  'use strict';

  var TEL = '+17185550147';
  /* Minutes after midnight, keyed by weekday (0 = Sunday). */
  var HOURS = { 0: [480, 1200], 1: [420, 1320], 2: [420, 1320], 3: [420, 1320], 4: [420, 1320], 5: [420, 1440], 6: [480, 1440] };
  var BAR_FROM = 17 * 60;
  var DIAL_START = 7 * 60, DIAL_SPAN = 17 * 60;   /* the dial reads 7 am → midnight */
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /* The house rotation: artist + album only. */
  var ROTATION = [
    ['Alice Coltrane', 'Journey in Satchidananda'], ['Bill Evans Trio', 'Sunday at the Village Vanguard'],
    ['Minnie Riperton', 'Come to My Garden'], ['Marvin Gaye', 'What’s Going On'], ['Steely Dan', 'Aja'],
    ['Roy Ayers Ubiquity', 'Everybody Loves the Sunshine'], ['Joni Mitchell', 'Court and Spark'],
    ['Sade', 'Diamond Life'], ['Curtis Mayfield', 'Curtis'], ['Stevie Wonder', 'Songs in the Key of Life'],
    ['A Tribe Called Quest', 'The Low End Theory'], ['Erykah Badu', 'Baduizm'], ['Pharoah Sanders', 'Karma'],
    ['Fleetwood Mac', 'Rumours'], ['Nina Simone', 'Wild Is the Wind'], ['Bob Marley & the Wailers', 'Exodus']
  ];
  var COFFEE = [
    ['Ethiopia Guji', 'peach, bergamot, black tea'], ['Colombia Huila', 'panela, red apple, cocoa'],
    ['Kenya Nyeri', 'blackcurrant, grapefruit, cane sugar'], ['Guatemala Huehuetenango', 'toffee, almond, orange zest']
  ];
  var WINE = [
    ['Skin‑contact white', 'amber, apricot, a little grip', 'B1 · $16 a glass'],
    ['Chilled light red', 'crunchy, bright, served cold', 'B1 · $15 a glass'],
    ['Pét‑nat rosé', 'wild strawberry, fine bubbles', 'B2 · $15 a glass']
  ];
  /* Album Night line-up; index 0 plays on Wed Oct 14 2026, then one per week, looping. */
  var NIGHTS = [
    ['Marvin Gaye', 'What’s Going On'], ['Joni Mitchell', 'Blue'], ['Stevie Wonder', 'Innervisions'],
    ['The Notorious B.I.G.', 'Ready to Die'], ['Miles Davis', 'Kind of Blue'], ['Fleetwood Mac', 'Rumours'],
    ['Nina Simone', 'Wild Is the Wind'], ['D’Angelo', 'Voodoo']
  ];
  var NIGHTS_EPOCH = Date.UTC(2026, 9, 14);
  var WEEK = 7 * 864e5;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Time in New York ---------- */
  function nyNow() {
    var o = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short'
    }).formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    var h = (+o.hour) % 24;
    var dayUTC = Date.UTC(+o.year, +o.month - 1, +o.day);
    return { dow: new Date(dayUTC).getUTCDay(), min: h * 60 + (+o.minute), dayUTC: dayUTC };
  }
  function clock(mins) {
    if (mins === 1440) return 'midnight';
    var h = Math.floor(mins / 60), m = mins % 60;
    return ((h % 12) || 12) + (m ? ':' + ('0' + m).slice(-2) : '') + (h >= 12 ? ' pm' : ' am');
  }
  function shortDate(utc) {
    var d = new Date(utc);
    return MONTHS[d.getUTCMonth()] + ' ' + d.getUTCDate();
  }

  var now = nyNow();

  /* ---------- Open status ---------- */
  function status(t) {
    var today = HOURS[t.dow];
    if (t.min >= today[0] && t.min < today[1]) {
      var left = today[1] - t.min;
      return {
        state: left <= 45 ? 'soon' : 'open',
        short: left <= 45 ? 'Last call · closes ' + clock(today[1]) : 'Open until ' + clock(today[1]),
        long: (left <= 45 ? 'Last call — we close at ' : 'Open now — until ') + clock(today[1]) + (left <= 45 ? '.' : t.min < BAR_FROM ? '. Wine & beer from 5 pm.' : '. Side B is pouring.')
      };
    }
    if (t.min < today[0]) {
      return { state: 'closed', short: 'Opens today ' + clock(today[0]), long: 'Closed right now — opens today at ' + clock(today[0]) + '.' };
    }
    var next = HOURS[(t.dow + 1) % 7];
    return { state: 'closed', short: 'Closed · opens ' + clock(next[0]), long: 'Closed for the night — back tomorrow at ' + clock(next[0]) + '.' };
  }
  var st = status(now);
  var isOpen = st.state !== 'closed';

  [].forEach.call(document.querySelectorAll('[data-status-short], [data-status-long]'), function (el) {
    var txt = el.querySelector('[data-status-text]');
    if (txt) txt.textContent = el.hasAttribute('data-status-long') ? st.long : st.short;
    el.classList.add('is-' + st.state);
  });

  var todayHours = document.querySelector('[data-today-hours]');
  if (todayHours) {
    var th = HOURS[now.dow];
    todayHours.textContent = clock(th[0]) + ' – ' + clock(th[1]);
  }
  var todayRow = document.querySelector('[data-hours] tr[data-d="' + now.dow + '"]');
  if (todayRow) {
    todayRow.classList.add('is-today');
    var thCell = todayRow.querySelector('th');
    if (thCell) thCell.insertAdjacentHTML('beforeend', '<span class="visually-hidden"> (today)</span>');
  }

  /* ---------- Album Night dates ---------- */
  function upcomingNights(count) {
    /* Wednesday 8–9 pm; tonight counts until the lights come up at 9. */
    var offset = (3 - now.dow + 7) % 7;
    if (offset === 0 && now.min >= 21 * 60) offset = 7;
    var first = now.dayUTC + offset * 864e5;
    var out = [];
    for (var i = 0; i < count; i++) {
      var day = first + i * WEEK;
      var idx = Math.round((day - NIGHTS_EPOCH) / WEEK);
      var album = NIGHTS[((idx % NIGHTS.length) + NIGHTS.length) % NIGHTS.length];
      out.push({ date: shortDate(day), tonight: i === 0 && offset === 0, artist: album[0], title: album[1] });
    }
    return out;
  }
  var nights = upcomingNights(4);

  /* ---------- Receiver display ---------- */
  var disp = {
    root: document.querySelector('.display'),
    mode: document.querySelector('[data-disp-mode]'),
    a: document.querySelector('[data-disp-a]'),
    b: document.querySelector('[data-disp-b]'),
    c: document.querySelector('[data-disp-c]'),
    live: document.querySelector('[data-disp-live]')
  };
  var dayIndex = Math.floor(now.dayUTC / 864e5);

  function screen(mode) {
    var since = Math.max(0, now.min - DIAL_START);
    if (mode === 'phono') {
      if (!isOpen) return ['Phono · Standby', 'Needle’s up', 'Back at ' + clock(HOURS[now.min < HOURS[now.dow][0] ? now.dow : (now.dow + 1) % 7][0]), 'Tonight’s last side has played'];
      var slot = Math.floor(since / 40);
      var rec = ROTATION[(slot + dayIndex * 5) % ROTATION.length];
      return ['Phono · Now spinning', rec[0], rec[1], (since % 40 < 20 ? 'Side A' : 'Side B') + ' · 33⅓ rpm'];
    }
    if (mode === 'brew') {
      if (isOpen && now.min >= BAR_FROM) {
        var w = WINE[dayIndex % WINE.length];
        return ['On the bar · Pouring', w[0], w[1], w[2]];
      }
      var c = COFFEE[dayIndex % COFFEE.length];
      return [isOpen ? 'On the bar · Brewing' : 'On the bar · Tomorrow', c[0], c[1], 'A6 pour‑over · $6.50'];
    }
    var n = nights[0];
    return ['Album Night · ' + (n.tonight ? 'Tonight' : 'Wed ' + n.date), n.artist, n.title, '8 pm · free · 28 seats'];
  }

  function show(mode, announce) {
    if (!disp.root) return;
    var s = screen(mode);
    disp.mode.textContent = s[0];
    disp.a.textContent = s[1];
    disp.b.textContent = s[2];
    disp.c.textContent = s[3];
    if (announce && disp.live) disp.live.textContent = s[0] + ': ' + s[1] + ', ' + s[2] + '. ' + s[3] + '.';
    if (announce && !reduceMotion) {
      disp.root.classList.remove('is-changing');
      void disp.root.offsetWidth;
      disp.root.classList.add('is-changing');
    }
  }
  show('phono', false);

  var selBtns = document.querySelectorAll('.selector__btn');
  [].forEach.call(selBtns, function (btn) {
    btn.addEventListener('click', function () {
      [].forEach.call(selBtns, function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      show(btn.getAttribute('data-mode'), true);
    });
  });

  /* ---------- Tuning dial: the pointer is the time in Brooklyn ---------- */
  var pointer = document.querySelector('[data-dial-pointer]');
  var dial = document.querySelector('.dial');
  if (dial && !isOpen) dial.classList.add('is-closed');
  if (pointer) {
    var t = Math.min(1, Math.max(0, (now.min - DIAL_START) / DIAL_SPAN));
    if (!isOpen && now.min < DIAL_START) t = 0;
    if (reduceMotion) {
      pointer.style.setProperty('--t', t.toFixed(4));
    } else {
      pointer.style.setProperty('--t', '0');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          pointer.classList.add('is-sweeping');
          pointer.style.setProperty('--t', t.toFixed(4));
        });
      });
    }
  }

  /* ---------- VU meters ---------- */
  var needles = document.querySelectorAll('[data-vu]');
  /* dB → needle angle, matching the printed scale */
  var SCALE = [[-24, -50], [-20, -48], [-10, -33], [-7, -23], [-5, -14], [-3, -4], [-2, 3], [-1, 11], [0, 20], [1, 29], [2, 38], [3, 48], [4, 52]];
  function angle(db) {
    if (db <= SCALE[0][0]) return SCALE[0][1];
    for (var i = 1; i < SCALE.length; i++) {
      if (db <= SCALE[i][0]) {
        var a = SCALE[i - 1], b = SCALE[i], k = (db - a[0]) / (b[0] - a[0]);
        return a[1] + k * (b[1] - a[1]);
      }
    }
    return SCALE[SCALE.length - 1][1];
  }
  function setNeedle(el, deg) { el.style.setProperty('--a', deg.toFixed(2) + 'deg'); }

  if (needles.length) {
    /* Quieter in the morning, a little hotter after five. */
    var base = !isOpen ? -24 : now.min < 11 * 60 ? -9 : now.min < BAR_FROM ? -6 : -3.5;
    if (!isOpen || reduceMotion) {
      [].forEach.call(needles, function (n, i) { setNeedle(n, angle(isOpen ? base - i * 0.8 : -24)); });
    } else {
      var ch = [].map.call(needles, function () { return { level: -24, target: base, next: 0 }; });
      var running = false, last = 0, raf = 0;
      var tick = function (ts) {
        raf = requestAnimationFrame(tick);
        if (ts - last < 33) return;              /* ~30 fps is plenty for a needle */
        last = ts;
        ch.forEach(function (c, i) {
          if (ts > c.next) {                     /* a new transient every 110–320 ms */
            var beat = Math.random();
            c.target = base + (beat > 0.82 ? 3.2 + Math.random() * 2 : (Math.random() - 0.6) * 7);
            c.next = ts + 110 + Math.random() * 210;
          }
          /* fast attack, slow release — like real VU ballistics */
          var k = c.target > c.level ? 0.32 : 0.09;
          c.level += (c.target - c.level) * k;
          setNeedle(needles[i], angle(c.level));
        });
      };
      var start = function () { if (!running) { running = true; raf = requestAnimationFrame(tick); } };
      var stop = function () { running = false; cancelAnimationFrame(raf); };
      var visible = true, onscreen = true;
      var sync = function () { (visible && onscreen) ? start() : stop(); };
      document.addEventListener('visibilitychange', function () { visible = !document.hidden; sync(); });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) { onscreen = es[0].isIntersecting; sync(); }).observe(document.querySelector('[data-rx]'));
      }
      sync();
    }
  }

  /* ---------- Album Night schedule + seat builder ---------- */
  var rows = document.querySelectorAll('[data-schedule] .schedule__row');
  [].forEach.call(rows, function (row, i) {
    var n = nights[i];
    if (!n) return;
    row.querySelector('.schedule__date').innerHTML = '<span>' + (n.tonight ? 'Tonight' : 'Wed') + '</span> ' + n.date;
    row.querySelector('.schedule__artist').textContent = n.artist;
    row.querySelector('.schedule__title').textContent = n.title;
    row.querySelector('.schedule__pick').setAttribute('aria-label', 'Hold seats for ' + n.date + ', ' + n.artist + ', ' + n.title);
  });

  var picks = document.querySelectorAll('.schedule__pick');
  var stubNight = document.querySelector('[data-stub-night]');
  var stubLink = document.querySelector('[data-stub-link]');
  var partyOut = document.querySelector('[data-party]');
  var stepBtns = document.querySelectorAll('[data-step]');
  var chosen = 0, party = 2, MIN = 1, MAX = 6;

  function renderStub() {
    var n = nights[chosen];
    var when = (n.tonight ? 'Tonight' : 'Wed') + ' ' + n.date;
    if (stubNight) stubNight.textContent = when + ' · ' + n.artist + ' — ' + n.title;
    if (partyOut) partyOut.textContent = String(party);
    [].forEach.call(stepBtns, function (b) {
      var d = +b.getAttribute('data-step');
      b.disabled = d < 0 ? party <= MIN : party >= MAX;
    });
    if (stubLink) {
      var body = 'Hi Halsey Hi-Fi — please hold ' + party + (party === 1 ? ' seat' : ' seats') +
        ' for Album Night, Wed ' + n.date + ' (' + n.artist + ', ' + n.title + ').';
      stubLink.href = 'sms:' + TEL + '?&body=' + encodeURIComponent(body);
      stubLink.textContent = 'Text to hold ' + party + (party === 1 ? ' seat' : ' seats');
    }
  }
  [].forEach.call(picks, function (btn) {
    btn.addEventListener('click', function () {
      chosen = +btn.getAttribute('data-night') || 0;
      [].forEach.call(picks, function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      renderStub();
    });
  });
  [].forEach.call(stepBtns, function (btn) {
    btn.addEventListener('click', function () {
      party = Math.min(MAX, Math.max(MIN, party + (+btn.getAttribute('data-step'))));
      renderStub();
      if (btn.disabled) { var other = btn.parentNode.querySelector('[data-step]:not(:disabled)'); if (other) other.focus(); }
    });
  });
  renderStub();

  /* ---------- Navigation dialog ---------- */
  var dlg = document.getElementById('navdialog');
  var opener = document.querySelector('[data-nav-open]');
  if (dlg && opener && typeof dlg.showModal === 'function') {
    var focusables = function () {
      return [].filter.call(dlg.querySelectorAll('a[href], button:not([disabled])'), function (el) { return el.offsetParent !== null; });
    };
    opener.addEventListener('click', function () {
      dlg.showModal();
      opener.setAttribute('aria-expanded', 'true');
      var first = dlg.querySelector('.navdialog__list a');
      if (first) first.focus();
    });
    var pendingTarget = null;
    dlg.addEventListener('close', function () {
      opener.setAttribute('aria-expanded', 'false');
      if (pendingTarget) {
        var target = pendingTarget;
        pendingTarget = null;
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        history.pushState(null, '', '#' + target.id);
      } else {
        opener.focus();
      }
    });
    dlg.querySelector('[data-nav-close]').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (link) {
        e.preventDefault();
        pendingTarget = document.getElementById(link.getAttribute('href').slice(1));
        dlg.close();
      } else if (e.target === dlg) {
        dlg.close();
      }
    });
    /* Keep Tab inside the dialog. */
    dlg.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    /* If the layout grows past the phone breakpoint while open, close it. */
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (mq) { if (mq.matches && dlg.open) dlg.close(); });
  }
})();
