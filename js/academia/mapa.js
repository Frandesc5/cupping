/* ============================================================
   Academia · mapa isométrico de la planta a la taza
   Cada estación es una isla flotante con su lugar construido encima
   (finca, beneficio, puerto, tostadora, barra, mesa de cata), unidas por
   un camino de baldosas. Las insignias se tocan y abren una ficha con
   los pasos y el botón para seguir. Todo es SVG dibujado con código;
   js/tres.js lo vuelve a armar en 3D encima (este SVG queda de respaldo).
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
/* Número pseudoaleatorio fijo (para que los granos siempre caigan igual). */
const isoRnd = i => { const s = Math.sin(i * 12.9898) * 43758.5453; return s - Math.floor(s) };
/* Tambor en forma de bala, acostado a lo largo de x: atrás redondeado (cápsula) y cilíndrico
   hasta el frente plano (en xf). Se dibujan solo las caras que miran hacia quien mira,
   más claras arriba, y la tapa del frente. */
function isoBullet(o, xb, xf, yc, zc, R, cap, dark = 34, light = 96) {
  const N = 40, ring = [];
  for (let k = 0; k < N; k++) { const a = k / N * Math.PI * 2; ring.push([Math.cos(a), Math.sin(a)]) }
  /* Perfil: de la punta de atrás (radio 0) al final de la cúpula, y después recto hasta el frente */
  const prof = [];
  for (let k = 1; k <= 8; k++) { const th = k / 8 * Math.PI / 2; prof.push([xb + cap * (1 - Math.cos(th)), R * Math.sin(th)]) }
  prof.unshift([xb, 0]); prof.push([xf, R]);
  const at = (xx, r, c) => isoP(o, xx, yc + r * c[0], zc + r * c[1]);
  const g = v => { const n = Math.round(dark + (light - dark) * Math.max(0, Math.min(1, v))); return `rgb(${n},${n},${n})` };
  const quads = [];
  for (let i = 0; i < prof.length - 1; i++) {
    const [x1, r1] = prof[i], [x2, r2] = prof[i + 1];
    for (let k = 0; k < N; k++) {
      const c1 = ring[k], c2 = ring[(k + 1) % N], ny = (c1[0] + c2[0]) / 2, nz = (c1[1] + c2[1]) / 2;
      /* Normal aproximada: en la cúpula también mira hacia atrás (-x) */
      const nx = r2 > r1 ? -(r2 - r1) / Math.max(.001, x2 - x1) * .6 : 0;
      if (ny + nz + nx < -.25) continue;
      quads.push([i, nz, [at(x1, r1, c1), at(x1, r1, c2), at(x2, r2, c2), at(x2, r2, c1)], (nz + 1) / 2 * .78 + (nx < 0 ? -.06 : 0)]);
    }
  }
  let s = '';
  quads.sort((a, b) => a[0] - b[0] || a[1] - b[1]).forEach(([, , q, v]) => { const f = g(v); s += `<polygon points="${q.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')}" fill="${f}" stroke="${f}" stroke-width=".7"/>` });
  s += `<polygon points="${ring.map(c => at(xf, R, c)).map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')}" fill="${g(.4)}" stroke="#151515" stroke-width=".8"/>`;
  return s;
}
/* Pata en arco ("∩") en el plano y-z, en la posición x: angosta arriba, abierta abajo, hueco curvo. */
function isoArchLeg(o, x, yc, zFloor, zTop, wFoot, wTop, th) {
  const pts = [], q = (a, b, c, t) => a * (1 - t) ** 2 + b * 2 * t * (1 - t) + c * t * t;
  for (let k = 0; k <= 10; k++) { const t = k / 10; pts.push([q(yc - wFoot, yc - wFoot * .92, yc - wTop, t), q(zFloor, zFloor + (zTop - zFloor) * .95, zTop, t)]) }
  for (let k = 10; k >= 0; k--) { const t = k / 10; pts.push([q(yc + wFoot, yc + wFoot * .92, yc + wTop, t), q(zFloor, zFloor + (zTop - zFloor) * .95, zTop, t)]) }
  const inW = wFoot - th, inH = (zTop - zFloor) * .62;
  for (let k = 0; k <= 16; k++) { const a = k / 16 * Math.PI; pts.push([yc + inW * Math.cos(a), zFloor + inH * Math.sin(a)]) }
  return `<polygon points="${pts.map(([y, z]) => isoP(o, x, y, z)).map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')}" fill="#232323" stroke="#111" stroke-width="1" stroke-linejoin="round"/>`;
}
/* Bandeja de enfriado: recipiente hondo, negro por fuera, de acero por dentro y con el fondo perforado. */
function isoCoolTray(o, x, y, z) {
  const R = 13, H = 10, c = isoP(o, x, y, z + H), rx = R * 1.2247, ry = R * .7071, irx = rx * .88, iry = ry * .88;
  let s = isoCyl(o, x, y, z, R, H, '#2b2b2b', '#3c3c3c');
  s += `<defs><linearGradient id="ct-steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6e6e3"/><stop offset=".55" stop-color="#b9b9b6"/><stop offset="1" stop-color="#8b8b88"/></linearGradient><clipPath id="ct-in"><ellipse cx="${c[0]}" cy="${c[1]}" rx="${irx}" ry="${iry}"/></clipPath></defs>`;
  /* Pared de adentro (acero) */
  s += `<ellipse cx="${c[0]}" cy="${c[1]}" rx="${irx}" ry="${iry}" fill="url(#ct-steel)"/>`;
  /* Fondo perforado, más abajo, recortado por el borde */
  const bx = c[0] + 1, by = c[1] + H * .5, brx = irx * .8, bry = iry * .8;
  let holes = '';
  for (let yy = -bry; yy <= bry; yy += 1.6) for (let xx = -brx; xx <= brx; xx += 2.2) { if ((xx / brx) ** 2 + (yy / bry) ** 2 > .82) continue; holes += `<circle cx="${(bx + xx + (Math.round(yy / 1.6) % 2) * 1.1).toFixed(1)}" cy="${(by + yy).toFixed(1)}" r=".45" fill="#2a2a2a"/>` }
  s += `<g clip-path="url(#ct-in)"><ellipse cx="${bx}" cy="${by}" rx="${brx}" ry="${bry}" fill="#a3a3a0"/>${holes}</g>`;
  /* Borde */
  s += `<ellipse cx="${c[0]}" cy="${c[1]}" rx="${rx}" ry="${ry}" fill="none" stroke="#1c1c1c" stroke-width="1.2"/><ellipse cx="${c[0]}" cy="${c[1]}" rx="${irx}" ry="${iry}" fill="none" stroke="#5a5a5a" stroke-width=".6"/>`;
  return s;
}
/* Mesa de cata: mesa atrás con dos filas de bowls (con la costra de café y su cucharita), la planilla y el vaso de
   enjuague en la punta, y una mesita al costado para preparar: hervidor de cuello de cisne, molino y balanza. */
function isoCupping(o) {
  const T = 16, wood = '#6e4f37', poly = a => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  let s = [[19, 23], [83, 23], [19, 51], [83, 51]].map(([x, y]) => isoBox(o, x, y, 0, 2.5, 2.5, T - 3, wood)).join('');
  s += isoBox(o, 18, 22, T - 3, 68, 32, 3, '#8a6748', '#efe9de');
  let k = 0;
  [31, 45].forEach(y => [28, 42, 56, 70].forEach(x => {
    const c = isoP(o, x, y, T + 3.6);
    s += isoCyl(o, x, y, T, 4.6, 3.6, '#ece9e3', '#f6f4ef');
    s += `<ellipse cx="${c[0]}" cy="${c[1]}" rx="4.9" ry="2.8" fill="#6b3f26"/><ellipse cx="${c[0] - .5}" cy="${c[1] - .2}" rx="3.5" ry="2" fill="#8a5a36"/>`;
    for (let j = 0; j < 4; j++) { const u = isoRnd(900 + k * 9 + j) * 2 - 1, v = isoRnd(950 + k * 9 + j) * 2 - 1; s += `<circle cx="${(c[0] + u * 2.8).toFixed(1)}" cy="${(c[1] + v * 1.4).toFixed(1)}" r=".55" fill="#c49a6c"/>` }
    const a1 = isoP(o, x - 3, y + 6, T + .4), b1 = isoP(o, x + 4, y + 6.6, T + .4);
    s += `<path d="M${a1[0]} ${a1[1]}L${b1[0]} ${b1[1]}" stroke="#a7abaf" stroke-width="1" stroke-linecap="round"/><ellipse cx="${a1[0] - 1.2}" cy="${a1[1] - .3}" rx="2" ry="1.3" fill="#dfe1e3" stroke="#8f9397" stroke-width=".5"/>`;
    k++;
  }));
  /* Planilla con lápiz y vaso de enjuague */
  s += `<polygon points="${poly([isoP(o, 77, 25, T + .1), isoP(o, 85, 25, T + .1), isoP(o, 85, 36, T + .1), isoP(o, 77, 36, T + .1)])}" fill="#fff" stroke="#d9d4ca" stroke-width=".6"/>`;
  for (let j = 1; j < 5; j++) { const a1 = isoP(o, 78, 25 + j * 2.1, T + .2), b1 = isoP(o, 84, 25 + j * 2.1, T + .2); s += `<path d="M${a1[0]} ${a1[1]}L${b1[0]} ${b1[1]}" stroke="#cfc9bd" stroke-width=".5"/>` }
  { const a1 = isoP(o, 79, 37.5, T + .5), b1 = isoP(o, 85, 38.5, T + .5); s += `<path d="M${a1[0]} ${a1[1]}L${b1[0]} ${b1[1]}" stroke="#e0b440" stroke-width="1.6" stroke-linecap="round"/>` }
  const gb = isoP(o, 80, 47, T), gt = isoP(o, 80, 47, T + 7.5);
  s += `<path d="M${gt[0] - 1} ${gt[1] + 5}L${gt[0] - 2} ${gt[1] - 4}M${gt[0] + 1} ${gt[1] + 5}L${gt[0] + 3} ${gt[1] - 4}" stroke="#b9bcbf" stroke-width="1" stroke-linecap="round"/>`;
  s += `<path d="M${gb[0] - 3.7} ${gb[1]}L${gt[0] - 4.1} ${gt[1]}h8.2L${gb[0] + 3.7} ${gb[1]}z" fill="#dcebf0" opacity=".7" stroke="#9fb9c2" stroke-width=".6"/><ellipse cx="${gt[0]}" cy="${gt[1]}" rx="4.1" ry="1.8" fill="#e8f2f5" stroke="#9fb9c2" stroke-width=".6"/>`;
  /* Mesita de preparación */
  const T2 = 14;
  s += [[93, 25], [109, 25], [93, 47], [109, 47]].map(([x, y]) => isoBox(o, x, y, 0, 2, 2, T2 - 2, wood)).join('');
  s += isoBox(o, 92, 24, T2 - 2, 20, 26, 2, '#8a6748', '#a98563');
  s += isoCyl(o, 99, 31, T2, 3.4, 5.5, '#b9b9b6', '#d4d4d1') + isoCyl(o, 99, 31, T2 + 5.5, 1.6, .9, '#2b2b2b');
  { const a1 = isoP(o, 101.8, 31, T2 + 1.5), b1 = isoP(o, 104.5, 31, T2 + 6.5), c1 = isoP(o, 106.2, 31, T2 + 6); s += `<path d="M${a1[0]} ${a1[1]}L${b1[0]} ${b1[1]}L${c1[0]} ${c1[1]}" fill="none" stroke="#b9b9b6" stroke-width="1" stroke-linecap="round"/>` }
  s += isoBox(o, 94, 40, T2, 6.5, 6.5, .8, '#1f1f1f', '#2c2c2c') + isoCyl(o, 97.25, 43.25, T2 + .8, 2.6, 1.6, '#f4f2ee', '#6b3f26');
  s += isoBox(o, 103, 40, T2, 6, 6, 3.5, '#2f2f2f') + isoCyl(o, 106, 43, T2 + 3.5, 2.3, 5.5, '#3a3a3a');
  { const hb = isoP(o, 106, 43, T2 + 9), ht = isoP(o, 106, 43, T2 + 13.5); s += `<path d="M${hb[0] - 1.7} ${hb[1]}L${ht[0] - 4.2} ${ht[1]}h8.4L${hb[0] + 1.7} ${hb[1]}z" fill="#d9cbb5" stroke="#b3a487" stroke-width=".5"/><ellipse cx="${ht[0]}" cy="${ht[1]}" rx="4.2" ry="2.4" fill="#e6dccb" stroke="#b3a487" stroke-width=".5"/>` }
  return s;
}
/* Máquina de espresso roja de dos grupos, apoyada en z = T, con su frente hacia +y. */
function isoEspresso(o, mx, my, T, mw = 58) {
  let s = '';
  /* Máquina de espresso: un perfil de costado (y-z) extendido a lo ancho (x).
     Atrás baja en curva; arriba, la cabeza sobresale con los grupos; abajo, la base con la bandeja;
     en el medio, el hueco de trabajo de acero. Cada cara se sombrea según hacia dónde mira. */
  const D = 24, H = 30, z0 = T + 2;
  [[mx + 3, my + 3], [mx + mw - 5, my + 3], [mx + 3, my + D - 4], [mx + mw - 5, my + D - 4]].forEach(([x, y]) => { s += isoBox(o, x, y, T, 2, 2, 2, '#151515') });
  /* Perfil (y desde atrás, z desde la base), en sentido antihorario visto desde la derecha */
  const prof = [[1, 0], [D - 1, 0], [D + 2, 2], [D + 2, 6], [D - 9, 6], [D - 9, H - 9], [D, H - 9], [D, H - 3], [D - 3, H]];
  for (let k = 0; k <= 8; k++) { const a = k / 8 * Math.PI / 2; prof.push([10 - 10 * Math.sin(a) + 0, H - 12 + 12 * Math.cos(a) - (1 - Math.cos(a)) * 0]) }
  prof.push([0, 6], [0, 2]);
  const P3 = (x, [y, z]) => isoP(o, x, my + y, z0 + z), pts = a => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const RED = [179, 38, 43], tone = f => `rgb(${RED.map(c => Math.round(Math.min(255, c * f))).join(',')})`;
  const quads = [];
  for (let k = 0; k < prof.length; k++) {
    const a = prof[k], b = prof[(k + 1) % prof.length], ey = b[0] - a[0], ez = b[1] - a[1], len = Math.hypot(ey, ez) || 1;
    const ny = ez / len, nz = -ey / len; /* normal hacia afuera (perfil antihorario) */
    if (ny + nz <= .02) continue;
    const steel = (a[0] >= D - 9 && b[0] >= D - 9 && a[1] >= 6 && b[1] <= H - 9 && Math.abs(ey) < .01) || (Math.abs(a[1] - 6) < .01 && Math.abs(b[1] - 6) < .01);
    const fill = steel ? (Math.abs(ez) > .01 ? 'url(#bar-steel)' : '#cfcfcc') : tone(nz > .7 ? 1.18 : ny > .7 ? .9 : 1.04);
    quads.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, `<polygon points="${pts([P3(mx, a), P3(mx, b), P3(mx + mw, b), P3(mx + mw, a)])}" fill="${fill}" stroke="rgba(0,0,0,.12)" stroke-width=".5"/>`]);
  }
  s += `<defs><linearGradient id="bar-steel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f2f2f0"/><stop offset=".5" stop-color="#bdbdba"/><stop offset="1" stop-color="#e6e6e3"/></linearGradient></defs>`;
  quads.sort((p, q) => p[0] - q[0] || p[1] - q[1]).forEach(q => { s += q[2] });
  /* Rejilla de la bandeja */
  for (let k = 1; k < 12; k++) { const x = mx + 3 + k * (mw - 6) / 12, a = P3(x, [D - 8, 6.1]), b = P3(x, [D + 1.5, 6.1]); s += `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="#9a9a97" stroke-width=".6"/>` }
  /* Botoneras en el frente de la cabeza */
  [mx + 8, mx + 22, mx + 38].forEach(x => { s += `<polygon points="${pts([P3(x, [D + .1, H - 7.5]), P3(x + 10, [D + .1, H - 7.5]), P3(x + 10, [D + .1, H - 4]), P3(x, [D + .1, H - 4])])}" fill="#2a2a2a"/>` });
  /* Manómetro en la pared de acero */
  const gg = P3(mx + 9, [D - 8.9, 13]); s += `<circle cx="${gg[0]}" cy="${gg[1]}" r="2.8" fill="#fff" stroke="#888" stroke-width=".7"/>`;
  /* Grupos con portafiltro de mango negro y taza debajo */
  [mx + 20, mx + 40].forEach(x => {
    const h = P3(x, [D - 4, H - 9.5]); s += `<ellipse cx="${h[0]}" cy="${h[1]}" rx="4.5" ry="2.6" fill="#a8a8a5" stroke="#6d6d6a" stroke-width=".6"/>`;
    const a = P3(x, [D - 3, H - 11.5]), b = P3(x + 1, [D + 7, H - 13]); s += `<ellipse cx="${a[0]}" cy="${a[1]}" rx="3.6" ry="2" fill="#bdbdba"/><path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="#141414" stroke-width="2.8" stroke-linecap="round"/>`;
    s += isoCyl(o, x, my + D - 4, z0 + 6, 2.2, 3, '#f4f2ee', '#5a3522');
  });
  /* Lanzas de vapor en los extremos del hueco */
  [mx + 4, mx + mw - 4].forEach(x => { const a = P3(x, [D - 2, H - 10]), b = P3(x, [D, 9]); s += `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="#a9a9a6" stroke-width="1.4" stroke-linecap="round"/>` });
  /* Costado derecho con el perfil y el filete plateado en diagonal */
  s += `<polygon points="${pts(prof.map(q => P3(mx + mw, q)))}" fill="${tone(.82)}" stroke="rgba(0,0,0,.18)" stroke-width=".6"/>`;
  const trim = []; for (let k = 0; k <= 10; k++) { const tt = k / 10; trim.push(P3(mx + mw + .1, [2 + (D - 4) * tt, 3 + (H - 6) * (tt * tt * .3 + tt * .7)])) }
  s += `<polyline points="${pts(trim)}" fill="none" stroke="#f1f1ee" stroke-width="1.1" opacity=".9"/>`;
  return s;
}
/* V60 sobre su server, apoyado en z = T. */
function isoV60(o, vx, vy, T) {
  let s = '';
  /* V60 sobre su server (un poco más grande que la escala real, para que se lea) */
  const sb = isoP(o, vx, vy, T), st = isoP(o, vx, vy, T + 11);
  s += `<g transform="translate(${sb[0]} ${sb[1]}) scale(1.35) translate(${-sb[0]} ${-sb[1]})">`;
  s += `<path d="M${sb[0] - 6} ${sb[1]}q-1-6 1-11h10q2 5 1 11z" fill="#dbe7ec" opacity=".75" stroke="#9fb3bb" stroke-width=".8"/><path d="M${sb[0] - 5.6} ${sb[1] - 1}q0-3 .6-5h10q.6 2 .6 5z" fill="#5a3522" opacity=".9"/><ellipse cx="${st[0]}" cy="${st[1]}" rx="5.6" ry="2.4" fill="#cfdde3" stroke="#9fb3bb" stroke-width=".8"/>`;
  const vb = isoP(o, vx, vy, T + 12), vt = isoP(o, vx, vy, T + 21);
  s += `<ellipse cx="${vb[0]}" cy="${vb[1]}" rx="6" ry="2.6" fill="#e9e6e0" stroke="#bdb8ae" stroke-width=".7"/><path d="M${vb[0] - 2.4} ${vb[1] - 1}L${vt[0] - 8.5} ${vt[1]}h17L${vb[0] + 2.4} ${vb[1] - 1}z" fill="#f6f4f0" stroke="#bdb8ae" stroke-width=".8"/><ellipse cx="${vt[0]}" cy="${vt[1]}" rx="8.5" ry="3.6" fill="#ece8e0" stroke="#bdb8ae" stroke-width=".8"/><ellipse cx="${vt[0]}" cy="${vt[1] + .3}" rx="6.4" ry="2.5" fill="#fbfaf7"/><ellipse cx="${vt[0]}" cy="${vt[1] + .6}" rx="4" ry="1.5" fill="#6b4630"/></g>`;
  return s;
}
/* Barra: mostrador con una máquina de espresso roja de dos grupos y un V60 sobre su server. */
function isoBar(o) {
  const T = 24;
  return isoBox(o, 8, 50, 0, 102, 34, T, '#8a6748', '#ece6db') + isoEspresso(o, 12, 52, T) + isoV60(o, 92, 66, T);
}
/* Tostadora de muestras sobre una mesa, con saco de café verde en el suelo. */
function isoRoastery(o) {
  let s = '';
  /* Mesa */
  [[10, 22], [96, 22], [10, 72], [96, 72]].forEach(([x, y]) => { s += isoBox(o, x, y, 0, 3, 3, 20, '#6e4f37') });
  s += isoBox(o, 8, 20, 20, 92, 56, 3, '#8a6748', '#a98563');
  const T = 23, yc = 46, R = 16, zc = T + 9 + R, x0 = 22, len = 46, xf = x0 + len;
  /* Patas en arco y tambor en forma de bala */
  /* La pata de atrás va detrás del tambor; la de adelante, delante (así se ve el arco). */
  const leg = x => isoArchLeg(o, x, yc, T, zc - R * .55, R * .9, R * .5, 5);
  s += leg(x0 + 2) + isoBullet(o, x0 - 6, xf, yc, zc, R, 16) + leg(xf - 4);
  /* Rejillas de ventilación en el costado */
  for (let k = 0; k < 6; k++) { const a = isoP(o, x0 + 14 + k * 3, yc + R * .3, zc + R * .95), b = isoP(o, x0 + 6 + k * 3, yc + R * .8, zc + R * .55); s += `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="#121212" stroke-width="1"/>` }
  const hb = isoP(o, xf - 8, yc, zc + R), ht = isoP(o, xf - 8, yc, zc + R + 12);
  s += `<path d="M${hb[0] - 2} ${hb[1]}v-4h4v4z" fill="#1b1b1b"/><path d="M${ht[0] - 12} ${ht[1]}L${hb[0] - 2} ${hb[1] - 4}h4L${ht[0] + 12} ${ht[1]}z" fill="#2a2a2a"/><ellipse cx="${ht[0]}" cy="${ht[1]}" rx="12" ry="5" fill="#3d3d3d" stroke="#151515" stroke-width=".8"/><ellipse cx="${ht[0]}" cy="${ht[1]}" rx="9" ry="3.4" fill="#141414"/>`;
  /* Frente: panel con números rojos, puerta de descarga y manija de madera */
  const pc = isoP(o, xf + .5, yc - R * .45, zc + R * .4), door = isoP(o, xf + .5, yc + R * .1, zc - R * .35), hd = isoP(o, xf + .5, yc + R * .35, zc + R * .05);
  s += `<circle cx="${pc[0]}" cy="${pc[1]}" r="7.5" fill="#101010" stroke="#555" stroke-width=".8"/><rect x="${pc[0] - 4}" y="${pc[1] - 3.5}" width="3.4" height="2.2" fill="#e2453a"/><rect x="${pc[0] + .4}" y="${pc[1] - 3.5}" width="3.4" height="2.2" fill="#e2453a"/><rect x="${pc[0] - 2.4}" y="${pc[1] + .8}" width="4.8" height="2" fill="#3fbf6a"/>`;
  s += `<ellipse cx="${door[0]}" cy="${door[1]}" rx="5.5" ry="4" fill="#0e0e0e" stroke="#4a4a4a" stroke-width=".7"/><path d="M${hd[0]} ${hd[1]}l9 3" stroke="#9a6b45" stroke-width="4" stroke-linecap="round"/>`;
  /* Bandeja de enfriado adelante, debajo de la puerta de descarga */
  s += isoCoolTray(o, xf + 17, yc + 4, T);
  /* Humo del tambor */
  s += `<g class="map-smoke">${isoAt(o, x0 + 4, yc - 4, zc + R + 14, (x, y) => `<circle cx="${x}" cy="${y}" r="5" fill="#e3dfd7"/><circle cx="${x + 5}" cy="${y - 10}" r="7" fill="#ebe7e0"/>`)}</g>`;
  return s;
}
/* Cama africana: mesa sobre patas, borde de madera, malla tensada y una capa despareja de granos.
   kind: 'pergamino' (café lavado/honey) o 'cereza' (natural, frutos secándose). */
function isoBed(o, x, y, w, d, h, kind = 'pergamino', seed = 1) {
  const wood = '#8a6748', top = h + 3;
  let s = '';
  const legs = [[x, y], [x + w - 2, y], [x, y + d - 2], [x + w - 2, y + d - 2]];
  if (w > 40) legs.push([x + w / 2 - 1, y], [x + w / 2 - 1, y + d - 2]);
  legs.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1])).forEach(([lx, ly]) => { s += isoBox(o, lx, ly, 0, 2, 2, h, '#7a5a40') });
  s += isoBox(o, x, y, h, w, d, 3, wood, '#efe7cf');
  /* Malla: líneas finas en las dos direcciones sobre la superficie */
  let mesh = '';
  for (let k = 3; k < w; k += 3.5) { const a = isoP(o, x + k, y + 1, top), b = isoP(o, x + k, y + d - 1, top); mesh += `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}` }
  for (let k = 3; k < d; k += 3.5) { const a = isoP(o, x + 1, y + k, top), b = isoP(o, x + w - 1, y + k, top); mesh += `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}` }
  s += `<path d="${mesh}" stroke="#b9a77e" stroke-width=".45" opacity=".7"/>`;
  /* Granos: capa despareja (más densa en el centro), con el color según el proceso */
  const [fill, edge] = kind === 'cereza' ? ['#7a3326', '#5a2219'] : ['#d8c9a0', '#b19c6a'];
  const n = Math.round(w * d / 9);
  for (let k = 0; k < n; k++) {
    const u = isoRnd(seed * 100 + k), v = isoRnd(seed * 300 + k * 7);
    if (Math.abs(u - .5) + Math.abs(v - .5) > .62) continue;
    const p = isoP(o, x + 2 + u * (w - 4), y + 2 + v * (d - 4), top + .6);
    s += `<ellipse cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" rx="${kind === 'cereza' ? 1.9 : 2.2}" ry="${kind === 'cereza' ? 1.6 : 1.4}" fill="${fill}" stroke="${edge}" stroke-width=".4"/>`;
  }
  return s;
}
/* Marquesina (secador solar): túnel de plástico translúcido con arcos, a lo largo de y.
   Adentro, una cama de secado que se ve a través del plástico. */
function isoTunnel(o, x, y, w, len, h) {
  const cx = x + w / 2, r = w / 2, N = 12, prof = [];
  for (let k = 0; k <= N; k++) { const a = Math.PI - k / N * Math.PI; prof.push([cx + r * Math.cos(a), h * Math.sin(a)]) }
  const ring = yy => prof.map(([px, pz]) => isoP(o, px, yy, pz));
  const pts = a => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  let s = '';
  /* Base de madera y extremo de atrás */
  s += isoBox(o, x - 1, y, 0, 2, len, 2, '#7a5a40') + isoBox(o, x + w - 1, y, 0, 2, len, 2, '#7a5a40');
  s += `<polygon points="${pts(ring(y))}" fill="#e3eff3" opacity=".55" stroke="#9fb9c2" stroke-width=".8"/>`;
  /* Lo que se seca adentro */
  s += isoBed(o, x + 5, y + 6, w - 10, len - 12, 8, 'pergamino', 7);
  /* Plástico: tiras entre perfiles */
  for (let k = 0; k < N; k++) {
    const a = isoP(o, prof[k][0], y, prof[k][1]), b = isoP(o, prof[k + 1][0], y, prof[k + 1][1]), c = isoP(o, prof[k + 1][0], y + len, prof[k + 1][1]), d = isoP(o, prof[k][0], y + len, prof[k][1]);
    s += `<polygon points="${pts([a, b, c, d])}" fill="#dcebf0" opacity="${.28 + .22 * (k / N)}"/>`;
  }
  /* Arcos (caños) y brillo del plástico */
  for (let j = 0; j <= 4; j++) s += `<polyline points="${pts(ring(y + len * j / 4))}" fill="none" stroke="#8fa9b2" stroke-width="1.3"/>`;
  const hl = [3, 4, 5].map(k => isoP(o, prof[k][0], y + len * .15, prof[k][1])), hl2 = [3, 4, 5].map(k => isoP(o, prof[k][0], y + len * .85, prof[k][1]));
  s += `<polyline points="${pts([hl[1], hl2[1]])}" stroke="#fff" stroke-width="2" opacity=".7"/>`;
  /* Frente: arco abierto con la entrada */
  s += `<polygon points="${pts(ring(y + len))}" fill="#d2e6ed" opacity=".45" stroke="#8fa9b2" stroke-width="1.3"/>`;
  return s;
}

/* ---------- Lugares de cada estación ---------- */
/* MAP_TOP deja lugar arriba para el título, el avance y los botones de glosario y apuntes, que van dentro del cielo.
   place: el lugar del mapa (ambientación) · hint: aclaración corta cuando el nombre del lugar es jerga. */
const MAP_W = 400, MAP_IW = 118, MAP_ID = 118, MAP_IH = 30, MAP_GAP = 262, MAP_TOP = 250;
const MAP_H = MAP_TOP + 5 * MAP_GAP + 230;

/* ---------- Forma de las islas y de los cerros ----------
   La usan este dibujo SVG y el mapa 3D (js/tres.js), así los dos muestran exactamente la misma isla.
   Puntos del mundo: [x, y, z] (z es la altura). Los números al azar son fijos (isoRnd), así cada isla
   siempre tiene la misma forma. */

/* Contorno: radio del borde según el ángulo, desde el centro de la isla. Un cuadrado de puntas muy redondeadas,
   más ancho en las diagonales para que todo lo de arriba quede sobre la isla, con ondas propias de cada isla. */
const isleRimR = (i, a) => 64 / Math.pow(Math.abs(Math.cos(a)) ** 4 + Math.abs(Math.sin(a)) ** 4, .25) * (1.05 + .04 * Math.sin(a * 3 + i * 1.7) + .03 * Math.sin(a * 7 + i * 2.9));
/* Isla: pasto arriba (anillos desde el centro) y roca facetada abajo que se angosta hasta una punta.
   top y rock: triángulos [a, b, c, tono 0..1] · frags: piedras sueltas [x, y, z, radio]. */
function isleShape(i) {
  const N = 32, L = 6, RG = 6, CX = MAP_IW / 2, CY = MAP_ID / 2, rnd = isoRnd;
  const rim = Array.from({ length: N }, (_, j) => { const a = j / N * Math.PI * 2; return [a, isleRimR(i, a) * (1 + (rnd(i * 61 + j) - .5) * .04)] });
  const at = (j, k, z) => { const [a, r] = rim[j % N]; return [CX + Math.cos(a) * r * k, CY + Math.sin(a) * r * k, z] };
  const top = [], rock = [];
  for (let r = 0; r < RG; r++) for (let j = 0; j < N; j++) {
    const k0 = r / RG, k1 = (r + 1) / RG, s0 = i * 5000 + r * 100 + j;
    if (r === 0) top.push([[CX, CY, 0], at(j + 1, k1, 0), at(j, k1, 0), rnd(s0)]);
    else { top.push([at(j, k0, 0), at(j + 1, k1, 0), at(j, k1, 0), rnd(s0)]); top.push([at(j, k0, 0), at(j + 1, k0, 0), at(j + 1, k1, 0), rnd(s0 + 50)]) }
  }
  const D = 84 + rnd(i * 13) * 16;
  const rings = Array.from({ length: L }, (_, k) => rim.map(([a, r], j) => {
    if (k === 0) return at(j, 1, 0);
    const f = k / L, rr = r * (1 - Math.pow(f, 1.5)) * (1 + (rnd(i * 900 + k * 40 + j) - .5) * .2);
    return [CX + Math.cos(a) * rr, CY + Math.sin(a) * rr, -4 - D * Math.pow(f, 1.25) + (rnd(i * 300 + k * 40 + j) - .5) * 8];
  }));
  const tip = [CX + (rnd(i * 7) - .5) * 14, CY + (rnd(i * 9) - .5) * 14, -4 - D - 8];
  for (let k = 0; k < L; k++) for (let j = 0; j < N; j++) {
    const u0 = rings[k][j], u1 = rings[k][(j + 1) % N], s0 = i * 9000 + k * 100 + j;
    if (k === L - 1) { rock.push([u0, tip, u1, rnd(s0)]); continue }
    const d0 = rings[k + 1][j], d1 = rings[k + 1][(j + 1) % N];
    rock.push([u0, d1, u1, rnd(s0)]); rock.push([u0, d0, d1, rnd(s0 + 50)]);
  }
  const frags = Array.from({ length: 5 }, (_, k) => [CX + (rnd(i * 21 + k) - .5) * 60, CY + (rnd(i * 27 + k) - .5) * 60, -4 - D * (.75 + rnd(i * 23 + k) * .4) - 10, 2 + rnd(i * 40 + k) * 3.5]);
  return { CX, CY, D, top, rock, frags };
}
/* Cerro de zona cafetera: redondeado, con las hileras del cafetal siguiendo las curvas de nivel y árboles de sombra.
   verts: [x, y, z, hilera (1) o pasto (0), variación 0..1] · tris: índices · trees: [x, y, z, radio, tono]. */
function hillShape(cx, cy, rx, ry, h, seed, RINGS = 28, SEG = 56) {
  const rnd = isoRnd, cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const rim = a => 1 + .1 * Math.sin(a * 3 + seed) + .06 * Math.sin(a * 5 + seed * 2.3);
  const zAt = (t, a) => h * Math.pow(Math.cos(t * Math.PI / 2), 1.5) * (1 + .06 * Math.sin(a * 4 + seed) * Math.sin(t * Math.PI));
  const xyAt = (t, a) => [cl(cx + Math.cos(a) * rx * t * rim(a), 1.5, MAP_IW - 1.5), cl(cy + Math.sin(a) * ry * t * rim(a), 1.5, MAP_ID - 1.5)];
  const verts = [[cx, cy, zAt(0, 0), 0, 0]], tris = [], trees = [];
  for (let i = 1; i <= RINGS; i++) {
    const t = i / RINGS;
    for (let j = 0; j < SEG; j++) {
      const a = j / SEG * Math.PI * 2, k = i * SEG + j, z = i === RINGS ? 0 : zAt(t, a), [x, y] = xyAt(t, a);
      const band = (z / 4.2 + .3 * Math.sin(a * 2 + seed)) % 1, row = t > .25 && t < .95 && band < .42;
      verts.push([x, y, z, row ? 1 : 0, rnd(k + seed * (row ? 13 : 7))]);
    }
  }
  const at = (i, j) => i === 0 ? 0 : 1 + (i - 1) * SEG + (j % SEG);
  for (let j = 0; j < SEG; j++) tris.push([0, at(1, j + 1), at(1, j)]);
  for (let i = 1; i < RINGS; i++) for (let j = 0; j < SEG; j++) {
    const p = at(i, j), q = at(i, j + 1), d = at(i + 1, j), e = at(i + 1, j + 1);
    tris.push([p, q, d], [q, e, d]);
  }
  const n = Math.round(rx * ry / 55);
  for (let k = 0; k < n; k++) {
    const t = .12 + rnd(seed * 50 + k) * .7, a = rnd(seed * 80 + k) * Math.PI * 2, [x, y] = xyAt(t, a), r = 2.6 + rnd(seed * 20 + k) * 2.4;
    trees.push([x, y, zAt(t, a) + r * .55, r, .9 + rnd(k + seed) * .25]);
  }
  return { verts, tris, trees };
}
/* Cerros de la finca: [cx, cy, rx, ry, altura, semilla]. */
const FINCA_HILLS = [[36, 32, 33, 29, 56, 1], [84, 26, 26, 22, 38, 2.6], [16, 66, 14, 12, 18, 4.1]];

/* ---------- Dibujo de caras sombreadas ----------
   Cada triángulo se aclara u oscurece según hacia dónde mira (luz desde arriba a la izquierda) y se dibuja
   de atrás hacia adelante. */
const ISO_L = [.45, .18, 1].map((v, _, a) => v / Math.hypot(...a));
const isoMix = (h1, h2, t) => { const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16); return '#' + [16, 8, 0].map(sh => Math.round((a >> sh & 255) + ((b >> sh & 255) - (a >> sh & 255)) * t).toString(16).padStart(2, '0')).join('') };
/* Luz sobre la cara (a, b, c). inner: un punto de adentro del volumen (la normal se da vuelta para mirar hacia afuera);
   sin inner, la normal mira hacia arriba. Devuelve 0 si la cara mira hacia atrás (no se ve: no hace falta dibujarla). */
function isoLight(a, b, c, inner) {
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const l = Math.hypot(...n) || 1; n = n.map(x => x / l);
  const flip = inner ? n[0] * ((a[0] + b[0] + c[0]) / 3 - inner[0]) + n[1] * ((a[1] + b[1] + c[1]) / 3 - inner[1]) + n[2] * ((a[2] + b[2] + c[2]) / 3 - inner[2]) < 0 : n[2] < 0;
  if (flip) n = n.map(x => -x);
  if (n[0] + n[1] + n[2] < -.05) return 0;
  return .62 + .5 * Math.max(0, n[0] * ISO_L[0] + n[1] * ISO_L[1] + n[2] * ISO_L[2]);
}
const isoDepth = (...ps) => ps.reduce((s, p) => s + p[0] + p[1] + p[2], 0) / ps.length;
const isoFacet = (o, pts, fill) => `<polygon points="${pts.map(p => isoP(o, p[0], p[1], p[2])).map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')}" fill="${fill}" stroke="${fill}" stroke-width=".5" stroke-linejoin="round"/>`;
const isoDraw = items => items.sort((a, b) => a[0] - b[0]).map(x => x[1]).join('');

/* Base de la isla: roca facetada, piedras sueltas debajo y el pasto arriba. */
function isoIsleBase(i, o) {
  const m = MAP_PLACES[i], S = isleShape(i), inner = [S.CX, S.CY, -S.D / 2];
  const rockA = isoShade(m.col, .78), rockB = isoShade(m.col, 1.12), items = [];
  S.rock.forEach(([a, b, c, t]) => { const f = isoLight(a, b, c, inner); if (f) items.push([isoDepth(a, b, c), isoFacet(o, [a, b, c], isoShade(isoMix(rockA, rockB, t), f))]) });
  S.frags.forEach(([x, y, z, r], k) => {
    const p = isoP(o, x, y, z), c = isoShade(m.col, .8 + isoRnd(k + i) * .3), h = r * 1.3;
    items.push([x + y + z, `<polygon points="${p[0]},${p[1] - h} ${p[0] + r},${p[1] - h * .3} ${p[0] + r * .7},${p[1] + h * .7} ${p[0] - r * .7},${p[1] + h * .7} ${p[0] - r},${p[1] - h * .3}" fill="${isoShade(c, .8)}"/><polygon points="${p[0]},${p[1] - h} ${p[0] + r},${p[1] - h * .3} ${p[0]},${p[1] + h * .1} ${p[0] - r},${p[1] - h * .3}" fill="${isoShade(c, 1.05)}"/>`]);
  });
  return isoDraw(items)
    + S.top.map(([a, b, c, t]) => isoFacet(o, [a, b, c], isoShade(m.top, .93 + t * .14))).join('');
}
/* Cerros de la finca, con sus árboles de sombra, mezclados de atrás hacia adelante. */
function isoHills(o) {
  const items = [];
  FINCA_HILLS.forEach(([cx, cy, rx, ry, h, seed]) => {
    const H = hillShape(cx, cy, rx, ry, h, seed, 16, 28);
    H.tris.forEach(([ia, ib, ic]) => {
      const a = H.verts[ia], b = H.verts[ib], c = H.verts[ic], f = isoLight(a, b, c); if (!f) return;
      const col = a[3] ? isoMix('#4f7a45', '#7fa565', a[4] * .25) : isoMix('#7fa565', '#9dbb7c', a[4] * .6);
      items.push([isoDepth(a, b, c), isoFacet(o, [a, b, c], isoShade(col, f))]);
    });
    H.trees.forEach(([x, y, z, r, f]) => { const p = isoP(o, x, y, z); items.push([x + y + z + r, `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(r * 1.1).toFixed(1)}" fill="${isoShade('#3f6a3c', f * .85)}"/><circle cx="${(p[0] - r * .3).toFixed(1)}" cy="${(p[1] - r * .35).toFixed(1)}" r="${(r * .6).toFixed(1)}" fill="${isoShade('#3f6a3c', f * 1.1)}"/>`]) });
  });
  return isoDraw(items);
}
/* Saco de yute abierto con café verde y algunos granos caídos alrededor. */
function isoOpenSack(o, x, y) {
  const b = isoP(o, x, y, 0);
  let s = `<path d="M${b[0] - 10} ${b[1] - 15}q-2 12 1 15q9 4 18 0q3-3 1-15z" fill="#c9ad7c" stroke="#9c8358" stroke-width="1"/><path d="M${b[0] - 8} ${b[1] - 9}q8 3 16 0" stroke="#b0955f" stroke-width=".8" fill="none"/>`;
  s += `<ellipse cx="${b[0]}" cy="${b[1] - 15}" rx="11" ry="4.4" fill="#b8975f" stroke="#9c8358" stroke-width="1"/><ellipse cx="${b[0]}" cy="${b[1] - 15.4}" rx="8.6" ry="3.2" fill="#7f9a5a"/>`;
  for (let k = 0; k < 8; k++) { const u = isoRnd(40 + k), v = isoRnd(80 + k); s += `<ellipse cx="${(b[0] - 6 + u * 12).toFixed(1)}" cy="${(b[1] - 16.5 + v * 2.5).toFixed(1)}" rx="1.4" ry="1" fill="#9db37a" stroke="#6f8a4e" stroke-width=".4"/>` }
  [[x + 10, y + 10], [x + 14, y + 14], [x + 6, y + 13]].forEach(([gx, gy]) => { const p = isoP(o, gx, gy, 0); s += `<ellipse cx="${p[0]}" cy="${p[1]}" rx="1.8" ry="1.2" fill="#9db37a" stroke="#6f8a4e" stroke-width=".4"/>` });
  return s;
}
/* Pallet de madera con sacos de yute acostados: de a dos por capa y cada capa cruzada respecto de la de abajo. */
function isoPallet(o) {
  const PX = 86, PY = 15, PW = 26, PD = 28, pine = '#c9a170', LH = 4.4, base = 3.8;
  let s = '';
  [PX, PX + PW / 2 - 1.5, PX + PW - 3].forEach(x => { s += isoBox(o, x, PY, 0, 3, PD, .8, isoShade(pine, .9)) });
  [PY, PY + PD / 2 - 1.5, PY + PD - 3].forEach(y => [PX, PX + PW / 2 - 1.5, PX + PW - 3].forEach(x => { s += isoBox(o, x, y, .8, 3, 3, 2.2, isoShade(pine, .85)) }));
  s += isoBox(o, PX, PY, 3, PW, PD, .8, pine);
  for (let L = 0; L < 5; L++) [.25, .75].forEach((f, j) => {
    const col = isoShade('#c9ad7c', .9 + isoRnd(L * 7 + j) * .16), z = base + LH * L;
    const [x, y, w, d] = L % 2 === 0 ? [PX + .3, PY + PD * f - PD / 4 + .3, PW - .6, PD / 2 - .6] : [PX + PW * f - PW / 4 + .3, PY + .3, PW / 2 - .6, PD - .6];
    s += isoBox(o, x, y, z, w, d, LH, col, isoShade(col, 1.08));
    /* Lomo del saco: un abultado más claro en el medio de la cara de arriba */
    const c = isoP(o, x + w / 2, y + d / 2, z + LH + .2);
    s += `<ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="${((w + d) * .3).toFixed(1)}" ry="${((w + d) * .14).toFixed(1)}" fill="${isoShade(col, 1.14)}" opacity=".7"/>`;
  });
  return s;
}
const MAP_PLACES = [
  { place: 'La finca', top: '#a7c48a', col: '#8c6b4a', ic: '<path d="M12 21V11"/><path d="M12 13c-5 0-7-4-7-8 4 0 7 3 7 8zM12 11c4 0 6-3 6-7-4 0-6 3-6 7z"/>',
    land: o => isoHills(o) + [[74, 64], [92, 66], [74, 84], [92, 86], [74, 104], [92, 104], [56, 98]].map(([x, y]) => isoTree(o, x, y, .9, '#6f8a5e', true)).join('') + isoTree(o, 20, 96, 1.2) },
  { place: 'El beneficio', hint: 'donde se procesa', top: '#ead9b2', col: '#a07c58', ic: '<circle cx="17" cy="6" r="3"/><path d="M3 15h16M5 15v5M17 15v5"/><path d="M4 13c2-2 4-2 6 0s4 2 6 0"/>',
    /* Marquesina a la izquierda; camas africanas a la derecha (una con cerezas: proceso natural). */
    land: o => isoTunnel(o, 6, 8, 42, 74, 30) + isoBed(o, 58, 10, 52, 18, 14, 'pergamino', 2) + isoBed(o, 58, 38, 52, 18, 14, 'cereza', 3) + isoBed(o, 62, 66, 44, 16, 14, 'pergamino', 4)
      + isoTree(o, 110, 104, 1) + `<g class="map-float">${isoAt(o, 96, 4, 96, (x, y) => `<circle cx="${x}" cy="${y}" r="11" fill="#f0d27e"/>`)}</g>` },
  { place: 'El puerto', top: '#dcd6c8', col: '#8f8a7c', ic: '<path d="M3 20V9l9-5 9 5v11"/><path d="M8 20v-5h8v5"/>',
    land: o => isoBox(o, 10, 10, 0, 64, 52, 34, '#d8cfbf', '#e6dfd1') + isoRoof(o, 10, 10, 34, 64, 52, 20, '#9a7c62') + isoBox(o, 72, 30, 0, 1, 18, 22, '#7a6a55') + [[84, 74], [96, 70], [90, 84], [30, 90], [42, 92]].map(([x, y]) => isoSack(o, x, y)).join('')
      + isoAt(o, MAP_IW + 30, 8, -19, (x, y) => `<ellipse cx="${x}" cy="${y}" rx="42" ry="24" fill="#8fc3d4" opacity=".55"/>`)
      + `<g class="map-boat">${isoAt(o, MAP_IW + 4, 20, -6, (x, y) => `<path d="M${x + 6} ${y + 4}h52l-8 12h-38z" fill="#5c625a"/><rect x="${x + 14}" y="${y - 8}" width="12" height="12" fill="#c0503d"/><rect x="${x + 27}" y="${y - 8}" width="12" height="12" fill="#6f8a5e"/><rect x="${x + 40}" y="${y - 8}" width="12" height="12" fill="#c9ad7c"/>`)}</g>` },
  { place: 'La tostadora', top: '#e6d3bc', col: '#94705a', ic: '<ellipse cx="12" cy="12" rx="5" ry="8" transform="rotate(20 12 12)"/><path d="M10 5c3 5 3 9 0 14"/>',
    /* El tostador de la Academia y su mesa, achicados (.72) y corridos hacia atrás; pallet con sacos y saco abierto. */
    land: o => { const pv = isoP(o, 54, 48, 0), tg = isoP(o, 52, 40, 0); return isoTree(o, 10, 62, 1) + `<g transform="translate(${tg[0]} ${tg[1]}) scale(.72) translate(${-pv[0]} ${-pv[1]})">${isoRoastery(o)}</g>` + isoOpenSack(o, 40, 82) + isoPallet(o) } },
  { place: 'La barra', top: '#dde2d8', col: '#8b9187', ic: '<path d="M5 4h14l-5 8h-4z"/><path d="M7 15h10v5H7z"/>',
    land: o => isoTree(o, 104, 20, 1) + isoTree(o, 20, 24, .9, '#6f8a5e') + isoBar(o) },
  { place: 'La mesa de cata', top: '#f0e4d1', col: '#a88a68', ic: '<path d="M4 10h13v4a6 6 0 0 1-13 0z"/><path d="M17 11h2a2 2 0 0 1 0 4h-2"/><path d="M8 7c-1-1 1-2 0-3M12 7c-1-1 1-2 0-3"/>',
    land: o => isoCupping(o) + isoTree(o, 100, 98, 1) }
];
const mapOrigin = i => [i % 2 ? 268 : 132, MAP_TOP + i * MAP_GAP];
const mapFront = i => isoP(mapOrigin(i), MAP_IW / 2, MAP_ID, 0);

/* ---------- Mundo ---------- */
/* Baldosas del camino entre dos puntos de pantalla (a → b); verdes en el tramo recorrido. */
function mapTiles(a, b, lit) {
  let s = '';
  const n = 7, col = on => on ? ['#a9bf98', '#7f9670', '#8faa7e'] : ['#e8d9b8', '#c2ad87', '#d4c09a'];
  for (let k = 1; k < n; k++) {
    const t = k / n, cx = a[0] + (b[0] - a[0]) * t, cy = a[1] + (b[1] - a[1]) * t + 6, w = 15, h = 8;
    const tile = ([top, left, right]) => isoPoly([[cx, cy - h], [cx + w, cy], [cx, cy + h], [cx - w, cy]], top) + isoPoly([[cx - w, cy], [cx, cy + h], [cx, cy + h + 5], [cx - w, cy + 5]], left) + isoPoly([[cx, cy + h], [cx + w, cy], [cx + w, cy + 5], [cx, cy + h + 5]], right);
    s += tile(col(lit));
  }
  return s;
}
/* Una isla con su lugar, en el origen o. */
function mapIsland(i, o) {
  return isoIsleBase(i, o) + MAP_PLACES[i].land(o);
}
function mapScene() {
  let s = [[70, 40, 1], [320, 300, .8], [60, 600, .7], [330, 900, .9], [80, 1250, .7]].map(([x, y, k]) => `<g opacity=".8" transform="translate(${x} ${y}) scale(${k})" fill="#fff"><ellipse rx="26" ry="9"/><ellipse cx="-12" cy="-5" rx="13" ry="9"/><ellipse cx="12" cy="-7" rx="15" ry="11"/></g>`).join('');
  /* Cada isla y, después, el tramo de camino que sale de ella (pasa por delante de su roca y llega por detrás
     a la siguiente). Toda la isla se puede tocar para abrir su ficha (el botón redondo sigue siendo el acceso con teclado). */
  MAP_PLACES.forEach((m, i) => {
    s += `<g class="map-isle" data-a="mapNode" data-v="${i}">${mapIsland(i, mapOrigin(i))}</g>`;
    if (i < SC.length - 1) s += mapTiles(mapFront(i), isoP(mapOrigin(i + 1), MAP_IW / 2, 0, 0), stDone(i));
  });
  return `<svg class="map-scene" viewBox="0 0 ${MAP_W} ${MAP_H}" aria-hidden="true">${s}</svg>`;
}
/* Isla sola, para la portada de cada estación. */
function islandThumb(i) {
  return `<svg class="isle-svg" viewBox="0 0 230 290" aria-hidden="true">${mapIsland(i, [115, 102])}</svg>`;
}

/* head: título y avance, que se muestran dentro del cielo, arriba del mapa. */
function mapWorld(cur, head = '') {
  const pos = i => { const f = mapFront(i); return `left:${(f[0] / MAP_W * 100).toFixed(2)}%;top:${((f[1] + 10) / MAP_H * 100).toFixed(2)}%` };
  const nodes = SC.map((c, i) => {
    const ok = stDone(i), here = i === cur;
    return `<button type="button" class="map-node ${i % 2 ? '' : 'is-left'} ${ok ? 'is-done' : ''} ${here ? 'is-cur' : ''}" data-a="mapNode" data-v="${i}" style="${pos(i)}" aria-label="Estación ${i + 1}: ${c.t}${ok ? ' (completa)' : here ? ' (estás acá)' : ''}">${here ? '<span class="map-ring"></span>' : ''}<span class="map-badge"><svg viewBox="0 0 24 24" aria-hidden="true">${MAP_PLACES[i].ic}</svg></span>${ok ? '<span class="map-check" aria-hidden="true">✓</span>' : ''}<span class="map-name" aria-hidden="true"><b>${i + 1} · ${c.t}</b><small>${MAP_PLACES[i].place}${MAP_PLACES[i].hint ? ', ' + MAP_PLACES[i].hint : ''}</small></span></button>`;
  }).join('');
  const me = cur >= 0 ? (() => { const f = mapFront(cur); return `<div class="map-me" style="left:${(f[0] / MAP_W * 100).toFixed(2)}%;top:calc(${((f[1] + 10) / MAP_H * 100).toFixed(2)}% - 44px)" aria-hidden="true"><span>Estás acá</span><i></i></div>` })() : '';
  return `<div class="map-world" data-t3="map"><div class="map-sky-head">${head}</div>${mapScene()}${nodes}${me}</div>`;
}

/* Lo que muestra el panel lateral (computadora) y el botón flotante (celu) sobre la estación actual. */
function mapNowHTML(i) {
  const c = SC[i], started = startedSt(i), j = stepIdx(c);
  const chips = c.steps.map((s, k) => `<span class="${started && k === j ? 'is-cur' : stepDone(c, s) ? 'is-done' : ''}">${s.label}</span>`).join('');
  return `<div class="map-place">Estás acá · Estación ${i + 1} de ${SC.length}</div><h3>${c.t}</h3><p class="m">${c.md}</p><div class="map-steps">${chips}</div><a class="b p" href="#${stepPath(i)}">${started ? `Continuar con ${curStep(c).label}` : 'Empezar'}</a>`;
}
const mapFabLabel = i => { const c = SC[i]; return startedSt(i) ? `Continuar: ${curStep(c).label}` : doneCount() ? `Empezar: ${c.t}` : 'Empezar por la estación 1' };

/* ---------- Ficha de cada estación ---------- */
function mapSheetHTML(i) {
  const c = SC[i], ok = stDone(i), started = startedSt(i), here = i === suggestedStation(), j = stepIdx(c);
  const chips = c.steps.map((s, k) => `<span class="${here && started && !ok && k === j ? 'is-cur' : stepDone(c, s) ? 'is-done' : ''}">${s.label}</span>`).join('');
  const label = ok ? 'Repasar' : started ? `Continuar con ${curStep(c).label}` : 'Empezar';
  return `<div class="sheet-art scene-fade">${islandThumb(i)}</div><div class="map-place">Estación ${i + 1} de ${SC.length} · ${MAP_PLACES[i].place}</div><h3 id="map-dlg-title">${c.t}</h3><p>${c.md}</p><div class="map-steps">${chips}</div><div class="bar"><a class="b p" href="#${stepPath(i)}">${label}</a><button type="button" class="b" data-a="mapClose">Cerrar</button></div>`;
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
