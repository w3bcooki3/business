/* Loreto Family Pharmacy: live open status, menu dialog, store directory, refill text builder.
   The page reads fine without JS; these are enhancements. */
(function () {
  'use strict';

  /* ---- Hours in New York time, minutes after midnight. Index 0 = Sunday. ---- */
  var HOURS = { 0: [540, 900], 1: [510, 1200], 2: [510, 1200], 3: [510, 1200], 4: [510, 1200], 5: [510, 1200], 6: [510, 1200] };
  var DN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function nyNow() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hourCycle: 'h23', weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { dow: DN.indexOf(o.weekday), min: ((+o.hour) % 24) * 60 + (+o.minute) };
  }
  function clock(m) {
    var h = Math.floor(m / 60), mm = m % 60;
    return ((h % 12) || 12) + (mm ? ':' + ('0' + mm).slice(-2) : '') + (h >= 12 ? ' pm' : ' am');
  }

  function renderStatus() {
    var now = nyNow(), today = HOURS[now.dow];
    var open = now.min >= today[0] && now.min < today[1];
    var head, rest;
    if (open) {
      head = 'Open now';
      rest = today[1] - now.min <= 60 ? ', closing soon at ' + clock(today[1]) : ', until ' + clock(today[1]) + ' today';
    } else if (now.min < today[0]) {
      head = 'Closed';
      rest = ', opens today at ' + clock(today[0]);
    } else {
      var d = (now.dow + 1) % 7;
      head = 'Closed';
      rest = ', opens ' + (d === 0 ? 'Sunday' : 'tomorrow') + ' at ' + clock(HOURS[d][0]);
    }
    [].forEach.call(document.querySelectorAll('[data-status]'), function (s) {
      s.classList.toggle('is-open', open);
      s.classList.toggle('is-closed', !open);
      var t = s.querySelector('.status__txt');
      t.textContent = '';
      var b = document.createElement('b');
      b.textContent = head;
      t.appendChild(b);
      t.appendChild(document.createTextNode(rest));
    });
    [].forEach.call(document.querySelectorAll('.hours tr[data-d]'), function (tr) {
      var isToday = +tr.getAttribute('data-d') === now.dow;
      tr.classList.toggle('today', isToday);
      if (isToday) tr.setAttribute('aria-current', 'date'); else tr.removeAttribute('aria-current');
    });
  }
  renderStatus();
  setInterval(renderStatus, 60000);

  /* ---- Mobile menu: native modal dialog traps focus; Escape closes ---- */
  var menu = document.getElementById('menu');
  var openBtn = document.querySelector('.menu-btn');
  if (menu && openBtn && typeof menu.showModal === 'function') {
    openBtn.setAttribute('aria-expanded', 'false');
    openBtn.addEventListener('click', function () {
      menu.showModal();
      openBtn.setAttribute('aria-expanded', 'true');
    });
    menu.querySelector('.menu__close').addEventListener('click', function () { menu.close(); });
    menu.addEventListener('click', function (e) {
      if (e.target === menu) { menu.close(); return; }
      if (e.target.closest('a[href^="#"]')) menu.close();
    });
    menu.addEventListener('close', function () {
      openBtn.setAttribute('aria-expanded', 'false');
      var a = document.activeElement;
      if (!a || a === document.body || menu.contains(a)) openBtn.focus();
    });
  }

  /* ---- Store directory: each aisle row expands its items ---- */
  [].forEach.call(document.querySelectorAll('.board__row'), function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
  });

  /* ---- Refill text builder: buttons compose an sms: link, no personal data on the page ---- */
  var msg = document.getElementById('refill-msg');
  var go = document.getElementById('refill-go');
  if (msg && go) {
    var groups = document.querySelectorAll('.builder .opts');
    var pick = function (key) {
      var b = document.querySelector('.opts[data-key="' + key + '"] [aria-pressed="true"]');
      return b ? b.getAttribute('data-v') : '';
    };
    var compose = function () {
      var how = pick('how'), when = pick('when'), lang = pick('lang');
      var whenTxt = when === 'whenever it\'s ready' ? 'whenever it\'s ready' : when;
      var text = 'Hi Loreto, I\'d like a refill. I\'ll ' + how + ' ' + whenTxt + '. Please reply in ' + lang + '. Name: ___ Date of birth: ___ Rx #: ___';
      if (how === 'have it delivered') text = text.replace('I\'ll have it delivered', 'Please deliver it');
      msg.textContent = text.replace(/'/g, '’');
      go.href = 'sms:+17185550187?&body=' + encodeURIComponent(text);
    };
    [].forEach.call(groups, function (g) {
      g.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        [].forEach.call(g.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        compose();
      });
    });
    compose();
  }
})();
