/* Bond Street Chemists — live status, refill/consult message builders, travel planner, header + drawer.
   No forms, nothing stored or sent: the builders only compose sms:/mailto: links. */
(function () {
  'use strict';
  var PHONE = '+12125550181', EMAIL = 'care@bondstreetchemists.com';
  var H = { 0: [600, 1020], 1: [510, 1170], 2: [510, 1170], 3: [510, 1170], 4: [510, 1170], 5: [510, 1170], 6: [600, 1020] }; // minutes after midnight
  var DUTY = { 0: 'p', 1: 'p', 2: 't', 3: 'p', 4: 't', 5: 'p', 6: 't' };
  var PH = { p: ['PR', 'Dr. Priya Raman, PharmD'], t: ['TM', 'Dr. Theo Marchetti, PharmD'] };
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function $(s) { return document.querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }

  /* New York time, whatever the visitor's time zone */
  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { t: ((+o.hour) % 24) * 60 + (+o.minute), dow: DAYS.indexOf(o.weekday) };
  }
  function clock(m) { var h = Math.floor(m / 60), mm = m % 60; return ((h % 12) || 12) + (mm ? ':' + ('0' + mm).slice(-2) : '') + (h >= 12 ? ' pm' : ' am'); }
  function text(sel, v) { var el = $(sel); if (el) el.textContent = v; }

  function render() {
    var n = ny(), d = H[n.dow], open = n.t >= d[0] && n.t < d[1], txt;
    if (open) txt = 'Open · until ' + clock(d[1]);
    else if (n.t < d[0]) txt = 'Closed · opens ' + clock(d[0]);
    else txt = 'Closed · opens ' + DAYS[(n.dow + 1) % 7] + ' ' + clock(H[(n.dow + 1) % 7][0]);
    $$('[data-status]').forEach(function (el) { el.textContent = txt; el.classList.toggle('is-open', open); });
    text('[data-clock]', clock(n.t));
    var who = PH[DUTY[open || n.t < d[0] ? n.dow : (n.dow + 1) % 7]];
    text('[data-duty-initials]', who[0]);
    text('[data-duty-name]', who[1]);
    text('[data-duty-label]', open ? 'Pharmacist on duty' : 'Next on duty');
    var wk = n.dow >= 1 && n.dow <= 5, cr;
    if (wk && n.t >= d[0] && n.t < 840) cr = 'Order by 2 pm, arrives by 6';
    else if (wk && n.t < d[0]) cr = 'Today: order by 2 pm';
    else { var k = 1; while (((n.dow + k) % 7) % 6 === 0) k++; cr = 'Next: ' + (k === 1 ? 'tomorrow' : DAYS[(n.dow + k) % 7]) + ', by 2 pm'; }
    text('[data-courier]', cr);
    $$('#hrs tr').forEach(function (r) { r.classList.toggle('today', +r.getAttribute('data-d') === n.dow); });
  }
  render(); setInterval(render, 30000);

  /* single-choice and multi-choice button groups */
  function single(btns, attr, cb) {
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        cb(b.getAttribute(attr));
      });
    });
  }

  /* 02 refill / transfer text builder */
  var rf = { k: 'refill', h: 'pickup', n: 1 }, rfN = $('#rfN');
  function buildR() {
    var meds = rf.n === 1 ? 'Rx number or medicine: ___' : rf.n + ' medicines. Rx numbers or names: ' + new Array(rf.n + 1).join('___ ').trim().split(' ').join(', ');
    var how = rf.h === 'pickup' ? 'I’ll pick up at 41 Bond St.' : 'Courier please, below 14th St. Address: ___';
    var body = rf.k === 'refill'
      ? 'Refill request. Name: ___ · Date of birth: ___ · ' + meds + ' · ' + how
      : 'Transfer request. Name: ___ · Date of birth: ___ · Current pharmacy (name and street): ___ · ' + (rf.n === 1 ? '1 medicine' : rf.n + ' medicines') + ' · ' + how;
    text('#rfMsg', body);
    text('[data-need-k]', rf.k === 'refill' ? 'The Rx number, or the medicine’s name' : 'Your current pharmacy’s name and street');
    rfN.textContent = rf.n;
    $$('[data-step]').forEach(function (b) { b.disabled = (+b.getAttribute('data-step') < 0 && rf.n <= 1) || (+b.getAttribute('data-step') > 0 && rf.n >= 6); });
    $('#rfGo').href = 'sms:' + PHONE + '?&body=' + encodeURIComponent(body);
  }
  single($$('[data-k]'), 'data-k', function (v) { rf.k = v; buildR(); });
  single($$('[data-h]'), 'data-h', function (v) { rf.h = v; buildR(); });
  $$('[data-step]').forEach(function (b) { b.addEventListener('click', function () { rf.n = Math.min(6, Math.max(1, rf.n + +b.getAttribute('data-step'))); buildR(); }); });
  buildR();

  /* 03 travel planner */
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
  var polio = [A, 'Polio booster', 'One adult booster for some countries.'];
  var DATA = {
    eu: [routine, [A, 'Hepatitis A', 'Worth discussing for long stays or travel further east.'], [A, 'Tick-borne encephalitis', 'For hiking or camping in forested parts of central and eastern Europe.']],
    mx: [routine, hepA, hepB, typA, rab, mal, bug],
    cb: [routine, hepA, hepB, typA, rab, bug],
    sa: [routine, hepA, hepB, typR, yf, mal, rab, bug],
    af: [routine, hepA, hepB, typR, yf, [R, 'Malaria tablets', 'Needed for most of the region. Prescription; we’ll match it to your route.'], [A, 'Meningococcal', 'For the “meningitis belt” in the dry season.'], polio, rab],
    me: [routine, hepA, hepB, typA, [A, 'Meningococcal', 'Required by Saudi Arabia for Hajj and Umrah.'], rab],
    as: [routine, hepA, hepB, typR, je, mal, polio, rab],
    se: [routine, hepA, hepB, typR, je, mal, rab, bug],
    ea: [routine, hepA, hepB, typA, je, rab]
  };
  var tv = { r: 'se', w: 6 }, tvW = $('#tvW');
  function plan() {
    var w = tv.w, el = $('#tvWhen'), name = $('#tvR [data-r="' + tv.r + '"]').textContent;
    tvW.textContent = w === 0 ? 'This week' : w + (w === 1 ? ' week' : ' weeks');
    el.classList.toggle('is-late', w < 2);
    if (w >= 6) el.innerHTML = '<b>' + w + ' wks</b><p>Good timing. Come in four to six weeks before you leave so two-dose vaccines can be started.</p>';
    else if (w >= 2) el.innerHTML = '<b>' + w + ' wks</b><p>Come in this week. Some vaccines need about two weeks to work.</p>';
    else el.innerHTML = '<b>' + (w === 0 ? 'Days' : '1 wk') + '</b><p>Leaving soon? Still come in. Some protection is better than none, and we’ll pack your kit.</p>';
    $('#tvList').innerHTML = DATA[tv.r].map(function (x) {
      return '<li><span class="tv__tag' + (x[0][0] ? ' t-' + x[0][0] : '') + '">' + x[0][1] + '</span><b>' + x[1] + '</b><p>' + x[2] + '</p></li>';
    }).join('');
    $$('[data-wk]').forEach(function (b) { b.disabled = (+b.getAttribute('data-wk') < 0 && w <= 0) || (+b.getAttribute('data-wk') > 0 && w >= 26); });
    $('#tvText').href = 'sms:' + PHONE + '?&body=' + encodeURIComponent('Hi, I’m traveling to ' + name + ' in ' + (w === 0 ? 'under a week' : 'about ' + w + (w === 1 ? ' week' : ' weeks')) + '. When can I come in for a travel consultation?');
  }
  single($$('#tvR button'), 'data-r', function (v) { tv.r = v; plan(); });
  $$('[data-wk]').forEach(function (b) { b.addEventListener('click', function () { tv.w = Math.min(26, Math.max(0, tv.w + +b.getAttribute('data-wk'))); plan(); }); });
  plan();

  /* 04 consultation email builder */
  var cs = { type: 'Medication review', when: [] };
  function buildC() {
    var times = cs.when.length ? cs.when.join(', ') : 'any time that suits you';
    $('#csMail').href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Consultation: ' + cs.type) +
      '&body=' + encodeURIComponent('Hello,\n\nI’d like to book a consultation.\n\nTopic: ' + cs.type + '\nTimes that work: ' + times + '\n\nName:\nBest phone number:\n');
  }
  single($$('#csTypes button'), 'data-v', function (v) { cs.type = v; buildC(); });
  $$('#csWhen button').forEach(function (b) {
    b.addEventListener('click', function () {
      var on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on));
      cs.when = $$('#csWhen [aria-pressed="true"]').map(function (x) { return x.getAttribute('data-v'); });
      buildC();
    });
  });
  buildC();

  /* header shadow, scroll-spy, mobile dock */
  var hdr = $('.hdr'), dock = $('#dock'), hero = $('.hero');
  function onScroll() {
    hdr.classList.toggle('is-stuck', window.scrollY > 40);
    if (dock && hero) dock.classList.toggle('is-on', hero.getBoundingClientRect().bottom < 0);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var links = $$('.nav a');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + en.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) io.observe(s); });
  }

  /* drawer */
  var dr = $('#drawer'), mb = $('.mbtn'), last;
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
      var q = $$('a[href],button:not([tabindex="-1"])', dr), a = q[0], z = q[q.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });
  window.matchMedia('(min-width:1120px)').addEventListener('change', function (q) { if (q.matches && dr.classList.contains('is-open')) closeD(); });
})();
