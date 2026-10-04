(function () {
  'use strict';
  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { h: (+o.hour) % 24, m: +o.minute, dow: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday] };
  }
  var now = ny(), t = now.h + now.m / 60;
  var H = { 0: [11, 16], 2: [10, 20], 3: [10, 20], 4: [10, 20], 5: [10, 20], 6: [8, 19] };
  var open = H[now.dow] && t >= H[now.dow][0] && t < H[now.dow][1];
  document.getElementById('live').innerHTML = open ? '<b>●</b> Chairs open now' : 'Closed now · text to book';
  document.querySelectorAll('#hrs li').forEach(function (li) { if (li.dataset.d.split(',').indexOf(String(now.dow)) > -1) li.classList.add('today'); });

  var B = [
    { n: 'Andre Wallace', s: 'Skin fades', ig: 'andre.cuts.uptown', days: 'Tue–Sat', dd: [2, 3, 4, 5, 6], img: '1593702275687-f8b402bf1fb5', alt: 'A close-up of a skin fade being blended with clippers', bio: 'Fourteen years in, trained in the Bronx, taught half the barbers on this block how to blend. If it starts at zero and ends somewhere beautiful, it’s Andre’s.' },
    { n: 'Keisha Monroe', s: 'Tapers & sponge twists', ig: 'keishamonroe.barber', days: 'Tue–Fri, Sun', dd: [0, 2, 3, 4, 5], img: '1622286342621-4bd786c2447c', alt: 'The back of a client’s head showing a clean textured crop', bio: 'The patient hand for texture. Twists that hold, tapers that grow out right, and the honest product advice nobody else gives you.' },
    { n: 'Rafael “Rafa” Peña', s: 'Beard sculpting', ig: 'rafa.beardwork', days: 'Wed–Sat', dd: [3, 4, 5, 6], img: '1599351431202-1e0f0137899a', alt: 'A barber trimming and combing a beard', bio: 'Dominican, from Washington Heights. Straight-razor lines, beard shaping that respects your face, hot towels like his uncle’s shop in Santiago.' },
    { n: 'Jamal Okeke', s: 'Designs & hard parts', ig: 'jamal.lines', days: 'Thu–Sat', dd: [4, 5, 6], img: '1598524374912-6b0b0bab43dd', alt: 'A finishing spray being applied to a styled haircut', bio: 'Freehand designs, geometric parts, the occasional portrait on the back of someone’s head for a birthday. Bring a reference; he’ll improve it.' },
    { n: 'Tasha Greene', s: 'Kids & first cuts', ig: 'tasha.littlecuts', days: 'Tue–Sat', dd: [2, 3, 4, 5, 6], img: '1584316712724-f5d4b188fee2', alt: 'A smiling man in a coat against a bright yellow wall', bio: 'Mother of three, unshakeable. Booster seat, cartoon on the tablet, a lollipop after. Grown men also request her because she doesn’t rush.' },
    { n: 'Marcus Bell', s: 'Locs maintenance', ig: 'striversrowbarbers', days: 'Sat–Sun', dd: [0, 6], img: '1567894340315-735d7c361db0', alt: 'A barber cutting a client’s textured hair in a warm shop', bio: 'The owner, still cutting on weekends. Retwists, interlocking and the scalp-care routine that keeps locs healthy for decades.' }
  ];
  var list = document.getElementById('barbers'), profile = document.getElementById('profile');
  var bSel = document.getElementById('bBarber');
  B.forEach(function (b, i) {
    var btn = document.createElement('button');
    btn.className = 'rb'; btn.type = 'button'; btn.setAttribute('role', 'tab'); btn.setAttribute('aria-controls', 'profile');
    btn.innerHTML = '<small>0' + (i + 1) + '</small><b>' + b.n.split(' ')[0] + '</b><span>' + b.s + '</span>';
    btn.addEventListener('click', function () { show(i); });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); show((i + 1) % B.length, true); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); show((i - 1 + B.length) % B.length, true); }
    });
    list.appendChild(btn);
    var o = document.createElement('option'); o.value = b.n; o.textContent = b.n + ' — ' + b.s; bSel.appendChild(o);
  });
  function show(i, focus) {
    var b = B[i];
    list.querySelectorAll('.rb').forEach(function (x, j) { x.setAttribute('aria-selected', String(j === i)); x.tabIndex = j === i ? 0 : -1; if (focus && j === i) x.focus(); });
    profile.classList.remove('swap'); void profile.offsetWidth; profile.classList.add('swap');
    var img = document.getElementById('pImg');
    img.src = 'https://images.unsplash.com/photo-' + b.img + '?auto=format&fit=crop&w=900&q=80';
    img.alt = b.alt;
    document.querySelector('.profile__img').setAttribute('data-no', '0' + (i + 1));
    document.getElementById('pNo').textContent = 'Chair ' + (i + 1);
    document.getElementById('pName').textContent = b.n;
    document.getElementById('pSpec').textContent = b.s;
    document.getElementById('pBio').textContent = b.bio;
    var inToday = b.dd.indexOf(now.dow) > -1;
    document.getElementById('pDays').textContent = b.days + (inToday ? ' · in today' : '');
    var ig = document.getElementById('pIg'); ig.textContent = '@' + b.ig; ig.href = 'https://www.instagram.com/' + b.ig + '/';
    var first = b.n.split(' ')[0];
    var sms = document.getElementById('pSms');
    sms.textContent = 'Text ' + first;
    sms.href = 'sms:+12125550149?&body=' + encodeURIComponent('Hi, I’d like to book with ' + first + ' for a ' + b.s.toLowerCase().replace(/s$/, '') + '. What do you have this week?');
  }
  show(0);

  /* walk-in board */
  var wb = document.getElementById('wkBoard');
  var head = '<div class="wk__head"><span>Chair</span><span>' + (open ? 'Right now' : 'Next open day') + '</span></div>';
  wb.innerHTML = head + B.map(function (b, i) {
    var inToday = b.dd.indexOf(now.dow) > -1;
    var st, cls;
    if (!open) { st = 'Closed'; cls = 'off'; }
    else if (!inToday) { st = 'Off today'; cls = 'off'; }
    else if (i === 1 || i === 4) { st = 'Walk-ins'; cls = 'free'; }
    else { st = 'Booked'; cls = 'in'; }
    return '<div class="wk__row"><i>0' + (i + 1) + '</i><b>' + b.n.split(' ')[0] + '</b><span class="' + cls + '">' + st + '</span></div>';
  }).join('');

  /* menu (mobile) */
  var mb = document.querySelector('.menu-btn'), full = document.getElementById('full');
  function setFull(o) { full.hidden = !o; mb.setAttribute('aria-expanded', String(o)); mb.textContent = o ? 'Close' : 'Menu'; document.body.style.overflow = o ? 'hidden' : ''; }
  mb.addEventListener('click', function () { setFull(full.hidden); });
  full.addEventListener('click', function (e) { if (e.target.closest('nav a')) setFull(false); });

  /* booking drawer */
  var svc = document.getElementById('bService');
  document.querySelectorAll('.svc li').forEach(function (li) {
    var o = document.createElement('option');
    o.textContent = li.querySelector('h3').textContent + ' — ' + li.querySelector('b').textContent;
    svc.appendChild(o);
  });
  var dr = document.getElementById('drawer'), lastFocus = null;
  function openDr() { lastFocus = document.activeElement; dr.hidden = false; document.body.style.overflow = 'hidden'; setFull(false); document.body.style.overflow = 'hidden'; dr.querySelector('select').focus(); }
  function closeDr() { dr.hidden = true; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  document.querySelectorAll('[data-open-book]').forEach(function (b) { b.addEventListener('click', openDr); });
  dr.querySelector('.drawer__x').addEventListener('click', closeDr);
  dr.addEventListener('click', function (e) { if (e.target === dr) closeDr(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!dr.hidden) closeDr(); else if (!full.hidden) { setFull(false); mb.focus(); }
  });
  dr.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = dr.querySelectorAll('button, select, input'); var a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });
  var bf = document.getElementById('bookForm');
  bf.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = bf.name.value.trim();
    if (!name) { document.getElementById('bErr').textContent = 'Add your name so we know who’s coming.'; bf.name.focus(); return; }
    document.getElementById('bErr').textContent = '';
    var msg = 'Hi Strivers Row — ' + name + ' here. I’d like to book: ' + bf.service.value + ' with ' + bf.barber.value + ', ' + bf.day.value + ' ' + bf.time.value.toLowerCase() + '.';
    var via = bf.querySelector('[name="via"]:checked').value;
    if (via === 'sms') location.href = 'sms:+12125550149?&body=' + encodeURIComponent(msg);
    else location.href = 'mailto:book@striversrowbarbers.com?subject=' + encodeURIComponent('Booking request — ' + name) + '&body=' + encodeURIComponent(msg);
  });

  /* reveal */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('blockquote, .svc li, .spread figure, .spread__pull, .block__grid article, .wk__board').forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();
