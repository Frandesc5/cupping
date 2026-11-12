# .campus · Academia de Baristas

Campus de formación en café: 6 estaciones interactivas (Academia), simulador y bitácora (Laboratorio), preguntas por estación y nivel (Desafíos) y cursos (Cursos, en la dirección `#/capacitarse`).

## Cómo abrirlo

Abrí `index.html` en el navegador. No necesita instalar nada ni un servidor (también funciona servido por cualquier servidor estático).

## Estructura

```
index.html                 página base: carga estilos y scripts en orden
favicon.svg                ícono de la pestaña
img/                       logo y foto de portada (copias locales)
css/campus.css             hoja de estilos base (colores y medidas en :root)
css/minimal.css            estilo mínimo: se carga después y ajusta la base (una tipografía, sin bordes, color solo en los dibujos)
js/core.js                 estado, progreso guardado, acciones (on/onInput), avisos, bloques "Profundizá", preguntas de repaso (QA)
js/academia/
  fruto.js                 módulo 01 · planta y fruto
  poscosecha.js            módulo 02 · procesos, fermentaciones, secado
  verde.js                 módulo 03 · café verde
  tueste.js                módulo 04 · tueste
  preparacion.js           módulo 05 · preparación (también lo usa el Laboratorio)
  sensorial.js             módulo 06 · sensorial
  glosario.js, apuntes.js  contenidos de consulta
  recursos.js              vistas del glosario y los apuntes; palabras del glosario dentro de los pasos (term)
  estaciones.js            recorrido de 6 estaciones y página de la Academia
  mapa.js                  mapa isométrico de la planta a la taza (islas, insignias y ficha)
js/laboratorio.js          simulador, anotar una preparación y bitácora
js/desafios.js             banco de preguntas
js/capacitarse.js          cursos (para agregar uno, sumarlo a CRS)
js/portada.js              portada: presentación (quien entra por primera vez) o panel personal (quien vuelve)
js/tres.js                 mapa de islas en 3D con three.js; si no carga, queda el SVG de mapa.js
js/app.js                  encabezado, navegación, migas de pan y rutas (#/...)
```

Cada pantalla tiene su dirección (por ejemplo `#/academia/tueste/fases` o `#/laboratorio/bitacora`), así funcionan el botón atrás, recargar y compartir enlaces. La lista completa está al principio de `js/app.js`.

Cada paso de la Academia muestra primero lo esencial para cumplir la consigna (pensado para quien recién empieza). Lo demás va plegado con `deeper(clave, título, html)`, que aparece como "Profundizá: …". Las palabras técnicas se escriben con `term(texto, nombre en el glosario)`: al tocarlas, la definición se abre ahí mismo. Las definiciones simples están en `TERM_PLAIN` (`js/academia/recursos.js`).

## Vocabulario de la interfaz

Para que el sitio no cambie de nombres de una pantalla a otra:

- **Estación**: cada una de las 6 partes de la Academia. No se usa "módulo" ni "unidad" en lo que ve la persona.
- **Paso**: cada pantalla dentro de una estación. **Recorrido**: las 6 estaciones juntas.
- **Desafíos**: solo el espacio del campus. La pregunta que cierra algunos pasos es una **pregunta de repaso**, y la meta de un simulador es un **objetivo**.
- **Bitácora**: la lista del Laboratorio; cada entrada es una **anotación**.

## Cómo se completa un paso

Un paso se completa cuando la persona hace lo que pide su consigna, no al abrirlo. Cada paso de `SC` (`js/academia/estaciones.js`) tiene su `need()`, que devuelve `true` o el texto de lo que falta; ese texto es el que se lee en "Para completar este paso". Al agregar un paso nuevo, hay que darle su `need()` y sumar a `PROGRESS_KEYS` la clave de estado que use, para que el avance se guarde.

Cada pantalla tiene una sola acción principal (botón verde). En los pasos con pregunta de repaso, el botón dice "Responder y seguir".

El progreso y la bitácora se guardan solo en el navegador de cada persona (`localStorage`). Si el navegador no deja guardar, el sitio lo avisa.

`CoffeeLab_V23_REPARADO_20261105.html` es la maqueta original, que se conserva como referencia.
