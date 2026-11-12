/* ============================================================
   Portada
   Cambia según el avance guardado en este navegador:
   · nueva     (ninguna estación empezada ni registros en la bitácora): presentación del campus,
               con un solo botón principal ("Empezar por la estación 1")
   · en curso  (empezaste la Academia o usaste el Laboratorio): panel personal. Lo primero es
               "Seguí donde lo dejaste" con el botón "Continuar"; no se repite la presentación.
   · completa  (6 de 6): desafíos pendientes y cursos presenciales
   ============================================================ */

const CH_LEVELS = ['Básico', 'Intermedio', 'Avanzado'];
const homeMode = () => !SC.some((_, i) => startedSt(i)) && !BIT.length ? 'new' : SC.every((_, i) => stDone(i)) ? 'complete' : 'progress';
function homeView() { const m = homeMode(); return m === 'new' ? campusHome() : personalHome(m) }

/* ---------- Panel personal ---------- */
function personalHome(mode) {
  const n = SC.length, done = SC.filter((_, i) => stDone(i)).length, list = suggestions();
  const first = mode === 'complete' ? list.find(x => x.a === 'openChallenge') : null;
  return `<section class="me-head"><h1>${mode === 'complete' ? `Completaste las ${n} estaciones` : 'Hola de nuevo'}</h1></section>
  <div class="me-stack">${mode === 'complete' ? completeCard(first) : homeResume()}
    <div class="menu-progress"><div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${done}" aria-label="Estaciones completas"><i style="width:${Math.round(done / n * 100)}%"></i></div><span>${done} de ${n} estaciones completas</span><a class="link-btn" href="#/academia">Ver el mapa</a></div>
    ${lastTestCard()}${suggestHTML(first ? list.filter(x => x !== first) : list, mode)}${courseTeaser(mode)}</div>
  ${spacesRow()}${storeNote()}`;
}

/* Seguí donde lo dejaste: la estación sugerida, el paso y sus puntitos de avance. */
function homeResume() {
  const i = suggestedStation(), c = SC[i], started = startedSt(i), j = stepIdx(c);
  const dots = c.steps.map((s, k) => `<i class="${stepDone(c, s) ? 'd' : ''} ${started && k === j ? 'c' : ''}"></i>`).join('');
  return `<section class="resume-card home-resume" aria-labelledby="resume-h"><div><div class="k">${started ? 'Seguí donde lo dejaste' : 'Tu próxima estación'}</div>
    <h2 id="resume-h">Estación ${i + 1} · ${c.t}</h2>
    <p class="m">${started ? `Paso ${j + 1} de ${c.steps.length}: ${curStep(c).label}` : c.goal}</p>
    <div class="mini-steps" role="img" aria-label="${stepsDone(c)} de ${c.steps.length} pasos completos">${dots}</div></div>
    <a class="b p" href="#${stepPath(i)}">${started ? 'Continuar' : 'Empezar'}</a></section>`;
}

/* Recorrido completo terminado: el próximo desafío pendiente, o los cursos si ya están todos. */
function completeCard(first) {
  return `<section class="resume-card home-resume" aria-labelledby="resume-h"><div><div class="k">${first ? 'Poné a prueba lo que aprendiste' : 'Próximo paso'}</div>
    <h2 id="resume-h">${first ? first.t : 'Seguí formándote en persona'}</h2>
    <p class="m">${first ? first.s : 'Ya respondiste todos los desafíos. Los cursos presenciales son el siguiente nivel.'}</p></div>
    ${first ? `<a class="b p" href="#/desafios" data-a="openChallenge" data-v="${first.v}">Ir al desafío</a>` : `<a class="b p" href="#/capacitarse">Ver cursos</a>`}</section>`;
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
    ch.push({ ico: 'de', t: `Desafíos de ${SC[i].mt.charAt(0).toLowerCase() + SC[i].mt.slice(1)}`, s: `${hechos} de 3 preguntas respondidas`, href: '#/desafios', a: 'openChallenge', v: m + '|' + lvl });
  }
  const lab = [];
  /* Con registros en la bitácora, la práctica ya está en la tarjeta 'Tu última prueba'. */
  if (!BIT.length && stDone(4)) lab.push({ ico: 'lb', t: 'Probá tu receta en el Laboratorio', s: 'Armá una receta en el simulador y guardala en tu bitácora', href: '#/laboratorio/filtrado' });
  return [...ch.slice(0, lab.length ? 2 : 3), ...lab].slice(0, 3);
}
function suggestHTML(list, mode) {
  const body = list.length
    ? `<ul class="suggest-list">${list.map(x => `<li><a class="suggest-card" href="${x.href}" ${x.a ? `data-a="${x.a}"` : ''} ${x.v ? `data-v="${x.v}"` : ''}><span class="suggest-ico" aria-hidden="true">${SPACE_ICONS[x.ico]}</span><span><b>${x.t}</b><small>${x.s}</small></span></a></li>`).join('')}</ul>`
    : `<p class="me-empty">${mode === 'complete' ? 'Respondiste todos los desafíos de las estaciones que completaste.' : 'Cuando completes una estación, acá vas a ver desafíos y prácticas para reforzarla.'}</p>`;
  return `<section class="me-suggest" aria-labelledby="sug-h"><h2 id="sug-h" class="me-h">Para reforzar lo que viste</h2>${body}</section>`;
}

/* Cursos: en tono suave mientras avanzás; destacados al terminar el recorrido. */
function courseTeaser(mode) {
  const bp = CRS.find(c => c.slug === 'barista-profesional'), ci = CRS.find(c => c.slug === 'curso-intensivo');
  const link = (c, where) => `<a href="${COURSES_URL}" target="_blank" rel="noopener">${c.t} · ${c.d}${where && c.s ? ' en ' + c.s : ''} ↗</a>`;
  if (mode !== 'complete') return `<aside class="course-teaser"><div class="k">¿Querés aprenderlo en persona?</div>${link(bp, true)}</aside>`;
  return `<aside class="course-teaser is-strong"><div class="k">Seguí formándote</div><p>Llevá lo que aprendiste a la barra, con el equipo de la Academia.</p>${link(bp)}${link(ci)}</aside>`;
}

/* Los cuatro espacios, en una fila chica al pie (solo en computadora: en celular están en la barra inferior).
   Mismos íconos que la barra de abajo (SPACE_ICONS, en js/app.js). */
function spacesRow() {
  const rows = [['academia', 'ac', 'Academia', '6 estaciones, de la planta a la taza'], ['laboratorio', 'lb', 'Laboratorio', 'Simulador y bitácora'], ['desafios', 'de', 'Desafíos', 'Preguntas por estación y nivel'], ['capacitarse', 'ca', 'Cursos', 'Online y presenciales']];
  return `<nav class="spaces-row" aria-label="Espacios del campus">${rows.map(r => `<a href="#/${r[0]}"><span class="space-ico" aria-hidden="true">${SPACE_ICONS[r[1]]}</span><span><b>${r[2]}</b><small>${r[3]}</small></span></a>`).join('')}</nav>`;
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
    <span class="suggest-ico" aria-hidden="true">${SPACE_ICONS.lb}</span>
    <div class="lab-last-body"><div class="k">Tu última anotación · ${esc(recDate(b))}</div>
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
  /* Sin nivel ("Fruto|"), va a la primera pregunta sin responder de esa estación. */
  openChallenge: v => { const [m, l] = v.split('|'); S.chModule = m; S.chLevel = l || CH_LEVELS.find(x => S.chAnswers[m + '|' + x] == null) || CH_LEVELS[0]; routeTo('/desafios') },
  /* Registro nuevo con la misma receta; el resultado (TDS, bebida, notas) queda en blanco para la prueba nueva. */
  repeatLast: () => { const b = BIT[0]; if (!b) return; const p = prefillFromRecord(b); delete p.x; delete p.y; delete p.z; S.prefill = p; S.prefillFrom = 'rec'; S.editId = null; S.be = ''; S.bm = ''; routeTo('/laboratorio/nuevo-registro'); toast('Receta cargada: anotá el resultado de esta prueba') },
  /* Abre el simulador con la receta cargada, para cambiar una variable y ver qué pasa. */
  tuneLast: () => { const b = BIT[0]; if (!b) return; routeTo('/laboratorio/' + loadRecipe(b)); toast('Tu receta está cargada en el simulador') }
});

/* ---------- Portada para quien entra por primera vez ---------- */
/* Presentación del campus. Una sola acción principal: empezar por la estación 1.
   El mapa queda como enlace secundario y los cursos, en la franja del final. */
function heroHTML() {
  return `<section class="home-hero">
  <div class="hero-copy">
    <h1>Aprendé.<br>Experimentá.<br>Crecé.</h1>
    <p>Aprendé café desde cero, paso a paso y a tu ritmo. Son ${SC.length} estaciones interactivas, de la planta a la taza. No hace falta saber nada antes.</p>
    <div class="action-row"><a class="b p" href="#/academia/${SC[0].slug}">Empezar por la estación 1</a><a class="link-btn hero-map-link" href="#/academia">Ver el mapa de las ${SC.length} estaciones</a></div>
    <p class="hero-note">Tu avance queda guardado en este dispositivo.</p>
  </div>
  <figure class="hero-photo-wrap"><img class="hero-photo" src="${HERO_PHOTO}" width="1200" height="900" alt="Equipo de Academia de Baristas" fetchpriority="high" decoding="async"><figcaption class="photo-note">Aprender café también es compartirlo.</figcaption></figure>
</section>`;
}

function campusHome() {
  /* [dirección, ícono, qué se hace, nombre del espacio, descripción, enlace] — en el orden sugerido. */
  const cards = [
    ['academia', 'ac', '1 · Aprendé', 'Academia', `${SC.length} estaciones interactivas, de la planta a la taza. Empezá por acá.`, 'Ir a la Academia'],
    ['laboratorio', 'lb', '2 · Practicá', 'Laboratorio', 'Armá recetas en el simulador y anotá los cafés que preparás.', 'Ir al Laboratorio'],
    ['desafios', 'de', '3 · Ponete a prueba', 'Desafíos', 'Preguntas cortas sobre cada estación, de fácil a difícil.', 'Ir a Desafíos'],
    ['capacitarse', 'ca', '4 · Seguí en persona', 'Cursos', 'Cursos presenciales con el equipo de la Academia.', 'Ver cursos']
  ];
  return heroHTML() + `
<section class="home-spaces" aria-label="Los cuatro espacios del campus">
<div class="section-intro"><div><div class="k">.campus</div><h2>Un recorrido.<br>Cuatro espacios.</h2></div><p class="m">Aprendé en la Academia, practicá en el Laboratorio, ponete a prueba en Desafíos y seguí formándote con los Cursos.</p></div>
<div class="section-grid">${cards.map(c => `<a class="section-card" href="#/${c[0]}"><span class="card-top"><span class="section-icon" aria-hidden="true">${SPACE_ICONS[c[1]]}</span></span><span><span class="card-space">${c[3]}</span><strong>${c[2]}</strong><small>${c[4]}</small><span class="card-link">${c[5]}</span></span></a>`).join('')}</div>
</section>
<div class="learning-banner"><div class="learning-mark" aria-hidden="true">AB<span>.</span></div><div><div class="k">Aprender haciendo</div><h3>La teoría cobra sentido<br>cuando pasa por tus manos.</h3><p>Un campus para acompañar tu formación y conectar el conocimiento con la práctica.</p></div><a class="b" href="#/capacitarse">Conocé los cursos</a></div>`;
}

