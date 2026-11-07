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
/* Mesa de cata: bowls de cerámica con la costra de café, cucharitas de cata junto a cada uno,
   un vaso de enjuague con cucharas y la planilla con un lápiz. */
function isoCupping(o) {
  const T = 16, poly = a => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  let s = [[14, 22], [100, 22], [14, 82], [100, 82]].map(([x, y]) => isoBox(o, x, y, 0, 4, 4, T - 3, '#6e4f37')).join('');
  s += isoBox(o, 10, 18, T - 3, 96, 70, 3, '#8a6748', '#efe9de');
  /* Planilla y lápiz (atrás a la izquierda) */
  const sh = [isoP(o, 14, 22, T + .1), isoP(o, 30, 22, T + .1), isoP(o, 30, 34, T + .1), isoP(o, 14, 34, T + .1)];
  s += `<polygon points="${poly(sh)}" fill="#fff" stroke="#d9d4ca" stroke-width=".6"/>`;
  for (let k = 1; k < 5; k++) { const a = isoP(o, 16, 22 + k * 2.3, T + .2), b = isoP(o, 28, 22 + k * 2.3, T + .2); s += `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="#cfc9bd" stroke-width=".5"/>` }
  { const a = isoP(o, 32, 23, T + .6), b = isoP(o, 33, 33, T + .6); s += `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="#e0b440" stroke-width="2" stroke-linecap="round"/>` }
  /* Vaso de enjuague con dos cucharas (atrás a la derecha) */
  const gb = isoP(o, 96, 28, T), gt = isoP(o, 96, 28, T + 10);
  [[-1.5, -9], [2, -11]].forEach(([dx, dy]) => { s += `<path d="M${gt[0] + dx} ${gt[1] + 6}L${gt[0] + dx + 2} ${gt[1] + dy}" stroke="#b9bcbf" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="${gt[0] + dx + 2.4}" cy="${gt[1] + dy - 1}" rx="2" ry="1.4" fill="#d8dadc" stroke="#9ea2a6" stroke-width=".5"/>` });
  s += `<path d="M${gb[0] - 4.4} ${gb[1]}L${gt[0] - 4.8} ${gt[1]}h9.6L${gb[0] + 4.4} ${gb[1]}z" fill="#dcebf0" opacity=".7" stroke="#9fb9c2" stroke-width=".7"/><ellipse cx="${gt[0]}" cy="${gt[1]}" rx="4.8" ry="2" fill="#e8f2f5" stroke="#9fb9c2" stroke-width=".7"/><ellipse cx="${gb[0]}" cy="${gb[1] - 3}" rx="4.4" ry="1.7" fill="#bcd8e2" opacity=".8"/>`;
  /* Bowls de cata en dos filas, cada uno con su cucharita al lado */
  const spoon = (x, y) => { const a = isoP(o, x, y, T + .4), b = isoP(o, x + 9, y + 1, T + .4); return `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="#a7abaf" stroke-width="1.3" stroke-linecap="round"/><ellipse cx="${a[0] - 1.6}" cy="${a[1] - .4}" rx="2.6" ry="1.8" fill="#dfe1e3" stroke="#8f9397" stroke-width=".6"/><ellipse cx="${a[0] - 1.5}" cy="${a[1] - .6}" rx="1.5" ry=".9" fill="#b9bcbf"/>` };
  const bowl = (x, y, k) => {
    let b = isoCyl(o, x, y, T, 6.5, 4.5, '#ece9e3', '#f6f4ef');
    const c = isoP(o, x, y, T + 4.5);
    b += `<ellipse cx="${c[0]}" cy="${c[1]}" rx="6.6" ry="3.8" fill="#6b3f26"/><ellipse cx="${c[0] - .6}" cy="${c[1] - .3}" rx="5" ry="2.8" fill="#8a5a36"/>`;
    for (let j = 0; j < 5; j++) { const u = isoRnd(900 + k * 9 + j) * 2 - 1, v = isoRnd(950 + k * 9 + j) * 2 - 1; b += `<circle cx="${(c[0] + u * 4).toFixed(1)}" cy="${(c[1] + v * 2).toFixed(1)}" r=".7" fill="#c49a6c"/>` }
    return b;
  };
  let k = 0;
  /* Dos filas de tres, simétricas y centradas en la mesa, con la cucharita delante de cada bowl. */
  [[38, 44], [58, 44], [78, 44], [38, 66], [58, 66], [78, 66]].sort((a, b) => (a[0] + a[1]) - (b[0] + b[1])).forEach(([x, y]) => { s += spoon(x - 4, y + 9) + bowl(x, y, k++) });
  return s;
}
/* Barra: mostrador con una máquina de espresso roja de dos grupos y un V60 sobre su server. */
function isoBar(o) {
  const T = 24, S = '#d9d9d6';
  let s = isoBox(o, 8, 50, 0, 102, 34, T, '#8a6748', '#ece6db');
  /* Máquina de espresso: un perfil de costado (y-z) extendido a lo ancho (x).
     Atrás baja en curva; arriba, la cabeza sobresale con los grupos; abajo, la base con la bandeja;
     en el medio, el hueco de trabajo de acero. Cada cara se sombrea según hacia dónde mira. */
  const mx = 12, my = 52, mw = 58, D = 24, H = 30, z0 = T + 2;
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
  /* V60 sobre su server (un poco más grande que la escala real, para que se lea) */
  const vx = 92, vy = 66, sb = isoP(o, vx, vy, T), st = isoP(o, vx, vy, T + 11);
  s += `<g transform="translate(${sb[0]} ${sb[1]}) scale(1.35) translate(${-sb[0]} ${-sb[1]})">`;
  s += `<path d="M${sb[0] - 6} ${sb[1]}q-1-6 1-11h10q2 5 1 11z" fill="#dbe7ec" opacity=".75" stroke="#9fb3bb" stroke-width=".8"/><path d="M${sb[0] - 5.6} ${sb[1] - 1}q0-3 .6-5h10q.6 2 .6 5z" fill="#5a3522" opacity=".9"/><ellipse cx="${st[0]}" cy="${st[1]}" rx="5.6" ry="2.4" fill="#cfdde3" stroke="#9fb3bb" stroke-width=".8"/>`;
  const vb = isoP(o, vx, vy, T + 12), vt = isoP(o, vx, vy, T + 21);
  s += `<ellipse cx="${vb[0]}" cy="${vb[1]}" rx="6" ry="2.6" fill="#e9e6e0" stroke="#bdb8ae" stroke-width=".7"/><path d="M${vb[0] - 2.4} ${vb[1] - 1}L${vt[0] - 8.5} ${vt[1]}h17L${vb[0] + 2.4} ${vb[1] - 1}z" fill="#f6f4f0" stroke="#bdb8ae" stroke-width=".8"/><ellipse cx="${vt[0]}" cy="${vt[1]}" rx="8.5" ry="3.6" fill="#ece8e0" stroke="#bdb8ae" stroke-width=".8"/><ellipse cx="${vt[0]}" cy="${vt[1] + .3}" rx="6.4" ry="2.5" fill="#fbfaf7"/><ellipse cx="${vt[0]}" cy="${vt[1] + .6}" rx="4" ry="1.5" fill="#6b4630"/></g>`;
  return s;
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
  /* Saco de yute abierto con café verde, y algunos granos caídos */
  const sb = isoP(o, 100, 94, 0);
  s += `<path d="M${sb[0] - 12} ${sb[1] - 22}q-3 16 1 22q11 5 22 0q4-6 1-22z" fill="#c9ad7c" stroke="#9c8358" stroke-width="1"/><path d="M${sb[0] - 9} ${sb[1] - 14}q9 3 18 0M${sb[0] - 10} ${sb[1] - 7}q10 3 20 0" stroke="#b0955f" stroke-width=".8" fill="none"/>`;
  s += `<ellipse cx="${sb[0]}" cy="${sb[1] - 22}" rx="13" ry="5" fill="#b8975f" stroke="#9c8358" stroke-width="1"/><ellipse cx="${sb[0]}" cy="${sb[1] - 22.5}" rx="10" ry="3.6" fill="#7f9a5a"/>`;
  for (let k = 0; k < 9; k++) { const u = isoRnd(40 + k), v = isoRnd(80 + k); s += `<ellipse cx="${(sb[0] - 8 + u * 16).toFixed(1)}" cy="${(sb[1] - 24 + v * 3).toFixed(1)}" rx="1.6" ry="1.1" fill="#9db37a" stroke="#6f8a4e" stroke-width=".4"/>` }
  [[86, 104], [90, 110], [94, 106]].forEach(([x, y]) => { const p = isoP(o, x, y, 0); s += `<ellipse cx="${p[0]}" cy="${p[1]}" rx="1.8" ry="1.2" fill="#9db37a" stroke="#6f8a4e" stroke-width=".4"/>` });
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
/* MAP_TOP deja lugar arriba para el título, que va dentro del cielo. */
const MAP_W = 400, MAP_IW = 118, MAP_ID = 118, MAP_IH = 30, MAP_GAP = 262, MAP_TOP = 170;
const MAP_H = MAP_TOP + 5 * MAP_GAP + 230;
const MAP_PLACES = [
  { place: 'La finca', top: '#a7c48a', col: '#8c6b4a', ic: '<path d="M12 21V11"/><path d="M12 13c-5 0-7-4-7-8 4 0 7 3 7 8zM12 11c4 0 6-3 6-7-4 0-6 3-6 7z"/>',
    land: o => isoMount(o, 4, 4, 62, 54, 70, '#8fae74', true) + isoMount(o, 50, 2, 50, 46, 48, '#9db886') + [[74, 64], [92, 66], [74, 84], [92, 86], [74, 104], [92, 104], [56, 98]].map(([x, y]) => isoTree(o, x, y, .9, '#6f8a5e', true)).join('') + isoTree(o, 20, 96, 1.2) },
  { place: 'El beneficio', top: '#ead9b2', col: '#a07c58', ic: '<circle cx="17" cy="6" r="3"/><path d="M3 15h16M5 15v5M17 15v5"/><path d="M4 13c2-2 4-2 6 0s4 2 6 0"/>',
    /* Marquesina a la izquierda; camas africanas a la derecha (una con cerezas: proceso natural). */
    land: o => isoTunnel(o, 6, 8, 42, 74, 30) + isoBed(o, 58, 10, 52, 18, 14, 'pergamino', 2) + isoBed(o, 58, 38, 52, 18, 14, 'cereza', 3) + isoBed(o, 62, 66, 44, 16, 14, 'pergamino', 4)
      + isoTree(o, 110, 104, 1) + `<g class="map-float">${isoAt(o, 96, 4, 96, (x, y) => `<circle cx="${x}" cy="${y}" r="11" fill="#f0d27e"/>`)}</g>` },
  { place: 'El puerto', top: '#dcd6c8', col: '#8f8a7c', ic: '<path d="M3 20V9l9-5 9 5v11"/><path d="M8 20v-5h8v5"/>',
    land: o => isoBox(o, 10, 10, 0, 64, 52, 34, '#d8cfbf', '#e6dfd1') + isoRoof(o, 10, 10, 34, 64, 52, 20, '#9a7c62') + isoBox(o, 72, 30, 0, 1, 18, 22, '#7a6a55') + [[84, 74], [96, 70], [90, 84], [30, 90], [42, 92]].map(([x, y]) => isoSack(o, x, y)).join('')
      + `<g class="map-boat">${isoAt(o, MAP_IW + 4, 20, -6, (x, y) => `<path d="M${x + 6} ${y + 4}h52l-8 12h-38z" fill="#5c625a"/><rect x="${x + 14}" y="${y - 8}" width="12" height="12" fill="#c0503d"/><rect x="${x + 27}" y="${y - 8}" width="12" height="12" fill="#6f8a5e"/><rect x="${x + 40}" y="${y - 8}" width="12" height="12" fill="#c9ad7c"/>`)}</g>` },
  { place: 'La tostadora', top: '#e6d3bc', col: '#94705a', ic: '<ellipse cx="12" cy="12" rx="5" ry="8" transform="rotate(20 12 12)"/><path d="M10 5c3 5 3 9 0 14"/>',
    land: o => isoRoastery(o) + isoTree(o, 12, 100, 1) },
  { place: 'La barra', top: '#dde2d8', col: '#8b9187', ic: '<path d="M5 4h14l-5 8h-4z"/><path d="M7 15h10v5H7z"/>',
    land: o => isoTree(o, 104, 20, 1) + isoTree(o, 20, 24, .9, '#6f8a5e') + isoBar(o) },
  { place: 'La mesa de cata', top: '#f0e4d1', col: '#a88a68', ic: '<path d="M4 10h13v4a6 6 0 0 1-13 0z"/><path d="M17 11h2a2 2 0 0 1 0 4h-2"/><path d="M8 7c-1-1 1-2 0-3M12 7c-1-1 1-2 0-3"/>',
    land: o => isoCupping(o) + isoTree(o, 104, 104, 1) }
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
/* head: título y avance, que se muestran dentro del cielo, arriba del mapa. */
function mapWorld(cur, head = '') {
  const pos = i => { const f = mapFront(i); return `left:${(f[0] / MAP_W * 100).toFixed(2)}%;top:${((f[1] + 10) / MAP_H * 100).toFixed(2)}%` };
  const nodes = SC.map((c, i) => {
    const ok = stDone(i), here = i === cur;
    return `<button type="button" class="map-node ${ok ? 'is-done' : ''} ${here ? 'is-cur' : ''}" data-a="mapNode" data-v="${i}" style="${pos(i)}" aria-label="Estación ${i + 1}: ${c.t}${ok ? ' (completa)' : here ? ' (estás acá)' : ''}">${here ? '<span class="map-ring"></span>' : ''}<span class="map-badge"><svg viewBox="0 0 24 24" aria-hidden="true">${MAP_PLACES[i].ic}</svg></span>${ok ? '<span class="map-check" aria-hidden="true">✓</span>' : ''}<span class="map-name" aria-hidden="true">${MAP_PLACES[i].place}</span></button>`;
  }).join('');
  const me = cur >= 0 ? (() => { const f = mapFront(cur); return `<div class="map-me" style="left:${(f[0] / MAP_W * 100).toFixed(2)}%;top:calc(${((f[1] + 10) / MAP_H * 100).toFixed(2)}% - 44px)" aria-hidden="true"><span>Estás acá</span><i></i></div>` })() : '';
  return `<div class="map-world"><div class="map-sky-head">${head}</div>${mapScene()}${nodes}${me}</div>`;
}

/* Lo que muestra el panel lateral (computadora) y el botón flotante (celu) sobre la estación actual. */
function mapNowHTML(i) {
  const c = SC[i], started = startedSt(i), j = stepIdx(c);
  const chips = c.steps.map((s, k) => `<span class="${started && k === j ? 'is-cur' : stepDone(c, s) ? 'is-done' : ''}">${s.label}</span>`).join('');
  return `<div class="map-place">Estás acá · ${MAP_PLACES[i].place}</div><h3>${c.t}</h3><p class="m">${c.md}</p><div class="map-steps">${chips}</div><a class="b p" href="#${stepPath(i)}">${started ? `Continuar con ${curStep(c).label}` : 'Empezar'}</a>`;
}
const mapFabLabel = i => { const c = SC[i]; return startedSt(i) ? `Continuar: ${curStep(c).label}` : `Empezar: ${c.t}` };

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
