/* ============================================================
   Laboratorio · simuladores, nuevo registro y bitácora
   Los simuladores (filtrado, espresso, agua, molienda, TDS) viven en
   js/academia/preparacion.js y se comparten con la Academia.
   La bitácora se guarda en este navegador (localStorage 'cl-bit').
   ============================================================ */

let BIT = [];
try { BIT = JSON.parse(localStorage.getItem('cl-bit') || '[]') } catch (e) {}
const bsv = () => { try { localStorage.setItem('cl-bit', JSON.stringify(BIT)) } catch (e) { S.be = 'No se pudo guardar en este navegador.' } };

Object.assign(S, { lb: 'f', workMode: 'experiment', prefill: null, cmp: [], bm: '', be: '' });

/* Direcciones de cada herramienta: #/laboratorio/<slug> */
const LAB_SLUG = { f: 'filtrado', e: 'espresso', a: 'agua', m: 'molienda', t: 'tds' };
const LAB_MODE_SLUG = { record: 'nuevo-registro', history: 'bitacora' };

/* Registros viejos guardaban el caudal en el mismo campo que la fecha (f). */
const recDate = b => typeof b.f === 'string' ? b.f : 'Sin fecha';
const recFlow = b => b.flow != null ? b.flow : (typeof b.f === 'number' ? b.f : 0);

const LB=[['f','Filtrado'],['e','Espresso'],['a','Agua'],['m','Molienda'],['t','TDS']];
/* Campos del formulario. Los numéricos abren el teclado numérico en el celular.
   Cada campo tiene un lugar para su propio mensaje de error (e_<id>). */
const fi=(id,l,t,x)=>`<div class=field><label for='b_${id}'>${l}</label><input class=ti id='b_${id}' type='${t||'text'}' ${t==='number'?'inputmode=decimal':''} autocomplete=off aria-describedby='e_${id}' ${x||''}><span class=field-error id='e_${id}'></span></div>`,sel=(id,l,o)=>`<div class=field><label for='b_${id}'>${l}</label><select class=ti id='b_${id}'>${o.map(v=>`<option>${v}</option>`).join('')}</select></div>`;
/* Ids de todos los campos, para limpiar y deshacer. */
const FORM_DEFAULTS = ['V60', 'Lavado', 'Sin remoción'];
const FORM_IDS = ['n','o','v','p','m','d','w','t','g','cl','s','f','pc','bl','ew','a','x','y','z'];
const formSnapshot = () => Object.fromEntries(FORM_IDS.map(k => [k, (document.getElementById('b_' + k) || {}).value || '']));
const bv=id=>document.getElementById('b_'+id).value.trim();
function workTabs(){return `<div class="workspace-tabs"><button data-a="wm" data-v="experiment" aria-pressed="${S.workMode==='experiment'}"><b>Simulador</b><small>Probá y ajustá variables</small></button><button data-a="wm" data-v="record" aria-pressed="${S.workMode==='record'}"><b>Nuevo registro</b><small>Guardá una preparación</small></button><button data-a="wm" data-v="history" aria-pressed="${S.workMode==='history'}"><b>Mi bitácora (${BIT.length})</b><small>Historial y comparaciones</small></button></div>`}
function lab(){return `<div class=k>Espacio de experimentación</div><h2>Laboratorio</h2><p class=m>Acá no archivás resultados: trabajás con ellos. Modificá parámetros, aislá variables y observá cómo se relacionan. Cuando termines, podés guardar la prueba en tu Bitácora.</p>${workTabs()}${S.workMode==='experiment'?`<div class="lab-intro-grid"><div class="lab-purpose"><span class=k>QUÉ HACÉS ACÁ</span><h3>Experimentar con intención.</h3><p>Elegí una preparación, definí qué querés investigar y cambiá una variable por vez. El simulador muestra relaciones y cálculos; no reemplaza la preparación real ni predice el sabor.</p></div><div class="lab-method"><span class=k>PROTOCOLO BREVE</span><ol><li>Elegí una receta de referencia.</li><li>Identificá una variable para modificar.</li><li>Mantené las demás constantes.</li><li>Prepará, medí y evaluá.</li><li>Guardá el resultado si querés conservarlo.</li></ol></div></div><div class="lab-tool-head"><div><span class=k>HERRAMIENTAS</span><h3>¿Qué querés explorar?</h3></div><p class=m>Seleccioná un área. Cada una trabaja una familia distinta de variables.</p></div><div class="lab-tool-grid">${LB.map((t,i)=>`<button class="lab-tool ${S.lb===t[0]?'active':''}" aria-pressed="${S.lb===t[0]}" data-a=lb data-v="${t[0]}"><b>${t[1]}</b><small>${({f:'Dosis, agua, temperatura y vertido',e:'Dosis, bebida, tiempo y presión',a:'Dureza y alcalinidad',m:'Distribución y tamaño de partícula',t:'TDS y rendimiento de extracción'})[t[0]]}</small><i>Explorar →</i></button>`).join('')}</div><div class="lab-variable-panel"><div class="lab-current"><span class=k>ÁREA SELECCIONADA</span><h3>${LB.find(t=>t[0]===S.lb)[1]}</h3><p class=m>${({f:'Configurá la receta y el comportamiento del vertido.',e:'Ajustá la relación entre dosis, bebida y tiempo.',a:'Observá por separado dureza y alcalinidad.',m:'Explorá cómo cambia la distribución de partículas.',t:'Relacioná la concentración medida con el rendimiento calculado.'})[S.lb]}</p></div><div class="lab-controls">${({f:prep3,e:esp,a:agua,m:mol,t:med})[S.lb]()}</div></div><div class="bar"><button class="b p" data-a="openlog">Guardar esta prueba en Bitácora →</button></div>`:S.workMode==='record'?recordForm():recordHistory()}`}
function recordForm(){const p=S.prefill||{},adv=Object.keys(p).some(k=>!['n','m','d','w','z'].includes(k)&&p[k]!==''&&p[k]!=null&&!FORM_DEFAULTS.includes(p[k]));return `<div class=panel><div class=k>Nuevo registro</div><h3>Guardá una preparación</h3><p class=m>Solo los campos con * son obligatorios. El resto podés sumarlo ahora o más adelante.</p>
<div class=form-grid>${fi('n','Nombre del café *')}${sel('m','Método',['V60','Espresso','AeroPress','Prensa francesa','Otro'])}${fi('d','Dosis de café (g) *','number','min=0.1 step=.1')}${fi('w','Agua o bebida (g) *','number','min=1 step=1')}</div>
<details class=more-fields ${adv?'open':''}><summary>Más detalles <span class=m>(origen, temperatura, molienda, tiempos, TDS…)</span></summary><div class=form-grid>${fi('o','Origen')}${fi('v','Variedad')}${sel('p','Proceso',['Lavado','Natural','Honey','Anaeróbico','Otro'])}${fi('t','Temperatura (°C)','number','min=60 max=100 step=.5')}${fi('g','Molienda / ajuste')}${fi('cl','Clics del molino (0–150)','number','min=0 max=150 step=1')}${fi('s','Tiempo total (segundos)','number','min=1')}${fi('f','Caudal de vertido (g/s)','number','min=0 step=.1')}${fi('pc','Cantidad de vertidos','number','min=1 step=1')}${fi('bl','Bloom (veces la dosis)','number','min=0 step=.5')}${fi('ew','Espera del bloom (segundos)','number','min=0 step=1')}${sel('a','Agitación',['Sin remoción','Suave','Moderada','Intensa'])}${fi('x','TDS (%)','number','min=0 max=20 step=.01')}${fi('y','Masa de bebida (g)','number','min=1')}</div></details>
${recSensBlock()}<div class="form-grid"><div class="wide"><label for=b_z>Notas sensoriales y observaciones</label><textarea class=ti id=b_z placeholder="Aroma, acidez, dulzor, cuerpo, balance, cambios que probaste…"></textarea><div class=field-hint>Escribí libremente. No hace falta completar todos los atributos.</div></div></div><div id=berr class="form-error" role="alert">${S.be||''}</div><div class=bar><button class="b p" data-a=quickSave>Guardar registro</button><button class=b data-a=clearform>Limpiar</button></div><p class=m>${S.bm||'Se guarda en este navegador y dispositivo.'}</p></div>`}
function recordHistory(){return `<div class=k>Tu biblioteca de preparaciones</div><h3>${BIT.length} registros guardados</h3><p class=m>Revisá, compará y detectá patrones entre tus pruebas.</p>${BIT.length?BIT.slice().reverse().map(b=>`<div class=record-card><div class=challenge-meta><span>${recDate(b)}</span><span>${b.m||'Método sin definir'}</span>${b.p?`<span>${b.p}</span>`:''}</div><h3 style="margin:10px 0 4px">${b.n}</h3><p class=m>${[b.o,b.v].filter(Boolean).join(' · ')}</p><p><b>${b.d} g</b> / <b>${b.w} g</b> · ratio 1:${(b.w/b.d).toFixed(1)}${b.t?' · '+b.t+' °C':''}${b.s?' · '+b.s+' s':''}${b.tds?' · TDS '+b.tds+' %':''}${b.ey?' · EY '+b.ey.toFixed(1)+' %':''}</p>${recFlow(b)||b.pours||b.bloom||b.agitation?`<p class=m>${b.g?'Molienda '+b.g+' · ':''}${b.clicks!=null?'Molino '+b.clicks+' clics · ':''}${recFlow(b)?'Caudal '+recFlow(b)+' g/s · ':''}${b.pours?'Vertidos '+b.pours+' · ':''}${b.bloom?'Bloom '+b.bloom+'× · ':''}${b.wait?'Espera '+b.wait+' s · ':''}${b.agitation||''}</p>`:''}${b.sens?`<div class=rec-sens-mini>${sensRadar(b.sens,120)}</div>`:''}${b.z?`<p class=m>${b.z}</p>`:''}<div class=record-actions><button class=b data-a=bcmp data-v="${b.id}">${S.cmp.includes(b.id)?'Quitar comparación':'Comparar'}</button><button class=b data-a=editRecord data-v="${b.id}">Duplicar como nueva prueba</button><button class=b data-a=bdel data-v="${b.id}">Borrar</button></div></div>`).join(''):`<div class=panel><h3>Tu bitácora empieza acá</h3><p class=m>Hacé una prueba en el laboratorio y guardala, o creá un registro manual.</p><button class="b p" data-a=wm data-v=experiment>Ir a experimentar</button></div>`}${(()=>{let c=S.cmp.map(id=>BIT.find(b=>b.id==id)).filter(Boolean);return c.length===2?`<div class=panel><div class=k>Comparación de preparaciones</div><p class=m>La tabla muestra diferencias entre registros. Para atribuir un efecto a una variable, procurá mantener constantes las demás condiciones.</p><table><tr><th>Variable</th><th>${c[0].n}</th><th>${c[1].n}</th></tr>${[['Ratio',b=>'1:'+(b.w/b.d).toFixed(1)],['Temperatura',b=>b.t||'—'],['Tiempo',b=>b.s?b.s+' s':'—'],['TDS',b=>b.tds?b.tds+' %':'—'],['Rendimiento',b=>b.ey?b.ey.toFixed(1)+' %':'—'],['Molienda',b=>b.g||'—'],['Clics del molino',b=>b.clicks!=null?b.clicks+' clics':'—'],['Caudal',b=>recFlow(b)?recFlow(b)+' g/s':'—'],['Vertidos',b=>b.pours||'—'],['Bloom',b=>b.bloom?b.bloom+'×':'—'],['Agitación',b=>b.agitation||'—']].map(r=>`<tr><th>${r[0]}</th><td>${r[1](c[0])}</td><td>${r[1](c[1])}</td></tr>`).join('')}</table></div>`:''})()}`}

/* ---------- Después de dibujar ---------- */
function labAfter() {
  if (S.workMode === 'experiment') ({ f: pu, e: pe, a: ag, m: mo, t: me })[S.lb]();
  if (S.workMode === 'record' && S.prefill) {
    /* Precarga el formulario: las claves de S.prefill son los id de los campos (b_<clave>). */
    for (const [k, v] of Object.entries(S.prefill)) {
      const el = document.getElementById('b_' + k);
      if (el && v !== '' && v != null && !el.value) el.value = v;
      if (el && el.tagName === 'SELECT' && v) el.value = v;
    }
  }
}

/* Lleva al registro los valores actuales del simulador. */
function prefillFromLab() {
  if (S.lb === 'e') {
    const x = S.es;
    return { m: 'Espresso', d: x.d, w: x.y, t: x.t, s: x.s, g: ESG[x.g - 1] };
  }
  const x = S.lab;
  return { m: 'V60', d: x.d, w: x.w, t: x.t, g: GN[x.g - 1], cl: x.clicks || 0, f: x.f, pc: x.n, bl: x.b, ew: x.e, a: AN[x.a] };
}
/* Duplica un registro guardado como punto de partida de una prueba nueva. */
const prefillFromRecord = b => ({
  n: b.n, o: b.o, v: b.v, p: b.p, m: b.m, d: b.d, w: b.w, t: b.t, g: b.g, cl: b.clicks, s: b.s,
  f: recFlow(b), pc: b.pours, bl: b.bloom, ew: b.wait, a: b.agitation, x: b.tds, y: b.y, z: b.z
});

/* Marca cada campo con error, muestra el motivo debajo y lleva el foco al primero. */
function showFieldErrors(errs) {
  FORM_IDS.forEach(k => {
    const el = document.getElementById('b_' + k), msg = document.getElementById('e_' + k);
    if (el) el.toggleAttribute('aria-invalid', !!errs[k]);
    if (msg) msg.textContent = errs[k] || '';
  });
  const keys = Object.keys(errs), box = $('#berr');
  S.be = keys.length ? (keys.length === 1 ? 'Revisá el campo marcado.' : 'Revisá los ' + keys.length + ' campos marcados.') : '';
  if (box) box.textContent = S.be;
  if (!keys.length) return false;
  const first = document.getElementById('b_' + keys[0]);
  if (first) { const det = first.closest('details'); if (det) det.open = true; first.focus(); first.scrollIntoView({ block: 'center' }) }
  return true;
}

on({
  lb: v => routeTo('/laboratorio/' + LAB_SLUG[v]),
  wm: v => { S.be = ''; routeTo('/laboratorio/' + (LAB_MODE_SLUG[v] || LAB_SLUG[S.lb])) },
  openlog: () => { S.prefill = prefillFromLab(); S.be = ''; S.bm = ''; routeTo('/laboratorio/nuevo-registro') },
  editRecord: v => { const b = BIT.find(x => x.id == v); if (b) { S.prefill = prefillFromRecord(b); S.be = ''; S.bm = ''; routeTo('/laboratorio/nuevo-registro') } },
  clearform: () => {
    const before = formSnapshot();
    const sensBefore = S.recSens.slice();
    S.prefill = null; S.be = ''; S.bm = ''; S.recSens = [0, 0, 0, 0, 0, 0]; R(0);
    if (Object.values(before).some(v => v && !FORM_DEFAULTS.includes(v)) || sensBefore.some(v => v))
      toast('Formulario limpio', 'Deshacer', () => {
        if (!S.recSens.some(v => v)) { S.recSens = sensBefore; recSensUpdate() }
        /* Solo repone los campos que siguen vacíos: no pisa lo escrito después de limpiar. */
        for (const [k, v] of Object.entries(before)) {
          const el = document.getElementById('b_' + k);
          if (!el || !v) continue;
          const untouched = el.tagName === 'SELECT' ? el.selectedIndex === 0 : !el.value;
          if (untouched) { el.value = v; const det = el.closest('details'); if (det && !FORM_DEFAULTS.includes(v)) det.open = true }
        }
      });
  },
  quickSave: () => {
    const n = bv('n'), d = +bv('d'), w = +bv('w'), t = +bv('t') || 0, x = +bv('x') || 0, y = +bv('y') || 0;
    const errs = {};
    if (!n) errs.n = 'Escribí el nombre del café.';
    if (!(d > 0)) errs.d = 'Ingresá la dosis en gramos (mayor que 0).';
    if (!(w > 0)) errs.w = 'Ingresá el agua o la bebida en gramos (mayor que 0).';
    if (t && (t < 60 || t > 100)) errs.t = 'La temperatura va entre 60 y 100 °C.';
    if (x && (x < 0 || x > 20)) errs.x = 'El TDS va entre 0 y 20 %.';
    if (showFieldErrors(errs)) return;
    BIT.unshift({
      id: Date.now(), f: new Date().toLocaleDateString('es-AR'), n, o: bv('o'), v: bv('v'), p: bv('p'), m: bv('m'), d, w, t, g: bv('g'),
      clicks: bv('cl') === '' ? null : Math.max(0, Math.min(150, Math.round(+bv('cl')))), s: +bv('s') || 0, flow: +bv('f') || 0,
      pours: +bv('pc') || 0, bloom: +bv('bl') || 0, wait: +bv('ew') || 0, agitation: bv('a'), y, tds: x, ey: x && y ? x * y / d : 0, z: bv('z'),
      sens: S.recSens.some(v => v) ? S.recSens.slice() : null
    });
    S.recSens = [0, 0, 0, 0, 0, 0];
    bsv(); S.be = ''; S.bm = 'Registro guardado correctamente.'; S.prefill = null;
    routeTo('/laboratorio/bitacora'); toast('✓ Registro guardado');
  },
  bcmp: v => { const id = +v, i = S.cmp.indexOf(id); if (i >= 0) S.cmp.splice(i, 1); else { S.cmp.push(id); if (S.cmp.length > 2) S.cmp.shift() } R(0) },
  bdel: v => {
    const i = BIT.findIndex(b => b.id == v); if (i < 0) return;
    const [gone] = BIT.splice(i, 1), cmpBefore = S.cmp.slice();
    S.cmp = S.cmp.filter(x => x != v); bsv(); R(0);
    toast('Registro “' + gone.n + '” borrado', 'Deshacer', () => {
      if (BIT.some(b => b.id === gone.id)) return;
      /* La bitácora va de más nuevo a más viejo: se reinserta según su id (fecha de creación). */
      const at = BIT.findIndex(b => b.id < gone.id);
      BIT.splice(at < 0 ? BIT.length : at, 0, gone);
      S.cmp = cmpBefore.filter(id => BIT.some(b => b.id === id));
      bsv(); R(0);
    });
  }
});

/* ---------- Perfil sensorial del registro ----------
   Versión simple del radar del módulo Sensorial: cada atributo se marca con un
   toque del 1 al 5 (otro toque en el mismo número lo borra). Es opcional;
   el radar se dibuja solo con los atributos marcados. */
S.recSens = S.recSens || [0, 0, 0, 0, 0, 0];
function sensRadar(v, size = 180) {
  const pt = (k, r) => { const g = (-90 + 60 * k) * Math.PI / 180; return [(100 + r * Math.cos(g)).toFixed(1), (100 + r * Math.sin(g)).toFixed(1)] };
  const ring = r => AX.map((_, k) => pt(k, r).join(',')).join(' ');
  const poly = v.map((x, k) => pt(k, 70 * (x || 0) / 5).join(',')).join(' ');
  return `<svg class="sens-radar" viewBox="-24 0 248 200" width="${size}" height="${size}" role="img" aria-label="Perfil sensorial: ${AX.map((a, k) => a + ' ' + (v[k] || 0)).join(', ')}">
    <g fill="none" stroke="var(--line-strong)">${[1, 2, 3, 4, 5].map(k => `<polygon points="${ring(70 * k / 5)}" ${k < 5 ? 'opacity=".55"' : ''}/>`).join('')}${AX.map((_, k) => `<line x1="100" y1="100" x2="${pt(k, 70)[0]}" y2="${pt(k, 70)[1]}" opacity=".55"/>`).join('')}</g>
    <polygon points="${poly}" fill="var(--accent)" fill-opacity=".45" stroke="var(--terra)" stroke-width="2"/>
    <g font-size="10" fill="var(--muted)" text-anchor="middle">${AX.map((a, k) => { const [x, y] = pt(k, 88); return `<text x="${x}" y="${+y + 3}">${a}</text>` }).join('')}</g></svg>`;
}
function recSensInner() {
  const v = S.recSens, any = v.some(x => x);
  return `<div class="rec-sens-grid"><div class="rec-sens-rows">${AX.map((a, i) => `<div class="sens-row"><span class="sens-name" id="sn${i}">${a}</span><div class="sens-scale" role="radiogroup" aria-labelledby="sn${i}">${[1, 2, 3, 4, 5].map(n => `<button type="button" class="sens-dot" role="radio" aria-checked="${v[i] === n}" aria-label="${n}: ${SW[n]}" data-a="recSens" data-v="${i}:${n}">${n}</button>`).join('')}</div><span class="sens-val">${v[i] ? SW[v[i]] : '—'}</span></div>`).join('')}</div>
    <div class="rec-sens-chart">${sensRadar(v)}${any ? `<button type="button" class="link-btn" data-a="recSensClear">Borrar perfil</button>` : `<p class="m">Tocá un número en cada atributo para ver el perfil.</p>`}</div></div>`;
}
const recSensBlock = () => `<section class="rec-sens" aria-labelledby="rec-sens-h"><div class="k" id="rec-sens-h">Perfil sensorial <span class="m">(opcional)</span></div><p class="field-hint">1 = muy suave · 5 = muy intensa. Marcá solo lo que percibiste.</p><div id="rec-sens">${recSensInner()}</div></section>`;
/* Se redibuja solo este bloque: lo escrito en el resto del formulario no se toca. */
function recSensUpdate(focusV) {
  const box = $('#rec-sens'); if (!box) return;
  box.innerHTML = recSensInner();
  if (focusV) { const b = box.querySelector(`[data-v="${focusV}"]`); if (b) b.focus({ preventScroll: true }) }
}
on({
  recSens: v => { const [i, n] = v.split(':').map(Number); S.recSens[i] = S.recSens[i] === n ? 0 : n; recSensUpdate(v) },
  recSensClear: () => { S.recSens = [0, 0, 0, 0, 0, 0]; recSensUpdate() }
});
