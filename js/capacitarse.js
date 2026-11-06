/* ============================================================
   Capacitarse · cursos y formación
   Para agregar un curso, sumá un objeto a CRS:
   t título · slug dirección (#/capacitarse/<slug>) · m modalidad · n nivel
   d duración · s sede (opcional) · on 1 si es el recorrido online de la Academia
   c contenidos disponibles (de la lista CF)
   ============================================================ */

const CRS = [
  { t: 'Fundamentos del café (online)', slug: 'fundamentos-online', m: 'Online autónomo', n: 'Principiante', d: '6 módulos interactivos', on: 1, c: ['Programa por unidades', 'Seguimiento de progreso'] },
  { t: 'Barista Profesional', slug: 'barista-profesional', m: 'Presencial', n: 'Desde cero', d: '2 meses', s: 'Santa Fe y Rosario', c: [] },
  { t: 'Curso Intensivo', slug: 'curso-intensivo', m: 'Presencial', n: 'Consultar en el sitio', d: '5 horas', s: 'Santa Fe', c: [] }
];
const CF = ['Objetivos', 'Programa por unidades', 'Videos', 'Material descargable', 'Evaluaciones', 'Seguimiento de progreso', 'Certificado'];
const COURSES_URL = 'https://academiadebaristas.com.ar/talleres-y-cursos/';

function cap() {
  if (S.cu < 0) return `<h2>Cursos y formación</h2><p class="m">Elegí cómo seguir formándote: un recorrido online a tu ritmo o capacitaciones presenciales con el equipo de la Academia.</p>
    <div class="course-list">${CRS.map(c => `<a class="course-card" href="#/capacitarse/${c.slug}"><span class="course-mode">${c.m}</span><strong>${c.t}</strong><span class="course-meta">${c.d}${c.s ? ' · ' + c.s : ''}</span><span class="card-link">Ver detalle </span></a>`).join('')}</div>`;
  const c = CRS[S.cu], pr = Math.round(doneCount() / SC.length * 100);
  return `<div class="k">${c.m}</div><h2>${c.t}</h2><p>Nivel: ${c.n} · Duración: ${c.d}${c.s ? ' · Sede: ' + c.s : ''}</p>` +
    (c.on
      ? `<div class="panel"><div class="k">Programa</div><div class="program-list">${SC.map((x, i) => `<button class="program-item" data-a="go" data-v="${i}"><span class="num">0${i + 1}</span><b>${x.t}</b></button>`).join('')}</div><div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pr}" aria-label="Progreso del recorrido"><i style="width:${pr}%"></i></div><p class="m">Progreso en este dispositivo: ${pr} %</p></div>`
      : `<div class="panel"><p>Los detalles de inscripción, fechas y cupos están en el sitio oficial. Los módulos de la Academia sirven como recurso digital complementario.</p><div class="bar"><a class="b p" href="${COURSES_URL}" target="_blank" rel="noopener">Ver fechas e inscripción ↗</a></div></div>`) +
    (c.on ? `<div class="panel"><div class="k">Qué incluye</div><ul class="feature-list">${CF.map(f => c.c.includes(f) ? `<li class="yes">${f}</li>` : `<li class="soon">${f} <span>próximamente</span></li>`).join('')}</ul></div>` : '');
}
