/* Mott Street Pharmacy — language toggle, menu, live open status, text-a-refill builder. */
(function () {
  'use strict';
  var root = document.documentElement;
  var PHONE = '+12125550168';

  /* ---------- language ---------- */
  var TITLE = {
    en: 'Mott Street Pharmacy 勿街藥房 — Chinatown, Manhattan, since 1979',
    zh: '勿街藥房 Mott Street Pharmacy — 紐約華埠，1979年創立'
  };
  var LABELS = {
    en: { nav: 'Main', dock: 'Quick actions', tongues: 'Languages spoken' },
    zh: { nav: '主要目錄', dock: '快速聯絡', tongues: '我們講的語言' }
  };
  function lang() { return root.lang === 'zh-Hant' ? 'zh' : 'en'; }
  function setLang(l, save) {
    root.lang = l === 'zh' ? 'zh-Hant' : 'en';
    document.title = TITLE[l];
    document.getElementById('nav').setAttribute('aria-label', LABELS[l].nav);
    document.querySelector('.dock').setAttribute('aria-label', LABELS[l].dock);
    document.querySelector('.tongues').setAttribute('aria-label', LABELS[l].tongues);
    if (save) { try { localStorage.setItem('msp-lang', l); } catch (e) { /* storage unavailable */ } }
    status(); sms();
  }
  document.getElementById('langBtn').addEventListener('click', function () {
    setLang(lang() === 'zh' ? 'en' : 'zh', true);
  });

  /* ---------- mobile menu (disclosure) ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var nav = document.getElementById('nav');
  function closeMenu(focus) {
    if (menuBtn.getAttribute('aria-expanded') !== 'true') return;
    menuBtn.setAttribute('aria-expanded', 'false');
    root.classList.remove('menu-open');
    if (focus) menuBtn.focus();
  }
  menuBtn.addEventListener('click', function () {
    var open = menuBtn.getAttribute('aria-expanded') !== 'true';
    menuBtn.setAttribute('aria-expanded', String(open));
    root.classList.toggle('menu-open', open);
    if (open) { var first = nav.querySelector('a'); if (first) first.focus(); }
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(true); });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#nav') && !e.target.closest('#menuBtn')) closeMenu(false);
  });

  /* ---------- open status (New York time) ---------- */
  var HOURS = { 0: [600, 960], 1: [540, 1140], 2: [540, 1140], 3: [540, 1140], 4: [540, 1140], 5: [540, 1140], 6: [540, 1140] };
  var DAY = {
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    zh: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  };
  function nyNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
      var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
      return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), m: (+o.hour % 24) * 60 + (+o.minute) };
    } catch (e) { return null; }
  }
  function t(min, l) {
    var h = Math.floor(min / 60);
    if (l === 'zh') return (h < 12 ? '上午' : (h < 18 ? '下午' : '晚上')) + (h > 12 ? h - 12 : h) + '時';
    return (h > 12 ? h - 12 : h) + (h < 12 ? ' am' : ' pm');
  }
  var statusEl = document.getElementById('status');
  var statusTxt = document.getElementById('statusTxt');
  function status() {
    var n = nyNow(); if (!n || n.d < 0) return;
    var l = lang(), h = HOURS[n.d], txt, state;
    if (n.m >= h[0] && n.m < h[1]) {
      state = h[1] - n.m <= 45 ? 'soon' : 'open';
      txt = l === 'zh'
        ? (state === 'soon' ? '即將關門 · 今天' + t(h[1], l) + '關門' : '營業中 · 今天營業至' + t(h[1], l))
        : (state === 'soon' ? 'Closing soon · closes at ' + t(h[1], l) : 'Open now · until ' + t(h[1], l) + ' today');
    } else if (n.m < h[0]) {
      state = 'closed';
      txt = l === 'zh' ? '休息中 · 今天' + t(h[0], l) + '開門' : 'Closed now · opens at ' + t(h[0], l) + ' today';
    } else {
      state = 'closed';
      var nd = (n.d + 1) % 7;
      txt = l === 'zh'
        ? '休息中 · 明天（' + DAY.zh[nd] + '）' + t(HOURS[nd][0], l) + '開門'
        : 'Closed now · opens ' + DAY.en[nd] + ' at ' + t(HOURS[nd][0], l);
    }
    statusEl.dataset.state = state;
    statusTxt.textContent = txt;
    [].forEach.call(document.querySelectorAll('.hours__t tr'), function (tr) {
      tr.classList.toggle('is-today', tr.dataset.days.split(',').indexOf(String(n.d)) > -1);
    });
  }
  status();
  setInterval(status, 60000);

  /* ---------- text-a-refill builder ---------- */
  var pick = { get: 'pickup', reply: 'yue', large: false, bi: false };
  var REPLY = {
    en: { yue: 'Cantonese', cmn: 'Mandarin', tsn: 'Toishanese', en: 'English' },
    zh: { yue: '廣東話', cmn: '普通話', tsn: '台山話', en: '英語' }
  };
  function message(l) {
    var r = REPLY[l][pick.reply];
    if (l === 'zh') {
      return '勿街藥房你好，我想續藥。' +
        (pick.get === 'deliver' ? '請送藥上門。' : '我會到店自取。') +
        '請用' + r + '回覆。' +
        (pick.large ? '請用大字標籤。' : '') +
        (pick.bi ? '請用中英雙語標籤。' : '') +
        '\n姓名：\n出生日期：\n處方號碼：';
    }
    return 'Hello Mott Street Pharmacy, I would like a refill. ' +
      (pick.get === 'deliver' ? 'Please deliver it to me. ' : 'I will pick it up. ') +
      'Please reply in ' + r + '.' +
      (pick.large ? ' Large-print labels, please.' : '') +
      (pick.bi ? ' English and Chinese labels, please.' : '') +
      '\nName:\nDate of birth:\nRx number:';
  }
  var preview = document.getElementById('smsPreview');
  var link = document.getElementById('smsLink');
  function sms() {
    var m = message(lang());
    preview.textContent = m;
    link.href = 'sms:' + PHONE + '?&body=' + encodeURIComponent(m);
  }
  [].forEach.call(document.querySelectorAll('#smsTool .chip'), function (b) {
    b.addEventListener('click', function () {
      var k = b.dataset.k;
      if (b.classList.contains('chip--tog')) {
        pick[k] = !pick[k];
        b.setAttribute('aria-pressed', String(pick[k]));
      } else {
        pick[k] = b.dataset.v;
        [].forEach.call(document.querySelectorAll('#smsTool .chip[data-k="' + k + '"]'), function (o) {
          o.setAttribute('aria-pressed', String(o === b));
        });
      }
      sms();
    });
  });

  setLang(lang(), false);
})();
