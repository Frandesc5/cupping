/* ============================================================
   Academia · recorrido guiado de 6 estaciones
   Cada estación se recorre por pasos numerados. En cada paso se ve
   qué hay que hacer y qué falta; al final siempre hay un próximo paso
   claro, así nadie se pierde ni queda trabado.
   ============================================================ */

/* Cada estación:
   n nombre corto · slug dirección · mt/md título y descripción en el menú
   t título · goal objetivo de la estación
   tab clave de S con el paso actual · vis clave de S con los pasos abiertos
   after() dibujos que se actualizan después de insertar el HTML
   steps: k clave interna · slug dirección · label nombre · task qué hacer · view() contenido
          need() tareas del paso: true si está hecha o el texto de lo que falta */
const SC = [
  { n: 'Fruto', slug: 'fruto', mt: 'La planta y el fruto', md: 'Botánica, anatomía de la cereza y especies.', t: 'La planta y el fruto',
    goal: 'Conocé de dónde viene el café: las especies, cómo influyen la altitud y la madurez, y qué capas tiene el fruto.',
    tab: 't1', vis: 't1v', after: frutoAfter,
    steps: [
      { k: 'sp', slug: 'especies', label: 'Especies', view: sp1, task: 'Compará Coffea arabica y Coffea canephora: tocá cada especie y leé en qué se diferencian.' },
      { k: 'al', slug: 'altitud', label: 'Altitud', view: alt1, task: 'Mové la altitud y mirá cómo cambian la temperatura y la maduración del fruto.' },
      { k: 'ma', slug: 'madurez', label: 'Madurez', view: mad1, task: 'Deslizá la maduración y observá cómo cambian el color y los azúcares del fruto.' },
      { k: 'an', slug: 'anatomia', label: 'Anatomía', view: cherry, task: 'Separá las capas de la cereza y tocá cada una. Después respondé el desafío.',
        need: () => [S.seen.length >= 5 || `Tocá las 5 capas del fruto (${S.seen.length} de 5).`, S.qa.c != null || 'Respondé el desafío del final.'] }
    ] },
  { n: 'Poscosecha', slug: 'poscosecha', mt: 'Poscosecha', md: 'Lavado, natural, honey y fermentaciones.', t: 'Del fruto al café seco',
    goal: 'Seguí el camino del fruto hasta el café seco: las rutas de proceso, las fermentaciones y los métodos de secado.',
    tab: 'postTab', vis: 'postTabsSeen',
    steps: [
      { k: 'process', slug: 'procesos', label: 'Procesos', view: postProcessView, task: 'Elegí una ruta (lavado, natural o honey) y tocá sus etapas para ver qué capas pierde el grano. Después respondé el desafío.',
        need: () => [S.pv.length >= 3 || `Tocá 3 etapas de una ruta (${Math.min(S.pv.length, 3)} de 3).`, S.qa.p != null || 'Respondé el desafío del final.'] },
      { k: 'fermentation', slug: 'fermentaciones', label: 'Fermentaciones', view: postFermentationView, task: 'Recorré las modalidades de fermentación y compará qué cambia en cada una.' },
      { k: 'drying', slug: 'secado', label: 'Secado', view: postDryingView, task: 'Conocé los métodos de secado y respondé el desafío del final.',
        need: () => [S.qa.d != null || 'Respondé el desafío del final.'] }
    ] },
  { n: 'Verde', slug: 'cafe-verde', mt: 'Café verde', md: 'Estructura, composición, defectos y calidad.', t: 'El café verde',
    goal: 'Aprendé a evaluar un lote de café verde: defectos, clasificación, humedad, densidad y trazabilidad.',
    tab: 't3', vis: 't3v', after: verdeAfter,
    steps: [
      { k: 'de', slug: 'defectos', label: 'Defectos', view: green3, task: 'Sos el seleccionador: sacá de la bandeja todos los granos con defectos.',
        need: () => { const left = GB2.filter((t, i) => t > 0 && t < 14 && !S.sy.includes(i)).length; return [left === 0 || `Sacá los granos con defectos (quedan ${left}).`] } },
      { k: 'cl', slug: 'clasificar', label: 'Clasificar', view: clas, task: 'Cargá los defectos de una muestra y mirá si cumple el criterio de especialidad.' },
      { k: 'hd', slug: 'humedad-y-densidad', label: 'Humedad y densidad', view: hum, task: 'Mové los valores y mirá qué rangos de humedad y densidad son habituales.' },
      { k: 'tz', slug: 'tamano-y-origen', label: 'Tamaño y origen', view: tam, task: 'Mirá cómo se mide el tamaño del grano y recorré el camino de un lote.' }
    ] },
  { n: 'Tueste', slug: 'tueste', mt: 'Tueste', md: 'Etapas, transferencia de calor y desarrollo.', t: 'El tueste',
    goal: 'Entendé qué le pasa al grano en el tostador: la curva, sus fases, los grados de tueste y las fallas más comunes.',
    tab: 't4', vis: 't4v', after: tuesteAfter,
    steps: [
      { k: 'cu', slug: 'curva', label: 'Curva', view: cur, task: 'Mové el tiempo y la descarga y mirá cómo cambian la temperatura, el RoR y el grano.' },
      { k: 'fs', slug: 'fases', label: 'Fases', view: fas, task: 'Tocá cada fase e hito del tueste. Después respondé el desafío.',
        need: () => [S.qa.r != null || 'Respondé el desafío del final.'] },
      { k: 'gr', slug: 'grados', label: 'Grados', view: gra, task: 'Compará los grados de tueste claro, medio y oscuro.' },
      { k: 'fa', slug: 'fallas', label: 'Fallas', view: fal, task: 'Recorré las fallas de tueste y cómo se ven en la curva y en el grano.' }
    ] },
  { n: 'Preparación', slug: 'preparacion', mt: 'Preparación', md: 'Variables, ratio y extracción.', t: 'La preparación',
    goal: 'Armá una receta y entendé las variables que cambian la taza: el ratio, el agua, la molienda y la medición.',
    tab: 't5', vis: 't5v', after: prepAfter,
    steps: [
      { k: 're', slug: 'receta', label: 'Receta', view: prepRecipe, task: 'Ajustá la receta hasta lograr el desafío: ratio 1:16 en filtrado, o 1:2 en 25 a 35 s en espresso.',
        need: () => [!!(S.hitV60 || S.hitEsp) || 'Lográ el desafío del ratio. Pista: 15 g de café con 240 g de agua dan 1:16.'] },
      { k: 'ag', slug: 'agua', label: 'Agua', view: agua, task: 'Mové la dureza y la alcalinidad y mirá cuándo quedan en el rango de referencia.' },
      { k: 'mo', slug: 'molienda', label: 'Molienda', view: mol, task: 'Mové el punto de molienda y mirá cómo cambia el tamaño de las partículas.' },
      { k: 'me', slug: 'medir', label: 'Medir', view: med, task: 'Cargá un TDS medido y mirá si la extracción queda en rango.' }
    ] },
  { n: 'Sensorial', slug: 'sensorial', mt: 'Sensorial', md: 'Atributos, descriptores y percepción.', t: 'La experiencia sensorial',
    goal: 'Aprendé a describir lo que percibís: el perfil de un café, la rueda de sabores, la cata y los sesgos.',
    tab: 't6', vis: 't6v', after: sensAfter,
    steps: [
      { k: 'pf', slug: 'perfil', label: 'Perfil', view: sens3, task: 'Elegí un caso, probalo en el radar y respondé el desafío del final.',
        need: () => [S.qa.s != null || 'Respondé el desafío del final.'] },
      { k: 'ru', slug: 'rueda', label: 'Rueda', view: rue, task: 'Explorá la rueda de sabores desde el centro hacia el borde.' },
      { k: 'ca', slug: 'cata', label: 'Cata', view: cat, task: 'Seguí las etapas de una cata y probá el cronómetro.' },
      { k: 'sb', slug: 'sesgos', label: 'Sesgos', view: ses, task: 'Leé qué puede cambiar lo que percibís al evaluar un café.' }
    ] }
];

/* ---------- Pasos ---------- */
const curStep = c => c.steps.find(s => s.k === S[c.tab]) || c.steps[0];
const stepIdx = c => c.steps.indexOf(curStep(c));
const stepOpened = (c, s) => S[c.vis].includes(s.k);
/* Lo que falta para completar un paso (lista vacía = completo). */
const stepMissing = (c, s) => [...(stepOpened(c, s) ? [] : ['Abrí este paso.']), ...(s.need ? s.need().filter(x => x !== true) : [])];
const stepDone = (c, s) => stepMissing(c, s).length === 0;
SC.forEach(c => { c.ok = () => c.steps.every(s => stepDone(c, s)) });
const stepsDone = c => c.steps.filter(s => stepDone(c, s)).length;
function openStep(c, k) { S[c.tab] = k; if (!S[c.vis].includes(k)) S[c.vis].push(k) }
const stepPath = i => '/academia/' + SC[i].slug + '/' + curStep(SC[i]).slug;
/* Enlace a un paso de la estación actual: se puede abrir en otra pestaña; con un clic normal cambia de paso. */
const stepLink = (c, s, cls, text, extra = '') => `<a class="${cls}" href="#/academia/${c.slug}/${s.slug}" data-a="step" data-v="${s.k}" ${extra}>${text}</a>`;
const nextStationHref = () => '#' + (SC[S.i + 1] ? stepPath(S.i + 1) : '/academia/recorrido-completo');

/* ---------- Progreso guardado en este navegador ----------
   P.done estaciones completas · P.v visitadas · P.last última abierta.
   P.st guarda el avance dentro de cada estación (pasos, desafíos, bandeja...),
   así al volver o recargar se sigue exactamente donde se dejó.
   Versiones anteriores solo guardaban P.max: de ahí se reconstruye una vez. */
if (!Array.isArray(P.done)) {
  const m = Math.min(+P.max || 0, SC.length);
  P.done = [...Array(m).keys()];
  if (m > 0) { P.v = [...Array(Math.min(m + 1, SC.length)).keys()]; P.last = Math.min(m, SC.length - 1) }
  sv();
}
const PROGRESS_KEYS = ['t1', 't1v', 'seen', 'postTab', 'postTabsSeen', 'pv', 't3', 't3v', 'sy', 't4', 't4v', 't5', 't5v', 'hitV60', 'hitEsp', 't6', 't6v', 'qa'];
if (P.st) for (const k of PROGRESS_KEYS) if (P.st[k] != null) S[k] = P.st[k];
function saveProgress() { P.st = {}; for (const k of PROGRESS_KEYS) P.st[k] = S[k]; sv() }

const doneSt = i => P.done.includes(i);
const startedSt = i => (P.v || []).includes(i);
const doneCount = () => SC.filter((_, i) => doneSt(i)).length;
const stDone = i => doneSt(i) || SC[i].ok();

/* ---------- Tira de estaciones (el mapa del recorrido) ---------- */
function strip() {
  return `<nav class="strip" aria-label="Estaciones del recorrido">${SC.map((c, i) => `<a class="${stDone(i) ? 'd' : ''} ${i == S.i ? 'c' : ''}" href="#${stepPath(i)}" ${i == S.i ? 'aria-current="step"' : ''}>${c.n}${stDone(i) ? '<span class="sr-only"> (completa)</span>' : ''}</a>`).join('')}</nav>`;
}

/* ---------- Pasos de la estación ---------- */
function stepperHTML(c) {
  const cur = curStep(c);
  return c.steps.map((s, j) => {
    const done = stepDone(c, s), here = s === cur;
    return `<li>${stepLink(c, s, 'step-pill ' + (done ? 'is-done ' : '') + (here ? 'is-current' : ''), `<span class="step-n" aria-hidden="true">${done ? '✓' : j + 1}</span><span class="step-l">${s.label}</span><span class="sr-only">${done ? ' (completo)' : ''}</span>`, here ? 'aria-current="step"' : '')}</li>`;
  }).join('');
}
function stationProgressHTML(c) {
  const d = stepsDone(c), n = c.steps.length;
  return `<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${d}" aria-label="Pasos completos de esta estación"><i style="width:${Math.round(d / n * 100)}%"></i></div><span>${d} de ${n} pasos completos</span>`;
}

/* Pie de cada paso: qué falta y cuál es el próximo paso. Siempre hay una acción principal. */
function stepFootHTML(c) {
  const j = stepIdx(c), s = c.steps[j], miss = stepMissing(c, s), prev = c.steps[j - 1], next = c.steps[j + 1];
  const ok = c.ok(), nextSt = SC[S.i + 1], pending = c.steps.filter(x => !stepDone(c, x));
  const status = miss.length
    ? `<div class="step-status is-pending"><b>Para completar este paso:</b><ul>${miss.map(m => `<li>${m}</li>`).join('')}</ul></div>`
    : `<div class="step-status is-done"><b>✓ Paso completo.</b>${ok ? ' Completaste toda la estación.' : next ? ' Cuando termines de explorar, seguí con el próximo paso.' : ''}</div>`;
  const back = prev ? stepLink(c, prev, 'b', '← ' + prev.label) : '<span></span>';
  /* Acción principal: avanzar de paso; en el último, pasar a la próxima estación.
     Si el último paso está a medias, no se saca a la persona de ahí: la tarea es completarlo. */
  const others = pending.filter(x => x !== s);
  let main = '';
  if (next) main = stepLink(c, next, 'b p', `Siguiente paso: ${next.label} →`);
  else if (ok) main = `<a class="b p" href="${nextStationHref()}">${nextSt ? `Continuar a la estación ${S.i + 2}: ${nextSt.n} →` : 'Terminar el recorrido →'}</a>`;
  else if (!miss.length) main = stepLink(c, others[0], 'b p', `Completar lo que falta: ${others[0].label} →`);
  const stationNote = ok && next
    ? `<p class="station-done-note">✓ Ya completaste la estación. <a class="link-btn" href="${nextStationHref()}">${nextSt ? `Continuar a ${nextSt.n} →` : 'Terminar el recorrido →'}</a></p>`
    : !next && !ok && others.length ? `<p class="station-done-note is-pending">${miss.length ? 'Además, para completar la estación' : 'Para completar la estación'} te falta: ${others.map(x => stepLink(c, x, 'link-btn', x.label)).join(', ')}.</p>` : '';
  return `${status}<div class="step-actions">${back}${main}</div>${stationNote}`;
}

/* Se vuelve a llamar cada vez que algo puede completar un paso (deslizadores,
   desafíos, bandeja...). Actualiza pasos, progreso y pie sin redibujar el contenido. */
function bar() {
  if (S.sp !== 'ac' || S.i < 0 || S.i >= SC.length) return;
  const c = SC[S.i], ok = c.ok();
  /* Solo se reescribe lo que cambió: así el lector de pantalla no repite el aviso con cada movimiento. */
  const put = (el, html) => { if (el && el._h !== html) { el.innerHTML = html; el._h = html } };
  const st = $('#stepper'), pr = $('#station-progress'), ft = $('#step-foot');
  put(st, stepperHTML(c)); put(pr, stationProgressHTML(c)); put(ft, stepFootHTML(c));
  const tab = document.querySelectorAll('.strip button')[S.i];
  if (tab) tab.classList.toggle('d', ok || doneSt(S.i));
  if (ok && !doneSt(S.i)) { P.done = (P.done || []).concat(S.i) }
  saveProgress();
  if (ok && !S.dn[S.i]) {
    S.dn[S.i] = 1; toast('✓ Estación completa');
    const b = ft && ft.querySelector('.b.p'); if (b) b.classList.add('rdy');
    try { navigator.vibrate && navigator.vibrate([12, 40, 12]) } catch (e) {}
  }
}

function stationView() {
  const c = SC[S.i], s = curStep(c), j = stepIdx(c);
  openStep(c, s.k);
  return `${strip()}
  <header class="station-head"><div class="k">Estación ${S.i + 1} de ${SC.length}</div><h2>${c.t}</h2><p class="station-goal">${c.goal}</p><div class="station-progress" id="station-progress">${stationProgressHTML(c)}</div></header>
  <ol class="stepper" id="stepper" aria-label="Pasos de esta estación">${stepperHTML(c)}</ol>
  <section class="step" aria-labelledby="step-title">
    <div class="step-head"><div class="k">Paso ${j + 1} de ${c.steps.length}</div><h3 id="step-title" tabindex="-1">${s.label}</h3><p class="step-task"><b>Qué hacer:</b> ${s.task}</p></div>
    <div class="step-body">${s.view()}</div>
    <div class="step-foot" id="step-foot" aria-live="polite">${stepFootHTML(c)}</div>
  </section>
  ${relatedPanel(S.i)}`;
}

/* Cambiar de paso: la dirección refleja el paso (sin sumar entradas al historial),
   la vista sube al comienzo de los pasos y el foco va al título del paso. */
function goStep(k) {
  const c = SC[S.i];
  if (!c.steps.some(s => s.k === k)) return;
  openStep(c, k);
  R(0);
  const st = $('#stepper');
  if (st && st.getBoundingClientRect().top < 0 || st && st.getBoundingClientRect().top > window.innerHeight * .4) st.scrollIntoView({ block: 'start' });
  const h = $('#step-title'); if (h) try { h.focus({ preventScroll: true }) } catch (e) { h.focus() }
}

function completeView() {
  return `<div class="k">Camino completado</div><h2>De la cereza a la taza</h2>${finHTML()}<p>Recorriste las seis estaciones:</p>${SC.map(c => `<p>✓ ${c.t}</p>`).join('')}<p class="m">Podés volver a cualquier estación desde el mapa, o poner a prueba lo que aprendiste.</p>${strip()}<div class="bar"><a class="b p" href="#/desafios">Ir a Desafíos →</a><button class="b" data-a="go" data-v="0">Repetir desde la estación 1</button></div>`;
}

/* Al entrar a una estación (desde un enlace, el menú o la dirección). */
function enterStation(i, stepSlug) {
  S.i = i;
  if (i > P.max) P.max = i;
  const c = SC[i];
  if (c) {
    const s = stepSlug && c.steps.find(x => x.slug === stepSlug);
    openStep(c, s ? s.k : curStep(c).k);
    P.last = i; P.v = [...new Set([...(P.v || []), i])];
    S.dn[i] = c.ok() ? 1 : 0;
  }
  sv();
}
const go = i => routeTo(SC[i] ? stepPath(i) : '/academia/recorrido-completo');

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
  /* La dirección siempre muestra el paso actual: #/academia/<estación>/<paso>. */
  const p = stepPath(S.i);
  if (hashPath() !== p) { try { history.replaceState(history.state, '', '#' + p) } catch (e) {} shownPath = p }
}

on({
  go: v => go(+v),
  cont: () => go(S.i + 1),
  step: v => goStep(v),
  academyMenu: () => routeTo('/academia')
});

/* ---------- Menú de módulos ----------
   Arriba, el próximo paso sugerido; después los módulos en orden y con su estado;
   los que están en preparación quedan plegados al final. */
const SOON = [
  ['Del origen al grano verde', [['Cultivo y territorio', 'Altitud, clima, suelo y prácticas agrícolas.'], ['Cosecha y selección', 'Madurez, recolección y clasificación del fruto.']]],
  ['Transformación', [['Curvas de tueste', 'Lectura de perfiles, energía y desarrollo.'], ['Control de calidad', 'Muestras, catación y consistencia de lotes.']]],
  ['De la molienda a la taza', [['Espresso', 'Máquina, receta, calibración y servicio.'], ['Filtrados', 'V60, Origami, AeroPress y otros métodos.'], ['Agua y molienda', 'Minerales, dureza, alcalinidad y granulometría.'], ['Análisis sensorial', 'Cata, protocolos y evaluación de café.']]]
];
function moduleState(i) {
  if (stDone(i)) return ['done', '✓ Completado · repasar'];
  if (startedSt(i)) return ['started', `En curso · ${stepsDone(SC[i])} de ${SC[i].steps.length} pasos →`];
  return ['new', 'Empezar →'];
}
/* Próxima estación sugerida: la última abierta si no está completa; si no, la primera pendiente. */
function suggestedStation() {
  if (P.last != null && !stDone(P.last)) return P.last;
  const i = SC.findIndex((_, j) => !stDone(j));
  return i;
}
function resumeCard() {
  const i = suggestedStation();
  if (i < 0) return `<section class="resume-card is-done"><div><div class="k">Recorrido completo</div><h3>Completaste las ${SC.length} estaciones</h3><p class="m">Repasá cualquier módulo o poné a prueba lo que aprendiste en Desafíos.</p></div><a class="b p" href="#/desafios">Ir a Desafíos →</a></section>`;
  const c = SC[i], s = curStep(c), started = startedSt(i);
  return `<section class="resume-card"><div><div class="k">${started ? 'Seguí donde lo dejaste' : i === 0 ? 'Empezá por acá' : 'Tu próxima estación'}</div><h3>Estación ${i + 1} · ${c.t}</h3><p class="m">${started ? `Paso ${stepIdx(c) + 1} de ${c.steps.length}: ${s.label} · ${stepsDone(c)} de ${c.steps.length} pasos completos.` : c.goal}</p></div><a class="b p" href="#${stepPath(i)}">${started ? 'Continuar →' : 'Empezar →'}</a></section>`;
}
function academyMenu() {
  const done = SC.filter((_, i) => stDone(i)).length, soonCount = SOON.reduce((n, g) => n + g[1].length, 0), next = suggestedStation();
  return `<div class="academy-menu">
  <div class="academy-menu-head"><div class="eyebrow">Academia · mapa de aprendizaje</div><h2>Explorá los módulos.</h2><p class="m">Un recorrido de ${SC.length} estaciones para comprender el café desde su origen hasta la taza. Cada estación se hace por pasos y tu avance se guarda en este dispositivo.</p>
    <div class="menu-progress"><div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${SC.length}" aria-valuenow="${done}" aria-label="Estaciones completas"><i style="width:${Math.round(done / SC.length * 100)}%"></i></div><span>${done} de ${SC.length} estaciones completas</span></div></div>
  ${resumeCard()}
  <section class="academy-group"><h3>El recorrido, en orden</h3><ol class="academy-grid academy-path">${SC.map((c, i) => {
    const [st, label] = moduleState(i);
    return `<li><a class="academy-module active is-${st} ${i === next ? 'is-next' : ''}" href="#${stepPath(i)}"><span class="mod-no">Estación ${i + 1}${i === next ? ' · sugerida' : ''}</span><span><strong>${c.mt}</strong><small>${c.md}</small></span><span class="mod-foot">${label}</span></a></li>`;
  }).join('')}</ol></section>
  <details class="academy-soon"><summary>Próximamente · ${soonCount} módulos en preparación</summary>${SOON.map(g => `<h4>${g[0]}</h4><ul>${g[1].map(m => `<li><b>${m[0]}</b> <span class="m">${m[1]}</span></li>`).join('')}</ul>`).join('')}</details>
  <section class="academy-resources"><div class="resource-head"><div class="eyebrow">Herramientas de estudio</div><h2>Consultá y profundizá.</h2><p class="m">Dos espacios complementarios para acompañar tu recorrido.</p></div><div class="academy-grid"><button class="academy-module active" data-a="glossary"><span class="mod-no">Consulta rápida</span><span><strong>Glosario cafetero</strong><small>Definiciones y vocabulario técnico, con buscador.</small></span><span class="mod-foot">Abrir →</span></button><button class="academy-module active" data-a="theory"><span class="mod-no">Biblioteca</span><span><strong>Apuntes y profundizaciones</strong><small>Lecturas para ir más allá de cada módulo.</small></span><span class="mod-foot">Leer →</span></button></div></section>
</div>`;
}

function finHTML(){return `<div style='display:flex;justify-content:center;margin:10px 0'><svg viewBox='0 0 100 100' width='140' height='140' aria-hidden='true'><g fill='none' stroke='var(--sage)' stroke-width='6' transform='rotate(-90 50 50)'>${[0,1,2,3,4,5].map(i=>`<circle cx='50' cy='50' r='40' stroke-dasharray='38 213.3' stroke-dashoffset='${-i*41.9}' style='animation:up .6s ${i*.12}s both'/>`).join('')}</g><text x='50' y='56' text-anchor='middle' fill='var(--ink)' font-size='20' font-family='Oswald,sans-serif'>6/6</text></svg></div><div style='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px'>${[[S.seen.length+'/5','Estructuras del fruto'],[S.pv.length,'Etapas de poscosecha vistas'],[S.sy.length,'Defectos retirados'],[S.t4v.length+'/4','Pasos de tueste recorridos']].map(x=>`<div class=stat><b>${x[0]}</b><span class=m style='font-size:.8rem'>${x[1]}</span></div>`).join('')}</div>`}
