/* ============================================================
   Glosario y apuntes: vistas, buscador y relaciones con los módulos.
   ============================================================ */

function glossaryView(){const q=S.glossaryQuery||'';return `<div class="resource-head"><h2>Glosario cafetero</h2><p class="m">Las palabras del café, explicadas en simple. Tocá un término para ver qué significa; debajo está también la definición técnica.</p></div><div class="resource-tools"><input id="glossarySearch" type="search" value="${q.replace(/"/g,'&quot;')}" placeholder="Buscar término o categoría…" aria-label="Buscar en el glosario"></div><div class="resource-count" id="glossaryCount" role="status">${GLOSSARY.length} términos en el glosario</div><div class="panel glossary-empty" id="glossaryEmpty" hidden><p id="glossaryEmptyText"></p><button type="button" class="b" data-a="glossaryClear">Ver todos los términos</button></div><div class="glossary-list" id="glossaryList">${GLOSSARY.map(x=>{const ix=Object.values(RELATED).findIndex(r=>r.terms.includes(x[0]));const mod=Object.keys(RELATED).find(k=>RELATED[k].terms.includes(x[0]));const ti=Object.keys(RELATED).find(k=>RELATED[k].terms.includes(x[0]));const th=ti==null?[]:RELATED[ti].theory;return `<details class="glossary-entry" data-term="${(x.join(' ')+' '+(TERM_PLAIN[x[0]]||'')).toLowerCase().replace(/"/g,'')}" ${S.openTerm===x[0]?'open':''}><summary><span>${x[0]}</span><span class="term-cat">${x[1]}</span></summary>${TERM_PLAIN[x[0]]?`<p class="gloss-plain">${TERM_PLAIN[x[0]]}</p><p class="gloss-tech"><b>Definición técnica.</b> ${x[2]}</p>`:`<p class="gloss-plain">${x[2]}</p>`}<div class="glossary-meta">${mod!==undefined?`<button class="related-note" data-a="openModule" data-v="${mod}">Ver la estación</button>`:''}${th.map(k=>`<button class="related-note" data-a="openTheory" data-v="${k}">Leer: ${THEORY[k][0]}</button>`).join('')}</div></details>`}).join('')}</div>`}
function theoryView(){return `<div class="resource-head"><h2>Apuntes y profundizaciones</h2><p class="m">Lecturas más largas y técnicas, para cuando quieras ir a fondo. No hacen falta para completar las estaciones.</p></div><div class="theory-list">${THEORY.map((x,i)=>{const mod=Object.keys(RELATED).find(k=>RELATED[k].theory.includes(i));return `<article class="theory-card ${S.theoryOpen===i?'open':''}"><button data-a="theoryToggle" data-v="${i}" aria-expanded="${S.theoryOpen===i}"><span><strong>${x[0]}</strong><small>${x[1]}</small></span><span>${S.theoryOpen===i?'−':'+'}</span></button>${S.theoryOpen===i?`<div class="theory-body">${x[2]}<div class="glossary-meta">${mod!==undefined?`<button class="related-note" data-a="openModule" data-v="${mod}">Ir a la estación</button>`:''}<button class="related-note" data-a="glossary">Consultar glosario</button></div></div>`:''}</article>`}).join('')}</div>`}
/* Relación entre el glosario, los apuntes y cada estación.
   terms: términos del glosario que llevan a la estación ("Ver módulo relacionado").
   recap: palabras clave que se repasan al completar la estación (todas aparecen en sus pasos).
   theory: apuntes relacionados; el primero es el que se ofrece al cerrar la estación. */
const RELATED={
0:{terms:['Cereza','Variedad','Altitud','Densidad','Mucílago'],recap:['Arabica','Canephora / robusta','Altitud','Cereza','Mucílago'],theory:[0]},
1:{terms:['Fermentación','Honey','Natural','Actividad de agua (aw)','Brix','Cama africana','Humedad'],recap:['Lavado','Natural','Honey','Fermentación','Secado'],theory:[1,6,0]},
2:{terms:['Café verde','Café pergamino','Malla / screen size','Humedad','Densidad'],recap:['Café verde','Defecto primario','Defecto secundario','Humedad','Densidad','Trazabilidad'],theory:[0]},
3:{terms:['Agtron','Desarrollo','First crack / primer crack','Chaff / cascarilla','Desgasificación'],recap:['Reacción de Maillard','First crack / primer crack','Desarrollo','Rate of Rise (RoR)'],theory:[2]},
4:{terms:['Extracción','Ratio','Molienda','TDS','Refractómetro','Inmersión','Puck','Canalización'],recap:['Ratio','Extracción','Dureza total','Alcalinidad','Finos','TDS'],theory:[3,4]},
5:{terms:['Acidez','Aroma','Fragancia','Astringencia','Cuerpo','Catación'],recap:['Acidez','Dulzor','Cuerpo','Persistencia','Catación'],theory:[5]}
};
/* Palabras clave y apunte para la pantalla de cierre de cada estación (recapView, en estaciones.js). */
const termDef = name => { const g = findTerm(name); return TERM_PLAIN[name] || (g && g[2]) || '' };
const TERM_SHORT = { 'Canephora / robusta': 'Canephora (robusta)', 'First crack / primer crack': 'Primer crack', 'Rate of Rise (RoR)': 'RoR (cuánto sube por minuto)' };
const termShort = name => TERM_SHORT[name] || name;
function stationRecap(i){const r=RELATED[i];if(!r)return '';const k=r.theory[0];return `<section class="station-recap" aria-label="Palabras clave de la estación"><dl>${r.recap.map(n=>`<div><dt>${termShort(n)}</dt><dd>${termDef(n)}</dd></div>`).join('')}</dl>${k!=null?`<button class="link-btn" data-a="openTheory" data-v="${k}">Lectura avanzada: ${THEORY[k][0]}</button>`:''}</section>`}

/* ---------- Glosario dentro del paso ----------
   term('mucílago', 'Mucílago') dibuja la palabra como un botón: al tocarla se abre
   la definición ahí mismo, sin salir del paso. Usa la versión simple de TERM_PLAIN
   si existe; si no, la del glosario. El segundo dato es el nombre en GLOSSARY. */
const TERM_PLAIN = {
  'Arabica': 'La especie más usada en el café de especialidad. Crece en zonas altas y frescas y da tazas con más acidez y aromas.',
  'Canephora / robusta': 'Especie que aguanta más el calor y las enfermedades. Da tazas con más cuerpo, amargor y cafeína.',
  'Altitud': 'Altura del cultivo sobre el nivel del mar. Más arriba hace más fresco y el fruto madura más lento.',
  'Cereza': 'El fruto del cafeto. Adentro suele tener dos semillas, que son los granos de café.',
  'Lavado': 'Proceso en el que se sacan todas las capas del fruto antes de secar la semilla.',
  'Natural': 'Proceso en el que el fruto se seca entero y se pela al final.',
  'Honey': 'Proceso en el que se saca la piel y la pulpa, y la semilla se seca con parte del mucílago.',
  'Secado': 'Etapa en la que el café pierde agua hasta quedar estable para poder guardarlo.',
  'Trazabilidad': 'Poder seguir el camino de un lote: de qué finca viene, cómo se procesó y por dónde pasó.',
  'Dulzor': 'Sensación dulce del café, aunque no tenga azúcar agregada.',
  'Mucílago': 'Capa pegajosa y dulce que envuelve la semilla, entre la pulpa y el pergamino.',
  'Café pergamino': 'Semilla seca que todavía conserva el pergamino, una cáscara fina que la protege.',
  'Despulpado': 'Paso en el que una máquina le saca al fruto la piel y la pulpa.',
  'Fermentación': 'Trabajo de levaduras y bacterias que se alimentan de los azúcares del fruto y cambian sus aromas.',
  'Café verde': 'La semilla del café ya seca y pelada, antes de tostarla. Así se vende y se viaja por el mundo.',
  'Defecto primario': 'Defecto grave, como un grano negro o con hongos. Uno solo alcanza para que el café no sea de especialidad.',
  'Defecto secundario': 'Defecto más leve, como un grano quebrado o con restos de cáscara. Se tolera una cantidad chica.',
  'Humedad': 'Cuánta agua tiene el grano, en porcentaje de su peso.',
  'Densidad': 'Qué tan compacto es el grano: cuánto pesa para el lugar que ocupa.',
  'Reacción de Maillard': 'Reacción entre azúcares y proteínas que dora los alimentos con calor, como el pan tostado o la carne a la parrilla.',
  'First crack / primer crack': 'Crujido que se escucha cuando el vapor rompe el grano desde adentro. Marca el inicio del desarrollo.',
  'Desarrollo': 'Tramo final del tueste: desde el primer crack hasta que se saca el café del tostador.',
  'Rate of Rise (RoR)': 'Cuántos grados sube la temperatura del grano por minuto. Muestra si el tueste va rápido o lento.',
  'Ratio': 'Cuánta agua usás por cada gramo de café. 1:16 quiere decir 16 g de agua por cada gramo de café.',
  'Extracción': 'Lo que el agua le saca al café molido mientras pasa: sabores, aromas, ácidos y azúcares.',
  'TDS': 'Sólidos disueltos totales: qué porcentaje de la bebida es café disuelto. Se mide con un refractómetro.',
  'Yield / rendimiento de extracción': 'Qué porcentaje del café molido terminó disuelto en la bebida.',
  'Refractómetro': 'Instrumento que mide el TDS de una bebida a partir de unas gotas.',
  'Dureza total': 'Cuánto calcio y magnesio tiene el agua. Esos minerales ayudan a extraer el café.',
  'Alcalinidad': 'Cuánto puede el agua neutralizar la acidez del café. Si es alta, la taza queda plana.',
  'Finos': 'Partículas muy chicas que deja todo molino. Se extraen rápido y frenan el paso del agua.',
  'Acidez': 'Sensación viva y jugosa, como la de una fruta. No es lo mismo que agrio.',
  'Cuerpo': 'Peso o textura de la bebida en la boca: liviana como el té o densa como la leche.',
  'Persistencia': 'Cuánto dura el sabor en la boca después de tragar.',
  'Catación': 'Forma ordenada de probar y comparar cafés, siempre con los mismos pasos.',
  /* El resto del glosario, también en simple (se muestran en la página del glosario). */
  'Actividad de agua (aw)': 'Cuánta agua del grano está “libre” para que crezcan hongos o pasen reacciones. No es lo mismo que la humedad.',
  'Agtron': 'Escala con números para medir qué tan claro u oscuro quedó un café tostado.',
  'Aroma': 'Lo que olés en el café: seco, recién molido o ya preparado.',
  'Astringencia': 'Sensación de boca seca o áspera, como la de un té muy cargado.',
  'Brix': 'Medida de cuánta azúcar tiene un jugo. En café ayuda a saber qué tan maduro está el fruto.',
  'Cama africana': 'Mesa alta con malla donde se seca el café: el aire pasa por arriba y por abajo.',
  'Canalización': 'En espresso, cuando el agua encuentra un camino fácil y pasa por ahí en vez de mojar todo el café por igual.',
  'Chaff / cascarilla': 'Piel muy fina del grano que se suelta al tostarlo.',
  'Desgasificación': 'Salida del gas (dióxido de carbono) que el café guarda después del tueste.',
  'Fragancia': 'El olor del café molido en seco, antes de echarle agua.',
  'Inmersión': 'Forma de preparar en la que el café queda sumergido en el agua un rato, como en la prensa francesa.',
  'Malla / screen size': 'Tamaño del grano verde, medido con zarandas de agujeros de distinto diámetro.',
  'Molienda': 'Partir el grano tostado en pedacitos. El tamaño cambia cómo pasa el agua y cuánto le saca al café.',
  'Puck': 'La pastilla de café molido y prensado que queda en el portafiltro del espresso.',
  'Tueste': 'Calentar el café verde hasta que toma color, aroma y sabor.',
  'Variedad': 'Tipo de planta dentro de una especie, como pasa con las variedades de uva o de manzana.',
  'V60': 'Cafetera de filtro con forma de cono: se echa el agua a mano sobre el café y la bebida cae por un agujero.',
  'Bourbon': 'Una familia de variedades de arabica. Es el nombre de la planta, no de un proceso.',
  'Typica': 'Una de las variedades más antiguas de arabica; de ella descienden muchas otras.',
  'Geisha / Gesha': 'Variedad de arabica conocida por sus aromas muy marcados cuando se cultiva y se procesa bien.',
  'Desmucilaginado': 'Sacar el mucílago con una máquina, después de despulpar.',
  'Fermentación anaeróbica': 'Fermentación casi sin aire, en un recipiente cerrado.',
  'Fermentación aeróbica': 'Fermentación con aire, por ejemplo en un tanque abierto.',
  'Inóculo': 'Levaduras o bacterias que se agregan a propósito para guiar una fermentación.',
  'pH': 'Número que dice qué tan ácido o alcalino es un líquido. Menos de 7 es ácido.',
  'Reposo / estabilización': 'Tiempo que el café descansa después de secarse, para que su humedad quede pareja.',
  'Quaker': 'Grano que queda pálido después del tueste. Suele venir de un fruto que no estaba maduro.',
  'Pérdida de masa': 'Cuánto peso pierde el café al tostarse, porque se le va el agua y algunos gases.',
  'Carga térmica': 'Cuánto calor recibe el café dentro del tostador.',
  'Tiempo de desarrollo': 'Los minutos que pasan desde el primer crack hasta que se saca el café del tostador.',
  'Ratio de desarrollo (DTR)': 'Qué parte del tueste total corresponde al desarrollo, en porcentaje.',
  'Convección': 'Calor que llega por el aire caliente que se mueve alrededor del grano.',
  'Conducción': 'Calor que pasa por contacto, por ejemplo del tambor caliente al grano.',
  'Radiación': 'Calor que llega sin contacto, como el del sol o el de una brasa.',
  'Bloom / preinfusión': 'El primer mojado del café: un poco de agua para que suelte el gas antes de seguir vertiendo.',
  'Bypass': 'Agregar agua a la bebida ya preparada, sin que pase por el café.',
  'Agitación': 'Mover el agua o el café mientras se prepara, por ejemplo revolviendo.',
  'Lecho de café': 'El café molido que queda dentro del filtro o del portafiltro mientras pasa el agua.',
  'Percolación': 'Cuando el agua atraviesa el café molido y sale por abajo, como en un filtrado.',
  'Distribución de partículas': 'La mezcla de tamaños que deja un molino: siempre salen pedacitos más chicos y más grandes.',
  'Uniformidad de molienda': 'Qué tan parecidos entre sí quedan los pedacitos de café molido.',
  'Agua de preparación': 'El agua con la que hacés el café. Sus minerales cambian el sabor y también afectan a la máquina.',
  'Bicarbonato': 'Componente del agua que neutraliza la acidez. Es lo que más aporta a la alcalinidad.',
  'Magnesio': 'Mineral del agua. Junto con el calcio forma la dureza.',
  'Calcio': 'Mineral del agua. Aporta dureza y puede dejar sarro.',
  'Buffer / capacidad tampón': 'Cuánto aguanta un líquido sin cambiar su acidez cuando se le agrega algo ácido o alcalino.',
  'Turbidez': 'Qué tan turbia se ve el agua o la bebida, por partículas muy chicas que flotan.',
  'Sabor': 'Lo que sentís al probar: la suma del gusto en la lengua y los aromas que suben a la nariz.',
  'Retronasal': 'Los aromas que sentís desde adentro de la boca, cuando suben a la nariz mientras probás.',
  'Ortonasal': 'Los aromas que sentís al oler por la nariz.',
  'Balance': 'Cuando ningún atributo tapa a los demás y la taza se siente armónica.',
  'Uniformidad': 'Que varias tazas del mismo café sepan igual.',
  'Taza limpia': 'Una taza sin sabores raros ni defectos.',
  'Amargor': 'Uno de los gustos básicos. Puede ser parte del perfil de un café; cuánto se siente depende del café y de cómo se preparó.',
  'Salinidad': 'Gusto salado. En algunos cafés puede aparecer como una nota más.',
  'Umami': 'Gusto sabroso, como el del caldo. En café se evalúa con cuidado.',
  'Cupping score': 'Puntaje que recibe un café en una catación, según una planilla con criterios definidos.',
  'Lote': 'Una cantidad de café que se identifica y se maneja como una unidad.',
  'Microlote': 'Un lote chico y diferenciado por su origen, variedad, cosecha o proceso.'
};
const findTerm = k => GLOSSARY.find(x => x[0].toLowerCase() === k.toLowerCase());
function term(label, key = label) {
  const g = findTerm(key), name = g ? g[0] : key;
  return `<button type="button" class="term" data-a="term" data-v="${encodeURIComponent(name)}" aria-expanded="false">${label}</button>`;
}
on({
  /* La definición aparece debajo del párrafo (no en medio de la frase). Tocar otra palabra
     del mismo párrafo la reemplaza; tocar la misma, la cierra. */
  term: (v, el) => {
    if (!P.termTip) { P.termTip = 1; sv(); const tip = $('.term-tip'); if (tip) tip.remove() }
    const name = decodeURIComponent(v), host = el.closest('p, li') || el, open = host.nextElementSibling;
    const was = open && open.classList.contains('term-def') ? open : null;
    if (was) { was.remove(); host.querySelectorAll('.term[aria-expanded="true"]').forEach(b => b.setAttribute('aria-expanded', 'false')); if (was.dataset.term === name) return }
    const g = findTerm(name), def = TERM_PLAIN[name] || (g && g[2]) || '';
    const d = document.createElement('div');
    d.className = 'term-def'; d.setAttribute('role', 'note'); d.dataset.term = name;
    d.innerHTML = `<b>${g ? g[0] : name}.</b> ${def}${g ? ` <button type="button" class="link-btn" data-a="openTerm" data-v="${encodeURIComponent(g[0])}">Ver en el glosario</button>` : ''}`;
    host.after(d); el.setAttribute('aria-expanded', 'true');
  }
});

/* La primera vez que un paso trae palabras del glosario, una línea avisa que se pueden tocar.
   Desaparece para siempre cuando la persona toca una (P.termTip). */
function termTip() {
  if (P.termTip || $('.term-tip')) return;
  const t = $('.step-body .term'); if (!t) return;
  (t.closest('p, li') || t).insertAdjacentHTML('afterend', '<p class="term-tip">Las palabras subrayadas se pueden tocar: te muestran qué significan.</p>');
}

/* ---------- Estado y acciones ---------- */
Object.assign(S, { openTerm: '', glossaryQuery: '', theoryOpen: -1 });

function filterGlossary(raw) {
  const q = raw.trim().toLowerCase(); let n = 0;
  document.querySelectorAll('.glossary-entry').forEach(el => { const ok = el.dataset.term.includes(q); el.hidden = !ok; if (ok) n++ });
  const c = $('#glossaryCount'); if (c) c.textContent = q ? (n === 1 ? '1 término encontrado' : n + ' términos encontrados') : GLOSSARY.length + ' términos en el glosario';
  /* Sin resultados: se dice qué se buscó y cómo seguir. */
  const empty = $('#glossaryEmpty'), txt = $('#glossaryEmptyText');
  if (empty && txt) { empty.hidden = !(q && n === 0); txt.textContent = `No encontramos «${raw.trim()}». Probá con otra palabra o con una categoría, como «tueste» o «medición».` }
}
function glossaryAfter() {
  if (S.glossaryQuery) filterGlossary(S.glossaryQuery);
  if (S.openTerm) setTimeout(() => { const el = document.querySelector('.glossary-entry[open]'); if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' }) }, 40);
}
function theoryAfter() {
  if (S.theoryOpen >= 0) { const el = document.querySelector('.theory-card.open'); if (el) el.scrollIntoView({ block: 'start' }) }
}

on({
  glossary: () => { S.openTerm = ''; S.glossaryQuery = ''; routeTo('/academia/glosario') },
  glossaryClear: () => { S.glossaryQuery = ''; const i = $('#glossarySearch'); if (i) { i.value = ''; i.focus() } filterGlossary('') },
  openTerm: v => { S.openTerm = decodeURIComponent(v); S.glossaryQuery = ''; routeTo('/academia/glosario') },
  openModule: v => go(+v),
  openTheory: v => { S.theoryOpen = +v; routeTo('/academia/apuntes') },
  theory: () => { S.theoryOpen = -1; routeTo('/academia/apuntes') },
  theoryToggle: v => { S.theoryOpen = S.theoryOpen === +v ? -1 : +v; R(0) }
});
onInput(t => { if (t.id === 'glossarySearch') { S.glossaryQuery = t.value; filterGlossary(t.value) } });
