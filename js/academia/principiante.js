/* ============================================================
   Academia · pasos del nivel principiante
   Para quien no sabe nada de café: cada estación empieza con un paso
   que explica lo básico en palabras simples (estos de acá) y después
   sigue con los pasos interactivos esenciales. Qué pasos tiene cada
   nivel se marca en SC (js/academia/estaciones.js): ini = solo
   principiante · full = solo nivel completo.
   ============================================================ */

/* Bloques comunes: la idea clave destacada y una tarjeta con dibujo. */
const iniKey = t => `<p class="ini-key"><span>La idea clave</span>${t}</p>`;
const iniCard = (art, title, html) => `<div class="ini-card"><div class="ini-art" aria-hidden="true">${art}</div><div><h4>${title}</h4>${html}</div></div>`;
const iniNext = t => `<p class="m ini-next">${t}</p>`;

/* ---------- 1 · La planta y el fruto ---------- */
const INI_BRANCH = `<svg viewBox="0 0 220 150"><path d="M10 40C70 50 130 60 210 110" stroke="#7a5a40" stroke-width="5" fill="none" stroke-linecap="round"/>
  ${[[50, 30, -30], [95, 40, 20], [140, 62, -20], [180, 84, 25]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y - 14}" rx="22" ry="9" fill="#6f8a5e" transform="rotate(${r} ${x} ${y - 14})"/>`).join('')}
  ${[[70, 56], [82, 60], [76, 68], [118, 74], [130, 78], [124, 86], [160, 96], [170, 100]].map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="7" fill="${k % 3 === 2 ? '#d97a4e' : '#c0503d'}"/>`).join('')}</svg>`;
const INI_CHERRY = `<svg viewBox="0 0 160 150"><circle cx="80" cy="75" r="62" fill="#c0503d"/><circle cx="80" cy="75" r="50" fill="#f0d9a8"/>
  <ellipse cx="62" cy="75" rx="15" ry="32" fill="#cbbf8f"/><ellipse cx="98" cy="75" rx="15" ry="32" fill="#cbbf8f"/>
  <path d="M66 50q-8 25 0 50M94 50q8 25 0 50" stroke="#8a7a52" stroke-width="3" fill="none"/></svg>`;
function iniFruto() {
  return `<p>El café que tomás empieza en una planta: un arbusto llamado <b>cafeto</b>, que crece en zonas tropicales, casi siempre en la montaña.</p>
  ${iniCard(INI_BRANCH, 'El cafeto da frutos', '<p>Sus frutos son rojos cuando están maduros, parecidos a una cereza. Por eso se los llama así: <b>cerezas de café</b>.</p>')}
  ${iniCard(INI_CHERRY, 'Adentro hay dos semillas', '<p>Si abrís una cereza, adentro hay dos semillas enfrentadas. Esas semillas, ya secas y tostadas, son los <b>granos de café</b>.</p>')}
  ${iniKey('Cada grano de café es la semilla de una fruta.')}
  ${iniNext('En esta estación vas a ver las dos especies principales de café, cómo influye la altura donde crece, cuándo está maduro el fruto y qué capas tiene.')}`;
}

/* ---------- 2 · Poscosecha ---------- */
const INI_STATE = (fruit, pulp) => `<svg viewBox="0 0 90 90">${fruit ? '<circle cx="45" cy="45" r="38" fill="#c0503d"/>' : ''}${pulp ? `<circle cx="45" cy="45" r="${fruit ? 30 : 34}" fill="#e3b26a" opacity=".85"/>` : ''}<ellipse cx="45" cy="45" rx="14" ry="24" fill="#d8c9a0" stroke="#a8936a" stroke-width="2"/><path d="M45 25q6 20 0 40" stroke="#a8936a" stroke-width="2" fill="none"/></svg>`;
function iniPoscosecha() {
  return `<p>Una vez cosechado, el fruto no se puede tostar así como está: primero hay que <b>sacarle la fruta y secar la semilla</b>. A esta etapa se la llama poscosecha (o beneficio).</p>
  <p>Hay tres formas principales de hacerlo, y cada una deja un sabor distinto:</p>
  <div class="ini-trio">
    ${iniCard(INI_STATE(false, false), 'Lavado', '<p>Se saca toda la fruta antes de secar. La taza suele ser <b>limpia</b>, con la acidez bien marcada.</p>')}
    ${iniCard(INI_STATE(false, true), 'Honey', '<p>Se saca la piel, pero queda parte de la pulpa pegajosa. Suele dar un café más <b>dulce</b>.</p>')}
    ${iniCard(INI_STATE(true, true), 'Natural', '<p>Se seca el fruto entero, con todo. Suele dar un café <b>dulce, frutado e intenso</b>.</p>')}
  </div>
  ${iniKey('Cuanta más fruta queda durante el secado, más dulce y frutado suele ser el café.')}
  ${iniNext('En el paso siguiente vas a recorrer cada uno de estos caminos, etapa por etapa.')}`;
}

/* ---------- 3 · Café verde ---------- */
function iniVerde() {
  return `<p>Ya seco y sin cáscaras, el grano tiene color <b>verde claro</b> y casi no huele a café. Así se guarda y viaja por el mundo, en sacos de yute. Bien guardado, dura meses.</p>
  <div class="ini-duo">
    ${iniCard(bn2(0), 'Grano sano', '<p>Color y forma parejos.</p>')}
    ${iniCard(bn2(1), 'Grano con defecto', '<p>Negro, picado por insectos, roto… Se llaman <b>defectos</b>.</p>')}
  </div>
  <p>Antes de comprar un café, se toma una muestra y se revisa grano por grano. Unos pocos granos dañados alcanzan para que la taza tenga sabores feos.</p>
  ${iniKey('Un buen café empieza por elegir buenos granos.')}
  ${iniNext('En el paso siguiente vas a hacer ese trabajo: separar los granos sanos de los que tienen defectos.')}`;
}

/* ---------- 4 · Tueste ---------- */
function iniTueste() {
  const g = (p, s, name, html) => iniCard(rb(p, { s }, 64), name, html);
  return `<p><b>Tostar</b> es calentar el grano verde en un tostador durante unos 10 a 15 minutos. Con el calor, el grano pierde agua, cambia de color, se agranda y se forman los aromas del café.</p>
  <p>Según cuándo se lo saca del tostador, queda más claro o más oscuro. Eso se llama <b>grado de tueste</b> y cambia mucho el sabor:</p>
  <div class="ini-trio">
    ${g(.3, 1.09, 'Claro', '<p>Más <b>acidez</b> y aromas frutales o florales; cuerpo liviano. Muy usado en cafés de filtro.</p>')}
    ${g(.6, 1.18, 'Medio', '<p><b>Equilibrio</b> entre acidez, dulzor y notas a caramelo o chocolate. Sirve para casi todo.</p>')}
    ${g(.95, 1.28, 'Oscuro', '<p>Más <b>amargor</b> y cuerpo, notas a tostado y menos acidez. Típico de espressos intensos y cafés con leche.</p>')}
  </div>
  ${iniKey('Ningún tueste es mejor que otro: depende de qué sabores querés destacar y de cómo lo vas a preparar.')}
  ${iniNext('Después vas a ver las fases por las que pasa el grano en el tostador y a ordenar granos según su tueste.')}`;
}

/* ---------- 5 · Preparación ---------- */
const INI_PERC = `<svg viewBox="0 0 120 130"><path d="M25 20h70l-28 46h-14z" fill="#f6f4f0" stroke="#bdb8ae" stroke-width="2"/><path d="M38 30h44l-18 28h-8z" fill="#6b4630"/>
  ${[[60, 8], [50, 12], [70, 10]].map(([x, y]) => `<path d="M${x} ${y}q-3 5 0 7q3-2 0-7z" fill="#7FB2C9"/>`).join('')}
  <path d="M60 70v14M60 90v8" stroke="#6b4630" stroke-width="3" stroke-linecap="round"/><path d="M34 100h52l-6 24h-40z" fill="#dbe7ec" stroke="#9fb3bb" stroke-width="2"/><path d="M37 110h46l-4 13h-38z" fill="#6b4630"/></svg>`;
const INI_IMM = `<svg viewBox="0 0 120 130"><rect x="30" y="30" width="60" height="90" rx="6" fill="#dbe7ec" stroke="#9fb3bb" stroke-width="2"/><rect x="33" y="50" width="54" height="67" rx="4" fill="#6b4630"/>
  ${Array.from({ length: 14 }, (_, k) => `<circle cx="${38 + (k * 37) % 46}" cy="${56 + (k * 23) % 56}" r="2.2" fill="#3d2618"/>`).join('')}
  <path d="M60 8v40" stroke="#555" stroke-width="3"/><rect x="34" y="44" width="52" height="5" rx="2" fill="#888"/><rect x="50" y="4" width="20" height="6" rx="3" fill="#2b2b2b"/></svg>`;
function iniFiltrado() {
  return `<p>Un <b>café filtrado</b> se hace con café molido y agua caliente, sin presión: el agua extrae los sabores del café y después un filtro (de papel, metal o tela) separa la bebida del café ya usado.</p>
  <p>Hay dos grandes familias de métodos, según cómo se encuentran el agua y el café:</p>
  <div class="ini-duo">
    ${iniCard(INI_PERC, 'Percolación', '<p>El agua <b>pasa a través</b> del café y cae por gravedad, gota a gota, a la taza o la jarra. El café siempre recibe agua nueva.</p><p class="m">Ejemplos: V60, Chemex, Kalita, cafetera de filtro eléctrica.</p><p class="m">Suele dar tazas más <b>limpias y livianas</b>.</p>')}
    ${iniCard(INI_IMM, 'Inmersión', '<p>El café queda <b>sumergido</b> en el agua todo el tiempo de preparación, y recién al final se separan.</p><p class="m">Ejemplos: prensa francesa, Clever, cold brew. La AeroPress combina un poco de las dos.</p><p class="m">Suele dar tazas con <b>más cuerpo</b>.</p>')}
  </div>
  ${iniKey('En los dos casos importan las mismas cosas: cuánto café, cuánta agua, qué tan fino está molido, la temperatura y el tiempo.')}`;
}
const INI_ESP = `<svg viewBox="0 0 160 130"><rect x="20" y="8" width="120" height="26" rx="5" fill="#b3262b"/><rect x="58" y="34" width="44" height="12" rx="3" fill="#a8a8a5"/>
  <path d="M80 46v8" stroke="#a8a8a5" stroke-width="10"/><path d="M102 40h44" stroke="#141414" stroke-width="7" stroke-linecap="round"/><text x="80" y="25" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">9 bar</text>
  <path d="M76 58v22M84 58v22" stroke="#6b4630" stroke-width="3" stroke-linecap="round"/><path d="M58 84h44l-4 30h-36z" fill="#f4f2ee" stroke="#cfc9bd" stroke-width="2"/><ellipse cx="80" cy="86" rx="20" ry="4" fill="#c88a4a"/><path d="M102 92q12 0 10 10t-12 8" fill="none" stroke="#cfc9bd" stroke-width="3"/></svg>`;
function iniEspresso() {
  return `${iniCard(INI_ESP, 'Café con presión', '<p>El <b>espresso</b> se prepara con una máquina que empuja agua caliente (unos 90 a 94 °C) con mucha fuerza, unas 9 veces la presión del aire, a través de café molido <b>muy fino</b> y bien compactado.</p><p>En unos 25 a 30 segundos sale una bebida <b>corta y concentrada</b>, con una espuma color avellana arriba llamada <b>crema</b>.</p>')}
  <p>Es la base de muchas bebidas: cortado, capuchino, latte, flat white.</p>
  <div class="ini-table" role="table" aria-label="Filtrado y espresso, comparados">
    <div role="row" class="ini-th"><span role="columnheader"></span><span role="columnheader">Filtrado</span><span role="columnheader">Espresso</span></div>
    ${[['Molienda', 'Media', 'Muy fina'], ['Presión', 'No', 'Sí, mucha'], ['Tiempo', '3 a 4 minutos', '25 a 30 segundos'], ['Café y agua', '1 g de café cada 15 a 17 g de agua', '1 g de café cada 2 g de bebida'], ['La taza', 'Más grande y liviana', 'Corta, intensa y con crema']]
      .map(r => `<div role="row"><span role="rowheader">${r[0]}</span><span role="cell">${r[1]}</span><span role="cell">${r[2]}</span></div>`).join('')}
  </div>
  ${iniKey('El mismo café cambia mucho según el método: el espresso concentra; el filtrado es más suave y deja ver más matices.')}
  ${iniNext('En el paso siguiente vas a armar una receta: elegí filtrado o espresso y ajustá el café y el agua.')}`;
}

/* ---------- 6 · Sensorial ---------- */
const INI_CUP = `<svg viewBox="0 0 120 110"><path d="M20 40h70v20a35 35 0 0 1-70 0z" fill="#f4f2ee" stroke="#cfc9bd" stroke-width="2"/><ellipse cx="55" cy="40" rx="35" ry="7" fill="#6b4630"/><path d="M90 48q16 0 14 14t-16 12" fill="none" stroke="#cfc9bd" stroke-width="4"/>
  <path d="M42 28c-4-6 4-10 0-18M56 26c-4-6 4-10 0-18M70 28c-4-6 4-10 0-18" stroke="#bdb8ae" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`;
function iniSensorial() {
  return `${iniCard(INI_CUP, 'Oler y tomar', '<p>Probar un café con atención es como escuchar una canción fijándote en cada instrumento. Primero <b>olelo</b>: ¿te recuerda a algo? Chocolate, frutas, flores, nueces… Después <b>tomalo</b> y fijate en cuatro cosas.</p>')}
  <dl class="ini-attrs">
    <div><dt>Acidez</dt><dd>Una sensación brillante, como la de una fruta jugosa. No es lo mismo que agrio.</dd></div>
    <div><dt>Dulzor</dt><dd>Como el del caramelo o la fruta madura.</dd></div>
    <div><dt>Amargor</dt><dd>Como el del chocolate amargo. Un poco está bien; mucho tapa lo demás.</dd></div>
    <div><dt>Cuerpo</dt><dd>Qué tan pesado se siente en la boca: liviano como un té o denso como la leche entera.</dd></div>
  </dl>
  ${iniKey('No hay respuestas correctas: se trata de describir lo que sentís.')}
  ${iniNext('En el paso siguiente vas a describir un café con esas cuatro sensaciones.')}`;
}
