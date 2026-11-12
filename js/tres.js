/* ============================================================
   .campus · mapa de islas en 3D con three.js
   El mapa de la Academia (js/academia/mapa.js) se dibuja primero en SVG
   dentro de un elemento con data-t3="map". Ese SVG es el respaldo.
   - Cuando aparece en la página, se baja three.js (una sola vez, desde
     jsDelivr). Si no hay WebGL o no hay conexión, queda el SVG.
   - Si carga, el mapa 3D se monta encima del SVG y lo reemplaza.
   Respeta "reducir movimiento": sin animaciones ni movimiento de cámara.
   ============================================================ */

const T3 = (() => {
  const URL3 = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';
  let THREE = null, state = 'idle'; /* idle | loading | ready | off */
  const views = new Set(), byKey = new Map(), KINDS = {};
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = (max = 2) => Math.min(max, window.devicePixelRatio || 1);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  function webgl() {
    try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch (e) { return false }
  }
  function load() {
    if (state !== 'idle') return;
    if (!webgl()) { state = 'off'; return }
    state = 'loading';
    import(URL3).then(m => { THREE = m; state = 'ready'; scan() }).catch(() => { state = 'off' });
  }

  /* ---------- Montaje ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    const v = e.target.__t3v; if (!v) return;
    v.vis = e.isIntersecting; if (v.vis) { v.dirty = true; kick() }
  }), { rootMargin: '120px' }) : null;

  function scan() {
    const els = document.querySelectorAll('[data-t3]:not(.t3-on)');
    if (!els.length) return;
    if (state === 'idle') return load();
    if (state !== 'ready') return;
    els.forEach(el => { try { mount(el) } catch (e) { console.warn('[3D] no se pudo montar', el.dataset.t3, e) } });
    kick();
  }
  function mount(el) {
    const kind = el.dataset.t3, key = el.dataset.t3k;
    let v = key && byKey.get(key);
    if (v && v.kind === kind) v.adopt(el);
    else {
      if (!KINDS[kind]) return;
      v = KINDS[kind](el); v.kind = kind; v.vis = true; v.el = el;
      views.add(v); if (key) byKey.set(key, v);
      v.canvas.__t3v = v; if (io) io.observe(v.canvas);
    }
    el.classList.add('t3-on'); el.__t3 = v; v.el = el; v.dirty = true;
  }
  function drop(v) {
    views.delete(v);
    for (const [k, x] of byKey) if (x === v) byKey.delete(k);
    if (io) io.unobserve(v.canvas);
    try { v.dispose() } catch (e) {}
  }

  /* ---------- Un solo bucle de animación para todos los gráficos ---------- */
  let raf = 0, last = 0;
  function kick() { if (!raf && views.size) raf = requestAnimationFrame(tick) }
  function tick(now) {
    raf = 0;
    const dt = last ? Math.min(.05, (now - last) / 1000) : .016; last = now;
    let again = false;
    for (const v of [...views]) {
      if (!v.el.isConnected) { drop(v); continue }
      if (!v.vis) continue;
      try { if (v.frame(now / 1000, dt)) again = true } catch (e) { console.warn('[3D]', e); drop(v); v.el.classList.remove('t3-on') }
    }
    if (again) kick(); else last = 0;
  }

  /* Al cambiar la página, se buscan gráficos nuevos. */
  let pend = false;
  new MutationObserver(() => { if (pend) return; pend = true; queueMicrotask(() => { pend = false; scan() }) })
    .observe(document.body, { childList: true, subtree: true });

  function poke(el) {
    const v = el && el.__t3;
    if (!v || !views.has(v) || !el.isConnected) return false;
    v.dirty = true; kick(); return true;
  }

  /* ---------- Utilidades de three.js ---------- */
  function disposeTree(o) {
    o.traverse(n => {
      if (n.geometry && !n.geometry.__shared) n.geometry.dispose();
      const m = n.material; if (m) (Array.isArray(m) ? m : [m]).forEach(x => { if (!x.__shared) { if (x.map) x.map.dispose(); x.dispose() } });
    });
  }


  /* ============================================================
     Mapa de islas en 3D
     Mismo mundo que js/academia/mapa.js: cada punto (x, y, z) del dibujo
     isométrico es un punto real en 3D, y la cámara ortográfica mira desde
     el mismo ángulo. Por eso los botones de cada estación (HTML encima)
     quedan en su lugar. En la computadora, la cámara acompaña un poco al
     mouse y los botones se acomodan solos.
     Coordenadas: x e y del mapa van en el piso; z es la altura.
     En three.js: X = x, Y = z (arriba), Z = y.
     ============================================================ */
  const ISO_K = Math.sqrt(1.5); /* unidades del dibujo por unidad 3D */
  const ISO_2C = 2 * Math.cos(Math.PI / 6);
  /* Punto del mundo cuyo dibujo isométrico cae en (sx, sy) a la altura z (inversa de isoP con origen 0). */
  const scrToWorld = (sx, sy, z = 0) => [sy + z + sx / ISO_2C, sy + z - sx / ISO_2C];

  function buildMap() {
    const V3 = THREE.Vector3, matCache = new Map();
    const mat = (c, o = {}) => {
      const k = c + JSON.stringify(o);
      if (!matCache.has(k)) { const m = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .92, metalness: 0, flatShading: true }, o)); m.__shared = true; matCache.set(k, m) }
      return matCache.get(k);
    };
    const shared = g => { g.__shared = true; return g };
    const BOX = shared(new THREE.BoxGeometry(1, 1, 1)), BALL = shared(new THREE.SphereGeometry(1, 14, 10)), ICO = shared(new THREE.IcosahedronGeometry(1, 1));
    const CYL = shared(new THREE.CylinderGeometry(1, 1, 1, 28)), ROD = shared(new THREE.CylinderGeometry(1, 1, 1, 8));
    const sh = m => { m.castShadow = true; m.receiveShadow = true; return m };
    const add = (g, m) => { g.add(m); return m };

    const box = (g, x, y, z, w, d, h, c, top) => {
      const m = sh(new THREE.Mesh(BOX, top ? [mat(c), mat(c), mat(top), mat(c), mat(c), mat(c)] : mat(c)));
      m.scale.set(w, h, d); m.position.set(x + w / 2, z + h / 2, y + d / 2); return add(g, m);
    };
    const cyl = (g, x, y, z, r, h, c, top, o) => {
      const m = sh(new THREE.Mesh(CYL, [mat(c, o), mat(top || c, o), mat(c, o)]));
      m.scale.set(r, h, r); m.position.set(x, z + h / 2, y); return add(g, m);
    };
    const ball = (g, x, y, z, rx, rz, ry, c, geo = BALL, o) => {
      const m = sh(new THREE.Mesh(geo, mat(c, o))); m.scale.set(rx, rz, ry); m.position.set(x, z, y); return add(g, m);
    };
    /* Barra entre dos puntos del mundo [x, y, z]. */
    const rod = (g, a, b, r, c, o) => {
      const A = new V3(a[0], a[2], a[1]), B = new V3(b[0], b[2], b[1]), d = B.clone().sub(A), m = sh(new THREE.Mesh(ROD, mat(c, o)));
      m.scale.set(r, d.length(), r); m.position.copy(A).add(B).multiplyScalar(.5);
      m.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.normalize()); return add(g, m);
    };
    const shapeOf = pts => { const s = new THREE.Shape(); pts.forEach(([u, v], i) => i ? s.lineTo(u, v) : s.moveTo(u, v)); return s };
    /* Perfil en el plano (y, z), extruido a lo largo de x desde x0. */
    const prismX = (g, pts, x0, len, c, o) => {
      const geo = new THREE.ExtrudeGeometry(shapeOf(pts.map(([y, z]) => [-y, z])), { depth: len, bevelEnabled: false, curveSegments: 8 });
      geo.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, x0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 0, 1));
      return add(g, sh(new THREE.Mesh(geo, mat(c, o))));
    };
    /* Pirámide de base rectangular (montaña), con nieve opcional en la punta. */
    const PYR = shared(new THREE.ConeGeometry(1, 1, 4).rotateY(Math.PI / 4).translate(0, .5, 0));
    const mount = (g, x, y, w, d, h, c, snow) => {
      const m = sh(new THREE.Mesh(PYR, mat(c))); m.scale.set(w / Math.SQRT2, h, d / Math.SQRT2); m.position.set(x + w / 2, 0, y + d / 2); add(g, m);
      if (snow) { const s = sh(new THREE.Mesh(PYR, mat('#fbfbf8'))); s.scale.set(w / Math.SQRT2 * .3, h * .3, d / Math.SQRT2 * .3); s.position.set(x + w / 2, h * .705, y + d / 2); add(g, s) }
    };
    const tree = (g, x, y, s, c = '#7f9a6c', berries) => {
      cyl(g, x, y, 0, 1.5 * s, 8 * s, '#7a5a40');
      ball(g, x, y, 13 * s, 8 * s, 7.4 * s, 8 * s, isoShade(c, .9), ICO);
      ball(g, x - 1.5 * s, y + 1.5 * s, 16.5 * s, 5.4 * s, 5 * s, 5.4 * s, c, ICO);
      if (berries) [[5.6, 3, -1, '#c0503d'], [2.5, 6.4, 2, '#c0503d'], [5.5, 4.6, 3.5, '#d97a4e'], [6.8, -1, 1.5, '#c0503d']].forEach(([dx, dy, dz, bc]) => ball(g, x + dx * s, y + dy * s, 13 * s + dz * s, 1.5 * s, 1.5 * s, 1.5 * s, bc));
    };
    const sack = (g, x, y) => {
      const m = sh(new THREE.Mesh(shared(SACK), mat('#c9ad7c'))); m.scale.set(1, 1, 1); m.position.set(x, 6.5, y); add(g, m);
      cyl(g, x, y, 10.5, 3.4, 1.2, '#9c8358');
    };
    const SACK = new THREE.CylinderGeometry(5, 6.6, 13, 14);
    /* Cama africana con granos (pergamino o cereza). */
    const bed = (g, x, y, w, d, h, kind = 'pergamino', seed = 1) => {
      const top = h + 3, legs = [[x, y], [x + w - 2, y], [x, y + d - 2], [x + w - 2, y + d - 2]];
      if (w > 40) legs.push([x + w / 2 - 1, y], [x + w / 2 - 1, y + d - 2]);
      legs.forEach(([lx, ly]) => box(g, lx, ly, 0, 2, 2, h, '#7a5a40'));
      box(g, x, y, h, w, d, 3, '#8a6748', '#efe7cf');
      const mesh = [];
      for (let k = 3; k < w; k += 3.5) mesh.push(x + k, top + .05, y + 1, x + k, top + .05, y + d - 1);
      for (let k = 3; k < d; k += 3.5) mesh.push(x + 1, top + .05, y + k, x + w - 1, top + .05, y + k);
      const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(mesh, 3));
      g.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: '#b9a77e', transparent: true, opacity: .6 })));
      const cherry = kind === 'cereza', spots = [], n = Math.round(w * d / 9);
      for (let k = 0; k < n; k++) {
        const u = isoRnd(seed * 100 + k), v = isoRnd(seed * 300 + k * 7);
        if (Math.abs(u - .5) + Math.abs(v - .5) > .62) continue;
        spots.push([x + 2 + u * (w - 4), y + 2 + v * (d - 4), isoRnd(seed * 500 + k) * Math.PI]);
      }
      const im = new THREE.InstancedMesh(BALL, mat(cherry ? '#7a3326' : '#d8c9a0', { flatShading: false, roughness: cherry ? .55 : .85 }), spots.length);
      const M = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = cherry ? new V3(1.6, 1.4, 1.6) : new V3(1.9, 1, 1.2);
      spots.forEach(([bx, by, a], i) => { q.setFromAxisAngle(new V3(0, 1, 0), a); M.compose(new V3(bx, top + .9, by), q, sc); im.setMatrixAt(i, M) });
      im.castShadow = true; im.receiveShadow = true; g.add(im);
    };
    /* Marquesina: túnel de plástico con arcos, a lo largo de y, con una cama adentro. */
    const tunnel = (g, x, y, w, len, h) => {
      const cx = x + w / 2, r = w / 2;
      box(g, x - 1, y, 0, 2, len, 2, '#7a5a40'); box(g, x + w - 1, y, 0, 2, len, 2, '#7a5a40');
      bed(g, x + 5, y + 6, w - 10, len - 12, 8, 'pergamino', 7);
      const skin = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 24, 1, true, Math.PI / 2, Math.PI).rotateX(Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: '#dcebf0', transparent: true, opacity: .32, roughness: .2, side: THREE.DoubleSide, depthWrite: false }));
      skin.scale.y = h / r; skin.position.set(cx, 0, y + len / 2); g.add(skin);
      const back = new THREE.Mesh(new THREE.CircleGeometry(r, 24, 0, Math.PI), new THREE.MeshStandardMaterial({ color: '#e3eff3', transparent: true, opacity: .5, side: THREE.DoubleSide, depthWrite: false }));
      back.scale.y = h / r; back.position.set(cx, 0, y); g.add(back);
      for (let j = 0; j <= 4; j++) { const a = sh(new THREE.Mesh(new THREE.TorusGeometry(r, .7, 6, 24, Math.PI), mat('#8fa9b2'))); a.scale.y = h / r; a.position.set(cx, 0, y + len * j / 4); g.add(a) }
    };
    /* Tostadora de muestras: mesa, tambor en forma de bala sobre patas en arco, tolva, frente y bandeja de enfriado. */
    const roastery = g => {
      [[10, 22], [96, 22], [10, 72], [96, 72]].forEach(([x, y]) => box(g, x, y, 0, 3, 3, 20, '#6e4f37'));
      box(g, 8, 20, 20, 92, 56, 3, '#8a6748', '#a98563');
      const T = 23, yc = 46, R = 16, zc = T + 9 + R, x0 = 22, xf = x0 + 46, xb = x0 - 6, cap = 16;
      const leg = x => { const pts = [], q = (a, b, c, t) => a * (1 - t) ** 2 + b * 2 * t * (1 - t) + c * t * t, wF = R * .9, wT = R * .5, zT = zc - R * .55, inW = wF - 5, inH = (zT - T) * .62;
        for (let k = 0; k <= 10; k++) { const t = k / 10; pts.push([q(yc - wF, yc - wF * .92, yc - wT, t), q(T, T + (zT - T) * .95, zT, t)]) }
        for (let k = 10; k >= 0; k--) { const t = k / 10; pts.push([q(yc + wF, yc + wF * .92, yc + wT, t), q(T, T + (zT - T) * .95, zT, t)]) }
        for (let k = 0; k <= 16; k++) { const a = k / 16 * Math.PI; pts.push([yc + inW * Math.cos(a), T + inH * Math.sin(a)]) }
        prismX(g, pts, x, 2.5, '#232323') };
      leg(x0 + 1); leg(xf - 5);
      const prof = [new THREE.Vector2(0, 0)];
      for (let k = 1; k <= 10; k++) { const th = k / 10 * Math.PI / 2; prof.push(new THREE.Vector2(R * Math.sin(th), cap * (1 - Math.cos(th)))) }
      prof.push(new THREE.Vector2(R, xf - xb), new THREE.Vector2(0, xf - xb));
      const drum = sh(new THREE.Mesh(new THREE.LatheGeometry(prof, 40).rotateZ(-Math.PI / 2), mat('#3b3b3b', { flatShading: false, roughness: .45, metalness: .5 })));
      drum.position.set(xb, zc, yc); g.add(drum);
      for (let k = 0; k < 6; k++) rod(g, [x0 + 12 + k * 3, yc + R * .45, zc + R * .9], [x0 + 6 + k * 3, yc + R * .85, zc + R * .5], .5, '#121212');
      box(g, xf - 10, yc - 2, zc + R - 2, 4, 4, 5, '#1b1b1b');
      const hop = sh(new THREE.Mesh(new THREE.CylinderGeometry(10, 2.5, 11, 24, 1, true), mat('#2a2a2a', { side: THREE.DoubleSide })));
      hop.position.set(xf - 8, zc + R + 8.5, yc); g.add(hop);
      cyl(g, xf - 8, yc, zc + R + 13.6, 8.6, .4, '#141414');
      /* Frente: panel con números, puerta de descarga y manija */
      const disc = (y, z, r, c) => { const m = sh(new THREE.Mesh(CYL, mat(c))); m.scale.set(r, 1, r); m.rotation.z = Math.PI / 2; m.position.set(xf + .5, z, y); g.add(m) };
      disc(yc - R * .45, zc + R * .4, 6.2, '#101010');
      box(g, xf + .9, yc - R * .45 - 3.2, zc + R * .4 + .6, .3, 2.8, 1.8, '#e2453a'); box(g, xf + .9, yc - R * .45 + .4, zc + R * .4 + .6, .3, 2.8, 1.8, '#e2453a');
      box(g, xf + .9, yc - R * .45 - 2, zc + R * .4 - 2.4, .3, 4, 1.6, '#3fbf6a');
      disc(yc + R * .1, zc - R * .35, 4.6, '#0e0e0e');
      rod(g, [xf + 1, yc + R * .35, zc + R * .05], [xf + 9, yc + R * .35 + 3, zc + R * .05 - 2], 1.6, '#9a6b45');
      /* Bandeja de enfriado */
      const tx = xf + 17, ty = yc + 4;
      const wallO = sh(new THREE.Mesh(new THREE.CylinderGeometry(13, 13, 10, 32, 1, true), mat('#2b2b2b', { side: THREE.DoubleSide })));
      wallO.position.set(tx, T + 5, ty); g.add(wallO);
      const wallI = new THREE.Mesh(new THREE.CylinderGeometry(12.3, 12.3, 9.5, 32, 1, true), mat('#c9c9c6', { side: THREE.BackSide, flatShading: false, metalness: .6, roughness: .35 }));
      wallI.position.set(tx, T + 5.2, ty); g.add(wallI);
      cyl(g, tx, ty, T + 4.2, 12.2, .4, '#a3a3a0');
      const rim = new THREE.Mesh(new THREE.TorusGeometry(12.65, .7, 6, 32), mat('#1c1c1c')); rim.rotation.x = Math.PI / 2; rim.position.set(tx, T + 10, ty); g.add(rim);
      /* Saco abierto con café verde y granos caídos */
      const sk = sh(new THREE.Mesh(new THREE.CylinderGeometry(10.5, 10, 18, 16, 1, true), mat('#c9ad7c', { side: THREE.DoubleSide }))); sk.position.set(100, 9, 94); g.add(sk);
      const rimS = new THREE.Mesh(new THREE.TorusGeometry(10.5, 1.4, 6, 16), mat('#b8975f')); rimS.rotation.x = Math.PI / 2; rimS.position.set(100, 18, 94); g.add(rimS);
      cyl(g, 100, 94, 15, 9.6, 1.5, '#7f9a5a');
      for (let k = 0; k < 9; k++) ball(g, 94 + isoRnd(40 + k) * 12, 90 + isoRnd(80 + k) * 8, 16.8, 1.5, .9, 1, '#9db37a');
      [[86, 104], [90, 110], [94, 106]].forEach(([x, y]) => ball(g, x, y, .9, 1.6, .9, 1.1, '#9db37a'));
      /* Humo (se anima) */
      const smoke = new THREE.Group(); smoke.position.set(x0 + 4, zc + R + 10, yc - 4); g.add(smoke);
      for (let k = 0; k < 3; k++) { const p = new THREE.Mesh(BALL, new THREE.MeshStandardMaterial({ color: '#ebe7e0', transparent: true, opacity: .7, depthWrite: false, roughness: 1 })); p.userData.k = k; smoke.add(p) }
      g.userData.smoke = smoke;
    };
    /* Mesa de cata: bowls con costra, cucharitas, vaso de enjuague, planilla y lápiz. */
    const cupping = g => {
      const T = 16;
      [[14, 22], [100, 22], [14, 82], [100, 82]].forEach(([x, y]) => box(g, x, y, 0, 4, 4, T - 3, '#6e4f37'));
      box(g, 10, 18, T - 3, 96, 70, 3, '#8a6748', '#efe9de');
      box(g, 14, 22, T, 16, 12, .25, '#ffffff');
      for (let k = 1; k < 5; k++) box(g, 16, 22 + k * 2.3, T + .26, 12, .3, .05, '#cfc9bd');
      rod(g, [32, 23, T + .6], [33, 33, T + .6], .55, '#e0b440');
      const glass = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 4.2, 10, 20), new THREE.MeshStandardMaterial({ color: '#dcebf0', transparent: true, opacity: .5, roughness: .1, depthWrite: false }));
      glass.position.set(96, T + 5, 28); g.add(glass);
      rod(g, [95, 28, T + 2], [94, 27, T + 14], .45, '#b9bcbf'); rod(g, [97, 29, T + 2], [99, 28, T + 15], .45, '#b9bcbf');
      let k = 0;
      [[38, 44], [58, 44], [78, 44], [38, 66], [58, 66], [78, 66]].forEach(([x, y]) => {
        rod(g, [x - 4, y + 9, T + .5], [x + 5, y + 10, T + .5], .55, '#a7abaf');
        ball(g, x - 5.6, y + 8.8, T + .7, 2.3, .7, 1.6, '#dfe1e3');
        cyl(g, x, y, T, 6.5, 4.5, '#ece9e3', '#f6f4ef', { flatShading: false });
        cyl(g, x, y, T + 4.5, 5.7, .2, '#6b3f26', '#6b3f26', { flatShading: false });
        cyl(g, x - .4, y - .2, T + 4.55, 4.2, .2, '#8a5a36', '#8a5a36', { flatShading: false });
        for (let j = 0; j < 5; j++) ball(g, x + (isoRnd(900 + k * 9 + j) * 2 - 1) * 3.4, y + (isoRnd(950 + k * 9 + j) * 2 - 1) * 3.4, T + 4.8, .7, .3, .7, '#c49a6c');
        k++;
      });
    };
    /* Barra: mostrador, máquina de espresso roja de dos grupos y V60 sobre su server. */
    const bar = g => {
      const T = 24; box(g, 8, 50, 0, 102, 34, T, '#8a6748', '#ece6db');
      const mx = 12, my = 52, mw = 58, D = 24, H = 30, z0 = T + 2, red = '#b3262b';
      [[mx + 3, my + 3], [mx + mw - 5, my + 3], [mx + 3, my + D - 4], [mx + mw - 5, my + D - 4]].forEach(([x, y]) => box(g, x, y, T, 2, 2, 2, '#151515'));
      const prof = [[1, 0], [D - 1, 0], [D + 2, 2], [D + 2, 6], [D - 9, 6], [D - 9, H - 9], [D, H - 9], [D, H - 3], [D - 3, H]];
      for (let k = 0; k <= 8; k++) { const a = k / 8 * Math.PI / 2; prof.push([10 - 10 * Math.sin(a), H - 12 + 12 * Math.cos(a)]) }
      prof.push([0, 6], [0, 2]);
      prismX(g, prof.map(([y, z]) => [my + y, z0 + z]), mx, mw, red, { flatShading: false, roughness: .4, metalness: .1 });
      box(g, mx + 1.5, my + D - 9.2, z0 + 6, mw - 3, .4, H - 15, '#d9d9d6', 0).material = mat('#d9d9d6', { metalness: .7, roughness: .3 });
      box(g, mx + 1, my + D - 9, z0 + 6, mw - 2, 11, .3, '#cfcfcc');
      for (let k = 1; k < 12; k++) box(g, mx + 3 + k * (mw - 6) / 12, my + D - 8, z0 + 6.3, .4, 9.5, .15, '#9a9a97');
      [mx + 8, mx + 22, mx + 38].forEach(x => box(g, x, my + D, z0 + H - 7.5, 10, .4, 3.5, '#2a2a2a'));
      { const m = sh(new THREE.Mesh(CYL, mat('#ffffff'))); m.scale.set(2.4, .6, 2.4); m.rotation.x = Math.PI / 2; m.position.set(mx + 9, z0 + 13, my + D - 8.9); g.add(m) }
      [mx + 20, mx + 40].forEach(x => {
        cyl(g, x, my + D - 4, z0 + H - 11, 4.2, 2, '#a8a8a5', '#a8a8a5', { metalness: .6, roughness: .3 });
        cyl(g, x, my + D - 3.5, z0 + H - 13, 3.4, 2, '#bdbdba', '#bdbdba', { metalness: .6, roughness: .3 });
        rod(g, [x, my + D - 2, z0 + H - 12], [x + 1, my + D + 8, z0 + H - 13.5], 1.3, '#141414');
        cyl(g, x, my + D - 4, z0 + 6.3, 2.4, 3.2, '#f4f2ee', '#5a3522');
      });
      [mx + 4, mx + mw - 4].forEach(x => rod(g, [x, my + D - 2, z0 + H - 10], [x, my + D, z0 + 9], .7, '#a9a9a6', { metalness: .7, roughness: .3 }));
      /* V60 sobre su server (un poco más grande que la escala real, para que se lea) */
      const vg = new THREE.Group(); vg.position.set(92, T, 66); vg.scale.setScalar(1.35); g.add(vg);
      const glass = new THREE.Mesh(new THREE.CylinderGeometry(5.4, 5.8, 11, 20), new THREE.MeshStandardMaterial({ color: '#dbe7ec', transparent: true, opacity: .55, roughness: .1, depthWrite: false }));
      glass.position.y = 5.5; vg.add(glass);
      cyl(vg, 0, 0, .2, 5.2, 5, '#5a3522');
      cyl(vg, 0, 0, 11, 5.2, 1.2, '#e9e6e0');
      const cone = sh(new THREE.Mesh(new THREE.CylinderGeometry(8.5, 2.6, 9, 24, 1, true), mat('#f6f4f0', { side: THREE.DoubleSide, flatShading: false })));
      cone.position.y = 16.7; vg.add(cone);
      cyl(vg, 0, 0, 19.5, 5, .3, '#6b4630');
    };
    /* Puerto: depósito con techo a dos aguas, puerta y sacos; un barco con contenedores. */
    const port = g => {
      box(g, 10, 10, 0, 64, 52, 34, '#d8cfbf', '#e6dfd1');
      prismX(g, [[10, 34], [62, 34], [36, 54]], 10, 64, '#9a7c62');
      box(g, 74, 30, 0, 1, 18, 22, '#7a6a55');
      [[84, 74], [96, 70], [90, 84], [30, 90], [42, 92]].forEach(([x, y]) => sack(g, x, y));
      const boat = new THREE.Group(); boat.position.set(MAP_IW + 30, -14, 6); boat.rotation.y = Math.PI / 4; g.add(boat);
      const hull = sh(new THREE.Mesh(BOX, mat('#5c625a'))); hull.scale.set(44, 8, 14); boat.add(hull);
      [['#c0503d', -11], ['#6f8a5e', 0], ['#c9ad7c', 11]].forEach(([c, dx]) => { const m = sh(new THREE.Mesh(BOX, mat(c))); m.scale.set(10, 9, 10); m.position.set(dx, 8.5, 0); boat.add(m) });
      g.userData.boat = boat;
    };

    const LAND = [
      g => { mount(g, 4, 4, 62, 54, 70, '#8fae74', true); mount(g, 50, 2, 50, 46, 48, '#9db886');
        [[74, 64], [92, 66], [74, 84], [92, 86], [74, 104], [92, 104], [56, 98]].forEach(([x, y]) => tree(g, x, y, .9, '#6f8a5e', true)); tree(g, 20, 96, 1.2) },
      g => { tunnel(g, 6, 8, 42, 74, 30); bed(g, 58, 10, 52, 18, 14, 'pergamino', 2); bed(g, 58, 38, 52, 18, 14, 'cereza', 3); bed(g, 62, 66, 44, 16, 14, 'pergamino', 4); tree(g, 110, 104, 1);
        const s = new THREE.Mesh(BALL, new THREE.MeshStandardMaterial({ color: '#f0d27e', emissive: '#f0c050', emissiveIntensity: .6, roughness: 1 })); s.scale.setScalar(9); s.position.set(96, 96, 4); g.add(s); g.userData.sun = s },
      port,
      g => { roastery(g); tree(g, 12, 100, 1) },
      g => { tree(g, 104, 20, 1); tree(g, 20, 24, .9, '#6f8a5e'); bar(g) },
      g => { cupping(g); tree(g, 104, 104, 1) }
    ];

    const scene = new THREE.Scene(), isles = [];
    /* Sombra suave debajo de cada isla flotante */
    const blob = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(0,0,0,.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c) })();
    MAP_PLACES.forEach((m, i) => {
      const [ax, ay] = scrToWorld(...mapOrigin(i)), g = new THREE.Group();
      g.position.set(ax, 0, ay); g.userData.isle = i;
      box(g, 0, 0, -MAP_IH, MAP_IW, MAP_ID, MAP_IH, m.col, m.top);
      LAND[i](g);
      const sb = new THREE.Mesh(new THREE.PlaneGeometry(170, 170), new THREE.MeshBasicMaterial({ map: blob, transparent: true, opacity: .22, depthWrite: false }));
      sb.rotation.x = -Math.PI / 2; sb.position.set(MAP_IW / 2, -MAP_IH - 40, MAP_ID / 2); g.add(sb);
      scene.add(g); isles.push(g);
    });
    /* Camino de baldosas entre islas (verde en lo ya recorrido) */
    /* Una baldosa del dibujo mide 15 de medio ancho: es un cuadrado de 15 / cos 30° de lado. */
    const TILE = 15 / Math.cos(Math.PI / 6);
    for (let i = 0; i < SC.length - 1; i++) {
      const a = mapFront(i), b = isoP(mapOrigin(i + 1), MAP_IW / 2, 0, 0), lit = stDone(i);
      for (let k = 1; k < 7; k++) {
        const t = k / 7, [wx, wy] = scrToWorld(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + 6, 0);
        const m = sh(new THREE.Mesh(BOX, [1, 1, 0, 1, 1, 1].map(j => mat(lit ? ['#a9bf98', '#7f9670'][j] : ['#e8d9b8', '#c2ad87'][j]))));
        m.scale.set(TILE, 5, TILE); m.position.set(wx, -2.5, wy); scene.add(m);
      }
    }
    /* Nubes */
    const clouds = [[70, 40, 1], [320, 300, .8], [60, 600, .7], [330, 900, .9], [80, 1250, .7]].map(([x, y, k], i) => {
      const [wx, wy] = scrToWorld(x, y, 60), c = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: .85, roughness: 1, emissive: '#ffffff', emissiveIntensity: .35 });
      [[0, 0, 0, 22, 8], [-10, 4, 8, 11, 8], [10, 6, -8, 13, 10]].forEach(([dx, dz, dy, r, h]) => { const p = new THREE.Mesh(BALL, m); p.scale.set(r, h, r * .8); p.position.set(dx, dz, dy); c.add(p) });
      c.scale.setScalar(k); c.position.set(wx, 60, wy); c.userData.base = c.position.clone(); c.userData.k = i; scene.add(c); return c;
    });
    return { scene, isles, clouds };
  }

  KINDS.map = el => {
    const svg = el.querySelector('.map-scene'), canvas = document.createElement('canvas');
    canvas.className = 't3-canvas t3-map'; canvas.setAttribute('aria-hidden', 'true');
    svg.after(canvas);
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    r.setClearColor(0, 0); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; r.shadowMap.autoUpdate = false;
    const { scene, isles, clouds } = buildMap();
    const [tx, ty] = scrToWorld(MAP_W / 2, MAP_H / 2, 0), T = new THREE.Vector3(tx, 0, ty);
    const hw = MAP_W / 2 / ISO_K, hh = MAP_H / 2 / ISO_K;
    const cam = new THREE.OrthographicCamera(-hw, hw, hh, -hh, 1, 9000);
    scene.add(new THREE.HemisphereLight('#ffffff', '#b8a68c', 1.7));
    const sun = new THREE.DirectionalLight('#fff6e8', 2.1), L = new THREE.Vector3(.45, 1, .18).normalize();
    sun.position.copy(T).addScaledVector(L, 1600); sun.target.position.copy(T); scene.add(sun, sun.target);
    sun.castShadow = true;
    const sc = sun.shadow.camera; sc.left = -230; sc.right = 230; sc.top = 1250; sc.bottom = -1250; sc.near = 100; sc.far = 3400;
    sc.up.set(1, 0, 1).normalize(); sc.updateProjectionMatrix();
    sun.shadow.mapSize.set(512, 4096); sun.shadow.bias = -.0004; sun.shadow.normalBias = .6;
    r.shadowMap.needsUpdate = true;

    /* Botones de las estaciones (HTML encima): se corren si la cámara se mueve. */
    const nodes = [...el.querySelectorAll('.map-node')], me = el.querySelector('.map-me'), cur = el.querySelector('.map-node.is-cur');
    const anchor = i => { const [ax, ay] = scrToWorld(...mapOrigin(i)); return new THREE.Vector3(ax + MAP_IW / 2, 0, ay + MAP_ID) };
    const tmp = new THREE.Vector3();
    function alignNodes(lift) {
      const k = canvas.clientWidth / MAP_W;
      nodes.forEach(n => {
        const i = +n.dataset.v, f = mapFront(i);
        tmp.copy(anchor(i)); tmp.y += lift[i]; tmp.project(cam);
        const dx = ((tmp.x + 1) / 2 * MAP_W - f[0]) * k, dy = ((1 - tmp.y) / 2 * MAP_H - f[1]) * k;
        n.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
        if (n === cur && me) me.style.translate = n.style.translate;
      });
    }

    /* Tocar una isla abre su ficha; al pasar el mouse, la isla se levanta un poco. */
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    const isleAt = e => {
      const b = canvas.getBoundingClientRect();
      ndc.set((e.clientX - b.left) / b.width * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
      ray.setFromCamera(ndc, cam);
      const hit = ray.intersectObjects(isles, true)[0]; if (!hit) return -1;
      let o = hit.object; while (o && o.userData.isle === undefined) o = o.parent;
      return o ? o.userData.isle : -1;
    };
    let hover = -1, focusI = -1, sway = 0, swayT = 0;
    const lift = isles.map(() => 0);
    canvas.addEventListener('click', e => { const i = isleAt(e); if (i >= 0 && ACTIONS.mapNode) ACTIONS.mapNode(String(i)) });
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    canvas.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const i = isleAt(e); if (i !== hover) { hover = i; canvas.style.cursor = i >= 0 ? 'pointer' : ''; kick() }
    });
    canvas.addEventListener('pointerleave', () => { hover = -1; canvas.style.cursor = ''; kick() });
    const onMove = e => { if (!fine.matches || reduce()) return; const b = el.getBoundingClientRect(); swayT = clamp((e.clientX - b.left) / b.width - .5, -.5, .5) * .1; kick() };
    window.addEventListener('pointermove', onMove, { passive: true });
    nodes.forEach(n => {
      const i = +n.dataset.v;
      n.addEventListener('mouseenter', () => { focusI = i; kick() }); n.addEventListener('mouseleave', () => { focusI = -1; kick() });
      n.addEventListener('focus', () => { focusI = i; kick() }); n.addEventListener('blur', () => { focusI = -1; kick() });
    });

    const v = { canvas };
    v.adopt = () => {};
    let W = 0, H = 0, lastT = 0, shown = false;
    const UP = new THREE.Vector3(0, 1, 0), DIR = new THREE.Vector3(1, 1, 1).normalize();
    v.frame = (time, dt) => {
      const w = svg.clientWidth, h = svg.clientHeight; if (!w || !h) return false;
      if (w !== W || h !== H) {
        W = w; H = h;
        /* Un <svg> no tiene offsetTop: se mide contra el contenedor. */
        const a = svg.getBoundingClientRect(), b = el.getBoundingClientRect();
        canvas.style.left = (a.left - b.left) + 'px'; canvas.style.top = (a.top - b.top) + 'px';
        canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
        r.setPixelRatio(dpr(1.5)); r.setSize(w, h, false); v.dirty = true;
      }
      const anim = !reduce();
      /* La animación del mapa corre a ~30 cuadros por segundo: alcanza y cuida la batería. */
      if (anim && !v.dirty && time - lastT < 1 / 30) return true;
      const step = Math.min(.1, time - (lastT || time)); lastT = time;
      const k = anim ? 1 - Math.pow(.002, step) : 1;
      let moving = false;
      isles.forEach((g, i) => {
        const want = (i === hover || i === focusI) ? 5 : 0; lift[i] += (want - lift[i]) * k;
        if (Math.abs(want - lift[i]) > .02) moving = true; else lift[i] = want;
        if (g.position.y !== lift[i]) { g.position.y = lift[i]; r.shadowMap.needsUpdate = true }
      });
      sway += (swayT - sway) * k; if (Math.abs(swayT - sway) > .0005) moving = true;
      cam.position.copy(DIR).applyAxisAngle(UP, sway).multiplyScalar(3000).add(T); cam.lookAt(T);
      if (anim) {
        isles.forEach(g => {
          const u = g.userData;
          if (u.smoke) u.smoke.children.forEach(p => { const f = (time * .35 + p.userData.k / 3) % 1; p.position.set(f * 4, f * 22, -f * 2); p.scale.setScalar(3.5 + f * 5); p.material.opacity = .75 * Math.sin(f * Math.PI) });
          if (u.boat) { u.boat.position.x = MAP_IW + 30 + Math.sin(time * 1.2) * 3; u.boat.position.y = -14 + Math.sin(time * 2) * .8 }
          if (u.sun) u.sun.position.y = 96 + Math.sin(time * 1.05) * 3;
        });
        clouds.forEach(c => { c.position.x = c.userData.base.x + Math.sin(time * .12 + c.userData.k) * 10; c.position.z = c.userData.base.z - Math.sin(time * .12 + c.userData.k) * 10 });
      }
      r.render(scene, cam);
      alignNodes(lift);
      if (!shown) { shown = true; el.classList.add('t3-map-on') }
      v.dirty = false;
      return anim || moving;
    };
    v.dispose = () => { window.removeEventListener('pointermove', onMove); disposeTree(scene); r.dispose(); r.forceContextLoss && r.forceContextLoss(); canvas.remove() };
    return v;
  };

  scan();
  return { poke, scan, get ready() { return state === 'ready' } };
})();
