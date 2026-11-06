/* ============================================================
   Glosario y apuntes: vistas, buscador y relaciones con los módulos.
   ============================================================ */

function glossaryView(){const q=S.glossaryQuery||'';return `<div class="resource-head"><div class="eyebrow">RECURSO DE CONSULTA</div><h2>Glosario cafetero</h2><p class="m">Vocabulario técnico para consultar conceptos, procesos, técnicas y mediciones. Elegí un término para desplegar su definición y seguir explorando.</p></div><div class="resource-tools"><input id="glossarySearch" type="search" value="${q.replace(/"/g,'&quot;')}" placeholder="Buscar término o categoría…" aria-label="Buscar en el glosario"></div><div class="resource-count" id="glossaryCount">${GLOSSARY.length} términos en el glosario</div><div class="glossary-list" id="glossaryList">${GLOSSARY.map(x=>{const ix=Object.values(RELATED).findIndex(r=>r.terms.includes(x[0]));const mod=Object.keys(RELATED).find(k=>RELATED[k].terms.includes(x[0]));const ti=Object.keys(RELATED).find(k=>RELATED[k].terms.includes(x[0]));const th=ti==null?[]:RELATED[ti].theory;return `<details class="glossary-entry" data-term="${x.join(' ').toLowerCase()}" ${S.openTerm===x[0]?'open':''}><summary><span>${x[0]}</span><span class="term-cat">${x[1]}</span></summary><p>${x[2]}</p><div class="glossary-meta">${mod!==undefined?`<button class="related-note" data-a="openModule" data-v="${mod}">Ver módulo relacionado →</button>`:''}${th.map(k=>`<button class="related-note" data-a="openTheory" data-v="${k}">Leer: ${THEORY[k][0]} →</button>`).join('')}</div></details>`}).join('')}</div>`}
function theoryView(){return `<div class="resource-head"><div class="eyebrow">BIBLIOTECA DE ESTUDIO</div><h2>Apuntes y profundizaciones</h2><p class="m">Lecturas teóricas para ampliar los fundamentos científicos y técnicos de cada módulo. Cada apunte conecta con términos del glosario y con su módulo de origen.</p></div><div class="theory-list">${THEORY.map((x,i)=>{const mod=Object.keys(RELATED).find(k=>RELATED[k].theory.includes(i));return `<article class="theory-card ${S.theoryOpen===i?'open':''}"><button data-a="theoryToggle" data-v="${i}" aria-expanded="${S.theoryOpen===i}"><span><strong>${x[0]}</strong><small>${x[1]}</small></span><span>${S.theoryOpen===i?'−':'+'}</span></button>${S.theoryOpen===i?`<div class="theory-body">${x[2]}<div class="glossary-meta">${mod!==undefined?`<button class="related-note" data-a="openModule" data-v="${mod}">Ir al módulo relacionado →</button>`:''}<button class="related-note" data-a="glossary">Consultar glosario →</button></div></div>`:''}</article>`}).join('')}</div>`}
const RELATED={
0:{terms:['Cereza','Variedad','Altitud','Densidad','Mucílago'],theory:[0]},
1:{terms:['Fermentación','Honey','Natural','Actividad de agua (aw)','Brix','Cama africana','Humedad'],theory:[1,6,0]},
2:{terms:['Café verde','Café pergamino','Malla / screen size','Humedad','Densidad'],theory:[0]},
3:{terms:['Agtron','Desarrollo','First crack / primer crack','Chaff / cascarilla','Desgasificación'],theory:[2]},
4:{terms:['Extracción','Ratio','Molienda','TDS','Refractómetro','Inmersión','Puck','Canalización'],theory:[3,4]},
5:{terms:['Acidez','Aroma','Fragancia','Astringencia','Cuerpo','Catación'],theory:[5]}
};
function termLink(name){return `<button class="inline-link" data-a="openTerm" data-v="${encodeURIComponent(name)}">${name}</button>`}
function relatedPanel(i){const r=RELATED[i];if(!r)return '';return `<section class="related-panel"><div class="eyebrow">SEGUÍ EXPLORANDO</div><h3>Conectá conceptos</h3><p class="m">Términos clave de este módulo:</p><div class="related-chips">${r.terms.map(termLink).join('')}</div><p class="m related-reading">Para profundizar:</p>${r.theory.map(k=>`<button class="related-note" data-a="openTheory" data-v="${k}">${THEORY[k][0]} →</button>`).join('')}<button class="related-all" data-a="glossary">Abrir glosario completo →</button></section>`}

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
