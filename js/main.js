(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var heute = new Date();
  var reduziert = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- Gedenktage ---------- */
  function totensonntag(jahr) {
    var d = new Date(jahr, 10, 26);
    while (d.getDay() !== 0) d.setDate(d.getDate() - 1);
    return d;
  }
  var MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  function datum(d) { return d.getDate() + '. ' + MONATE[d.getMonth()]; }
  function tageBis(d) { return Math.ceil((d - new Date(heute.getFullYear(), heute.getMonth(), heute.getDate())) / 864e5); }

  function jahreszeit(d) {
    var m = d.getMonth();
    if (m >= 2 && m <= 4) return 'fruehling';
    if (m >= 5 && m <= 7) return 'sommer';
    if (m >= 8 && m <= 10) return 'herbst';
    return 'winter';
  }
  var jetzt = jahreszeit(heute);

  /* ---------- Saison-Hinweis oben ---------- */
  (function () {
    var t = $('#saison-text'), p = $('#saison-hinweis .punkt');
    if (!t) return;
    var j = heute.getFullYear(), ah = new Date(j, 10, 1), ts = totensonntag(j);
    var farben = { fruehling: 'var(--fruehling)', sommer: 'var(--sommer)', herbst: 'var(--herbst)', winter: 'var(--winter)' };
    p.style.background = farben[jetzt];
    if (heute <= ts && heute.getMonth() >= 8) {
      t.textContent = 'Allerheiligen ist am ' + datum(ah) + ', Totensonntag am ' + datum(ts) + '. Gestecke und die Herbstbepflanzung jetzt rechtzeitig bestellen.';
    } else if (heute.getMonth() >= 10) {
      t.textContent = 'Jetzt im Advent: Tannengrün für die Winterabdeckung und Gestecke zu Weihnachten.';
    } else if (jetzt === 'winter') {
      t.textContent = 'Jetzt ist Zeit für Baum- und Strauchschnitt und um den Garten fürs Frühjahr zu planen.';
    } else if (jetzt === 'fruehling') {
      t.textContent = 'Jetzt im Frühling: Frühjahrsbepflanzung fürs Grab, Beete, Rollrasen und Pflaster für den Garten.';
    } else {
      t.textContent = 'Jetzt im Sommer: Sommerbepflanzung, Gießen am Grab auch in der Urlaubszeit, Hecken in Form.';
    }
  })();

  /* ---------- Gärtnerjahr ---------- */
  var ZEITEN = {
    fruehling: {
      name: 'Frühling', monate: 'März bis Mai', farbe: '#9cbf6e', bild: 'img/fruehling.jpg', start: 2,
      garten: ['Beete neu anlegen und bepflanzen', 'Rasen auffrischen oder Rollrasen verlegen', 'Gute Zeit für Pflaster, Wege und Terrassen'],
      grab: ['Grab vom Winter befreien, Tannengrün abräumen', 'Frühjahrsbepflanzung, zum Beispiel mit Primeln und Hornveilchen', 'Gesteck zu Ostern'],
      fuss: 'Wer im Frühjahr pflastern oder Rollrasen legen lassen möchte, fragt am besten schon im Winter an.'
    },
    sommer: {
      name: 'Sommer', monate: 'Juni bis August', farbe: '#d8b24c', bild: 'img/sommer.jpg', start: 5,
      garten: ['Rasenschnitt und Bewässerung', 'Hecken in Form schneiden', 'Kübelpflanzen für Terrasse und Eingang'],
      grab: ['Sommerbepflanzung, zum Beispiel mit Begonien', 'Regelmäßig gießen, auch in der Urlaubszeit', 'Unkraut und Moos entfernen'],
      fuss: 'In der Urlaubszeit übernimmt die Gärtnerei das Gießen am Grab.'
    },
    herbst: {
      name: 'Herbst', monate: 'September bis November', farbe: '#a0618f', bild: 'img/herbst.jpg', start: 8,
      garten: ['Pflanzzeit für Hecken, Sträucher und Bäume', 'Laub entfernen, Beete winterfest machen', 'Rollrasen lässt sich jetzt noch gut verlegen'],
      grab: ['Herbstbepflanzung mit Heide und Erika', 'Gestecke zu Allerheiligen und Totensonntag', 'Laub entfernen, Grab für den Winter vorbereiten'],
      fuss: ''
    },
    winter: {
      name: 'Winter', monate: 'Dezember bis Februar', farbe: '#40604f', bild: 'img/winter.jpg', start: 11,
      garten: ['Baum- und Strauchschnitt in der Ruhezeit', 'Neuen Garten oder Einfahrt in Ruhe planen', 'Gehölze nach Sturm kontrollieren'],
      grab: ['Abdeckung mit Tannengrün', 'Gesteck zu Weihnachten', 'Grab im Blick behalten, auch bei Frost'],
      fuss: 'Die ruhige Zeit eignet sich gut, um mit uns den Garten fürs Frühjahr zu planen.'
    }
  };
  (function () {
    var ts = totensonntag(heute.getFullYear());
    ZEITEN.herbst.fuss = 'Allerheiligen ' + datum(new Date(heute.getFullYear(), 10, 1)) + ', Totensonntag ' + datum(ts) + ': Gestecke rechtzeitig bestellen.';
  })();

  var svg = $('#ring-svg'), C = 200, RA = 190, RI = 128;
  function winkel(monatPos) { return (monatPos / 12) * 2 * Math.PI - Math.PI / 2; }
  function pt(r, a) { return [C + r * Math.cos(a), C + r * Math.sin(a)]; }
  function bogen(a0, a1) {
    var p0 = pt(RA, a0), p1 = pt(RA, a1), q1 = pt(RI, a1), q0 = pt(RI, a0), gross = (a1 - a0) > Math.PI ? 1 : 0;
    return 'M' + p0 + ' A' + RA + ' ' + RA + ' 0 ' + gross + ' 1 ' + p1 + ' L' + q1 + ' A' + RI + ' ' + RI + ' 0 ' + gross + ' 0 ' + q0 + 'Z';
  }

  if (svg) {
    var defs = el('defs', {}, svg);
    var schatten = el('filter', { id: 'rs', x: '-10%', y: '-10%', width: '120%', height: '120%' }, defs);
    el('feDropShadow', { dx: 0, dy: 3, stdDeviation: 5, 'flood-color': '#1e2520', 'flood-opacity': .22 }, schatten);
    var gRing = el('g', { filter: 'url(#rs)' }, svg);
    Object.keys(ZEITEN).forEach(function (k) {
      var z = ZEITEN[k], a0 = winkel(z.start) + 0.012, a1 = winkel(z.start + 3) - 0.012, d = bogen(a0, a1);
      var g = el('g', { 'class': 'seg ' + k, 'data-zeit': k, tabindex: 0, role: 'button', 'aria-label': z.name + ', ' + z.monate }, gRing);
      var cp = el('clipPath', { id: 'c-' + k }, defs);
      el('path', { d: d }, cp);
      el('image', { href: z.bild, x: 0, y: 0, width: 400, height: 400, preserveAspectRatio: 'xMidYMid slice', 'clip-path': 'url(#c-' + k + ')' }, g);
      el('path', { d: d, fill: z.farbe, 'fill-opacity': .28 }, g);
      var am = (a0 + a1) / 2, lp = pt((RA + RI) / 2, am);
      var tx = el('text', { x: lp[0], y: lp[1] + 6, 'text-anchor': 'middle', fill: '#fff', style: 'font:600 17px Spectral,serif;paint-order:stroke;stroke:rgba(0,0,0,.45);stroke-width:3px' }, g);
      tx.textContent = z.name;
    });
    // Monate
    'JFMAMJJASOND'.split('').forEach(function (m, i) {
      var p = pt(RA + 15, winkel(i + 0.5));
      var t = el('text', { x: p[0], y: p[1] + 4, 'text-anchor': 'middle', 'class': 'mon' }, svg);
      t.textContent = m;
      var a = winkel(i), s0 = pt(RA + 3, a), s1 = pt(RA + 9, a);
      el('line', { x1: s0[0], y1: s0[1], x2: s1[0], y2: s1[1], stroke: '#b9b09c', 'stroke-width': 1 }, svg);
    });
    // Gedenktage
    var jahr = heute.getFullYear();
    [[new Date(jahr, 10, 1), 'Allerheiligen'], [totensonntag(jahr), 'Totensonntag']].forEach(function (g) {
      var pos = g[0].getMonth() + (g[0].getDate() - 1) / 30, a = winkel(pos), p = pt(RA, a);
      var c = el('circle', { cx: p[0], cy: p[1], r: 5.5, fill: '#e2a845', stroke: '#fffdf8', 'stroke-width': 2 }, svg);
      el('title', {}, c).textContent = g[1] + ', ' + datum(g[0]);
    });
    // Mitte
    el('circle', { cx: C, cy: C, r: RI - 8, fill: '#fffdf8' }, svg);
    var posHeute = heute.getMonth() + (heute.getDate() - 1) / 31;
    var aHeute = posHeute / 12 * 360;
    var zeiger = el('g', { 'class': 'heute', style: 'transform-origin:200px 200px;transform:rotate(' + (reduziert ? aHeute : 0) + 'deg)' }, svg);
    el('line', { x1: C, y1: C, x2: C, y2: C - RI + 30, stroke: '#2c4433', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, zeiger);
    el('circle', { cx: C, cy: C - RI + 26, r: 7, fill: '#2c4433', stroke: '#fffdf8', 'stroke-width': 2.5 }, zeiger);
    el('circle', { cx: C, cy: C, r: 5, fill: '#2c4433' }, svg);
    var t1 = el('text', { x: C, y: C + 38, 'text-anchor': 'middle', 'class': 'mitte-t' }, svg);
    t1.textContent = datum(heute);
    var t2 = el('text', { x: C, y: C + 60, 'text-anchor': 'middle', 'class': 'mitte-s' }, svg);
    var ah = new Date(jahr, 10, 1), tsn = totensonntag(jahr);
    if (tageBis(ah) > 0 && tageBis(ah) < 45) t2.textContent = 'noch ' + tageBis(ah) + ' Tage bis Allerheiligen';
    else if (tageBis(tsn) > 0 && tageBis(tsn) < 30) t2.textContent = 'noch ' + tageBis(tsn) + ' Tage bis Totensonntag';
    else t2.textContent = 'heute im Gärtnerjahr';
    var t3 = el('text', { x: C, y: C - 30, 'text-anchor': 'middle', 'class': 'mitte-s', style: 'letter-spacing:.14em;font-size:11px' }, svg);
    t3.textContent = 'HEUTE';

    if (!reduziert) {
      var io0 = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { zeiger.style.transform = 'rotate(' + aHeute + 'deg)'; io0.disconnect(); }
      }, { threshold: .4 });
      io0.observe(svg);
    }
  }

  function zeigeZeit(k) {
    var z = ZEITEN[k], tafel = $('#zeit-tafel');
    $('#ring').setAttribute('data-aktiv', k);
    $$('.zeiten button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.zeit === k ? 'true' : 'false'); });
    function fuellen() {
      $('#liste-garten').innerHTML = z.garten.map(function (x) { return '<li>' + x + '</li>'; }).join('');
      $('#liste-grab').innerHTML = z.grab.map(function (x) { return '<li>' + x + '</li>'; }).join('');
      $('#zeit-fuss').textContent = z.fuss;
      tafel.classList.remove('wechsel');
    }
    if (reduziert || !tafel.dataset.bereit) { tafel.dataset.bereit = 1; fuellen(); }
    else { tafel.classList.add('wechsel'); setTimeout(fuellen, 220); }
  }
  // "jetzt" kennzeichnen
  $$('.zeiten button').forEach(function (b) {
    if (b.dataset.zeit === jetzt) b.insertAdjacentHTML('beforeend', ' <small>· jetzt</small>');
    b.addEventListener('click', function () { zeigeZeit(b.dataset.zeit); });
  });
  $$('#ring .seg').forEach(function (g) {
    g.addEventListener('click', function () { zeigeZeit(g.dataset.zeit); });
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zeigeZeit(g.dataset.zeit); } });
  });
  if ($('#zeit-tafel')) zeigeZeit(jetzt);

  /* ---------- Formular mit Weichen ---------- */
  var form = $('#form'), aktiv = 'garten';
  function setzeWeiche(t) {
    aktiv = t;
    form.setAttribute("data-teil", t);
    $$('.weichen button').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.teil === t ? 'true' : 'false'); });
    $$('.teil').forEach(function (d) { d.hidden = d.dataset.teil !== t; });
    $('#vorschau-grab').hidden = t !== 'grab';
    if (t === 'grab') zeichnePlan();
    zusammenfassen();
  }
  $$('.weichen button').forEach(function (b) { b.addEventListener('click', function () { setzeWeiche(b.dataset.teil); }); });
  $$('[data-weiche]').forEach(function (a) { a.addEventListener('click', function () { setzeWeiche(a.dataset.weiche); }); });

  var fl = $('#g_flaeche'), flo = $('#g_flaeche_out');
  function flText() { return +fl.value === 0 ? 'weiß nicht' : (+fl.value >= 600 ? 'über 600 m²' : 'ca. ' + fl.value + ' m²'); }
  fl.addEventListener('input', function () { flo.textContent = flText(); });
  var jr = $('#b_jahre'), jro = $('#b_jahre_out');
  jr.addEventListener('input', function () { jro.textContent = jr.value + ' Jahre'; });

  function werte(name) { return $$('[name="' + name + '"]:checked').map(function (i) { return i.value; }); }

  function zusammenfassen() {
    var z = [];
    if (aktiv === 'garten') {
      var l = werte('g_leistung'); if (l.length) z.push(['Garten', l.join(', ')]);
      if (+fl.value) z.push(['Fläche', flText()]);
      var w = werte('g_wann'); if (w.length) z.push(['Wann', w[0]]);
      if ($('#g_ort').value.trim()) z.push(['Ort', $('#g_ort').value.trim()]);
    } else if (aktiv === 'grab') {
      var u = werte('b_umfang')[0];
      z.push(['Pflege', u + (u === 'Dauergrabpflege' ? ', ' + jr.value + ' Jahre' : '')]);
      z.push(['Grab', werte('b_art')[0]]);
      if (u !== 'Nur ein Gesteck' && werte('b_pflanz').length) z.push(['Bepflanzung', werte('b_pflanz').join(', ')]);
      if (werte('b_gesteck').length) z.push(['Gestecke', werte('b_gesteck').join(', ')]);
      if ($('#b_friedhof').value.trim()) z.push(['Friedhof', $('#b_friedhof').value.trim()]);
    } else {
      var m = werte('m_art'); if (m.length) z.push(['Interesse', m[0]]);
      if ($('#m_cv').files && $('#m_cv').files.length) z.push(['Lebenslauf', $('#m_cv').files[0].name]);
    }
    var box = $('#zusammen');
    box.innerHTML = z.length ? z.map(function (r) { return '<b>' + r[0] + ':</b> ' + r[1].replace(/</g, '&lt;'); }).join('<br>') : 'Wählen Sie links aus, was Sie brauchen. Hier sehen Sie, was bei der Gärtnerei ankommt.';
    return z;
  }

  form.addEventListener('change', function (e) {
    if (e.target.name === 'b_umfang') {
      var u = e.target.value;
      $('#feld-laufzeit').hidden = u !== 'Dauergrabpflege';
      $('#feld-bepflanzung').hidden = u === 'Nur ein Gesteck';
    }
    if (aktiv === 'grab') zeichnePlan();
    zusammenfassen();
  });
  form.addEventListener('input', zusammenfassen);

  /* ---------- Pflegeplan (Grab von oben) ---------- */
  var planZeit = 'Herbst';
  var BEPFL = {
    'Frühjahr': { farben: ['#6f55b8', '#f1d04a', '#f4eedf', '#8a6ad0'], text: 'Frühjahr: Primeln und Hornveilchen bringen nach dem Winter die ersten Farben.' },
    'Sommer': { farben: ['#c93448', '#ec8ea2', '#fbf6ee', '#d9566a'], text: 'Sommer: Begonien blühen bis in den Herbst und kommen mit Sonne gut zurecht.' },
    'Herbst': { farben: ['#8e4785', '#c27ab3', '#b7bfb4', '#a35a98'], text: 'Herbst: Heide und Erika mit Silberblatt halten bis in den Winter.' },
    'Winter (Tannengrün)': { farben: [], text: 'Winter: Eine Abdeckung aus Tannengrün schützt die Pflanzen vor Frost.' }
  };
  function zufall(seed) { return function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }; }

  function zeichnePlan() {
    var s = $('#plan'); if (!s) return;
    while (s.firstChild) s.removeChild(s.firstChild);
    var art = werte('b_art')[0] || 'Einzelgrab', umfang = werte('b_umfang')[0];
    var gewaehlt = umfang === 'Nur ein Gesteck' ? [] : werte('b_pflanz');
    var gestecke = werte('b_gesteck');
    var B = art === 'Doppelgrab' ? { x: 14, y: 60, w: 192, h: 224, sw: 130 } : art === 'Urnengrab' ? { x: 50, y: 112, w: 120, h: 120, sw: 62 } : { x: 42, y: 60, w: 136, h: 224, sw: 86 };
    // Rasen/Weg
    el('rect', { x: 0, y: 0, width: 220, height: 300, rx: 10, fill: '#ece6d8' }, s);
    // Stein (ohne Inschrift)
    el('rect', { x: 110 - B.sw / 2, y: B.y - 40, width: B.sw, height: 30, rx: 5, fill: '#9a978f' }, s);
    el('rect', { x: 110 - B.sw / 2 + 4, y: B.y - 37, width: B.sw - 8, height: 6, rx: 3, fill: '#b3b0a8' }, s);
    // Beet
    el('rect', { x: B.x, y: B.y, width: B.w, height: B.h, rx: 8, fill: '#6b5440' }, s);
    // Bodendecker-Rahmen
    var r = zufall(art.length * 31), rand = 13;
    for (var x = B.x + 6; x < B.x + B.w - 2; x += 8) for (var y = B.y + 6; y < B.y + B.h - 2; y += 8) {
      var innen = x > B.x + rand && x < B.x + B.w - rand && y > B.y + rand && y < B.y + B.h - rand;
      if (!innen) el('circle', { cx: x + (r() - .5) * 3, cy: y + (r() - .5) * 3, r: 4.6, fill: r() > .5 ? '#3d6a42' : '#4f7d4f' }, s);
    }
    var ix = B.x + rand + 3, iy = B.y + rand + 3, iw = B.w - 2 * rand - 6, ih = B.h - 2 * rand - 6;
    var aktivP = gewaehlt.indexOf(planZeit) > -1;
    var legende = $('#plan-legende');
    if (!aktivP) {
      el('rect', { x: ix, y: iy, width: iw, height: ih, rx: 4, fill: '#7a6049' }, s);
      legende.textContent = gewaehlt.length ? planZeit.replace(' (Tannengrün)', '') + ' ist nicht gewählt. Die Fläche bleibt ruhig mit Bodendeckern.' : 'Ohne Wechselbepflanzung: gepflegte Fläche mit Bodendeckern.';
    } else if (planZeit.indexOf('Winter') === 0) {
      el('rect', { x: ix, y: iy, width: iw, height: ih, rx: 4, fill: '#2f4f3c' }, s);
      var rw = zufall(7);
      for (var k = 0; k < Math.round(iw * ih / 260); k++) {
        var cx = ix + rw() * iw, cy = iy + rw() * ih, a = rw() * Math.PI;
        var dx = Math.cos(a) * 11, dy = Math.sin(a) * 11;
        el('line', { x1: cx - dx, y1: cy - dy, x2: cx + dx, y2: cy + dy, stroke: rw() > .5 ? '#3f6a4d' : '#557f5d', 'stroke-width': 4, 'stroke-linecap': 'round' }, s);
      }
      for (var z = 0; z < 4; z++) el('ellipse', { cx: ix + iw * (.2 + .6 * rw()), cy: iy + ih * (.15 + .7 * rw()), rx: 4, ry: 6, fill: '#7a4e2d' }, s);
      legende.textContent = BEPFL[planZeit].text;
    } else {
      el('rect', { x: ix, y: iy, width: iw, height: ih, rx: 4, fill: '#7a6049' }, s);
      var f = BEPFL[planZeit].farben, rp = zufall(planZeit.length * 17 + art.length);
      for (var px = ix + 9; px < ix + iw - 4; px += 15) for (var py = iy + 9; py < iy + ih - 4; py += 15) {
        var c = f[Math.floor(rp() * f.length)], qx = px + (rp() - .5) * 5, qy = py + (rp() - .5) * 5;
        el('circle', { cx: qx, cy: qy, r: 6.5, fill: '#4a6b3f' }, s);
        el('circle', { cx: qx, cy: qy, r: 4.2, fill: c }, s);
      }
      legende.textContent = BEPFL[planZeit].text;
    }
    // Gesteck
    if (gestecke.length || umfang === 'Nur ein Gesteck') {
      var gx = 110, gy = B.y + 22, rg = zufall(3);
      for (var w = 0; w < 18; w++) {
        var an = w / 18 * Math.PI * 2;
        el('ellipse', { cx: gx + Math.cos(an) * 13, cy: gy + Math.sin(an) * 8, rx: 6, ry: 3, transform: 'rotate(' + (an * 57.3) + ' ' + (gx + Math.cos(an) * 13) + ' ' + (gy + Math.sin(an) * 8) + ')', fill: rg() > .5 ? '#2e5a3e' : '#46744f' }, s);
      }
      el('circle', { cx: gx - 5, cy: gy - 1, r: 3.4, fill: '#b63c4c' }, s);
      el('circle', { cx: gx + 4, cy: gy + 2, r: 3, fill: '#e2a845' }, s);
      el('circle', { cx: gx + 1, cy: gy - 4, r: 2.6, fill: '#f3ece0' }, s);
    }
    // Maßstab
    var t = el('text', { x: 110, y: 294, 'text-anchor': 'middle', style: 'font:500 10px Figtree,sans-serif;fill:#6b6658' }, s);
    t.textContent = art + ' · Ansicht von oben';
    $$('.plan-zeiten button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.p === planZeit ? 'true' : 'false'); });
  }
  $$('.plan-zeiten button').forEach(function (b) {
    b.addEventListener('click', function () { planZeit = b.dataset.p; zeichnePlan(); });
  });
  // Startansicht passend zur Jahreszeit
  planZeit = { fruehling: 'Frühjahr', sommer: 'Sommer', herbst: 'Herbst', winter: 'Winter (Tannengrün)' }[jetzt];

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var tel = form.tel.value.trim(), mail = form.mail.value.trim();
    var ok = tel.replace(/\D/g, '').length >= 6 || /.+@.+\..+/.test(mail);
    $('#fehler').classList.toggle('an', !ok);
    if (!ok) { form.tel.focus(); return; }
    var z = zusammenfassen();
    z.unshift(['Anliegen', { garten: 'Garten', grab: 'Grabpflege', mit: 'Mitarbeiten' }[aktiv]]);
    z.push(['Rückweg', [tel, mail].filter(Boolean).join(' · ')]);
    if (form.name.value.trim()) z.push(['Name', form.name.value.trim()]);
    $('#danke-liste').innerHTML = z.map(function (r) { return '<b>' + r[0] + ':</b> ' + String(r[1]).replace(/</g, '&lt;'); }).join('<br>');
    form.style.display = 'none';
    $('.weichen').style.display = 'none';
    $('#danke').classList.add('an');
    $('#danke').scrollIntoView({ behavior: reduziert ? 'auto' : 'smooth', block: 'center' });
  });
  $('#neu').addEventListener('click', function () {
    form.reset(); flo.textContent = 'weiß nicht'; jro.textContent = '15 Jahre';
    $('#feld-laufzeit').hidden = true; $('#feld-bepflanzung').hidden = false;
    form.style.display = ''; $('.weichen').style.display = ''; $('#danke').classList.remove('an');
    setzeWeiche(aktiv);
  });
  setzeWeiche('garten');

  /* ---------- ruhiges Einblenden ---------- */
  if ('IntersectionObserver' in window && !reduziert) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('da'); io.unobserve(e.target); } });
    }, { threshold: .15 });
    $$('.auf').forEach(function (x) { io.observe(x); });
  } else {
    $$('.auf').forEach(function (x) { x.classList.add('da'); });
  }
})();
