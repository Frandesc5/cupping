/* ============================================================
   .campus · estructura general
   Encabezado, navegación, migas de pan, portada y rutas.

   Cada pantalla tiene su propia dirección (#/...), así funcionan el
   botón "atrás" del navegador, recargar la página y compartir enlaces:
     #/                                 Inicio
     #/academia                         Mapa de módulos
     #/academia/<estación>              fruto, poscosecha, cafe-verde, tueste, preparacion, sensorial
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
const SPACES = [['ac', 'Academia', 'academia'], ['lb', 'Laboratorio', 'laboratorio'], ['de', 'Desafíos', 'desafios'], ['ca', 'Capacitarse', 'capacitarse']];

const SPACE_ICONS = { ac: '◉', lb: '⌁', de: '◇', ca: '▤' };

/* ---------- Rutas ---------- */
function applyPath(path) {
  const [a, b] = path.split('/').filter(Boolean).map(decodeURIComponent);
  if (!a) { S.sp = 'home'; return true }
  if (a === 'academia') {
    S.sp = 'ac';
    if (!b) { S.i = -1; return true }
    if (b === 'glosario') { S.i = -2; return true }
    if (b === 'apuntes') { S.i = -3; return true }
    if (b === 'recorrido-completo') { enterStation(SC.length); return true }
    const k = SC.findIndex(s => s.slug === b);
    if (k >= 0) { enterStation(k); return true }
    return false;
  }
  if (a === 'laboratorio') {
    S.sp = 'lb';
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
  R(y ? 0 : undefined);
  if (y) window.scrollTo(0, y);
  if (showRoute.booted) focusHeading();
  showRoute.booted = true;
  const v = $('#v'); v.classList.remove('enter'); void v.offsetWidth; v.classList.add('enter');
  clearTimeout(showRoute.t); showRoute.t = setTimeout(() => v.classList.remove('enter'), 900);
}
/* Al cambiar de pantalla, el foco va al título: así el teclado y los lectores
   de pantalla empiezan a leer la pantalla nueva y no quedan en un botón que ya no existe. */
function focusHeading() {
  const h = $('#v h1, #v h2');
  if (!h) return;
  h.setAttribute('tabindex', '-1');
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
  $('#hd').innerHTML = `<a class="brand" href="#/" aria-label="Ir al inicio de .campus"><img src="${LOGO}" alt="Academia de Baristas" width="436" height="405"><span class="brand-caption"><span>Formación en café</span><b>.campus</b></span></a><nav class="main-nav" aria-label="Espacios del campus">${navLinks()}</nav>`;
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
  else if (S.sp === 'ca') { c.push(['/capacitarse', 'Capacitarse']); if (S.cu >= 0) c.push([0, CRS[S.cu].t]) }
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

/* ---------- Portada ---------- */
/* Próximo paso sugerido: empezar, continuar o pasar a Desafíos. */
function nextStep() {
  const done = SC.filter((_, i) => doneSt(i)).length;
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
    ['capacitarse', 'Capacitarse', 'Cursos y experiencias de formación.', '04', '↗']
  ];
  return `<section class="home-hero">
  <div class="hero-copy">
    <div class="hero-eyebrow"><span>ACADEMIA DE BARISTAS</span><i></i><span>PLATAFORMA DE APRENDIZAJE</span></div>
    <div class="k">FORMACIÓN EN CAFÉ DE ESPECIALIDAD</div>
    <h1>Aprendé.<br><em>Experimentá.</em><br>Crecé.</h1>
    <p>Un espacio para incorporar conocimientos, desarrollar criterio, practicar y construir tu recorrido profesional en el café.</p>
    <div class="action-row"><a class="b p" href="#/academia">Entrar a la Academia →</a><a class="b" href="#/capacitarse">Ver capacitaciones</a></div>
    <div class="hero-signature">TEORÍA <span>+</span> PRÁCTICA <span>+</span> ACOMPAÑAMIENTO</div>
  </div>
  <figure class="hero-photo-wrap"><img class="hero-photo" src="${HERO_PHOTO}" alt="Equipo de Academia de Baristas"><figcaption class="photo-note"><b>APASIONADOS EN LA MATERIA.</b><span>Aprender café también es compartirlo.</span></figcaption><div class="photo-index">.CAMPUS</div></figure>
  <div class="hero-footer"><span>.CAMPUS · ACADEMIA DE BARISTAS</span><span>CAFÉ DE ESPECIALIDAD · FORMACIÓN CONTINUA</span></div>
</section>
${nextStep()}
<div class="section-intro"><div><div class="k">01 / .CAMPUS</div><h2>Un recorrido.<br>Cuatro espacios.</h2></div><p class="m">Aprendé conceptos, explorá herramientas, experimentá con variables, consultá tus registros, resolvé situaciones y seguí capacitándote.</p></div>
<div class="section-grid">${cards.map(c => `<a class="section-card" href="#/${c[0]}"><span class="card-top"><span class="section-icon" aria-hidden="true">${c[4]}</span><span class="card-number">${c[3]} / 04</span></span><span><strong>${c[1]}</strong><small>${c[2]}</small><span class="card-link">EXPLORAR <b>→</b></span></span></a>`).join('')}</div>
<div class="learning-banner"><div class="learning-mark" aria-hidden="true">AB<span>.</span></div><div><div class="k">APRENDER HACIENDO</div><h3>La teoría cobra sentido<br>cuando pasa por tus manos.</h3><p>Un campus para acompañar tu formación y conectar el conocimiento con la práctica.</p></div><a class="b" href="#/capacitarse">Conocé las capacitaciones →</a></div>`;
}

function siteFooter() {
  return `<footer class="site-foot"><img src="${LOGO}" alt="Academia de Baristas" width="436" height="405"><span>UN CAMPUS PARA SEGUIR CRECIENDO.</span><a href="${SITE}" target="_blank" rel="noopener">academiadebaristas.com.ar ↗</a></footer>`;
}

/* ---------- Dibujar la pantalla actual ----------
   R()  : pantalla nueva (sube al principio).
   R(0) : misma pantalla actualizada (mantiene la posición). */
function R(top) {
  renderChrome();
  document.body.dataset.space = S.sp;
  document.title = pageTitle();
  const v = $('#v');
  if (S.sp === 'home') v.innerHTML = campusHome() + siteFooter();
  else v.innerHTML = crumbs() + ({ ac: academiaView, lb: lab, de: des, ca: cap })[S.sp]() + siteFooter();
  if (S.sp === 'ac') academiaAfter();
  else if (S.sp === 'lb') labAfter();
  if (top !== 0) window.scrollTo(0, 0);
}

/* Inicio */
showRoute(true);
