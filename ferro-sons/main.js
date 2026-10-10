/* Ferro & Sons — live status, wait timetable, "in today" markers, mobile dock.
   Data lives in window.SHOP (index.html). Everything degrades to static HTML without JS. */
(function () {
  'use strict';
  var SHOP = window.SHOP || {};
  var HOURS = SHOP.hours || {}, WAITS = SHOP.waits || {};
  var DN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /* Current time in New York, whatever the visitor's time zone. */
  function nyNow() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    var h = (+o.hour) % 24, m = +o.minute;
    return { dow: DN.indexOf(o.weekday), h: h, min: h * 60 + m };
  }
  function clock(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    return ((h % 12) || 12) + (m ? ':' + ('0' + m).slice(-2) : '') + (h >= 12 ? ' pm' : ' am');
  }
  function hourLabel(h) { return ((h % 12) || 12) + (h >= 12 ? ' pm' : ' am'); }
  function nextOpenDay(dow) {
    for (var i = 1; i <= 7; i++) { var d = (dow + i) % 7; if (HOURS[d]) return { d: d, inDays: i }; }
    return null;
  }

  var now = nyNow();
  var today = HOURS[now.dow];
  var isOpen = !!(today && now.min >= today[0] && now.min < today[1]);
  var state = isOpen ? 'open' : 'closed';

  /* Status line, shared by the ticket, the hours block and the dock. */
  var statusText, statusHead, statusSub, shortText, waitText;
  if (isOpen) {
    statusHead = 'Open now'; statusSub = 'until ' + clock(today[1]);
    statusText = 'Open now · until ' + clock(today[1]);
    shortText = 'Open · until ' + clock(today[1]);
    var w = (WAITS[now.dow] || {})[now.h];
    waitText = w !== undefined ? 'About ' + w + ' min' : 'Short';
  } else if (today && now.min < today[0]) {
    statusText = 'Opens today at ' + clock(today[0]);
    statusHead = 'Opens at ' + clock(today[0]); statusSub = 'today';
    shortText = statusText;
    waitText = 'Quiet at opening';
  } else {
    var n = nextOpenDay(now.dow);
    var when = n.inDays === 1 ? 'tomorrow' : DL[n.d];
    statusText = 'Closed · back ' + when + ' at ' + clock(HOURS[n.d][0]);
    statusHead = 'Closed now'; statusSub = 'back ' + when + ' at ' + clock(HOURS[n.d][0]);
    shortText = 'Closed · back ' + (n.inDays === 1 ? 'tomorrow' : DN[n.d]) + ' ' + clock(HOURS[n.d][0]);
    waitText = 'Shop’s closed';
  }

  function setStatus(id, txt) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = txt;
    var p = el.closest('#status,#dockS,#heroS') || el.parentNode;
    p.classList.add('is-' + state);
  }
  setStatus('statusTxt', statusHead);
  var ss = document.getElementById('statusSub'); if (ss) ss.textContent = statusSub;
  setStatus('dockTxt', shortText);
  setStatus('heroTxt', shortText);
  var wt = document.getElementById('waitTxt'); if (wt) wt.textContent = waitText;

  var op = document.getElementById('open');
  if (op) {
    op.innerHTML = '<span class="dot" aria-hidden="true"></span><span></span>';
    op.lastChild.textContent = statusText;
    op.classList.add('is-' + state);
  }

  /* Hours table: mark today and closed days. */
  [].forEach.call(document.querySelectorAll('#hrs tr'), function (tr) {
    var d = +tr.getAttribute('data-d');
    if (d === now.dow) tr.classList.add('today');
    if (!HOURS[d]) tr.classList.add('is-closed-day');
  });

  /* Wait timetable. */
  var days = document.getElementById('days'), tt = document.getElementById('tt'), wn = document.getElementById('waitNow');
  if (days && tt) {
    var openDays = Object.keys(WAITS).map(Number);
    var doneToday = !today || now.min >= today[1];
    var sel = (WAITS[now.dow] && !doneToday) ? now.dow : (nextOpenDay(now.dow) || { d: openDays[0] }).d;
    openDays.forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-d', d);
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = DN[d] + '<span class="vh">' + DL[d].slice(3) + '</span>' + (d === now.dow ? '<small><span class="vh">, </span>Today</small>' : '');
      b.addEventListener('click', function () { draw(d); });
      days.appendChild(b);
    });

    var MAX = 60;
    function draw(d) {
      [].forEach.call(days.children, function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-d') === d)); });
      var data = WAITS[d], hrs = Object.keys(data).map(Number);
      tt.innerHTML = '';
      hrs.forEach(function (h) {
        var li = document.createElement('li');
        var live = d === now.dow && isOpen;
        if (live && h === now.h) li.className = 'is-now';
        else if (live && h < now.h) li.className = 'is-past';
        li.innerHTML = '<span class="tt__h">' + hourLabel(h) + '</span>' +
          '<span class="tt__bar" aria-hidden="true"><i style="--v:' + Math.max(4, Math.round(data[h] / MAX * 100)) + '%"></i></span>' +
          '<span class="tt__m">' + data[h] + ' min</span>';
        li.setAttribute('aria-label', hourLabel(h) + ': usually about ' + data[h] + ' minutes' + (li.className === 'is-now' ? ' (right now)' : ''));
        tt.appendChild(li);
      });
      tt.setAttribute('aria-label', 'Typical wait on ' + DL[d] + ', by hour');
      var best = hrs.reduce(function (a, b) { return data[a] <= data[b] ? a : b; });
      var worst = hrs.reduce(function (a, b) { return data[a] >= data[b] ? a : b; });
      if (d === now.dow && isOpen && data[now.h] !== undefined) {
        wn.textContent = 'Right about now: usually a ' + data[now.h] + '-minute wait.';
      } else {
        wn.textContent = DL[d] + ': quietest around ' + hourLabel(best) + ', busiest around ' + hourLabel(worst) + '.';
      }
    }
    draw(sel);
  }

  /* "In today" on each chair. */
  [].forEach.call(document.querySelectorAll('.chair[data-days]'), function (c) {
    var el = c.querySelector('.chair__in'); if (!el) return;
    var on = c.getAttribute('data-days').split(',').map(Number).indexOf(now.dow) > -1;
    var when = (now.dow === 6 && c.getAttribute('data-sat')) || c.getAttribute('data-when');
    var afterClose = today && now.min >= today[1];
    if (on && today && afterClose) { el.textContent = 'Done for today'; el.classList.add('is-off'); }
    else if (on && today) el.textContent = 'In today' + (when && when !== 'all day' ? ', ' + when : '');
    else { el.textContent = 'Off today'; el.classList.add('is-off'); }
    el.hidden = false;
  });

  /* Mobile dock: appears once the hero's own buttons are off screen, hides over the visit section and footer. */
  var dock = document.getElementById('dock');
  if (dock && 'IntersectionObserver' in window) {
    var seen = { hero: true, end: false };
    var update = function () { dock.classList.toggle('is-on', !seen.hero && !seen.end); };
    var watch = function (el, key) {
      if (!el) return;
      new IntersectionObserver(function (es) { seen[key] = es[0].isIntersecting; update(); }).observe(el);
    };
    watch(document.getElementById('heroCta'), 'hero');
    watch(document.querySelector('.visit__cta'), 'end');
  }
})();
