/* ══ Neighbors — interactive layer: window sign, corkboard, shopping list, checklist ══ */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function ny() {
    var o = {};
    try { new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric", hour12: false, weekday: "long" }).formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; }); }
    catch (e) {}
    var dn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return { h: (+o.hour) % 24, m: +o.minute, dow: dn.indexOf(o.weekday), wd: o.weekday, mo: o.month, d: o.day, y: o.year };
  }
  var n = ny(), t = n.h + n.m / 60;
  var HRS = (window.RX_HOURS || []).map(function (r) { return [+r[1].split(":")[0] + r[1].split(":")[1] / 60, +r[2].split(":")[0] + r[2].split(":")[1] / 60]; });
  function ap(h) { return ((h % 12) || 12) + (h >= 12 ? " pm" : " am"); }

  /* window sign */
  var today = HRS[n.dow], open = today && t >= today[0] && t < today[1];
  var sign = $("#n-sign"), note = $("#n-sign-note");
  if (sign) {
    if (!open) sign.classList.add("is-closed");
    if (open) note.textContent = "Come on in — open till " + ap(today[1]) + ".";
    else if (today && t < today[0]) note.textContent = "Back at " + ap(today[0]) + " this morning.";
    else note.textContent = "Back tomorrow at " + ap(HRS[(n.dow + 1) % 7][0]) + ". Text us tonight!";
    sign.addEventListener("click", function () { sign.classList.toggle("is-closed"); });
  }

  /* corkboard notes */
  $$(".n-notes button").forEach(function (b) {
    b.addEventListener("click", function () { b.setAttribute("aria-expanded", String(b.getAttribute("aria-expanded") !== "true")); });
  });

  /* basket */
  var ITEMS = [
    ["h", "Blood-pressure monitor", "cuffs in 3 sizes", 39, 89, "#3F7A5E", "BP"],
    ["h", "Compression stockings", "measured in store", 24, 58, "#2B352E", "CS"],
    ["h", "Diabetic test strips", "common meters", 18, 46, "#8E5024", "TS"],
    ["h", "Rapid COVID-19 test", "2-pack", 8, 16, "#B4530F", "CV"],
    ["b", "Prenatal vitamins", "folic acid + iron", 14, 34, "#AC5D6E", "PN"],
    ["b", "Infant acetaminophen", "dose written on the box", 6, 11, "#5173A4", "IA"],
    ["b", "Diapers", "newborn to size 6", 12, 32, "#5C7869", "DI"],
    ["b", "Electrolyte freezer pops", "for kids who won’t drink it", 5, 9, "#966747", "EP"],
    ["s", "Ceramide moisturizer", "fragrance-free", 12, 28, "#8C711B", "CM"],
    ["s", "Mineral sunscreen SPF 30+", "including tinted", 11, 24, "#B4530F", "SP"],
    ["s", "Hair oil", "amla · castor · argan", 7, 19, "#6B4E8C", "HO"],
    ["v", "Vitamin D & B12", "most-asked on the block", 8, 22, "#3F7A5E", "D3"],
    ["v", "Omega-3", "fish oil", 9, 26, "#2B6F8E", "Ω3"],
    ["v", "Probiotics", "fridge-kept", 14, 32, "#8E5024", "PB"]
  ];
  var list = $("#n-items"), lines = $("#n-lines"), tot = $("#n-tot"), send = $("#n-send"), picked = [];
  if (list) {
    list.innerHTML = ITEMS.map(function (it, i) {
      return '<li class="n-item is-on" data-a="' + it[0] + '"><button type="button" aria-pressed="false" data-i="' + i + '"><span class="n-item__ico" style="background:' + it[5] + '" aria-hidden="true">' + it[6] + '</span><span><b>' + it[1] + '</b><small>' + it[2] + '</small></span><span class="n-item__p">$' + it[3] + "–" + it[4] + "</span></button></li>";
    }).join("");
    list.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var i = +b.getAttribute("data-i"), k = picked.indexOf(i);
      if (k > -1) picked.splice(k, 1); else picked.push(i);
      render();
    });
    lines.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      picked.splice(picked.indexOf(+b.getAttribute("data-i")), 1); render();
    });
    $$(".n-aisles button").forEach(function (a) {
      a.addEventListener("click", function () {
        $$(".n-aisles button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === a)); });
        var f = a.getAttribute("data-a");
        $$(".n-item").forEach(function (li) { li.classList.toggle("is-on", f === "all" || li.getAttribute("data-a") === f); });
      });
    });
  }
  if (send) send.addEventListener("click", function (e) { if (send.getAttribute("aria-disabled") === "true") e.preventDefault(); });
  function render() {
    $$(".n-item button").forEach(function (b) { b.setAttribute("aria-pressed", String(picked.indexOf(+b.getAttribute("data-i")) > -1)); });
    if (!picked.length) {
      lines.innerHTML = '<li class="n-receipt__empty">Your list is empty.<br>Tap something on the left.</li>';
      tot.textContent = "$0"; send.setAttribute("aria-disabled", "true"); send.href = "sms:+17185550100"; return;
    }
    var lo = 0, hi = 0;
    lines.innerHTML = picked.map(function (i) {
      var it = ITEMS[i]; lo += it[3]; hi += it[4];
      return "<li><span>" + it[1] + "</span><span>$" + it[3] + "–" + it[4] + '<button type="button" data-i="' + i + '" aria-label="Remove ' + it[1] + '">×</button></span></li>';
    }).join("");
    tot.textContent = "$" + lo + "–" + hi;
    send.removeAttribute("aria-disabled");
    var body = "Hi! Delivery please:\n" + picked.map(function (i) { return "- " + ITEMS[i][1]; }).join("\n") + "\nName: \nAddress: ";
    send.href = "sms:+17185550100?&body=" + encodeURIComponent(body);
  }
  var rd = $("#n-rdate");
  if (rd) rd.textContent = (n.wd || "").toUpperCase() + " " + (n.mo || "").toUpperCase() + " " + n.d + ", " + n.y;

  /* checklist */
  var checks = $$("#n-check button"), done = $("#n-check-done");
  checks.forEach(function (c) {
    c.addEventListener("click", function () {
      c.setAttribute("aria-pressed", String(c.getAttribute("aria-pressed") !== "true"));
      var k = checks.filter(function (x) { return x.getAttribute("aria-pressed") === "true"; }).length;
      done.textContent = k === checks.length ? "All set — see you at the counter!" : k >= 2 ? "Almost there…" : "";
    });
  });

  /* reveals */
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    $$(".n-notes li, .n-coupon, .n-stickers li, .n-scrap li, .n-flyer, .n-polaroid, .n-post").forEach(function (el) { el.classList.add("n-rv"); io.observe(el); });
  }
})();
