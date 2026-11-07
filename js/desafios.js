/* ============================================================
   Desafíos · preguntas por estación y nivel
   CHBANK[estación] = [[nivel, tema, pregunta, opciones, índice correcto, explicación], ...]
   ============================================================ */

Object.assign(S, { chModule: 'Fruto', chLevel: 'Básico', chAnswers: {} });
/* Las respuestas se guardan en este navegador para no perder el avance al recargar. */
const chSave = () => { try { localStorage.setItem('cl-ch', JSON.stringify(S.chAnswers)) } catch (e) {} };

const CHBANK={
'Fruto':[
['Básico','Anatomía','¿Qué estructura está inmediatamente por debajo de la piel de la cereza?',['Pulpa','Pergamino','Semilla'],0,'La pulpa o mesocarpio está debajo del exocarpio.'],
['Intermedio','Madurez','¿Por qué el color por sí solo no alcanza para definir la madurez?',['Porque depende de variedad y contexto','Porque nunca cambia','Porque solo importa el tamaño'],0,'La variedad modifica el color y conviene combinarlo con otros indicadores.'],
['Avanzado','Criterio de cosecha','Un lote presenta frutos maduros y verdes mezclados. ¿Qué riesgo operativo aparece?',['Menor homogeneidad del lote','Mayor trazabilidad automática','Menor necesidad de selección'],0,'La heterogeneidad complica el procesamiento y puede ampliar la variabilidad de taza.']],
'Poscosecha':[
['Básico','Procesos','¿En qué proceso se seca el fruto entero antes de retirar sus cubiertas?',['Natural','Lavado','Honey'],0,'En el natural, la cereza se seca entera.'],
['Intermedio','Control','En un secado con alta humedad ambiental, ¿qué variable exige atención especial?',['Ventilación, espesor de capa y remoción','Solo el color de la cereza','El tamaño de la zaranda'],0,'El manejo de la capa y el movimiento del aire ayudan a evitar secado desigual y mohos.'],
['Avanzado','Riesgos','Un lote desarrolla notas avinagradas intensas y heterogéneas. ¿Qué revisarías primero?',['Registros de tiempo, temperatura, higiene y oxígeno','Solo la variedad','La presión de la máquina espresso'],0,'La investigación debe reconstruir condiciones de fermentación y manejo, sin atribuir una causa única.']],
'Verde':[
['Básico','Defectos','¿Qué caracteriza al grano brocado?',['Orificios producidos por la broca','Una hendidura natural','Una película plateada'],0,'La broca perfora el fruto y deja orificios en el grano.'],
['Intermedio','Calidad','¿Por qué importa la humedad del café verde?',['Afecta estabilidad y almacenamiento','Define por sí sola el sabor','Reemplaza la evaluación de defectos'],0,'La humedad influye en la conservación y debe interpretarse junto con otras variables.'],
['Avanzado','Trazabilidad','Dos lotes tienen apariencia similar, pero distinta historia de almacenamiento. ¿Qué dato es clave recuperar?',['Origen, fechas y condiciones de almacenamiento','Solo el nombre comercial','El color de la taza'],0,'La trazabilidad permite interpretar diferencias y reconstruir el manejo del lote.']],
'Tueste':[
['Básico','Fases','¿Qué suele señalar el primer crack?',['Expansión y ruptura de la estructura del grano','El inicio del secado','El final obligatorio del tueste'],0,'El primer crack está asociado a presión interna y cambios estructurales.'],
['Intermedio','Curva','¿Qué describe el RoR?',['La velocidad de cambio de temperatura','La temperatura final del grano','La pérdida de masa exacta'],0,'RoR expresa la tasa de cambio de temperatura a lo largo del tiempo.'],
['Avanzado','Diagnóstico','Una curva pierde energía y el desarrollo queda apagado. ¿Qué revisarías?',['Transferencia de energía y evolución del RoR','Solo el color del empaque','La dureza del agua de preparación'],0,'Hay que analizar la curva completa y el comportamiento de la máquina; no diagnosticar por un único punto.']],
'Preparación':[
['Básico','Ratio','Con 15 g de café y 240 g de agua, ¿cuál es el ratio?',['1:16','1:12','1:20'],0,'240 dividido 15 es 16.'],
['Intermedio','Extracción','Si el filtrado fluye demasiado rápido y queda poco desarrollado, ¿qué variable probarías primero?',['Molienda algo más fina','Molienda mucho más gruesa','Bajar siempre la dosis a la mitad'],0,'Una molienda más fina suele aumentar la resistencia y el contacto, aunque hay que observar el resultado.'],
['Avanzado','Diseño experimental','Querés saber si la temperatura cambia el resultado. ¿Cómo diseñás la prueba?',['Mantenés constantes las demás variables y cambiás solo temperatura','Cambiás molienda, dosis y temperatura a la vez','Elegís la taza que más te guste sin registrar'],0,'Aislar variables permite atribuir con más criterio las diferencias observadas.']],
'Sensorial':[
['Básico','Percepción','¿Qué diferencia hay entre aroma y sabor?',['Aroma es percepción olfativa; sabor integra gusto y aroma','Son exactamente lo mismo','Sabor solo es dulzor'],0,'El sabor integra sensaciones gustativas y aromáticas, incluida la vía retronasal.'],
['Intermedio','Evaluación','¿Qué busca reducir una cata a ciegas?',['Sesgos por información previa','La acidez de la bebida','La variación natural del café'],0,'Ocultar origen, precio o marca reduce algunas expectativas y sesgos.'],
['Avanzado','Interpretación','Dos cafés tienen el mismo TDS pero se perciben distintos. ¿Qué explicación es más sólida?',['TDS no describe por sí solo composición ni percepción','Uno de los refractómetros necesariamente está roto','El proceso siempre explica toda la diferencia'],0,'TDS mide sólidos disueltos totales; no identifica qué compuestos están presentes ni cómo se perciben.']]
};
/* Respuestas guardadas: solo se conservan las que corresponden a preguntas que existen. */
try {
  const saved = JSON.parse(localStorage.getItem('cl-ch'));
  if (saved && typeof saved === 'object' && !Array.isArray(saved))
    for (const [k, v] of Object.entries(saved)) {
      const [m, l] = k.split('|');
      if (CHBANK[m] && CHBANK[m].some(q => q[0] === l) && Number.isInteger(v) && v >= 0 && v < 3) S.chAnswers[k] = v;
    }
} catch (e) {}
const CH_TOTAL = Object.values(CHBANK).reduce((n, qs) => n + qs.length, 0);
/* Una estación por vez y una pregunta por vez (básico → intermedio → avanzado).
   Al responder: explicación y botón a la pregunta siguiente; al final de una estación, a la siguiente estación. */
const CH_LV = ['Básico', 'Intermedio', 'Avanzado'];
const chDone = m => CH_LV.every(l => S.chAnswers[m + '|' + l] != null);
function des(){const names=Object.keys(CHBANK),li=CH_LV.indexOf(S.chLevel),q=CHBANK[S.chModule].find(x=>x[0]===S.chLevel),key=S.chModule+'|'+S.chLevel,ans=S.chAnswers[key],done=Object.keys(S.chAnswers).length,offset=(names.indexOf(S.chModule)+li)%3,opts=q[3].map((_,i)=>q[3][(i+offset)%3]),correct=(q[4]-offset+3)%3,nextMod=names[names.indexOf(S.chModule)+1],nextLv=CH_LV[li+1];
const next=nextLv?`<button type="button" class="b p" data-a=chlv data-v="${li+1}">Siguiente pregunta</button>`:nextMod?`<button type="button" class="b p" data-a=chmodule data-v="${nextMod}">Seguir con ${nextMod}</button>`:'';
return `<h2>Entrená tu criterio</h2><p class=m>Tres preguntas por estación, de lo básico a lo profesional. Elegí una estación y respondé.</p><div class="seg ch-modules" role="group" aria-label="Estación">${names.map(n=>`<button type="button" data-a=chmodule data-v="${n}" aria-pressed="${S.chModule===n}">${n}${chDone(n)?' ✓':''}</button>`).join('')}</div><div class="stage ch-nav">${viewerNav('chlv',li,3,S.chLevel,'Pregunta',CH_LV.map((l,j)=>S.chAnswers[S.chModule+'|'+l]!=null?j:-1),nextMod?{act:'chmodule',v:nextMod,name:nextMod}:null)}</div><div class="panel quiz ch-question"><div class=k>${q[1]}</div><h3>${q[2]}</h3>${opts.map((o,i)=>`<button class="opt ${ans!=null?(i===correct?'ok':i===ans?'no':''):''}" data-a=chanswer data-v="${i}" ${ans!=null?'disabled':''}>${o}</button>`).join('')}${ans!=null?`<p><b>${ans===correct?'¡Bien!':'No es esa.'}</b> ${q[5]}</p><div class=bar>${next}<button type="button" class=b data-a=chreset>Volver a intentar</button></div>`:''}</div><div class=panel><div class=k>Tu recorrido</div><div class=challenge-progress><i style="width:${Math.round(done/CH_TOTAL*100)}%"></i></div><p class=m>Respondiste ${done} de ${CH_TOTAL} preguntas. Podés volver a cualquiera cuando quieras.</p></div>`}

on({
  /* Al cambiar de estación se arranca por la primera pregunta sin responder; en el celu, la vista va a la pregunta. */
  chmodule: (v, el) => { S.chModule = v; S.chLevel = CH_LV.find(l => S.chAnswers[v + '|' + l] == null) || CH_LV[0]; R(0); viewerFocus(el, '.ch-nav') },
  chlv: (v, el) => { S.chLevel = CH_LV[+v]; R(0); viewerFocus(el, '.ch-nav') },
  chanswer: v => { S.chAnswers[S.chModule + '|' + S.chLevel] = +v; chSave(); R(0) },
  chreset: () => { delete S.chAnswers[S.chModule + '|' + S.chLevel]; chSave(); R(0) }
});
