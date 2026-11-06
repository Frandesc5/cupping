/* ============================================================
   Portada
   Cambia según el avance guardado en este navegador:
   · nueva     (nunca abriste una estación): presentación del campus y "Empezá por…"
   · en curso  (empezaste la Academia o usaste el Laboratorio): panel personal — seguir donde lo dejaste y
               sugerencias para reforzar lo aprendido (el mapa de estaciones está en la Academia)
   · completa  (6 de 6): felicitación, desafíos pendientes y cursos presenciales
   ============================================================ */

const CH_LEVELS = ['Básico', 'Intermedio', 'Avanzado'];
const homeMode = () => P.last == null && !BIT.length ? 'new' : SC.every((_, i) => stDone(i)) ? 'complete' : 'progress';
function homeView() { const m = homeMode(); return m === 'new' ? campusHome() : personalHome(m) }

/* ---------- Panel personal ---------- */
function personalHome(mode) {
  const n = SC.length, done = SC.filter((_, i) => stDone(i)).length, list = suggestions();
  const h = mode === 'complete' ? `Completaste las ${n} estaciones`
    : P.last == null ? 'Seguí practicando' : done === 0 ? 'Ya empezaste el recorrido' : done < n / 2 ? 'Buen comienzo' : done === n / 2 ? 'Vas por la mitad del recorrido' : 'Te falta poco para terminar';
  const first = mode === 'complete' ? list.find(x => x.a === 'openChallenge') : null;
  return heroHTML() + `<section class="me-head"><div class="k">${mode === 'complete' ? 'Recorrido completo' : 'Hola de nuevo'}</div><h2>${h}</h2>
    <div class="menu-progress"><div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${done}" aria-label="Estaciones completas"><i style="width:${Math.round(done / n * 100)}%"></i></div><span>${done} de ${n} estaciones completas</span></div></section>
  <div class="me-stack">${mode === 'complete' ? completeCard(first) : homeResume()}${lastTestCard()}${suggestHTML(first ? list.filter(x => x !== first) : list, mode)}${courseTeaser(mode)}</div>
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
  /* Con registros en la bitácora, la práctica ya está en la tarjeta 'Tu última prueba'. */
  if (!BIT.length && stDone(4)) lab.push({ ico: '⌁', t: 'Probá tu receta en el Laboratorio', s: 'Ajustá variables y guardá la prueba en tu bitácora', href: '#/laboratorio/filtrado' });
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


/* ---------- Tu última prueba en el Laboratorio ----------
   Fila compacta (mismo peso que las sugerencias): solo aparece si hay registros
   en la bitácora. Muestra el último con 3 datos clave y dos acciones chicas;
   la acción principal de la portada sigue siendo "Continuar". */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nf = (x, d = 1) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: d }).format(x);
const dur = s => s >= 60 ? Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') + ' min' : s + ' s';
function lastTestCard() {
  const b = BIT[0]; if (!b) return '';
  const line = ['1:' + nf(b.w / b.d), b.t ? nf(b.t) + ' °C' : null, b.tds ? 'TDS ' + nf(b.tds, 2) + ' %' : b.s ? dur(b.s) : null].filter(Boolean).join(' · ');
  return `<section class="lab-last" aria-labelledby="lab-last-h">
    <span class="suggest-ico" aria-hidden="true">⌁</span>
    <div class="lab-last-body"><div class="k">Tu última prueba · ${esc(recDate(b))}</div>
      <h2 id="lab-last-h"><a href="#/laboratorio/bitacora">${esc(b.n)}</a>${b.m ? ` <span class="m">· ${esc(b.m)}</span>` : ''}</h2>
      <p class="lab-last-line">${line}</p></div>
    <div class="lab-last-actions"><button class="b sm" data-a="repeatLast" aria-label="Repetir la receta">Repetir</button><button class="b sm" data-a="tuneLast" aria-label="Ajustar en el simulador">Ajustar</button></div>
  </section>`;
}

/* Lleva una receta guardada a los deslizadores del simulador, dentro de sus rangos. */
const fitRange = (list, k, v) => {
  const p = list.find(x => x[0] === k);
  if (!p || v == null || v === '' || isNaN(+v)) return null;
  const [, , mn, mx, st] = p;
  return Math.min(mx, Math.max(mn, Math.round(+v / st) * st));
};
function loadRecipe(b) {
  const set = (obj, list, k, v) => { const x = fitRange(list, k, v); if (x != null) obj[k] = x };
  if (b.m === 'Espresso') {
    set(S.es, EV, 'd', b.d); set(S.es, EV, 'y', b.w); set(S.es, EV, 't', b.t || null); set(S.es, EV, 's', b.s || null);
    const g = ESG.indexOf(b.g); if (g >= 0) S.es.g = g + 1;
    return 'espresso';
  }
  set(S.lab, PV, 'd', b.d); set(S.lab, PV, 'w', b.w); set(S.lab, PV, 't', b.t || null);
  set(S.lab, PV, 'f', recFlow(b) || null); set(S.lab, PV, 'n', b.pours || null); set(S.lab, PV, 'b', b.bloom || null); set(S.lab, PV, 'e', b.wait || null);
  const g = GN.indexOf(b.g); if (g >= 0) S.lab.g = g + 1;
  const a = AN.indexOf(b.agitation); if (a >= 0) S.lab.a = a;
  if (b.clicks != null) S.lab.clicks = Math.max(0, Math.min(150, Math.round(b.clicks)));
  return 'filtrado';
}

on({
  /* Abre Desafíos directamente en el módulo y nivel sugeridos. */
  openChallenge: v => { const [m, l] = v.split('|'); S.chModule = m; S.chLevel = l; routeTo('/desafios') },
  /* Registro nuevo con la misma receta; el resultado (TDS, bebida, notas) queda en blanco para la prueba nueva. */
  repeatLast: () => { const b = BIT[0]; if (!b) return; const p = prefillFromRecord(b); delete p.x; delete p.y; delete p.z; S.prefill = p; S.be = ''; S.bm = ''; routeTo('/laboratorio/nuevo-registro'); toast('Receta cargada: anotá el resultado de esta prueba') },
  /* Abre el simulador con la receta cargada, para cambiar una variable y ver qué pasa. */
  tuneLast: () => { const b = BIT[0]; if (!b) return; routeTo('/laboratorio/' + loadRecipe(b)); toast('Tu receta está cargada en el simulador') }
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
/* Presentación del campus: la ven todos, tengan avance o no. */
function heroHTML() {
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
</section>`;
}

function campusHome() {
  const cards = [
    ['academia', 'Academia', 'Explorá los módulos de formación, desde el origen hasta la taza.', '01', '◉'],
    ['laboratorio', 'Laboratorio', 'Diseñá pruebas, ajustá variables y analizá resultados.', '02', '⌁'],
    ['desafios', 'Desafíos', 'Poné a prueba tu criterio profesional.', '03', '◇'],
    ['capacitarse', 'Cursos', 'Capacitaciones online y presenciales para seguir formándote.', '04', '▤']
  ];
  return heroHTML() + `
${nextStep()}
<section class="home-spaces" aria-label="Los cuatro espacios del campus">
<div class="section-intro"><div><div class="k">.campus</div><h2>Un recorrido.<br>Cuatro espacios.</h2></div><p class="m">Aprendé en la Academia, probá en el Laboratorio, poné a prueba tu criterio en Desafíos y seguí formándote con los Cursos.</p></div>
<div class="section-grid">${cards.map(c => `<a class="section-card" href="#/${c[0]}"><span class="card-top"><span class="section-icon" aria-hidden="true">${c[4]}</span></span><span><strong>${c[1]}</strong><small>${c[2]}</small><span class="card-link">EXPLORAR <b>→</b></span></span></a>`).join('')}</div>
</section>
<div class="learning-banner"><div class="learning-mark" aria-hidden="true">AB<span>.</span></div><div><div class="k">APRENDER HACIENDO</div><h3>La teoría cobra sentido<br>cuando pasa por tus manos.</h3><p>Un campus para acompañar tu formación y conectar el conocimiento con la práctica.</p></div><a class="b" href="#/capacitarse">Conocé los cursos →</a></div>`;
}

