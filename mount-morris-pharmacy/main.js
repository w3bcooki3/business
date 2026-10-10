/* Mount Morris Pharmacy — live open lamp, "this month" calendar strip, refill text builder, menu.
   Every block degrades to the static HTML when JS is unavailable. */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Shop data ---------- */
  // minutes after midnight, indexed by day of week (0 = Sunday)
  var HOURS = { 0: [660, 960], 1: [540, 1200], 2: [540, 1200], 3: [540, 1200], 4: [540, 1200], 5: [540, 1200], 6: [540, 1080] };
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var EVENTS = {
    screen: { name: 'Screening Saturday', time: '10 am–2 pm', text: 'Free blood-pressure, glucose and BMI screenings. No appointment needed.' },
    vax: { name: 'Vaccine walk-in day', time: '10 am–7 pm', text: 'Flu, COVID-19, shingles, pneumonia and Tdap. Bring your insurance card.' },
    check: { name: 'Diabetes & blood-pressure check-in', time: '3–6 pm', text: 'Fifteen free minutes with a pharmacist in our private room.' },
    med: { name: 'Medicare plan review', time: '2–6 pm', text: 'Compare Part D plans for next year. Bring your card and medicine list.' }
  };
  var ORDER = ['screen', 'vax', 'check', 'med'];

  function clock(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    return ((h % 12) || 12) + (m ? ':' + ('0' + m).slice(-2) : '') + (h >= 12 ? ' pm' : ' am');
  }
  function span(mins) { return clock(mins[0]) + ' – ' + clock(mins[1]); }

  /* Today's date and time in New York, whatever the visitor's time zone. */
  function nyNow() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    var y = +o.year, mo = +o.month - 1, d = +o.day, h = (+o.hour) % 24;
    return { y: y, m: mo, d: d, dow: new Date(y, mo, d).getDay(), min: h * 60 + (+o.minute) };
  }
  var now = nyNow();

  /* ---------- Open lamp + status lines ---------- */
  (function status() {
    var today = HOURS[now.dow];
    var open = now.min >= today[0] && now.min < today[1];
    var head, sub;
    if (open) {
      head = 'Open now';
      sub = today[1] - now.min <= 45 ? 'closing soon, at ' + clock(today[1]) : 'until ' + clock(today[1]) + ' today';
    } else if (now.min < today[0]) {
      head = 'Closed'; sub = 'opens today at ' + clock(today[0]);
    } else {
      var n = (now.dow + 1) % 7;
      head = 'Closed'; sub = 'opens tomorrow at ' + clock(HOURS[n][0]);
    }
    var state = open ? 'is-open' : 'is-closed';
    var html = '<span class="dot" aria-hidden="true"></span><b>' + head + '</b> · ' + sub;

    var lamp = document.querySelector('[data-lamp]');
    if (lamp) {
      lamp.parentNode.classList.add(state);
      lamp.querySelector('[data-lamp-word]').textContent = open ? 'Open' : 'Closed';
    }
    document.querySelectorAll('[data-status], [data-status-visit]').forEach(function (el) {
      el.innerHTML = html; el.classList.add(state);
    });
    document.querySelectorAll('[data-status-short]').forEach(function (el) { el.textContent = head + ' · ' + sub; });
    document.querySelectorAll('.hours tr[data-dow]').forEach(function (tr) {
      if (tr.getAttribute('data-dow').split(' ').indexOf(String(now.dow)) > -1) tr.classList.add('is-today');
    });
  })();

  /* ---------- Sunburst draw order ---------- */
  document.querySelectorAll('.transom .ray').forEach(function (r, i, all) {
    // fan outward from the centre ray
    r.style.setProperty('--i', Math.abs(i - (all.length - 1) / 2));
  });

  /* ---------- Calendar ---------- */
  function eventsOn(y, m, d) {
    var dow = new Date(y, m, d).getDay(), list = [];
    if (dow === 6 && d >= 8 && d <= 14) list.push('screen');
    if (dow === 2 || dow === 4) list.push('vax');
    if (dow === 3 && d <= 7) list.push('check');
    var inAEP = (m === 9 && d >= 15) || m === 10 || (m === 11 && d <= 7);
    if (dow === 1 && inAEP) list.push('med');
    return list;
  }
  function icon(key) { return '<svg class="mk mk--' + key + '" aria-hidden="true"><use href="#m-' + key + '"/></svg>'; }

  /* "Next: Sat, Oct 10" on each recurring item */
  ORDER.forEach(function (key) {
    var el = document.querySelector('[data-next="' + key + '"]');
    if (!el) return;
    for (var i = 0; i < 70; i++) {
      var dt = new Date(now.y, now.m, now.d + i);
      if (eventsOn(dt.getFullYear(), dt.getMonth(), dt.getDate()).indexOf(key) > -1) {
        el.textContent = (i === 0 ? 'Next: today, ' : i === 1 ? 'Next: tomorrow, ' : 'Next: ') +
          DAYS[dt.getDay()].slice(0, 3) + ', ' + MONTHS[dt.getMonth()].slice(0, 3) + ' ' + dt.getDate();
        return;
      }
    }
  });

  var strip = document.querySelector('[data-strip]');
  if (strip) {
    var list = strip.querySelector('[data-days]');
    var detail = strip.querySelector('[data-day-detail]');
    var tabs = strip.querySelectorAll('[data-month]');
    var title = document.querySelector('[data-month-name]');
    strip.hidden = false;

    var showDetail = function (y, m, d) {
      var dow = new Date(y, m, d).getDay();
      var ev = eventsOn(y, m, d);
      var isToday = y === now.y && m === now.m && d === now.d;
      var h = '<p class="day__date">' + (isToday ? 'Today, ' : '') + DAYS[dow] + ', ' + MONTHS[m] + ' ' + d + '</p>' +
        '<p class="day__hours">Counter open ' + span(HOURS[dow]) + '</p>';
      if (ev.length) {
        h += '<ul class="day__events">' + ev.map(function (k) {
          var e = EVENTS[k];
          return '<li>' + icon(k) + '<span><b>' + e.name + ' · ' + e.time + '</b>' + e.text + '</span></li>';
        }).join('') + '</ul>';
      } else {
        h += '<p class="day__none">No special events. Prescriptions, refills and delivery as usual.</p>';
      }
      detail.innerHTML = h;
    };

    var select = function (btn, focus) {
      list.querySelectorAll('.dd').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); b.tabIndex = -1; });
      btn.setAttribute('aria-pressed', 'true'); btn.tabIndex = 0;
      if (focus) btn.focus({ preventScroll: true });
      var li = btn.parentNode;
      var left = li.offsetLeft, right = left + li.offsetWidth;
      if (left < list.scrollLeft + 8 || right > list.scrollLeft + list.clientWidth - 8) {
        list.scrollTo({ left: left - 10, behavior: reduce || !focus ? 'auto' : 'smooth' });
      }
      showDetail(+btn.dataset.y, +btn.dataset.m, +btn.dataset.d);
    };

    var render = function (offset) {
      var first = new Date(now.y, now.m + offset, 1);
      var y = first.getFullYear(), m = first.getMonth();
      var count = new Date(y, m + 1, 0).getDate();
      if (title) title.textContent = MONTHS[m] + ' at the counter';
      var html = '';
      for (var d = 1; d <= count; d++) {
        var dow = new Date(y, m, d).getDay();
        var ev = eventsOn(y, m, d);
        var past = offset === 0 && d < now.d, today = offset === 0 && d === now.d;
        var cls = 'dd' + (dow === 6 ? ' dd--sat' : dow === 0 ? ' dd--sun' : '') + (past ? ' dd--past' : '') + (today ? ' dd--today' : '');
        var extra = ' ' + MONTHS[m] + (today ? ', today' : '') +
          (ev.length ? ': ' + ev.map(function (k) { return EVENTS[k].name; }).join(', ') : '');
        html += '<li><button type="button" class="' + cls + '" data-y="' + y + '" data-m="' + m + '" data-d="' + d + '" aria-pressed="false" tabindex="-1">' +
          '<span class="dd__wd">' + DAYS[dow].slice(0, 3) + '</span> ' +
          '<span class="dd__n">' + d + '</span><span class="vh">' + extra + '</span>' +
          '<span class="dd__mk" aria-hidden="true">' + ev.map(icon).join('') + '</span></button></li>';
      }
      list.innerHTML = html;
      list.scrollLeft = 0;
      var start = list.querySelector('.dd--today') || list.querySelector('.dd');
      select(start, false);
    };

    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (o) { o.setAttribute('aria-pressed', String(o === t)); });
        render(+t.dataset.month);
      });
    });
    list.addEventListener('click', function (e) {
      var b = e.target.closest('.dd');
      if (b) select(b, true);
    });
    list.addEventListener('keydown', function (e) {
      var b = e.target.closest('.dd');
      if (!b) return;
      var all = Array.prototype.slice.call(list.querySelectorAll('.dd'));
      var i = all.indexOf(b), j = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = Math.min(all.length - 1, i + 1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = Math.max(0, i - 1);
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = all.length - 1;
      if (j !== null) { e.preventDefault(); select(all[j], true); }
    });
    strip.querySelectorAll('[data-scroll]').forEach(function (a) {
      a.addEventListener('click', function () {
        list.scrollBy({ left: +a.dataset.scroll * list.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    render(0);
  }

  /* ---------- Refill text builder ---------- */
  var builder = document.querySelector('[data-builder]');
  if (builder) {
    var preview = builder.querySelector('[data-preview]');
    var sms = builder.querySelector('[data-sms]');
    var howStep = builder.querySelectorAll('.ticket__step')[1];
    var pick = function (q) { var b = builder.querySelector('[data-q="' + q + '"][aria-pressed="true"]'); return b ? b.dataset.v : ''; };
    var compose = function () {
      var what = pick('what'), how = pick('how'), when = pick('when'), msg;
      if (what.indexOf('ask') === 0) {
        msg = "Hello, I'd like to " + what + '. Please call me back ' + when + '.';
      } else {
        msg = "Hello, I'd like to " + what + '. ' + how.charAt(0).toUpperCase() + how.slice(1) + ', ' + when + '.' +
          (what.indexOf('transfer') === 0 ? " I'll give you the other pharmacy's name when you call." : '') +
          ' Please call me back to confirm.';
      }
      var asking = what.indexOf('ask') === 0;
      howStep.classList.toggle('is-muted', asking);
      howStep.querySelectorAll('.chip').forEach(function (c) { c.disabled = asking; });
      preview.textContent = msg;
      sms.href = 'sms:+12125550138?&body=' + encodeURIComponent(msg);
    };
    builder.addEventListener('click', function (e) {
      var c = e.target.closest('.chip');
      if (!c || c.disabled) return;
      builder.querySelectorAll('[data-q="' + c.dataset.q + '"]').forEach(function (o) { o.setAttribute('aria-pressed', String(o === c)); });
      compose();
    });
    compose();
  }

  /* ---------- Menu (native modal dialog: focus trap, Escape, focus return) ---------- */
  var menu = document.getElementById('menu');
  var opener = document.querySelector('[data-open-menu]');
  if (menu && opener && typeof menu.showModal === 'function') {
    opener.setAttribute('aria-expanded', 'false');
    opener.addEventListener('click', function () {
      menu.showModal();
      opener.setAttribute('aria-expanded', 'true');
      doc.style.overflow = 'hidden';
    });
    menu.addEventListener('close', function () {
      opener.setAttribute('aria-expanded', 'false');
      doc.style.overflow = '';
    });
    // keep Tab inside the open menu (wraps first <-> last)
    menu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = menu.querySelectorAll('a[href], button:not([disabled])');
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    menu.querySelector('[data-close-menu]').addEventListener('click', function () { menu.close(); });
    menu.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        menu.close();
        target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        history.replaceState(null, '', a.getAttribute('href'));
      });
    });
  } else if (opener) {
    // no <dialog> support: menu button jumps to the visit section
    opener.addEventListener('click', function () { location.hash = '#visit'; });
  }
})();
