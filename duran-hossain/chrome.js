/* Durán & Hossain — shared page chrome: header shadow, scroll-spy, mobile drawer, mobile action dock. */
(function () {
  "use strict";
  var hdr = document.querySelector(".hdr"), hero = document.querySelector(".hero"), dock = document.getElementById("dock");
  var links = [].slice.call(document.querySelectorAll(".hnav a, .mnav__list a"));

  function onScroll() {
    hdr.classList.toggle("is-stuck", window.scrollY > 8);
    if (dock && hero) dock.classList.toggle("is-on", hero.getBoundingClientRect().bottom < 0);
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  if ("IntersectionObserver" in window) {
    var ids = ["services", "specialty", "shop", "vaccines", "insurance", "hours", "contact"], vis = {};
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
      var best = null, bv = 0;
      ids.forEach(function (id) { if ((vis[id] || 0) > bv) { bv = vis[id]; best = id; } });
      links.forEach(function (a) { a.setAttribute("aria-current", best && a.getAttribute("href") === "#" + best ? "true" : "false"); });
    }, { rootMargin: "-30% 0px -55% 0px", threshold: [0, .01, .25, .5, 1] });
    ids.forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  var m = document.getElementById("mnav"), btn = document.querySelector(".mbtn"), last;
  if (!m || !btn) return;
  function focusables() { return m.querySelectorAll("a[href],button:not([tabindex='-1'])"); }
  function open() {
    last = document.activeElement; m.hidden = false;
    requestAnimationFrame(function () { m.classList.add("is-open"); });
    btn.setAttribute("aria-expanded", "true"); document.body.classList.add("is-locked");
    setTimeout(function () { m.querySelector(".mnav__x").focus(); }, 60);
  }
  function close(viaLink) {
    m.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); document.body.classList.remove("is-locked");
    setTimeout(function () { if (!m.classList.contains("is-open")) m.hidden = true; }, 360);
    if (!viaLink && last) last.focus();
  }
  btn.addEventListener("click", open);
  m.querySelector(".mnav__x").addEventListener("click", function () { close(); });
  m.querySelector(".mnav__scrim").addEventListener("click", function () { close(); });
  m.addEventListener("click", function (e) { if (e.target.closest("a[href^='#']")) close(true); });
  document.addEventListener("keydown", function (e) {
    if (!m.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "Tab") {
      var f = focusables(), a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });
  window.matchMedia("(min-width:1100px)").addEventListener("change", function (q) { if (q.matches && m.classList.contains("is-open")) close(); });
})();
