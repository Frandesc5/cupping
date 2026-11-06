/* ============================================================
   Academia · recorrido de 6 estaciones
   Define las estaciones, la tira de progreso, la navegación entre
   estaciones, el menú de módulos y la pantalla de recorrido completo.
   ============================================================ */

/* Cada estación: n (nombre corto), slug (dirección), t (título), g (consigna),
   ok() (condición para darla por completa), r() (contenido), after() (dibujos que
   se actualizan después de insertar el HTML). */
const SC = [
  { n: 'Fruto', slug: 'fruto', t: 'La planta y el fruto', g: 'Recorré las cuatro pestañas; la última tiene un desafío.',
    ok: () => S.t1v.length >= 4 && S.seen.length >= 5 && S.qa.c != null, r: t1, after: frutoAfter },
  { n: 'Poscosecha', slug: 'poscosecha', t: 'Del fruto al café seco', g: 'Explorá los tres apartados: procesos, fermentaciones y métodos de secado.',
    ok: () => S.postTabsSeen.length >= 3 && S.pv.length >= 3 && S.qa.p != null && S.qa.d != null, r: post },
  { n: 'Verde', slug: 'cafe-verde', t: 'El café verde', g: 'Recorré las cuatro pestañas y limpiá la bandeja.',
    ok: () => S.t3v.length >= 4 && GB2.every((t, i) => t < 1 || t >= 14 || S.sy.includes(i)), r: t3, after: verdeAfter },
  { n: 'Tueste', slug: 'tueste', t: 'El tueste', g: 'Recorré las cuatro pestañas y respondé el desafío.',
    ok: () => S.t4v.length >= 4 && S.qa.r != null, r: t4, after: tuesteAfter },
  { n: 'Preparación', slug: 'preparacion', t: 'La preparación', g: 'Recorré las cuatro pestañas y lográ el desafío del ratio (filtrado o espresso).',
    ok: () => S.t5v.length >= 4 && !!(S.hitV60 || S.hitEsp), r: prepStation, after: prepAfter },
  { n: 'Sensorial', slug: 'sensorial', t: 'La experiencia sensorial', g: 'Recorré las cuatro pestañas y respondé el desafío.',
    ok: () => S.t6v.length >= 4 && S.qa.s != null, r: sensStation, after: sensAfter }
];

/* Tira de estaciones: ✓ en las completas; las que todavía no se alcanzaron quedan bloqueadas. */
function strip() {
  return `<nav class="strip" aria-label="Estaciones del recorrido">${SC.map((c, i) => `<button class="${SC[i].ok() ? 'd' : ''} ${i == S.i ? 'c' : ''}" ${i == S.i ? 'aria-current="step"' : ''} ${i > P.max ? 'disabled' : ''} data-a="go" data-v="${i}">${c.n}</button>`).join('')}</nav>`;
}

/* Botones Anterior / Continuar al final de cada estación.
   Se vuelve a llamar cada vez que algo puede completar la estación. */
function bar() {
  const n = $('#station-nav');
  if (!n || S.sp !== 'ac' || S.i < 0 || S.i >= SC.length) return;
  const ok = SC[S.i].ok(), prev = SC[S.i - 1], next = SC[S.i + 1];
  n.innerHTML = `${prev ? `<button class="b" data-a="go" data-v="${S.i - 1}">← ${prev.n}</button>` : '<span></span>'}<button class="b p" data-a="cont" ${ok ? '' : 'disabled'}>${ok ? (next ? 'Continuar: ' + next.n + ' →' : 'Terminar el recorrido →') : 'Completá la estación para continuar'}</button>`;
  const tab = document.querySelectorAll('.strip button')[S.i];
  if (tab) tab.classList.toggle('d', ok);
  if (ok && !doneSt(S.i)) { P.done = (P.done || []).concat(S.i); sv() }
  if (ok && !S.dn[S.i]) {
    S.dn[S.i] = 1; toast('✓ Estación completa');
    n.querySelector('.b.p').classList.add('rdy');
    try { navigator.vibrate && navigator.vibrate([12, 40, 12]) } catch (e) {}
  }
}

function stationView() {
  const c = SC[S.i], locked = SC.length - 1 > P.max;
  return `${strip()}${locked ? '<p class="strip-hint">Las estaciones en gris se habilitan a medida que avanzás. También podés abrirlas desde el <a href="#/academia">mapa de módulos</a>.</p>' : ''}<div class="gd">${c.g}</div><div class="k">Estación ${S.i + 1} de ${SC.length}</div><h2>${c.t}</h2>${c.r()}<nav class="station-nav" id="station-nav" aria-label="Navegación entre estaciones"></nav>${relatedPanel(S.i)}`;
}

function completeView() {
  return `<div class="k">Camino completado</div><h2>De la cereza a la taza</h2>${finHTML()}<p>Recorriste las seis estaciones:</p>${SC.map(c => `<p>✓ ${c.t}</p>`).join('')}<p class="m">Volvé a cualquier estación desde el mapa.</p>${strip()}<div class="bar"><button class="b" data-a="go" data-v="0">Repetir desde el inicio</button></div>`;
}

/* Al entrar a una estación (desde un enlace, el menú o la dirección). */
function enterStation(i) {
  S.i = i;
  if (i > P.max) P.max = i;
  if (SC[i]) { P.last = i; P.v = [...new Set([...(P.v || []), i])] }
  sv();
  if (SC[i]) S.dn[i] = SC[i].ok() ? 1 : 0;
}
/* Progreso guardado: estaciones completas (P.done) y visitadas (P.v). */
const doneSt = i => (P.done || []).includes(i);
const startedSt = i => (P.v || []).includes(i);
const go = i => routeTo('/academia/' + (SC[i] ? SC[i].slug : 'recorrido-completo'));

function academiaView() {
  if (S.i === -2) return glossaryView();
  if (S.i === -3) return theoryView();
  if (S.i < 0) return academyMenu();
  if (S.i >= SC.length) return completeView();
  return stationView();
}
function academiaAfter() {
  if (S.i === -2) return glossaryAfter();
  if (S.i === -3) return theoryAfter();
  if (S.i < 0 || S.i >= SC.length) return;
  S.pl = 0;
  const c = SC[S.i]; if (c.after) c.after();
  bar();
}

on({
  go: v => go(+v),
  cont: () => go(S.i + 1),
  academyMenu: () => routeTo('/academia')
});

/* ---------- Menú de módulos ----------
   Primero los módulos disponibles, en el orden del recorrido y con su estado;
   los que están en preparación quedan plegados al final. */
const MENU_INFO = [
  ['La planta y el fruto', 'Botánica, anatomía de la cereza y especies.'],
  ['Poscosecha', 'Lavado, natural, honey y fermentaciones.'],
  ['Café verde', 'Estructura, composición, defectos y calidad.'],
  ['Tueste', 'Etapas, transferencia de calor y desarrollo.'],
  ['Preparación', 'Variables, ratio y extracción.'],
  ['Sensorial', 'Atributos, descriptores y percepción.']
];
const SOON = [
  ['Del origen al grano verde', [['Cultivo y territorio', 'Altitud, clima, suelo y prácticas agrícolas.'], ['Cosecha y selección', 'Madurez, recolección y clasificación del fruto.']]],
  ['Transformación', [['Curvas de tueste', 'Lectura de perfiles, energía y desarrollo.'], ['Control de calidad', 'Muestras, catación y consistencia de lotes.']]],
  ['De la molienda a la taza', [['Espresso', 'Máquina, receta, calibración y servicio.'], ['Filtrados', 'V60, Origami, AeroPress y otros métodos.'], ['Agua y molienda', 'Minerales, dureza, alcalinidad y granulometría.'], ['Análisis sensorial', 'Cata, protocolos y evaluación de café.']]]
];
function moduleState(i) {
  if (doneSt(i)) return ['done', '✓ Completado'];
  if (startedSt(i)) return ['started', 'En curso · seguir →'];
  return ['new', 'Empezar →'];
}
function academyMenu() {
  const done = SC.filter((_, i) => doneSt(i)).length, soonCount = SOON.reduce((n, g) => n + g[1].length, 0);
  return `<div class="academy-menu">
  <div class="academy-menu-head"><div class="eyebrow">Academia · mapa de aprendizaje</div><h2>Explorá los módulos.</h2><p class="m">Un recorrido para comprender el café desde su origen hasta la taza. Te recomendamos seguirlo en orden, pero podés entrar a cualquier módulo.</p>
    <div class="menu-progress"><div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${SC.length}" aria-valuenow="${done}" aria-label="Módulos completos"><i style="width:${Math.round(done / SC.length * 100)}%"></i></div><span>${done} de ${SC.length} módulos completos</span></div></div>
  <section class="academy-group"><h3>Recorrido disponible</h3><div class="academy-grid">${SC.map((c, i) => {
    const [st, label] = moduleState(i);
    return `<button class="academy-module active is-${st}" data-a="go" data-v="${i}"><span class="mod-no">Módulo ${String(i + 1).padStart(2, '0')}</span><span><strong>${MENU_INFO[i][0]}</strong><small>${MENU_INFO[i][1]}</small></span><span class="mod-foot">${label}</span></button>`;
  }).join('')}</div></section>
  <details class="academy-soon"><summary>Próximamente · ${soonCount} módulos en preparación</summary>${SOON.map(g => `<h4>${g[0]}</h4><ul>${g[1].map(m => `<li><b>${m[0]}</b> <span class="m">${m[1]}</span></li>`).join('')}</ul>`).join('')}</details>
  <section class="academy-resources"><div class="resource-head"><div class="eyebrow">Herramientas de estudio</div><h2>Consultá y profundizá.</h2><p class="m">Dos espacios complementarios para acompañar tu recorrido.</p></div><div class="academy-grid"><button class="academy-module active" data-a="glossary"><span class="mod-no">Consulta rápida</span><span><strong>Glosario cafetero</strong><small>Definiciones y vocabulario técnico, con buscador.</small></span><span class="mod-foot">Abrir →</span></button><button class="academy-module active" data-a="theory"><span class="mod-no">Biblioteca</span><span><strong>Apuntes y profundizaciones</strong><small>Lecturas para ir más allá de cada módulo.</small></span><span class="mod-foot">Leer →</span></button></div></section>
</div>`;
}

function finHTML(){return `<div style='display:flex;justify-content:center;margin:10px 0'><svg viewBox='0 0 100 100' width='140' height='140' aria-hidden='true'><g fill='none' stroke='var(--sage)' stroke-width='6' transform='rotate(-90 50 50)'>${[0,1,2,3,4,5].map(i=>`<circle cx='50' cy='50' r='40' stroke-dasharray='38 213.3' stroke-dashoffset='${-i*41.9}' style='animation:up .6s ${i*.12}s both'/>`).join('')}</g><text x='50' y='56' text-anchor='middle' fill='var(--ink)' font-size='20' font-family='Oswald,sans-serif'>6/6</text></svg></div><div style='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px'>${[[S.seen.length+'/5','Estructuras del fruto'],[S.pv.length,'Etapas de poscosecha vistas'],[S.sy.length,'Defectos retirados'],[S.t4v.length+'/4','Pestañas de tueste recorridas']].map(x=>`<div class=stat><b>${x[0]}</b><span class=m style='font-size:.8rem'>${x[1]}</span></div>`).join('')}</div>`}
