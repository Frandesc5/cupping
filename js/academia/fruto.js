/* ============================================================
   Módulo 01 · La planta y el fruto (especies, altitud, madurez y anatomía de la cereza).
   ============================================================ */

const L=[
{n:'Piel (exocarpio)',s:'Es la cubierta exterior del fruto. Durante la maduración suele cambiar de color, aunque esto depende de la variedad.',t:'Forma parte del pericarpio y constituye la superficie externa de la cereza. El color puede ayudar a evaluar la madurez, pero debe interpretarse junto con la variedad y otras características del fruto.',f:'El color no es un indicador universal e infalible de madurez.'},
{n:'Pulpa (mesocarpio)',s:'Es el tejido carnoso que rodea las semillas.',t:'Forma parte del mesocarpio. Su eliminación durante el despulpado es una de las operaciones que diferencia determinadas rutas de procesamiento.',f:'En el proceso natural, la pulpa permanece alrededor de las semillas durante el secado del fruto entero.'},
{n:'Mucílago',s:'Es una capa rica en pectinas situada entre la pulpa y el pergamino.',t:'Su composición y manejo influyen en las condiciones del procesamiento. Puede eliminarse durante el lavado o conservarse parcialmente durante el secado, según el método utilizado.',f:'Conservar más mucílago no garantiza por sí solo un café más dulce.'},
{n:'Pergamino (endocarpio)',s:'Es una cubierta que protege cada semilla.',t:'En muchas rutas de procesamiento, el café se seca con esta cubierta y posteriormente se retira durante el trillado.',f:'El café pergamino seco y el café verde trillado son estados diferentes del producto.'},
{n:'Semillas y película plateada',s:'Las semillas son la parte que normalmente llamamos granos de café. Son verdes hasta el tueste.',t:'Cada semilla presenta una película plateada fina, y su estructura y composición experimentan transformaciones durante el tueste.',f:'Lo habitual es encontrar dos semillas por fruto, aunque algunas cerezas contienen una sola.'}];
const DY=[-144,-72,0,72,144],SC_=[.42,.42,.44,.5,.6],NM=['Piel','Pulpa','Mucílago','Pergamino','Semillas'];
function cherry(){const g=(i,x)=>`<g class="ly ${S.sel===i?'on':''}" data-a="sel" data-v="${i}" role="button" tabindex="0" aria-label="${L[i].n}" style="--dy:${DY[i]}px;--sc:${SC_[i]}">${x}</g>`;
return `<div class="stage"><svg viewBox="0 0 300 400" id="cs" class="${S.split?'split ':''}${S.sel>=0?'dim':''}" role="group" aria-label="Cereza de café por capas">
${g(0,`<ellipse cx="150" cy="200" rx="100" ry="118" fill="#C85C45"/><circle cx="150" cy="316" r="6" fill="#79543C"/>`)}${g(1,`<ellipse cx="150" cy="200" rx="88" ry="105" fill="#D98A6A"/>`)}
${g(2,`<ellipse cx="150" cy="200" rx="76" ry="90" fill="#E5CB87"/><path d="M95 160q10 10 0 22M205 230q-10 10 0 22" stroke="#fff" stroke-opacity=".6" fill="none" stroke-width="2"/>`)}
${g(3,`<ellipse cx="118" cy="200" rx="35" ry="62" fill="#D8C9A0" stroke="#A9B89B" stroke-width="2"/><ellipse cx="182" cy="200" rx="35" ry="62" fill="#D8C9A0" stroke="#A9B89B" stroke-width="2"/>`)}
${g(4,`<ellipse cx="121" cy="200" rx="26" ry="52" fill="#9BAA73" stroke="#CFD8C0" stroke-width="3"/><ellipse cx="179" cy="200" rx="26" ry="52" fill="#9BAA73" stroke="#CFD8C0" stroke-width="3"/><path d="M127 160q-8 40 0 80M173 160q8 40 0 80" stroke="#6f7d4d" stroke-width="3" fill="none"/>`)}
${NM.map((n,i)=>`<text class="lbl" x="205" y="${204+DY[i]}">${n}</text>`).join('')}</svg></div><div id="cp">${cp()}</div>`}
function cp(){const l=L[S.sel];let h=`<div class="bar"><button class="b p" data-a="split">${S.split?'Volver a unir':'Separar capas'}</button></div><div class="dots">${L.map((_,i)=>`<i class="${S.seen.includes(i)?'s':''} ${S.sel===i?'c':''}"></i>`).join('')}</div><div class="panel">`;
h+=l?`<div class="k">${S.sel+1} de 5</div><h3>${l.n}</h3><p>${l.s}</p><div class="dato"><div class="k">Dato interesante</div>${l.f}</div><button class="b" data-a="det">${S.det?'Ocultar':'Ampliar'} explicación técnica</button><div class="tech ${S.det?'show':''}">${l.t}</div>`:`<h3>Explorá el interior del fruto</h3><p class="m">Una cereza madura tiene, de afuera hacia adentro: piel, pulpa, mucílago, pergamino y semillas. La mayoría de los frutos tiene dos semillas; algunos, una sola.</p>`;
h+=`</div><div class="bar"><button class="b" data-a="prev">Anterior</button><button class="b" data-a="next">Siguiente</button></div>`;
return h+(S.seen.length>=5?ask('c'):'')}
const T1=[['sp','Especies'],['al','Altitud'],['ma','Madurez'],['an','Anatomía']];
function t1(){return `<p class=m>El cafeto es un arbusto del género Coffea. Recorré las cuatro pestañas.</p>`+T1.map(t=>`<button class=chip aria-pressed='${S.t1===t[0]}' data-a=t1 data-v='${t[0]}'>${t[1]}</button>`).join('')+({sp:sp1,al:alt1,ma:mad1,an:cherry})[S.t1]()}
function sp1(){const C=S.sp2=='ca',F=C?[['Origen','África occidental y central, zonas bajas.'],['Genética','Diploide: 22 cromosomas.'],['Polinización','Cruzada (alógama): necesita polen de otras plantas.'],['Adaptación','Tolera mejor el calor y varias enfermedades; se cultiva a menor altitud.'],['En taza','Tendencia: más cuerpo y amargor, y suele tener más cafeína.']]:[['Origen','Tierras altas de Etiopía.'],['Genética','Tetraploide: 44 cromosomas. Surgió de un cruce natural entre C. canephora y C. eugenioides.'],['Polinización','Mayormente autopolinización.'],['Adaptación','Prefiere clima más fresco y altitud; más sensible a plagas y enfermedades.'],['En taza','Tendencia: gran variedad aromática y más acidez; hay mucha variación entre variedades.']],n=C?22:44;return `<div style='margin-top:8px'><button class=chip aria-pressed='${!C}' data-a=sp2 data-v=ar>Coffea arabica</button><button class=chip aria-pressed='${C}' data-a=sp2 data-v=ca>Coffea canephora (robusta)</button></div><div class=stage style='padding:8px'><svg viewBox='0 0 300 120' aria-label='Granos de arabica y canephora'><g style='opacity:${C?.3:1};transition:opacity .4s'><ellipse cx='90' cy='60' rx='22' ry='38' fill='#9BAA73' transform='rotate(10 90 60)'/><path d='M86 24Q104 60 86 96' stroke='#6f7d4d' stroke-width='3' fill='none'/></g><g style='opacity:${C?1:.3};transition:opacity .4s'><ellipse cx='210' cy='60' rx='29' ry='33' fill='#9BAA73' transform='rotate(-6 210 60)'/><path d='M210 28V92' stroke='#6f7d4d' stroke-width='3' fill='none'/></g></svg></div><div class=panel>${F.map(f=>`<p><b class=hl>${f[0]}.</b> ${f[1]}</p>`).join('')}<div class=k style='margin-top:10px'>Cromosomas: ${n}</div><svg viewBox='0 0 300 34'>${Array.from({length:n},(_,i)=>`<circle cx='${12+(i%22)*13}' cy='${9+Math.floor(i/22)*14}' r='4.5' fill='#C4825A'/>`).join('')}</svg></div><p class=m style='font-size:.8rem'>Hay otras especies de Coffea, pero casi todo el café comercial es arabica o canephora. Para profundizar: World Coffee Research y los materiales de la SCA.</p>`}
function alt1(){return `<div class=stage style='padding:6px'><svg viewBox='0 0 300 170' aria-label='Montaña con indicador de altitud'><rect id=as width=300 height=170 rx=14 fill='#C4825A'/><polygon points='0,170 70,95 110,125 190,40 300,170' fill='#171715'/><line x1=268 y1=150 x2=268 y2=35 stroke='#171715' stroke-width=2 opacity=.5 /><circle id=am cx=268 cy=100 r=9 fill='#C23B2E' stroke='#F1EEE6' stroke-width=3 style='transition:cy .2s'/></svg></div><label for=al>Altitud<span id=at></span></label><input type=range id=al data-al=1 min=400 max=2200 step=50 value='${S.alt}'><div class=panel><h3 id=ah></h3><p id=ax></p></div><p class=m style='font-size:.8rem'>La temperatura promedio baja del orden de 0,6 °C cada 100 m; varía según la zona. La altitud es solo una variable: variedad, suelo, manejo y proceso también pesan.</p>`}
function au(){const f=(S.alt-400)/1800,b=S.alt<900?['Zona baja','Más calor: los frutos tienden a madurar más rápido. Es la zona habitual de canephora.']:S.alt<1500?['Altitud media','Condiciones intermedias; muchas fincas de arabica trabajan en este rango.']:['Zona alta','Noches frescas y maduración más lenta; suele asociarse a granos más densos. En altitudes muy altas aumenta el riesgo de heladas.'];$('#am').setAttribute('cy',150-f*115);$('#as').setAttribute('fill',mix(['#C4825A','#8aa0b8'],f));$('#at').textContent=S.alt+' m · ≈ −'+((S.alt-400)/100*.6).toFixed(1)+' °C vs 400 m';$('#ah').textContent=b[0];$('#ax').textContent=b[1]}
const MR=['#7D9A4A','#D9B04A','#E0693F','#C23B2E','#6e1f1f'],MY=['#7D9A4A','#C9C45A','#E8C94A','#EBB93A','#B0762F'],MS=[[20,'Inmaduro','Mucho menos azúcar. Los granos de frutos inmaduros se consideran un defecto.'],[45,'Envero (pintón)','Empieza el cambio de color y la acumulación de azúcares.'],[75,'Maduro','Punto de cosecha habitual: más azúcares solubles (Brix).'],[90,'Muy maduro','Aumenta el riesgo de fermentación en el árbol si se demora la cosecha.'],[101,'Sobremaduro','El fruto empieza a pasarse y secarse en la rama: pierde calidad.']];
function mad1(){return `<div style='margin-top:8px'><button class=chip aria-pressed='${!S.yl}' data-a=yl data-v=0>Variedad de fruto rojo</button><button class=chip aria-pressed='${!!S.yl}' data-a=yl data-v=1>Variedad de fruto amarillo</button></div><div class=stage style='padding:8px'><svg viewBox='0 0 120 120' style='max-width:200px;margin:auto' aria-label='Cereza en distintos grados de madurez'><ellipse id=mf cx=60 cy=66 rx=40 ry=46 style='transition:fill .2s'/><ellipse cx=46 cy=48 rx=9 ry=15 fill='#fff' opacity=.25 transform='rotate(20 46 48)'/><path d='M60 20q4-12 16-12' stroke='#6f7d4d' stroke-width=4 fill='none' stroke-linecap='round'/></svg></div><label for=mp>Maduración<span id=mn></span></label><input type=range id=mp data-ma=1 min=0 max=100 value='${S.mad}'><div class=k>Azúcares (Brix), cualitativo</div><div style='height:6px;background:var(--line);border-radius:3px;margin:6px 0 12px'><i id=mb style='display:block;height:100%;background:var(--accent);border-radius:3px;transition:width .2s'></i></div><div class=panel><p id=mx></p><div class=dato><div class=k>Dato interesante</div>El color no es un indicador universal: algunas variedades maduran amarillas. El Brix se mide con refractómetro y se usa junto con el color y la variedad.</div><p class=m style='font-size:.85rem'>La cosecha selectiva recoge solo frutos maduros; en la cosecha masiva se recoge todo junto y después se selecciona.</p></div>`}
function m1u(){const p=S.mad,s=MS.find(x=>p<x[0]);$('#mf').setAttribute('fill',mix(S.yl?MY:MR,p/100));$('#mn').textContent=s[1];$('#mx').textContent=s[2];$('#mb').style.width=Math.min(100,p*1.1)+'%'}

/* ---------- Estado y acciones del módulo ---------- */
Object.assign(S, { split: 0, sel: -1, seen: [], det: 0, t1: 'sp', t1v: ['sp'], sp2: 'ar', alt: 1200, mad: 55, yl: 0 });

/* Actualiza la cereza por capas sin volver a dibujar toda la página. */
function uc() {
  const s = $('#cs');
  s.setAttribute('class', (S.split ? 'split ' : '') + (S.sel >= 0 ? 'dim' : ''));
  s.querySelectorAll('.ly').forEach((e, i) => e.classList.toggle('on', S.sel === i));
  $('#cp').innerHTML = cp();
  bar();
}
function setSel(i) { S.sel = ((i % 5) + 5) % 5; if (!S.seen.includes(S.sel)) S.seen.push(S.sel); S.det = 0; uc() }
function frutoAfter() { if (S.t1 == 'al') au(); if (S.t1 == 'ma') m1u() }

on({
  split: () => { S.split = S.split ? 0 : 1; uc() },
  sel: v => setSel(+v),
  next: () => setSel(S.sel + 1),
  prev: () => setSel(S.sel < 0 ? 0 : S.sel - 1),
  det: () => { S.det = S.det ? 0 : 1; uc() },
  t1: v => { S.t1 = v; if (!S.t1v.includes(v)) S.t1v.push(v); R(0) },
  sp2: v => { S.sp2 = v; R(0) },
  yl: v => { S.yl = +v; R(0) }
});
onInput((t, d) => {
  if (d.al != null) { S.alt = +t.value; au() }
  else if (d.ma != null) { S.mad = +t.value; m1u() }
});
