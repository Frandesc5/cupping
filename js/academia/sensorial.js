/* ============================================================
   Módulo 06 · Sensorial (perfil y TDS, rueda de sabores, guía de cata con cronómetro y sesgos).
   ============================================================ */

const SW=['ausente','muy suave','suave','media','marcada','muy intensa'],AX=['Acidez','Dulzor','Amargor','Cuerpo','Aroma','Persistencia'];
const CH6=[['Equilibrado','Café donde ningún atributo domina: lo que muchos buscan como referencia.',[3,3,2,3,3,3]],['Tueste claro','Hipótesis posible: más acidez y aroma, cuerpo liviano.',[4,3,1,2,4,3]],['Tueste oscuro','Hipótesis posible: menos acidez, más amargor y cuerpo.',[1,2,4,4,2,3]],['Subextracción','Se disolvió poco: suele percibirse ácido o agrio, poco dulce, cuerpo liviano y final corto (rendimiento bajo, p. ej. menos de ~18 %).',[4,1,1,1,2,1]],['Sobreextracción','Se disolvió de más: suele percibirse amargo y seco, poco dulce y con aromas apagados (rendimiento alto, p. ej. más de ~22 %).',[1,1,5,3,1,3]]];
const poly6=v=>v.map((x,i)=>{const g=(-90+60*i)*Math.PI/180;return (150+80*x/5*Math.cos(g)).toFixed(1)+','+(100+80*x/5*Math.sin(g)).toFixed(1)}).join(' ');
function sens3(){const g=i=>(-90+60*i)*Math.PI/180;return `<p class=m>Escala de 0 (ausente) a 5 (muy intensa). Elegí un caso, mirá la hipótesis y probala en el radar.</p>`+CH6.map((c,i)=>`<button class=chip aria-pressed='${S.cc===i}' data-a=ch data-v='${i}'>${c[0]}</button>`).join('')+(S.cc>=0?`<p class=pop>${CH6[S.cc][1]} Es una tendencia, no una garantía.</p>`:'')+`<div class='stage dark'><svg viewBox='0 0 300 210' aria-label='Radar de perfil sensorial de 0 a 5'><g stroke='#3a463a' fill='none'>${[1,2,3,4,5].map(k=>`<polygon points='${poly6(Array(6).fill(k))}'/>`).join('')}${AX.map((_,i)=>`<line x1=150 y1=100 x2='${150+80*Math.cos(g(i))}' y2='${100+80*Math.sin(g(i))}'/>`).join('')}</g><g fill='#A9B89B' font-size='9'>${[1,2,3,4,5].map(k=>`<text x=153 y='${104-16*k}'>${k}</text>`).join('')}</g><polygon id=rd points='${poly6(S.sv6)}' fill='#E5CB87' fill-opacity='.45' stroke='#E5CB87' stroke-width='3'/><g fill='#F1EFE7' font-size='12' text-anchor='middle'>${AX.map((n,i)=>`<text x='${150+96*Math.cos(g(i))}' y='${104+96*Math.sin(g(i))}'>${n}</text>`).join('')}</g></svg></div>`+AX.map((n,i)=>`<label for='sv${i}'>${n}<span id='h${i}'>${S.sv6[i]} · ${SW[S.sv6[i]]}</span></label><input type=range id='sv${i}' data-h='${i}' min=0 max=5 value='${S.sv6[i]}'>`).join('')+`<div class=panel><h3>TDS y rendimiento (básico)</h3><p><b>TDS</b>: porcentaje de sólidos disueltos en la bebida; se mide con un refractómetro. <b>Rendimiento</b> = TDS × masa de bebida ÷ dosis.</p><label for=q_t>TDS medido<span id=vt></span></label><input type=range id=q_t data-q=t min=.8 max=2.2 step=.05 value='${S.td.t}'><label for=q_b>Bebida<span id=vb></span></label><input type=range id=q_b data-q=b min=100 max=500 step=5 value='${S.td.b}'><label for=q_d>Dosis<span id=vd></span></label><input type=range id=q_d data-q=d min=8 max=40 value='${S.td.d}'><div class=k>Rendimiento calculado</div><div class=big id=ey></div><svg viewBox='0 0 300 44'><rect x=10 y=6 width=93.3 height=16 fill='#7FB2C9'/><rect x=103.3 y=6 width=93.3 height=16 fill='#A9B89B'/><rect x=196.7 y=6 width=93.3 height=16 fill='#C85C45'/><circle id=ym cy=14 r=8 fill='#F1EFE7' stroke='#141614' stroke-width=2 style='transition:cx .3s'/><g fill='currentColor' font-size='10' text-anchor='middle'><text x=57 y=38>Subextraído</text><text x=150 y=38>Zona usual</text><text x=243 y=38>Sobreextraído</text></g></svg><p class=m style='font-size:.8rem'>Ejemplo: 1,35 % y 225 g de bebida con 15 g de café dan ≈20 %. Rangos orientativos que usan muchos baristas (no universales): TDS de ~1,15 a 1,35 % (rango que cita la SCA) y rendimiento de ~18 a 22 %. Dos cafés con el mismo número pueden saber distinto.</p></div>`+ask('s')}
function qu(){const a=S.td;if(!$('#ey'))return;$('#vt').textContent=a.t.toFixed(2)+' %';$('#vb').textContent=a.b+' g';$('#vd').textContent=a.d+' g';const y=a.t*a.b/a.d;$('#ey').textContent=y.toFixed(1)+' %';$('#ym').setAttribute('cx',10+(Math.min(26,Math.max(14,y))-14)/12*280)}
const W=[
['Frutal',[
['Cítrico','limón, lima, naranja, pomelo','Aromas que recuerdan a la cáscara o pulpa de cítricos.'],
['Fruta de carozo','durazno, damasco, ciruela','Frutas con pulpa jugosa y carozo central.'],
['Frutos rojos','frutilla, frambuesa, arándano','Notas de frutas pequeñas, frescas o maduras.'],
['Fruta negra','mora, cassis, cereza negra','Frutas oscuras, más profundas y maduras.'],
['Tropical','mango, ananá, maracuyá','Frutas de perfil intenso, jugoso y exuberante.'],
['Fruta seca','pasas, dátiles, higo seco','Recuerdos dulces y concentrados de fruta deshidratada.']]],
['Floral',[
['Flores blancas','jazmín, azahar, flor de café','Aromas delicados, perfumados y frescos.'],
['Rosa','rosa, geranio','Recuerdos de pétalos y perfume floral.'],
['Té floral','té negro aromático, manzanilla','Sensación floral sutil asociada a infusiones.']]],
['Dulce',[
['Azúcar moreno','melaza, panela, azúcar mascabo','Dulzor profundo, cálido, parecido a azúcares menos refinados.'],
['Caramelo','caramelo blando, toffee','Recuerdo de azúcar calentada, con notas dulces y tostadas.'],
['Miel','miel de flores, miel clara','Dulzor aromático, denso y persistente.'],
['Vainilla','vainilla, crema dulce','Perfil dulce, suave y redondo.']]],
['Nueces y cacao',[
['Frutos secos','almendra, avellana, nuez','Recuerdos de semillas oleaginosas tostadas o frescas.'],
['Cacao','cacao en polvo, nibs','Notas secas y profundas de cacao.'],
['Chocolate','chocolate con leche, chocolate amargo','Desde notas dulces y cremosas hasta cacao intenso.']]],
['Especiado',[
['Especias dulces','canela, clavo, nuez moscada','Aromas cálidos, dulces y penetrantes.'],
['Especias picantes','pimienta negra, jengibre','Sensaciones aromáticas intensas y punzantes.'],
['Semillas y hierbas','cilantro, anís, comino','Notas aromáticas que recuerdan a semillas y hierbas culinarias.']]],
['Tostado',[
['Cereal y malta','pan tostado, galleta, malta','Recuerdos de cereales cocidos o tostados.'],
['Carbón y humo','humo, madera, carbón','Aromas ahumados; conviene distinguir intensidad y calidad.'],
['Tostado intenso','café tostado, quemado, ceniza','Notas de tueste muy marcado, que pueden dominar el perfil.']]],
['Verde y vegetal',[
['Herbáceo','pasto, hojas, hierba recién cortada','Aromas verdes que recuerdan a vegetación fresca.'],
['Vegetal','arveja, pepino, apio','Recuerdos vegetales frescos o cocidos.'],
['Leguminosas','poroto, arveja seca','Notas que recuerdan a legumbres.']]],
['Fermentado y agrio',[
['Fermentado','vino, sidra, fruta fermentada','Recuerdos vínicos o de fermentación; su calidad depende del equilibrio.'],
['Acético','vinagre, ácido acético','Nota punzante que recuerda al vinagre.'],
['Láctico','yogur natural, kéfir','Acidez suave que recuerda a fermentación láctica.'],
['Sobrefermentado','fruta muy madura, alcohol','Notas intensas que pueden indicar fermentación excesiva según el contexto.']]]
];
function wheelSector(cx,cy,r1,r2,a0,a1){const pt=(r,a)=>[cx+r*Math.cos(a*Math.PI/180),cy+r*Math.sin(a*Math.PI/180)],p1=pt(r2,a0),p2=pt(r2,a1),p3=pt(r1,a1),p4=pt(r1,a0),large=a1-a0>180?1:0;return `M ${p1[0]} ${p1[1]} A ${r2} ${r2} 0 ${large} 1 ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]} A ${r1} ${r1} 0 ${large} 0 ${p4[0]} ${p4[1]} Z`}
function rue(){
const c=W[S.wc],colors=['#E85D45','#D52B70','#A85B9A','#8065A8','#2796B2','#1C9A78','#B5B52B','#E4B51D'];
const cx=220,cy=220,step=360/W.length,mid=(a,b)=>(a+b)/2;
let rings='';
W.forEach((fam,i)=>{
 const a0=-90+i*step+0.45,a1=-90+(i+1)*step-0.45,sel=S.wc===i;
 rings+=`<path d="${wheelSector(cx,cy,42,91,a0,a1)}" fill="${colors[i]}" fill-opacity="${sel?1:.92}" stroke="#e8e7df" stroke-width="1.2" data-a="wc" data-v="${i}" style="cursor:pointer"/>`;
 const am=mid(a0,a1),tx=cx+67*Math.cos(am*Math.PI/180),ty=cy+67*Math.sin(am*Math.PI/180);
 rings+=`<text x="${tx}" y="${ty}" transform="rotate(${am+90} ${tx} ${ty})" text-anchor="middle" dominant-baseline="middle" font-size="9.2" font-weight="700" fill="#20221f" pointer-events="none">${fam[0].toUpperCase()}</text>`;
 const subStep=(a1-a0)/fam[1].length;
 fam[1].forEach((sub,j)=>{
   const b0=a0+j*subStep+0.25,b1=a0+(j+1)*subStep-0.25,subSel=sel&&S.ws===j;
   rings+=`<path d="${wheelSector(cx,cy,93,139,b0,b1)}" fill="${colors[i]}" fill-opacity="${subSel?1:.72}" stroke="#e8e7df" stroke-width="1" data-a="ws" data-v="${j}" data-family="${i}" style="cursor:pointer"/>`;
   const bm=mid(b0,b1),sx=cx+116*Math.cos(bm*Math.PI/180),sy=cy+116*Math.sin(bm*Math.PI/180);
   if(subStep>9)rings+=`<text x="${sx}" y="${sy}" transform="rotate(${bm+90} ${sx} ${sy})" text-anchor="middle" dominant-baseline="middle" font-size="${sub[0].length>14?6.4:7.2}" font-weight="600" fill="#20221f" pointer-events="none">${sub[0].toUpperCase()}</text>`;
   const refs=sub[1].split(',').map(x=>x.trim()),leafStep=(b1-b0)/refs.length;
   refs.forEach((ref,k)=>{
     const d0=b0+k*leafStep+0.12,d1=b0+(k+1)*leafStep-0.12;
     rings+=`<path d="${wheelSector(cx,cy,141,187,d0,d1)}" fill="${colors[i]}" fill-opacity="${subSel?0.98:.52}" stroke="#e8e7df" stroke-width=".65" data-a="ws" data-v="${j}" data-family="${i}" style="cursor:pointer"/>`;
     const dm=mid(d0,d1),dx=cx+164*Math.cos(dm*Math.PI/180),dy=cy+164*Math.sin(dm*Math.PI/180);
     if(leafStep>5.5)rings+=`<text x="${dx}" y="${dy}" transform="rotate(${dm+90} ${dx} ${dy})" text-anchor="middle" dominant-baseline="middle" font-size="5.8" fill="#292b27" pointer-events="none">${ref.toUpperCase()}</text>`;
   });
 });
});
const familyButtons=W.map((w,i)=>`<button class="chip" aria-pressed="${S.wc===i}" data-a="wc" data-v="${i}">${w[0]}</button>`).join('');
const sub=c?c[1]:[];
return `<div class="panel"><div class="k">RUEDA DE SABORES · EXPLORADOR</div><h3>Una percepción, muchos descriptores</h3><p class="m">Explorá la rueda desde el centro hacia el borde: familia, subfamilia y referencias descriptivas. Seleccioná un sector o usá los accesos debajo.</p><div class="flavor-wheel-wrap"><svg viewBox="0 0 440 440" role="group" aria-label="Rueda sensorial jerárquica interactiva" class="flavor-wheel"><circle cx="220" cy="220" r="190" fill="#f0eee5"/>${rings}<circle cx="220" cy="220" r="40" fill="#252923" stroke="#d5c89d" stroke-width="1.5"/><text x="220" y="216" fill="#f4f0e5" text-anchor="middle" font-size="8" letter-spacing="1">COFFEE</text><text x="220" y="229" fill="#e5cb87" text-anchor="middle" font-size="9" font-weight="700">SENSORY</text></svg></div><div class="wheel-key"><span>Centro · Familias</span><span>Anillo medio · Subfamilias</span><span>Borde · Descriptores</span></div><div class="wheel-family-list">${familyButtons}</div></div>${c?`<div class="panel"><div class="k">01 · FAMILIA</div><h3>${c[0]}</h3><p class="m">Elegí una subfamilia para afinar lo que percibís.</p><div class="workspace-tabs">${sub.map((x,i)=>`<button class="chip" aria-pressed="${S.ws===i}" data-a="ws" data-v="${i}" data-family="${S.wc}">${x[0]}</button>`).join('')}</div>${S.ws>=0&&sub[S.ws]?`<div class="panel wheel-descriptor"><div class="k">02 · SUBFAMILIA Y REFERENCIAS</div><h3>${sub[S.ws][0]}</h3><p>${sub[S.ws][2]}</p><div class="k" style="margin-top:14px">03 · DESCRIPTORES PARA COMPARAR</div><p class="big" style="font-size:1.1rem">${sub[S.ws][1]}</p><p class="m">Buscá referencias reales: olé una fruta, flor o especia. Compará el recuerdo con el café y anotá qué descriptor se aproxima más.</p></div>`:`<p class="m" style="margin-top:12px">Seleccioná una subfamilia en la rueda o en la lista para ver sus referencias.</p>`}</div>`:`<div class="panel"><h3>¿Cómo empezar?</h3><p>Elegí una familia. No necesitás conocer todos los términos: empezá por una impresión amplia y avanzá hacia una referencia concreta.</p></div>`}<div class="panel"><div class="k">CÓMO USARLA EN UNA CATA</div><ol><li>Olfateá el café seco y luego recién molido.</li><li>Probá la bebida y prestá atención mientras se enfría.</li><li>Identificá una impresión general sin forzar una respuesta.</li><li>Desglosá esa impresión: familia, subfamilia y descriptor.</li><li>Registrá el descriptor y su intensidad por separado.</li></ol><p class="m" style="font-size:.8rem">Representación didáctica original inspirada en la estructura radial y jerárquica de la Coffee Taster’s Flavor Wheel de SCA / World Coffee Research. No reproduce el arte ni la totalidad del léxico oficial.</p></div>`
}
const CP=[
['Molienda y fragancia','Pesá y molé el café justo antes de la cata. Usá molienda gruesa y una proporción orientativa de 8,25 g por cada 150 ml de agua. Antes de agregar agua, acercá la nariz al café molido y reconocé la fragancia.','00:00','Preparación · sin cuenta regresiva'],
['Agua y reposo','Verté el agua caliente de manera uniforme hasta llenar la taza. Iniciá el reposo: la costra se forma en la superficie. Evitá mover las tazas durante esta etapa.','04:00','Reposo · 4 minutos'],
['Romper la costra','Al cumplirse aproximadamente 4 minutos, acercá la nariz a la taza y rompé la costra con la cuchara realizando tres movimientos suaves. Percibí el aroma que se libera.','00:00','Momento de romper la costra'],
['Retirar espuma','Con dos cucharas, retirá la espuma y los restos que flotan en la superficie. Limpiá la cuchara entre muestras para evitar contaminación cruzada.','00:00','Limpieza · al terminar el reposo'],
['Probar y observar','Comenzá a probar cuando la temperatura sea cómoda. Sorbé de forma decidida para distribuir la bebida por la boca. Volvé a probar mientras se enfría: cambian la percepción de aroma, acidez, dulzor y cuerpo.','05:00','Evaluación · 5 minutos sugeridos'],
['Registrar','Anotá primero tus impresiones sin buscar una respuesta correcta. Describí atributos, intensidad y balance. Separá lo que percibís de cuánto te gusta.','00:00','Registro · a tu ritmo']
];
let cupTimer=null,cupRemaining=0,cupRunning=false;
function fmtCup(n){n=Math.max(0,Math.floor(n));return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')}
function cupTimerMarkup(){const preset=CP[S.cp6][2],secs=preset.split(':').reduce((a,v)=>a*60+Number(v),0);return `<div class="cup-timer"><div class="k">CRONÓMETRO DE CATA</div><div class="cup-clock" id="cup-clock">${fmtCup(cupRemaining||secs)}</div><div class="cup-timer-caption" id="cup-timer-caption">${cupRunning?'En marcha':CP[S.cp6][3]}</div><div class="cup-timer-actions"><button class="b p" data-a="cup-start">${cupRunning?'Pausar':'Iniciar'}</button><button class="b" data-a="cup-reset">Reiniciar</button></div><p class="m" style="font-size:.76rem">Temporizador independiente: podés iniciar, pausar y reiniciar mientras consultás los pasos.</p></div>`}
function cat(){const c=CP[S.cp6],preset=c[2].split(':').reduce((a,v)=>a*60+Number(v),0);if(!cupRunning&&cupRemaining===0)cupRemaining=preset;return `<p class="m">Guía práctica de cupping. Seleccioná cada etapa para leer las indicaciones y usá el cronómetro sin salir de la sección.</p><div class="cup-step-list">${CP.map((x,i)=>`<button class="chip" aria-pressed="${S.cp6===i}" data-a="cp" data-v="${i}">${i+1}. ${x[0]}</button>`).join('')}</div><div class="panel"><div class="k">ETAPA ${S.cp6+1} DE ${CP.length}</div><h3>${c[0]}</h3><p>${c[1]}</p><p class="m">${c[3]}</p></div>${cupTimerMarkup()}<div class="cup-nav"><button class="b" data-a="cp-prev" ${S.cp6===0?'disabled':''}>← Etapa anterior</button><button class="b p" data-a="cp-next" ${S.cp6===CP.length-1?'disabled':''}>Etapa siguiente →</button></div>`}
function ses(){return `<div class=panel><h3>Descriptiva y afectiva</h3><p>La evaluación <b>descriptiva</b> pregunta qué intensidad tiene cada atributo; la <b>afectiva</b> pregunta cuánto te gusta. No son lo mismo.</p></div><div class=panel><h3>Tipos de acidez</h3><p>Ejemplos habituales: cítrica (limón), málica (manzana) y fosfórica (jugosa). No toda acidez es agria.</p></div><div class=panel><h3>Prueba triangular</h3><p>Se sirven tres tazas: dos iguales y una distinta. Hay que encontrar la distinta. Sirve para entrenar y calibrar.</p></div><div class=panel><h3>Sesgos</h3><p>Saber el origen o el precio, el orden de las muestras, la fatiga y comentar antes de puntuar cambian lo que percibimos. Probá a ciegas y punteá antes de hablar.</p></div>`}
function cupRenderClock(){const el=document.getElementById('cup-clock');if(el)el.textContent=fmtCup(cupRemaining);const cap=document.getElementById('cup-timer-caption');if(cap)cap.textContent=cupRunning?'En marcha':(cupRemaining===0?'Tiempo cumplido':CP[S.cp6][3]);}

/* ---------- Estado y acciones del módulo ---------- */
Object.assign(S, { sv6: [3, 3, 2, 3, 3, 3], cc: -1, t6: 'pf', t6v: ['pf'], wc: -1, ws: -1, cp6: 0 });

function sensAfter() { if (S.t6 == 'pf') qu() }

/* Cronómetro de cata */
const cupSecs = () => CP[S.cp6][2].split(':').reduce((x, v) => x * 60 + Number(v), 0);
function cupStop() { if (cupRunning) { clearInterval(cupTimer); cupRunning = false } }
function cupGoTo(i) { cupStop(); S.cp6 = Math.max(0, Math.min(CP.length - 1, i)); cupRemaining = cupSecs(); R(0) }
function cupSyncButton() { const b = document.querySelector('[data-a="cup-start"]'); if (b) b.textContent = cupRunning ? 'Pausar' : 'Iniciar' }

on({
  ch: v => { S.cc = +v; S.sv6 = CH6[S.cc][2].slice(); R(0) },
  wc: v => { S.wc = +v; S.ws = -1; R(0) },
  ws: (v, el) => { if (el.dataset.family != null) S.wc = +el.dataset.family; S.ws = +v; R(0) },
  cp: v => cupGoTo(+v),
  'cp-prev': () => cupGoTo(S.cp6 - 1),
  'cp-next': () => cupGoTo(S.cp6 + 1),
  'cup-start': () => {
    if (cupRunning) cupStop();
    else {
      if (cupRemaining <= 0) cupRemaining = cupSecs() || 0;
      cupRunning = true;
      cupTimer = setInterval(() => {
        const preset = cupSecs();
        if (preset > 0 && cupRemaining > 0) { cupRemaining--; cupRenderClock() }
        else if (preset > 0) { cupStop(); cupRenderClock(); cupSyncButton() }
        else { cupRemaining++; cupRenderClock() }
      }, 1000);
    }
    cupRenderClock(); cupSyncButton();
  },
  'cup-reset': () => { cupStop(); cupRemaining = cupSecs(); cupRenderClock(); cupSyncButton() }
});
onInput((t, d) => {
  if (d.q) { S.td[d.q] = +t.value; qu() }
  else if (d.h != null) { const i = +d.h; S.sv6[i] = +t.value; $('#rd').setAttribute('points', poly6(S.sv6)); $('#h' + i).textContent = t.value + ' · ' + SW[+t.value] }
});
