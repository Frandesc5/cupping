/* ============================================================
   Academia · mapa isométrico de la planta a la taza
   Cada estación es una isla flotante con su lugar construido encima
   (finca, beneficio, puerto, tostadora, barra, mesa de cata), unidas por
   un camino de baldosas. Las insignias se tocan y abren una ficha con
   los pasos y el botón para seguir. Todo es SVG dibujado con código.
   Usa SC, stDone, startedSt, curStep, stepIdx, stepDone y stepPath
   (js/academia/estaciones.js) al dibujar; por eso se puede cargar antes.
   ============================================================ */

/* ---------- Proyección isométrica ----------
   Un punto del mundo (x, y, z) se dibuja a partir de un origen (ox, oy):
   x va hacia abajo a la derecha, y hacia abajo a la izquierda, z hacia arriba. */
const ISO_C = Math.cos(Math.PI / 6);
const isoP = (o, x, y, z) => [o[0] + (x - y) * ISO_C, o[1] + (x + y) * .5 - z];
const isoPoly = (pts, fill) => `<polygon points="${pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')}" fill="${fill}" stroke="rgba(40,30,20,.18)" stroke-width=".8" stroke-linejoin="round"/>`;
const isoShade = (hex, f) => { const n = parseInt(hex.slice(1), 16); return '#' + [n >> 16, n >> 8 & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(v * f))).toString(16).padStart(2, '0')).join('') };

/* Caja: arriba en su color; los costados más oscuros (luz desde arriba a la izquierda). */
function isoBox(o, x, y, z, w, d, h, col, top) {
  return isoPoly([isoP(o, x + w, y, z), isoP(o, x + w, y + d, z), isoP(o, x + w, y + d, z + h), isoP(o, x + w, y, z + h)], isoShade(col, .86))
    + isoPoly([isoP(o, x, y + d, z), isoP(o, x + w, y + d, z), isoP(o, x + w, y + d, z + h), isoP(o, x, y + d, z + h)], isoShade(col, .72))
    + isoPoly([isoP(o, x, y, z + h), isoP(o, x + w, y, z + h), isoP(o, x + w, y + d, z + h), isoP(o, x, y + d, z + h)], top || col);
}
/* Techo a dos aguas, cumbrera a lo largo de x. */
const isoRoof = (o, x, y, z, w, d, rh, col) => isoPoly([isoP(o, x + w, y, z), isoP(o, x + w, y + d, z), isoP(o, x + w, y + d / 2, z + rh)], isoShade(col, .8))
  + isoPoly([isoP(o, x, y + d, z), isoP(o, x + w, y + d, z), isoP(o, x + w, y + d / 2, z + rh), isoP(o, x, y + d / 2, z + rh)], col);
/* Montaña: pirámide con dos caras visibles y, si se pide, nieve en la punta. */
function isoMount(o, x, y, w, d, h, col, snow) {
  const a = isoP(o, x + w / 2, y + d / 2, h), r = isoP(o, x + w, y, 0), f = isoP(o, x + w, y + d, 0), l = isoP(o, x, y + d, 0);
  let s = isoPoly([r, f, a], isoShade(col, .84)) + isoPoly([l, f, a], isoShade(col, .7));
  if (snow) { const m = q => [a[0] + (q[0] - a[0]) * .28, a[1] + (q[1] - a[1]) * .28]; s += isoPoly([a, m(r), m(f), m(l)], '#fbfbf8') }
  return s;
}
/* Cilindro: tanques y tazas. */
function isoCyl(o, x, y, z, r, h, col, top) {
  const b = isoP(o, x, y, z), t = isoP(o, x, y, z + h), rx = r * 1.2247, ry = r * .7071;
  return `<ellipse cx="${b[0]}" cy="${b[1]}" rx="${rx}" ry="${ry}" fill="${isoShade(col, .72)}"/><rect x="${b[0] - rx}" y="${t[1]}" width="${rx * 2}" height="${b[1] - t[1]}" fill="${isoShade(col, .82)}"/><ellipse cx="${t[0]}" cy="${t[1]}" rx="${rx}" ry="${ry}" fill="${top || col}" stroke="rgba(40,30,20,.18)" stroke-width=".8"/>`;
}
/* Árbol o planta de café (con cerezas). */
function isoTree(o, x, y, s, col = '#7f9a6c', berries) {
  const b = isoP(o, x, y, 0), c = [b[0], b[1] - 12 * s];
  return `<rect x="${b[0] - 1.5 * s}" y="${b[1] - 8 * s}" width="${3 * s}" height="${8 * s}" fill="#7a5a40"/><circle cx="${c[0]}" cy="${c[1]}" r="${8 * s}" fill="${isoShade(col, .85)}"/><circle cx="${c[0] - 2 * s}" cy="${c[1] - 2 * s}" r="${6 * s}" fill="${col}"/>`
    + (berries ? `<circle cx="${c[0] + 3 * s}" cy="${c[1] + s}" r="${1.6 * s}" fill="#c0503d"/><circle cx="${c[0] - 3 * s}" cy="${c[1] + 3 * s}" r="${1.6 * s}" fill="#c0503d"/><circle cx="${c[0] + s}" cy="${c[1] - 4 * s}" r="${1.4 * s}" fill="#d97a4e"/>` : '');
}
const isoSack = (o, x, y) => { const b = isoP(o, x, y, 0); return `<path d="M${b[0] - 7} ${b[1]}q-1-12 2-13h10q3 1 2 13z" fill="#c9ad7c" stroke="#9c8358" stroke-width="1"/><path d="M${b[0] - 4} ${b[1] - 9}h8" stroke="#9c8358" stroke-width="1"/>` };
const isoAt = (o, x, y, z, fn) => { const p = isoP(o, x, y, z); return fn(p[0], p[1]) };

/* ---------- Lugares de cada estación ---------- */
const MAP_W = 400, MAP_IW = 118, MAP_ID = 118, MAP_IH = 30, MAP_GAP = 262, MAP_TOP = 60;
const MAP_H = MAP_TOP + 5 * MAP_GAP + 230;
const MAP_PLACES = [
  { place: 'La finca', top: '#a7c48a', col: '#8c6b4a', ic: '<path d="M12 21V11"/><path d="M12 13c-5 0-7-4-7-8 4 0 7 3 7 8zM12 11c4 0 6-3 6-7-4 0-6 3-6 7z"/>',
    land: o => isoMount(o, 4, 4, 62, 54, 70, '#8fae74', true) + isoMount(o, 50, 2, 50, 46, 48, '#9db886') + [[74, 64], [92, 66], [74, 84], [92, 86], [74, 104], [92, 104], [56, 98]].map(([x, y]) => isoTree(o, x, y, .9, '#6f8a5e', true)).join('') + isoTree(o, 20, 96, 1.2) },
  { place: 'El beneficio', top: '#ead9b2', col: '#a07c58', ic: '<circle cx="17" cy="6" r="3"/><path d="M3 15h16M5 15v5M17 15v5"/><path d="M4 13c2-2 4-2 6 0s4 2 6 0"/>',
    land: o => [16, 46].map(y => isoBox(o, 12, y, 10, 40, 18, 3, '#8a6748') + isoBox(o, 14, y + 2, 0, 3, 3, 10, '#8a6748') + isoBox(o, 48, y + 2, 0, 3, 3, 10, '#8a6748') + isoBox(o, 12, y, 13, 40, 18, 1.5, '#d8c9a0', '#e3d6b0')).join('')
      + isoCyl(o, 86, 24, 0, 11, 26, '#c6d1d6', '#dfe7ea') + isoCyl(o, 92, 52, 0, 9, 20, '#c6d1d6', '#dfe7ea') + isoTree(o, 92, 92, 1.1) + `<g class="map-float">${isoAt(o, 20, 10, 92, (x, y) => `<circle cx="${x}" cy="${y}" r="11" fill="#f0d27e"/>`)}</g>` },
  { place: 'El puerto', top: '#dcd6c8', col: '#8f8a7c', ic: '<path d="M3 20V9l9-5 9 5v11"/><path d="M8 20v-5h8v5"/>',
    land: o => isoBox(o, 10, 10, 0, 64, 52, 34, '#d8cfbf', '#e6dfd1') + isoRoof(o, 10, 10, 34, 64, 52, 20, '#9a7c62') + isoBox(o, 72, 30, 0, 1, 18, 22, '#7a6a55') + [[84, 74], [96, 70], [90, 84], [30, 90], [42, 92]].map(([x, y]) => isoSack(o, x, y)).join('')
      + `<g class="map-boat">${isoAt(o, MAP_IW + 4, 20, -6, (x, y) => `<path d="M${x + 6} ${y + 4}h52l-8 12h-38z" fill="#5c625a"/><rect x="${x + 14}" y="${y - 8}" width="12" height="12" fill="#c0503d"/><rect x="${x + 27}" y="${y - 8}" width="12" height="12" fill="#6f8a5e"/><rect x="${x + 40}" y="${y - 8}" width="12" height="12" fill="#c9ad7c"/>`)}</g>` },
  { place: 'La tostadora', top: '#e6d3bc', col: '#94705a', ic: '<ellipse cx="12" cy="12" rx="5" ry="8" transform="rotate(20 12 12)"/><path d="M10 5c3 5 3 9 0 14"/>',
    land: o => isoBox(o, 14, 16, 0, 66, 54, 38, '#cdb79c', '#dccab1') + isoRoof(o, 14, 16, 38, 66, 54, 22, '#8a5f43') + isoBox(o, 60, 22, 46, 10, 10, 34, '#7a5a40') + isoBox(o, 80, 40, 0, 1, 16, 24, '#6e4a33')
      + `<g class="map-smoke">${isoAt(o, 65, 27, 92, (x, y) => `<circle cx="${x}" cy="${y}" r="7" fill="#e3dfd7"/><circle cx="${x + 6}" cy="${y - 12}" r="9" fill="#ebe7e0"/>`)}</g>` + isoTree(o, 20, 92, 1.1) + isoTree(o, 96, 96, .9, '#6f8a5e') },
  { place: 'La barra', top: '#dde2d8', col: '#8b9187', ic: '<path d="M5 4h14l-5 8h-4z"/><path d="M7 15h10v5H7z"/>',
    land: o => isoBox(o, 12, 14, 0, 74, 56, 40, '#f3eee2', '#faf7ef') + isoBox(o, 12, 70, 34, 74, 14, 3, '#263b2a') + isoBox(o, 86, 30, 0, 1, 30, 26, '#8db8c7') + isoBox(o, 40, 70, 0, 26, 1, 22, '#8db8c7') + isoBox(o, 52, 86, 0, 30, 10, 12, '#8a6748', '#a07c58') + isoTree(o, 100, 96, 1) },
  { place: 'La mesa de cata', top: '#f0e4d1', col: '#a88a68', ic: '<path d="M4 10h13v4a6 6 0 0 1-13 0z"/><path d="M17 11h2a2 2 0 0 1 0 4h-2"/><path d="M8 7c-1-1 1-2 0-3M12 7c-1-1 1-2 0-3"/>',
    land: o => isoBox(o, 18, 26, 14, 76, 50, 4, '#8a6748', '#a07c58') + [[22, 30], [86, 30], [22, 70], [86, 70]].map(([x, y]) => isoBox(o, x, y, 0, 4, 4, 14, '#7a5a40')).join('') + [[30, 36], [50, 36], [70, 36], [30, 60], [50, 60], [70, 60]].map(([x, y]) => isoCyl(o, x, y, 18, 6, 7, '#ffffff', '#68402a')).join('') + isoTree(o, 100, 100, 1) }
];
const mapOrigin = i => [i % 2 ? 268 : 132, MAP_TOP + i * MAP_GAP];
const mapFront = i => isoP(mapOrigin(i), MAP_IW / 2, MAP_ID, 0);

/* ---------- Mundo ---------- */
function mapScene() {
  let s = [[70, 40, 1], [320, 300, .8], [60, 600, .7], [330, 900, .9], [80, 1250, .7]].map(([x, y, k]) => `<g opacity=".8" transform="translate(${x} ${y}) scale(${k})" fill="#fff"><ellipse rx="26" ry="9"/><ellipse cx="-12" cy="-5" rx="13" ry="9"/><ellipse cx="12" cy="-7" rx="15" ry="11"/></g>`).join('');
  /* Camino de baldosas (detrás de las islas); verde en lo ya recorrido. */
  for (let i = 0; i < SC.length - 1; i++) {
    const a = mapFront(i), b = isoP(mapOrigin(i + 1), MAP_IW / 2, 0, 0), done = stDone(i), n = 7;
    const [top, left, right] = done ? ['#a9bf98', '#7f9670', '#8faa7e'] : ['#e8d9b8', '#c2ad87', '#d4c09a'];
    for (let k = 1; k < n; k++) {
      const t = k / n, cx = a[0] + (b[0] - a[0]) * t, cy = a[1] + (b[1] - a[1]) * t + 6, w = 15, h = 8;
      s += isoPoly([[cx, cy - h], [cx + w, cy], [cx, cy + h], [cx - w, cy]], top) + isoPoly([[cx - w, cy], [cx, cy + h], [cx, cy + h + 5], [cx - w, cy + 5]], left) + isoPoly([[cx, cy + h], [cx + w, cy], [cx + w, cy + 5], [cx, cy + h + 5]], right);
    }
  }
  /* Islas con su lugar */
  MAP_PLACES.forEach((m, i) => {
    const o = mapOrigin(i), sh = isoP(o, MAP_IW / 2, MAP_ID / 2, -MAP_IH - 30);
    s += `<ellipse cx="${sh[0]}" cy="${sh[1] + 40}" rx="70" ry="14" fill="#000" opacity=".06"/>` + isoBox(o, 0, 0, -MAP_IH, MAP_IW, MAP_ID, MAP_IH, m.col, m.top) + m.land(o);
  });
  return `<svg class="map-scene" viewBox="0 0 ${MAP_W} ${MAP_H}" aria-hidden="true">${s}</svg>`;
}
/* Mapa con las insignias tocables. cur: estación actual (o -1 si el recorrido está completo). */
function mapWorld(cur) {
  const pos = i => { const f = mapFront(i); return `left:${(f[0] / MAP_W * 100).toFixed(2)}%;top:${((f[1] + 10) / MAP_H * 100).toFixed(2)}%` };
  const nodes = SC.map((c, i) => {
    const ok = stDone(i), here = i === cur;
    return `<button type="button" class="map-node ${ok ? 'is-done' : ''} ${here ? 'is-cur' : ''}" data-a="mapNode" data-v="${i}" style="${pos(i)}" aria-label="Estación ${i + 1}: ${c.t}${ok ? ' (completa)' : here ? ' (estás acá)' : ''}">${here ? '<span class="map-ring"></span>' : ''}<span class="map-badge"><svg viewBox="0 0 24 24" aria-hidden="true">${MAP_PLACES[i].ic}</svg></span>${ok ? '<span class="map-check" aria-hidden="true">✓</span>' : ''}<span class="map-name" aria-hidden="true">${MAP_PLACES[i].place}</span></button>`;
  }).join('');
  const me = cur >= 0 ? (() => { const f = mapFront(cur); return `<div class="map-me" style="left:${(f[0] / MAP_W * 100).toFixed(2)}%;top:calc(${((f[1] + 10) / MAP_H * 100).toFixed(2)}% - 44px)" aria-hidden="true"><span>Estás acá</span><i></i></div>` })() : '';
  return `<div class="map-world">${mapScene()}${nodes}${me}</div>`;
}

/* ---------- Ficha de cada estación ---------- */
function mapSheetHTML(i) {
  const c = SC[i], ok = stDone(i), started = startedSt(i), here = i === suggestedStation(), j = stepIdx(c);
  const chips = c.steps.map((s, k) => `<span class="${here && started && !ok && k === j ? 'is-cur' : stepDone(c, s) ? 'is-done' : ''}">${s.label}</span>`).join('');
  const label = ok ? 'Repasar' : started ? `Continuar con ${curStep(c).label}` : 'Empezar';
  return `<div class="map-place">Estación ${i + 1} de ${SC.length} · ${MAP_PLACES[i].place}</div><h3 id="map-dlg-title">${c.t}</h3><p>${c.md}</p><div class="map-steps">${chips}</div><div class="bar"><a class="b p" href="#${stepPath(i)}">${label}</a><button type="button" class="b" data-a="mapClose">Cerrar</button></div>`;
}
function mapDlg() {
  let dl = $('#map-dlg');
  if (!dl) {
    dl = document.createElement('dialog'); dl.id = 'map-dlg'; dl.setAttribute('aria-labelledby', 'map-dlg-title');
    /* Un enlace cierra la ficha antes de navegar; tocar fuera también la cierra. */
    dl.addEventListener('click', e => { if (e.target === dl || e.target.closest('a')) dl.close() });
    document.body.append(dl);
  }
  return dl;
}
on({
  mapNode: v => { const dl = mapDlg(); dl.innerHTML = mapSheetHTML(+v); if (!dl.open) dl.showModal() },
  mapClose: () => { const dl = $('#map-dlg'); if (dl && dl.open) dl.close() }
});

/* Al entrar a la Academia, la vista baja hasta "Estás acá" (si no es la primera estación). */
function mapAfter() {
  const n = $('.map-node.is-cur'); if (!n || +n.dataset.v === 0) return;
  requestAnimationFrame(() => { if (scrollY < 40) { const r = n.getBoundingClientRect(); scrollTo({ top: r.top + scrollY - innerHeight * .45, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }) } });
}
