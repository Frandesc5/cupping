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

/* ---------- Progreso persistente (este navegador) ---------- */
let P = { max: 0 };
try { P = JSON.parse(localStorage.getItem('cl2')) || P } catch (e) {}
const sv = () => { try { localStorage.setItem('cl2', JSON.stringify(P)) } catch (e) {} };

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
  c: { q: '¿Qué se retira durante el despulpado?', o: ['La piel y la mayor parte de la pulpa', 'El pergamino', 'La película plateada'], a: 0, e: ['Correcto: el despulpado separa piel y pulpa; el mucílago queda en el grano.', 'El pergamino se retira después, en el trillado, sobre café seco.', 'La película plateada sigue pegada a la semilla.'] },
  p: { q: 'En el proceso natural, ¿cuándo se retiran las cubiertas?', o: ['Antes de secar', 'Una vez seco el fruto', 'Nunca'], a: 1, e: ['En natural el fruto se seca entero.', 'Correcto: se seca entero y después se trilla.', 'Sí se retiran, en el trillado, para obtener café verde.'] },
  d: { q: '¿Por qué se remueve el café durante el secado?', o: ['Para que seque parejo y reducir el riesgo de moho', 'Para lavarlo otra vez', 'Para que pierda más sabor'], a: 0, e: ['Correcto: la remoción ayuda a que todos los granos pierdan agua de forma pareja y evita zonas húmedas donde crece moho.', 'El lavado ya terminó antes del secado.', 'El objetivo es estabilizar el grano, no perder sabor; un mal secado sí puede dañarlo.'] },
  r: { q: '¿Qué le pasa al grano durante el tueste?', o: ['Solo cambia de color', 'Pierde humedad y masa, se expande y cambia su química', 'Gana peso'], a: 1, e: ['El color es solo lo visible: hay cambios físicos y químicos.', 'Correcto: varios procesos ocurren a la vez.', 'Al perder agua y compuestos, pierde masa.'] },
  s: { q: 'Un instrumento indica una bebida muy concentrada. ¿Garantiza que a todos les parezca intensa?', o: ['Sí, siempre', 'No: mide sólidos disueltos y la percepción varía', 'Solo si es lavado'], a: 1, e: ['La percepción no es una medida directa.', 'Correcto: el instrumento y la persona miden cosas distintas.', 'El proceso no cambia esa diferencia.'] }
};
/* Se responden en una ventana al avanzar de paso: ver quizDlgHTML() en js/academia/estaciones.js. */

/* ---------- Qué hacer ----------
   doIt('Tocá cada capa', '2 de 5') dibuja la instrucción del paso justo encima del control
   que hay que usar, con el avance opcional. Así la consigna y la acción quedan juntas. */
const doIt = (text, prog = '') => `<p class="do-it">${text}${prog ? ` <span class="do-it-n">· ${prog}</span>` : ''}</p>`;

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
document.addEventListener('input', e => { for (const fn of INPUTS) fn(e.target, e.target.dataset) });
/* Elementos SVG con role=button: Enter y espacio equivalen a un clic. */
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[role=button][data-a]')) {
    e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }
});


/* ---------- Aviso breve ----------
   toast('Texto')                       aviso simple (3,5 s)
   toast('Texto', 'Deshacer', fn)       aviso con un botón de acción (7 s).
   El foco pasa al botón (el elemento que se tocó ya no existe), y el aviso
   no se cierra mientras el botón tenga el foco o el puntero encima. */
function toast(m, label, fn) {
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
  arm(fn ? 7000 : 3500);
}
