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
const FORM_IDS = ['n','o','v','p','m','d','w','t','g','cl','s','f','pc','bl','ew','a','x','y','z'];
const formSnapshot = () => Object.fromEntries(FORM_IDS.map(k => [k, (document.getElementById('b_' + k) || {}).value || '']));
const bv=id=>document.getElementById('b_'+id).value.trim();
function workTabs(){return `<div class="workspace-tabs"><button data-a="wm" data-v="experiment" aria-pressed="${S.workMode==='experiment'}"><b>Simulador</b><small>Probá y ajustá variables</small></button><button data-a="wm" data-v="record" aria-pressed="${S.workMode==='record'}"><b>Nuevo registro</b><small>Guardá una preparación</small></button><button data-a="wm" data-v="history" aria-pressed="${S.workMode==='history'}"><b>Mi bitácora (${BIT.length})</b><small>Historial y comparaciones</small></button></div>`}
function lab(){return `<div class=k>Espacio de experimentación</div><h2>Laboratorio</h2><p class=m>Acá no archivás resultados: trabajás con ellos. Modificá parámetros, aislá variables y observá cómo se relacionan. Cuando termines, podés guardar la prueba en tu Bitácora.</p>${workTabs()}${S.workMode==='experiment'?`<div class="lab-intro-grid"><div class="lab-purpose"><span class=k>QUÉ HACÉS ACÁ</span><h3>Experimentar con intención.</h3><p>Elegí una preparación, definí qué querés investigar y cambiá una variable por vez. El simulador muestra relaciones y cálculos; no reemplaza la preparación real ni predice el sabor.</p></div><div class="lab-method"><span class=k>PROTOCOLO BREVE</span><ol><li>Elegí una receta de referencia.</li><li>Identificá una variable para modificar.</li><li>Mantené las demás constantes.</li><li>Prepará, medí y evaluá.</li><li>Guardá el resultado si querés conservarlo.</li></ol></div></div><div class="lab-tool-head"><div><span class=k>HERRAMIENTAS</span><h3>¿Qué querés explorar?</h3></div><p class=m>Seleccioná un área. Cada una trabaja una familia distinta de variables.</p></div><div class="lab-tool-grid">${LB.map((t,i)=>`<button class="lab-tool ${S.lb===t[0]?'active':''}" aria-pressed="${S.lb===t[0]}" data-a=lb data-v="${t[0]}"><b>${t[1]}</b><small>${({f:'Dosis, agua, temperatura y vertido',e:'Dosis, bebida, tiempo y presión',a:'Dureza y alcalinidad',m:'Distribución y tamaño de partícula',t:'TDS y rendimiento de extracción'})[t[0]]}</small><i>Explorar →</i></button>`).join('')}</div><div class="lab-variable-panel"><div class="lab-current"><span class=k>ÁREA SELECCIONADA</span><h3>${LB.find(t=>t[0]===S.lb)[1]}</h3><p class=m>${({f:'Configurá la receta y el comportamiento del vertido.',e:'Ajustá la relación entre dosis, bebida y tiempo.',a:'Observá por separado dureza y alcalinidad.',m:'Explorá cómo cambia la distribución de partículas.',t:'Relacioná la concentración medida con el rendimiento calculado.'})[S.lb]}</p></div><div class="lab-controls">${({f:prep3,e:esp,a:agua,m:mol,t:med})[S.lb]()}</div></div><div class="bar"><button class="b p" data-a="openlog">Guardar esta prueba en Bitácora →</button></div>`:S.workMode==='record'?recordForm():recordHistory()}`}
function recordForm(){const p=S.prefill||{},adv=Object.keys(p).some(k=>!['n','m','d','w','z'].includes(k)&&p[k]!==''&&p[k]!=null);return `<div class=panel><div class=k>Nuevo registro</div><h3>Guardá una preparación</h3><p class=m>Solo los campos con * son obligatorios. El resto podés sumarlo ahora o más adelante.</p>
<div class=form-grid>${fi('n','Nombre del café *')}${sel('m','Método',['V60','Espresso','AeroPress','Prensa francesa','Otro'])}${fi('d','Dosis de café (g) *','number','min=0.1 step=.1')}${fi('w','Agua o bebida (g) *','number','min=1 step=1')}</div>
<details class=more-fields ${adv?'open':''}><summary>Más detalles <span class=m>(origen, temperatura, molienda, tiempos, TDS…)</span></summary><div class=form-grid>${fi('o','Origen')}${fi('v','Variedad')}${sel('p','Proceso',['Lavado','Natural','Honey','Anaeróbico','Otro'])}${fi('t','Temperatura (°C)','number','min=60 max=100 step=.5')}${fi('g','Molienda / ajuste')}${fi('cl','Clics del molino (0–150)','number','min=0 max=150 step=1')}${fi('s','Tiempo total (segundos)','number','min=1')}${fi('f','Caudal de vertido (g/s)','number','min=0 step=.1')}${fi('pc','Cantidad de vertidos','number','min=1 step=1')}${fi('bl','Bloom (veces la dosis)','number','min=0 step=.5')}${fi('ew','Espera del bloom (segundos)','number','min=0 step=1')}${sel('a','Agitación',['Sin remoción','Suave','Moderada','Intensa'])}${fi('x','TDS (%)','number','min=0 max=20 step=.01')}${fi('y','Masa de bebida (g)','number','min=1')}</div></details>
<div class="form-grid"><div class="wide"><label for=b_z>Notas sensoriales y observaciones</label><textarea class=ti id=b_z placeholder="Aroma, acidez, dulzor, cuerpo, balance, cambios que probaste…"></textarea><div class=field-hint>Escribí libremente. No hace falta completar todos los atributos.</div></div></div><div id=berr class="form-error" role="alert">${S.be||''}</div><div class=bar><button class="b p" data-a=quickSave>Guardar registro</button><button class=b data-a=clearform>Limpiar</button></div><p class=m>${S.bm||'Se guarda en este navegador y dispositivo.'}</p></div>`}
function recordHistory(){return `<div class=k>Tu biblioteca de preparaciones</div><h3>${BIT.length} registros guardados</h3><p class=m>Revisá, compará y detectá patrones entre tus pruebas.</p>${BIT.length?BIT.slice().reverse().map(b=>`<div class=record-card><div class=challenge-meta><span>${recDate(b)}</span><span>${b.m||'Método sin definir'}</span>${b.p?`<span>${b.p}</span>`:''}</div><h3 style="margin:10px 0 4px">${b.n}</h3><p class=m>${[b.o,b.v].filter(Boolean).join(' · ')}</p><p><b>${b.d} g</b> / <b>${b.w} g</b> · ratio 1:${(b.w/b.d).toFixed(1)}${b.t?' · '+b.t+' °C':''}${b.s?' · '+b.s+' s':''}${b.tds?' · TDS '+b.tds+' %':''}${b.ey?' · EY '+b.ey.toFixed(1)+' %':''}</p>${recFlow(b)||b.pours||b.bloom||b.agitation?`<p class=m>${b.g?'Molienda '+b.g+' · ':''}${b.clicks!=null?'Molino '+b.clicks+' clics · ':''}${recFlow(b)?'Caudal '+recFlow(b)+' g/s · ':''}${b.pours?'Vertidos '+b.pours+' · ':''}${b.bloom?'Bloom '+b.bloom+'× · ':''}${b.wait?'Espera '+b.wait+' s · ':''}${b.agitation||''}</p>`:''}${b.z?`<p class=m>${b.z}</p>`:''}<div class=record-actions><button class=b data-a=bcmp data-v="${b.id}">${S.cmp.includes(b.id)?'Quitar comparación':'Comparar'}</button><button class=b data-a=editRecord data-v="${b.id}">Duplicar como nueva prueba</button><button class=b data-a=bdel data-v="${b.id}">Borrar</button></div></div>`).join(''):`<div class=panel><h3>Tu bitácora empieza acá</h3><p class=m>Hacé una prueba en el laboratorio y guardala, o creá un registro manual.</p><button class="b p" data-a=wm data-v=experiment>Ir a experimentar</button></div>`}${(()=>{let c=S.cmp.map(id=>BIT.find(b=>b.id==id)).filter(Boolean);return c.length===2?`<div class=panel><div class=k>Comparación de preparaciones</div><p class=m>La tabla muestra diferencias entre registros. Para atribuir un efecto a una variable, procurá mantener constantes las demás condiciones.</p><table><tr><th>Variable</th><th>${c[0].n}</th><th>${c[1].n}</th></tr>${[['Ratio',b=>'1:'+(b.w/b.d).toFixed(1)],['Temperatura',b=>b.t||'—'],['Tiempo',b=>b.s?b.s+' s':'—'],['TDS',b=>b.tds?b.tds+' %':'—'],['Rendimiento',b=>b.ey?b.ey.toFixed(1)+' %':'—'],['Molienda',b=>b.g||'—'],['Clics del molino',b=>b.clicks!=null?b.clicks+' clics':'—'],['Caudal',b=>recFlow(b)?recFlow(b)+' g/s':'—'],['Vertidos',b=>b.pours||'—'],['Bloom',b=>b.bloom?b.bloom+'×':'—'],['Agitación',b=>b.agitation||'—']].map(r=>`<tr><th>${r[0]}</th><td>${r[1](c[0])}</td><td>${r[1](c[1])}</td></tr>`).join('')}</table></div>`:''})()}`}

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
  editRecord: v => { const b = BIT.find(x => x.id == v); if (b) { S.prefill = prefillFromRecord(b); routeTo('/laboratorio/nuevo-registro') } },
  clearform: () => {
    const before = formSnapshot();
    S.prefill = null; S.be = ''; S.bm = ''; R(0);
    if (Object.values(before).some(v => v && !['V60', 'Lavado', 'Sin remoción'].includes(v)))
      toast('Formulario limpio', 'Deshacer', () => { S.prefill = before; R(0) });
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
      pours: +bv('pc') || 0, bloom: +bv('bl') || 0, wait: +bv('ew') || 0, agitation: bv('a'), y, tds: x, ey: x && y ? x * y / d : 0, z: bv('z')
    });
    bsv(); S.be = ''; S.bm = 'Registro guardado correctamente.'; S.prefill = null;
    routeTo('/laboratorio/bitacora'); toast('✓ Registro guardado');
  },
  bcmp: v => { const id = +v, i = S.cmp.indexOf(id); if (i >= 0) S.cmp.splice(i, 1); else { S.cmp.push(id); if (S.cmp.length > 2) S.cmp.shift() } R(0) },
  bdel: v => {
    const i = BIT.findIndex(b => b.id == v); if (i < 0) return;
    const [gone] = BIT.splice(i, 1); S.cmp = S.cmp.filter(x => x != v); bsv(); R(0);
    toast('Registro “' + gone.n + '” borrado', 'Deshacer', () => { BIT.splice(i, 0, gone); bsv(); R(0) });
  }
});
