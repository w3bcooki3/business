/* Seventh Avenue Family Pharmacy — open status, menu, shelf-board filter, text-a-question builder.
   Everything works as plain HTML without JS; this only adds conveniences. */
(function () {
  'use strict';

  /* Opening hours in minutes after midnight, by weekday (0 = Sunday). */
  var HOURS = { 0: [600, 960], 1: [480, 1200], 2: [480, 1200], 3: [480, 1200], 4: [480, 1200], 5: [480, 1200], 6: [540, 1080] };
  var DN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /* Current time in New York, whatever the visitor's time zone. */
  function nyNow() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    var h = (+o.hour) % 24;
    return { dow: DN.indexOf(o.weekday), min: h * 60 + (+o.minute) };
  }
  function clock(m) {
    var h = Math.floor(m / 60), mm = m % 60;
    return ((h % 12) || 12) + (mm ? ':' + ('0' + mm).slice(-2) : '') + (h >= 12 ? ' pm' : ' am');
  }

  var now = nyNow(), today = HOURS[now.dow], state, text;
  if (now.min >= today[0] && now.min < today[1]) {
    var left = today[1] - now.min;
    state = left <= 45 ? 'soon' : 'open';
    text = (left <= 45 ? 'Closing soon · ' : 'Open now · ') + 'until ' + clock(today[1]);
  } else if (now.min < today[0]) {
    state = 'closed';
    text = 'Closed · opens today at ' + clock(today[0]);
  } else {
    var nd = (now.dow + 1) % 7;
    state = 'closed';
    text = 'Closed · opens tomorrow at ' + clock(HOURS[nd][0]);
  }
  [['status', 'statusTxt'], ['status2', 'statusTxt2']].forEach(function (ids) {
    var wrap = document.getElementById(ids[0]), t = document.getElementById(ids[1]);
    if (!wrap || !t) return;
    t.textContent = text;
    wrap.classList.add('is-' + state);
  });
  var th = document.getElementById('todayHrs');
  if (th) th.textContent = DL[now.dow].slice(0, 3) + ' ' + clock(today[0]) + '–' + clock(today[1]);
  var row = document.querySelector('#hours tr[data-d="' + now.dow + '"]');
  if (row) row.classList.add('is-today');

  /* Mobile menu: toggle, close on link, Escape and outside click. */
  var nav = document.querySelector('.nav'), btn = nav && nav.querySelector('.nav__btn');
  if (btn) {
    var setOpen = function (open, focusBtn) {
      nav.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Close' : 'Menu';
      if (!open && focusBtn) btn.focus();
    };
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false, true);
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target)) setOpen(false);
    });
  }

  /* Shelf board filter. */
  var tabs = document.querySelectorAll('.board__tabs .tab'), groups = document.getElementById('boardGroups');
  [].forEach.call(tabs, function (t) {
    t.addEventListener('click', function () {
      var f = t.getAttribute('data-f');
      [].forEach.call(tabs, function (o) { o.setAttribute('aria-pressed', String(o === t)); });
      [].forEach.call(groups.querySelectorAll('.bgroup'), function (g) {
        g.hidden = f !== 'all' && g.getAttribute('data-g') !== f;
      });
      groups.classList.toggle('is-filtered', f !== 'all');
    });
  });

  /* Text-a-question builder: composes an sms: link; nothing is collected here. */
  var picks = document.querySelectorAll('.builder .pick'), topic = document.getElementById('bTopic'), sms = document.getElementById('bSms');
  [].forEach.call(picks, function (p) {
    p.addEventListener('click', function () {
      var t = p.getAttribute('data-t');
      [].forEach.call(picks, function (o) { o.setAttribute('aria-pressed', String(o === p)); });
      topic.textContent = t;
      sms.href = 'sms:+17185550187?&body=' + encodeURIComponent('Hi, I have a question about ' + t + '.');
    });
  });
})();
