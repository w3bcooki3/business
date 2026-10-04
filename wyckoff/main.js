(function () {
  'use strict';

  /* ---------- translations (EN is read from the page) ---------- */
  var T = {
    es: {
      skip: 'Saltar al contenido', emerg: '¿Emergencia?', call: 'Llame al', sub: 'Farmacia Comunitaria',
      n1: 'Resurtidos', n2: 'Transferir', n3: 'Vacunas', n4: 'Servicios', n5: 'Seguros', n6: 'Horario y mapa',
      cta: 'Resurtido por texto', menu: 'Menú', callq: 'Llamar', text: 'Texto', dir: 'Cómo llegar',
      d1: 'Un texto con su número Rx', d2: 'Llamamos a su farmacia anterior', d3: 'Sin cita', d4: 'Entrega, Narcan, pastilleros',
      d5: 'Medicaid, Medicare, EPIC', d6: 'Myrtle Ave y Wyckoff',
      emerg2: 'En una emergencia, llame al 911.', poison: 'Control de Envenenamiento: 1-800-222-1222.', crisis: 'Línea de crisis: llame o envíe un texto al 988.',
      eyebrow: 'Myrtle–Wyckoff · Bushwick y Ridgewood',
      h1: 'Su farmacia en la esquina de Myrtle y Wyckoff.',
      lede: 'Recetas, vacunas y consejos de verdad de un farmacéutico que sabe su nombre. En inglés, español y polaco, los siete días de la semana.',
      a1: 'Resurtido por texto', a1s: 'Listo en unos 20 minutos', a2: 'Cámbiese a nosotros', a2s: 'Llamamos a su farmacia anterior',
      a3: 'Vacunas sin cita', a3s: 'No necesita cita',
      corner: 'En Wyckoff Ave · Brooklyn 11237',
      p1: 'Entrega gratis en bicicleta', p2: 'Narcan gratis, sin preguntas', p3: 'Presión arterial gratis', p4: 'Precio antes de surtir', p5: 'Abierto 7 días',
      rh: 'Resurta con un solo texto.', rs: 'Llene esto y su teléfono escribe el mensaje por usted. Le avisamos cuando esté listo, normalmente en unos veinte minutos.',
      f_rx: 'Número Rx', f_rxh: 'Arriba a la izquierda de la etiqueta. ¿Sin etiqueta? Escriba el nombre del medicamento.',
      f_nm: 'Nombre en la receta', f_how: '¿Cómo lo quiere?', f_pick: 'Lo recojo yo', f_del: 'Entrega (gratis)',
      f_send: 'Abrir mis mensajes', f_fine: 'Este sitio no envía nada. No incluya diagnósticos; el número Rx es suficiente.',
      reply: '¡Recibido! Listo en unos 20 min. Le avisamos por texto. – Luis',
      th: 'Cámbiese a Wyckoff en tres pasos.', ts: 'Llamamos a su farmacia anterior y pasamos todos sus resurtidos. Usted no tiene que hablar con ellos.',
      s1: 'Díganos quién es', s1p: 'Su nombre y fecha de nacimiento.', s2: 'Díganos dónde surte ahora', s2p: 'El nombre de la farmacia y la calle.',
      s3: 'Nosotros hacemos el resto', s3p: 'Le escribimos el mismo día con precios y hora de recogida.',
      t_nm: 'Su nombre', t_dob: 'Fecha de nacimiento', t_old: 'Farmacia actual', t_go: 'Enviar solicitud',
      vh: 'Vacunas. Solo entre.', vs: 'Sin cita, siempre que la farmacia esté abierta. La mayoría cuestan $0 con seguro. Traiga su tarjeta e identificación.',
      v_flu: 'Gripe', v_flu_a: '2 años o más', v_flu_p: 'Cada otoño. Tarda cinco minutos.', v_cov_a: '3 años o más', v_cov_p: 'La fórmula de esta temporada. Revisamos si le corresponde.',
      v_shg: 'Culebrilla', v_shg_a: '50 años o más', v_shg_p: 'Dos dosis, con dos a seis meses de diferencia.',
      v_pn: 'Neumonía', v_pn_a: '50 años o más', v_pn_p: 'Normalmente una dosis. Primero revisamos su historial.',
      v_rsv_a: '75+, o 50+ con riesgo', v_rsv_p: 'Una dosis, no cada año.', v_td_a: 'Adultos 18+', v_td_p: 'Refuerzo del tétanos cada diez años. ¿Espera un bebé? Pregúntenos.',
      v_fine: 'Los requisitos siguen las normas actuales de los CDC y del Estado de Nueva York. Menores de 18 vienen con un padre o tutor.',
      svh: 'Lo que el mostrador hace por el barrio.',
      sv1: 'Entrega gratis en bicicleta', sv1p: 'Bushwick, Ridgewood y partes de Glendale. Pida antes de las 4 pm y lo recibe hoy.',
      sv2: 'Narcan gratis', sv2p: 'Pídalo en el mostrador. Sin receta, sin preguntas, sin juicios.',
      sv3: 'Presión arterial', sv3p: 'Siéntese cinco minutos y llévese una tarjeta con sus números. Gratis.',
      sv4: 'Pastilleros semanales', sv4p: 'Sus medicinas ordenadas por día y hora. Gratis si toma cuatro o más.',
      sv5: 'Revisión de medicinas', sv5p: 'Traiga todos los frascos, vitaminas también. Buscamos choques y duplicados.',
      sv6: 'Llamamos a su médico', sv6p: 'Renovaciones, autorizaciones previas y cuando un medicamento no está cubierto.',
      tmh: 'Luis creció en Gates Avenue.', tmp: 'Luis Ortega, PharmD, abrió Wyckoff en 2018 después de diez años en farmacias de cadena. Quería un mostrador donde nadie espere cuarenta minutos ni repita su historia en cada visita. Su mamá todavía viene los sábados.',
      ih: 'Aceptamos la mayoría de los planes.', is: 'Cada plan es diferente; llame y revisamos el suyo. ¿Sin seguro? Le damos el precio antes de surtir y buscamos una opción más barata.',
      i_com: 'La mayoría de planes de trabajo y sindicato', i_un: 'Sin seguro',
      fh: 'Preguntas frecuentes',
      q1: '¿Cuánto tarda una receta nueva?', q1a: 'Normalmente de 15 a 20 minutos. Si su médico la envió electrónicamente, mándenos un texto y estará lista cuando llegue.',
      q2: '¿Puedo recoger la receta de otra persona?', q2a: 'Sí, con su nombre y fecha de nacimiento. Algunos medicamentos controlados requieren su identificación.',
      q3: '¿Tienen pruebas de COVID y gripe?', q3a: 'Sí, en el mostrador. Según su plan pueden ser gratis.',
      q4: 'Mi medicamento no está cubierto. ¿Y ahora?', q4a: 'Llamamos a su médico para buscar una alternativa cubierta o una autorización previa, y le damos el precio en efectivo antes de decidir.',
      vih: 'Horario y cómo llegar', hcap: 'Horario', mon: 'Lunes', tue: 'Martes', wed: 'Miércoles', thu: 'Jueves', fri: 'Viernes', sat: 'Sábado', sun: 'Domingo',
      tr: 'Metro:', bus: 'Autobús:'
    },
    pl: {
      skip: 'Przejdź do treści', emerg: 'Nagły wypadek?', call: 'Dzwoń', sub: 'Apteka Sąsiedzka',
      n1: 'Realizacja recept', n2: 'Przeniesienie', n3: 'Szczepienia', n4: 'Usługi', n5: 'Ubezpieczenia', n6: 'Godziny i mapa',
      cta: 'Recepta SMS-em', menu: 'Menu', callq: 'Zadzwoń', text: 'SMS', dir: 'Dojazd',
      d1: 'Jeden SMS z numerem Rx', d2: 'Dzwonimy do Twojej apteki', d3: 'Bez umawiania', d4: 'Dostawa, Narcan, organizery leków',
      d5: 'Medicaid, Medicare, EPIC', d6: 'Myrtle Ave róg Wyckoff',
      emerg2: 'W nagłym wypadku dzwoń pod 911.', poison: 'Ośrodek Zatruć: 1-800-222-1222.', crisis: 'Telefon kryzysowy: zadzwoń lub napisz SMS na 988.',
      eyebrow: 'Myrtle–Wyckoff · Bushwick i Ridgewood',
      h1: 'Twoja apteka na rogu Myrtle i Wyckoff.',
      lede: 'Recepty, szczepienia i prawdziwa porada od farmaceuty, który zna Cię z imienia. Po angielsku, hiszpańsku i polsku, siedem dni w tygodniu.',
      a1: 'Recepta SMS-em', a1s: 'Gotowe w około 20 minut', a2: 'Przejdź do nas', a2s: 'Dzwonimy do Twojej apteki',
      a3: 'Szczepienia bez wizyty', a3s: 'Nie trzeba się umawiać',
      corner: 'Róg Wyckoff Ave · Brooklyn 11237',
      p1: 'Darmowa dostawa rowerem', p2: 'Darmowy Narcan, bez pytań', p3: 'Darmowy pomiar ciśnienia', p4: 'Cena przed realizacją', p5: 'Otwarte 7 dni',
      rh: 'Realizacja recepty jednym SMS-em.', rs: 'Wypełnij to, a telefon sam napisze wiadomość. Damy znać, gdy będzie gotowe, zwykle po około dwudziestu minutach.',
      f_rx: 'Numer Rx', f_rxh: 'W lewym górnym rogu etykiety. Brak etykiety? Wpisz nazwę leku.',
      f_nm: 'Imię i nazwisko na recepcie', f_how: 'Jak chcesz odebrać?', f_pick: 'Odbiorę osobiście', f_del: 'Dostawa (gratis)',
      f_send: 'Otwórz moje wiadomości', f_fine: 'Ta strona niczego nie wysyła. Nie podawaj diagnoz; wystarczy numer Rx.',
      reply: 'Mamy! Gotowe za ok. 20 min. Napiszemy SMS. – Luis',
      th: 'Przejdź do Wyckoff w trzech krokach.', ts: 'Dzwonimy do Twojej dotychczasowej apteki i przenosimy wszystkie recepty. Nie musisz z nimi rozmawiać.',
      s1: 'Powiedz nam, kim jesteś', s1p: 'Imię, nazwisko i data urodzenia.', s2: 'Powiedz, gdzie realizujesz recepty', s2p: 'Nazwa apteki i ulica.',
      s3: 'Resztą zajmiemy się my', s3p: 'Tego samego dnia piszemy z cenami i godziną odbioru.',
      t_nm: 'Imię i nazwisko', t_dob: 'Data urodzenia', t_old: 'Obecna apteka', t_go: 'Wyślij prośbę',
      vh: 'Szczepienia. Po prostu wejdź.', vs: 'Bez umawiania, zawsze gdy apteka jest otwarta. Większość kosztuje $0 z ubezpieczeniem. Weź kartę i dokument.',
      v_flu: 'Grypa', v_flu_a: 'Od 2 lat', v_flu_p: 'Co jesień. Trwa pięć minut.', v_cov_a: 'Od 3 lat', v_cov_p: 'Szczepionka na ten sezon. Sprawdzimy, czy Ci przysługuje.',
      v_shg: 'Półpasiec', v_shg_a: 'Od 50 lat', v_shg_p: 'Dwie dawki w odstępie od dwóch do sześciu miesięcy.',
      v_pn: 'Pneumokoki', v_pn_a: 'Od 50 lat', v_pn_p: 'Zwykle jedna dawka. Najpierw sprawdzamy historię szczepień.',
      v_rsv_a: '75+ lub 50+ z grupy ryzyka', v_rsv_p: 'Jedna dawka, nie co roku.', v_td_a: 'Dorośli 18+', v_td_p: 'Przypominająca dawka przeciw tężcowi co dziesięć lat. Spodziewasz się dziecka? Zapytaj.',
      v_fine: 'Zasady zgodne z aktualnymi wytycznymi CDC i stanu Nowy Jork. Osoby poniżej 18 lat przychodzą z rodzicem lub opiekunem.',
      svh: 'Co nasza lada robi dla okolicy.',
      sv1: 'Darmowa dostawa rowerem', sv1p: 'Bushwick, Ridgewood i część Glendale. Zamów do 16:00, dostaniesz dziś.',
      sv2: 'Darmowy Narcan', sv2p: 'Poproś przy ladzie. Bez recepty, bez pytań, bez oceniania.',
      sv3: 'Pomiar ciśnienia', sv3p: 'Usiądź na pięć minut i weź kartkę z wynikami. Za darmo.',
      sv4: 'Tygodniowe organizery leków', sv4p: 'Leki posortowane według dnia i pory. Gratis przy czterech lub więcej.',
      sv5: 'Przegląd leków', sv5p: 'Przynieś wszystkie opakowania, witaminy też. Szukamy interakcji i dubli.',
      sv6: 'Dzwonimy do lekarza', sv6p: 'Przedłużenia recept, zgody ubezpieczyciela i leki nierefundowane.',
      tmh: 'Luis dorastał na Gates Avenue.', tmp: 'Luis Ortega, PharmD, otworzył Wyckoff w 2018 roku po dziesięciu latach w sieciówkach. Chciał lady, przy której nikt nie czeka czterdziestu minut ani nie powtarza swojej historii przy każdej wizycie. Jego mama wciąż wpada w soboty.',
      ih: 'Przyjmujemy większość planów.', is: 'Każdy plan jest inny, więc zadzwoń, a sprawdzimy Twój. Bez ubezpieczenia? Podamy cenę przed realizacją i poszukamy tańszej opcji.',
      i_com: 'Większość planów pracowniczych i związkowych', i_un: 'Bez ubezpieczenia',
      fh: 'Częste pytania',
      q1: 'Ile trwa realizacja nowej recepty?', q1a: 'Zwykle 15–20 minut. Jeśli lekarz wysłał ją elektronicznie, napisz SMS, a będzie gotowa, gdy przyjdziesz.',
      q2: 'Czy mogę odebrać receptę innej osoby?', q2a: 'Tak, z jej imieniem, nazwiskiem i datą urodzenia. Niektóre leki kontrolowane wymagają Twojego dokumentu.',
      q3: 'Czy macie testy na COVID i grypę?', q3a: 'Tak, przy ladzie. W zależności od planu mogą być darmowe.',
      q4: 'Mój lek nie jest refundowany. Co teraz?', q4a: 'Dzwonimy do lekarza w sprawie zamiennika lub zgody ubezpieczyciela i podajemy cenę gotówkową, zanim zdecydujesz.',
      vih: 'Godziny i dojazd', hcap: 'Godziny otwarcia', mon: 'Poniedziałek', tue: 'Wtorek', wed: 'Środa', thu: 'Czwartek', fri: 'Piątek', sat: 'Sobota', sun: 'Niedziela',
      tr: 'Metro:', bus: 'Autobus:'
    }
  };
  var STATUS = {
    en: { open: 'Open now · until ', shut: 'Closed · opens ', today: 'today at ', tom: 'tomorrow at ', sign: ['OPEN', 'CLOSED'], am: ' am', pm: ' pm', msg: function (rx, nm, del) { return 'Hi, refill please. Rx #' + (rx || '…') + '. Name: ' + (nm || '…') + '. ' + (del ? 'Please deliver it.' : 'I’ll pick it up.'); }, tr: function (a, b, c) { return 'Hi, I’d like to transfer my prescriptions to Wyckoff. Name: ' + a + '. DOB: ' + b + '. Current pharmacy: ' + c + '.'; } },
    es: { open: 'Abierto · hasta las ', shut: 'Cerrado · abre ', today: 'hoy a las ', tom: 'mañana a las ', sign: ['ABIERTO', 'CERRADO'], am: ' am', pm: ' pm', msg: function (rx, nm, del) { return 'Hola, resurtido por favor. Rx #' + (rx || '…') + '. Nombre: ' + (nm || '…') + '. ' + (del ? 'Por favor, entréguenlo.' : 'Lo recojo yo.'); }, tr: function (a, b, c) { return 'Hola, quiero transferir mis recetas a Wyckoff. Nombre: ' + a + '. Fecha de nacimiento: ' + b + '. Farmacia actual: ' + c + '.'; } },
    pl: { open: 'Otwarte · do ', shut: 'Zamknięte · otwieramy ', today: 'dziś o ', tom: 'jutro o ', sign: ['OTWARTE', 'ZAMKNIĘTE'], h24: true, msg: function (rx, nm, del) { return 'Dzień dobry, proszę o realizację. Rx #' + (rx || '…') + '. Imię i nazwisko: ' + (nm || '…') + '. ' + (del ? 'Proszę o dostawę.' : 'Odbiorę osobiście.'); }, tr: function (a, b, c) { return 'Dzień dobry, chcę przenieść recepty do Wyckoff. Imię i nazwisko: ' + a + '. Data urodzenia: ' + b + '. Obecna apteka: ' + c + '.'; } }
  };

  var lang = 'en';
  var nodes = [].slice.call(document.querySelectorAll('[data-t]'));
  nodes.forEach(function (n) { n.dataset.en = n.innerHTML; });

  function setLang(l) {
    lang = l;
    document.documentElement.lang = l;
    nodes.forEach(function (n) {
      var k = n.dataset.t;
      n.innerHTML = l === 'en' ? n.dataset.en : (T[l][k] != null ? T[l][k] : n.dataset.en);
    });
    [].forEach.call(document.querySelectorAll('.lang button'), function (b) { b.setAttribute('aria-pressed', b.dataset.lang === l); });
    renderStatus(); buildRefill(); buildTransfer();
  }
  document.querySelector('.lang').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (b) setLang(b.dataset.lang);
  });

  /* ---------- live hours in New York time ---------- */
  var H = { 0: [9, 18], 1: [8, 21], 2: [8, 21], 3: [8, 21], 4: [8, 21], 5: [8, 21], 6: [8, 21] };
  function ny() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { h: (+o.hour) % 24, m: +o.minute, dow: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday] };
  }
  function fmt(h) { var S = STATUS[lang]; return S.h24 ? h + ':00' : ((h % 12) || 12) + (h >= 12 ? S.pm : S.am); }
  function renderStatus() {
    var now = ny(), d = H[now.dow], t = now.h + now.m / 60, S = STATUS[lang], open = t >= d[0] && t < d[1], txt;
    if (open) txt = S.open + fmt(d[1]);
    else if (t < d[0]) txt = S.shut + S.today + fmt(d[0]);
    else txt = S.shut + S.tom + fmt(H[(now.dow + 1) % 7][0]);
    [].forEach.call(document.querySelectorAll('[data-status]'), function (el) { el.textContent = txt; el.classList.toggle('is-open', open); });
    var sub = document.querySelector('[data-status-sub]'); if (sub) sub.textContent = txt.split('·')[1] ? txt.split('·')[1].trim() : txt;
    document.getElementById('signState').textContent = S.sign[open ? 0 : 1];
    document.querySelector('.sign').classList.toggle('is-closed', !open);
    var row = document.querySelector('#hrs tr[data-d="' + now.dow + '"]');
    [].forEach.call(document.querySelectorAll('#hrs tr'), function (r) { r.classList.toggle('today', r === row); });
  }

  /* LED cross */
  var cross = document.getElementById('cross'), html = '';
  for (var r = 0; r < 9; r++) for (var c = 0; c < 9; c++) {
    var on = (c >= 3 && c <= 5) || (r >= 3 && r <= 5);
    html += '<i' + (on ? ' class="on" style="--d:' + ((r + c) * 0.09).toFixed(2) + 's"' : '') + '></i>';
  }
  cross.innerHTML = html;

  /* ---------- refill by text ---------- */
  var f = document.getElementById('refillForm'), go = document.getElementById('refillGo'), bub = document.getElementById('bubble');
  function buildRefill() {
    var del = f.querySelector('input[name=how]:checked').value === 'deliver';
    var m = STATUS[lang].msg(f.rx.value.trim(), f.nm.value.trim(), del);
    bub.textContent = m;
    go.href = 'sms:+17185550163?&body=' + encodeURIComponent(m);
  }
  f.addEventListener('input', buildRefill); f.addEventListener('change', buildRefill);
  f.addEventListener('submit', function (e) { e.preventDefault(); go.click(); });

  /* ---------- transfer ---------- */
  var tf = document.getElementById('trForm'), tg = document.getElementById('trGo');
  function buildTransfer() {
    var v = function (id) { return document.getElementById(id).value.trim() || '…'; };
    tg.href = 'sms:+17185550163?&body=' + encodeURIComponent(STATUS[lang].tr(v('t1'), v('t2'), v('t3')));
  }
  tf.addEventListener('input', buildTransfer);
  tf.addEventListener('submit', function (e) { e.preventDefault(); tg.click(); });

  /* ---------- header: shadow, scroll-spy, drawer ---------- */
  var hdr = document.querySelector('.hdr');
  function onScroll() { hdr.classList.toggle('is-stuck', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var links = [].slice.call(document.querySelectorAll('.nav a'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); });
      });
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

  renderStatus(); buildRefill(); buildTransfer();
  setInterval(renderStatus, 60000);
})();
