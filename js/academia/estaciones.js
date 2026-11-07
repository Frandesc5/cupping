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
   steps: k clave interna · slug dirección · label nombre · view() contenido (la consigna va adentro, con doIt())
          need() tareas del paso: true si está hecha o el texto de lo que falta */
/* Lo que falta mientras el desafío del paso no se respondió. */
const QUIZ_MISS = 'Falta el desafío: se abre con el botón de abajo.', QUIZ_LATER = 'Después vas a responder un desafío.';
const SC = [
  { n: 'Fruto', slug: 'fruto', mt: 'La planta y el fruto', md: 'Especies, altitud, madurez y las capas del fruto.', t: 'La planta y el fruto',
    goal: 'Conocé de dónde viene el café: las especies, cómo influyen la altitud y la madurez, y qué capas tiene el fruto.',
    tab: 't1', vis: 't1v', after: frutoAfter,
    steps: [
      { k: 'sp', slug: 'especies', label: 'Especies', view: sp1 },
      { k: 'al', slug: 'altitud', label: 'Altitud', view: alt1 },
      { k: 'ma', slug: 'madurez', label: 'Madurez', view: mad1 },
      { k: 'an', slug: 'anatomia', label: 'Anatomía', view: cherry,
        quiz: 'c', ready: () => S.seen.length >= 5,
        need: () => [S.seen.length >= 5 || `Tocá las 5 capas del fruto (${S.seen.length} de 5).`, S.qa.c != null || (S.seen.length >= 5 ? QUIZ_MISS : QUIZ_LATER)] }
    ] },
  { n: 'Poscosecha', slug: 'poscosecha', mt: 'Poscosecha', md: 'Cómo el fruto se convierte en grano seco: lavado, natural y honey.', t: 'Del fruto al café seco',
    goal: 'Seguí el camino del fruto hasta el café seco: las rutas de proceso, las fermentaciones y los métodos de secado.',
    tab: 'postTab', vis: 'postTabsSeen',
    steps: [
      { k: 'process', slug: 'procesos', label: 'Procesos', view: postProcessView,
        quiz: 'p', ready: () => S.pv.length >= 3,
        need: () => [S.pv.length >= 3 || `Tocá 3 etapas de una ruta (${Math.min(S.pv.length, 3)} de 3).`, S.qa.p != null || (S.pv.length >= 3 ? QUIZ_MISS : QUIZ_LATER)] },
      { k: 'fermentation', slug: 'fermentaciones', label: 'Fermentaciones', view: postFermentationView },
      { k: 'drying', slug: 'secado', label: 'Secado', view: postDryingView,
        quiz: 'd', need: () => [S.qa.d != null || QUIZ_MISS] }
    ] },
  { n: 'Verde', slug: 'cafe-verde', mt: 'Café verde', md: 'Cómo se elige un buen café verde: defectos y calidad.', t: 'El café verde',
    goal: 'Aprendé a evaluar un lote de café verde: defectos, clasificación, humedad, densidad y trazabilidad.',
    tab: 't3', vis: 't3v', after: verdeAfter,
    steps: [
      { k: 'de', slug: 'defectos', label: 'Defectos', view: green3,
        need: () => { const left = GB2.filter((t, i) => t > 0 && t < 14 && !S.sy.includes(i)).length; return [left === 0 || `Sacá los granos con defectos (quedan ${left}).`] } },
      { k: 'cl', slug: 'clasificar', label: 'Clasificar', view: clas },
      { k: 'hd', slug: 'humedad-y-densidad', label: 'Humedad y densidad', view: hum },
      { k: 'tz', slug: 'tamano-y-origen', label: 'Tamaño y origen', view: tam }
    ] },
  { n: 'Tueste', slug: 'tueste', mt: 'Tueste', md: 'Qué le pasa al grano dentro del tostador.', t: 'El tueste',
    goal: 'Entendé qué le pasa al grano en el tostador: sus fases, la curva de temperatura, los grados de tueste y las fallas más comunes.',
    tab: 't4', vis: 't4v', after: tuesteAfter,
    steps: [
      { k: 'fs', slug: 'fases', label: 'Fases', view: fas,
        quiz: 'r', need: () => [S.qa.r != null || QUIZ_MISS] },
      { k: 'cu', slug: 'curva', label: 'Curva', view: cur,
        need: () => [S.hitMedio || 'Elegí cuándo sacarlo para lograr un tueste medio.'] },
      { k: 'gr', slug: 'grados', label: 'Grados', view: gra,
        need: () => [S.gro.length >= 3 || 'Ordená los tres granos del más claro al más oscuro.'] },
      { k: 'fa', slug: 'fallas', label: 'Fallas', view: fal }
    ] },
  { n: 'Preparación', slug: 'preparacion', mt: 'Preparación', md: 'Armá una receta: ratio, agua y molienda.', t: 'La preparación',
    goal: 'Armá una receta y entendé las variables que cambian la taza: el ratio, el agua, la molienda y la medición.',
    tab: 't5', vis: 't5v', after: prepAfter,
    steps: [
      { k: 're', slug: 'receta', label: 'Receta', view: prepRecipe,
        need: () => [!!(S.hitV60 || S.hitEsp) || 'Lográ el desafío del ratio. Pista: 15 g de café con 240 g de agua dan 1:16.'] },
      { k: 'ag', slug: 'agua', label: 'Agua', view: agua },
      { k: 'mo', slug: 'molienda', label: 'Molienda', view: () => mol(true) },
      { k: 'me', slug: 'medir', label: 'Medir', view: () => med(true) }
    ] },
  { n: 'Sensorial', slug: 'sensorial', mt: 'Sensorial', md: 'Aprendé a describir lo que sentís en la taza.', t: 'La experiencia sensorial',
    goal: 'Aprendé a describir lo que percibís: el perfil de un café, la rueda de sabores, la cata y los sesgos.',
    tab: 't6', vis: 't6v', after: sensAfter,
    steps: [
      { k: 'pf', slug: 'perfil', label: 'Perfil', view: sens3,
        quiz: 's', need: () => [S.qa.s != null || QUIZ_MISS] },
      { k: 'ru', slug: 'rueda', label: 'Rueda', view: rue },
      { k: 'ca', slug: 'cata', label: 'Cata', view: cat },
      { k: 'sb', slug: 'sesgos', label: 'Sesgos', view: ses,
        need: () => { const n = Object.keys(S.sb).length; return [n >= 3 || `Respondé las 3 situaciones (${n} de 3).`] } }
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
/* Pantalla de cierre de la estación: se pasa por ahí antes de ir a la siguiente. */
const recapPath = i => '/academia/' + SC[i].slug + '/repaso';

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
const PROGRESS_KEYS = ['t1', 't1v', 'seen', 'postTab', 'postTabsSeen', 'pv', 't3', 't3v', 'sy', 't4', 't4v', 't5', 't5v', 'hitV60', 'hitEsp', 't6', 't6v', 'qa', 'gro', 'sb', 'hitMedio'];
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
/* Línea de pasos: círculos unidos por una línea. El tramo se pinta de verde cuando
   los dos pasos que une están completos; el paso actual lleva un aro marrón. */
function stepperHTML(c) {
  const cur = curStep(c);
  return c.steps.map((s, j) => {
    const done = stepDone(c, s), here = s === cur, linked = j > 0 && done && stepDone(c, c.steps[j - 1]);
    return `<li class="${linked ? 'is-linked' : ''}">${stepLink(c, s, 'step-pill ' + (done ? 'is-done ' : '') + (here ? 'is-current' : ''), `<span class="step-n" aria-hidden="true">${done ? '✓' : j + 1}</span><span class="step-l">${s.label}</span><span class="sr-only">${done ? ' (completo)' : ''}</span>`, here ? 'aria-current="step"' : '')}</li>`;
  }).join('');
}

/* ---------- Desafío del paso ----------
   Cuando lo demás del paso está hecho, el botón para avanzar abre el desafío en una ventana.
   Al responder se ve la explicación y el botón para seguir; se puede cerrar y quedarse en el paso. */
const quizDue = s => !!s.quiz && S.qa[s.quiz] == null && (!s.ready || s.ready());
function quizDlgHTML() {
  const c = SC[S.i], j = stepIdx(c), s = c.steps[j], next = c.steps[j + 1], z = QA[s.quiz], p = S.qa[s.quiz], d = p != null;
  let cont = '';
  if (d) {
    const others = c.steps.filter(x => !stepDone(c, x));
    cont = next ? stepLink(c, next, 'b p', `Siguiente paso: ${next.label}`)
      : c.ok() ? `<a class="b p" href="#${recapPath(S.i)}">Ver lo que aprendiste</a>`
      : others.length ? stepLink(c, others[0], 'b p', `Completar lo que falta: ${others[0].label}`) : '';
  }
  return `<div class="k">Desafío · ${s.label}</div><h3 id="quiz-dlg-title">${z.q}</h3><div class="quiz-dlg-opts">${z.o.map((o, i) => `<button type="button" class="opt ${d ? (i === z.a ? 'ok' : i === p ? 'no' : '') : ''}" data-a="quizAns" data-v="${i}" ${d ? 'disabled' : ''}>${o}</button>`).join('')}</div>${d ? `<p class="quiz-dlg-fb" tabindex="-1"><b>${p === z.a ? '¡Bien!' : 'No es esa.'}</b> ${z.e[p]}</p>` : ''}<div class="bar">${cont}<button type="button" class="b" data-a="quizClose">${d ? 'Quedarme en este paso' : 'Volver al paso'}</button></div>`;
}
function quizDlg() {
  let dl = $('#quiz-dlg');
  if (!dl) {
    dl = document.createElement('dialog'); dl.id = 'quiz-dlg'; dl.setAttribute('aria-labelledby', 'quiz-dlg-title');
    /* Un enlace para seguir cierra la ventana antes de cambiar de paso; tocar fuera también la cierra. */
    dl.addEventListener('click', e => { if (e.target === dl || e.target.closest('a')) dl.close() });
    document.body.append(dl);
  }
  return dl;
}

/* Pie de cada paso: qué falta y cuál es el próximo paso. Siempre hay una acción principal. */
function stepFootHTML(c) {
  const j = stepIdx(c), s = c.steps[j], miss = stepMissing(c, s), prev = c.steps[j - 1], next = c.steps[j + 1];
  const ok = c.ok(), nextSt = SC[S.i + 1], pending = c.steps.filter(x => !stepDone(c, x));
  const status = miss.length
    ? `<div class="step-status is-pending"><b>Para completar este paso:</b><ul>${miss.map(m => `<li>${m}</li>`).join('')}</ul></div>`
    : `<div class="step-status is-done"><b><span class="tick ${S.tickDone.has(footKey()) ? '' : 'pop'}" aria-hidden="true">✓</span> Paso completo.</b>${ok ? ' Completaste toda la estación.' : ''}</div>`;
  const back = prev ? stepLink(c, prev, 'b', 'Paso anterior: ' + prev.label) : '<span></span>';
  /* Acción principal: avanzar de paso; en el último, ir al cierre de la estación (y desde ahí a la próxima).
     Si el último paso está a medias, no se saca a la persona de ahí: la tarea es completarlo. */
  const others = pending.filter(x => x !== s);
  let main = '';
  if (quizDue(s)) main = `<button type="button" class="b p" data-a="quizOpen">${next ? `Siguiente paso: ${next.label}` : 'Terminar la estación'}</button>`;
  else if (next) main = stepLink(c, next, 'b p', `Siguiente paso: ${next.label}`);
  else if (ok) main = `<a class="b p" href="#${recapPath(S.i)}">Ver lo que aprendiste</a>`;
  else if (!miss.length) main = stepLink(c, others[0], 'b p', `Completar lo que falta: ${others[0].label}`);
  const stationNote = ok && next
    ? `<p class="station-done-note">✓ Ya completaste la estación. <a class="link-btn" href="#${recapPath(S.i)}">Ver lo que aprendiste y continuar</a></p>`
    : !next && !ok && others.length ? `<p class="station-done-note is-pending">${miss.length ? 'Además, para completar la estación' : 'Para completar la estación'} te falta: ${others.map(x => stepLink(c, x, 'link-btn', x.label)).join(', ')}.</p>` : '';
  return `${status}<div class="step-actions">${back}${main}</div>${stationNote}`;
}

/* Se vuelve a llamar cada vez que algo puede completar un paso (deslizadores,
   desafíos, bandeja...). Actualiza pasos, progreso y pie sin redibujar el contenido. */
/* ---------- Pie del paso: aparece cuando la persona baja ----------
   El recuadro con "Paso completo" y los botones queda oculto hasta que la persona baja a propósito
   (dedo, rueda del mouse o teclado) y llega a verlo; ahí aparece con una animación corta.
   Los movimientos automáticos de la vista (bringIntoView, cambio de paso) no lo destapan.
   Si el paso es corto y el recuadro ya se ve al abrirlo, aparece igual (no hay nada que bajar).
   Ya visto en este paso, no se vuelve a animar al redibujar. El ✓ rebota una sola vez por paso. */
const footKey = () => S.i + ':' + curStep(SC[S.i]).k;
let userScrollAt = 0;
/* El gesto de bajar también cuenta aunque la página ya no pueda moverse (si quedó al fondo por un movimiento automático). */
const markUserScroll = () => { userScrollAt = Date.now(); requestAnimationFrame(checkFoot) };
addEventListener('wheel', markUserScroll, { passive: true });
addEventListener('touchmove', markUserScroll, { passive: true });
addEventListener('keydown', e => { if (/^(Arrow(Up|Down)|Page(Up|Down)|Home|End| )$/.test(e.key)) markUserScroll() });
/* El recuadro "se ve" cuando su parte de arriba entra en la pantalla (por encima de la barra de abajo del celu). */
const footInView = ft => { const r = ft.getBoundingClientRect(), nb = $('#nb'), bottom = nb && nb.offsetParent ? nb.getBoundingClientRect().top : innerHeight; return r.top < bottom - 40 && r.bottom > 0 };
function showFoot() {
  const p = revealFoot.pending; if (!p) return;
  revealFoot.pending = null; p.ft.classList.add('is-in'); S.footIn.add(p.key); celebrateAtFoot();
}
function revealFoot() {
  revealFoot.pending = null;
  const ft = $('#step-foot'); if (!ft) return;
  const key = footKey();
  if (S.footIn.has(key) || matchMedia('(prefers-reduced-motion: reduce)').matches) { ft.classList.add('is-in'); S.footIn.add(key); return }
  ft.classList.add('will-reveal');
  revealFoot.pending = { ft, key };
  /* Se mira en el cuadro siguiente: al cambiar de paso, la página primero sube al comienzo del paso. */
  /* Y otra vez un instante después, cuando la página terminó de acomodarse, si la vista no se movió. */
  const initial = () => { const p = revealFoot.pending; if (p && p.ft === ft && ft.isConnected && footInView(ft)) showFoot() };
  requestAnimationFrame(() => requestAnimationFrame(() => { initial(); const y = scrollY; setTimeout(() => { if (scrollY === y) initial() }, 350) }));
}
function checkFoot() {
  const p = revealFoot.pending; if (!p) return;
  if (!p.ft.isConnected) { revealFoot.pending = null; return }
  if (Date.now() - userScrollAt < 1500 && footInView(p.ft)) showFoot();
}
addEventListener('scroll', checkFoot, { passive: true });
document.addEventListener('animationend', e => { if (e.target.classList && e.target.classList.contains('tick') && S.sp === 'ac' && S.i >= 0 && S.i < SC.length) { S.tickDone.add(footKey()); e.target.classList.remove('pop') } });
Object.assign(S, { footIn: new Set(), tickDone: new Set() });

/* Aviso "Estación completa": sale junto con el recuadro del pie (o, si el recuadro ya está a la vista,
   en el momento en que se completa). Si hay un desafío abierto, espera a que se cierre. */
function celebrateAtFoot() {
  const ft = $('#step-foot'), dl = $('#quiz-dlg');
  if (S.celebrate !== S.i || !ft || !ft.classList.contains('is-in') || !footInView(ft) || (dl && dl.open)) return;
  S.celebrate = null;
  toast('✓ Estación completa');
  const b = ft.querySelector('.b.p'); if (b) b.classList.add('rdy');
  try { navigator.vibrate && navigator.vibrate([12, 40, 12]) } catch (e) {}
}
document.addEventListener('close', e => { if (e.target.id === 'quiz-dlg') celebrateAtFoot() }, true);

function bar() {
  if (S.sp !== 'ac' || S.i < 0 || S.i >= SC.length) return;
  const c = SC[S.i], ok = c.ok();
  /* Solo se reescribe lo que cambió: así el lector de pantalla no repite el aviso con cada movimiento. */
  const put = (el, html) => { if (el && el._h !== html) { el.innerHTML = html; el._h = html } };
  const st = $('#stepper'), ft = $('#step-foot');
  put(st, stepperHTML(c)); put(ft, stepFootHTML(c));
  const tab = document.querySelectorAll('.strip button')[S.i];
  if (tab) tab.classList.toggle('d', ok || doneSt(S.i));
  if (ok && !doneSt(S.i)) { P.done = (P.done || []).concat(S.i) }
  saveProgress();
  if (ok && !S.dn[S.i]) { S.dn[S.i] = 1; S.celebrate = S.i; celebrateAtFoot() }
}

function stationView() {
  const c = SC[S.i], s = curStep(c), j = stepIdx(c);
  openStep(c, s.k);
  /* En el celu el objetivo se muestra solo en el primer paso, para que la consigna entre en la primera pantalla. */
  return `${strip()}
  <header class="station-head"><div class="k">Estación ${S.i + 1} de ${SC.length}</div><h2>${c.t}</h2><p class="station-goal ${j ? 'is-later' : ''}">${c.goal}</p></header>
  <ol class="stepper" id="stepper" aria-label="Pasos de esta estación">${stepperHTML(c)}</ol>
  <section class="step" aria-labelledby="step-title">
    <div class="step-head"><div class="k">Paso ${j + 1} de ${c.steps.length}</div><h3 id="step-title" tabindex="-1">${s.label}</h3></div>
    <div class="step-body">${s.view()}</div>
    <div class="step-foot" id="step-foot" aria-live="polite">${stepFootHTML(c)}</div>
  </section>`;
}

/* Cierre de la estación (#/academia/<estación>/repaso): las palabras clave para llevarse,
   el apunte para seguir leyendo y el paso a la próxima estación. */
function recapView() {
  if (S.celebrate === S.i) S.celebrate = null; /* la pantalla de cierre ya festeja: el aviso no hace falta */
  const c = SC[S.i], nx = SC[S.i + 1], n = doneCount();
  return `${strip()}
  <header class="station-head"><div class="k">Estación ${S.i + 1} de ${SC.length} · completa</div><h2>Lo que aprendiste</h2><p class="station-goal">Terminaste «${c.t}». Estas son las ideas clave para llevarte. Llevás ${n} de ${SC.length} estaciones.</p></header>
  ${stationRecap(S.i)}
  <div class="bar recap-actions"><a class="b p" href="${nextStationHref()}">${nx ? `Continuar a la estación ${S.i + 2}: ${nx.n}` : 'Terminar el recorrido'}</a><a class="b" href="#${stepPath(S.i)}">Volver a la estación</a></div>`;
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
  return `<div class="k">Camino completado</div><h2>De la cereza a la taza</h2>${finHTML()}<p>Recorriste las seis estaciones:</p>${SC.map(c => `<p>✓ ${c.t}</p>`).join('')}<p class="m">Podés volver a cualquier estación desde el mapa, o poner a prueba lo que aprendiste.</p>${strip()}<div class="bar"><a class="b p" href="#/desafios">Ir a Desafíos</a><button class="b" data-a="go" data-v="0">Repetir desde la estación 1</button></div>`;
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
  if (S.recap) return recapView();
  return stationView();
}
function academiaAfter() {
  if (S.i === -2) return glossaryAfter();
  if (S.i === -3) return theoryAfter();
  if (S.i === -1) return mapAfter();
  if (S.i < 0 || S.i >= SC.length || S.recap) return;
  S.pl = 0;
  const c = SC[S.i]; if (c.after) c.after();
  revealFoot(); bar(); celebrateAtFoot();
  /* La dirección siempre muestra el paso actual: #/academia/<estación>/<paso>. */
  const p = stepPath(S.i);
  if (hashPath() !== p) { try { history.replaceState(history.state, '', '#' + p) } catch (e) {} shownPath = p }
}

on({
  go: v => go(+v),
  cont: () => go(S.i + 1),
  step: v => goStep(v),
  quizOpen: () => { const dl = quizDlg(); dl.innerHTML = quizDlgHTML(); if (!dl.open) dl.showModal() },
  quizAns: v => {
    const s = curStep(SC[S.i]); if (!s.quiz || S.qa[s.quiz] != null) return;
    S.qa[s.quiz] = +v; const dl = quizDlg(); dl.innerHTML = quizDlgHTML(); bar();
    const b = dl.querySelector('.bar .b.p') || dl.querySelector('.quiz-dlg-fb'); if (b) b.focus();
  },
  quizClose: () => { const dl = $('#quiz-dlg'); if (dl && dl.open) dl.close() },
  academyMenu: () => routeTo('/academia')
});

/* Temas en preparación (se muestran plegados al final de la página de la Academia). */
const SOON = [
  ['Del origen al grano verde', [['Cultivo y territorio', 'Altitud, clima, suelo y prácticas agrícolas.'], ['Cosecha y selección', 'Madurez, recolección y clasificación del fruto.']]],
  ['Transformación', [['Curvas de tueste', 'Lectura de perfiles, energía y desarrollo.'], ['Control de calidad', 'Muestras, catación y consistencia de lotes.']]],
  ['De la molienda a la taza', [['Espresso', 'Máquina, receta, calibración y servicio.'], ['Filtrados', 'V60, Origami, AeroPress y otros métodos.'], ['Agua y molienda', 'Minerales, dureza, alcalinidad y granulometría.'], ['Análisis sensorial', 'Cata, protocolos y evaluación de café.']]]
];
/* Próxima estación sugerida: la última abierta si no está completa; si no, la primera pendiente. */
function suggestedStation() {
  if (P.last != null && !stDone(P.last)) return P.last;
  const i = SC.findIndex((_, j) => !stDone(j));
  return i;
}

/* ---------- Página de la Academia: mapa de la planta a la taza ----------
   El mapa isométrico (js/academia/mapa.js) con "Estás acá" en la estación actual.
   Glosario, apuntes y lo que viene van al final, chicos. */
const SOON_COUNT = () => SOON.reduce((n, g) => n + g[1].length, 0);
function academyMenu() {
  const done = doneCount(), cur = suggestedStation();
  const allDone = cur < 0 ? `<div class="path-end"><p><b>Completaste las ${SC.length} estaciones.</b> Repasá la que quieras o poné a prueba lo que aprendiste.</p><a class="b p" href="#/desafios">Ir a Desafíos</a></div>` : '';
  return `<div class="academy-menu">
  <div class="academy-menu-head"><h2>Recorré las estaciones.</h2><p class="m">De la planta a la taza, en ${SC.length} estaciones que se hacen por pasos. Llevás ${done} de ${SC.length}. Tocá una isla para ver qué tiene.</p></div>
  ${allDone}${mapWorld(cur)}
  <p class="path-more">Para consultar: el <button type="button" class="link-btn" data-a="glossary">glosario</button> y los <button type="button" class="link-btn" data-a="theory">apuntes</button>.</p>
  <details class="academy-soon"><summary>Próximamente: ${SOON_COUNT()} temas más</summary>${SOON.map(g => `<h4>${g[0]}</h4><ul>${g[1].map(m => `<li><b>${m[0]}</b> <span class="m">${m[1]}</span></li>`).join('')}</ul>`).join('')}</details>
</div>`;
}

function finHTML(){return `<div style='display:flex;justify-content:center;margin:10px 0'><svg viewBox='0 0 100 100' width='140' height='140' aria-hidden='true'><g fill='none' stroke='var(--sage)' stroke-width='6' transform='rotate(-90 50 50)'>${[0,1,2,3,4,5].map(i=>`<circle cx='50' cy='50' r='40' stroke-dasharray='38 213.3' stroke-dashoffset='${-i*41.9}' style='animation:up .6s ${i*.12}s both'/>`).join('')}</g><text x='50' y='56' text-anchor='middle' fill='var(--ink)' font-size='20' font-family='Oswald,sans-serif'>6/6</text></svg></div><div style='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px'>${[[S.seen.length+'/5','Estructuras del fruto'],[S.pv.length,'Etapas de poscosecha vistas'],[S.sy.length,'Defectos retirados'],[S.t4v.length+'/4','Pasos de tueste recorridos']].map(x=>`<div class=stat><b>${x[0]}</b><span class=m style='font-size:.8rem'>${x[1]}</span></div>`).join('')}</div>`}
