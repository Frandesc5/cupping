/* ============================================================
   Laboratorio · simulador, anotar una preparación y bitácora
   Los simuladores (filtrado, espresso, agua, molienda, TDS) viven en
   js/academia/preparacion.js y se comparten con la Academia.
   La bitácora se guarda en este navegador (localStorage 'cl-bit').
   ============================================================ */

let BIT = [];
try { BIT = JSON.parse(localStorage.getItem('cl-bit') || '[]') } catch (e) {}
/* Devuelve false si el navegador no dejó guardar (modo privado, sin espacio): quien llama decide qué avisar. */
const bsv = () => { try { localStorage.setItem('cl-bit', JSON.stringify(BIT)); return true } catch (e) { return false } };

/* prefill: valores para precargar el formulario · prefillFrom: de dónde vienen ('sim' simulador, 'rec' otra anotación)
   editId: anotación que se está editando (null = anotación nueva) · cmp: anotaciones elegidas para comparar. */
Object.assign(S, { lb: 'f', workMode: 'experiment', prefill: null, prefillFrom: '', editId: null, cmp: [], bm: '', be: '' });

/* Direcciones de cada herramienta: #/laboratorio/<slug> */
const LAB_SLUG = { f: 'filtrado', e: 'espresso', a: 'agua', m: 'molienda', t: 'tds' };
const LAB_MODE_SLUG = { record: 'nuevo-registro', history: 'bitacora' };

/* Registros viejos guardaban el caudal en el mismo campo que la fecha (f). */
const recDate = b => typeof b.f === 'string' ? b.f : 'Sin fecha';
const recFlow = b => b.flow != null ? b.flow : (typeof b.f === 'number' ? b.f : 0);

const LB=[['f','Filtrado'],['e','Espresso'],['a','Agua'],['m','Molienda'],['t','Medir (TDS)']];
/* Herramientas que arman una receta: solo en esas tiene sentido "Guardar esta receta". */
const LAB_SAVES=['f','e'];
/* Campos del formulario. Los numéricos abren el teclado numérico en el celular.
   Cada campo tiene un lugar para su propio mensaje de error (e_<id>) y, si hace falta, una ayuda (h). */
const fi=(id,l,t,x,h)=>`<div class=field><label for='b_${id}'>${l}</label><input class=ti id='b_${id}' type='${t||'text'}' ${t==='number'?'inputmode=decimal':''} autocomplete=off aria-describedby='e_${id}' ${x||''}>${h?`<span class=field-hint>${h}</span>`:''}<span class=field-error id='e_${id}'></span></div>`,sel=(id,l,o)=>`<div class=field><label for='b_${id}'>${l}</label><select class=ti id='b_${id}'>${o.map(v=>`<option>${v}</option>`).join('')}</select></div>`;
/* Ids de todos los campos, para limpiar y deshacer. */
const FORM_DEFAULTS = ['V60', 'Lavado', 'Sin remoción'];
const FORM_IDS = ['n','o','v','p','m','d','w','t','g','cl','s','f','pc','bl','ew','a','x','y','z'];
const formSnapshot = () => Object.fromEntries(FORM_IDS.map(k => [k, (document.getElementById('b_' + k) || {}).value || '']));
const bv=id=>document.getElementById('b_'+id).value.trim();
/* En filtrado se pesa el agua; en espresso, la bebida que cae en la taza: la etiqueta acompaña al método. */
const waterLabel = m => m === 'Espresso' ? 'Bebida en la taza (g) *' : 'Agua (g) *';
/* Ratio sin decimal cuando es entero: "1:16", "1:15,5". */
const ratioTxt = (w, d) => '1:' + num(w / d).replace(',0', '');
const isEditing = () => S.editId != null && BIT.some(b => b.id == S.editId);
function workTabs(){return `<div class="workspace-tabs lab-modes"><button data-a="wm" data-v="experiment" aria-pressed="${S.workMode==='experiment'}"><b>Simulador</b><small>Armá una receta</small></button><button data-a="wm" data-v="record" aria-pressed="${S.workMode==='record'}"><b>Anotar</b><small>Un café que preparaste</small></button><button data-a="wm" data-v="history" aria-pressed="${S.workMode==='history'}"><b>Mi bitácora (${BIT.length})</b><small>Tus anotaciones</small></button></div>`}
function lab(){const canSave=LAB_SAVES.includes(S.lb);return `<h2>Laboratorio</h2><p class=m>Acá practicás con tus recetas. Armá una en el simulador para ver sus números y anotá en la bitácora los cafés que preparás de verdad.</p>${workTabs()}${S.workMode==='experiment'?`${canSave?`<p class="lab-scope">El simulador calcula el ratio, los vertidos y los tiempos. No predice el sabor: eso lo descubrís preparando la receta.</p>`:''}${deeper('lab-como','cómo experimentar con intención',`<p>Elegí una preparación, definí qué querés investigar y cambiá una variable por vez. El simulador muestra relaciones y cálculos; no reemplaza la preparación real ni predice el sabor.</p><ol><li>Elegí una receta de referencia.</li><li>Identificá una variable para modificar.</li><li>Mantené las demás constantes.</li><li>Prepará, medí y evaluá.</li><li>Guardá el resultado si querés conservarlo.</li></ol>`)}${labBench()}<div class="lab-variable-panel"><div class="lab-current"><span class=k>Estás usando</span><h3>${LB.find(t=>t[0]===S.lb)[1]}</h3><p class=m>${({f:'Armá la receta y definí cómo vertés el agua.',e:'Ajustá la relación entre dosis, bebida y tiempo.',a:'Mirá por separado la dureza y la alcalinidad del agua.',m:'Explorá cómo cambia el tamaño de las partículas.',t:'Cargá lo que mediste y mirá cuánto le sacó el agua al café.'})[S.lb]}</p>${canSave?`<button class="b p lab-save-side" data-a="openlog">Guardar esta receta</button>`:''}</div><div class="lab-controls">${({f:prep3,e:esp,a:agua,m:()=>mol(true),t:()=>med(true)})[S.lb]()}</div></div>${canSave?`<button class="b p map-fab lab-fab" data-a="openlog">Guardar esta receta</button>`:''}`:S.workMode==='record'?recordForm():recordHistory()}`}
/* Formulario para anotar (o editar) una preparación.
   Al venir del simulador, "Más detalles" queda cerrado: lo único que falta es el nombre del café. */
function recordForm(){const p=S.prefill||{},editing=isEditing(),fromSim=S.prefillFrom==='sim'&&!editing,advKeys=Object.keys(p).filter(k=>!['n','m','d','w','z'].includes(k)&&p[k]!==''&&p[k]!=null&&!FORM_DEFAULTS.includes(p[k])),adv=advKeys.length>0&&!fromSim;return `<div class=panel><div class=k>${editing?'Editar':'Anotar'}</div><h3>${editing?'Editá la anotación':'Anotá una preparación'}</h3>${fromSim?`<p class="form-note">Cargamos la receta del simulador. Poné el nombre del café y guardala.</p>`:''}<p class=m>Solo los campos con * son obligatorios. El resto podés sumarlo ahora o más adelante.</p>
<div class=form-grid>${fi('n','Nombre del café *')}${sel('m','Método',['V60','Espresso','AeroPress','Prensa francesa','Otro'])}${fi('d','Dosis de café (g) *','number','min=0.1 step=.1')}${fi('w',waterLabel(p.m),'number','min=1 step=1')}</div>
<details class=more-fields ${adv?'open':''}><summary>Más detalles <span class=m>${fromSim&&advKeys.length?`(${advKeys.length} ya cargados)`:'(origen, temperatura, molienda, tiempos, TDS…)'}</span></summary><div class=form-grid>${fi('o','Origen')}${fi('v','Variedad')}${sel('p','Proceso',['Lavado','Natural','Honey','Anaeróbico','Otro'])}${fi('t','Temperatura (°C)','number','min=60 max=100 step=.5')}${fi('g','Molienda / ajuste')}${fi('cl','Clics del molino (0–150)','number','min=0 max=150 step=1')}${fi('s','Tiempo total (segundos)','number','min=1')}${fi('f','Velocidad de vertido (g/s)','number','min=0 step=.1')}${fi('pc','Cantidad de vertidos','number','min=1 step=1')}${fi('bl','Primer mojado o bloom (veces la dosis)','number','min=0 step=.5')}${fi('ew','Espera del bloom (segundos)','number','min=0 step=1')}${sel('a','Agitación',['Sin remoción','Suave','Moderada','Intensa'])}${fi('x','TDS (%)','number','min=0 max=20 step=.01')}${fi('y','Bebida obtenida (g)','number','min=1','Sirve para calcular el rendimiento. Si no la pesaste, dejalo vacío.')}</div></details>
${recSensBlock()}<div class="form-grid"><div class="wide"><label for=b_z>Notas sensoriales y observaciones</label><textarea class=ti id=b_z placeholder="Aroma, acidez, dulzor, cuerpo, balance, cambios que probaste…"></textarea><div class=field-hint>Escribí libremente. No hace falta completar todos los atributos.</div></div></div><div id=berr class="form-error" role="alert">${S.be||''}</div><div class="bar form-actions"><button class="b p" data-a=quickSave>${editing?'Guardar cambios':'Guardar en mi bitácora'}</button></div><p class="form-foot"><span class=m>${S.bm||'Se guarda en este navegador y dispositivo.'}</span> <button type=button class="link-btn" data-a=clearform>Limpiar el formulario</button></p></div>`}
/* Bitácora: de la anotación más nueva a la más vieja. Con dos elegidas, la comparación va arriba. */
function recordHistory(){
  if(!BIT.length)return `<div class=panel><h3>Tu bitácora está vacía</h3><p class=m>Acá vas a ver los cafés que anotes. Podés armar una receta en el simulador o anotar una preparación que ya hiciste.</p><div class=bar><button class="b p" data-a=wm data-v=experiment>Ir al simulador</button><button class=b data-a=wm data-v=record>Anotar una preparación</button></div></div>`;
  const one=BIT.length===1,c=S.cmp.map(id=>BIT.find(b=>b.id==id)).filter(Boolean);
  const note=one?'Guardá otra preparación para poder comparar.':c.length===1?'Elegiste 1 de 2. Tocá «Elegir para comparar» en otra anotación.':'';
  const table=c.length===2?`<div class="panel cmp-table" id="cmp-table" tabindex="-1"><div class=k>Comparación</div><p class=m>La tabla muestra las diferencias entre dos anotaciones. Para atribuir un efecto a una variable, tratá de mantener iguales las demás.</p><table><tr><th>Variable</th><th>${esc(c[0].n)}</th><th>${esc(c[1].n)}</th></tr>${[['Ratio',b=>ratioTxt(b.w,b.d)],['Temperatura',b=>b.t?b.t+' °C':'—'],['Tiempo',b=>b.s?b.s+' s':'—'],['TDS',b=>b.tds?b.tds+' %':'—'],['Rendimiento',b=>b.ey?num(b.ey)+' %':'—'],['Molienda',b=>esc(b.g)||'—'],['Clics del molino',b=>b.clicks?b.clicks+' clics':'—'],['Velocidad de vertido',b=>recFlow(b)?recFlow(b)+' g/s':'—'],['Vertidos',b=>b.pours||'—'],['Primer mojado (bloom)',b=>b.bloom?b.bloom+'×':'—'],['Agitación',b=>esc(b.agitation)||'—']].map(r=>`<tr><th>${r[0]}</th><td>${r[1](c[0])}</td><td>${r[1](c[1])}</td></tr>`).join('')}</table></div>`:'';
  return `<div class=k>Tu bitácora</div><h3>${BIT.length} ${one?'anotación':'anotaciones'}</h3><p class=m>Revisá tus preparaciones y compará dos para ver qué cambió.</p>${note?`<p class="cmp-note" role="status">${note}</p>`:''}${table}${BIT.map(b=>`<div class=record-card><div class=challenge-meta><span>${esc(recDate(b))}</span><span>${esc(b.m)||'Método sin definir'}</span>${b.p?`<span>${esc(b.p)}</span>`:''}</div><h3 style="margin:10px 0 4px">${esc(b.n)}</h3><p class=m>${[b.o,b.v].filter(Boolean).map(esc).join(' · ')}</p><p><b>${b.d} g</b> / <b>${b.w} g</b> · ratio ${ratioTxt(b.w,b.d)}${b.t?' · '+b.t+' °C':''}${b.s?' · '+b.s+' s':''}${b.tds?' · TDS '+b.tds+' %':''}${b.ey?' · rendimiento '+num(b.ey)+' %':''}</p>${recFlow(b)||b.pours||b.bloom||b.agitation?`<p class=m>${b.g?'Molienda '+esc(b.g)+' · ':''}${b.clicks?'Molino '+b.clicks+' clics · ':''}${recFlow(b)?'Vertido '+recFlow(b)+' g/s · ':''}${b.pours?'Vertidos '+b.pours+' · ':''}${b.bloom?'Bloom '+b.bloom+'× · ':''}${b.wait?'Espera '+b.wait+' s · ':''}${esc(b.agitation)||''}</p>`:''}${b.sens?`<div class=rec-sens-mini>${sensRadar(b.sens,120)}</div>`:''}${b.z?`<p class=m>${esc(b.z)}</p>`:''}<div class=record-actions>${one?'':`<button class=b data-a=bcmp data-v="${b.id}" aria-pressed="${S.cmp.includes(b.id)}">${S.cmp.includes(b.id)?'Quitar de la comparación':'Elegir para comparar'}</button>`}<button class=b data-a=editRecord data-v="${b.id}">Editar</button><button class=b data-a=dupRecord data-v="${b.id}">Repetir esta receta</button><button class=b data-a=bdel data-v="${b.id}">Borrar</button></div></div>`).join('')}`}

/* ---------- Mesa de trabajo (escena isométrica) ----------
   Los cinco instrumentos sobre una mesada: tocar uno abre su simulador.
   Usa las piezas de dibujo de js/academia/mapa.js (isoBox, isoEspresso, isoV60...). */
function isoJug(o, x, y, T) {
  const b = isoP(o, x, y, T), t = isoP(o, x, y, T + 15), w = isoP(o, x, y, T + 9);
  return `<path d="M${b[0] + 6} ${t[1] + 3}q9 1 7 9q-2 5-7 4" fill="none" stroke="#9fb9c2" stroke-width="2"/>`
    + `<path d="M${b[0] - 7} ${b[1]}L${t[0] - 7} ${t[1]}h14L${b[0] + 7} ${b[1]}z" fill="#e3eff3" opacity=".75" stroke="#9fb9c2" stroke-width=".8"/>`
    + `<path d="M${b[0] - 6.6} ${b[1] - 1}L${w[0] - 6.8} ${w[1]}h13.6L${b[0] + 6.6} ${b[1] - 1}z" fill="#9cc6d6" opacity=".7"/><ellipse cx="${w[0]}" cy="${w[1]}" rx="6.8" ry="2.8" fill="#b9dbe6"/>`
    + `<ellipse cx="${t[0]}" cy="${t[1]}" rx="7" ry="3" fill="none" stroke="#9fb9c2" stroke-width=".9"/><path d="M${t[0] - 7} ${t[1]}l-3 -2" stroke="#9fb9c2" stroke-width="1.4" stroke-linecap="round"/>`;
}
function isoGrinder(o, x, y, T) {
  let s = isoBox(o, x - 7, y - 7, T, 14, 14, 5, '#3a3a3a', '#4a4a4a') + isoCyl(o, x, y, T + 5, 6, 17, '#262626', '#3b3b3b');
  const cb = isoP(o, x, y + 9, T), ct = isoP(o, x, y + 9, T + 5); s += `<rect x="${cb[0] - 3.5}" y="${ct[1]}" width="7" height="${cb[1] - ct[1]}" fill="#6a6a6a"/><ellipse cx="${ct[0]}" cy="${ct[1]}" rx="3.5" ry="1.6" fill="#5a3522"/>`;
  const hb = isoP(o, x, y, T + 22), ht = isoP(o, x, y, T + 34);
  s += `<path d="M${hb[0] - 3} ${hb[1]}L${ht[0] - 9} ${ht[1]}h18L${hb[0] + 3} ${hb[1]}z" fill="#e8eef0" opacity=".7" stroke="#a7b4b9" stroke-width=".8"/>`;
  for (let k = 0; k < 10; k++) { const u = isoRnd(1200 + k) * 2 - 1, v = isoRnd(1300 + k); s += `<ellipse cx="${(hb[0] + u * (3 + v * 5)).toFixed(1)}" cy="${(hb[1] - 2 - v * 8).toFixed(1)}" rx="1.4" ry=".9" fill="#5a3522"/>` }
  return s + `<ellipse cx="${ht[0]}" cy="${ht[1]}" rx="9" ry="3.8" fill="none" stroke="#a7b4b9" stroke-width=".9"/>`;
}
function isoRefract(o, x, y, T) {
  let s = isoBox(o, x - 6, y - 8, T, 12, 16, 4, '#1f1f1f', '#2e2e2e');
  const w = isoP(o, x - 1, y - 3, T + 4), d = [isoP(o, x - 4, y + 2, T + 4.1), isoP(o, x + 4, y + 2, T + 4.1), isoP(o, x + 4, y + 7, T + 4.1), isoP(o, x - 4, y + 7, T + 4.1)];
  return s + `<ellipse cx="${w[0]}" cy="${w[1]}" rx="3.4" ry="2" fill="#c9cdd0" stroke="#8f9397" stroke-width=".6"/><polygon points="${d.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')}" fill="#9fd1a8"/>`;
}
/* Cada instrumento: clave del simulador, nombre, centro (x, y, altura) para tocarlo y si la etiqueta va arriba o abajo.
   Atrás la máquina y el molino; adelante el V60, la jarra de agua y el refractómetro. */
const LAB_BENCH = [
  ['e', 'Espresso', 31, 16, 20, 'up'], ['m', 'Molienda', 110, 22, 22, 'up'],
  ['f', 'Filtrado', 26, 56, 10, 'down'], ['a', 'Agua', 70, 56, 8, 'down'], ['t', 'Medir (TDS)', 114, 56, 3, 'down']
];
function labBench() {
  const o = [112, 78], T = 20, W = 280, H = 206;
  let s = isoBox(o, 0, 0, 0, 140, 74, T, '#8a6748', '#ece6db');
  s += isoEspresso(o, 6, 6, T, 50) + isoGrinder(o, 110, 22, T) + isoV60(o, 26, 56, T) + isoJug(o, 70, 56, T) + isoRefract(o, 114, 56, T);
  const btns = LAB_BENCH.map(([k, name, x, y, h, side]) => { const p = isoP(o, x, y, T + h); return `<button type="button" class="bench-obj is-${side} ${S.lb === k ? 'is-on' : ''}" data-a="lb" data-v="${k}" aria-pressed="${S.lb === k}" style="left:${(p[0] / W * 100).toFixed(1)}%;top:${(p[1] / H * 100).toFixed(1)}%"><span>${name}</span></button>` }).join('');
  return `<div class="bench scene-fade" role="group" aria-label="Instrumentos de la mesa de trabajo"><svg class="bench-svg" viewBox="0 0 ${W} ${H}" aria-hidden="true">${s}</svg>${btns}</div>`;
}

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
  return { m: 'V60', d: x.d, w: x.w, t: x.t, g: GN[x.g - 1], cl: x.clicks || '', f: x.f, pc: x.n, bl: x.b, ew: x.e, a: AN[x.a] };
}
/* Lleva una anotación guardada al formulario: para editarla o como punto de partida de una prueba nueva. */
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

/* El agua o la bebida: la etiqueta cambia con el método elegido. */
onInput(t => { if (t.id === 'b_m') { const l = document.querySelector('label[for=b_w]'); if (l) l.textContent = waterLabel(t.value) } });

on({
  /* En el celu, al cambiar de herramienta la vista baja hasta ella. */
  lb: v => { routeTo('/laboratorio/' + LAB_SLUG[v]); bringIntoView('.lab-variable-panel') },
  /* Al tocar "Anotar" se empieza una anotación nueva (si se estaba editando otra, se sale de la edición). */
  wm: v => { S.be = ''; if (v === 'record' && S.editId != null) { S.editId = null; S.prefill = null; S.prefillFrom = ''; S.recSens = [0, 0, 0, 0, 0, 0] } routeTo('/laboratorio/' + (LAB_MODE_SLUG[v] || LAB_SLUG[S.lb])) },
  openlog: () => { S.prefill = prefillFromLab(); S.prefillFrom = 'sim'; S.editId = null; S.be = ''; S.bm = ''; routeTo('/laboratorio/nuevo-registro') },
  /* Editar: el formulario se abre con todos los datos de la anotación y, al guardar, la reemplaza. */
  editRecord: v => { const b = BIT.find(x => x.id == v); if (b) { S.prefill = prefillFromRecord(b); S.prefillFrom = 'rec'; S.editId = b.id; S.recSens = b.sens ? b.sens.slice() : [0, 0, 0, 0, 0, 0]; S.be = ''; S.bm = ''; routeTo('/laboratorio/nuevo-registro') } },
  /* Repetir: misma receta en una anotación nueva; el resultado (TDS, bebida, notas) queda en blanco. */
  dupRecord: v => { const b = BIT.find(x => x.id == v); if (!b) return; const p = prefillFromRecord(b); delete p.x; delete p.y; delete p.z; S.prefill = p; S.prefillFrom = 'rec'; S.editId = null; S.recSens = [0, 0, 0, 0, 0, 0]; S.be = ''; S.bm = ''; routeTo('/laboratorio/nuevo-registro'); toast('Receta cargada: anotá el resultado de esta prueba') },
  clearform: () => {
    const before = formSnapshot();
    const sensBefore = S.recSens.slice();
    S.prefill = null; S.prefillFrom = ''; S.editId = null; S.be = ''; S.bm = ''; S.recSens = [0, 0, 0, 0, 0, 0]; R(0);
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
    const rec = {
      id: Date.now(), f: new Date().toLocaleDateString('es-AR'), n, o: bv('o'), v: bv('v'), p: bv('p'), m: bv('m'), d, w, t, g: bv('g'),
      clicks: bv('cl') === '' ? null : Math.max(0, Math.min(150, Math.round(+bv('cl')))), s: +bv('s') || 0, flow: +bv('f') || 0,
      pours: +bv('pc') || 0, bloom: +bv('bl') || 0, wait: +bv('ew') || 0, agitation: bv('a'), y, tds: x, ey: x && y ? x * y / d : 0, z: bv('z'),
      sens: S.recSens.some(v => v) ? S.recSens.slice() : null
    };
    /* Editando, la anotación conserva su lugar y su fecha; si no, entra arriba de todo. */
    const before = BIT.slice(), at = isEditing() ? BIT.findIndex(b => b.id == S.editId) : -1;
    if (at >= 0) { rec.id = BIT[at].id; rec.f = BIT[at].f; BIT[at] = rec } else BIT.unshift(rec);
    /* Si el navegador no deja guardar, no se festeja: se avisa y los datos quedan en el formulario. */
    if (!bsv()) {
      BIT = before;
      S.be = 'No pudimos guardar en este navegador. Puede estar en modo privado o sin espacio. Tus datos siguen en pantalla: copialos antes de salir.';
      const box = $('#berr'); if (box) { box.textContent = S.be; box.scrollIntoView({ block: 'center' }) }
      return;
    }
    S.recSens = [0, 0, 0, 0, 0, 0];
    S.be = ''; S.bm = ''; S.prefill = null; S.prefillFrom = ''; S.editId = null;
    routeTo('/laboratorio/bitacora'); toast(at >= 0 ? '✓ Cambios guardados' : '✓ Guardado en tu bitácora');
  },
  /* Elegir para comparar: con dos elegidas, la vista sube hasta la tabla. */
  bcmp: v => {
    const id = +v, i = S.cmp.indexOf(id); if (i >= 0) S.cmp.splice(i, 1); else { S.cmp.push(id); if (S.cmp.length > 2) S.cmp.shift() }
    R(0);
    const tb = $('#cmp-table');
    if (tb && i < 0) { tb.scrollIntoView({ block: 'center' }); tb.focus({ preventScroll: true }) }
    else { const b = document.querySelector(`.record-actions [data-a=bcmp][data-v="${id}"]`); if (b) b.focus({ preventScroll: true }) }
  },
  bdel: v => {
    const i = BIT.findIndex(b => b.id == v); if (i < 0) return;
    const [gone] = BIT.splice(i, 1), cmpBefore = S.cmp.slice();
    S.cmp = S.cmp.filter(x => x != v); bsv(); R(0);
    toast('Anotación “' + gone.n + '” borrada', 'Deshacer', () => {
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
    <g font-size="11" fill="var(--ink)" text-anchor="middle">${AX.map((a, k) => { const [x, y] = pt(k, 88); return `<text x="${x}" y="${+y + 3}">${a}</text>` }).join('')}</g></svg>`;
}
function recSensChart() {
  const v = S.recSens, any = v.some(x => x);
  return sensRadar(v) + (any ? '<button type="button" class="link-btn" data-a="recSensClear">Borrar perfil</button>' : '<p class="m">Mové un deslizador para ver el perfil.</p>');
}
const sensLabel = n => n ? n + ' · ' + SW[n] : '—';
function recSensInner() {
  const v = S.recSens;
  return `<div class="rec-sens-grid"><div class="rec-sens-rows">${AX.map((a, i) => `<div class="sens-row"><label class="sens-name" for="rs${i}">${a}</label><input type="range" class="sens-range" id="rs${i}" data-rs="${i}" min="0" max="5" step="1" value="${v[i]}" style="--p:${v[i] * 20}%" aria-valuetext="${sensLabel(v[i])}"><span class="sens-val" id="rsv${i}">${sensLabel(v[i])}</span></div>`).join('')}</div>
    <div class="rec-sens-chart" id="rec-sens-chart">${recSensChart()}</div></div>`;
}
const recSensBlock = () => `<section class="rec-sens" aria-labelledby="rec-sens-h"><div class="k" id="rec-sens-h">Perfil sensorial <span class="m">(opcional)</span></div><p class="field-hint">0 = no lo evaluaste · 1 = muy suave · 5 = muy intensa.</p><div id="rec-sens">${recSensInner()}</div></section>`;
/* Se redibuja solo este bloque: lo escrito en el resto del formulario no se toca. */
function recSensUpdate() { const box = $('#rec-sens'); if (box) box.innerHTML = recSensInner() }
/* Al deslizar solo cambian el valor y el radar (el deslizador no se redibuja, así el arrastre sigue fluido). */
onInput((t, d) => {
  if (d.rs == null) return;
  const i = +d.rs, n = +t.value; S.recSens[i] = n;
  t.style.setProperty('--p', n * 20 + '%'); t.setAttribute('aria-valuetext', sensLabel(n));
  const l = $('#rsv' + i); if (l) l.textContent = sensLabel(n);
  const c = $('#rec-sens-chart'); if (c) c.innerHTML = recSensChart();
});
on({
  recSensClear: () => { S.recSens = [0, 0, 0, 0, 0, 0]; recSensUpdate() }
});
