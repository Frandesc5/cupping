/* ============================================================
   Desafíos · preguntas por módulo y nivel
   CHBANK[módulo] = [[nivel, tema, pregunta, opciones, índice correcto, explicación], ...]
   ============================================================ */

Object.assign(S, { chModule: 'Fruto', chLevel: 'Básico', chAnswers: {} });
/* Las respuestas se guardan en este navegador para no perder el avance al recargar. */
try { S.chAnswers = JSON.parse(localStorage.getItem('cl-ch')) || {} } catch (e) {}
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
function des(){let names=Object.keys(CHBANK),arr=CHBANK[S.chModule],q=arr.find(x=>x[0]===S.chLevel),key=S.chModule+'|'+S.chLevel,ans=S.chAnswers[key],done=Object.keys(S.chAnswers).length,offset=(names.indexOf(S.chModule)+['Básico','Intermedio','Avanzado'].indexOf(S.chLevel))%3,opts=q[3].map((_,i)=>q[3][(i+offset)%3]),correct=(q[4]-offset+3)%3;return `<div class=k>03 / DESAFÍOS</div><h2>Entrená tu criterio</h2><p class=m>Casos y preguntas organizados por módulo. Empezá por fundamentos y avanzá hacia decisiones profesionales.</p><div class=workspace-tabs>${names.map(n=>`<button data-a=chmodule data-v="${n}" aria-pressed="${S.chModule===n}">${n}</button>`).join('')}</div><div class=level-tabs>${['Básico','Intermedio','Avanzado'].map(n=>`<button class=chip data-a=chlevel data-v="${n}" aria-pressed="${S.chLevel===n}">${n}</button>`).join('')}</div><div class=challenge-meta><span>${S.chModule}</span><span>${S.chLevel}</span><span>${done} ${done===1?'respuesta realizada':'respuestas realizadas'}</span></div><div class="panel quiz"><div class=k>${q[1]}</div><h3>${q[2]}</h3>${opts.map((o,i)=>`<button class="opt ${ans!=null?(i===correct?'ok':i===ans?'no':''):''}" data-a=chanswer data-v="${i}" ${ans!=null?'disabled':''}>${o}</button>`).join('')}${ans!=null?`<p><b>${ans===correct?'Correcto.':'Revisemos el criterio.'}</b> ${q[5]}</p><button class="b p" data-a=chreset>Volver a intentar</button>`:`<p class=m>Elegí una respuesta para ver la explicación.</p>`}</div><div class=panel><div class=k>Tu recorrido</div><div class=challenge-progress><i style="width:${Math.round(done/18*100)}%"></i></div><p class=m>${done} de 18 combinaciones módulo / nivel respondidas. Podés volver a cada una cuando quieras.</p></div>`}

on({
  chmodule: v => { S.chModule = v; R(0) },
  chlevel: v => { S.chLevel = v; R(0) },
  chanswer: v => { S.chAnswers[S.chModule + '|' + S.chLevel] = +v; chSave(); R(0) },
  chreset: () => { delete S.chAnswers[S.chModule + '|' + S.chLevel]; chSave(); R(0) }
});
