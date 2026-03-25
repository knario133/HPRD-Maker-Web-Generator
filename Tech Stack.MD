# Tech Stack

**Documento de Arquitectura Tecnológica y Producto: Generador Web de Harmonic Pin Ring Drive**

---

## 1. Resumen ejecutivo
Tras evaluar las necesidades geométricas, matemáticas y de usabilidad del producto, el equipo recomienda un stack basado estrictamente en **HTML5, CSS3 y JavaScript Puro (Vanilla JS)**. Se descarta el uso de jQuery y frameworks modernos para garantizar cero dependencias, ejecución local inmediata y máxima compatibilidad con flujos de desarrollo asistidos por IA (*vibecoding*). La arquitectura se basará en una estricta separación de responsabilidades (patrón MVC adaptado) y el uso de **SVG** para la representación geométrica, permitiendo alta precisión y futura exportabilidad a software CAD.

---

## 2. Análisis del tipo de producto
* **Qué tipo de sistema es:** Es una calculadora visual determinista. Un conjunto de entradas numéricas (parámetros) genera un conjunto de salidas exactas (dimensiones, tolerancias) y una representación gráfica 2D.
* **Qué exige técnicamente:** Alta precisión de coma flotante, recálculo instantáneo al cambiar un valor, y un renderizado geométrico exacto que coincida con las matemáticas subyacentes.
* **Qué no necesita:** Enrutamiento complejo (routers), gestión de estados globales masivos (Redux), llamadas a APIs externas o bases de datos relacionales.
* **Riesgos de sobrecomplicar:** Si se fuerza una arquitectura SPA pesada, el proyecto requerirá herramientas de compilación (Webpack, Vite), rompiendo la premisa de "abrir el HTML y usar" que adoran los makers.
* **Riesgos de diseño básico/desordenado:** Si no se estructura bien, el código terminará como "código espagueti" donde la función que dibuja un engranaje también calcula su radio y lee el valor del input, haciendo imposible su mantenimiento o evolución.

---

## 3. Comparativa: JavaScript Puro vs jQuery

### Opción A: HTML + CSS3 + JavaScript Puro (Vanilla JS)
* **Ventajas:** Cero dependencias, rendimiento nativo, uso de estándares modernos (`document.querySelector`, `ES6 modules`). Es extremadamente predecible para una IA generativa.
* **Desventajas:** Requiere escribir un poco más de código para delegación de eventos complejos o animaciones muy específicas (aunque no es el caso principal aquí).
* **Facilidad para vibecoding:** **Alta.** Los LLM actuales escriben Vanilla JS moderno con una tasa de error muy baja y no se confunden con versiones obsoletas de librerías.
* **Cuándo conviene:** En la inmensa mayoría de los proyectos web modernos orientados a herramientas locales y rápidas.

### Opción B: HTML + CSS3 + JavaScript + jQuery
* **Ventajas:** Sintaxis concisa para manipular el DOM (`$('#id').val()`).
* **Desventajas:** Añade peso innecesario. Históricamente fomenta el acoplamiento fuerte entre la vista (HTML) y la lógica de negocio.
* **Facilidad para vibecoding:** **Media/Baja.** La IA puede mezclar sintaxis moderna de JS con jQuery, generando código inconsistente.
* **Cuándo conviene:** Proyectos *legacy* o cuando se depende fuertemente de plugins del ecosistema de jQuery. No aplica para este producto.

---

## 4. Stack frontend recomendado
**Nuestra recomendación unánime es la Opción A: JavaScript Puro (Vanilla JS).**

* **Para el MVP:** Vanilla JS con módulos ES6 nativos (`<script type="module">`). Es la forma más limpia de aislar la matemática de la interfaz sin requerir *bundlers*.
* **Para iteraciones futuras:** El código modular en JS puro es trivial de portar a TypeScript si el proyecto crece desmesuradamente en el futuro, pero funciona perfecto por sí solo.
* **Por qué descartamos jQuery:** El DOM moderno ya posee APIs simples y directas. Introducir jQuery solo para leer valores de formularios o cambiar clases CSS es un antipatrón actual y ensucia el contexto para el *vibecoding*.

---

## 5. Decisiones de frontend (Arquitectura Sugerida)
Para evitar el caos, implementaremos una arquitectura modular basada en el patrón de Separación de Responsabilidades:

* **Estructura del HTML:** Semántico. Agrupado por paneles lógicos (Inputs, Resultados, Lienzo). Se usarán atributos `data-*` para vincular elementos del DOM con el estado.
* **Organización del CSS3:** Uso de variables CSS (Custom Properties) para temas y colores. Layout basado en CSS Grid para la estructura principal y Flexbox para los componentes internos.
* **Organización del JS:** Dividido en tres pilares:
    1.  **Lógica Matemática (`math.js`):** Funciones puras. Reciben números, retornan números o un objeto con coordenadas. No tocan el DOM jamás.
    2.  **Renderizado (`renderer.js`):** Recibe datos calculados y se encarga exclusivamente de manipular y dibujar en la pantalla (SVG/DOM).
    3.  **Controlador (`app.js`):** Escucha los eventos del HTML (ej. `input.addEventListener`), llama a `math.js`, pasa los resultados a la vista de resultados y llama a `renderer.js` para actualizar el gráfico.

---

## 6. Tecnología para visualización geométrica
Evaluamos Canvas 2D, SVG y DOM tradicional. **La recomendación absoluta es SVG generada dinámicamente vía JavaScript.**

* **Por qué SVG:** SVG es geometría vectorial declarativa. Los parámetros de un reductor cicloidal se traducen perfectamente a nodos `<path>`, `<circle>` y `<line>`.
* **Ventaja para Makers:** Un SVG generado en el navegador puede ser descargado directamente con un botón (exportar a `.svg`) e importado nativamente en Fusion 360 como un *Sketch* utilizable. Canvas 2D no permite esto de forma directa sin vectorización.
* **Limitaciones:** Si el mecanismo tuviera miles de partes móviles animándose a 60 FPS, SVG sufriría caídas de rendimiento. Sin embargo, para visualizar engranajes estáticos o con animaciones simples de unas pocas docenas de pines, su rendimiento es perfecto.

---

## 7. Estrategia de cálculos y validaciones
* **Funciones puras:** Toda fórmula (como el cálculo de la relación de reducción) debe vivir en una función aislada y testeable.
* **Objeto de Estado:** Se mantendrá un objeto `State` central que contiene los valores actuales de la aplicación.
* **Restricciones:** Antes de realizar cálculos complejos, una función de validación verificará las reglas geométricas (ej. diferencia de dientes válida). Si falla, se interrumpe el flujo y se envía un mensaje de error a la UI.
* **Precisión:** Utilizar el objeto `Math` de JS manteniendo la máxima precisión de coma flotante en los cálculos internos. Solo se redondeará (`toFixed(3)` o similar) al momento de imprimir los datos en pantalla para el usuario.

---

## 8. Persistencia frontend recomendada
* **Inmediatez:** Usar `localStorage`. Cada vez que el usuario modifica un valor válido, se guarda un JSON *stringificado* en el almacenamiento local. Al recargar la página, la herramienta recupera el último mecanismo diseñado.
* **Compartir configuraciones:** Implementar una función para exportar/importar el estado de las variables como un archivo `.json`. Es simple de hacer en Vanilla JS y permite a los usuarios compartir sus diseños sin requerir backend.

---

## 9. Despliegue recomendado
* **Plataforma:** GitHub Pages.
* **Por qué:** Es gratuito, se integra directamente con el repositorio donde vive el código, admite HTML/CSS/JS estático nativamente y fomenta la cultura open-source de la comunidad Maker.
* **Ejecución local:** Al no tener backend ni procesos de compilación (*build step*), el usuario simplemente puede clonar el repositorio, hacer doble clic en el archivo `index.html` y funcionará perfectamente offline.

---

## 10. Estructura de proyecto sugerida

```text
/harmonic-generator
│
├── index.html          # Interfaz de usuario (Layout, inputs, contenedores)
├── style.css           # Estilos visuales (Blueprint theme, grids)
│
├── /js
│   ├── app.js          # Controlador principal (Event listeners, init)
│   ├── state.js        # Gestión del estado global y localStorage
│   ├── math.js         # Motor matemático (Funciones puras, cinemática)
│   ├── geometry.js     # Generación de coordenadas y paths SVG para perfiles
│   └── renderer.js     # Manipulación del DOM para pintar resultados y el gráfico
│
└── /assets
    └── icon.svg        # Íconos o logos

## 11. Riesgos y advertencias
* **Acoplamiento DOM-Lógica:** El mayor riesgo en Vanilla JS. Si lees el valor de un input dentro de la misma función que calcula la hipocicloide, el código se volverá inmantenible rápidamente.
* **Crecimiento descontrolado de `app.js`:** Si no se estructuran bien los módulos ES6, el archivo principal se volverá gigantesco. Las responsabilidades deben aislarse estrictamente.
* **Precisión de perfiles dentados:** Generar la envolvente exacta de un *pin-ring* requiere iteraciones matemáticas. Si el algoritmo de paso es muy grande, la visualización será "dentada" o poligonal en lugar de una curva suave.
* **Falta de feedback visual en errores:** Si el usuario ingresa una combinación físicamente imposible, el sistema no debe romperse silenciosamente. Debe existir un manejo de errores visible en la UI.

---

## 12. Recomendaciones de buenas prácticas (Conclusión)
La clave del éxito para esta herramienta radica en la **disciplina modular**. Al adoptar Vanilla JS, obtenemos libertad total y un entorno ligero, pero asumimos la responsabilidad de mantener el orden arquitectónico. 

Para asegurar que un asistente de IA pueda iterar y expandir el código en el futuro (*vibecoding*), es imperativo nombrar las variables con exactitud técnica (`teethInternal`, `pinDiameter`, `rotorMajorAxis`) en lugar de usar abreviaturas genéricas (`t1`, `pd`, `rma`). Asimismo, se deben documentar en los comentarios de `math.js` las ecuaciones exactas que rigen el modelo. 

Al aislar el motor matemático y usar SVG para la salida visual, lograremos una herramienta potente, predecible, gratuita de alojar y de inmenso valor para la comunidad CAD y de impresión 3D.
