(function () {
  'use strict';
  var H = { 0: [600, 1020], 1: [510, 1170], 2: [510, 1170], 3: [510, 1170], 4: [510, 1170], 5: [510, 1170], 6: [600, 1020] }; // minutes
  var DUTY = { 0: 'p', 1: 'p', 2: 't', 3: 'p', 4: 't', 5: 'p', 6: 't' };
  var PH = { p: ['PR', 'Dr. Priya Raman, PharmD'], t: ['TM', 'Dr. Theo Marchetti, PharmD'] };
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { y: +o.year, mo: +o.month, d: +o.day, t: ((+o.hour) % 24) * 60 + (+o.minute), dow: DAYS.indexOf(o.weekday) };
  }
  function clock(m) { var h = Math.floor(m / 60), mm = m % 60; return ((h % 12) || 12) + (mm ? ':' + ('0' + mm).slice(-2) : '') + (h >= 12 ? ' pm' : ' am'); }

  function render() {
    var n = ny(), d = H[n.dow], open = n.t >= d[0] && n.t < d[1], txt;
    if (open) txt = 'Open · until ' + clock(d[1]);
    else if (n.t < d[0]) txt = 'Closed · opens ' + clock(d[0]);
    else txt = 'Closed · opens ' + DAYS[(n.dow + 1) % 7] + ' ' + clock(H[(n.dow + 1) % 7][0]);
    [].forEach.call(document.querySelectorAll('[data-status]'), function (el) { el.textContent = txt; el.classList.toggle('is-open', open); });
    var c = document.querySelector('[data-clock]'); if (c) c.textContent = clock(n.t).replace(/ (am|pm)/, '$1');
    var dutyDay = open || n.t < d[0] ? n.dow : (n.dow + 1) % 7, who = PH[DUTY[dutyDay]];
    document.querySelector('[data-duty-initials]').textContent = who[0];
    document.querySelector('[data-duty-name]').textContent = who[1];
    var lbl = document.querySelector('.board__duty small'); if (lbl) lbl.textContent = open ? 'Pharmacist on duty' : 'Next on duty';
    var cr = document.querySelector('[data-courier]'), wk = n.dow >= 1 && n.dow <= 5;
    if (wk && n.t < 840 && n.t >= d[0]) cr.textContent = 'Order by 2 pm, arrives by 6';
    else if (wk && n.t < d[0]) cr.textContent = 'Today: order by 2 pm';
    else { var k = 1; while (((n.dow + k) % 7) % 6 === 0) k++; cr.textContent = 'Next: ' + (k === 1 ? 'tomorrow' : DAYS[(n.dow + k) % 7]) + ', by 2 pm'; }
    var row = document.querySelector('#hrs tr[data-d="' + n.dow + '"]');
    [].forEach.call(document.querySelectorAll('#hrs tr'), function (r) { r.classList.toggle('today', r === row); });
  }
  render(); setInterval(render, 30000);

  /* refill / transfer */
  var mode = 'refill', go = document.getElementById('rGo'), pane = document.getElementById('pane');
  function val(id) { return document.getElementById(id).value.trim(); }
  function buildR() {
    var body = mode === 'refill'
      ? 'Refill request. Name: ' + (val('r-nm') || '…') + '. DOB: ' + (val('r-dob') || '…') + '. Rx/medicine: ' + (val('r-rx') || '…') + '. ' + document.getElementById('r-how').value + '.'
      : 'Transfer request. Name: ' + (val('r-nm') || '…') + '. DOB: ' + (val('r-dob') || '…') + '. Current pharmacy: ' + (val('r-old') || '…') + '. ' + document.getElementById('r-how').value + '.';
    go.href = 'sms:+12125550181?&body=' + encodeURIComponent(body);
  }
  [].forEach.call(document.querySelectorAll('.tabs button'), function (b) {
    b.addEventListener('click', function () {
      mode = b.dataset.k;
      [].forEach.call(document.querySelectorAll('.tabs button'), function (x) { x.setAttribute('aria-selected', x === b); });
      pane.setAttribute('aria-labelledby', b.id);
      [].forEach.call(pane.querySelectorAll('[data-for]'), function (f) { f.hidden = f.dataset.for !== mode; });
      buildR();
    });
  });
  pane.addEventListener('input', buildR); pane.addEventListener('change', buildR); buildR();
  pane.addEventListener('submit', function (e) { e.preventDefault(); go.click(); });

  /* travel planner */
  var R = ['rec', 'Recommended'], A = ['ask', 'Ask us'], B = ['', 'Routine'];
  var routine = [B, 'Routine vaccines', 'Measles (MMR), Tdap, flu and COVID-19 up to date before any trip.'];
  var hepA = [R, 'Hepatitis A', 'Spread through food and water. Two doses; the first gives good protection.'];
  var hepB = [R, 'Hepatitis B', 'If you were never vaccinated. Some schedules are fast enough for a trip.'];
  var typR = [R, 'Typhoid', 'An injection or an oral course you finish a week before you leave.'];
  var typA = [A, 'Typhoid', 'Worth it if you’ll eat outside big hotels or visit smaller towns.'];
  var rab = [A, 'Rabies', 'For long stays, remote areas, or work with animals.'];
  var mal = [A, 'Malaria tablets', 'Prescription only, for some areas. We’ll check your exact route.'];
  var bug = [B, 'Mosquito protection', 'No vaccine for dengue for most travelers. Repellent with DEET or picaridin.'];
  var yf = [A, 'Yellow fever', 'Required or advised for parts of this region. Given only at certified centers; we refer you.'];
  var je = [A, 'Japanese encephalitis', 'For longer stays or rural travel. Two doses, finished a week before you go.'];
  var DATA = {
    eu: [routine, [A, 'Hepatitis A', 'Worth discussing for long stays or travel further east.'], [A, 'Tick-borne encephalitis', 'For hiking or camping in forested parts of central and eastern Europe.']],
    mx: [routine, hepA, hepB, typA, rab, mal, bug],
    cb: [routine, hepA, hepB, typA, rab, bug],
    sa: [routine, hepA, hepB, typR, yf, mal, rab, bug],
    af: [routine, hepA, hepB, typR, yf, [R, 'Malaria tablets', 'Needed for most of the region. Prescription; we’ll match it to your route.'], [A, 'Meningococcal', 'For the “meningitis belt” in the dry season.'], [A, 'Polio booster', 'One adult booster for some countries.'], rab],
    me: [routine, hepA, hepB, typA, [A, 'Meningococcal', 'Required by Saudi Arabia for Hajj and Umrah.'], rab],
    as: [routine, hepA, hepB, typR, je, mal, [A, 'Polio booster', 'One adult booster for some countries.'], rab],
    se: [routine, hepA, hepB, typR, je, mal, rab, bug],
    ea: [routine, hepA, hepB, typA, je, rab]
  };
  var tvR = document.getElementById('tv-r'), tvD = document.getElementById('tv-d'), when = document.getElementById('tvWhen'), list = document.getElementById('tvList');
  var n0 = ny(), todayUTC = Date.UTC(n0.y, n0.mo - 1, n0.d);
  var def = new Date(todayUTC + 42 * 864e5);
  tvD.value = def.toISOString().slice(0, 10);
  tvD.min = new Date(todayUTC).toISOString().slice(0, 10);
  function plan() {
    var parts = tvD.value.split('-'), days = parts.length === 3 ? Math.round((Date.UTC(+parts[0], +parts[1] - 1, +parts[2]) - todayUTC) / 864e5) : NaN;
    when.classList.remove('is-late');
    if (isNaN(days) || days < 0) when.innerHTML = '<b>—</b><p>Pick a departure date in the future.</p>';
    else if (days >= 42) when.innerHTML = '<b>' + Math.floor(days / 7) + ' weeks</b><p>Good timing. Come in four to six weeks before you leave so two-dose vaccines can be started.</p>';
    else if (days >= 14) when.innerHTML = '<b>' + days + ' days</b><p>Come in this week. Some vaccines need about two weeks to work.</p>';
    else { when.classList.add('is-late'); when.innerHTML = '<b>' + days + (days === 1 ? ' day' : ' days') + '</b><p>Leaving soon? Still come in. Some protection is better than none, and we’ll pack your kit.</p>'; }
    list.innerHTML = DATA[tvR.value].map(function (x) {
      return '<li><span class="tv__tag' + (x[0][0] ? ' t-' + x[0][0] : '') + '">' + x[0][1] + '</span><b>' + x[1] + '</b><p>' + x[2] + '</p></li>';
    }).join('');
  }
  tvR.addEventListener('change', plan); tvD.addEventListener('input', plan); tvD.addEventListener('change', plan); plan();
  document.getElementById('tv').addEventListener('submit', function (e) { e.preventDefault(); });

  /* consultation request */
  var type = 'Medication review', cGo = document.getElementById('cGo');
  function buildC() {
    cGo.href = 'mailto:care@bondstreetchemists.com?subject=' + encodeURIComponent('Consultation: ' + type) + '&body=' + encodeURIComponent('Consultation request\n\nType: ' + type + '\nName: ' + val('c-nm') + '\nDays and times: ' + val('c-when') + '\n');
  }
  document.getElementById('csTypes').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    type = b.dataset.v;
    [].forEach.call(this.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', x === b); });
    buildC();
  });
  document.getElementById('csForm').addEventListener('input', buildC); buildC();
  document.getElementById('csForm').addEventListener('submit', function (e) { e.preventDefault(); cGo.click(); });

  /* header + drawer */
  var hdr = document.querySelector('.hdr');
  function onScroll() { hdr.classList.toggle('is-stuck', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var links = [].slice.call(document.querySelectorAll('.nav a'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + en.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) io.observe(s); });
  }
  var dr = document.getElementById('drawer'), mb = document.querySelector('.mbtn'), last;
  function openD() { last = document.activeElement; dr.hidden = false; requestAnimationFrame(function () { dr.classList.add('is-open'); }); mb.setAttribute('aria-expanded', 'true'); document.body.classList.add('is-locked'); setTimeout(function () { dr.querySelector('.drawer__x').focus(); }, 60); }
  function closeD(nav) { dr.classList.remove('is-open'); mb.setAttribute('aria-expanded', 'false'); document.body.classList.remove('is-locked'); setTimeout(function () { if (!dr.classList.contains('is-open')) dr.hidden = true; }, 350); if (!nav && last) last.focus(); }
  mb.addEventListener('click', openD);
  dr.querySelector('.drawer__x').addEventListener('click', function () { closeD(); });
  dr.querySelector('.drawer__scrim').addEventListener('click', function () { closeD(); });
  dr.addEventListener('click', function (e) { if (e.target.closest('a[href^="#"]')) closeD(true); });
  document.addEventListener('keydown', function (e) {
    if (!dr.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeD();
    if (e.key === 'Tab') {
      var q = dr.querySelectorAll('a[href],button:not([tabindex="-1"])'), a = q[0], z = q[q.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });
})();
