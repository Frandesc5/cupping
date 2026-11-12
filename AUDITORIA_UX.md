# Auditoría de UX · .campus (Academia de Baristas)

Fecha: 11/11/2026 · Versión auditada: commit `973fbdd`.

## Estado: aplicada el 12/11/2026

Los 38 hallazgos están implementados en el código (sin commitear). Las capturas de `auditoria-ux/` muestran el sitio **antes** de los cambios.

Se verificó con el navegador, en escritorio y celular: los flujos de cada hallazgo (más de 60 comprobaciones), las 23 tareas de paso completando las 6 estaciones de punta a punta, el avance guardado con la versión anterior, y axe-core. Sin errores de consola.

Dónde la implementación se aparta de lo que proponía este documento:

| # | Qué cambió respecto de la propuesta |
|---|---|
| 9 | Madurez arranca en «Inmaduro» y el agua (dureza y alcalinidad) arranca fuera de la zona verde, para que la tarea tenga sentido; esto último también se ve en el Laboratorio. Fallas pide "Tocá las 6 opciones, de «Ideal» a «Subdesarrollo»" y Medir, "Mové los valores hasta sacar el punto de la zona verde y volvé a meterlo". |
| 9 | Quien ya tenía estaciones completas las conserva, con todos sus pasos en ✓. En las estaciones a medias, los pasos que antes se marcaban solos vuelven a quedar pendientes. |
| 17 | La aclaración "El simulador calcula…" aparece solo en Filtrado y Espresso, que son las herramientas que arman una receta. |
| 19 | La comparación se muestra arriba de la lista y la vista sube hasta ella. Además, la bitácora ahora va de la anotación más nueva a la más vieja (antes mostraba primero la más vieja). |
| 21 | En escritorio las tres preguntas se eligen con píldoras ("1 · Fácil", "2 · Intermedia", "3 · Difícil"); las flechas quedan solo en celular. |
| 22, 23 | La tarjeta del curso online lleva directo a la Academia y las de los presenciales, directo al sitio oficial. Las fichas internas siguen existiendo para los enlaces viejos. |
| 24 | El aviso "Las palabras subrayadas se pueden tocar" aparece en el primer paso que tiene palabras subrayadas (Especies no tiene) y se va cuando se toca una. |
| 32 | "Reiniciar mi avance" borra el avance de las estaciones; la bitácora y las respuestas de Desafíos se conservan. |
| 33 | El logo y la foto se copiaron a `img/`. El ícono de pestaña (`favicon.svg`) es un dibujo simple de un grano: conviene reemplazarlo por el de la marca. |
| — | Extra: el botón dorado "Continuar" quedaba ilegible al pasar el mouse (texto oscuro sobre fondo oscuro); corregido. |

Pendiente de revisión por la Academia, porque es contenido:

- Las dos preguntas de repaso nuevas (Anatomía y Perfil), en `js/core.js`.
- Las 59 definiciones simples que se sumaron al glosario, en `js/academia/recursos.js` (`TERM_PLAIN`). Están escritas a partir de la definición técnica de cada término.
- Los textos de ayuda del simulador (`PV` y `EV` en `js/academia/preparacion.js`).
- El hallazgo 23 proponía sumar "Qué vas a aprender" a los cursos presenciales: no se inventó ese contenido.

Sigue sin probarse con lectores de pantalla reales, Safari en iOS y dispositivos físicos.

## Resumen

El sitio tiene una base sólida: cada pantalla tiene su dirección, hay migas de pan, los pasos traen una consigna clara ("Tocá cada especie…"), lo avanzado queda plegado en "Profundizá" y casi no hay errores de accesibilidad automática. El problema no es de calidad visual sino de **orientación**: en varios momentos clave el usuario no sabe cuál es el botón que le toca, qué significa lo que ve o si de verdad avanzó.

Los cinco problemas que más pesan:

1. **El botón para avanzar de paso puede quedar invisible** (teclado, barra de desplazamiento, lector de pantalla). Es el único bloqueo real del recorrido.
2. **Quien vuelve no ve "Continuar"** sin bajar: la presentación de marketing ocupa toda la primera pantalla, en celular y en notebook.
3. **La portada nueva tiene dos botones verdes** que llevan a lugares distintos, más dos accesos a cursos.
4. **El progreso está inflado**: 13 de los 23 pasos se marcan "✓ Paso completo" con solo abrirlos, antes de hacer la consigna.
5. **El vocabulario cambia de pantalla en pantalla** (módulo / estación / unidad; "desafío" significa tres cosas; el mapa nombra lugares y no temas) y el Laboratorio no explica qué se hace ni qué se guarda.

Hay 38 hallazgos: 7 de gravedad alta, 16 media y 15 baja. Al final están los 5 cambios de mayor impacto y el recorrido ideal de los primeros 5 minutos.

## Cómo se hizo

- Lectura de rutas, navegación y componentes: `js/app.js`, `js/core.js`, `js/portada.js`, `js/academia/*.js`, `js/laboratorio.js`, `js/desafios.js`, `js/capacitarse.js`, `css/campus.css`, `css/minimal.css`.
- Sitio levantado en local y recorrido con Playwright sobre Chrome: **41 pantallas** en escritorio (1366×800) y celular (390×780), más una pasada a 320 px de ancho.
- Dos recorridos interactivos completos:
  - **Usuario nuevo**: portada → "Empezar el recorrido" → los 4 pasos de la estación 1 → pregunta → cierre → estación 2.
  - **Usuario que vuelve**: con la estación 1 completa y la 2 empezada → portada → mapa → Laboratorio (guardar una receta) → Desafíos. También el estado "6 de 6".
- Accesibilidad: axe-core (WCAG 2.2 AA) en 19 pantallas × 2 tamaños, orden de tabulación, foco al cambiar de pantalla, diálogos con teclado, tamaños táctiles y de texto.
- Casos de error: ruta inexistente, formulario incompleto, almacenamiento del navegador que falla, búsqueda sin resultados, bitácora vacía.

Capturas de evidencia: carpeta [`auditoria-ux/`](auditoria-ux/) (21 imágenes, citadas en cada hallazgo). Es una carpeta suelta, sin commitear; se puede borrar cuando termine la revisión.

## Lo que ya funciona (para no romperlo)

- **Consigna pegada al control** (`doIt()`): "Tocá cada especie y compará…" justo arriba de los botones. Es lo mejor del sitio.
- **"Profundizá"** separa lo esencial de lo avanzado. Bien pensado para quien recién empieza.
- **Direcciones por pantalla y por paso**: atrás, recargar y compartir funcionan.
- **El pie del paso dice qué falta** ("Para completar este paso: Tocá las 5 capas del fruto (0 de 5)").
- **Cierre de estación** con palabras clave en lenguaje simple y un único botón a la estación siguiente.
- **Formulario de registro**: errores por campo, foco al primer error, "Deshacer" al borrar o limpiar.
- **Base de accesibilidad**: foco visible, enlace "Saltar al contenido", diálogos nativos que devuelven el foco, movimiento reducido respetado, sin desborde horizontal a 320 px. axe solo encontró 3 contrastes menores.
- **Celular**: barra inferior fija con los cuatro espacios y botón flotante con la acción principal en el mapa.

---

## Hallazgos

Formato: **dónde** (pantalla y archivo) · **qué confunde y por qué** · **gravedad** · **solución** con los textos exactos.

### A. Portada

#### 1 · Quien vuelve no ve "Continuar" sin bajar — ALTA

- **Dónde:** Inicio con avance guardado. `js/portada.js` → `personalHome()` (l. 15) llama a `heroHTML()` (l. 155) antes del panel personal.
- **Qué confunde:** la presentación ("Aprendé. Experimentá. Crecé." + foto + "Entrar a la Academia" + "Ver cursos") se repite arriba para todos. El botón "Continuar" queda a 1168 px en un celular de 780 px de alto (una pantalla y media más abajo) y a 876 px en una notebook de 800 px. Lo primero que ve quien vuelve es exactamente lo mismo que vio el primer día, con un botón verde que **no** lo lleva donde dejó sino al mapa. Capturas: `03-portada-vuelve-celular.png`, `04-portada-vuelve-escritorio.png`.
- **Solución:** con avance guardado, no mostrar la presentación. La tarjeta "Seguí donde lo dejaste" pasa a ser lo primero de la página, con el único botón verde.

  Orden propuesto de la portada personal:
  1. Título de página (h1): **"Hola de nuevo"**
  2. Tarjeta: "Seguí donde lo dejaste" · **"Estación 2 · Del fruto al café seco"** · "Paso 1 de 3: Procesos" · botón **"Continuar"**
  3. Avance: "1 de 6 estaciones completas" + enlace chico **"Ver el mapa"**
  4. "Para reforzar lo que viste"
  5. Cursos presenciales (como está)

#### 2 · Portada nueva: dos botones verdes y cuatro acciones que compiten — ALTA

- **Dónde:** Inicio sin avance. `js/portada.js` → `heroHTML()` (l. 160), `nextStep()` (l. 138–141), `campusHome()` (l. 179).
- **Qué confunde:** hay dos botones principales con destinos distintos: "Entrar a la Academia" (va al mapa) y, más abajo, "Empezar el recorrido" (va a la estación 1). Además "Ver cursos" al lado del primero y "Conocé los cursos" al final. En celular solo se ve el primero; "Empezar el recorrido", que es el correcto para alguien nuevo, queda debajo de la foto. Alguien que no sabe nada de café no puede saber cuál de los dos es "el suyo". Capturas: `01-portada-nueva-celular.png`, `02-portada-nueva-escritorio.png`.
- **Solución:** un solo botón verde arriba, que lleve directo a la estación 1. El mapa pasa a enlace secundario y los cursos quedan solo en la franja del final.

  | Elemento | Ahora | Propuesto |
  |---|---|---|
  | Párrafo | "El campus de la Academia de Baristas: estaciones para entender el café de la planta a la taza, un laboratorio para probar recetas y desafíos para poner a prueba tu criterio." | "Aprendé café desde cero, paso a paso y a tu ritmo. Son 6 estaciones interactivas, de la planta a la taza. No hace falta saber nada antes." |
  | Botón principal | "Entrar a la Academia" | **"Empezar por la estación 1"** → `#/academia/fruto` |
  | Botón secundario | "Ver cursos" | Enlace de texto: **"Ver el mapa de las 6 estaciones"** → `#/academia` |
  | Debajo de los botones | — | "Tu avance queda guardado en este dispositivo." |
  | Bloque "¿Primera vez en .campus?" | Título + párrafo + "Empezar el recorrido" | Eliminarlo: ya quedó resuelto arriba. |
  | Franja final | "Conocé los cursos" | Se mantiene; es el único acceso a cursos de la portada. |

#### 3 · Las tarjetas de los cuatro espacios no dicen qué hacer en cada uno ni en qué orden — MEDIA

- **Dónde:** Inicio, "Un recorrido. Cuatro espacios." `js/portada.js` → `campusHome()` (l. 167–177). En celular esta sección no se muestra (`css/campus.css` l. 867).
- **Qué confunde:** los textos son abstractos ("Diseñá pruebas, ajustá variables y analizá resultados", "Poné a prueba tu criterio profesional"), los cuatro enlaces dicen "Explorar" y los íconos son símbolos sin significado (◉ ⌁ ◇ ▤, distintos de los de la barra de abajo del celular). "Criterio profesional" asusta a quien recién empieza. Y en celular, el usuario nuevo nunca recibe la explicación de qué es cada espacio.
- **Solución:** un verbo por espacio, el orden sugerido, y los mismos íconos de la barra inferior (`SPACE_ICONS` en `js/app.js`). Mostrarlas también en celular, en una columna compacta.

  | Espacio | Título | Texto | Enlace |
  |---|---|---|---|
  | Academia | "1 · Aprendé" | "6 estaciones interactivas, de la planta a la taza. Empezá por acá." | "Ir a la Academia" |
  | Laboratorio | "2 · Practicá" | "Armá recetas en el simulador y anotá los cafés que preparás." | "Ir al Laboratorio" |
  | Desafíos | "3 · Ponete a prueba" | "Preguntas cortas sobre cada estación, de fácil a difícil." | "Ir a Desafíos" |
  | Cursos | "4 · Seguí en persona" | "Cursos presenciales con el equipo de la Academia." | "Ver cursos" |

#### 4 · "medite en Desafíos" se lee como otra palabra — BAJA

- **Dónde:** Inicio sin avance. `js/portada.js` l. 140.
- **Qué confunde:** "medite" (medirse) se lee como "meditar" en usted.
- **Solución:** "Aprendé en la Academia, practicá en el Laboratorio y ponete a prueba en Desafíos."

#### 5 · "Seguí donde lo dejaste" apunta a la última estación que se abrió, aunque solo se haya espiado — MEDIA

- **Dónde:** Inicio y mapa. `js/academia/estaciones.js` → `suggestedStation()` (l. 352) y `enterStation()` (l. 303).
- **Qué confunde:** abrir cualquier estación desde el mapa la convierte en "donde lo dejaste". Si alguien que va por la estación 2 mira un segundo la 6 por curiosidad, la portada pasa a decir "Seguí donde lo dejaste · Estación 6" y el mapa mueve el "Estás acá". Además, con solo abrir una estación la portada ya dice "Ya empezaste el recorrido" y la lista del curso online la marca "En curso".
- **Solución:** una estación cuenta como "empezada" recién cuando se completa al menos un paso con tarea (ver hallazgo 9). Si la última abierta no tiene nada hecho, "Continuar" va a la primera estación incompleta en orden.

### B. Vocabulario y arquitectura (transversal)

#### 6 · La misma cosa tiene varios nombres — ALTA

- **Dónde:** todo el sitio.
- **Qué confunde:** el usuario tiene que deducir que son lo mismo:

  | Concepto | Nombres que aparecen hoy | Dónde |
  |---|---|---|
  | Cada una de las 6 partes | "estación", "módulo", "unidad" | "Recorré las estaciones" (mapa) · "Módulos del origen a la taza", "Casos por módulo y nivel" (`portada.js` l. 78) · "Programa por unidades" (`capacitarse.js` l. 14) |
  | La estación 1 | "La planta y el fruto", "Fruto", "La finca", "Estación 1" | título · tira de estaciones y Desafíos · mapa · encabezado |
  | La estación 2 | "Del fruto al café seco", "Poscosecha", "El beneficio" | ídem |
  | El espacio de cursos | "Cursos", "Capacitarse", "Cursos y formación" | menú · dirección `#/capacitarse` · título |
  | Lo que se guarda en el Laboratorio | "registro", "preparación", "prueba", "bitácora", "biblioteca de preparaciones" | `laboratorio.js` l. 31–37 |

- **Solución:** fijar un glosario de interfaz y usarlo siempre:
  - **Estación** = cada una de las 6 partes. Eliminar "módulo" y "unidad" de lo que ve el usuario.
  - **Paso** = cada pantalla dentro de una estación.
  - **Recorrido** = las 6 estaciones juntas.
  - Cada estación tiene **un nombre** (el título) y el lugar del mapa es un dato secundario: "Estación 2 · Del fruto al café seco" y, en chico, "El beneficio".
  - **Bitácora** = la lista; **anotación** = cada entrada ("Anotar una preparación", "3 anotaciones").

  Cambios puntuales:

  | Dónde | Ahora | Propuesto |
  |---|---|---|
  | `portada.js` l. 78 | "Módulos del origen a la taza" | "6 estaciones, de la planta a la taza" |
  | `portada.js` l. 78 | "Casos por módulo y nivel" | "Preguntas por estación y nivel" |
  | `capacitarse.js` l. 14 | "Programa por unidades" | "Programa por estaciones" |
  | Tira de estaciones y Desafíos | "Verde" | "Café verde" |
  | `laboratorio.js` l. 37 | "Tu biblioteca de preparaciones" | "Tu bitácora" |

#### 7 · "Desafío" significa tres cosas distintas — ALTA

- **Dónde:** `js/academia/estaciones.js` l. 16 y 151 · `js/academia/preparacion.js` l. 14 y 23 · espacio Desafíos.
- **Qué confunde:** (a) **Desafíos** es uno de los cuatro espacios; (b) dentro de un paso, "Falta el desafío" es una pregunta que aparece en una ventana; (c) en Receta, "Desafío: llevá el ratio a 1:16" es un objetivo del simulador, y ese mismo texto aparece también en el Laboratorio. Cuando el paso dice "Después vas a responder un desafío", es razonable pensar que hay que ir al espacio Desafíos. Así se rompe justo la distinción que el sitio necesita: Academia / Laboratorio / Desafíos.
- **Solución:** "Desafíos" queda solo para el espacio.

  | Dónde | Ahora | Propuesto |
  |---|---|---|
  | `estaciones.js` l. 16 (`QUIZ_LATER`) | "Después vas a responder un desafío." | "Al final hay una pregunta de repaso." |
  | `estaciones.js` l. 16 (`QUIZ_MISS`) | "Falta el desafío: se abre con el botón de abajo." | "Respondé la pregunta de repaso." |
  | `estaciones.js` l. 151 (ventana) | "Desafío · Anatomía" | "Pregunta de repaso · Anatomía" |
  | `preparacion.js` l. 14 | "Desafío: llevá el ratio a 1:16" / "¡Ratio 1:16 logrado!" | "Objetivo: llegá a 1:16" / "✓ Llegaste a 1:16" |
  | `preparacion.js` l. 23 | "Desafío: 1:2 en 25–35 s (punto de partida habitual)" | "Objetivo: 1:2 en 25 a 35 segundos" |
  | `estaciones.js` l. 67 | "Lográ el desafío del ratio. Pista: …" | "Llegá al ratio objetivo. Pista: 15 g de café con 240 g de agua dan 1:16." |

### C. Academia: el mapa

#### 8 · El mapa nombra lugares, no temas, y no numera las estaciones — MEDIA

- **Dónde:** `#/academia`. `js/academia/mapa.js` → `MAP_PLACES` (l. 280) y `mapWorld()` (l. 335, etiqueta `.map-name`).
- **Qué confunde:** las etiquetas dicen "La finca", "El beneficio", "El puerto", "La tostadora", "La barra", "La mesa de cata". Quien no sabe de café no puede adivinar que "El puerto" es la estación sobre café verde ni qué es "el beneficio". El tema recién aparece al tocar la isla. Tampoco hay números, así que el orden solo se deduce del camino de baldosas. Capturas: `05-mapa-escritorio.png`, `06-mapa-celular-completo.png`.
- **Solución:** etiqueta de dos líneas con número y tema; el lugar queda como ambientación.

  | Ahora | Propuesto (línea 1 / línea 2 chica) |
  |---|---|
  | "La finca" | "1 · La planta y el fruto" / "La finca" |
  | "El beneficio" | "2 · Del fruto al café seco" / "El beneficio, donde se procesa" |
  | "El puerto" | "3 · El café verde" / "El puerto" |
  | "La tostadora" | "4 · El tueste" / "La tostadora" |
  | "La barra" | "5 · La preparación" / "La barra" |
  | "La mesa de cata" | "6 · La experiencia sensorial" / "La mesa de cata" |

  Y en el encabezado del mapa, para quien todavía no empezó: en lugar de "Llevás 0 de 6." → **"Son 6 estaciones. Empezá por la primera."**

### D. Academia: estaciones y pasos

#### 9 · 13 de los 23 pasos se marcan "✓ Paso completo" con solo abrirlos — ALTA

- **Dónde:** todas las estaciones. `js/academia/estaciones.js` → `SC` (l. 17–83) y `stepMissing()` (l. 90): un paso sin `need()` está completo apenas se abre.
- **Qué confunde:** al entrar a "Especies", el círculo ya tiene ✓ y el pie dice "✓ Paso completo" antes de leer nada, mientras la consigna en negrita pide "Tocá cada especie y compará…". Consigna y progreso se contradicen. Pasa en Especies, Altitud, Madurez, Fermentaciones, Clasificar, Humedad y densidad, Tamaño y origen, Fallas, Agua, Molienda, Medir, Rueda y Cata. Resultado: se puede "completar" tres cuartos de una estación tocando solo "Ir a…", y la barra "X de 6 estaciones completas" deja de significar algo. Captura: `07-paso-recien-abierto-ya-completo.png`.
- **Solución:** que cada paso se complete cuando se hace lo que pide su consigna (el código ya registra varias de estas acciones, como `phSeen` y `faSeen`). Tres estados visibles en la línea de pasos: sin abrir (número), abierto (número con aro) y completo (✓).

  Texto de "Para completar este paso" en cada caso:

  | Paso | Texto |
  |---|---|
  | Especies | "Tocá las dos especies (1 de 2)." |
  | Altitud | "Mové la altitud hasta una zona baja y una zona alta." |
  | Madurez | "Deslizá la maduración hasta «Maduro»." |
  | Fermentaciones | "Tocá los 5 tipos de fermentación (1 de 5)." |
  | Clasificar | "Probá las 3 muestras (1 de 3)." |
  | Humedad y densidad | "Mové la humedad y la masa de la muestra." |
  | Tamaño y origen | "Tocá las 5 etapas del camino del lote (1 de 5)." |
  | Fallas | "Tocá las 6 curvas (1 de 6)." |
  | Agua | "Llevá la dureza y la alcalinidad a la zona verde." |
  | Molienda | "Mové el punto de molienda por los 5 tamaños (1 de 5)." |
  | Medir | "Mové el TDS hasta sacar el punto de la zona verde y volvé a meterlo." |
  | Rueda | "Elegí una familia y un sabor concreto." |
  | Cata | "Recorré las 6 etapas de la cata (1 de 6)." |

  Si se prefiere no exigir tanto, la alternativa mínima es no mostrar "✓ Paso completo" en los pasos sin tarea: usar **"Paso visto"** y un círculo sin ✓.

#### 10 · El botón para avanzar puede quedar invisible — ALTA

- **Dónde:** pie de todos los pasos. `js/academia/estaciones.js` l. 188–224 (`markUserScroll`, `revealFoot`, `checkFoot`) y `css/campus.css` l. 513–514 (`.step-foot.will-reveal { opacity: 0 }`).
- **Qué confunde:** el recuadro con "Paso completo" y el botón "Ir a…" arranca con opacidad 0 y solo aparece si se detecta rueda del mouse, dedo o flechas/espacio dentro de los últimos 1,5 s. Verificado con el navegador:
  - **Solo con Tab**: a los 22 tabs el foco cae en "Ir a Altitud", pero el botón (y su aro de foco) sigue invisible. La persona ve un hueco en blanco. Captura: `08-pie-invisible-con-teclado.png`.
  - **Desplazamiento sin gesto** (probado moviendo la página por script, que genera los mismos eventos que arrastrar la barra de desplazamiento): el recuadro queda en opacidad 0 aunque esté en pantalla. No hay forma de avanzar a la vista.
  - Lo mismo aplica a lectores de pantalla y a quien llega con "buscar en la página".
- **Solución:** que la animación nunca dependa de un gesto. Mostrar el recuadro cuando entra en pantalla (IntersectionObserver, sin la condición `Date.now() - userScrollAt < 1500`) y, como red de seguridad, `#step-foot:focus-within { opacity: 1; transform: none }`. Si se quiere lo más simple: quitar `will-reveal` y dejarlo siempre visible.

#### 11 · "Ir a Curva" o "Terminar la estación" abren una pregunta que nadie anunció — MEDIA

- **Dónde:** pasos con pregunta (Anatomía, Procesos, Secado, Fases, Perfil). `js/academia/estaciones.js` → `stepFootHTML()` l. 176.
- **Qué confunde:** el botón dice "Terminar la estación" o "Ir a Curva", pero al tocarlo se abre una ventana con una pregunta. El aviso previo ("Falta el desafío: se abre con el botón de abajo") no nombra el botón y usa "desafío" (ver hallazgo 7). Un botón que dice una cosa y hace otra le saca confianza a todos los demás. Captura: `09-boton-terminar-abre-pregunta.png`.
- **Solución:** que el botón diga lo que hace.

  | Estado | Ahora | Propuesto |
  |---|---|---|
  | Botón con pregunta pendiente (hay paso siguiente) | "Ir a Curva" | **"Responder y seguir"** |
  | Botón con pregunta pendiente (último paso) | "Terminar la estación" | **"Responder y terminar la estación"** |
  | Lista de pendientes | "Falta el desafío: se abre con el botón de abajo." | "Respondé la pregunta de repaso." |

#### 12 · Las preguntas de repaso evalúan cosas que el paso no mostró — MEDIA

- **Dónde:** `js/core.js` → `QA` (l. 35–41).
- **Qué confunde:**
  - **Anatomía** pregunta "¿Qué se retira durante el despulpado?". El despulpado se enseña en la estación 2; en Anatomía solo aparece dentro de "Ampliar explicación técnica" de la capa Pulpa.
  - **Perfil** pregunta por un instrumento que mide concentración; ese tema está en "Profundizá: medir la concentración de la bebida", plegado.
  - La explicación de la respuesta incorrecta usa "trillado", que todavía no se explicó.

  Para alguien nuevo, la primera pregunta del sitio es sobre algo que no vio. Captura: `10-pregunta-respuesta-incorrecta.png`.
- **Solución:** que cada pregunta salga de lo que el paso muestra sin abrir nada.

  | Clave | Propuesta |
  |---|---|
  | `c` (Anatomía) | Pregunta: **"¿Qué parte del fruto es lo que después llamamos grano de café?"** Opciones: "Las semillas" (correcta) · "La pulpa" · "La piel". Explicaciones: "Correcto: las semillas son los granos. Son verdes hasta que se tuestan." · "La pulpa es la parte carnosa que rodea las semillas; se saca durante el proceso." · "La piel es la cubierta de afuera; también se saca." |
  | `s` (Perfil) | Pregunta: **"Un café tiene acidez 5 y amargor 1. ¿Qué te dice eso?"** Opciones: "Que es muy ácido y poco amargo" (correcta) · "Que es un café malo" · "Que tiene poca cafeína". Explicaciones: "Correcto: el perfil describe cuánto se siente cada atributo, no si el café es bueno o malo." · "El perfil describe, no califica. Un café muy ácido puede gustarte mucho o poco." · "El perfil habla de lo que sentís en la boca, no de la cafeína." |

#### 13 · Si la respuesta es incorrecta, no se puede reintentar y la correcta se distingue solo por color — MEDIA

- **Dónde:** ventana de la pregunta. `js/academia/estaciones.js` → `quizDlgHTML()` (l. 151) y `quizAns` (l. 337).
- **Qué confunde:** al errar, las opciones se bloquean, el paso cuenta como completo y la respuesta correcta queda marcada solo con un fondo verde claro (la incorrecta, rosado). No hay ✓ ni ✗, ni se dice cuál era. En el espacio Desafíos, en cambio, sí existe "Volver a intentar". Captura: `10-pregunta-respuesta-incorrecta.png`.
- **Solución:**
  - Agregar ícono y texto a las opciones: "✓ Las semillas — correcta" / "✗ La pulpa — tu respuesta".
  - Mensaje al errar: **"No es esa. La correcta es «{opción}»."** + la explicación.
  - Botones al errar: **"Probar de nuevo"** (principal) y **"Seguir igual"**.
  - Mismo criterio en Desafíos (`.opt.ok` / `.opt.no` en `js/desafios.js` l. 52).

#### 14 · "Recorrido completo" felicita por 6 de 6 sin haberlas completado — MEDIA

- **Dónde:** `#/academia/recorrido-completo`. `js/app.js` l. 45, `js/academia/estaciones.js` → `completeView()` (l. 291) y `finHTML()` (l. 379, "6/6" fijo).
- **Qué confunde:** la pantalla no verifica nada. Se llega escribiendo la dirección, pero también por el camino normal: quien completa solo la estación 6 ve en su cierre el botón "Terminar el recorrido" y aterriza en "Camino completado · Recorriste las seis estaciones ✓✓✓✓✓✓ · 6/6" con contadores en "0/5" y "0". Verificado. Además "Repetir desde la estación 1" no reinicia nada. Captura: `19-recorrido-completo-sin-completar.png`.
- **Solución:**
  - En el cierre de la estación 6, si quedan estaciones pendientes: botón **"Ir a la estación que te falta: {nombre}"** en lugar de "Terminar el recorrido".
  - En `recorrido-completo` sin las 6 completas: título **"Te faltan {n} estaciones"**, la lista con ✓ solo en las completas y botón **"Continuar con {nombre}"**.
  - "Repetir desde la estación 1" → **"Repasar desde la estación 1"** (deja claro que no borra el avance).

#### 15 · Tueste · Curva: "−140,0 °C · Sube por minuto" — BAJA

- **Dónde:** `#/academia/tueste/curva`. `js/academia/tueste.js` l. 13.
- **Qué confunde:** al abrir el paso, el dato dice que la temperatura "sube" −140 °C por minuto. Un número negativo bajo la etiqueta "Sube" desorienta. Captura: `16-tueste-curva.png`.
- **Solución:** etiqueta **"Cambio por minuto (RoR)"**. Con valor negativo mostrar **"Baja 140 °C por minuto"**; con positivo, **"Sube 12 °C por minuto"**.

#### 16 · El cierre de la estación no invita a practicar lo recién visto — BAJA

- **Dónde:** `#/academia/<estación>/repaso`. `js/academia/estaciones.js` → `recapView()` (l. 276).
- **Qué confunde:** nada grave; se pierde el mejor momento para conectar Academia con Desafíos. Hoy esa conexión solo aparece en la portada.
- **Solución:** debajo de los dos botones, un enlace de texto: **"¿Querés practicar? Hay 3 preguntas sobre esta estación en Desafíos."**

### E. Laboratorio

#### 17 · No se entiende qué se hace en el Laboratorio ni qué se guarda — ALTA

- **Dónde:** `#/laboratorio`. `js/laboratorio.js` → `lab()` (l. 32), `workTabs()` (l. 31), `prefillFromLab()` (l. 90).
- **Qué confunde:**
  - La entrada promete "cambiá una variable por vez y mirá qué pasa", pero el filtrado tiene 10 controles y la lectura solo muestra el ratio y los tiempos de vertido. Temperatura, molienda y agitación no cambian ningún número. La aclaración "No se predicen TDS, rendimiento ni sabor" está al final de la página.
  - El botón verde "Guardar en la bitácora" está desde el primer segundo (flotante en celular, donde además tapa parte de la mesa). No queda claro si se guarda una simulación o un café real, y el formulario pide "Nombre del café".
  - En **Agua, Molienda y TDS** el botón sigue ahí y guarda una receta de V60 de 20 g / 240 g / 93 °C que la persona nunca tocó. Verificado.
  - En el Laboratorio aparece "Desafío: llevá el ratio a 1:16", heredado de la Academia.
  - Los simuladores son los mismos de la estación 5; la diferencia entre ambos lugares no se explica.

  Capturas: `11-laboratorio-celular.png`, `12-laboratorio-escritorio.png`.
- **Solución:** decir para qué sirve cada parte y mostrar "Guardar" solo cuando hay una receta.

  | Elemento | Ahora | Propuesto |
  |---|---|---|
  | Bajada | "Probá recetas, cambiá una variable por vez y mirá qué pasa. Cuando algo te sirva, guardalo en tu bitácora." | "Acá practicás con tus recetas. Armá una en el simulador para ver sus números y anotá en la bitácora los cafés que preparás de verdad." |
  | Pestaña 1 | "Simulador · Probá y ajustá variables" | "Simulador · Armá una receta" |
  | Pestaña 2 | "Nuevo registro · Guardá una preparación" | "Anotar · Un café que preparaste" |
  | Pestaña 3 | "Bitácora (0) · Historial y comparaciones" | "Mi bitácora (0) · Tus anotaciones" |
  | Arriba del simulador | — (aviso al final) | "El simulador calcula el ratio, los vertidos y los tiempos. No predice el sabor: eso lo descubrís preparando la receta." |
  | Etiqueta del panel | "Área seleccionada" | "Estás usando" |
  | Resultado | "Lectura en vivo" | "Tu receta ahora" |
  | Texto bajo el ratio (solo Laboratorio) | "Desafío: llevá el ratio a 1:16" | "1:12 · más concentrado que el 1:16 de referencia" (o "más suave", según el caso) |
  | Botón guardar (Filtrado y Espresso) | "Guardar en la bitácora" | "Guardar esta receta" |
  | Botón guardar (Agua, Molienda, TDS) | "Guardar en la bitácora" | No mostrarlo. |
  | Instrumento | "TDS" | "Medir (TDS)", igual que el paso "Medir" de la Academia |

#### 18 · El formulario de anotación abruma al venir del simulador — MEDIA

- **Dónde:** `#/laboratorio/nuevo-registro`. `js/laboratorio.js` → `recordForm()` (l. 33–36).
- **Qué confunde:** al llegar desde "Guardar", "Más detalles" se abre solo con 14 campos, más 6 deslizadores sensoriales y las notas: en celular son unas 4,5 pantallas hasta el botón "Guardar registro", cuando lo único que falta es el nombre del café. "Agua o bebida (g)" y, más abajo, "Masa de bebida (g)" parecen el mismo dato. "Limpiar" está pegado a "Guardar". Captura: `13-nuevo-registro-celular.png`.
- **Solución:**
  - Al venir del simulador, dejar "Más detalles" cerrado y avisar arriba: **"Cargamos la receta del simulador. Poné el nombre del café y guardala."** El resumen del plegable: **"Más detalles (9 ya cargados)"**.
  - Etiqueta según el método: V60 y otros → **"Agua (g) *"**; Espresso → **"Bebida en la taza (g) *"**.
  - "Masa de bebida (g)" → **"Bebida obtenida (g)"** con ayuda: "Sirve para calcular el rendimiento. Si no la pesaste, dejalo vacío."
  - Título: "Guardá una preparación" → **"Anotá una preparación"**. Botón: "Guardar registro" → **"Guardar en mi bitácora"**.
  - "Limpiar" como enlace de texto, separado del botón principal.

#### 19 · Bitácora: "Comparar" no responde y no se puede corregir una anotación — MEDIA

- **Dónde:** `#/laboratorio/bitacora`. `js/laboratorio.js` → `recordHistory()` (l. 37), acción `bcmp` (l. 161).
- **Qué confunde:** al tocar "Comparar" lo único que cambia es el texto del botón ("Quitar comparación"). Nada dice que hay que elegir dos; con una sola anotación, el botón no sirve para nada. Tampoco existe "Editar": un error de tipeo se arregla duplicando y borrando. Detalles: "ratio 1:12,0" (sobra el decimal) y "Molino 0 clics" cuando nunca se cargó ese dato. Captura: `18-bitacora-comparar-con-un-registro.png`.
- **Solución:**
  - Botón: "Comparar" → **"Elegir para comparar"** / "Quitar comparación" → **"Quitar de la comparación"**.
  - Con una elegida, aviso fijo arriba de la lista: **"Elegiste 1 de 2. Tocá «Elegir para comparar» en otra anotación."**
  - Con una sola anotación, ocultar el botón y mostrar: **"Guardá otra preparación para poder comparar."**
  - Agregar **"Editar"**. "Duplicar como nueva prueba" → **"Repetir esta receta"**.
  - Ratio sin decimal cuando es entero ("1:12"); no mostrar "Molino 0 clics" si el valor es 0.

#### 20 · Si el navegador no puede guardar, el sitio igual dice "✓ Registro guardado" — MEDIA

- **Dónde:** `js/laboratorio.js` → `bsv()` (l. 10) y `quickSave` (l. 158): el error que escribe `bsv()` se pisa en la línea siguiente. En `js/core.js` l. 23, `sv()` falla en silencio.
- **Qué confunde:** con el almacenamiento bloqueado o lleno (modo privado, navegador de una app, disco lleno), la anotación aparece en la lista y sale el aviso de éxito, pero se pierde al recargar. Verificado. Con el avance de la Academia pasa lo mismo, sin ningún aviso.
- **Solución:** si guardar falla, quedarse en el formulario y mostrar: **"No pudimos guardar en este navegador. Puede estar en modo privado o sin espacio. Tus datos siguen en pantalla: copialos antes de salir."** Para el avance, un aviso único: **"Este navegador no permite guardar tu avance. Podés seguir, pero se pierde al cerrar la pestaña."**

### F. Desafíos

#### 21 · La pantalla no se presenta como "Desafíos" ni se relaciona con lo aprendido — MEDIA

- **Dónde:** `#/desafios`. `js/desafios.js` → `des()` (l. 50–52).
- **Qué confunde:**
  - El menú dice "Desafíos" y el título visible es "Entrená tu criterio".
  - Las 18 preguntas están abiertas para cualquiera. Quien entra primero acá (está a un toque en la barra de abajo) recibe "¿Qué estructura está inmediatamente por debajo de la piel de la cereza?" sin ninguna pista de que eso se aprende en la Academia.
  - Hay tres maneras de moverse (píldoras de estación, flechas ‹ › con "Básico · Pregunta 1 de 3", y el botón "Siguiente pregunta").
  - El ✓ de la píldora y "Respondiste 1 de 18" cuentan respuestas dadas, no correctas.
  - "Volver a intentar" aparece también cuando la respuesta fue correcta.

  Captura: `14-desafios-celular.png`.
- **Solución:**

  | Elemento | Ahora | Propuesto |
  |---|---|---|
  | Título | "Entrená tu criterio" | "Desafíos" |
  | Bajada | "Tres preguntas por estación, de lo básico a lo profesional. Elegí una estación y respondé." | "Preguntas para practicar lo que viste en la Academia. Hay 3 por estación: fácil, intermedia y difícil." |
  | Píldoras | "Fruto ✓", "Verde" | "1 · Fruto 2/3", "3 · Café verde 0/3" (aciertos sobre 3) |
  | Estación sin completar | — | Aviso sobre la pregunta: "Todavía no hiciste esta estación. Podés responder igual o **ir a la estación** primero." |
  | Avance | "Respondiste 1 de 18 preguntas. Podés volver a cualquiera cuando quieras." | "Respondiste 1 de 18 · 1 correcta." |
  | Botón tras acertar | "Volver a intentar" | No mostrarlo. Tras errar: "Probar de nuevo". |
  | Niveles | "Básico / Intermedio / Avanzado" con flechas | Dejar las flechas solo en celular y que el botón "Siguiente pregunta" sea el camino principal. |

### G. Cursos

#### 22 · "Fundamentos del café (online)" es la Academia presentada como otro curso — MEDIA

- **Dónde:** `#/capacitarse` y `#/capacitarse/fundamentos-online`. `js/capacitarse.js` → `CRS` (l. 10) y `cap()` (l. 22–25).
- **Qué confunde:** el primer "curso" son las mismas 6 estaciones. Quien ya las está haciendo cree que hay otro contenido. La ficha no tiene botón principal (hay que tocar una fila del programa), dice "Duración: 6 estaciones interactivas" (no es una duración) y la lista "Qué incluye" muestra 5 de 7 ítems como "próximamente" (Objetivos, Videos, Material descargable, Evaluaciones, Certificado), lo que hace ver al producto como incompleto. Captura: `15-curso-online.png`.
- **Solución:**

  | Elemento | Ahora | Propuesto |
  |---|---|---|
  | Tarjeta, modalidad | "Online autónomo" | "Online · a tu ritmo" |
  | Tarjeta, título | "Fundamentos del café (online)" | "Fundamentos del café" |
  | Tarjeta, detalle | "6 estaciones interactivas" | "Son las 6 estaciones de la Academia de este campus" |
  | Tarjeta, enlace | "Ver el curso" | "Ir a la Academia" (o "Continuar: Estación 2" si hay avance) |
  | Ficha, datos | "Nivel: Principiante · Duración: 6 estaciones interactivas" | "Nivel: principiante · 6 estaciones interactivas" |
  | Ficha, botón principal | — | "Empezar" / "Continuar: Estación 2 · Paso 1" |
  | Estado de cada fila | "En curso" apenas se abre | "Empezar" / "En curso" (con al menos un paso hecho) / "✓ Completa" |
  | "Qué incluye" | 7 ítems, 5 "próximamente" | Solo lo que existe: "Incluye: 6 estaciones interactivas, glosario, apuntes y seguimiento de tu avance." Y una línea chica: "Más adelante: videos, material descargable, evaluaciones y certificado." |
  | Curso intensivo | "Nivel: Consultar en el sitio" | Omitir el nivel si no está definido. |

#### 23 · Los cursos presenciales no dan ningún dato para decidir — BAJA

- **Dónde:** `#/capacitarse/barista-profesional` y `curso-intensivo`. `js/capacitarse.js` l. 24.
- **Qué confunde:** la ficha es una línea de datos y un párrafo que deriva al sitio. Es una pantalla intermedia que no agrega nada.
- **Solución:** sumar 3 o 4 líneas de "Qué vas a aprender" y "Para quién es" (contenido a definir por la Academia), o enlazar la tarjeta directo al sitio con el texto **"Ver fechas e inscripción ↗"**.

### H. Glosario, apuntes y términos técnicos

#### 24 · Las palabras con definición casi no se distinguen del resto del texto — MEDIA

- **Dónde:** dentro de los pasos. `css/minimal.css` l. 95 (`.term { text-decoration-color: var(--line-strong) }`), `css/campus.css` l. 555.
- **Qué confunde:** las palabras que abren su definición ("mucílago", "ratio", "TDS") tienen el mismo color gris del párrafo y un subrayado punteado gris muy claro (#d9d9d5 sobre blanco: contraste 1,4:1). El mecanismo pensado para explicar la jerga es, en la práctica, invisible. En celular, además, el área táctil mide 26 px de alto. Captura: `21-palabra-del-glosario-en-el-paso.png`.
- **Solución:** texto en color principal (`--ink`), subrayado punteado en `--terra` (el que ya define `campus.css`) y un "?" chico al lado. En el primer paso de la estación 1, una línea de ayuda: **"Las palabras subrayadas se pueden tocar: te muestran qué significan."**

#### 25 · El glosario define en difícil lo que los pasos explican en fácil — MEDIA

- **Dónde:** `#/academia/glosario`. `js/academia/recursos.js` → `glossaryView()` (l. 5) usa `GLOSSARY`; los pasos y el cierre usan `TERM_PLAIN` (l. 29–65).
- **Qué confunde:** el mismo término tiene dos definiciones. En el paso, *refractómetro* es "Instrumento que mide el TDS de una bebida a partir de unas gotas". En el glosario: "Instrumento que estima índice de refracción y permite calcular TDS con calibración adecuada". Quien toca "Ver en el glosario" para entender mejor recibe una versión más difícil.
- **Solución:** en el glosario, mostrar primero la versión simple y debajo la técnica, con el rótulo **"Definición técnica"**. Completar `TERM_PLAIN` para los términos que hoy solo tienen versión técnica (el glosario tiene 94 y hay 35 versiones simples).

#### 26 · En celular, el glosario y los apuntes están al final del mapa — MEDIA

- **Dónde:** `#/academia` en celular. `js/academia/estaciones.js` → `academyMenu()` (l. 368).
- **Qué confunde:** "Para consultar: el glosario y los apuntes" aparece después de las seis islas, más de dos pantallas más abajo, como texto con dos enlaces de 26 px de alto. Fuera de ahí no hay otro acceso directo. Captura: `06-mapa-celular-completo.png`.
- **Solución:** dos botones chicos debajo del título del mapa, visibles sin bajar: **"Glosario"** y **"Apuntes"**. "Próximamente: 8 temas más" puede quedarse al final.

#### 27 · Términos técnicos sin explicar — MEDIA

- **Dónde:** varios pasos y, sobre todo, el Laboratorio (donde las ayudas son más técnicas que en la Academia).
- **Solución:** textos propuestos.

  | Dónde | Ahora | Propuesto |
  |---|---|---|
  | Lab · Filtrado (`preparacion.js` l. 6) | "Bloom (× dosis)" · "Agua inicial para mojar el café y dejar salir gas; se suele usar un múltiplo de la dosis." | "Primer mojado (bloom)" · "Un poco de agua al principio para mojar el café y dejar salir el gas. Se mide en veces la dosis: 2× con 20 g de café son 40 g de agua." |
  | ídem | "Caudal de vertido" · "Gramos de agua por segundo. Cambia el tiempo de vertido y la turbulencia del lecho." | "Velocidad de vertido" · "Cuántos gramos de agua echás por segundo. Más rápido: el vertido dura menos y el café se mueve más." |
  | ídem | "Remoción / agitación" · "Puede modificar el mojado, la transferencia de masa y el flujo." | "Agitación" · "Revolver o mover el café mientras se prepara. Ayuda a que se moje parejo." |
  | ídem | "…cómo interactúa con la cama de café." | "…cómo pasa por el café molido." |
  | Lab · Espresso (`preparacion.js` l. 16) | "Peso de bebida (yield)" | "Bebida en la taza" |
  | ídem | "Fuerza al agua a atravesar el puck." | "Empuja el agua a través del café prensado (la pastilla, o *puck*)." |
  | ídem | "Compactado (tamping)" | "Prensado del café (tamping)" |
  | Fermentaciones (esquema) | "Microbiota nativa" · "Materia prima → Actividad microbiana → Metabolitos" | "Microbios del propio fruto" · "Fruto → Levaduras y bacterias → Aromas y ácidos nuevos" |
  | Madurez (`fruto.js` l. 31) | "más azúcares solubles (Brix)" | "más azúcares" (Brix ya se explica en Profundizá) |
  | Agua y Medir | "la SCA" | "la SCA (Asociación de Cafés de Especialidad)" la primera vez |
  | Pregunta de Anatomía (`core.js` l. 36) | "El pergamino se retira después, en el trillado, sobre café seco." | "El pergamino se saca más adelante, cuando el café ya está seco. Ese paso se llama trillado." |
  | Estación 1 · Anatomía (`fruto.js` l. 22) | "Ampliar explicación técnica" | "Profundizá: explicación técnica" (mismo patrón que el resto) |

#### 28 · Los apuntes cambian de tono sin avisar — BAJA

- **Dónde:** `#/academia/apuntes`. `js/academia/apuntes.js`, `recursos.js` → `theoryView()` (l. 6).
- **Qué confunde:** después de pasos escritos en lenguaje llano, el apunte que se ofrece al cerrar la estación 1 arranca con "Objetivo de aprendizaje. Reconocer la estructura del fruto de Coffea… de la familia Rubiaceae" y sigue por unos 7000 caracteres. Para alguien nuevo es un salto brusco.
- **Solución:** avisar el nivel. Bajada de la página: **"Lecturas más largas y técnicas, para cuando quieras ir a fondo. No hacen falta para completar las estaciones."** En el cierre de estación: "Leer el apunte: La cereza y la semilla" → **"Lectura avanzada: La cereza y la semilla"**.

### I. Estados vacíos, de carga y de error

No hay estados de carga que revisar: el sitio es estático y cada pantalla se dibuja al instante. Lo único que llega de afuera son la tipografía, el logo y la foto de portada.

#### 29 · Una dirección que no existe lleva a la portada sin decir nada — BAJA

- **Dónde:** `js/app.js` → `showRoute()` l. 85.
- **Qué confunde:** un enlace mal copiado o viejo (`#/academia/tostado`) muestra la portada como si nada. Quien lo recibió de otra persona no sabe que el enlace falló.
- **Solución:** aviso breve al redirigir: **"No encontramos esa página. Te trajimos al inicio."**

#### 30 · Glosario sin resultados: pantalla en blanco — BAJA

- **Dónde:** `#/academia/glosario`. `js/academia/recursos.js` → `filterGlossary()` (l. 89).
- **Qué confunde:** buscar "capuchino" deja "0 términos encontrados" y nada más. Captura: `17-glosario-sin-resultados.png`.
- **Solución:** **"No encontramos «capuchino». Probá con otra palabra o con una categoría, como «tueste» o «medición»."** + botón **"Ver todos los términos"**.

#### 31 · Bitácora vacía: falta el segundo camino — BAJA

- **Dónde:** `#/laboratorio/bitacora`. `js/laboratorio.js` l. 37.
- **Qué confunde:** el texto ofrece dos opciones ("Probá una receta en el simulador y guardala, o cargá un registro a mano") pero solo hay botón para la primera.
- **Solución:** título **"Tu bitácora está vacía"**, texto **"Acá vas a ver los cafés que anotes. Podés armar una receta en el simulador o anotar una preparación que ya hiciste."**, botones **"Ir al simulador"** y **"Anotar una preparación"**.

#### 32 · El avance vive solo en este navegador y casi no se avisa — BAJA

- **Dónde:** `js/core.js` l. 21–23. El aviso solo está en la portada nueva (`portada.js` l. 140) y en la ficha del curso online.
- **Qué confunde:** quien empieza en el celular y sigue en la computadora encuentra todo en cero, sin explicación. Tampoco hay manera de reiniciar el avance.
- **Solución:** una línea en la portada personal y en el mapa: **"Tu avance se guarda solo en este navegador."** Y un enlace **"Reiniciar mi avance"** con confirmación: **"¿Borrar tu avance en las 6 estaciones? La bitácora no se borra."** Botones: "Borrar avance" / "Cancelar".

#### 33 · Sin ícono de pestaña, sin mensaje si falta JavaScript y con imágenes de otro sitio — BAJA

- **Dónde:** `index.html`; `js/app.js` l. 18–19 (`LOGO`, `HERO_PHOTO`).
- **Qué confunde:** el navegador pide `/favicon.ico` y recibe un 404, así que la pestaña queda sin ícono y cuesta reencontrarla. Sin JavaScript la página queda en blanco. El logo y la foto se cargan desde academiadebaristas.com.ar: si ese sitio cambia una dirección, el encabezado del campus se rompe.
- **Solución:** agregar favicon; un `<noscript>` con **"Este campus necesita JavaScript para funcionar. Activalo en tu navegador y recargá la página."**; copiar el logo y la foto al repositorio.

### J. Celular y accesibilidad

#### 34 · Textos chicos — BAJA

- **Dónde:** `css/campus.css` l. 877 (barra inferior, 12 px), etiquetas de la línea de pasos (12 px), categorías del glosario y varios `.m` (12,8 px), tabla de Clasificar (11,5 px), leyenda de la curva de tueste (11,5 px).
- **Qué confunde:** son los textos que orientan (dónde estoy, qué paso es) y están en el tamaño más chico del sitio.
- **Solución:** mínimo 13 px para etiquetas de navegación y 14 px para cualquier texto que se lea como frase.

#### 35 · El texto que explica cada paso está en gris, como si fuera secundario — BAJA

- **Dónde:** primer párrafo de cada paso (`<p class=m>`), objetivo de la estación (`.station-goal`).
- **Qué confunde:** la frase que enseña ("Casi todo el café que se toma en el mundo viene de dos especies de planta") tiene el estilo de una nota al pie. El contraste pasa AA (≈5:1 sobre blanco), pero la jerarquía dice "esto no importa".
- **Solución:** usar el color principal (`--ink`) para el párrafo de introducción del paso y dejar el gris para aclaraciones y notas.

#### 36 · Contrastes por debajo de AA — BAJA

- **Dónde (axe-core):**
  - "próximamente" en la ficha del curso online: #7d807a sobre #f5f5f3, 3,67:1 (`.soon span`).
  - Leyenda "RoR (°C/min)" de la curva: #b5602d sobre #f5f5f3, 4,11:1 con 11,5 px.
  - Subrayado de los términos (hallazgo 24): 1,4:1.
- **Solución:** oscurecer a `--muted` (#6e6e6a) o más; para la leyenda, #8f4a20.

#### 37 · Áreas táctiles chicas en celular — BAJA

- **Dónde:** migas de pan (37 px de alto), deslizadores del perfil sensorial en el formulario (28 px), términos del glosario (26 px), enlaces "glosario" y "apuntes" del mapa (26 px), enlaces del tipo "te falta: Procesos" (20 px).
- **Solución:** mínimo 44 px de alto en migas y deslizadores (alcanza con `padding`), y convertir en botones los enlaces del mapa (hallazgo 26).

#### 38 · Al cambiar de pantalla, el lector de pantalla anuncia la sección y no la pantalla — BAJA

- **Dónde:** `js/app.js` → `focusHeading()` (l. 106): toma el primer `h1, h2`, que es el `h1` oculto ("Academia").
- **Qué confunde:** al entrar a cualquier estación, el foco cae en "Academia" en vez de "La planta y el fruto". En el mismo sentido, los granos de "Grados" se llaman los tres "Grano sin ordenar" y los de "Defectos", "Grano 1 de la bandeja": sin vista no se pueden resolver.
- **Solución:** llevar el foco al `h2` visible de la pantalla. En "Grados", nombrar el color: "Grano claro", "Grano medio", "Grano oscuro" (el ejercicio sigue siendo ordenar). En "Defectos", sumar el rasgo visible: "Grano 3: negro", "Grano 7: con orificio".

---

## Resumen por gravedad

| # | Hallazgo | Gravedad |
|---|---|---|
| 1 | Quien vuelve no ve "Continuar" sin bajar | Alta |
| 2 | Portada nueva: dos botones verdes y cuatro acciones | Alta |
| 6 | La misma cosa tiene varios nombres | Alta |
| 7 | "Desafío" significa tres cosas | Alta |
| 9 | Pasos que se completan con solo abrirlos | Alta |
| 10 | El botón para avanzar puede quedar invisible | Alta |
| 17 | Laboratorio: no se entiende qué se hace ni qué se guarda | Alta |
| 3 | Tarjetas de los cuatro espacios | Media |
| 5 | "Seguí donde lo dejaste" apunta a lo último abierto | Media |
| 8 | El mapa nombra lugares, no temas | Media |
| 11 | Botones que abren una pregunta sin avisar | Media |
| 12 | Preguntas sobre contenido que no se mostró | Media |
| 13 | Respuesta incorrecta: sin reintento, solo color | Media |
| 14 | "Recorrido completo" sin completar | Media |
| 18 | Formulario de anotación abrumador | Media |
| 19 | Bitácora: comparar y editar | Media |
| 20 | Falso "guardado" cuando el navegador no guarda | Media |
| 21 | Desafíos: título, contexto y avance | Media |
| 22 | El curso online duplica la Academia | Media |
| 24 | Términos con definición casi invisibles | Media |
| 25 | Glosario más difícil que los pasos | Media |
| 26 | Glosario y apuntes escondidos en celular | Media |
| 27 | Términos técnicos sin explicar | Media |
| 4, 15, 16, 23, 28–38 | Textos, estados vacíos, detalles de accesibilidad | Baja |

---

## Los 5 cambios de mayor impacto

1. **Una sola acción principal en la portada, según quién entra** (hallazgos 1, 2, 3).
   Nuevo: un botón, "Empezar por la estación 1". Vuelve: la tarjeta "Seguí donde lo dejaste" arriba de todo, sin la presentación. Es el cambio que más reduce la duda de "¿y ahora qué hago?" y solo toca `js/portada.js`.

2. **El botón para avanzar, siempre visible** (hallazgo 10).
   Quitar la dependencia del gesto en el pie del paso. Es chico de hacer y hoy bloquea a quien usa teclado, lector de pantalla o la barra de desplazamiento.

3. **Progreso honesto** (hallazgos 9, 14, 5).
   Un paso se completa cuando se hace su consigna; "Recorrido completo" solo con las 6 estaciones; "Continuar" no se desvía por una estación que se espió. Sin esto, la barra de avance y los ✓ no le dicen nada al usuario.

4. **Un solo vocabulario** (hallazgos 6, 7, 8, 11).
   "Estación" y "paso" en todos lados; "Desafíos" solo para el espacio y "pregunta de repaso" dentro de los pasos; el mapa con número y tema; botones que dicen lo que hacen ("Responder y seguir"). Son casi todos cambios de texto.

5. **Un Laboratorio que explica para qué sirve** (hallazgos 17, 18, 19).
   Bajada y pestañas nuevas, la aclaración de qué calcula el simulador arriba, "Guardar esta receta" solo en Filtrado y Espresso, y un formulario que al venir del simulador pide únicamente el nombre del café.

---

## Recorrido ideal: los primeros 5 minutos de un usuario nuevo

Persona: nunca preparó café de especialidad, entra desde el celular por un enlace de Instagram.

**0:00 — Portada.** Lee "Aprendé café desde cero, paso a paso y a tu ritmo. Son 6 estaciones interactivas, de la planta a la taza. No hace falta saber nada antes." Ve un solo botón verde: **"Empezar por la estación 1"**. Lo toca. No tuvo que elegir entre Academia, Laboratorio, Desafíos y Cursos.

**0:15 — Estación 1, paso 1 (Especies).** Arriba: "Estación 1 de 6 · La planta y el fruto" y la línea de pasos con el 1 marcado como actual, sin ✓. Lee una frase en negro: "Casi todo el café que se toma en el mundo viene de dos especies de planta." Debajo, la consigna: "Tocá cada especie y compará dónde crece y cómo es en la taza." Una línea le avisa: "Las palabras subrayadas se pueden tocar: te muestran qué significan."

**0:45 — Hace la consigna.** Toca "Coffea canephora (robusta)". Abajo aparece "✓ Paso completo" y el botón **"Ir a Altitud"**. El ✓ aparece porque hizo algo, y lo ve aparecer.

**1:00 a 2:30 — Altitud y Madurez.** Mueve dos deslizadores. En cada paso: una frase, una consigna, un ✓ al cumplirla y un único botón verde hacia adelante. "Volver a…" queda como botón gris.

**2:30 — Anatomía.** Toca "Separar capas" y recorre las 5 capas con las flechas; el contador sube "3 de 5". Toca "mucílago" y lee: "Capa pegajosa y dulce que envuelve la semilla". El pie le dice qué falta: "Respondé la pregunta de repaso." El botón dice **"Responder y terminar la estación"**.

**3:30 — Pregunta de repaso.** "¿Qué parte del fruto es lo que después llamamos grano de café?" Elige "La pulpa". Lee: "✗ No es esa. La correcta es «Las semillas»: son verdes hasta que se tuestan." Toca **"Probar de nuevo"**, acierta y toca **"Ver lo que aprendiste"**.

**4:00 — Cierre de la estación.** "Terminaste «La planta y el fruto». Llevás 1 de 6 estaciones." Cinco palabras clave con definiciones de una línea. Un botón verde: **"Ir a la estación 2 · Del fruto al café seco"**. Debajo, en chico: "¿Querés practicar? Hay 3 preguntas sobre esta estación en Desafíos."

**4:30 — Cierra la pestaña.** No hace falta que haga nada: el avance quedó guardado en ese navegador.

**Al volver, al otro día.** Lo primero que ve es **"Hola de nuevo"** y la tarjeta "Seguí donde lo dejaste · Estación 2 · Del fruto al café seco · Paso 1 de 3: Procesos", con el botón **"Continuar"**. Un toque y está de nuevo donde dejó.

En esos 5 minutos nunca tuvo que decidir entre dos botones del mismo peso, nunca vio un ✓ que no se ganó y aprendió la diferencia entre los espacios en el momento en que le servía: primero la Academia, y Desafíos recién cuando tenía algo para practicar.

---

## Anexo: evidencia

Capturas en [`auditoria-ux/`](auditoria-ux/):

| Archivo | Muestra | Hallazgo |
|---|---|---|
| `01-portada-nueva-celular.png` | Primera pantalla del usuario nuevo en celular | 2 |
| `02-portada-nueva-escritorio.png` | Portada nueva completa | 2, 3 |
| `03-portada-vuelve-celular.png` | Portada de quien vuelve: "Continuar" después de la presentación | 1 |
| `04-portada-vuelve-escritorio.png` | Ídem en escritorio | 1 |
| `05-mapa-escritorio.png` | Mapa con el panel lateral | 8 |
| `06-mapa-celular-completo.png` | Mapa completo en celular; glosario al final | 8, 26 |
| `07-paso-recien-abierto-ya-completo.png` | "Especies" con ✓ al abrir y el hueco donde va el pie | 9, 10 |
| `08-pie-invisible-con-teclado.png` | Foco en "Ir a Altitud", botón invisible | 10 |
| `09-boton-terminar-abre-pregunta.png` | "Terminar la estación" con la pregunta pendiente | 7, 11 |
| `10-pregunta-respuesta-incorrecta.png` | Respuesta incorrecta: solo color, sin reintento | 12, 13 |
| `11-laboratorio-celular.png` | Laboratorio en celular con el botón flotante | 17 |
| `12-laboratorio-escritorio.png` | Simulador de filtrado completo | 17, 27 |
| `13-nuevo-registro-celular.png` | Formulario al venir del simulador | 18 |
| `14-desafios-celular.png` | Desafíos tras responder | 21 |
| `15-curso-online.png` | Ficha del curso online | 22 |
| `16-tueste-curva.png` | "−140,0 °C · Sube por minuto" | 15 |
| `17-glosario-sin-resultados.png` | Búsqueda sin resultados | 30 |
| `18-bitacora-comparar-con-un-registro.png` | "Comparar" con una sola anotación | 19 |
| `19-recorrido-completo-sin-completar.png` | "Recorriste las seis estaciones" con 0 completas | 14 |
| `20-mapa-vuelve-celular.png` | Mapa de quien vuelve: "Estás acá" y "Continuar: Procesos" | (funciona bien) |
| `21-palabra-del-glosario-en-el-paso.png` | Términos subrayados y definición abierta | 24 |

Qué no se probó: lectores de pantalla reales (NVDA, VoiceOver, TalkBack), Safari en iOS y dispositivos físicos. Los hallazgos 10 y 38 conviene confirmarlos ahí.
