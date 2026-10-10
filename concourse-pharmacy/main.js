/* Concourse All-Night Pharmacy — language toggle, New York night clock,
   mobile menu and the text-a-refill message builder. No data is collected or sent. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  var PHONE = '+17185550142';
  var TZ = 'America/New_York';

  /* ---------- Language ---------- */
  var TITLES = {
    en: 'Concourse All-Night Pharmacy — Open 24 hours on the Grand Concourse, Bronx',
    es: 'Concourse All-Night Pharmacy — Farmacia abierta 24 horas en el Grand Concourse, Bronx'
  };
  /* aria-labels that need translating: [selector, en, es] */
  var LABELS = [
    ['#nav', 'Main', 'Principal'],
    ['.dock', 'Quick actions', 'Acciones rápidas'],
    ['.duo', 'Transfers and delivery', 'Transferencias y entregas'],
    ['.board__list', 'Plans we work with, including', 'Planes con los que trabajamos, entre ellos']
  ];

  function getStored() { try { return localStorage.getItem('cp-lang'); } catch (e) { return null; } }
  function store(l) { try { localStorage.setItem('cp-lang', l); } catch (e) { /* private mode */ } }

  function lang() { return root.getAttribute('lang') === 'es' ? 'es' : 'en'; }

  function setLang(l, save) {
    root.setAttribute('lang', l);
    document.title = TITLES[l];
    [].forEach.call(document.querySelectorAll('[data-set-lang]'), function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === l));
    });
    LABELS.forEach(function (x) {
      var el = document.querySelector(x[0]);
      if (el) el.setAttribute('aria-label', l === 'es' ? x[2] : x[1]);
    });
    if (save) store(l);
    tick();
    buildSms();
  }

  [].forEach.call(document.querySelectorAll('[data-set-lang]'), function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-set-lang'), true); });
  });

  /* ---------- New York clock ---------- */
  var tEl = document.getElementById('clock-time');
  var apEl = document.getElementById('clock-ap');
  var dEl = document.getElementById('clock-date');
  var noteEl = document.getElementById('sign-note');
  var delEl = document.getElementById('delivery-now');

  var partsFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: false });
  var dateFmt = {
    en: new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'long', month: 'long', day: 'numeric' }),
    es: new Intl.DateTimeFormat('es-US', { timeZone: TZ, weekday: 'long', month: 'long', day: 'numeric' })
  };

  var NOTES = [
    /* [fromHour, en, es] — whichever matches last wins */
    [0, 'Middle of the night? This is what we’re here for. Walk right in.', '¿En plena madrugada? Para eso estamos. Pase adelante.'],
    [5, 'Early morning. Counter open, pharmacist on duty.', 'Temprano en la mañana. Mostrador abierto, farmacéutico de turno.'],
    [9, 'Daytime. Delivery is running today; call to set it up.', 'De día. Hoy hay entregas a domicilio; llame para coordinar.'],
    [18, 'Evening. We stay open all night, so there’s no rush.', 'De noche. Seguimos abiertos toda la noche, no hay apuro.'],
    [22, 'Late night. Lights on, pharmacist on duty until morning and after.', 'Tarde en la noche. Luces prendidas y farmacéutico de turno hasta la mañana y más.']
  ];

  function nyParts(now) {
    var o = {};
    partsFmt.formatToParts(now).forEach(function (p) { o[p.type] = p.value; });
    var h = parseInt(o.hour, 10) % 24;
    return { h: h, m: o.minute };
  }

  function tick() {
    var now = new Date();
    var p = nyParts(now);
    var l = lang();
    var h12 = p.h % 12 || 12;
    if (tEl) {
      tEl.textContent = h12 + ':' + p.m;
      tEl.setAttribute('datetime', (p.h < 10 ? '0' : '') + p.h + ':' + p.m);
    }
    if (apEl) apEl.textContent = p.h < 12 ? (l === 'es' ? 'a. m.' : 'AM') : (l === 'es' ? 'p. m.' : 'PM');
    if (dEl) {
      var d = dateFmt[l].format(now);
      dEl.textContent = d.charAt(0).toUpperCase() + d.slice(1);
    }
    var note = NOTES[0];
    NOTES.forEach(function (n) { if (p.h >= n[0]) note = n; });
    if (noteEl) noteEl.textContent = l === 'es' ? note[2] : note[1];
    if (delEl) {
      var day = p.h >= 9 && p.h < 18;
      delEl.hidden = false;
      delEl.textContent = day
        ? (l === 'es' ? 'Ahora mismo: estamos en horario de entregas. Llame para pedir la suya.' : 'Right now: it’s delivery hours. Call to arrange yours.')
        : (l === 'es' ? 'Ahora mismo: entregas en pausa hasta la mañana. El mostrador está abierto.' : 'Right now: delivery is paused until morning. The counter is open.');
    }
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector('.menu-b');
  var nav = document.getElementById('nav');
  var mq = window.matchMedia('(min-width: 60em)');

  function closeMenu(focusBtn) {
    nav.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    if (focusBtn) menuBtn.focus();
  }
  if (menuBtn && nav) {
    menuBtn.hidden = false;
    menuBtn.addEventListener('click', function () {
      var open = menuBtn.getAttribute('aria-expanded') !== 'true';
      nav.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      if (open) { var a = nav.querySelector('a'); if (a) a.focus(); }
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a') && !mq.matches) closeMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) closeMenu(true);
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !menuBtn.contains(e.target)) closeMenu(false);
    });
    nav.addEventListener('focusout', function (e) {
      if (nav.classList.contains('is-open') && e.relatedTarget && !nav.contains(e.relatedTarget) && e.relatedTarget !== menuBtn) closeMenu(false);
    });
    var onMq = function () { if (mq.matches) closeMenu(false); };
    if (mq.addEventListener) mq.addEventListener('change', onMq); else mq.addListener(onMq);
  }

  /* ---------- Text-a-refill builder (no inputs; user fills blanks in their own app) ---------- */
  var smsLink = document.getElementById('sms-link');
  var preview = document.getElementById('sms-preview');
  var pick = 'asap';
  var PICK = {
    en: { asap: 'as soon as it’s ready', morning: 'in the morning', later: 'later in the day' },
    es: { asap: 'en cuanto esté listo', morning: 'en la mañana', later: 'más tarde en el día' }
  };

  function buildSms() {
    if (!smsLink) return;
    var l = lang();
    var body = l === 'es'
      ? 'Resurtido de receta\nNombre: \nFecha de nacimiento: \nNúmero Rx: \nLo recojo ' + PICK.es[pick] + '.'
      : 'Refill request\nName: \nDate of birth: \nRx number: \nPicking up ' + PICK.en[pick] + '.';
    smsLink.href = 'sms:' + PHONE + '?&body=' + encodeURIComponent(body);
    if (preview) preview.textContent = body.replace(/: \n/g, ': ____\n');
  }

  [].forEach.call(document.querySelectorAll('[data-pick]'), function (b) {
    b.addEventListener('click', function () {
      pick = b.getAttribute('data-pick');
      [].forEach.call(document.querySelectorAll('[data-pick]'), function (x) {
        x.setAttribute('aria-pressed', String(x === b));
      });
      buildSms();
    });
  });

  /* ---------- Init ---------- */
  var initial = getStored();
  if (initial !== 'en' && initial !== 'es') {
    initial = (navigator.language || '').toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
  }
  setLang(initial, false);
  /* Re-render on the minute boundary, then every 15 s as a safety net */
  setInterval(tick, 15000);
  setTimeout(function () { tick(); setInterval(tick, 60000); }, 60000 - (Date.now() % 60000) + 50);
})();
