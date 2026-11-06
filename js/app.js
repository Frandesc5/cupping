/* ============================================================
   .campus · estructura general
   Encabezado, navegación, migas de pan, portada y rutas.

   Cada pantalla tiene su propia dirección (#/...), así funcionan el
   botón "atrás" del navegador, recargar la página y compartir enlaces:
     #/                                 Inicio
     #/academia                         Mapa de módulos
     #/academia/<estación>/<paso>       fruto/especies, tueste/curva... (ver SC en js/academia/estaciones.js)
     #/academia/recorrido-completo
     #/academia/glosario  ·  #/academia/apuntes
     #/laboratorio/<herramienta>        filtrado, espresso, agua, molienda, tds
     #/laboratorio/nuevo-registro  ·  #/laboratorio/bitacora
     #/desafios
     #/capacitarse  ·  #/capacitarse/<curso>
   ============================================================ */

const LOGO = 'https://academiadebaristas.com.ar/wp-content/uploads/2024/11/Acade_logo-blanco01.png';
const HERO_PHOTO = 'https://academiadebaristas.com.ar/wp-content/uploads/2026/05/Sin-titulo-2-1.webp';
const SITE = 'https://academiadebaristas.com.ar/';

/* Los cuatro espacios del campus: [clave, nombre, dirección] */
const SPACES = [['ac', 'Academia', 'academia'], ['lb', 'Laboratorio', 'laboratorio'], ['de', 'Desafíos', 'desafios'], ['ca', 'Cursos', 'capacitarse']];

const SPACE_ICONS = { ac: '◉', lb: '⌁', de: '◇', ca: '▤' };

/* ---------- Rutas ---------- */
function applyPath(path) {
  const [a, b, c] = path.split('/').filter(Boolean).map(decodeURIComponent);
  if (!a) { S.sp = 'home'; return true }
  if (a === 'academia') {
    S.sp = 'ac';
    if (!b) { S.i = -1; return true }
    if (b === 'glosario') { S.i = -2; return true }
    if (b === 'apuntes') { S.i = -3; return true }
    if (b === 'recorrido-completo') { enterStation(SC.length); return true }
    const k = SC.findIndex(s => s.slug === b);
    if (k >= 0) { enterStation(k, c); return true }
    return false;
  }
  if (a === 'laboratorio') {
    S.sp = 'lb';
    if (b !== 'nuevo-registro') S.be = '';
    if (!b) { S.workMode = 'experiment'; return true }
    if (b === 'nuevo-registro') { S.workMode = 'record'; return true }
    if (b === 'bitacora') { S.workMode = 'history'; return true }
    const k = Object.keys(LAB_SLUG).find(x => LAB_SLUG[x] === b);
    if (k) { S.workMode = 'experiment'; S.lb = k; return true }
    return false;
  }
  if (a === 'desafios') { S.sp = 'de'; return true }
  if (a === 'capacitarse') {
    S.sp = 'ca';
    if (!b) { S.cu = -1; return true }
    const k = CRS.findIndex(c => c.slug === b);
    if (k >= 0) { S.cu = k; return true }
    return false;
  }
  return false;
}

const hashPath = () => (location.hash.replace(/^#/, '') || '/');
let shownPath = null;

/* Navegar a una pantalla nueva (crea una entrada en el historial). */
function routeTo(path) {
  if (path === hashPath()) { R(); return }
  try { history.replaceState({ ...(history.state || {}), y: window.scrollY }, '') } catch (e) {}
  history.pushState({ y: 0 }, '', '#' + path);
  showRoute(false);
}
/* Mostrar la pantalla de la dirección actual. restore: volver a la posición de lectura. */
function showRoute(restore) {
  const path = hashPath();
  if (!applyPath(path)) { history.replaceState(null, '', '#/'); applyPath('/') }
  shownPath = hashPath();
  const y = restore && history.state && history.state.y;
  /* Cambio dentro de la misma página (otra herramienta del laboratorio, otro término):
     se mantiene la posición y el foco vuelve al mismo control. */
  const page = pageKey(), samePage = showRoute.booted && page === showRoute.page;
  const a = document.activeElement, ctl = samePage && a && a.dataset && a.dataset.a ? [a.dataset.a, a.dataset.v] : null;
  R(y || samePage ? 0 : undefined);
  if (y) window.scrollTo(0, y);
  if (ctl) { const el = [...document.querySelectorAll('#v [data-a]')].find(e => e.dataset.a === ctl[0] && e.dataset.v === ctl[1]); if (el) el.focus({ preventScroll: true }) }
  else if (showRoute.booted && !samePage) focusHeading();
  showRoute.booted = true; showRoute.page = page;
  const v = $('#v'); v.classList.remove('enter'); void v.offsetWidth; v.classList.add('enter');
  clearTimeout(showRoute.t); showRoute.t = setTimeout(() => v.classList.remove('enter'), 900);
}
/* Al cambiar de pantalla, el foco va al título: así el teclado y los lectores
   de pantalla empiezan a leer la pantalla nueva y no quedan en un botón que ya no existe. */
/* Identifica la página sin contar cambios internos (herramienta del laboratorio, término abierto). */
const pageKey = () => S.sp + '|' + (S.sp === 'ac' ? S.i : S.sp === 'lb' ? (S.workMode === 'experiment' ? 'x' : S.workMode) : S.sp === 'ca' ? S.cu : '');
function focusHeading() {
  /* Si la pantalla abre un término o apunte puntual, el foco va ahí; si no, al título. */
  const h = $('#v .glossary-entry[open] summary') || $('#v .theory-card.open button') || $('#v h1, #v h2');
  if (!h) return;
  if (h.matches('h1, h2')) h.setAttribute('tabindex', '-1');
  try { h.focus({ preventScroll: true }) } catch (e) { h.focus() }
}
window.addEventListener('popstate', () => showRoute(true));
window.addEventListener('hashchange', () => { if (hashPath() !== shownPath) showRoute(false) });
/* Los enlaces internos (href="#/...") usan el mismo mecanismo. */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#/"]');
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault(); routeTo(a.getAttribute('href').slice(1));
});
history.scrollRestoration = 'manual';

/* ---------- Encabezado y navegación ---------- */
function navLinks(withHome) {
  return (withHome ? `<a href="#/" ${S.sp === 'home' ? 'aria-current="page"' : ''}><span class="nb-ico" aria-hidden="true">⌂</span>Inicio</a>` : '') +
    SPACES.map(([k, name, slug]) => `<a href="#/${slug}" ${S.sp === k ? 'aria-current="page"' : ''}>${withHome ? `<span class="nb-ico" aria-hidden="true">${SPACE_ICONS[k]}</span>` : ''}${name}</a>`).join('');
}
function renderChrome() {
  $('#hd').innerHTML = `<a class="brand" href="#/" aria-label="Ir al inicio de .campus"><img src="${LOGO}" alt="Academia de Baristas" width="436" height="405"><span class="brand-caption"><span>Formación en café</span><b translate="no">.campus</b></span></a><nav class="main-nav" aria-label="Espacios del campus">${navLinks()}</nav>`;
  $('#nb').innerHTML = navLinks(true);
}

/* Migas de pan: dónde estás y cómo subir un nivel. */
function crumbTrail() {
  const c = [['/', 'Inicio']];
  if (S.sp === 'ac') {
    c.push(['/academia', 'Academia']);
    if (S.i === -2) c.push([0, 'Glosario']);
    else if (S.i === -3) c.push([0, 'Apuntes']);
    else if (S.i >= 0 && S.i < SC.length) c.push([0, SC[S.i].t]);
    else if (S.i >= SC.length) c.push([0, 'Recorrido completo']);
  } else if (S.sp === 'lb') {
    c.push(['/laboratorio', 'Laboratorio']);
    c.push([0, S.workMode === 'record' ? 'Nuevo registro' : S.workMode === 'history' ? 'Mi bitácora' : LB.find(t => t[0] === S.lb)[1]]);
  } else if (S.sp === 'de') c.push(['/desafios', 'Desafíos']);
  else if (S.sp === 'ca') { c.push(['/capacitarse', 'Cursos']); if (S.cu >= 0) c.push([0, CRS[S.cu].t]) }
  c[c.length - 1][0] = 0;  // el último es la página actual
  return c;
}
function crumbs() {
  const c = crumbTrail();
  return `<nav class="crumbs" aria-label="Estás en"><ol>${c.map(([p, t]) => p ? `<li><a href="#${p}">${t}</a></li>` : `<li aria-current="page">${t}</li>`).join('')}</ol></nav>`;
}
function pageTitle() {
  if (S.sp === 'home') return '.campus · Academia de Baristas';
  return crumbTrail().slice(1).map(x => x[1]).reverse().join(' · ') + ' · .campus';
}

/* La portada (nueva o personal) está en js/portada.js. */
function siteFooter() {
  return `<footer class="site-foot"><img src="${LOGO}" alt="Academia de Baristas" width="436" height="405"><span>Un campus para seguir creciendo.</span><a href="${SITE}" target="_blank" rel="noopener">academiadebaristas.com.ar ↗</a></footer>`;
}

/* ---------- Dibujar la pantalla actual ----------
   R()  : pantalla nueva (sube al principio).
   R(0) : misma pantalla actualizada (mantiene la posición). */
function R(top) {
  renderChrome();
  document.body.dataset.space = S.sp;
  document.title = pageTitle();
  const v = $('#v');
  if (S.sp === 'home') v.innerHTML = homeView() + siteFooter();
  else v.innerHTML = crumbs() + ({ ac: academiaView, lb: lab, de: des, ca: cap })[S.sp]() + siteFooter();
  if (S.sp === 'ac') academiaAfter();
  else if (S.sp === 'lb') labAfter();
  if (top !== 0) window.scrollTo(0, 0);
}

/* Inicio */
showRoute(true);
