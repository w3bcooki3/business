/**
 * Shared, framework-free helpers for both concepts.
 * Everything time-based runs in the bakery's time zone (America/New_York).
 * Exposes window.KowalLive. Requires shared/data.js first.
 */
(function () {
  var K = window.KOWAL;
  var B = K.business;
  var WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function zonedParts(date) {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: B.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23'
    }).formatToParts(date || new Date());
    var get = function (t) { var p = parts.find(function (x) { return x.type === t; }); return p && p.value; };
    var hour = Number(get('hour')) % 24;
    return {
      year: Number(get('year')), month: Number(get('month')), day: Number(get('day')),
      weekday: WEEK.indexOf(get('weekday')), minutes: hour * 60 + Number(get('minute')),
      isoDate: get('year') + '-' + get('month') + '-' + get('day')
    };
  }
  function toMinutes(hhmm) { var a = hhmm.split(':'); return +a[0] * 60 + +a[1]; }
  function formatTime(hhmm, o) {
    o = o || {};
    var a = hhmm.split(':').map(Number), h = a[0], m = a[1];
    var mins = o.compact && m === 0 ? '' : ':' + String(m).padStart(2, '0');
    return (h % 12 || 12) + mins + (o.suffix ? (h < 12 ? ' AM' : ' PM') : '');
  }
  function minutesToHHMM(min) { return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0'); }
  function hoursFor(d) { return B.hours.find(function (h) { return h.day === d; }); }
  function short(h) { return formatTime(h, { suffix: true, compact: true }); }

  function storeStatus(now) {
    var t = hoursFor(now.weekday);
    if (t.open) {
      if (now.minutes >= toMinutes(t.open) && now.minutes < toMinutes(t.close)) return { open: true, label: 'Open now', detail: 'until ' + short(t.close) };
      if (now.minutes < toMinutes(t.open)) return { open: false, label: 'Closed', detail: 'opens ' + short(t.open) + ' today' };
    }
    for (var i = 1; i <= 7; i++) {
      var h = hoursFor((now.weekday + i) % 7);
      if (h.open) return { open: false, label: 'Closed', detail: 'opens ' + (i === 1 ? 'tomorrow' : h.label) + ' ' + short(h.open) };
    }
    return { open: false, label: 'Closed', detail: '' };
  }

  function isoUTC(iso) { var a = iso.split('-').map(Number); return Date.UTC(a[0], a[1] - 1, a[2]); }
  function daysBetween(a, b) { return Math.round((isoUTC(b) - isoUTC(a)) / 86400000); }
  function formatDate(iso, opts) {
    var a = iso.split('-').map(Number);
    var o = Object.assign({ timeZone: 'UTC' }, opts || { month: 'short', day: 'numeric' });
    return new Date(Date.UTC(a[0], a[1] - 1, a[2], 12)).toLocaleDateString('en-US', o);
  }

  function hoursSummary() {
    var groups = [];
    [1, 2, 3, 4, 5, 6, 0].map(hoursFor).forEach(function (h) {
      var key = h.open ? h.open + '-' + h.close : 'closed';
      var last = groups[groups.length - 1];
      if (last && last.key === key) last.days.push(h.day); else groups.push({ key: key, days: [h.day], h: h });
    });
    return groups.map(function (g) {
      var d = g.days, span = d.length > 1 ? WEEK[d[0]] + '–' + WEEK[d[d.length - 1]] : WEEK[d[0]];
      return span + ' ' + (g.h.open ? short(g.h.open) + '–' + short(g.h.close) : 'closed');
    });
  }

  /** Today's bake sheet with a live status per row; next baking day when closed. */
  function buildSheet(now) {
    var weekday = now.weekday, isToday = true, t = hoursFor(weekday);
    if (!t.open || now.minutes >= toMinutes(t.close)) {
      isToday = false;
      for (var i = 1; i <= 7; i++) { var d = (now.weekday + i) % 7; if (hoursFor(d).open) { weekday = d; break; } }
    }
    var rows = K.bakeSheet.filter(function (r) { return !r.days || r.days.indexOf(weekday) > -1; }).map(function (r) {
      var m = toMinutes(r.time), status = 'later';
      if (isToday) {
        if (now.minutes >= m + 90) status = 'shelf';
        else if (now.minutes >= m) status = 'fresh';
        else if (now.minutes >= m - 45) status = 'oven';
      }
      return Object.assign({}, r, { status: status });
    });
    var freshest = rows.slice().reverse().find(function (r) { return r.status === 'fresh'; });
    var next = rows.find(function (r) { return r.status === 'oven' || r.status === 'later'; });
    return { rows: rows, isToday: isToday, weekday: weekday, freshest: freshest, next: next };
  }

  function upcomingOrders(now) {
    return K.orderAhead.map(function (o) {
      return Object.assign({}, o, { daysTo: daysBetween(now.isoDate, o.date), daysToOrder: daysBetween(now.isoDate, o.orderBy) });
    }).filter(function (o) { return o.daysTo >= 0; });
  }

  function fullAddress() { var a = B.address; return a.street + ', ' + a.city + ', ' + a.region + ' ' + a.postal; }
  function mapsUrl() { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(fullAddress()); }
  function orderMailto(subject) {
    var body = 'Name:\nPhone:\nPick-up date:\nWhat you’d like:\n';
    return 'mailto:' + B.email + '?subject=' + encodeURIComponent(subject || 'Order') + '&body=' + encodeURIComponent(body);
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function countdown(days) { return days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : 'In ' + days + ' days'; }

  /** Calls fn(now) immediately and every 30 seconds. */
  function onTick(fn) {
    var run = function () { fn(zonedParts()); };
    run();
    setInterval(run, 30000);
  }

  /** Fill every [data-bind] element whose value never changes (phone, address…). */
  function bindStatic(root) {
    var map = {
      phone: B.phone.display, street: B.address.street, email: B.email,
      city: B.address.neighborhood + ', ' + B.address.city + ' ' + B.address.postal,
      year: String(B.founded.year), notice: K.demoNotice, copyright: '© ' + new Date().getFullYear() + ' ' + B.name
    };
    (root || document).querySelectorAll('[data-bind]').forEach(function (el) { el.textContent = map[el.dataset.bind]; });
    (root || document).querySelectorAll('[data-href="tel"]').forEach(function (el) { el.href = 'tel:' + B.phone.tel; });
    (root || document).querySelectorAll('[data-href="maps"]').forEach(function (el) { el.href = mapsUrl(); el.target = '_blank'; el.rel = 'noopener noreferrer'; });
    (root || document).querySelectorAll('[data-href="mail"]').forEach(function (el) { el.href = orderMailto(el.dataset.subject || 'Order'); });
  }

  /** One-shot reveal: adds .is-in when an element enters the viewport. Content stays visible without JS. */
  function reveal(selector) {
    var els = document.querySelectorAll(selector);
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.documentElement.classList.add('can-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /** Accessible full-screen menu: focus trap, Esc to close, scroll lock, focus return. */
  function menu(toggle, panel, closeBtn) {
    if (!toggle || !panel) return;
    function focusables() { return Array.prototype.slice.call(panel.querySelectorAll('a,button')); }
    function onKey(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        var f = focusables(), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    function open() {
      panel.hidden = false; toggle.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('is-locked');
      document.addEventListener('keydown', onKey);
      var f = focusables(); if (f[0]) f[0].focus();
    }
    function close() {
      panel.hidden = true; toggle.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('is-locked');
      document.removeEventListener('keydown', onKey);
      toggle.focus();
    }
    toggle.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    panel.querySelectorAll('a[href^="#"]').forEach(function (a) { a.addEventListener('click', close); });
  }

  window.KowalLive = {
    K: K, B: B, DAYS: DAYS, zonedParts: zonedParts, toMinutes: toMinutes, formatTime: formatTime, minutesToHHMM: minutesToHHMM,
    hoursFor: hoursFor, storeStatus: storeStatus, daysBetween: daysBetween, formatDate: formatDate, hoursSummary: hoursSummary,
    buildSheet: buildSheet, upcomingOrders: upcomingOrders, mapsUrl: mapsUrl, orderMailto: orderMailto, esc: esc,
    countdown: countdown, onTick: onTick, bindStatic: bindStatic, reveal: reveal, menu: menu,
    STATUS: { shelf: 'On the shelf', fresh: 'Just out', oven: 'In the oven', later: 'Later' }
  };
})();
