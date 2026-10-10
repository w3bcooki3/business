/* La Cumbre Pharmacy — language toggle, live open status, timetable, menu,
   services photo preview, current-section nav and the text-message builder.
   Without JS the page still reads in English with static hours. */
(function () {
  'use strict';

  var root = document.documentElement;
  var STORE = 'lacumbre-lang';
  var PHONE = '+12125550148';
  var OPEN = 8 * 60, CLOSE = 22 * 60; /* every day, minutes after midnight, New York time */

  var T = {
    en: {
      title: 'La Cumbre Pharmacy · Farmacia La Cumbre | Dyckman St, Inwood',
      openUntil: 'Open now, until 10 pm',
      closedToday: 'Closed now. Opens today at 8 am',
      closedTomorrow: 'Closed now. Opens tomorrow at 8 am',
      today: 'Today',
      sms: {
        refill: 'Hi La Cumbre! I need a refill.\nName: \nDate of birth: \nRx number: ',
        transfer: 'Hi La Cumbre! I’d like to transfer my prescriptions to you.\nName: \nDate of birth: \nOld pharmacy (name and phone): ',
        plan: 'Hi La Cumbre! I have a question about my plan (Medicaid / Child Health Plus / Essential Plan / other): ',
        question: 'Hi La Cumbre! I have a question: ',
        pickup: '\nI’ll pick it up at the pharmacy.',
        delivery: '\nPlease deliver it. My address: '
      }
    },
    es: {
      title: 'Farmacia La Cumbre · La Cumbre Pharmacy | Dyckman St, Inwood',
      openUntil: 'Abierto ahora, hasta las 10 pm',
      closedToday: 'Cerrado ahora. Abre hoy a las 8 am',
      closedTomorrow: 'Cerrado ahora. Abre mañana a las 8 am',
      today: 'Hoy',
      sms: {
        refill: '¡Hola, La Cumbre! Necesito un refill.\nNombre: \nFecha de nacimiento: \nNúmero Rx: ',
        transfer: '¡Hola, La Cumbre! Quiero pasar mis recetas para ustedes.\nNombre: \nFecha de nacimiento: \nFarmacia anterior (nombre y teléfono): ',
        plan: '¡Hola, La Cumbre! Tengo una pregunta sobre mi seguro (Medicaid / Child Health Plus / Essential Plan / otro): ',
        question: '¡Hola, La Cumbre! Tengo una pregunta: ',
        pickup: '\nLa recojo en la farmacia.',
        delivery: '\nPor favor, tráiganmela. Mi dirección: '
      }
    }
  };

  function lang() { return root.lang === 'es' ? 'es' : 'en'; }
  function t() { return T[lang()]; }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- Time in New York ---------- */
  function nyNow() {
    var o = {};
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
        .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    } catch (e) {
      var d = new Date();
      return { dow: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
    return { dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), min: ((+o.hour) % 24) * 60 + (+o.minute) };
  }

  /* ---------- Status + timetable ---------- */
  function renderStatus() {
    var s = t(), now = nyNow();
    var isOpen = now.min >= OPEN && now.min < CLOSE;
    var text = isOpen ? s.openUntil : (now.min < OPEN ? s.closedToday : s.closedTomorrow);
    $$('[data-status]').forEach(function (el) {
      el.classList.toggle('is-open', isOpen);
      el.classList.toggle('is-closed', !isOpen);
    });
    $$('[data-status-text]').forEach(function (el) { el.textContent = text; });

    $$('.timetable tbody tr').forEach(function (tr) {
      var isToday = +tr.getAttribute('data-d') === now.dow;
      tr.classList.toggle('is-today', isToday);
      var old = tr.querySelector('.tt__today');
      if (old) old.parentNode.removeChild(old);
      if (isToday) {
        var b = document.createElement('span');
        b.className = 'tt__today';
        b.textContent = s.today;
        tr.querySelector('th').appendChild(b);
        tr.style.setProperty('--now', (now.min / 1440 * 100).toFixed(2) + '%');
      }
    });
  }

  /* ---------- Language ---------- */
  function setLang(l, save) {
    root.lang = l;
    if (save) { try { localStorage.setItem(STORE, l); } catch (e) { /* storage blocked: the choice lasts for this visit */ } }
    $$('[data-set-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === l)); });
    $$('[data-i18n-alt], [data-i18n-aria-label]').forEach(function (el) {
      ['alt', 'aria-label'].forEach(function (name) {
        var v = el.getAttribute('data-i18n-' + name);
        if (v) { var pair = v.split('||'); el.setAttribute(name, l === 'es' ? pair[1] : pair[0]); }
      });
    });
    document.title = t().title;
    renderStatus();
    renderSms();
    syncCaption();
  }
  $$('[data-set-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-set-lang'), true); });
  });

  /* ---------- Full-screen menu ---------- */
  var menu = document.getElementById('menu');
  var openBtn = document.querySelector('[data-menu-open]');
  var lastFocus = null;
  function focusables() {
    return $$('a[href], button:not([disabled])', menu).filter(function (el) { return el.offsetParent !== null; });
  }
  function openMenu() {
    lastFocus = document.activeElement;
    menu.hidden = false;
    root.classList.add('is-locked');
    openBtn.setAttribute('aria-expanded', 'true');
    menu.querySelector('[data-menu-close]').focus();
  }
  function closeMenu(restore) {
    if (menu.hidden) return;
    menu.hidden = true;
    root.classList.remove('is-locked');
    openBtn.setAttribute('aria-expanded', 'false');
    if (restore !== false && lastFocus) lastFocus.focus();
  }
  if (menu && openBtn) {
    openBtn.addEventListener('click', openMenu);
    menu.querySelector('[data-menu-close]').addEventListener('click', function () { closeMenu(); });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a[href^="#"]')) closeMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (menu.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
      if (e.key === 'Tab') {
        var f = focusables(), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.matchMedia('(min-width: 1100px)').addEventListener('change', function (m) { if (m.matches) closeMenu(false); });
  }

  /* ---------- Services: photo beside the row (desktop) ---------- */
  var cap = document.querySelector('[data-preview-cap]');
  var activeRow = document.querySelector('.index__row');
  function syncCaption() {
    if (!cap || !activeRow) return;
    var name = activeRow.querySelector('.index__name [lang="' + lang() + '"]');
    cap.textContent = name ? name.textContent : '';
  }
  function showRow(row) {
    if (!row || row === activeRow) return;
    activeRow = row;
    var key = row.getAttribute('data-img');
    $$('.preview__img').forEach(function (img) { img.classList.toggle('is-on', img.getAttribute('data-preview') === key); });
    syncCaption();
  }
  $$('.index__row').forEach(function (row) {
    row.addEventListener('mouseenter', function () { showRow(row); });
    row.addEventListener('focusin', function () { showRow(row); });
    row.querySelector('details').addEventListener('toggle', function (e) { if (e.target.open) showRow(row); });
  });

  /* ---------- Current section in the left column ---------- */
  var navLinks = $$('.rail__nav a');
  var sections = navLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var ticking = false;
  function markCurrent() {
    ticking = false;
    var line = window.innerHeight * 0.4, current = -1;
    sections.forEach(function (sec, i) { if (sec && sec.getBoundingClientRect().top <= line) current = i; });
    navLinks.forEach(function (a, i) {
      a.classList.toggle('is-current', i === current);
      if (i === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  if (navLinks.length) {
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(markCurrent); } }, { passive: true });
    markCurrent();
  }

  /* ---------- Text-message builder (buttons only; no personal data on the page) ---------- */
  var pick = { need: 'refill', get: 'pickup' };
  var preview = document.querySelector('[data-sms-preview]');
  var smsLink = document.querySelector('[data-sms-link]');
  var getBlock = document.querySelector('[data-get-block]');
  function renderSms() {
    if (!preview || !smsLink) return;
    var m = t().sms, needsGet = pick.need === 'refill' || pick.need === 'transfer';
    var body = m[pick.need] + (needsGet ? m[pick.get] : '');
    if (getBlock) getBlock.hidden = !needsGet;
    preview.textContent = body;
    smsLink.href = 'sms:' + PHONE + '?&body=' + encodeURIComponent(body);
  }
  $$('[data-opts]').forEach(function (group) {
    var key = group.getAttribute('data-opts');
    group.addEventListener('click', function (e) {
      var b = e.target.closest('.opt');
      if (!b) return;
      pick[key] = b.getAttribute('data-v');
      $$('.opt', group).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
      renderSms();
    });
  });

  /* ---------- Start ---------- */
  setLang(lang(), false);
  setInterval(renderStatus, 60000);
})();
