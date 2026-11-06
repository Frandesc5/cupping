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
  if (ok && !S.dn[S.i]) {
    S.dn[S.i] = 1; toast('✓ Estación completa');
    n.querySelector('.b.p').classList.add('rdy');
    try { navigator.vibrate && navigator.vibrate([12, 40, 12]) } catch (e) {}
  }
}

function stationView() {
  const c = SC[S.i];
  return `${strip()}<div class="gd">${c.g}</div><div class="k">Estación ${S.i + 1} de ${SC.length}</div><h2>${c.t}</h2>${c.r()}<nav class="station-nav" id="station-nav" aria-label="Navegación entre estaciones"></nav>${relatedPanel(S.i)}`;
}

function completeView() {
  return `<div class="k">Camino completado</div><h2>De la cereza a la taza</h2>${finHTML()}<p>Recorriste las seis estaciones:</p>${SC.map(c => `<p>✓ ${c.t}</p>`).join('')}<p class="m">Volvé a cualquier estación desde el mapa.</p>${strip()}<div class="bar"><button class="b" data-a="go" data-v="0">Repetir desde el inicio</button></div>`;
}

/* Al entrar a una estación (desde un enlace, el menú o la dirección). */
function enterStation(i) {
  S.i = i;
  if (i > P.max) { P.max = i; sv() }
  if (SC[i]) S.dn[i] = SC[i].ok() ? 1 : 0;
}
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

/* ---------- Menú de módulos ---------- */
function academyMenu(){
const groups=[
['01 / DEL ORIGEN AL GRANO VERDE',[
[0,'La planta y el fruto','Botánica, anatomía de la cereza y especies.',1],
[1,'Poscosecha','Lavado, natural, honey y fermentaciones.',1],
[2,'Café verde','Estructura, composición, defectos y calidad.',1],
[6,'Cultivo y territorio','Altitud, clima, suelo y prácticas agrícolas.',0],
[7,'Cosecha y selección','Madurez, recolección y clasificación del fruto.',0]]],
['02 / TRANSFORMACIÓN',[
[3,'Tueste','Etapas, transferencia de calor y desarrollo.',1],
[8,'Curvas de tueste','Lectura de perfiles, energía y desarrollo.',0],
[9,'Control de calidad','Muestras, catación y consistencia de lotes.',0]]],
['03 / DE LA MOLIENDA A LA TAZA',[
[4,'Preparación','Variables, ratio y extracción.',1],
[10,'Espresso','Máquina, receta, calibración y servicio.',0],
[11,'Filtrados','V60, Origami, AeroPress y otros métodos.',0],
[12,'Agua y molienda','Minerales, dureza, alcalinidad y granulometría.',0],
[5,'Sensorial','Atributos, descriptores y percepción.',1],
[13,'Análisis sensorial','Cata, protocolos y evaluación de café.',0]]]
];
let html='<div class="academy-menu"><div class="academy-menu-head"><div class="eyebrow">01 / ACADEMIA · MAPA DE APRENDIZAJE</div><h2>Explorá los módulos.</h2><p class="m">Un recorrido para comprender el café desde su origen hasta la experiencia en taza. Elegí un módulo para entrar; el contenido se puede ampliar progresivamente.</p></div>';
groups.forEach(group=>{
html+='<section class="academy-group"><h3>'+group[0]+'</h3><div class="academy-grid">';
group[1].forEach(it=>{
const active=!!it[3];
html+='<button class="academy-module '+(active?'active':'')+'" '+(active?'data-a="go" data-v="'+it[0]+'"':'disabled')+'><span class="mod-no">MÓDULO '+String(it[0]+1).padStart(2,'0')+'</span><span><strong>'+it[1]+'</strong><small>'+it[2]+'</small></span><span class="mod-foot">'+(active?'EXPLORAR ↗':'PRÓXIMAMENTE')+'</span></button>';
});
html+='</div></section>';
});
html+=`<section class="academy-resources"><div class="resource-head"><div class="eyebrow">HERRAMIENTAS DE ESTUDIO</div><h2>Consultá y profundizá.</h2><p class="m">Dos espacios complementarios para acompañar tu recorrido.</p></div><div class="academy-grid"><button class="academy-module active" data-a="glossary"><span class="mod-no">CONSULTA RÁPIDA</span><span><strong>Glosario cafetero</strong><small>Definiciones y vocabulario técnico, con buscador.</small></span><span class="mod-foot">ABRIR ↗</span></button><button class="academy-module active" data-a="theory"><span class="mod-no">BIBLIOTECA</span><span><strong>Apuntes y profundizaciones</strong><small>Lecturas para ir más allá de cada módulo.</small></span><span class="mod-foot">LEER ↗</span></button></div></section>`;
return html+'</div>';
}

function finHTML(){return `<div style='display:flex;justify-content:center;margin:10px 0'><svg viewBox='0 0 100 100' width='140' height='140' aria-hidden='true'><g fill='none' stroke='var(--sage)' stroke-width='6' transform='rotate(-90 50 50)'>${[0,1,2,3,4,5].map(i=>`<circle cx='50' cy='50' r='40' stroke-dasharray='38 213.3' stroke-dashoffset='${-i*41.9}' style='animation:up .6s ${i*.12}s both'/>`).join('')}</g><text x='50' y='56' text-anchor='middle' fill='var(--ink)' font-size='20' font-family='Oswald,sans-serif'>6/6</text></svg></div><div style='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px'>${[[S.seen.length+'/5','Estructuras del fruto'],[S.pv.length,'Etapas de poscosecha vistas'],[S.sy.length,'Defectos retirados'],[S.t4v.length+'/4','Pestañas de tueste recorridas']].map(x=>`<div class=stat><b>${x[0]}</b><span class=m style='font-size:.8rem'>${x[1]}</span></div>`).join('')}</div>`}
