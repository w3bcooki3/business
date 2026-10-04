/** Renders the concept switcher into #concept-bar. Remove for launch. */
(function () {
  var el = document.getElementById('concept-bar');
  if (!el) return;
  var current = el.dataset.current;
  var list = [
    { id: 'bake-sheet', no: '01', name: 'Bake Sheet' },
    { id: 'wycinanki', no: '02', name: 'Wycinanki Poster' }
  ];
  var me = list.find(function (c) { return c.id === current; });
  el.className = 'concept-bar';
  el.setAttribute('aria-label', 'Concept switcher');
  el.innerHTML = '<strong>Concept ' + me.no + ' / 02 · ' + me.name + '</strong><span>Kowal &amp; Daughter website proposal · fictional demo data</span>' +
    '<nav aria-label="Concepts">' + list.map(function (c) {
      return '<a href="../' + c.id + '/index.html"' + (c.id === current ? ' aria-current="page"' : '') + '>' + c.no + '</a>';
    }).join('') + '<a href="../../index.html#kowal-and-daughter">All concepts</a></nav>';
})();
