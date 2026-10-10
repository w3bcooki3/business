/* Harborview Pharmacy & Surgical
   Open status, promo carousel, site search, product filter,
   text-message builder, menu dialog. Without JavaScript every link and
   the full hours, products and services still work. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PHONE = '+17185550148';

  /* ---------- Open status (America/New_York) ---------- */
  var HOURS = { 0: [600, 960], 1: [540, 1260], 2: [540, 1260], 3: [540, 1260], 4: [540, 1260], 5: [540, 1260], 6: [540, 1080] };
  var DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function nyNow() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { dow: SHORT.indexOf(o.weekday), min: (+o.hour % 24) * 60 + (+o.minute) };
  }
  function clock(m) {
    var h = Math.floor(m / 60), mm = m % 60;
    return ((h % 12) || 12) + (mm ? ':' + ('0' + mm).slice(-2) : '') + (h >= 12 ? ' pm' : ' am');
  }
  function updateStatus() {
    var now = nyNow(), today = HOURS[now.dow];
    var open = !!(today && now.min >= today[0] && now.min < today[1]);
    var text;
    if (open) text = 'Open now until ' + clock(today[1]);
    else if (today && now.min < today[0]) text = 'Closed, opens at ' + clock(today[0]);
    else {
      var nd = (now.dow + 1) % 7;
      text = 'Closed, opens tomorrow ' + clock(HOURS[nd][0]);
    }
    document.documentElement.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('is-closed', !open);
    $$('.js-status').forEach(function (el) { el.textContent = text; });
    $$('.js-today').forEach(function (el) {
      el.textContent = 'Today ' + clock(today[0]) + ' – ' + clock(today[1]);
    });
    $$('#hoursTable tr').forEach(function (tr) {
      var isToday = +tr.getAttribute('data-d') === now.dow;
      tr.classList.toggle('is-today', isToday);
      var tag = $('.today-tag', tr);
      if (isToday && !tag) {
        tag = document.createElement('span');
        tag.className = 'today-tag';
        tag.textContent = 'Today';
        tr.firstElementChild.appendChild(tag);
      } else if (!isToday && tag) tag.remove();
    });
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  /* ---------- Menu dialog ---------- */
  var menu = $('#menu'), menuBtn = $('#menuBtn');
  if (menu && menuBtn && typeof menu.showModal === 'function') {
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.addEventListener('click', function () {
      menu.showModal();
      menuBtn.setAttribute('aria-expanded', 'true');
      $('#menuClose').focus();
    });
    $('#menuClose').addEventListener('click', function () { menu.close(); });
    menu.addEventListener('close', function () {
      menuBtn.setAttribute('aria-expanded', 'false');
      if (!menu.dataset.nav) menuBtn.focus();
      delete menu.dataset.nav;
    });
    menu.addEventListener('click', function (e) {
      if (e.target === menu) { menu.close(); return; }
      if (e.target.closest('a[href^="#"]')) { menu.dataset.nav = '1'; menu.close(); }
    });
  } else if (menuBtn) {
    menuBtn.hidden = true;
  }

  /* ---------- Promo carousel ---------- */
  var hero = $('#hero');
  if (hero) {
    var slides = $$('.slide', hero), dots = $$('.hero__dot', hero);
    var pauseBtn = $('#heroPause'), viewport = $('#heroViewport');
    var idx = 0, timer = null, userPaused = reduceMotion, hoverPause = false;

    var show = function (n) {
      idx = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        var on = i === idx;
        s.classList.toggle('is-active', on);
        if (on) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
        $$('img', s).forEach(function (img) { if (on) img.loading = 'eager'; });
      });
      dots.forEach(function (d, i) {
        if (i === idx) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
    };
    var tick = function () {
      clearInterval(timer);
      timer = null;
      if (!userPaused && !hoverPause) timer = setInterval(function () { show(idx + 1); }, 7000);
    };
    var setPaused = function (p) {
      userPaused = p;
      hero.classList.toggle('is-paused', p);
      pauseBtn.setAttribute('aria-label', p ? 'Play slides' : 'Pause slides');
      tick();
    };

    $('#heroPrev').addEventListener('click', function () { show(idx - 1); tick(); });
    $('#heroNext').addEventListener('click', function () { show(idx + 1); tick(); });
    dots.forEach(function (d) { d.addEventListener('click', function () { show(+d.dataset.go); tick(); }); });
    pauseBtn.addEventListener('click', function () { setPaused(!userPaused); });

    /* Pause while the pointer or keyboard focus is inside the carousel. */
    hero.addEventListener('mouseenter', function () { hoverPause = true; tick(); });
    hero.addEventListener('mouseleave', function () { hoverPause = false; tick(); });
    hero.addEventListener('focusin', function () { hoverPause = true; tick(); });
    hero.addEventListener('focusout', function (e) { if (!hero.contains(e.relatedTarget)) { hoverPause = false; tick(); } });

    /* Swipe */
    $$('img', viewport).forEach(function (img) { img.draggable = false; });
    var x0 = null, y0 = 0;
    viewport.addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY; });
    viewport.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0, dy = e.clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { show(idx + (dx < 0 ? 1 : -1)); tick(); }
    });
    viewport.addEventListener('pointercancel', function () { x0 = null; });

    show(0);
    setPaused(userPaused);
  }

  /* ---------- Product filter ---------- */
  var chips = $$('.chip'), prods = $$('.prod'), count = $('#count');
  var LABEL = {};
  chips.forEach(function (c) { LABEL[c.dataset.filter] = c.textContent; });
  function applyFilter(f) {
    if (!LABEL[f]) f = 'all';
    var n = 0;
    prods.forEach(function (p) {
      var on = f === 'all' || p.dataset.cat === f;
      p.hidden = !on;
      if (on) n++;
    });
    chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.filter === f)); });
    count.textContent = f === 'all' ? 'Showing all ' + n + ' items' : 'Showing ' + n + ' items in ' + LABEL[f];
  }
  chips.forEach(function (c) { c.addEventListener('click', function () { applyFilter(c.dataset.filter); }); });
  /* Department links elsewhere on the page filter the grid, then jump to it. */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-filter]');
    if (!a) return;
    applyFilter(a.dataset.filter);
    setTimeout(function () { var h = $('#shop-h'); if (h) h.focus({ preventScroll: true }); }, 0);
  });

  /* "Text to hold one" links get a prefilled message. */
  prods.forEach(function (p) {
    var a = $('.prod__hold', p);
    if (!a) return;
    var verb = /order/i.test(a.textContent) ? 'order' : 'hold';
    var name = p.dataset.name.charAt(0).toLowerCase() + p.dataset.name.slice(1);
    a.href = sms('Hi Harborview, could you ' + verb + ' one ' + name + ' (listed at ' + p.dataset.price + ') for me? I’ll pick it up at the store.');
  });

  function sms(body) { return 'sms:' + PHONE + '?&body=' + encodeURIComponent(body); }

  /* ---------- Text-message builder ---------- */
  var msg = $('#msg'), msgLink = $('#msgLink');
  if (msg && msgLink) {
    var NEED = {
      refill: 'I’d like to refill a prescription.',
      transfer: 'I’d like to transfer my prescriptions to Harborview.',
      equipment: 'I have a question about medical equipment.'
    };
    var HOW = {
      counter: 'I’ll pick it up at the counter.',
      window: 'I’ll pick it up at the drive-up window.',
      delivery: 'I’d like it delivered to my home.'
    };
    var TAIL = {
      refill: 'My name, date of birth and Rx number:',
      transfer: 'My old pharmacy, my name and date of birth:',
      equipment: 'What I need:'
    };
    var build = function () {
      var need = ($('input[name="need"]:checked') || {}).value || 'refill';
      var how = ($('input[name="how"]:checked') || {}).value || 'counter';
      var text = 'Hi Harborview, ' + NEED[need] + ' ' + HOW[how] + ' ' + TAIL[need] + ' ';
      msg.textContent = text;
      msgLink.href = sms(text);
    };
    $$('.seg input').forEach(function (i) { i.addEventListener('change', build); });
    build();
  }

  /* ---------- Site search ---------- */
  var q = $('#q'), panel = $('#q-panel'), list = $('#q-results'), empty = $('#q-empty'), status = $('#q-status');
  if (!q) return;

  var index = [];
  function add(label, type, el, keys, action) {
    if (!el) return;
    index.push({ label: label.trim(), type: type, el: el, hay: (label + ' ' + (keys || '')).toLowerCase(), action: action });
  }
  var text = function (el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; };

  prods.forEach(function (p) {
    add(p.dataset.name + ' ' + p.dataset.price, 'Product', p, LABEL[p.dataset.cat] + ' ' + text($('.prod__spec', p)) + ' ' + text($('.badge', p)), 'product');
  });
  chips.forEach(function (c) {
    if (c.dataset.filter !== 'all') add(c.textContent + ' department', 'Department', $('#shop'), '', 'filter:' + c.dataset.filter);
  });
  $$('.svc__row').forEach(function (r) { add(text($('dt', r)), 'Service', r, text($('dd', r))); });
  $$('.svc__also li').forEach(function (li) { add(text($('strong', li)), 'Service', li, text(li)); });
  $$('.faq details').forEach(function (d) { add(text($('summary', d)), 'Question', d, text($('p', d)), 'faq'); });
  $$('.ins__cols li').forEach(function (li) { add(li.textContent, 'Insurance plan', li, 'insurance plan coverage', 'plan'); });
  $$('.facts li').forEach(function (li) { add(text($('h3', li)), 'Your store', li, text($('p', li))); });
  add('Text a refill', 'Prescriptions', $('#refill'), 'refill prescription rx renew text sms message');
  add('Transfer a prescription to Harborview', 'Prescriptions', $('#transfer'), 'transfer move switch pharmacy');
  add('Store hours', 'Your store', $('#store'), 'hours open close today sunday saturday holiday time');
  add('Directions and map', 'Your store', $('#store'), 'directions address map location forest avenue broadway west brighton where');
  add('Equipment through insurance', 'Help', $('#billing'), 'dme medicare part b billing cover walker wheelchair cpap prescription');
  add('In an emergency', 'Help', $('.ftr__sos'), 'emergency poison control 911 988 crisis suicide');
  add('Contact us: phone, fax and email', 'Help', $('.ftr__brand'), 'contact phone call fax email languages spanish italian arabic');

  var results = [], active = -1;

  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function highlight(label, terms) {
    var out = esc(label);
    terms.forEach(function (t) {
      if (t.length < 2) return;
      var re = new RegExp('(' + esc(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      out = out.replace(re, '<mark>$1</mark>');
    });
    return out;
  }
  function search(str) {
    var terms = str.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    var hits = index.filter(function (it) {
      return terms.every(function (t) { return it.hay.indexOf(t) !== -1; });
    });
    hits.sort(function (a, b) {
      var al = a.label.toLowerCase(), bl = b.label.toLowerCase(), t = terms[0];
      var as = (al.indexOf(t) === 0 ? 0 : al.indexOf(t) > 0 ? 1 : 2), bs = (bl.indexOf(t) === 0 ? 0 : bl.indexOf(t) > 0 ? 1 : 2);
      return as - bs;
    });
    return hits.slice(0, 8);
  }
  function setActive(i) {
    active = i;
    $$('li', list).forEach(function (li, k) { li.setAttribute('aria-selected', String(k === i)); });
    if (i >= 0) {
      q.setAttribute('aria-activedescendant', 'q-opt-' + i);
      var li = $('#q-opt-' + i);
      if (li) li.scrollIntoView({ block: 'nearest' });
    } else q.removeAttribute('aria-activedescendant');
  }
  function open(isOpen) {
    panel.hidden = !isOpen;
    q.setAttribute('aria-expanded', String(isOpen && results.length > 0));
    if (!isOpen) setActive(-1);
  }
  function render() {
    var v = q.value.trim();
    results = search(v);
    list.innerHTML = '';
    if (!v) { open(false); status.textContent = ''; return; }
    var terms = v.toLowerCase().split(/\s+/);
    results.forEach(function (r, i) {
      var li = document.createElement('li');
      li.id = 'q-opt-' + i;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.innerHTML = '<span class="sr-label">' + highlight(r.label, terms) + '</span><span class="sr-type">' + r.type + '</span>';
      li.addEventListener('mousedown', function (e) { e.preventDefault(); });
      li.addEventListener('click', function () { go(r); });
      list.appendChild(li);
    });
    empty.hidden = results.length > 0;
    if (!results.length) {
      empty.innerHTML = 'Nothing on this page matches “' + esc(v) + '”. We stock far more than we show here: <a href="tel:' + PHONE + '">call (718) 555-0148</a> and we’ll check.';
    }
    status.textContent = results.length ? results.length + (results.length === 1 ? ' result' : ' results') + ' available.' : 'No results.';
    open(true);
    setActive(results.length ? 0 : -1);
  }
  function flash(el) {
    el.classList.add('is-found');
    setTimeout(function () { el.classList.remove('is-found'); }, 3500);
  }
  function go(r) {
    open(false);
    var el = r.el, focusEl = el;
    if (r.action === 'product') { applyFilter('all'); flash(el); }
    else if (r.action && r.action.indexOf('filter:') === 0) { applyFilter(r.action.slice(7)); focusEl = $('#shop-h'); }
    else if (r.action === 'faq') { el.open = true; focusEl = $('summary', el); flash(el); }
    else if (r.action === 'plan') { flash(el); }
    if (!focusEl.matches('a, button, summary, input, [tabindex]')) focusEl.setAttribute('tabindex', '-1');
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    focusEl.focus({ preventScroll: true });
  }

  q.addEventListener('input', render);
  q.addEventListener('focus', function () { if (q.value.trim()) render(); });
  q.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (panel.hidden) render(); else if (results.length) setActive((active + 1) % results.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (results.length) setActive((active - 1 + results.length) % results.length); }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[active]) go(results[active]); else render(); }
    else if (e.key === 'Escape') { if (!panel.hidden) { e.preventDefault(); open(false); } }
  });
  q.addEventListener('blur', function () { setTimeout(function () { if (!$('#search').contains(document.activeElement)) open(false); }, 120); });
  $('#q-go').addEventListener('click', function () {
    if (!q.value.trim()) { q.focus(); return; }
    render();
    if (results[0]) go(results[0]); else q.focus();
  });
  document.addEventListener('click', function (e) { if (!$('#search').contains(e.target)) open(false); });
})();
