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
  sp: 'home', i: -1, qa: {}, dn: {},
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
const ask = id => {
  const z = QA[id], p = S.qa[id], d = p != null;
  return `<div class="panel quiz"><div class="k">Desafío</div><h3>${z.q}</h3>${z.o.map((o, i) => `<button class="opt ${d ? (i === z.a ? 'ok' : i === p ? 'no' : '') : ''}" data-a="ans" data-v="${id}:${i}" ${d ? 'disabled' : ''}>${o}</button>`).join('')}${d ? `<p><b>${p === z.a ? '' : 'Revisemos. '}</b>${z.e[p]}</p>` : ''}</div>`;
};

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
  if (fn) { if (el.tagName === 'A') e.preventDefault(); fn(el.dataset.v, el, e); }
});
document.addEventListener('input', e => { for (const fn of INPUTS) fn(e.target, e.target.dataset) });
/* Elementos SVG con role=button: Enter y espacio equivalen a un clic. */
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[role=button][data-a]')) {
    e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }
});

on({ ans: v => { const [id, i] = v.split(':'); S.qa[id] = +i; R(0) } });

/* ---------- Aviso breve ---------- */
function toast(m) {
  const t = $('#tt'); t.textContent = m; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 1900);
}
