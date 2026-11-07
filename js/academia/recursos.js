/* ============================================================
   Glosario y apuntes: vistas, buscador y relaciones con los módulos.
   ============================================================ */

function glossaryView(){const q=S.glossaryQuery||'';return `<div class="resource-head"><h2>Glosario cafetero</h2><p class="m">Vocabulario técnico para consultar conceptos, procesos, técnicas y mediciones. Tocá un término para ver qué significa.</p></div><div class="resource-tools"><input id="glossarySearch" type="search" value="${q.replace(/"/g,'&quot;')}" placeholder="Buscar término o categoría…" aria-label="Buscar en el glosario"></div><div class="resource-count" id="glossaryCount">${GLOSSARY.length} términos en el glosario</div><div class="glossary-list" id="glossaryList">${GLOSSARY.map(x=>{const ix=Object.values(RELATED).findIndex(r=>r.terms.includes(x[0]));const mod=Object.keys(RELATED).find(k=>RELATED[k].terms.includes(x[0]));const ti=Object.keys(RELATED).find(k=>RELATED[k].terms.includes(x[0]));const th=ti==null?[]:RELATED[ti].theory;return `<details class="glossary-entry" data-term="${x.join(' ').toLowerCase()}" ${S.openTerm===x[0]?'open':''}><summary><span>${x[0]}</span><span class="term-cat">${x[1]}</span></summary><p>${x[2]}</p><div class="glossary-meta">${mod!==undefined?`<button class="related-note" data-a="openModule" data-v="${mod}">Ver la estación</button>`:''}${th.map(k=>`<button class="related-note" data-a="openTheory" data-v="${k}">Leer: ${THEORY[k][0]}</button>`).join('')}</div></details>`}).join('')}</div>`}
function theoryView(){return `<div class="resource-head"><h2>Apuntes y profundizaciones</h2><p class="m">Lecturas teóricas para ampliar los fundamentos científicos y técnicos de cada estación. Cada apunte conecta con términos del glosario y con su estación.</p></div><div class="theory-list">${THEORY.map((x,i)=>{const mod=Object.keys(RELATED).find(k=>RELATED[k].theory.includes(i));return `<article class="theory-card ${S.theoryOpen===i?'open':''}"><button data-a="theoryToggle" data-v="${i}" aria-expanded="${S.theoryOpen===i}"><span><strong>${x[0]}</strong><small>${x[1]}</small></span><span>${S.theoryOpen===i?'−':'+'}</span></button>${S.theoryOpen===i?`<div class="theory-body">${x[2]}<div class="glossary-meta">${mod!==undefined?`<button class="related-note" data-a="openModule" data-v="${mod}">Ir a la estación</button>`:''}<button class="related-note" data-a="glossary">Consultar glosario</button></div></div>`:''}</article>`}).join('')}</div>`}
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
function stationRecap(i){const r=RELATED[i];if(!r)return '';const k=r.theory[0];return `<section class="station-recap" aria-label="Palabras clave de la estación"><dl>${r.recap.map(n=>`<div><dt>${termShort(n)}</dt><dd>${termDef(n)}</dd></div>`).join('')}</dl>${k!=null?`<button class="link-btn" data-a="openTheory" data-v="${k}">Leer el apunte: ${THEORY[k][0]}</button>`:''}</section>`}

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
  'Catación': 'Forma ordenada de probar y comparar cafés, siempre con los mismos pasos.'
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

/* ---------- Estado y acciones ---------- */
Object.assign(S, { openTerm: '', glossaryQuery: '', theoryOpen: -1 });

function filterGlossary(raw) {
  const q = raw.trim().toLowerCase(); let n = 0;
  document.querySelectorAll('.glossary-entry').forEach(el => { const ok = el.dataset.term.includes(q); el.hidden = !ok; if (ok) n++ });
  const c = $('#glossaryCount'); if (c) c.textContent = q ? n + ' términos encontrados' : GLOSSARY.length + ' términos en el glosario';
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
  openTerm: v => { S.openTerm = decodeURIComponent(v); S.glossaryQuery = ''; routeTo('/academia/glosario') },
  openModule: v => go(+v),
  openTheory: v => { S.theoryOpen = +v; routeTo('/academia/apuntes') },
  theory: () => { S.theoryOpen = -1; routeTo('/academia/apuntes') },
  theoryToggle: v => { S.theoryOpen = S.theoryOpen === +v ? -1 : +v; R(0) }
});
onInput(t => { if (t.id === 'glossarySearch') { S.glossaryQuery = t.value; filterGlossary(t.value) } });
