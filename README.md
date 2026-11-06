# .campus · Academia de Baristas

Campus de formación en café: módulos interactivos (Academia), simuladores y bitácora (Laboratorio), preguntas por nivel (Desafíos) y cursos (Capacitarse).

## Cómo abrirlo

Abrí `index.html` en el navegador. No necesita instalar nada ni un servidor (también funciona servido por cualquier servidor estático).

## Estructura

```
index.html                 página base: carga estilos y scripts en orden
css/campus.css             única hoja de estilos (colores y medidas en :root)
js/core.js                 estado, progreso guardado, acciones (on/onInput), avisos, bloques "Profundizá"
js/academia/
  fruto.js                 módulo 01 · planta y fruto
  poscosecha.js            módulo 02 · procesos, fermentaciones, secado
  verde.js                 módulo 03 · café verde
  tueste.js                módulo 04 · tueste
  preparacion.js           módulo 05 · preparación (también lo usa el Laboratorio)
  sensorial.js             módulo 06 · sensorial
  glosario.js, apuntes.js  contenidos de consulta
  recursos.js              vistas del glosario y los apuntes; palabras del glosario dentro de los pasos (term)
  estaciones.js            recorrido de 6 estaciones y menú de módulos
js/laboratorio.js          simuladores, nuevo registro y bitácora
js/desafios.js             banco de preguntas
js/capacitarse.js          cursos (para agregar uno, sumarlo a CRS)
js/portada.js              portada: presentación o panel personal según el avance
js/app.js                  encabezado, navegación, migas de pan y rutas (#/...)
```

Cada pantalla tiene su dirección (por ejemplo `#/academia/tueste/fases` o `#/laboratorio/bitacora`), así funcionan el botón atrás, recargar y compartir enlaces. La lista completa está al principio de `js/app.js`.

Cada paso de la Academia muestra primero lo esencial para cumplir la consigna (pensado para quien recién empieza). Lo demás va plegado con `deeper(clave, título, html)`, que aparece como "Profundizá: …". Las palabras técnicas se escriben con `term(texto, nombre en el glosario)`: al tocarlas, la definición se abre ahí mismo. Las definiciones simples están en `TERM_PLAIN` (`js/academia/recursos.js`).

El progreso y la bitácora se guardan solo en el navegador de cada persona (`localStorage`).

`CoffeeLab_V23_REPARADO_20261105.html` es la maqueta original, que se conserva como referencia.
