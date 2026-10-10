/* Hartley Pharmacy — menu, open-now status, insurance finder */
(function () {
  'use strict';

  /* ---- mobile menu ---- */
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        btn.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        btn.focus();
      }
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { btn.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
    });
  }

  /* ---- open now (New York time) ---- */
  // minutes from midnight; index 0 = Sunday
  var HOURS = [[600, 960], [510, 1200], [510, 1200], [510, 1200], [510, 1200], [510, 1200], [540, 1080]];
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function fmt(m) {
    var h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return h + (mm ? ':' + String(mm).padStart(2, '0') : '') + ap;
  }
  function nyNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
      var d = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday);
      return { day: d, min: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    } catch (e) { var n = new Date(); return { day: n.getDay(), min: n.getHours() * 60 + n.getMinutes() }; }
  }
  var now = nyNow();
  document.querySelectorAll('[data-open-status]').forEach(function (el) {
    var h = HOURS[now.day], state, detail;
    if (now.min >= h[0] && now.min < h[1]) {
      state = 'Open now';
      detail = 'Pharmacy open until ' + fmt(h[1]) + ' today';
      el.classList.remove('is-closed');
    } else {
      el.classList.add('is-closed');
      state = 'Closed now';
      if (now.min < h[0]) detail = 'Opens today at ' + fmt(h[0]);
      else { var nd = (now.day + 1) % 7; detail = 'Opens ' + (nd === (now.day + 1) % 7 ? 'tomorrow' : DAYS[nd]) + ' at ' + fmt(HOURS[nd][0]); }
    }
    var s = el.querySelector('.state'), d = el.parentElement.querySelector('.open-detail');
    if (s) s.textContent = state;
    if (d) d.textContent = detail;
  });
  document.querySelectorAll('.hours tr[data-day]').forEach(function (tr) {
    if (tr.getAttribute('data-day').split(',').indexOf(String(now.day)) > -1) tr.classList.add('is-today');
  });

  /* ---- insurance finder (filter only, nothing is sent anywhere) ---- */
  document.querySelectorAll('[data-finder]').forEach(function (root) {
    var form = root.querySelector('form');
    var input = root.querySelector('input');
    var out = root.querySelector('.finder-result');
    var list = document.getElementById(root.getAttribute('data-finder'));
    if (!input || !list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll('li'));
    function norm(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
    function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function run() {
      var q = norm(input.value);
      var hits = [];
      items.forEach(function (li) {
        var hay = norm(li.textContent + ' ' + (li.getAttribute('data-alt') || ''));
        var m = q.length > 0 && hay.indexOf(q) > -1;
        li.hidden = q.length > 0 && !m;
        li.classList.toggle('is-match', m);
        if (m) hits.push(li.textContent.trim());
      });
      out.className = 'finder-result';
      if (!q) { out.innerHTML = ''; return; }
      if (hits.length) {
        out.classList.add('is-yes');
        var names = hits.length > 3 ? hits.slice(0, 3).join(', ') + ' and ' + (hits.length - 3) + ' more' : hits.join(hits.length === 2 ? ' and ' : ', ');
        out.innerHTML = '<strong>Yes, we take ' + esc(names) + '.</strong>Bring your card, or just tell us your member ID over the phone. We’ll handle the rest.';
      } else {
        out.classList.add('is-no');
        out.innerHTML = '<strong>“' + esc(input.value.trim()) + '” isn’t on our list.</strong>Call us at <a href="tel:+12125550142">(212) 555-0142</a> and we’ll check your plan in about 2 minutes. If it’s not covered, we’ll find you the best cash price.';
      }
    }
    input.addEventListener('input', run);
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); run(); });
  });
})();
