/* Meridian Pharmacy — live open status (New York time), menu + need sheets (native <dialog>),
   service rail arrows, insurance filter and the refill text builder. The page reads fine without JS. */
(function () {
  'use strict';

  var PHONE = '+12125550148';
  /* Opening hours in minutes after midnight, keyed by day (0 = Sunday). */
  var HOURS = {
    0: [600, 1080], 1: [480, 1260], 2: [480, 1260], 3: [480, 1260],
    4: [480, 1260], 5: [480, 1260], 6: [540, 1140]
  };

  function nyNow() {
    var parts = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    var dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
    return { dow: dow, min: (+parts.hour % 24) * 60 + (+parts.minute) };
  }
  function clock(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    return ((h % 12) || 12) + (m ? ':' + ('0' + m).slice(-2) : '') + (h >= 12 ? ' pm' : ' am');
  }

  /* ---- Live status ---- */
  function renderStatus() {
    var now = nyNow();
    var today = HOURS[now.dow];
    var open = now.min >= today[0] && now.min < today[1];
    var text;
    if (open) {
      text = (today[1] - now.min <= 60 ? 'Open now, closing soon at ' : 'Open now until ') + clock(today[1]);
    } else if (now.min < today[0]) {
      text = 'Closed now, opens today at ' + clock(today[0]);
    } else {
      text = 'Closed now, opens tomorrow at ' + clock(HOURS[(now.dow + 1) % 7][0]);
    }
    document.querySelectorAll('[data-status]').forEach(function (el) {
      el.classList.toggle('is-open', open);
      var t = el.querySelector('[data-status-text]');
      if (t) t.textContent = text;
    });
    document.querySelectorAll('.hours tr').forEach(function (tr) {
      var isToday = tr.getAttribute('data-day') === String(now.dow);
      tr.classList.toggle('is-today', isToday);
      if (isToday) tr.setAttribute('aria-current', 'date'); else tr.removeAttribute('aria-current');
    });
  }
  renderStatus();
  setInterval(renderStatus, 60000);

  /* ---- Dialog helpers (menu + need sheets) ---- */
  var canDialog = typeof HTMLDialogElement === 'function';
  var lastOpener = null;

  function openDialog(dlg, opener) {
    if (!dlg || !canDialog) return;
    lastOpener = opener || null;
    dlg.showModal();
    if (opener && opener.hasAttribute('aria-expanded')) opener.setAttribute('aria-expanded', 'true');
  }

  document.querySelectorAll('dialog').forEach(function (dlg) {
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) { dlg.close(); return; } /* backdrop click */
      if (e.target.closest('[data-close]')) dlg.close();
      var a = e.target.closest('a[href^="#"]');
      if (a) { dlg.dataset.viaLink = '1'; dlg.close(); } /* in-page link: let the browser move on */
    });
    dlg.addEventListener('close', function () {
      if (lastOpener) {
        if (lastOpener.hasAttribute('aria-expanded')) lastOpener.setAttribute('aria-expanded', 'false');
        if (!dlg.dataset.viaLink) lastOpener.focus();
      }
      lastOpener = null;
      delete dlg.dataset.viaLink;
    });
  });

  var menu = document.getElementById('menu');
  var menuBtn = document.querySelector('[data-menu-open]');
  if (menu && menuBtn && canDialog) {
    menuBtn.hidden = false;
    menuBtn.addEventListener('click', function () { openDialog(menu, menuBtn); });
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (mq) {
      if (mq.matches && menu.open) menu.close();
    });
  }

  document.querySelectorAll('[data-sheet]').forEach(function (btn) {
    var dlg = document.getElementById(btn.getAttribute('data-sheet'));
    btn.addEventListener('click', function () {
      if (canDialog) openDialog(dlg, btn);
      else if (dlg) { dlg.setAttribute('open', ''); dlg.scrollIntoView(); }
    });
  });

  /* ---- Rail arrows ---- */
  var rail = document.querySelector('[data-rail-list]');
  var ctrl = document.querySelector('[data-rail-ctrl]');
  if (rail && ctrl) {
    var prev = ctrl.querySelector('[data-rail="-1"]');
    var next = ctrl.querySelector('[data-rail="1"]');
    var sync = function () {
      var max = rail.scrollWidth - rail.clientWidth;
      ctrl.hidden = max < 8;
      prev.disabled = rail.scrollLeft <= 4;
      next.disabled = rail.scrollLeft >= max - 4;
    };
    ctrl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-rail]');
      if (!b) return;
      var tile = rail.querySelector('li');
      var step = tile ? tile.getBoundingClientRect().width + 20 : 340;
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      rail.scrollBy({ left: step * +b.getAttribute('data-rail'), behavior: reduce ? 'auto' : 'smooth' });
    });
    rail.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }

  /* ---- Insurance filter ---- */
  var q = document.getElementById('plan-q');
  var plans = document.querySelectorAll('[data-plans] li');
  var none = document.querySelector('[data-plans-none]');
  var count = document.getElementById('plan-count');
  function norm(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }
  if (q && plans.length) {
    var total = plans.length;
    q.addEventListener('input', function () {
      var term = norm(q.value);
      var shown = 0;
      plans.forEach(function (li) {
        var hit = !term || norm(li.textContent).indexOf(term) !== -1;
        li.hidden = !hit;
        if (hit) shown++;
      });
      if (none) none.hidden = shown !== 0;
      if (count) {
        count.textContent = !term ? total + ' plans most people ask about'
          : shown === 0 ? 'No match on this list'
          : shown === 1 ? '1 plan matches' : shown + ' plans match';
      }
    });
  }

  /* ---- Refill text builder ---- */
  var builder = document.querySelector('[data-builder]');
  if (builder) {
    var msg = builder.querySelector('[data-msg]');
    var sms = builder.querySelector('[data-sms]');
    var state = { about: 'a refill', how: 'pick it up in the store' };
    var build = function () {
      var detail = state.about === 'transferring my prescriptions'
        ? 'My name, date of birth and my old pharmacy:'
        : state.about === 'a fertility order'
          ? 'My name, date of birth and my clinic:'
          : 'My name, date of birth and Rx number:';
      var text = 'Hi Meridian, I’m texting about ' + state.about + '. I’d like to ' + state.how + '. ' + detail + ' ';
      msg.textContent = text.trim();
      sms.href = 'sms:' + PHONE + '?&body=' + encodeURIComponent(text);
    };
    builder.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      var key = chip.hasAttribute('data-about') ? 'about' : 'how';
      chip.parentNode.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      state[key] = chip.getAttribute('data-' + key);
      build();
    });
    build();
  }
})();
