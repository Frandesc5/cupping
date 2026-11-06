/* ============================================================
   Portada
   Cambia según el avance guardado en este navegador:
   · nueva     (nunca abriste una estación): presentación del campus y "Empezá por…"
   · en curso  (1 a 5 estaciones): panel personal — seguir donde lo dejaste y
               sugerencias para reforzar lo aprendido (el mapa de estaciones está en la Academia)
   · completa  (6 de 6): felicitación, desafíos pendientes y cursos presenciales
   ============================================================ */

const CH_LEVELS = ['Básico', 'Intermedio', 'Avanzado'];
const homeMode = () => P.last == null ? 'new' : SC.every((_, i) => stDone(i)) ? 'complete' : 'progress';
function homeView() { const m = homeMode(); return m === 'new' ? campusHome() : personalHome(m) }

/* ---------- Panel personal ---------- */
function personalHome(mode) {
  const n = SC.length, done = SC.filter((_, i) => stDone(i)).length, list = suggestions();
  const h = mode === 'complete' ? `Completaste las ${n} estaciones`
    : done === 0 ? 'Ya empezaste el recorrido' : done < n / 2 ? 'Buen comienzo' : done === n / 2 ? 'Vas por la mitad del recorrido' : 'Te falta poco para terminar';
  const first = mode === 'complete' ? list.find(x => x.a === 'openChallenge') : null;
  return `<section class="me-head"><div class="k">${mode === 'complete' ? 'Recorrido completo' : 'Hola de nuevo'}</div><h1>${h}</h1>
    <div class="menu-progress"><div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${done}" aria-label="Estaciones completas"><i style="width:${Math.round(done / n * 100)}%"></i></div><span>${done} de ${n} estaciones completas</span></div></section>
  <div class="me-stack">${mode === 'complete' ? completeCard(first) : homeResume()}${suggestHTML(first ? list.filter(x => x !== first) : list, mode)}${courseTeaser(mode)}</div>
  ${spacesRow()}`;
}

/* Seguí donde lo dejaste: la estación sugerida, el paso y sus puntitos de avance. */
function homeResume() {
  const i = suggestedStation(), c = SC[i], started = startedSt(i), j = stepIdx(c);
  const dots = c.steps.map((s, k) => `<i class="${stepDone(c, s) ? 'd' : ''} ${started && k === j ? 'c' : ''}"></i>`).join('');
  return `<section class="resume-card home-resume" aria-labelledby="resume-h"><div><div class="k">${started ? 'Seguí donde lo dejaste' : 'Tu próxima estación'}</div>
    <h2 id="resume-h">Estación ${i + 1} · ${c.t}</h2>
    <p class="m">${started ? `Paso ${j + 1} de ${c.steps.length}: ${curStep(c).label}` : c.goal}</p>
    <div class="mini-steps" role="img" aria-label="${stepsDone(c)} de ${c.steps.length} pasos completos">${dots}</div></div>
    <a class="b p" href="#${stepPath(i)}">${started ? 'Continuar →' : 'Empezar →'}</a></section>`;
}

/* Recorrido completo terminado: el próximo desafío pendiente, o los cursos si ya están todos. */
function completeCard(first) {
  return `<section class="resume-card home-resume" aria-labelledby="resume-h"><div><div class="k">${first ? 'Poné a prueba lo que aprendiste' : 'Próximo paso'}</div>
    <h2 id="resume-h">${first ? first.t : 'Seguí formándote en persona'}</h2>
    <p class="m">${first ? first.s : 'Ya respondiste todos los desafíos. Los cursos presenciales son el siguiente nivel.'}</p></div>
    ${first ? `<a class="b p" href="#/desafios" data-a="openChallenge" data-v="${first.v}">Ir al desafío →</a>` : `<a class="b p" href="#/capacitarse">Ver cursos →</a>`}</section>`;
}

/* Para reforzar lo que viste: armado con lo que ya completaste.
   Desafíos del módulo de cada estación terminada (lo más reciente primero)
   y una práctica en el Laboratorio. Como máximo 3. */
function suggestions() {
  const recent = [...(P.done || [])].reverse().filter((v, k, a) => a.indexOf(v) === k && SC[v]);
  const ch = [];
  for (const i of recent) {
    const m = SC[i].n; if (!CHBANK[m]) continue;
    const lvl = CH_LEVELS.find(l => S.chAnswers[m + '|' + l] == null); if (!lvl) continue;
    const hechos = CH_LEVELS.filter(l => S.chAnswers[m + '|' + l] != null).length;
    ch.push({ ico: '◇', t: `Desafíos de ${SC[i].mt.charAt(0).toLowerCase() + SC[i].mt.slice(1)}`, s: `Nivel ${lvl.toLowerCase()} · ${hechos} de 3 niveles hechos`, href: '#/desafios', a: 'openChallenge', v: m + '|' + lvl });
  }
  const lab = [];
  if (BIT.length >= 2) lab.push({ ico: '⌁', t: 'Compará tus dos últimas preparaciones', s: 'En tu bitácora del Laboratorio', href: '#/laboratorio/bitacora', a: 'compareLast' });
  else if (stDone(4)) lab.push({ ico: '⌁', t: 'Probá tu receta en el Laboratorio', s: BIT.length ? 'Registrá otra preparación para poder compararlas' : 'Ajustá variables y guardá la prueba en tu bitácora', href: '#/laboratorio/filtrado' });
  return [...ch.slice(0, lab.length ? 2 : 3), ...lab].slice(0, 3);
}
function suggestHTML(list, mode) {
  const body = list.length
    ? `<ul class="suggest-list">${list.map(x => `<li><a class="suggest-card" href="${x.href}" ${x.a ? `data-a="${x.a}"` : ''} ${x.v ? `data-v="${x.v}"` : ''}><span class="suggest-ico" aria-hidden="true">${x.ico}</span><span><b>${x.t}</b><small>${x.s}</small></span><span aria-hidden="true">→</span></a></li>`).join('')}</ul>`
    : `<p class="me-empty">${mode === 'complete' ? 'Respondiste todos los desafíos de los módulos que completaste.' : 'Cuando completes una estación, acá vas a ver desafíos y prácticas para reforzarla.'}</p>`;
  return `<section class="me-suggest" aria-labelledby="sug-h"><h2 id="sug-h" class="me-h">Para reforzar lo que viste</h2>${body}</section>`;
}

/* Cursos: en tono suave mientras avanzás; destacados al terminar el recorrido. */
function courseTeaser(mode) {
  const bp = CRS.find(c => c.slug === 'barista-profesional'), ci = CRS.find(c => c.slug === 'curso-intensivo');
  if (mode !== 'complete') return `<aside class="course-teaser"><div class="k">¿Querés aprenderlo en persona?</div><a href="#/capacitarse/${bp.slug}">${bp.t} · ${bp.d} en ${bp.s} →</a></aside>`;
  return `<aside class="course-teaser is-strong"><div class="k">Seguí formándote</div><p>Llevá lo que aprendiste a la barra, con el equipo de la Academia.</p><a href="#/capacitarse/${bp.slug}">${bp.t} · ${bp.d} →</a><a href="#/capacitarse/${ci.slug}">${ci.t} · ${ci.d} →</a></aside>`;
}

/* Los cuatro espacios, en una fila chica al pie (solo en computadora: en celular están en la barra inferior). */
function spacesRow() {
  const rows = [['academia', '◉', 'Academia', 'Módulos del origen a la taza'], ['laboratorio', '⌁', 'Laboratorio', 'Simuladores y bitácora'], ['desafios', '◇', 'Desafíos', 'Casos por módulo y nivel'], ['capacitarse', '▤', 'Cursos', 'Online y presenciales']];
  return `<nav class="spaces-row" aria-label="Espacios del campus">${rows.map(r => `<a href="#/${r[0]}"><span aria-hidden="true">${r[1]}</span><span><b>${r[2]}</b><small>${r[3]}</small></span></a>`).join('')}</nav>`;
}

on({
  /* Abre Desafíos directamente en el módulo y nivel sugeridos. */
  openChallenge: v => { const [m, l] = v.split('|'); S.chModule = m; S.chLevel = l; routeTo('/desafios') },
  /* Abre la bitácora con las dos últimas preparaciones ya elegidas para comparar. */
  compareLast: () => { if (BIT.length >= 2) S.cmp = [BIT[0].id, BIT[1].id]; routeTo('/laboratorio/bitacora') }
});

/* ---------- Portada para quien entra por primera vez ---------- */
/* Próximo paso sugerido: empezar, continuar o pasar a Desafíos. */
function nextStep() {
  const done = doneCount();
  let k, h, p, href, cta;
  if (P.last == null) {
    k = '¿Primera vez en .campus?'; h = 'Empezá por ' + SC[0].t.toLowerCase();
    p = 'Te sugerimos este orden: Academia para aprender, Laboratorio para probar y Desafíos para poner a prueba tu criterio. Tu avance se guarda en este dispositivo.';
    href = '#/academia/' + SC[0].slug; cta = 'Empezar el recorrido →';
  } else if (done >= SC.length) {
    k = 'Recorrido completo'; h = 'Poné a prueba lo que aprendiste';
    p = 'Completaste las ' + SC.length + ' estaciones. En Desafíos hay casos de nivel básico a avanzado.';
    href = '#/desafios'; cta = 'Ir a Desafíos →';
  } else {
    const i = doneSt(P.last) ? SC.findIndex((_, j) => !doneSt(j)) : P.last;
    k = 'Continuá donde lo dejaste'; h = 'Estación ' + (i + 1) + ' · ' + SC[i].t;
    p = done + ' de ' + SC.length + ' estaciones completas.';
    href = '#/academia/' + SC[i].slug; cta = 'Continuar →';
  }
  return `<section class="next-step" aria-label="Tu próximo paso"><div><div class="k">${k}</div><h2>${h}</h2><p class="m">${p}</p></div><a class="b p" href="${href}">${cta}</a></section>`;
}
function campusHome() {
  const cards = [
    ['academia', 'Academia', 'Explorá los módulos de formación, desde el origen hasta la taza.', '01', '◉'],
    ['laboratorio', 'Laboratorio', 'Diseñá pruebas, ajustá variables y analizá resultados.', '02', '⌁'],
    ['desafios', 'Desafíos', 'Poné a prueba tu criterio profesional.', '03', '◇'],
    ['capacitarse', 'Cursos', 'Capacitaciones online y presenciales para seguir formándote.', '04', '▤']
  ];
  return `<section class="home-hero">
  <div class="hero-copy">
    <div class="hero-eyebrow"><span>ACADEMIA DE BARISTAS</span><i></i><span>PLATAFORMA DE APRENDIZAJE</span></div>
    <div class="k">FORMACIÓN EN CAFÉ DE ESPECIALIDAD</div>
    <h1>Aprendé.<br><em>Experimentá.</em><br>Crecé.</h1>
    <p>Un espacio para incorporar conocimientos, desarrollar criterio, practicar y construir tu recorrido profesional en el café.</p>
    <div class="action-row"><a class="b p" href="#/academia">Entrar a la Academia →</a><a class="b" href="#/capacitarse">Ver cursos</a></div>
    <div class="hero-signature">TEORÍA <span>+</span> PRÁCTICA <span>+</span> ACOMPAÑAMIENTO</div>
  </div>
  <figure class="hero-photo-wrap"><img class="hero-photo" src="${HERO_PHOTO}" alt="Equipo de Academia de Baristas" fetchpriority="high" decoding="async"><figcaption class="photo-note"><b>APASIONADOS EN LA MATERIA.</b><span>Aprender café también es compartirlo.</span></figcaption><div class="photo-index">.CAMPUS</div></figure>
  <div class="hero-footer"><span>.CAMPUS · ACADEMIA DE BARISTAS</span><span>CAFÉ DE ESPECIALIDAD · FORMACIÓN CONTINUA</span></div>
</section>
${nextStep()}
<section class="home-spaces" aria-label="Los cuatro espacios del campus">
<div class="section-intro"><div><div class="k">.campus</div><h2>Un recorrido.<br>Cuatro espacios.</h2></div><p class="m">Aprendé en la Academia, probá en el Laboratorio, poné a prueba tu criterio en Desafíos y seguí formándote con los Cursos.</p></div>
<div class="section-grid">${cards.map(c => `<a class="section-card" href="#/${c[0]}"><span class="card-top"><span class="section-icon" aria-hidden="true">${c[4]}</span></span><span><strong>${c[1]}</strong><small>${c[2]}</small><span class="card-link">EXPLORAR <b>→</b></span></span></a>`).join('')}</div>
</section>
<div class="learning-banner"><div class="learning-mark" aria-hidden="true">AB<span>.</span></div><div><div class="k">APRENDER HACIENDO</div><h3>La teoría cobra sentido<br>cuando pasa por tus manos.</h3><p>Un campus para acompañar tu formación y conectar el conocimiento con la práctica.</p></div><a class="b" href="#/capacitarse">Conocé los cursos →</a></div>`;
}

