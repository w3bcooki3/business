(function () {
  'use strict';
  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { y: +o.year, mo: +o.month, d: +o.day, h: (+o.hour) % 24, m: +o.minute, dow: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday] };
  }
  var now = ny(), t = now.h + now.m / 60;
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  /* viennoiserie ready */
  if (now.dow !== 1 && t < 18) {
    document.querySelectorAll('#times li').forEach(function (li) { if (parseFloat(li.dataset.h) <= t) li.classList.add('ready'); });
  }

  /* hours */
  var key = now.dow === 1 ? 'mo' : (now.dow === 0 || now.dow === 6 ? 'we' : 'tf');
  document.querySelector('#hrs li[data-d="' + key + '"]').classList.add('today');
  var open = now.dow !== 1 && t >= (key === 'we' ? 8 : 7) && t < 18;
  document.getElementById('openNow').textContent = open ? 'Ouvert maintenant — open until 6 pm' : 'Fermé pour le moment — closed right now';

  /* drawer */
  var db = document.querySelector('.drawer-btn'), dr = document.getElementById('drawer');
  function setDr(o) { dr.hidden = !o; db.setAttribute('aria-expanded', String(o)); db.textContent = o ? 'Close' : 'Menu'; document.body.style.overflow = o ? 'hidden' : ''; }
  db.addEventListener('click', function () { setDr(dr.hidden); });
  dr.addEventListener('click', function (e) { if (e.target.closest('a')) setDr(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!dr.hidden) { setDr(false); db.focus(); }
      closeWords();
    }
  });

  /* cake builder */
  var f = document.getElementById('builder');
  var earliest = new Date(Date.UTC(now.y, now.mo - 1, now.d) + 3 * 864e5 + (now.h >= 12 ? 864e5 : 0));
  if (earliest.getUTCDay() === 1) earliest = new Date(earliest.getTime() + 864e5); // closed Mondays
  var iso = earliest.toISOString().slice(0, 10);
  var pick = document.getElementById('pickup');
  pick.min = iso; pick.value = iso;
  function frDate(d) { return JOURS[d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + MOIS[d.getUTCMonth()]; }
  document.getElementById('earliest').textContent = 'Earliest pickup: ' + frDate(earliest) + ', from noon';

  var spongeColor = { 'Génoise vanille': '#f3e3c3', 'Chocolat noir': '#6b4234', 'Pistache': '#c9d4a6', 'Amande-citron': '#f6eab0' };
  var fillColor = { 'Framboise & crème mousseline': '#d8506b', 'Praliné noisette': '#b07b4f', 'Ganache chocolat': '#3a2620', 'Crémeux passion': '#f0b429' };
  var topColor = { 'Chantilly & fresh fruit': '#fffdf8', 'Mirror glaze': '#e7a3b0', 'Pressed flowers': '#f6eee0' };
  var sizeDims = { '6-inch': [120, 62], '8-inch': [160, 72], '10-inch': [200, 82] };

  function val(n) { return f.querySelector('[name="' + n + '"]:checked'); }
  function update() {
    var s = val('size'), sp = val('sponge'), fi = val('filling'), fn = val('finish');
    var total = +s.dataset.p + +sp.dataset.p + +fi.dataset.p + +fn.dataset.p + (f.msg.value.trim() ? 6 : 0);
    document.getElementById('price').textContent = '$' + total;
    var dm = sizeDims[s.value], cake = document.querySelector('.cake');
    cake.style.setProperty('--w', dm[0] + 'px'); cake.style.setProperty('--h', dm[1] + 'px');
    cake.style.setProperty('--sp', spongeColor[sp.value]); cake.style.setProperty('--fl', fillColor[fi.value]);
    document.getElementById('cakeTop').style.background = topColor[fn.value];
    var rows = [['Taille', s.value + ' · serves ' + s.dataset.s], ['Biscuit', sp.value], ['Garniture', fi.value], ['Finition', fn.value]];
    if (f.msg.value.trim()) rows.push(['Plaque (+$6)', '« ' + f.msg.value.trim() + ' »']);
    var dl = document.getElementById('summary'); dl.innerHTML = '';
    rows.forEach(function (r) { var d = document.createElement('div'); var dt = document.createElement('dt'); dt.textContent = r[0]; var dd = document.createElement('dd'); dd.textContent = r[1]; d.appendChild(dt); d.appendChild(dd); dl.appendChild(d); });
    return total;
  }
  f.addEventListener('input', update); f.addEventListener('change', update);
  update();

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var err = document.getElementById('err');
    var name = f.name.value.trim(), date = pick.value;
    if (!name) { err.textContent = 'Merci — please add your name.'; f.name.focus(); return; }
    if (!date || date < iso) { err.textContent = 'Please choose a date on or after ' + frDate(earliest) + '.'; pick.focus(); return; }
    var dObj = new Date(date + 'T12:00:00Z');
    if (dObj.getUTCDay() === 1) { err.textContent = 'We are closed on Mondays — please choose another day.'; pick.focus(); return; }
    err.textContent = '';
    var total = update();
    var lines = Array.prototype.map.call(document.querySelectorAll('#summary div'), function (d) { return d.firstChild.textContent + ': ' + d.lastChild.textContent; });
    var body = 'Bonjour Maison Odile,\n\nI would like to order a celebration cake:\n\n' + lines.join('\n') + '\n\nPickup: ' + frDate(dObj) + '\nName: ' + name + '\nEstimated total: $' + total + '\n\nMerci !';
    location.href = 'mailto:commandes@maisonodile.com?subject=' + encodeURIComponent('Commande gâteau — ' + name + ', ' + date) + '&body=' + encodeURIComponent(body);
  });

  /* glossary */
  var words = document.querySelectorAll('.words button');
  function closeWords(except) { words.forEach(function (w) { if (w !== except) { w.setAttribute('aria-expanded', 'false'); document.getElementById(w.getAttribute('aria-controls')).hidden = true; } }); }
  words.forEach(function (w) {
    w.addEventListener('click', function (e) {
      e.stopPropagation();
      var o = w.getAttribute('aria-expanded') === 'true';
      closeWords(w);
      w.setAttribute('aria-expanded', String(!o));
      document.getElementById(w.getAttribute('aria-controls')).hidden = o;
    });
  });
  document.addEventListener('click', function () { closeWords(); });

  /* reveal */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.sec, .times li, .look__item, .odile > div, .visit__grid > div').forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();
