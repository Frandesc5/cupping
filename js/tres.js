/* ============================================================
   .campus · mapa de islas en 3D con three.js
   El mapa de la Academia (js/academia/mapa.js) se dibuja primero en SVG
   dentro de un elemento con data-t3="map". Ese SVG es el respaldo.
   - Cuando aparece en la página, se baja three.js (una sola vez, desde
     jsDelivr). Si no hay WebGL o no hay conexión, queda el SVG.
   - Si carga, el mapa 3D se monta encima del SVG y lo reemplaza.
   - Cada isla muestra el estado de su estación: sin empezar (apagada y
     con niebla), la actual (con un brillo) y completa (con banderín y
     todas sus animaciones).
   Respeta "reducir movimiento": sin animaciones ni movimientos de cámara.
   ============================================================ */

const T3 = (() => {
  const URL3 = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';
  let THREE = null, state = 'idle'; /* idle | loading | ready | off */
  const views = new Set(), KINDS = {};
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = (max = 2) => Math.min(max, window.devicePixelRatio || 1);

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
    const kind = el.dataset.t3; if (!KINDS[kind]) return;
    const v = KINDS[kind](el); v.kind = kind; v.vis = true; v.el = el; v.dirty = true;
    views.add(v); v.canvas.__t3v = v; if (io) io.observe(v.canvas);
    el.classList.add('t3-on');
  }
  function drop(v) {
    views.delete(v);
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

  /* ---------- Utilidades ---------- */
  function disposeTree(o) {
    o.traverse(n => {
      if (n.geometry && !n.geometry.__shared) n.geometry.dispose();
      const m = n.material; if (m) (Array.isArray(m) ? m : [m]).forEach(x => { if (!x.__shared) x.dispose() });
    });
  }
  /* Manchas suaves (niebla, vapor, brillo) dibujadas una sola vez. */
  const TEX = {};
  function softTex(name, inner, outer = 'rgba(255,255,255,0)') {
    if (TEX[name]) return TEX[name];
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, inner); g.addColorStop(1, outer); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return TEX[name] = t;
  }

  /* ============================================================
     Islas
     Mismo mundo que js/academia/mapa.js: cada punto (x, y, z) del dibujo
     isométrico es un punto real en 3D. x e y van en el piso; z es la altura.
     En three.js: X = x, Y = z (arriba), Z = y.
     ============================================================ */
  const ISO_K = Math.sqrt(1.5); /* unidades del dibujo por unidad 3D */
  const ISO_2C = 2 * Math.cos(Math.PI / 6);
  /* Punto del mundo cuyo dibujo isométrico cae en (sx, sy) a la altura z (inversa de isoP con origen 0). */
  const scrToWorld = (sx, sy, z = 0) => [sy + z + sx / ISO_2C, sy + z - sx / ISO_2C];

  /* Estado de cada estación: off (sin empezar) · cur (la que sigue) · on (empezada) · done (completa). */
  function isleState(i, cur) {
    if (stDone(i)) return 'done';
    if (i === cur) return 'cur';
    return startedSt(i) ? 'on' : 'off';
  }

  /* Piezas compartidas: geometrías y materiales (por color y por estado). */
  let KIT = null;
  function kit() {
    if (KIT) return KIT;
    const shared = g => { g.__shared = true; return g };
    KIT = {
      BOX: shared(new THREE.BoxGeometry(1, 1, 1)), BALL: shared(new THREE.SphereGeometry(1, 14, 10)), ICO: shared(new THREE.IcosahedronGeometry(1, 1)),
      CYL: shared(new THREE.CylinderGeometry(1, 1, 1, 28)), ROD: shared(new THREE.CylinderGeometry(1, 1, 1, 8)),
      SACK: shared(new THREE.CylinderGeometry(5, 6.6, 13, 14)),
      /* Saco acostado: una esfera estirada hacia una caja de bordes redondeados (más redonda arriba y abajo) */
      PILLOW: shared((() => {
        const geo = new THREE.SphereGeometry(1, 24, 14), p = geo.attributes.position, f = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);
        for (let k = 0; k < p.count; k++) p.setXYZ(k, f(p.getX(k), .3), f(p.getY(k), .75), f(p.getZ(k), .4));
        geo.computeVertexNormals(); return geo;
      })()),
      mats: new Map()
    };
    return KIT;
  }

  /* Arma una isla con su lugar. Devuelve el grupo; group.userData.anim tiene sus animaciones. */
  function makeIsland(i, st) {
    const K = kit(), V3 = THREE.Vector3, off = st === 'off';
    /* Una isla sin empezar se ve apagada: casi sin color y más clara. */
    const paint = c => { const col = new THREE.Color(c); if (off) { const h = {}; col.getHSL(h); col.setHSL(h.h, h.s * .12, Math.min(.92, h.l * .5 + .38)) } return col };
    const mat = (c, o = {}) => {
      const k = (off ? 'off' : 'on') + c + JSON.stringify(o);
      if (!K.mats.has(k)) { const m = new THREE.MeshStandardMaterial(Object.assign({ roughness: .9, metalness: 0, flatShading: true }, o, { color: paint(c) })); m.__shared = true; K.mats.set(k, m) }
      return K.mats.get(k);
    };
    const own = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ roughness: .9 }, o, { color: paint(c) }));
    const sh = m => { m.castShadow = true; m.receiveShadow = true; return m };
    const add = (g, m) => { g.add(m); return m };
    const A = [], live = !off; /* live: la isla tiene animaciones */
    /* mv: marca lo que se mueve. El mapa dibuja lo quieto una sola vez y en cada cuadro solo esto (ver KINDS.map). */
    const mv = o => { o.userData.mv = true; return o };
    const rnd = isoRnd;

    const box = (g, x, y, z, w, d, h, c, top) => {
      const m = sh(new THREE.Mesh(K.BOX, top ? [mat(c), mat(c), mat(top), mat(c), mat(c), mat(c)] : mat(c)));
      m.scale.set(w, h, d); m.position.set(x + w / 2, z + h / 2, y + d / 2); return add(g, m);
    };
    const cyl = (g, x, y, z, r, h, c, top, o) => {
      const m = sh(new THREE.Mesh(K.CYL, [mat(c, o), mat(top || c, o), mat(c, o)]));
      m.scale.set(r, h, r); m.position.set(x, z + h / 2, y); return add(g, m);
    };
    const ball = (g, x, y, z, rx, rz, ry, c, geo = K.BALL, o) => {
      const m = sh(new THREE.Mesh(geo, mat(c, o))); m.scale.set(rx, rz, ry); m.position.set(x, z, y); return add(g, m);
    };
    /* Barra entre dos puntos del mundo [x, y, z]. */
    const rod = (g, a, b, r, c, o) => {
      const P = new V3(a[0], a[2], a[1]), Q = new V3(b[0], b[2], b[1]), d = Q.clone().sub(P), m = sh(new THREE.Mesh(K.ROD, mat(c, o)));
      m.scale.set(r, d.length(), r); m.position.copy(P).add(Q).multiplyScalar(.5);
      m.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.normalize()); return add(g, m);
    };
    const shapeOf = pts => { const s = new THREE.Shape(); pts.forEach(([u, v], k) => k ? s.lineTo(u, v) : s.moveTo(u, v)); return s };
    /* Perfil en el plano (y, z), extruido a lo largo de x desde x0. */
    const prismX = (g, pts, x0, len, c, o) => {
      const geo = new THREE.ExtrudeGeometry(shapeOf(pts.map(([y, z]) => [-y, z])), { depth: len, bevelEnabled: false, curveSegments: 8 });
      geo.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, x0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 0, 1));
      return add(g, sh(new THREE.Mesh(geo, mat(c, o))));
    };
    /* Cerro de zona cafetera: redondeado y verde, con las hileras del cafetal siguiendo las curvas
       de nivel, árboles de sombra sueltos y, si mist, una nube baja enganchada cerca de la cima.
       Centro (cx, cy), radios rx y ry, altura h. seed cambia la forma, para que no haya dos iguales. */
    const hill = (g, cx, cy, rx, ry, h, seed, mist) => {
      const H = hillShape(cx, cy, rx, ry, h, seed), c = new THREE.Color();
      const green = paint('#7fa565'), greenL = paint('#9dbb7c'), row = paint('#4f7a45'), shade = '#3f6a3c';
      const pos = [], cols = [], idx = H.tris.flat();
      /* Hileras de café: franjas oscuras según la altura (curvas de nivel), en las laderas */
      H.verts.forEach(([x, y, z, isRow, v]) => {
        pos.push(x, z, y);
        if (isRow) c.copy(row).lerp(green, v * .25); else c.copy(green).lerp(greenL, v * .6);
        cols.push(c.r, c.g, c.b);
      });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
      geo.setIndex(idx);
      const flat = geo.toNonIndexed(); geo.dispose(); flat.computeVertexNormals();
      add(g, sh(new THREE.Mesh(flat, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: .95 }))));
      /* Árboles de sombra sueltos sobre las laderas */
      H.trees.forEach(([x, y, z, r, f]) => ball(g, x, y, z, r, r * .85, r, isoShade(shade, f), K.ICO));
      /* Neblina baja, típica de las zonas de café de altura */
      if (mist && live) {
        const ms = [0, 1, 2].map(k => { const p = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex('puff', 'rgba(255,255,255,1)'), transparent: true, depthWrite: false, depthTest: false, opacity: .4 })); p.scale.set(40 + k * 8, 18 + k * 4, 1); p.renderOrder = 2; g.add(mv(p)); return p });
        A.push(tm => ms.forEach((p, k) => { const a = tm * .08 + k * 2.1; p.position.set(cx + Math.cos(a) * rx * .55, h * (.62 + .08 * k), cy + Math.sin(a) * ry * .55); p.material.opacity = .28 + .1 * Math.sin(tm * .5 + k) }));
      }
    };
    /* Árbol: cada uno con su tono y su tamaño. */
    const tree = (g, x, y, s, c = '#7f9a6c', berries) => {
      const t = new THREE.Group(), seed = x * 7.3 + y * 3.1, k = .9 + rnd(seed) * .22, tone = .9 + rnd(seed + 1) * .2;
      t.position.set(x, 0, y); t.scale.setScalar(k); g.add(t);
      cyl(t, 0, 0, 0, 1.5 * s, 8 * s, '#7a5a40');
      ball(t, 0, 0, 13 * s, 8 * s, 7.4 * s, 8 * s, isoShade(c, .88 * tone), K.ICO);
      ball(t, -1.5 * s, 1.5 * s, 16.5 * s, 5.4 * s, 5 * s, 5.4 * s, isoShade(c, 1.04 * tone), K.ICO);
      if (berries) [[5.6, 3, -1, '#c0503d'], [2.5, 6.4, 2, '#c0503d'], [5.5, 4.6, 3.5, '#d97a4e'], [6.8, -1, 1.5, '#c0503d']].forEach(([dx, dy, dz, bc]) => ball(t, dx * s, dy * s, 13 * s + dz * s, 1.5 * s, 1.5 * s, 1.5 * s, bc));
    };
    const sack = (g, x, y) => { const m = sh(new THREE.Mesh(K.SACK, mat('#c9ad7c'))); m.position.set(x, 6.5, y); add(g, m); cyl(g, x, y, 10.5, 3.4, 1.2, '#9c8358') };
    /* Vapor o humo: manchas que suben y se desvanecen. */
    const puffs = (g, x, y, z, s = 1, n = 3, c = '#ffffff', op = .55, rise = 14, speed = .4) => {
      if (!live) return;
      const grp = new THREE.Group(); grp.position.set(x, z, y); g.add(mv(grp));
      const ps = Array.from({ length: n }, (_, k) => { const p = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex('puff', 'rgba(255,255,255,1)'), color: c, transparent: true, depthWrite: false })); p.userData.k = k; grp.add(p); return p });
      A.push(tm => ps.forEach(p => { const f = (tm * speed + p.userData.k / n) % 1; p.position.set(Math.sin(f * 5 + p.userData.k) * 1.5 * s, f * rise * s, 0); p.scale.setScalar((3 + f * 7) * s); p.material.opacity = op * Math.sin(f * Math.PI) }));
    };
    /* Pájaros que vuelan en círculo sobre la isla. */
    const birds = (g, cx, cy, z, r, n, c = '#3d3a36') => {
      if (!live) return;
      const bs = Array.from({ length: n }, (_, k) => {
        const b = new THREE.Group(), wl = new THREE.Mesh(K.BOX, mat(c)), wr = new THREE.Mesh(K.BOX, mat(c));
        [wl, wr].forEach((w, j) => { w.scale.set(4, .3, 1.6); w.position.x = j ? 2 : -2; const p = new THREE.Group(); p.add(w); b.add(p); b.userData[j ? 'r' : 'l'] = p });
        ball(b, 0, 0, 0, .9, .8, 1.8, c); g.add(mv(b)); return b;
      });
      A.push(tm => bs.forEach((b, k) => {
        const a = tm * .45 + k * Math.PI * 2 / n + k * .4;
        b.position.set(cx + Math.cos(a) * r, z + Math.sin(tm * .8 + k) * 4 + k * 3, cy + Math.sin(a) * r);
        b.rotation.y = -a; const f = Math.sin(tm * 9 + k) * .5; b.userData.l.rotation.z = f; b.userData.r.rotation.z = -f;
      }));
    };
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
      g.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: paint('#b9a77e'), transparent: true, opacity: .6 })));
      const cherry = kind === 'cereza', spots = [], n = Math.round(w * d / 9);
      for (let k = 0; k < n; k++) {
        const u = rnd(seed * 100 + k), v = rnd(seed * 300 + k * 7);
        if (Math.abs(u - .5) + Math.abs(v - .5) > .62) continue;
        spots.push([x + 2 + u * (w - 4), y + 2 + v * (d - 4), rnd(seed * 500 + k) * Math.PI]);
      }
      const im = new THREE.InstancedMesh(K.BALL, mat(cherry ? '#7a3326' : '#d8c9a0', { flatShading: false, roughness: cherry ? .5 : .85 }), spots.length);
      const M = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = cherry ? new V3(1.6, 1.4, 1.6) : new V3(1.9, 1, 1.2);
      spots.forEach(([bx, by, a], k) => { q.setFromAxisAngle(new V3(0, 1, 0), a); M.compose(new V3(bx, top + .9, by), q, sc); im.setMatrixAt(k, M) });
      im.castShadow = true; im.receiveShadow = true; g.add(im);
    };
    /* Marquesina: túnel de plástico con arcos, a lo largo de y, con una cama adentro. */
    const tunnel = (g, x, y, w, len, h) => {
      const cx = x + w / 2, r = w / 2;
      box(g, x - 1, y, 0, 2, len, 2, '#7a5a40'); box(g, x + w - 1, y, 0, 2, len, 2, '#7a5a40');
      bed(g, x + 5, y + 6, w - 10, len - 12, 8, 'pergamino', 7);
      const skin = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 24, 1, true, Math.PI / 2, Math.PI).rotateX(Math.PI / 2),
        own('#dcebf0', { transparent: true, opacity: .3, roughness: .15, side: THREE.DoubleSide, depthWrite: false }));
      skin.scale.y = h / r; skin.position.set(cx, 0, y + len / 2); g.add(skin);
      const back = new THREE.Mesh(new THREE.CircleGeometry(r, 24, 0, Math.PI), own('#e3eff3', { transparent: true, opacity: .45, side: THREE.DoubleSide, depthWrite: false }));
      back.scale.y = h / r; back.position.set(cx, 0, y); g.add(back);
      for (let j = 0; j <= 4; j++) { const a = sh(new THREE.Mesh(new THREE.TorusGeometry(r, .7, 6, 24, Math.PI), mat('#8fa9b2'))); a.scale.y = h / r; a.position.set(cx, 0, y + len * j / 4); g.add(a) }
    };

    /* ---------- Base de la isla ----------
       La forma sale de isleShape(i) (js/academia/mapa.js), la misma que usa el dibujo SVG: pasto arriba con
       borde ondulado, roca facetada abajo que se angosta hasta una punta y piedras sueltas flotando debajo. */
    const m = MAP_PLACES[i], g = new THREE.Group(), SH = isleShape(i), CX = SH.CX, CY = SH.CY;
    g.userData.isle = i; g.userData.anim = A;
    const rimR = a => isleRimR(i, a);
    /* ¿El punto (x, y) cae sobre la isla, con un margen hacia adentro? */
    const inside = (x, y, margin = .9) => Math.hypot(x - CX, y - CY) <= rimR(Math.atan2(y - CY, x - CX)) * margin;
    {
      const P = p => [p[0], p[2], p[1]]; /* punto del mundo [x, y, altura] → three.js */
      const top = paint(m.top), rockA = paint(isoShade(m.col, .78)), rockB = paint(isoShade(m.col, 1.12)), cv = new THREE.Color();
      const tris = SH.top.map(([a, b, c, t]) => [a, b, c, cv.copy(top).multiplyScalar(.93 + t * .14).clone()])
        .concat(SH.rock.map(([a, b, c, t]) => [a, b, c, cv.copy(rockA).lerp(rockB, t).clone()]));
      const pos = new Float32Array(tris.length * 9), col = new Float32Array(tris.length * 9);
      tris.forEach(([a, b, c, cc], t) => { pos.set([...P(a), ...P(b), ...P(c)], t * 9); for (let q = 0; q < 3; q++) col.set([cc.r, cc.g, cc.b], t * 9 + q * 3) });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      geo.computeVertexNormals();
      add(g, sh(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: .95, side: THREE.DoubleSide }))));
      /* Piedras sueltas flotando debajo (suben y bajan despacio) */
      const frags = SH.frags.map(([x, y, z, r], k) => {
        const f = sh(new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), mat(isoShade(m.col, .8 + rnd(k + i) * .3))));
        f.scale.set(r, r * 1.2, r); f.rotation.set(rnd(k) * 3, rnd(k + 1) * 3, 0);
        f.position.set(x, z, y); f.userData.base = z; g.add(live ? mv(f) : f); return f;
      });
      if (live) A.push(tm => frags.forEach((f, k) => { f.position.y = f.userData.base + Math.sin(tm * .9 + k * 1.3) * 2.5; f.rotation.y = tm * .2 + k }));
    }
    /* Piedritas cerca del borde, siguiendo el contorno de la isla */
    for (let k = 0; k < 16; k++) {
      const a = rnd(i * 50 + k) * Math.PI * 2, r = rimR(a) * (.86 + rnd(i * 70 + k) * .07);
      ball(g, CX + Math.cos(a) * r, CY + Math.sin(a) * r, .6, 1.2 + rnd(k) * 1.2, .9, 1.1 + rnd(k + 9) * 1.2, isoShade(m.top, .72), K.ICO);
    }
    /* Flores adelante (finca y beneficio), solo donde hay isla */
    if (i < 2) for (let k = 0; k < 18; k++) {
      const u = rnd(i * 90 + k), px = 8 + u * 100, py = MAP_ID - 3 - rnd(i * 40 + k) * 10;
      if ((i === 1 && px < 52) || !inside(px, py)) continue;
      ball(g, px, py, 1.2, .9, .9, .9, ['#f4e4a1', '#ffffff', '#e9a3a3', '#c9a6e0'][k % 4]);
    }

    /* ---------- Lo que hay encima de cada isla ---------- */
    const LAND = [
      /* La finca */
      () => {
        FINCA_HILLS.forEach((hh, k) => hill(g, ...hh, k === 0));
        [[74, 64], [92, 66], [74, 84], [92, 86], [74, 104], [92, 104], [56, 98]].forEach(([x, y]) => tree(g, x, y, .9, '#6f8a5e', true)); tree(g, 20, 96, 1.2);
        birds(g, 40, 30, 92, 30, 3);
      },
      /* El beneficio */
      () => {
        tunnel(g, 6, 8, 42, 74, 30); bed(g, 58, 10, 52, 18, 14, 'pergamino', 2); bed(g, 58, 38, 52, 18, 14, 'cereza', 3); bed(g, 62, 66, 44, 16, 14, 'pergamino', 4); tree(g, 110, 104, 1);
        const s = new THREE.Mesh(K.BALL, own('#f0d27e', { emissive: paint('#f0c050'), emissiveIntensity: off ? .1 : .7, roughness: 1 })); s.scale.setScalar(9); s.position.set(96, 96, 4); g.add(live ? mv(s) : s);
        if (live) A.push(tm => { s.position.y = 96 + Math.sin(tm * 1.05) * 3 });
      },
      /* El puerto */
      () => {
        box(g, 10, 10, 0, 64, 52, 34, '#d8cfbf', '#e6dfd1');
        prismX(g, [[10, 34], [62, 34], [36, 54]], 10, 64, '#9a7c62');
        box(g, 74, 30, 0, 1, 18, 22, '#7a6a55');
        [[84, 74], [96, 70], [90, 84], [30, 90], [42, 92]].forEach(([x, y]) => sack(g, x, y));
        const water = new THREE.Mesh(new THREE.CircleGeometry(34, 32).rotateX(-Math.PI / 2), own('#8fc3d4', { transparent: true, opacity: .55, roughness: .2, depthWrite: false }));
        water.position.set(MAP_IW + 30, -19, 8); g.add(water);
        const boat = new THREE.Group(); boat.position.set(MAP_IW + 30, -14, 6); boat.rotation.y = Math.PI / 4; g.add(live ? mv(boat) : boat);
        const hull = sh(new THREE.Mesh(K.BOX, mat('#5c625a'))); hull.scale.set(44, 8, 14); boat.add(hull);
        [['#c0503d', -11], ['#6f8a5e', 0], ['#c9ad7c', 11]].forEach(([c, dx]) => { const b = sh(new THREE.Mesh(K.BOX, mat(c))); b.scale.set(10, 9, 10); b.position.set(dx, 8.5, 0); boat.add(b) });
        if (live) A.push(tm => { boat.position.x = MAP_IW + 30 + Math.sin(tm * 1.2) * 3; boat.position.y = -14 + Math.sin(tm * 2) * .8; boat.rotation.x = Math.sin(tm * 1.6) * .03 });
        birds(g, 50, 40, 74, 34, 3, '#f4f2ee');
      },
      /* La tostadora: el tostador de la Academia sobre su mesa (achicado para que quede a la escala de la barra
         y corrido hacia atrás), un pallet con sacos de café verde y el saco abierto. */
      () => {
        const rg = new THREE.Group(); g.add(rg);
        /* El tostador y su mesa se dibujan con sus medidas de siempre dentro de rg, y después rg se achica. */
        { const g = rg;
        [[10, 22], [96, 22], [10, 72], [96, 72]].forEach(([x, y]) => box(g, x, y, 0, 3, 3, 20, '#6e4f37'));
        box(g, 8, 20, 20, 92, 56, 3, '#8a6748', '#a98563');
        const T = 23, yc = 46, R = 16, zc = T + 9 + R, x0 = 22, xf = x0 + 46, xb = x0 - 6, cap = 16;
        const leg = x => {
          const pts = [], q = (a, b, c, t) => a * (1 - t) ** 2 + b * 2 * t * (1 - t) + c * t * t, wF = R * .9, wT = R * .5, zT = zc - R * .55, inW = wF - 5, inH = (zT - T) * .62;
          for (let k = 0; k <= 10; k++) { const t = k / 10; pts.push([q(yc - wF, yc - wF * .92, yc - wT, t), q(T, T + (zT - T) * .95, zT, t)]) }
          for (let k = 10; k >= 0; k--) { const t = k / 10; pts.push([q(yc + wF, yc + wF * .92, yc + wT, t), q(T, T + (zT - T) * .95, zT, t)]) }
          for (let k = 0; k <= 16; k++) { const a = k / 16 * Math.PI; pts.push([yc + inW * Math.cos(a), T + inH * Math.sin(a)]) }
          prismX(g, pts, x, 2.5, '#232323');
        };
        leg(x0 + 1); leg(xf - 5);
        const prof = [new THREE.Vector2(0, 0)];
        for (let k = 1; k <= 10; k++) { const th = k / 10 * Math.PI / 2; prof.push(new THREE.Vector2(R * Math.sin(th), cap * (1 - Math.cos(th)))) }
        prof.push(new THREE.Vector2(R, xf - xb), new THREE.Vector2(0, xf - xb));
        const drum = sh(new THREE.Mesh(new THREE.LatheGeometry(prof, 40).rotateZ(-Math.PI / 2), mat('#3b3b3b', { flatShading: false, roughness: .4, metalness: .5 })));
        drum.position.set(xb, zc, yc); g.add(drum);
        for (let k = 0; k < 6; k++) rod(g, [x0 + 12 + k * 3, yc + R * .45, zc + R * .9], [x0 + 6 + k * 3, yc + R * .85, zc + R * .5], .5, '#121212');
        box(g, xf - 10, yc - 2, zc + R - 2, 4, 4, 5, '#1b1b1b');
        const hop = sh(new THREE.Mesh(new THREE.CylinderGeometry(10, 2.5, 11, 24, 1, true), mat('#2a2a2a', { side: THREE.DoubleSide })));
        hop.position.set(xf - 8, zc + R + 8.5, yc); g.add(hop);
        cyl(g, xf - 8, yc, zc + R + 13.6, 8.6, .4, '#141414');
        const disc = (y, z, r, c) => { const d = sh(new THREE.Mesh(K.CYL, mat(c))); d.scale.set(r, 1, r); d.rotation.z = Math.PI / 2; d.position.set(xf + .5, z, y); g.add(d) };
        disc(yc - R * .45, zc + R * .4, 6.2, '#101010');
        /* Números del panel: brillan y titilan */
        const led = own('#e2453a', { emissive: paint('#ff3b2f'), emissiveIntensity: off ? 0 : .9 });
        [[-3.2, .6], [.4, .6]].forEach(([dy, dz]) => { const b = new THREE.Mesh(K.BOX, led); b.scale.set(.3, 1.8, 2.8); b.position.set(xf + 1.05, zc + R * .4 + dz + .9, yc - R * .45 + dy + 1.4); g.add(live ? mv(b) : b) });
        box(g, xf + .9, yc - R * .45 - 2, zc + R * .4 - 2.4, .3, 4, 1.6, '#3fbf6a');
        disc(yc + R * .1, zc - R * .35, 4.6, '#0e0e0e');
        rod(g, [xf + 1, yc + R * .35, zc + R * .05], [xf + 9, yc + R * .35 + 3, zc + R * .05 - 2], 1.6, '#9a6b45');
        /* Bandeja de enfriado, con granos recién tostados dando vueltas */
        const tx = xf + 17, ty = yc + 4;
        const wallO = sh(new THREE.Mesh(new THREE.CylinderGeometry(13, 13, 10, 32, 1, true), mat('#2b2b2b', { side: THREE.DoubleSide })));
        wallO.position.set(tx, T + 5, ty); g.add(wallO);
        const wallI = new THREE.Mesh(new THREE.CylinderGeometry(12.3, 12.3, 9.5, 32, 1, true), mat('#c9c9c6', { side: THREE.BackSide, flatShading: false, metalness: .6, roughness: .35 }));
        wallI.position.set(tx, T + 5.2, ty); g.add(wallI);
        cyl(g, tx, ty, T + 4.2, 12.2, .4, '#a3a3a0');
        const rim = new THREE.Mesh(new THREE.TorusGeometry(12.65, .7, 6, 32), mat('#1c1c1c')); rim.rotation.x = Math.PI / 2; rim.position.set(tx, T + 10, ty); g.add(rim);
        const tray = new THREE.Group(); tray.position.set(tx, T + 5.3, ty); g.add(live ? mv(tray) : tray);
        for (let k = 0; k < 22; k++) { const a = rnd(300 + k) * Math.PI * 2, rr = 2 + rnd(330 + k) * 8.5; ball(tray, Math.cos(a) * rr, Math.sin(a) * rr, 0, 1.3, .8, .9, k % 3 ? '#68402A' : '#7a4a2c', K.BALL, { flatShading: false, roughness: .45 }) }
        if (live) A.push(tm => { tray.rotation.y = tm * .7; led.emissiveIntensity = .6 + .4 * Math.sin(tm * 3) });
        puffs(g, x0 + 2, yc - 4, zc + R + 8, 1.2, 3, '#ebe7e0', .75, 22, .35);
        }
        /* Escala .72 alrededor del centro de la mesa (54, 48), que queda en (52, 40): más atrás en la isla. */
        const S4 = .72; rg.scale.setScalar(S4); rg.position.set(52 - 54 * S4, 0, 40 - 48 * S4);
        /* Pallet con sacos de café verde (atrás a la derecha): sacos de yute acostados, de a dos por capa,
           y cada capa cruzada respecto de la de abajo, como se apilan de verdad. */
        {
          const PX = 86, PY = 15, PW = 26, PD = 28, pine = '#c9a170';
          [PX, PX + PW / 2 - 1.5, PX + PW - 3].forEach(x => box(g, x, PY, 0, 3, PD, .8, isoShade(pine, .9)));
          [PX, PX + PW / 2 - 1.5, PX + PW - 3].forEach(x => [PY, PY + PD / 2 - 1.5, PY + PD - 3].forEach(y => box(g, x, y, .8, 3, 3, 2.2, isoShade(pine, .85))));
          for (let k = 0; k < 6; k++) box(g, PX, PY + k * (PD - 3.2) / 5, 3, PW, 3.2, .8, pine);
          const LH = 4.4, base = 3.8;
          for (let L = 0; L < 5; L++) [.25, .75].forEach((f, j) => {
            const along = L % 2 === 0, sk = sh(new THREE.Mesh(K.PILLOW, mat(isoShade('#c9ad7c', .9 + rnd(L * 7 + j) * .16), { flatShading: false, roughness: 1 })));
            if (along) { sk.scale.set(PW / 2 * .98, LH / 2 * 1.08, PD / 4 * 1.02); sk.position.set(PX + PW / 2, base + LH * (L + .5), PY + PD * f) }
            else { sk.scale.set(PW / 4 * 1.02, LH / 2 * 1.08, PD / 2 * .98); sk.position.set(PX + PW * f, base + LH * (L + .5), PY + PD / 2) }
            sk.rotation.y = (rnd(L * 3 + j) - .5) * .08; g.add(sk);
          });
        }
        /* Saco abierto con café verde y granos caídos */
        const sk = sh(new THREE.Mesh(new THREE.CylinderGeometry(9, 8.6, 15, 16, 1, true), mat('#c9ad7c', { side: THREE.DoubleSide }))); sk.position.set(40, 7.5, 82); g.add(sk);
        const rimS = new THREE.Mesh(new THREE.TorusGeometry(9, 1.2, 6, 16), mat('#b8975f')); rimS.rotation.x = Math.PI / 2; rimS.position.set(40, 15, 82); g.add(rimS);
        cyl(g, 40, 82, 12.4, 8.2, 1.4, '#7f9a5a');
        for (let k = 0; k < 8; k++) ball(g, 35 + rnd(40 + k) * 10, 78 + rnd(80 + k) * 8, 14, 1.4, .8, .9, '#9db37a');
        [[50, 92], [54, 96], [46, 95]].forEach(([x, y]) => ball(g, x, y, .9, 1.6, .9, 1.1, '#9db37a'));
        tree(g, 10, 62, 1);
      },
      /* La barra */
      () => {
        tree(g, 104, 20, 1); tree(g, 20, 24, .9, '#6f8a5e');
        const T = 24; box(g, 8, 50, 0, 102, 34, T, '#8a6748', '#ece6db');
        const mx = 12, my = 52, mw = 58, D = 24, H = 30, z0 = T + 2;
        [[mx + 3, my + 3], [mx + mw - 5, my + 3], [mx + 3, my + D - 4], [mx + mw - 5, my + D - 4]].forEach(([x, y]) => box(g, x, y, T, 2, 2, 2, '#151515'));
        const prof = [[1, 0], [D - 1, 0], [D + 2, 2], [D + 2, 6], [D - 9, 6], [D - 9, H - 9], [D, H - 9], [D, H - 3], [D - 3, H]];
        for (let k = 0; k <= 8; k++) { const a = k / 8 * Math.PI / 2; prof.push([10 - 10 * Math.sin(a), H - 12 + 12 * Math.cos(a)]) }
        prof.push([0, 6], [0, 2]);
        prismX(g, prof.map(([y, z]) => [my + y, z0 + z]), mx, mw, '#b3262b', { flatShading: false, roughness: .35, metalness: .1 });
        const steel = { metalness: .7, roughness: .3 };
        const sw = box(g, mx + 1.5, my + D - 9.2, z0 + 6, mw - 3, .4, H - 15, '#d9d9d6'); sw.material = mat('#d9d9d6', steel);
        box(g, mx + 1, my + D - 9, z0 + 6, mw - 2, 11, .3, '#cfcfcc');
        for (let k = 1; k < 12; k++) box(g, mx + 3 + k * (mw - 6) / 12, my + D - 8, z0 + 6.3, .4, 9.5, .15, '#9a9a97');
        [mx + 8, mx + 22, mx + 38].forEach(x => box(g, x, my + D, z0 + H - 7.5, 10, .4, 3.5, '#2a2a2a'));
        { const d = sh(new THREE.Mesh(K.CYL, mat('#ffffff'))); d.scale.set(2.4, .6, 2.4); d.rotation.x = Math.PI / 2; d.position.set(mx + 9, z0 + 13, my + D - 8.9); g.add(d) }
        [mx + 20, mx + 40].forEach(x => {
          cyl(g, x, my + D - 4, z0 + H - 11, 4.2, 2, '#a8a8a5', '#a8a8a5', steel);
          cyl(g, x, my + D - 3.5, z0 + H - 13, 3.4, 2, '#bdbdba', '#bdbdba', steel);
          rod(g, [x, my + D - 2, z0 + H - 12], [x + 1, my + D + 8, z0 + H - 13.5], 1.3, '#141414');
          cyl(g, x, my + D - 4, z0 + 6.3, 2.4, 3.2, '#f4f2ee', '#5a3522');
          puffs(g, x, my + D - 4, z0 + 9.5, .45, 3, '#ffffff', .6, 12, .45);
        });
        [mx + 4, mx + mw - 4].forEach(x => rod(g, [x, my + D - 2, z0 + H - 10], [x, my + D, z0 + 9], .7, '#a9a9a6', steel));
        const vg = new THREE.Group(); vg.position.set(92, T, 66); vg.scale.setScalar(1.35); g.add(vg);
        const glass = new THREE.Mesh(new THREE.CylinderGeometry(5.4, 5.8, 11, 20), own('#dbe7ec', { transparent: true, opacity: .55, roughness: .1, depthWrite: false }));
        glass.position.y = 5.5; vg.add(glass);
        cyl(vg, 0, 0, .2, 5.2, 5, '#5a3522');
        cyl(vg, 0, 0, 11, 5.2, 1.2, '#e9e6e0');
        const cone = sh(new THREE.Mesh(new THREE.CylinderGeometry(8.5, 2.6, 9, 24, 1, true), mat('#f6f4f0', { side: THREE.DoubleSide, flatShading: false })));
        cone.position.y = 16.7; vg.add(cone);
        cyl(vg, 0, 0, 19.5, 5, .3, '#6b4630');
        puffs(g, 92, 66, T + 28, .6, 3, '#ffffff', .5, 12, .35);
      },
      /* La mesa de cata: mesa atrás con dos filas de bowls (a la escala de las tazas de la barra), una mesita
         al costado para preparar (hervidor, molino y balanza). */
      () => {
        const T = 16, wood = '#6e4f37';
        /* Mesa de cata */
        [[19, 23], [83, 23], [19, 51], [83, 51]].forEach(([x, y]) => box(g, x, y, 0, 2.5, 2.5, T - 3, wood));
        box(g, 18, 22, T - 3, 68, 32, 3, '#8a6748', '#efe9de');
        let k = 0;
        [31, 45].forEach(y => [28, 42, 56, 70].forEach(x => {
          cyl(g, x, y, T, 4.6, 3.6, '#ece9e3', '#f6f4ef', { flatShading: false });
          cyl(g, x, y, T + 3.6, 4, .2, '#6b3f26', '#6b3f26', { flatShading: false });
          cyl(g, x - .3, y - .2, T + 3.65, 2.9, .2, '#8a5a36', '#8a5a36', { flatShading: false });
          for (let j = 0; j < 4; j++) ball(g, x + (rnd(900 + k * 9 + j) * 2 - 1) * 2.4, y + (rnd(950 + k * 9 + j) * 2 - 1) * 2.4, T + 3.9, .55, .25, .55, '#c49a6c');
          /* Cucharita de cata adelante del bowl */
          rod(g, [x - 3, y + 6, T + .4], [x + 4, y + 6.6, T + .4], .4, '#a7abaf');
          ball(g, x - 4.3, y + 5.9, T + .55, 1.7, .5, 1.2, '#dfe1e3');
          if (k % 3 === 0) puffs(g, x, y, T + 5, .4, 2, '#ffffff', .45, 9, .3);
          k++;
        }));
        /* Planilla con lápiz y vaso de enjuague con cucharas, en la punta de la mesa */
        box(g, 77, 25, T, 8, 11, .25, '#ffffff');
        for (let j = 1; j < 5; j++) box(g, 78, 25 + j * 2.1, T + .26, 6, .25, .05, '#cfc9bd');
        rod(g, [79, 37.5, T + .5], [85, 38.5, T + .5], .45, '#e0b440');
        const glass = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3, 7.5, 20), own('#dcebf0', { transparent: true, opacity: .5, roughness: .1, depthWrite: false }));
        glass.position.set(80, T + 3.75, 47); g.add(glass);
        rod(g, [79.4, 47, T + 1.5], [78.6, 46.4, T + 10.5], .35, '#b9bcbf'); rod(g, [80.6, 47.6, T + 1.5], [82.4, 47, T + 11], .35, '#b9bcbf');
        /* Mesita de preparación al costado: hervidor de cuello de cisne, molino y balanza */
        const T2 = 14;
        [[93, 25], [109, 25], [93, 47], [109, 47]].forEach(([x, y]) => box(g, x, y, 0, 2, 2, T2 - 2, wood));
        box(g, 92, 24, T2 - 2, 20, 26, 2, '#8a6748', '#a98563');
        const steel = { metalness: .7, roughness: .3, flatShading: false };
        cyl(g, 99, 31, T2, 3.4, 5.5, '#c9c9c6', '#b9b9b6', steel);
        cyl(g, 99, 31, T2 + 5.5, 1.6, .9, '#2b2b2b');
        rod(g, [101.8, 31, T2 + 1.5], [104.5, 31, T2 + 6.5], .45, '#c9c9c6', steel);
        rod(g, [104.5, 31, T2 + 6.5], [106.2, 31, T2 + 6], .4, '#c9c9c6', steel);
        rod(g, [96, 31, T2 + 5], [94.8, 31, T2 + 1.5], .7, '#2b2b2b');
        box(g, 103, 40, T2, 6, 6, 3.5, '#2f2f2f');
        cyl(g, 106, 43, T2 + 3.5, 2.3, 5.5, '#3a3a3a');
        const hop = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 1.4, 4.5, 16), own('#d9cbb5', { transparent: true, opacity: .75, roughness: .2 }));
        hop.position.set(106, T2 + 11.25, 43); g.add(hop);
        box(g, 94, 40, T2, 6.5, 6.5, .8, '#1f1f1f', '#2c2c2c');
        cyl(g, 97.25, 43.25, T2 + .8, 2.6, 1.6, '#f4f2ee', '#6b3f26');
        tree(g, 100, 98, 1);
      }
    ];
    LAND[i]();

    /* ---------- Estado de la estación ---------- */
    if (st === 'done') {
      /* Banderín sobre la isla, adelante a la izquierda, en un lugar libre de cada una */
      const [fx, fy] = [[40, 104], [24, 94], [18, 100], [24, 94], [24, 94], [24, 94]][i];
      rod(g, [fx, fy, 0], [fx, fy, 36], .8, '#e8e4da');
      ball(g, fx, fy, 36.6, 1, 1, 1, '#e8e4da');
      const fg = new THREE.Shape(); fg.moveTo(0, 0); fg.lineTo(22, -6.5); fg.lineTo(0, -13); fg.lineTo(0, 0);
      const flag = new THREE.Group(); flag.position.set(fx, 35.5, fy); flag.rotation.y = Math.PI / 4; g.add(mv(flag));
      const cloth = sh(new THREE.Mesh(new THREE.ShapeGeometry(fg), own('#637a5d', { side: THREE.DoubleSide }))); flag.add(cloth);
      A.push(tm => { flag.rotation.y = Math.PI / 4 + Math.sin(tm * 2.2) * .22; cloth.scale.x = 1 + Math.sin(tm * 4.5) * .05 });
    }
    if (st === 'cur') {
      /* Brillo cálido alrededor de la isla que sigue */
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex('glow', 'rgba(255,214,140,1)', 'rgba(255,214,140,0)'), transparent: true, depthWrite: false, opacity: .6 }));
      /* Va bien atrás en la dirección de la cámara: en pantalla queda en el mismo lugar, pero detrás de todo lo de la isla. */
      glow.scale.set(300, 300, 1); glow.position.set(MAP_IW / 2 - 160, -12 - 160, MAP_ID / 2 - 160); glow.renderOrder = -1; g.add(glow);
    }
    if (off) {
      /* Niebla: manchas blancas que rodean la isla y se mueven despacio */
      const fog = Array.from({ length: 12 }, (_, k) => {
        const p = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex('puff', 'rgba(255,255,255,1)'), transparent: true, depthWrite: false, opacity: .65 }));
        const a = k / 12 * Math.PI * 2, r = 30 + rnd(k + i * 20) * 34;
        p.userData = { a, r, z: 4 + rnd(k + 7) * 40, s: 70 + rnd(k + 3) * 50 };
        p.scale.setScalar(p.userData.s); g.add(mv(p)); return p;
      });
      const place = tm => fog.forEach((p, k) => { const u = p.userData, a = u.a + tm * .05; p.position.set(MAP_IW / 2 + Math.cos(a) * u.r, u.z + Math.sin(tm * .4 + k) * 2, MAP_ID / 2 + Math.sin(a) * u.r) });
      place(0); A.push(place);
    }
    return g;
  }

  /* Luces: sol cálido desde arriba a la izquierda, cielo azulado y un relleno frío del lado de la sombra. */
  function lights(scene, center, span) {
    scene.add(new THREE.HemisphereLight('#e9f2ff', '#d6c3a0', 1.35));
    const sun = new THREE.DirectionalLight('#ffe8c2', 2.5), L = new THREE.Vector3(.45, 1, .18).normalize();
    sun.position.copy(center).addScaledVector(L, span.dist); sun.target.position.copy(center); scene.add(sun, sun.target);
    const fill = new THREE.DirectionalLight('#bcd2ff', .55); fill.position.copy(center).add(new THREE.Vector3(-300, 160, -120)); fill.target.position.copy(center); scene.add(fill, fill.target);
    sun.castShadow = true; sun.shadow.bias = -.0004; sun.shadow.normalBias = .6;
    return sun;
  }

  /* ============================================================
     Mapa completo
     La cámara ortográfica mira desde el mismo ángulo que el dibujo
     isométrico; por eso los botones de cada estación (HTML encima)
     quedan en su lugar.
     Dos lienzos, uno encima del otro:
     - abajo, todo lo quieto (islas, cerros, objetos, camino, nubes, sombras),
       dibujado una sola vez (y otra vez solo si cambia el tamaño);
     - arriba, transparente, solo lo que se mueve (lo marcado con mv en
       makeIsland: humo, vapor, pájaros, barco, banderines, granos de la
       bandeja, luces del tostador, piedras sueltas, niebla y el sol).
     Todo lo que se mueve es chico y queda delante de lo demás, así que no
     hace falta saber qué hay detrás. En cada cuadro solo se dibuja eso.
     ============================================================ */
  KINDS.map = el => {
    const svg = el.querySelector('.map-scene'), still = document.createElement('canvas'), canvas = document.createElement('canvas');
    still.className = 't3-canvas t3-map t3-still'; canvas.className = 't3-canvas t3-map';
    still.setAttribute('aria-hidden', 'true'); canvas.setAttribute('aria-hidden', 'true');
    svg.after(still, canvas);
    const r = new THREE.WebGLRenderer({ canvas: still, antialias: true, alpha: true });
    r.setClearColor(0, 0); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; r.shadowMap.autoUpdate = false;
    const r2 = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    r2.setClearColor(0, 0);
    const K = kit(), scene = new THREE.Scene();
    const curNode = el.querySelector('.map-node.is-cur'), cur = curNode ? +curNode.dataset.v : -1;
    const isles = MAP_PLACES.map((m, i) => { const g = makeIsland(i, isleState(i, cur)), [ax, ay] = scrToWorld(...mapOrigin(i)); g.position.set(ax, 0, ay); scene.add(g); return g });
    /* Sombra suave debajo de cada isla flotante */
    isles.forEach(g => { const sb = new THREE.Mesh(new THREE.PlaneGeometry(170, 170).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: softTex('shadow', 'rgba(0,0,0,.5)', 'rgba(0,0,0,0)'), transparent: true, opacity: .22, depthWrite: false })); sb.position.set(MAP_IW / 2, -MAP_IH - 170, MAP_ID / 2); g.add(sb) });
    /* Camino de baldosas entre islas (verde en lo ya recorrido). Una baldosa del dibujo mide 15 de medio ancho. */
    const TILE = 15 / Math.cos(Math.PI / 6), tileMat = {};
    const tm = (c) => tileMat[c] || (tileMat[c] = new THREE.MeshStandardMaterial({ color: c, roughness: .9, flatShading: true }));
    for (let i = 0; i < SC.length - 1; i++) {
      const a = mapFront(i), b = isoP(mapOrigin(i + 1), MAP_IW / 2, 0, 0), lit = stDone(i);
      for (let k = 1; k < 7; k++) {
        const t = k / 7, [wx, wy] = scrToWorld(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + 6, 0);
        const m = new THREE.Mesh(K.BOX, [1, 1, 0, 1, 1, 1].map(j => tm(lit ? ['#a9bf98', '#7f9670'][j] : ['#e8d9b8', '#c2ad87'][j])));
        m.castShadow = m.receiveShadow = true; m.scale.set(TILE, 5, TILE); m.position.set(wx, -2.5, wy); scene.add(m);
      }
    }
    /* Nubes */
    const cloudMat = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: .85, roughness: 1, emissive: '#ffffff', emissiveIntensity: .35 });
    [[70, 40, 1], [320, 300, .8], [60, 600, .7], [330, 900, .9], [80, 1250, .7]].forEach(([x, y, k]) => {
      const [wx, wy] = scrToWorld(x, y, 60), c = new THREE.Group();
      [[0, 0, 0, 22, 8], [-10, 4, 8, 11, 8], [10, 6, -8, 13, 10]].forEach(([dx, dz, dy, rr, h]) => { const p = new THREE.Mesh(K.BALL, cloudMat); p.scale.set(rr, h, rr * .8); p.position.set(dx, dz, dy); c.add(p) });
      c.scale.setScalar(k); c.position.set(wx, 60, wy); scene.add(c);
    });

    const [tx, ty] = scrToWorld(MAP_W / 2, MAP_H / 2, 0), T0 = new THREE.Vector3(tx, 0, ty);
    const hw = MAP_W / 2 / ISO_K, hh = MAP_H / 2 / ISO_K;
    const cam = new THREE.OrthographicCamera(-hw, hw, hh, -hh, 1, 9000);
    cam.position.copy(new THREE.Vector3(1, 1, 1).normalize()).multiplyScalar(3000).add(T0); cam.lookAt(T0);
    const sun = lights(scene, T0, { dist: 1600 });
    const sc = sun.shadow.camera; sc.left = -230; sc.right = 230; sc.top = 1250; sc.bottom = -1250; sc.near = 100; sc.far = 3400;
    sc.up.set(1, 0, 1).normalize(); sc.updateProjectionMatrix(); sun.shadow.mapSize.set(512, 4096);

    /* Capas: 0 = quieto (lienzo de abajo), 1 = se mueve (lienzo de arriba). Las luces iluminan las dos. */
    const layer = (o, moving) => { const m = moving || !!o.userData.mv; if (o.isLight) o.layers.enableAll(); else if (m) o.layers.set(1); o.children.forEach(c => layer(c, m)) };
    layer(scene, false);
    const cam2 = cam.clone(); cam.layers.set(0); cam2.layers.set(1);

    /* Tocar una isla abre su ficha. */
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    ray.layers.enableAll();
    const isleAt = e => {
      const b = canvas.getBoundingClientRect();
      ndc.set((e.clientX - b.left) / b.width * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
      ray.setFromCamera(ndc, cam);
      const hit = ray.intersectObjects(isles, true).find(h => !h.object.isSprite); if (!hit) return -1;
      let o = hit.object; while (o && o.userData.isle === undefined) o = o.parent;
      return o ? o.userData.isle : -1;
    };
    canvas.addEventListener('click', e => { const i = isleAt(e); if (i >= 0 && ACTIONS.mapNode) ACTIONS.mapNode(String(i)) });
    canvas.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') canvas.style.cursor = isleAt(e) >= 0 ? 'pointer' : '' });

    const v = { canvas };
    let W = 0, H = 0, lastT = 0, stillDirty = true;
    v.frame = (time) => {
      const w = svg.clientWidth, h = svg.clientHeight; if (!w || !h) return false;
      if (w !== W || h !== H) {
        W = w; H = h;
        /* Un <svg> no tiene offsetTop: se mide contra el contenedor. */
        const a = svg.getBoundingClientRect(), b = el.getBoundingClientRect();
        [still, canvas].forEach(c => { c.style.left = (a.left - b.left) + 'px'; c.style.top = (a.top - b.top) + 'px'; c.style.width = w + 'px'; c.style.height = h + 'px' });
        r.setPixelRatio(dpr(1.5)); r.setSize(w, h, false); r2.setPixelRatio(dpr(1.5)); r2.setSize(w, h, false);
        stillDirty = v.dirty = true;
      }
      /* Lo quieto: una sola vez (con sus sombras) */
      if (stillDirty) {
        stillDirty = false; r.shadowMap.needsUpdate = true; r.render(scene, cam);
        el.classList.add('t3-map-on');
      }
      /* Lo que se mueve: a ~30 cuadros por segundo alcanza y cuida la batería */
      const anim = !reduce();
      if (!v.dirty && (!anim || time - lastT < 1 / 30)) return anim;
      lastT = time; v.dirty = false;
      isles.forEach(g => g.userData.anim.forEach(f => f(anim ? time : 0)));
      r2.render(scene, cam2);
      return anim;
    };
    v.dispose = () => { disposeTree(scene); [r, r2].forEach(x => { x.dispose(); x.forceContextLoss && x.forceContextLoss() }); still.remove(); canvas.remove() };
    return v;
  };

  scan();
  return { scan, get ready() { return state === 'ready' } };
})();
