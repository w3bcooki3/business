(function () {
  'use strict';
  var grid = document.getElementById('grid');
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.card'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var q = document.getElementById('q');
  var result = document.getElementById('result');
  var empty = document.getElementById('empty');
  var LABEL = { all: 'websites', pharmacy: 'pharmacy websites', coffee: 'coffee shop websites', bakery: 'bakery websites', restaurant: 'restaurant websites', barber: 'barbershop websites', juice: 'juice bar websites' };
  var state = { kind: 'all', text: '' };

  // remember the filter in the URL hash so a shared link opens on it (#pharmacy, #coffee...)
  var fromHash = (location.hash || '').slice(1);
  if (LABEL[fromHash]) state.kind = fromHash;

  function apply() {
    var n = 0, words = state.text.toLowerCase().trim().split(/\s+/).filter(Boolean);
    cards.forEach(function (c) {
      var ok = (state.kind === 'all' || c.dataset.kind === state.kind) &&
        words.every(function (w) { return c.dataset.search.indexOf(w) > -1; });
      c.hidden = !ok;
      if (ok) n++;
    });
    chips.forEach(function (ch) { ch.setAttribute('aria-pressed', ch.dataset.filter === state.kind ? 'true' : 'false'); });
    empty.hidden = n !== 0;
    result.textContent = n === cards.length ? 'Showing all ' + n + ' websites'
      : 'Showing ' + n + ' ' + (n === 1 ? LABEL[state.kind].replace(/s$/, '') : LABEL[state.kind]) + (state.text ? ' matching “' + state.text.trim() + '”' : '');
    observeLive();
  }
  chips.forEach(function (ch) {
    ch.addEventListener('click', function () {
      state.kind = ch.dataset.filter;
      try { history.replaceState(null, '', state.kind === 'all' ? location.pathname + location.search : '#' + state.kind); } catch (e) {}
      apply();
      var top = document.getElementById('work').getBoundingClientRect().top + window.scrollY - 64;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  });
  if (q) {
    q.addEventListener('input', function () { state.text = q.value; apply(); });
    q.form && q.form.addEventListener('submit', function (e) { e.preventDefault(); });
    q.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); q.blur(); } });
  }

  /* ---------- live thumbnails for photo-led sites ---------- */
  function fit(box) {
    var f = box.querySelector('iframe');
    if (!f) return;
    var s = box.clientWidth / (+box.dataset.w);
    f.style.transform = 'scale(' + s + ')';
  }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var box = en.target;
      io.unobserve(box);
      if (box.querySelector('iframe')) return;
      var f = document.createElement('iframe');
      f.src = box.dataset.live;
      f.width = box.dataset.w; f.height = box.dataset.h;
      f.style.width = box.dataset.w + 'px'; f.style.height = box.dataset.h + 'px';
      f.setAttribute('tabindex', '-1');
      f.setAttribute('aria-hidden', 'true');
      f.setAttribute('scrolling', 'no');
      f.setAttribute('loading', 'lazy');
      f.title = '';
      f.addEventListener('load', function () { box.classList.add('loaded'); });
      box.appendChild(f);
      fit(box);
    });
  }, { rootMargin: '300px 0px' }) : null;
  var lives = Array.prototype.slice.call(document.querySelectorAll('.is-live'));
  function observeLive() {
    lives.forEach(function (b) {
      if (b.querySelector('iframe') || b.closest('.card').hidden) return;
      io ? io.observe(b) : null;
    });
  }
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { lives.forEach(fit); sizePreview(); }, 80); });

  /* ---------- preview dialog ---------- */
  var dlg = document.getElementById('preview');
  var stage = document.getElementById('pv-stage');
  var frame = document.getElementById('pv-frame');
  var ifr = document.getElementById('pv-iframe');
  var nameEl = document.getElementById('pv-name');
  var openEl = document.getElementById('pv-open');
  var devBtns = Array.prototype.slice.call(document.querySelectorAll('[data-device]'));
  var device = window.innerWidth < 700 ? 'phone' : 'desktop';
  var SIZES = { phone: [390, 844], desktop: [1440, 900] };
  var opener = null;

  function sizePreview() {
    if (!dlg || !dlg.open) return;
    var sz = SIZES[device], pad = 32;
    var sw = stage.clientWidth - pad, sh = stage.clientHeight - pad;
    var s = Math.min(sw / sz[0], sh / sz[1], 1);
    frame.style.width = Math.round(sz[0] * s) + 'px';
    frame.style.height = Math.round(sz[1] * s) + 'px';
    ifr.style.width = sz[0] + 'px'; ifr.style.height = sz[1] + 'px';
    ifr.style.transform = 'scale(' + s + ')';
    frame.classList.toggle('is-phone', device === 'phone');
    devBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.device === device ? 'true' : 'false'); });
  }
  function openPreview(href, name, btn) {
    if (!dlg || typeof dlg.showModal !== 'function') { location.href = href; return; }
    opener = btn;
    nameEl.textContent = name;
    openEl.href = href;
    ifr.title = name + ' preview';
    ifr.src = href;
    dlg.showModal();
    document.documentElement.style.overflow = 'hidden';
    sizePreview();
  }
  function closePreview() {
    if (!dlg.open) return;
    dlg.close();
  }
  if (dlg) {
    dlg.addEventListener('close', function () {
      ifr.src = 'about:blank';
      document.documentElement.style.overflow = '';
      if (opener) opener.focus();
    });
    document.getElementById('pv-close').addEventListener('click', closePreview);
    dlg.addEventListener('click', function (e) { if (e.target === stage) closePreview(); });
    devBtns.forEach(function (b) { b.addEventListener('click', function () { device = b.dataset.device; sizePreview(); }); });
  }
  grid.addEventListener('click', function (e) {
    var b = e.target.closest('[data-preview]');
    if (!b) return;
    openPreview(b.dataset.preview, b.dataset.name, b);
  });

  apply();
})();
