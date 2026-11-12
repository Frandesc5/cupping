/* ============================================================
   .campus · núcleo
   Utilidades, estado global, progreso guardado, acciones y avisos.
   Todos los archivos de /js comparten este estado (S) y registran
   sus acciones con on() y sus controles deslizantes con onInput().
   ============================================================ */

const $ = s => document.querySelector(s);

/* Mezcla lineal entre una lista de colores hex (t de 0 a 1). */
const mix = (st, t) => {
  const x = t * (st.length - 1), i = Math.min(st.length - 2, Math.floor(x)), f = x - i,
    h = s => [1, 3, 5].map(k => parseInt(s.substr(k, 2), 16)), a = h(st[i]), b = h(st[i + 1]);
  return 'rgb(' + a.map((v, k) => Math.round(v + (b[k] - v) * f)).join() + ')';
};

/* Número con coma decimal, como se escribe en castellano: num(18.6) → "18,6". */
const num = (n, d = 1) => (+n).toFixed(d).replace('.', ',');

/* ---------- Progreso persistente (este navegador) ---------- */
let P = { max: 0 };
try { P = JSON.parse(localStorage.getItem('cl2')) || P } catch (e) {}
/* Si el navegador no deja guardar (modo privado, sin espacio), se avisa una sola vez por visita. */
let storeWarned = false;
function storeFailed() {
  if (storeWarned) return; storeWarned = true;
  setTimeout(() => toast('Este navegador no permite guardar tu avance. Podés seguir, pero se pierde al cerrar la pestaña.', null, null, 9000), 600);
}
const sv = () => { try { localStorage.setItem('cl2', JSON.stringify(P)); return true } catch (e) { storeFailed(); return false } };

/* ---------- Estado de la sesión ----------
   sp: espacio actual (home | ac | lb | de | ca)
   i:  vista de Academia (-1 menú, -2 glosario, -3 apuntes, 0..5 estaciones, 6 recorrido completo)
   Cada módulo agrega sus propias claves al cargarse. */
let S = {
  sp: 'home', i: -1, qa: {}, dn: {}, deep: {},
  lab: { d: 20, w: 240, t: 93, g: 3, clicks: 0, f: 4, n: 3, b: 2, e: 30, a: 1 }
};

/* ---------- Preguntas de control de cada estación ---------- */
const QA = {
  c: { q: '¿Qué parte del fruto es lo que después llamamos grano de café?', o: ['Las semillas', 'La pulpa', 'La piel'], a: 0, e: ['Correcto: las semillas son los granos. Son verdes hasta que se tuestan.', 'La pulpa es la parte carnosa que rodea las semillas; se saca durante el proceso.', 'La piel es la cubierta de afuera; también se saca.'] },
  p: { q: 'En el proceso natural, ¿cuándo se retiran las cubiertas?', o: ['Antes de secar', 'Una vez seco el fruto', 'Nunca'], a: 1, e: ['En natural el fruto se seca entero.', 'Correcto: se seca entero y después se trilla.', 'Sí se retiran, en el trillado, para obtener café verde.'] },
  d: { q: '¿Por qué se remueve el café durante el secado?', o: ['Para que seque parejo y reducir el riesgo de moho', 'Para lavarlo otra vez', 'Para que pierda más sabor'], a: 0, e: ['Correcto: la remoción ayuda a que todos los granos pierdan agua de forma pareja y evita zonas húmedas donde crece moho.', 'El lavado ya terminó antes del secado.', 'El objetivo es estabilizar el grano, no perder sabor; un mal secado sí puede dañarlo.'] },
  r: { q: '¿Qué le pasa al grano durante el tueste?', o: ['Solo cambia de color', 'Pierde humedad y masa, se expande y cambia su química', 'Gana peso'], a: 1, e: ['El color es solo lo visible: hay cambios físicos y químicos.', 'Correcto: varios procesos ocurren a la vez.', 'Al perder agua y compuestos, pierde masa.'] },
  s: { q: 'Un café tiene acidez 5 y amargor 1. ¿Qué te dice eso?', o: ['Que es un café malo', 'Que es muy ácido y poco amargo', 'Que tiene poca cafeína'], a: 1, e: ['El perfil describe, no califica. Un café muy ácido puede gustarte mucho o poco.', 'Correcto: el perfil describe cuánto se siente cada atributo, no si el café es bueno o malo.', 'El perfil habla de lo que sentís en la boca, no de la cafeína.'] }
};
/* Se responden en una ventana al avanzar de paso: ver quizDlgHTML() en js/academia/estaciones.js. */

/* ---------- Opción respondida ----------
   Además del color, la opción correcta y la elegida llevan ícono y texto,
   así no dependen solo del color: "✓ … correcta" / "✗ … tu respuesta". */
const optLabel = (text, isRight, isChosen, answered) => !answered || (!isRight && !isChosen) ? text
  : `<span class="opt-mark" aria-hidden="true">${isRight ? '✓' : '✗'}</span>${text}<span class="opt-tag">${isRight ? (isChosen ? 'correcta · tu respuesta' : 'correcta') : 'tu respuesta'}</span>`;

/* ---------- Qué hacer ----------
   doIt('Tocá cada capa', '2 de 5') dibuja la instrucción del paso justo encima del control
   que hay que usar, con el avance opcional. Así la consigna y la acción quedan juntas. */
const doIt = (text, prog = '') => `<p class="do-it">${text}${prog ? ` <span class="do-it-n">· ${prog}</span>` : ''}</p>`;

/* ---------- Llevar el visor a la vista (solo en el celu) ----------
   Al tocar los controles de un visualizado, la pantalla sube hasta dejarlo justo debajo
   del encabezado: así entran el gráfico, sus botones y la explicación que sigue.
   Si ya está en su lugar no se mueve, para que tocar varias veces no haga saltar la vista. */
function bringIntoView(sel) {
  if (!matchMedia('(max-width: 650px)').matches) return;
  const el = typeof sel === 'string' ? $(sel) : sel, hd = $('#hd'); if (!el) return;
  const top = el.getBoundingClientRect().top - (hd ? hd.offsetHeight : 0) - 8;
  if (Math.abs(top) < 12) return;
  window.scrollTo({ top: top + window.scrollY, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

/* Deslizadores: al soltarlos (no mientras se arrastran, para que la barra no se corra debajo
   del dedo), la vista sube hasta lo que muestran. id del deslizador → qué llevar a la vista. */
const SCROLL_ON_RELEASE = [
  [/^rt4$/, '.roast-stage'],          // Tueste · Curva: la curva y el grano
  [/^al$/, '.alt-stage'],             // Fruto · Altitud: la montaña y la zona
  [/^mp$/, '.mad-pick'],              // Fruto · Madurez: el fruto y los azúcares
  [/^gr5$/, '.grind-explorer'],       // Molienda: el gráfico y la lectura
  [/^w[123]$/, '.tds-stage']          // Medir: el gráfico y el resultado
  /* Filtrado y espresso no suben: tienen muchos deslizadores seguidos y hay que poder ajustarlos sin volver a bajar. */
];
document.addEventListener('change', e => {
  const id = e.target && e.target.id, hit = id && SCROLL_ON_RELEASE.find(([re]) => re.test(id));
  if (hit) bringIntoView(hit[1]);
});

/* ---------- Visor ‹ › (solo en el celu) ----------
   viewerNav('accion', i, n, 'Nombre', 'Etapa', vistos) dibuja: ‹  nombre · puntitos · "Etapa 2 de 5"  ›.
   Cada flecha dispara la acción con el índice de destino; en los extremos se apaga.
   viewerFocus(el, '.caja') después de redibujar: acomoda la vista y devuelve el foco a la flecha. */
const VIEWER_PATH = { prev: 'M15 5l-7 7 7 7', next: 'M9 5l7 7-7 7' };
/* then (opcional): qué hace › en la última opción, en lugar de apagarse.
   { act, v, name } → la flecha dispara esa acción y debajo se lee "Sigue: name". */
function viewerNav(act, i, n, name, unit, seen = [], then = null) {
  const arrow = (dir, j) => {
    const cont = dir === 'next' && j >= n && then;
    return `<button type="button" class="b viewer-arrow" data-a="${cont ? then.act : act}" data-v="${cont ? then.v : j}" data-dir="${dir}" aria-label="${cont ? 'Seguir con ' + then.name : unit + ' ' + (dir === 'prev' ? 'anterior' : 'siguiente')}" ${!cont && (j < 0 || j >= n) ? 'disabled' : ''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${VIEWER_PATH[dir]}"/></svg></button>`;
  };
  return `<div class="viewer-nav">${arrow('prev', i - 1)}<div class="viewer-now" aria-live="polite"><span>${name}</span><div class="dots" aria-hidden="true">${Array.from({ length: n }, (_, j) => `<i class="${seen.includes(j) ? 's' : ''} ${j === i ? 'c' : ''}"></i>`).join('')}</div>${i >= 0 ? `<small>${unit} ${i + 1} de ${n}</small>` : ''}${then && i === n - 1 ? `<small class="viewer-then">Sigue: ${then.name}</small>` : ''}</div>${arrow('next', i + 1)}</div>`;
}
function viewerFocus(el, box) {
  bringIntoView(box);
  const dir = el && el.dataset.dir; if (!dir) return;
  const q = d => $(`${box} [data-dir=${d}]`), b = q(dir), t = b && !b.disabled ? b : q(dir === 'next' ? 'prev' : 'next');
  if (t) t.focus({ preventScroll: true });
}

/* ---------- Profundizá ----------
   Cada paso muestra primero lo esencial; el resto queda plegado acá.
   deeper('clave', 'De qué trata', html) · la clave recuerda si quedó abierto
   aunque la pantalla se vuelva a dibujar. */
const deeper = (id, title, html) => `<details class="deeper" data-deeper="${id}" ${S.deep[id] ? 'open' : ''}><summary><span><b>Profundizá:</b> ${title}</span></summary><div class="deeper-body">${html}</div></details>`;
document.addEventListener('toggle', e => { const d = e.target; if (d.dataset && d.dataset.deeper) S.deep[d.dataset.deeper] = d.open }, true);

/* ---------- Acciones (data-a) y controles (input) ----------
   on({nombre: (valor, elemento) => ...}) registra acciones de clic.
   onInput(fn) registra un manejador para cualquier <input>. */
const ACTIONS = {}, INPUTS = [];
const on = map => Object.assign(ACTIONS, map);
const onInput = fn => INPUTS.push(fn);
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.a];
  if (!fn) return;
  /* Un enlace con acción abierto con Ctrl/Cmd/Shift o clic del medio sigue siendo un enlace normal (nueva pestaña). */
  if (el.tagName === 'A') { if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; e.preventDefault() }
  fn(el.dataset.v, el, e);
});
/* Al mover un deslizador, los textos de arriba (resultado, etiquetas) pueden cambiar de alto y empujar
   la página. Se mide dónde estaba el deslizador antes de actualizar y se corrige el desplazamiento,
   así queda quieto bajo el dedo o el mouse. */
document.addEventListener('input', e => {
  const t = e.target, range = t.type === 'range' && t.isConnected;
  const top = range ? t.getBoundingClientRect().top : 0;
  for (const fn of INPUTS) fn(t, t.dataset);
  if (range && t.isConnected) { const d = t.getBoundingClientRect().top - top; if (Math.abs(d) >= 1) window.scrollBy(0, d) }
});
/* Elementos SVG con role=button: Enter y espacio equivalen a un clic. */
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[role=button][data-a]')) {
    e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }
});


/* ---------- Aviso breve ----------
   toast('Texto')                       aviso simple (3,5 s)
   toast('Texto', 'Deshacer', fn)       aviso con un botón de acción (7 s).
   toast('Texto', null, null, 9000)     aviso simple con otra duración.
   El foco pasa al botón (el elemento que se tocó ya no existe), y el aviso
   no se cierra mientras el botón tenga el foco o el puntero encima. */
function toast(m, label, fn, ms) {
  const t = $('#tt');
  const hide = () => { t.classList.remove('show'); clearTimeout(toast.h); toast.h = setTimeout(() => { t.classList.remove('has-action'); t.textContent = '' }, 350) };
  const arm = ms => { clearTimeout(toast.t); toast.t = setTimeout(hide, ms) };
  clearTimeout(toast.h);
  t.textContent = m;
  t.classList.toggle('has-action', !!fn);
  if (fn) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = label;
    b.onclick = () => { clearTimeout(toast.t); hide(); fn() };
    b.onfocus = b.onmouseenter = () => clearTimeout(toast.t);
    b.onblur = b.onmouseleave = () => arm(3000);
    t.append(' ', b);
    t.classList.add('show');
    b.focus({ preventScroll: true });
  } else t.classList.add('show');
  arm(ms || (fn ? 7000 : 3500));
}
