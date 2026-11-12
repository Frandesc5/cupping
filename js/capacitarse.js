/* ============================================================
   Cursos (dirección #/capacitarse)
   Para agregar un curso, sumá un objeto a CRS:
   t título · slug dirección (#/capacitarse/<slug>) · m modalidad · n nivel (opcional)
   d duración o contenido · s sede (opcional) · on 1 si es el recorrido online, que son las
   mismas 6 estaciones de la Academia (no es otro contenido: la tarjeta lleva directo ahí).
   Los presenciales llevan al sitio oficial, donde están fechas, cupos e inscripción.
   ============================================================ */

const CRS = [
  { t: 'Fundamentos del café', slug: 'fundamentos-online', m: 'Online · a tu ritmo', n: 'principiante', d: '6 estaciones interactivas', on: 1 },
  { t: 'Barista profesional', slug: 'barista-profesional', m: 'Presencial', n: 'desde cero', d: '2 meses', s: 'Santa Fe y Rosario' },
  { t: 'Curso intensivo', slug: 'curso-intensivo', m: 'Presencial', d: '5 horas', s: 'Santa Fe' }
];
const COURSES_URL = 'https://academiadebaristas.com.ar/talleres-y-cursos/';

/* Acción principal del recorrido online según el avance: [texto, dirección]. */
function onlineCta(long) {
  const cur = suggestedStation(), going = SC.some((_, i) => startedSt(i));
  if (cur < 0) return ['Repasar desde la estación 1', '#' + stepPath(0)];
  if (!going) return [long ? 'Empezar' : 'Ir a la Academia', long ? '#' + stepPath(0) : '#/academia'];
  return [`Continuar: Estación ${cur + 1}${long ? ` · Paso ${stepIdx(SC[cur]) + 1}` : ''}`, '#' + stepPath(cur)];
}

function cap() {
  if (S.cu < 0) return `<h2>Cursos y formación</h2><p class="m">Elegí cómo seguir formándote: el recorrido online de este campus, a tu ritmo, o capacitaciones presenciales con el equipo de la Academia.</p>
    <div class="course-list">${CRS.map(c => {
      if (c.on) { const [txt, href] = onlineCta(); return `<a class="course-card" href="${href}"><span class="course-mode">${c.m}</span><strong>${c.t}</strong><span class="course-meta">Son las ${SC.length} estaciones de la Academia de este campus</span><span class="card-link">${txt}</span></a>` }
      return `<a class="course-card" href="${COURSES_URL}" target="_blank" rel="noopener"><span class="course-mode">${c.m}</span><strong>${c.t}</strong><span class="course-meta">${c.d}${c.s ? ' · ' + c.s : ''}</span><span class="card-link">Ver fechas e inscripción ↗</span></a>`;
    }).join('')}</div>`;
  const c = CRS[S.cu], pr = Math.round(doneCount() / SC.length * 100);
  if (c.on) {
    const [txt, href] = onlineCta(true);
    return `<div class="k">${c.m}</div><h2>${c.t}</h2><p>Nivel: ${c.n} · ${c.d}</p><p class="m">Es el recorrido de la Academia de este campus: las mismas ${SC.length} estaciones, con tu avance.</p>
    <div class="bar is-narrow"><a class="b p" href="${href}">${txt}</a></div>
    <div class="panel"><div class="k">Programa</div><div class="program-list">${SC.map((x, i) => `<a class="program-item" href="#${stepPath(i)}"><b>${i + 1} · ${x.t}</b><span class="prog-state ${stDone(i) ? 'is-done' : startedSt(i) ? 'is-started' : ''}">${stDone(i) ? '✓ Completa' : startedSt(i) ? 'En curso' : 'Empezar'}</span></a>`).join('')}</div><div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${SC.length}" aria-valuenow="${doneCount()}" aria-label="Estaciones completas"><i style="width:${pr}%"></i></div><p class="m">${doneCount()} de ${SC.length} estaciones completas en este dispositivo.</p></div>
    <div class="panel"><div class="k">Qué incluye</div><p>${SC.length} estaciones interactivas, glosario, apuntes y seguimiento de tu avance.</p><p class="m">Más adelante: videos, material descargable, evaluaciones y certificado.</p></div>`;
  }
  return `<div class="k">${c.m}</div><h2>${c.t}</h2><p>${c.n ? 'Nivel: ' + c.n + ' · ' : ''}Duración: ${c.d}${c.s ? ' · Sede: ' + c.s : ''}</p>
    <div class="panel"><p>Los detalles de inscripción, fechas y cupos están en el sitio oficial. Las estaciones de la Academia sirven como recurso digital complementario.</p><div class="bar is-narrow"><a class="b p" href="${COURSES_URL}" target="_blank" rel="noopener">Ver fechas e inscripción ↗</a></div></div>`;
}
