/* Ditmars Terminal Pharmacy — live status, menu dialog, "Where do I go?" router, scroll-lit service map */
(() => {
  'use strict';

  const PHONE = '+17185550143';
  const MAPS = 'https://www.google.com/maps/search/?api=1&query=31-22+Ditmars+Blvd+Astoria+NY+11105';
  const motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)');
  const wide = window.matchMedia('(min-width: 1100px)');

  /* ---------------- Live open status (America/New_York) ---------------- */
  // [open, close] in decimal hours; index = day of week (0 = Sunday)
  const HOURS = [[10, 17], [8, 21], [8, 21], [8, 21], [8, 21], [8, 21], [9, 19]];
  const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const WALKIN_CUTOFF = 0.5; // last walk-in shot 30 min before close

  const fmt = (h) => {
    const hr = Math.floor(h), min = Math.round((h - hr) * 60);
    const ap = hr >= 12 ? 'PM' : 'AM';
    const h12 = hr % 12 || 12;
    return min ? `${h12}:${String(min).padStart(2, '0')} ${ap}` : `${h12} ${ap}`;
  };

  function nyNow() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { day, t: Number(get('hour')) % 24 + Number(get('minute')) / 60 };
  }

  function status() {
    const { day, t } = nyNow();
    const [o, c] = HOURS[day];
    if (t >= o && t < c) {
      const soon = c - t <= 1;
      return {
        state: soon ? 'soon' : 'open', day, t, open: true, close: c,
        short: soon ? `Closing soon · ${fmt(c)}` : `Open now · until ${fmt(c)}`,
        long: soon ? `Closing soon. Open until ${fmt(c)} today` : `Open now until ${fmt(c)} today`,
        today: `${fmt(o)} – ${fmt(c)}`
      };
    }
    let nd = day, label;
    if (t < o) label = `today at ${fmt(o)}`;
    else { nd = (day + 1) % 7; label = `tomorrow at ${fmt(HOURS[nd][0])}`; }
    return {
      state: 'closed', day, t, open: false, nextDay: nd,
      short: `Closed · opens ${label}`,
      long: `Closed now. Opens ${label}`,
      today: `${fmt(o)} – ${fmt(c)}`,
      opensLabel: label
    };
  }

  function paintStatus() {
    const s = status();
    document.querySelectorAll('[data-status-wrap]').forEach((el) => { el.dataset.state = s.state; });
    document.querySelectorAll('[data-status-short]').forEach((el) => { el.textContent = s.short; });
    document.querySelectorAll('[data-status-long]').forEach((el) => { el.textContent = s.long; });
    document.querySelectorAll('[data-today]').forEach((el) => { el.textContent = s.today; });
    document.querySelectorAll('[data-today-label]').forEach((el) => { el.textContent = `Today · ${DAY[s.day]}`; });
    document.querySelectorAll('.hours tr').forEach((tr) => {
      const isToday = Number(tr.dataset.days) === s.day;
      tr.classList.toggle('is-today', isToday);
      const th = tr.querySelector('th');
      let tag = th.querySelector('.tag');
      if (isToday && !tag) { tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = 'Today'; th.append(tag); }
      if (!isToday && tag) tag.remove();
    });
    return s;
  }
  paintStatus();
  setInterval(paintStatus, 60 * 1000);

  /* ---------------- Menu dialog ---------------- */
  const menu = document.getElementById('menu');
  const opener = document.querySelector('[data-menu-open]');
  if (menu && opener && typeof menu.showModal === 'function') {
    opener.addEventListener('click', () => {
      menu.showModal();
      opener.setAttribute('aria-expanded', 'true');
      menu.querySelector('[data-menu-close]').focus();
    });
    menu.querySelector('[data-menu-close]').addEventListener('click', () => menu.close());
    menu.addEventListener('close', () => {
      opener.setAttribute('aria-expanded', 'false');
      if (!menu.dataset.nav) opener.focus();
      delete menu.dataset.nav;
    });
    // backdrop click
    menu.addEventListener('click', (e) => { if (e.target === menu) menu.close(); });
    // links close the menu, then the browser follows the anchor
    menu.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', () => { menu.dataset.nav = '1'; menu.close(); }));
    // focus trap
    menu.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = [...menu.querySelectorAll('a[href], button:not([disabled])')];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    opener.setAttribute('aria-expanded', 'false');
  } else if (opener) {
    opener.hidden = true;
  }

  /* ---------------- Router ---------------- */
  const LINES = {
    rx: { code: 'Rx', name: 'Prescriptions' },
    tx: { code: 'Tx', name: 'Transfers' },
    vx: { code: 'Vx', name: 'Vaccines' },
    dv: { code: 'Dv', name: 'Delivery' },
    bp: { code: 'BP', name: 'Blood pressure' },
    mc: { code: 'Mc', name: 'Medicare & cost help' },
    pk: { code: 'Pk', name: 'Pill packs' },
    eq: { code: 'Eq', name: 'Medical equipment' }
  };

  const openLine = (s) => s.open
    ? `Walk in any time today until ${fmt(s.close)}.`
    : `We’re closed right now. Walk in ${s.opensLabel.replace(' at ', ' from ')}.`;

  const ROUTES = {
    new: {
      line: 'rx', title: 'New prescription', where: 'Counter 1 · front of store',
      steps: () => [
        'Ask your doctor to e-prescribe to <b>Ditmars Terminal Pharmacy, 31-22 Ditmars Blvd, 11105</b>. Paper prescription? Bring it to Counter 1.',
        'We text you the moment it’s ready, or deliver it free anywhere in Astoria.',
        'First visit? Bring your insurance card. That’s it.'
      ],
      ready: ['Insurance card', 'Paper Rx, if any'],
      sms: 'Hi! My doctor is sending a new prescription to you. Please text me when it’s ready.',
      primary: 'text'
    },
    refill: {
      line: 'rx', title: 'Refill', where: 'Text us · pick up at Counter 1',
      steps: () => [
        'Text <b>REFILL</b> and the Rx number printed on your label. We’ve started the message for you.',
        'We text back when it’s ready to pick up.',
        'Rather not come in? Reply <b>DELIVER</b> for free delivery in Astoria.'
      ],
      ready: ['Your pill bottle or label'],
      sms: 'REFILL — Rx number: ',
      primary: 'text'
    },
    transfer: {
      line: 'tx', title: 'Switch to us', where: 'One phone call · Counter 1',
      steps: () => [
        'Call or text us your current pharmacy’s name and the medicines you take.',
        'We contact them and move your prescriptions over. You don’t have to call them.',
        'We text you when everything is ready to pick up, or deliver it free.'
      ],
      ready: ['Old pharmacy’s name', 'Your pill bottles'],
      sms: 'Hi, I’d like to transfer my prescriptions to Ditmars Terminal. Please call me back.',
      primary: 'call'
    },
    shot: {
      line: 'vx', title: 'Flu shot today', where: 'Counter 3 · back right, private room',
      steps: (s) => {
        const cut = s.open ? s.close - WALKIN_CUTOFF : null;
        const first = s.open && s.t < cut
          ? `Walk-ins are open now. Last walk-in today is <b>${fmt(cut)}</b>. No appointment.`
          : `Walk-ins resume ${s.open ? 'tomorrow' : s.opensLabel.replace(/ at .*/, '')} from <b>${fmt(HOURS[s.open ? (s.day + 1) % 7 : s.nextDay][0])}</b>. No appointment.`;
        return [first, 'Head past Counter 1 to Counter 3 at the back right.', 'Plan on about 20 minutes, including a short wait after your shot.'];
      },
      ready: ['Insurance card', 'Photo ID'],
      note: 'Other vaccines (COVID-19, shingles, pneumonia, Tdap) depend on season and supply. Call to check.',
      sms: 'Hi, do you have flu shots available for walk-in today?',
      primary: 'directions'
    },
    cost: {
      line: 'mc', title: 'Lower my costs', where: 'Consult desk · free',
      steps: () => [
        'Ask any pharmacist for a <b>price check</b>. We compare your plan, generics and manufacturer savings programs.',
        'On Medicare? Book a free Part D plan review. Open Enrollment runs Oct 15 – Dec 7.',
        'Bring your insurance or Medicare card and a list of what you take.'
      ],
      ready: ['Insurance / Medicare card', 'List of medicines'],
      sms: 'Hi, I’d like a price check or a Medicare plan review. When can I come in?',
      primary: 'text'
    },
    deliver: {
      line: 'dv', title: 'Deliver it', where: 'Astoria · 11102 · 11103 · 11105 · 11106',
      steps: () => [
        'Text us <b>DELIVER</b>. We reply to confirm your order and address.',
        'In by 4 PM, Monday to Saturday? It arrives the same day. Free across Astoria.',
        'We text a delivery window. Someone needs to be home to sign.'
      ],
      sms: 'DELIVER — please text me back to set up a delivery.',
      primary: 'text'
    },
    bp: {
      line: 'bp', title: 'Blood-pressure check', where: 'Station by the front window',
      steps: (s) => [
        openLine(s) + ' No appointment.',
        'It’s free and takes about five minutes. A pharmacist can go over the reading with you.',
        'It’s a screening, not a diagnosis. Share your numbers with your doctor.'
      ],
      sms: 'Hi, is the blood-pressure station free right now?',
      primary: 'directions'
    },
    packs: {
      line: 'pk', title: 'Pill packs', where: 'Set up by phone',
      steps: () => [
        'Call and ask for pill packs. A pharmacist goes through your medicines with you.',
        'We sync your refills and sort each dose into packets labelled by date and time.',
        'Pick up once a month, or get it delivered free. No extra charge.'
      ],
      ready: ['Your pill bottles'],
      sms: 'Hi, I’m interested in pill packs. Please call me back.',
      primary: 'call'
    },
    equip: {
      line: 'eq', title: 'Equipment & supplies', where: 'Aisle 6 · back left',
      steps: (s) => [
        `Canes, walkers, wheelchairs, compression, bathroom safety, diabetic supplies. ${openLine(s)}`,
        'Not on the shelf? Most items arrive the next day. Call to check.',
        'Have a prescription for it? Many items can be billed to Medicare Part B.'
      ],
      sms: 'Hi, do you have this in stock? ',
      primary: 'call'
    }
  };

  const ICON = (id, cls = '') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
  const smsHref = (body) => `sms:${PHONE}?&body=${encodeURIComponent(body)}`;

  function render(key) {
    const r = ROUTES[key];
    const L = LINES[r.line];
    const s = status();
    const acts = {
      call: `<a class="btn btn--ink" href="tel:${PHONE}">${ICON('i-phone')}Call 718-555-0143</a>`,
      text: `<a class="btn btn--ink" href="${smsHref(r.sms)}">${ICON('i-text')}Text us</a>`,
      directions: `<a class="btn btn--ink" href="${MAPS}" target="_blank" rel="noopener">${ICON('i-pin')}Directions<span class="sr"> (opens in a new tab)</span></a>`
    };
    // primary first, then the other two styled as outlines
    const order = [r.primary, ...['call', 'text', 'directions'].filter((k) => k !== r.primary)];
    const btns = order.map((k, i) => i ? acts[k].replace('btn--ink', 'btn--line') : acts[k]).join('');
    const ready = r.ready ? `<p class="dest__ready"><span class="mono">Have ready</span>${r.ready.map((x) => `<span>${x}</span>`).join('')}</p>` : '';
    const note = r.note ? `<p class="dest__note">${r.note}</p>` : '';
    return `
      <div class="dest is-new" data-line="${r.line}">
        <div class="dest__band">
          <span class="bul bul--xl" aria-hidden="true">${L.code}</span>
          <div>
            <p class="mono">Take line ${L.code} · ${L.name}</p>
            <h3 tabindex="-1">${r.title}</h3>
          </div>
        </div>
        <p class="dest__where mono">${ICON('i-arrow', 'arr')}${r.where}</p>
        <ol class="dest__steps">${r.steps(s).map((x) => `<li><span>${x}</span></li>`).join('')}</ol>
        ${ready}${note}
        <div class="dest__acts">${btns}</div>
        <a class="dest__more" href="#line-${r.line}">See the full ${L.code} line${ICON('i-arrow', 'arr')}</a>
      </div>`;
  }

  const out = document.getElementById('route-result');
  const opts = [...document.querySelectorAll('[data-route]')];
  opts.forEach((btn) => btn.addEventListener('click', () => {
    const key = btn.dataset.route;
    opts.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    out.innerHTML = render(key);
    const h = out.querySelector('h3');
    if (wide.matches) {
      h.focus({ preventScroll: true });
      const r = out.firstElementChild.getBoundingClientRect();
      if (r.top < 0 || r.top > window.innerHeight * 0.5) out.scrollIntoView({ behavior: motionOK.matches ? 'smooth' : 'auto', block: 'start' });
    } else {
      h.focus({ preventScroll: true });
      out.scrollIntoView({ behavior: motionOK.matches ? 'smooth' : 'auto', block: 'start' });
    }
  }));

  // deep link: #route-shot etc. preselect
  const m = location.hash.match(/^#route-(\w+)$/);
  if (m && ROUTES[m[1]]) {
    const b = opts.find((x) => x.dataset.route === m[1]);
    if (b) b.click();
  }

  /* ---------------- Scroll-lit strip map ---------------- */
  const map = document.querySelector('[data-map]');
  if (map && motionOK.matches && 'IntersectionObserver' in window) {
    map.classList.add('map--anim');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-lit'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -35% 0px' });
    map.querySelectorAll('.stop').forEach((s) => io.observe(s));
  }
})();
