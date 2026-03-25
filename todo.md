# Implementation Breakdown: Generador Web de Harmonic Pin Ring Drive

Este documento desglosa paso a paso la implementación del frontend para el generador de engranajes Harmonic-Pin-Ring, basándose exclusivamente en el `PRD.MD` y `Tech Stack.MD`. Sirve como guía de trabajo ejecutable.

---

## 1. Estructura base del proyecto

### 1.1. Setup Inicial
- **Objetivo de la feature:** Crear el esqueleto de directorios y archivos base del proyecto en Vanilla JS, sin frameworks ni bundlers.
- **Dependencias:** Ninguna.
- **Archivos involucrados:**
  - `index.html`
  - `style.css`
  - `js/app.js`
  - `js/state.js`
  - `js/math.js`
  - `js/geometry.js`
  - `js/renderer.js`
  - `assets/icon.svg`
- **Paso a paso de implementación:**
  1. Crear la carpeta raíz `/harmonic-generator` (o usar la actual).
  2. Crear archivo `index.html` con estructura HTML5 base y vincular `style.css`.
  3. Importar `js/app.js` en `index.html` como un módulo ES6 (`<script type="module" src="js/app.js"></script>`).
  4. Crear la carpeta `js/` y dentro de ella crear `app.js`, `state.js`, `math.js`, `geometry.js` y `renderer.js`.
  5. Crear la carpeta `assets/` para íconos/logos.
- **Criterios de terminado:** Los archivos existen, están vinculados correctamente y no arrojan errores 404 en la consola del navegador.
- **Riesgos o advertencias:** Evitar agregar dependencias como jQuery o package.json. Todo debe ser Vanilla JS puro.


## 2. Layout general

### 2.1. Maquetado de Interfaz Blueprint
- **Objetivo de la feature:** Crear un layout que imite el estilo visual de diseño técnico o "Blueprint", dividido en 3 grandes secciones: Controles, Resultados, y Visualización.
- **Dependencias:** Estructura base del HTML (`index.html`).
- **Archivos involucrados:** `index.html`, `style.css`
- **Paso a paso de implementación:**
  1. En `index.html`, crear un contenedor principal con CSS Grid.
  2. En `style.css`, definir variables globales para colores técnicos (ej. `--bg-blueprint: #003366; --line-color: #e0f2fe;`).
  3. Crear una columna izquierda con Flexbox y dividirla en: un Panel Superior para "Controles y Ajustes" y un Panel Inferior para "Resultados numéricos".
  4. Crear una columna central/derecha que ocupará el "Lienzo de previsualización 2D".
- **Criterios de terminado:** Interfaz adaptable (responsive) con diseño azul técnico, dividida visiblemente en tres zonas.
- **Riesgos o advertencias:** Evitar que el panel izquierdo oculte el SVG en resoluciones móviles, considerar flex-wrap o media queries si fuera necesario.

## 3. Inputs y formularios técnicos

### 3.1. Campos de Entrada (Geometría Base)
- **Objetivo de la feature:** Proveer los campos donde el usuario ingresará los parámetros fundamentales del generador.
- **Dependencias:** Layout del panel izquierdo (`index.html`).
- **Archivos involucrados:** `index.html`, `js/app.js`
- **Paso a paso de implementación:**
  1. En `index.html`, agregar dentro del "Panel de Controles" un input numérico para $Z_i$ (Dientes Corona Interna) con `data-input="zi"`.
  2. Agregar input para $Z_a$ (Dientes Corona Externa) con `data-input="za"`.
  3. Agregar input para $D_p$ (Diámetro del Pin en mm) con `data-input="dp"`.
  4. Agregar input para $P$ (Paso de Engranajes) con `data-input="p"`.
  5. En `js/app.js`, crear una función `initInputs()` que agregue event listeners tipo 'input' a estos campos para desencadenar recálculos.
- **Criterios de terminado:** Se capturan en JS correctamente los valores de estos 4 inputs sin hacer peticiones externas.
- **Riesgos o advertencias:** Asegurar de transformar el valor de los inputs de cadena a número flotante (`parseFloat`) para no causar errores en `math.js`.

### 3.2. Configuración de Tolerancias para Impresión 3D
- **Objetivo de la feature:** Incorporar un panel secundario de inputs para compensar la contracción/expansión del material impreso (PETG, PLA, etc).
- **Dependencias:** Inputs base listos.
- **Archivos involucrados:** `index.html`, `js/app.js`
- **Paso a paso de implementación:**
  1. En `index.html`, debajo de los inputs base, agregar un section "Tolerancias 3D".
  2. Agregar un input step de `0.01` para "Holgura del Pin" (`PinClearance`).
  3. Agregar un input step de `0.01` para "Juego entre dientes" (`ToothClearance`).
  4. Incorporar un icono de tooltip (HTML/CSS) en las tolerancias indicando que "se sugieren 0.15mm extra para FDM".
- **Criterios de terminado:** Los valores de tolerancias están presentes en la interfaz y son leídos por `app.js`.
- **Riesgos o advertencias:** Estos valores son manuales, pero si se ingresan números negativos gigantes podrían generar una geometría invertida incalculable.

## 4. Lógica matemática y Validaciones

### 4.1. Motor Matemático Central (Cinemática y Geometría)
- **Objetivo de la feature:** Calcular todos los parámetros derivados (longitudes, radios, semiejes) desde los 4 inputs de geometría usando funciones puras en Javascript.
- **Dependencias:** Inputs ($Z_i$, $Z_a$, $D_p$, $P$) deben estar listos en la memoria de la UI.
- **Archivos involucrados:** `js/math.js`, `js/app.js`
- **Paso a paso de implementación:**
  1. En `js/math.js`, definir y exportar una función pura que calcule y retorne el número de pines: $N_p = Z_i + 2$.
  2. Implementar una función que calcule y retorne la longitud de arco (TrackLength): $s = N_p \cdot P$.
  3. Implementar funciones que calculen las proporciones de los semiejes del rotor interno: $x/y = Z_i / Z_a$.
  4. Implementar las funciones de relación de reducción para cuando el anillo externo está fijo: Ratio = $Z_i / (Z_a - Z_i)$.
  5. En `js/app.js`, crear el objeto central `State` e integrar los cálculos tras cada evento 'input', poblando un objeto "Kinematics" con resultados redondeados en JS pero usando internamente `Math.PI` o `Math.cos/sin`.
- **Criterios de terminado:** Se ejecutan todas las fórmulas especificadas en la sección 6 del PRD de forma matemática estricta y predecible.
- **Riesgos o advertencias:** Evitar que estas funciones modifiquen variables globales o toquen el DOM, solo deben devolver números calculados.

### 4.2. Reglas de Negocio y Restricciones
- **Objetivo de la feature:** Prevenir y avisar al usuario cuando las combinaciones numéricas generen una colisión matemática o una pieza imposible de ensamblar.
- **Dependencias:** Fórmulas del motor matemático y capturas de UI completadas.
- **Archivos involucrados:** `js/math.js`, `js/app.js`, `index.html`
- **Paso a paso de implementación:**
  1. En `js/math.js`, crear una función validadora `checkConstraints(state)`.
  2. Dentro de esa función, verificar que $Z_a - Z_i$ sea exactamente `4`. Si no lo es, lanzar un error o devolver `{ valid: false, error: 'Diferencia debe ser 4' }`.
  3. Verificar que $Z_i > 40$ como mínimo recomendado. (Warning suave).
  4. Verificar que el diámetro del pin $D_p$ no sea mayor que el paso $P$. Si $D_p > P$, devolver error fuerte: *"El diámetro del pin es demasiado grande para el paso seleccionado"*.
  5. En `js/app.js`, recibir estos errores y renderizarlos en un `<div id="alert-box">` en color rojo dentro de `index.html`.
  6. Implementar "Autocorrección de diferencia": Si el usuario teclea $Z_i = 100$, actualizar automáticamente $Z_a = 104$ y despachar su propio evento de actualización.
- **Criterios de terminado:** El sistema detecta, advierte y corrige errores numéricos instantáneamente antes de enviar el cálculo final a graficar.
- **Riesgos o advertencias:** Asegurarse de detener el flujo de renderizado 2D (canvas/svg) si `valid === false` para no causar un loop infinito o divisiones por cero en el motor de dibujo.

## 5. Visualización geométrica

### 5.1. Generación y renderizado de SVG
- **Objetivo de la feature:** Dibujar una versión estilizada (azul/blanco) y estática del mecanismo a escala, para previsualizar los pines, el rotor y los anillos.
- **Dependencias:** El `State` de `math.js` está poblado y es numéricamente válido.
- **Archivos involucrados:** `js/renderer.js`, `index.html`
- **Paso a paso de implementación:**
  1. En `index.html`, crear un elemento `<svg>` con id `viewport` dentro de la sección principal (lienzo), configurando un `viewBox` centrado (ej: `-500 -500 1000 1000`).
  2. En `js/renderer.js`, crear una función que limpie el SVG usando `innerHTML = ''`.
  3. Crear una función que dibuje el Anillo Interno: un `<circle>` o un `<path>` con $Z_i$ muescas que representen dientes aproximados (usando bucles para generar polares a cartesianas y sumando el radio base más altura del diente).
  4. Crear una función que dibuje el Anillo Externo: un `<path>` similar, pero más grande, con $Z_a$ muescas interiores.
  5. Crear una función que itere $N_p$ veces, calculando la posición de los pines a lo largo de la pista elíptica y dibujando un `<circle>` de radio $D_p / 2$ en cada posición.
  6. Crear una función que dibuje el Rotor Elíptico, un `<ellipse>` central con radios iguales a los semiejes x/y calculados previamente.
  7. En `js/app.js`, después de calcular todo en `math.js`, pasar el estado a `renderer.js` e invocar el dibujado principal.
- **Criterios de terminado:** El mecanismo de engranajes aparece centrado en el panel derecho al cargar la app y cambia su geometría dinámicamente cada vez que se mueve un input.
- **Riesgos o advertencias:** Si el `viewBox` es fijo, partes muy grandes pueden salir de cuadro. Es necesario un factor de escala automático o mantener valores conservadores en `Z_i` inicial.

## 6. Resultados y Persistencia

### 6.1. Panel de Salida y Variables CAD
- **Objetivo de la feature:** Exponer de forma legible los números y cotas a insertar en software externo (Fusion 360).
- **Dependencias:** Cálculo exitoso (`math.js`).
- **Archivos involucrados:** `index.html`, `js/app.js`
- **Paso a paso de implementación:**
  1. En `index.html`, crear una tabla o listado descriptivo (ej. "Resultados Numéricos").
  2. Crear campos de solo lectura para: Cantidad de pines ($N_p$), Relación (InFix), Relación (OutFix), Semieje Menor, Semieje Mayor, Carrera radial y Longitud de pista.
  3. En `js/app.js`, crear una función `updateResults(state)` que reciba el estado actual y lo inyecte al DOM (ej: `el.textContent = state.kinematics.np`).
  4. Debajo de los resultados, añadir un bloque "Guía Fusion 360" que contenga instrucciones copiables o fórmulas sugeridas (ej. 'Transmitter: Elipse base').
- **Criterios de terminado:** Tabla de datos con todos los resultados listos, formateados con `toFixed(3)` si son irracionales, con el número de pines como entero exacto.
- **Riesgos o advertencias:** No modificar la precisión en `math.js`, únicamente redondear al presentarlos en pantalla.

### 6.2. Persistencia Inmediata
- **Objetivo de la feature:** Guardar la sesión automáticamente, para que los usuarios no pierdan su configuración al recargar la página.
- **Dependencias:** UI terminada y lógica probada.
- **Archivos involucrados:** `js/state.js`, `js/app.js`
- **Paso a paso de implementación:**
  1. En `js/state.js` (o en una clase `Storage`), implementar el guardado automático de un JSON `JSON.stringify(state)` a `localStorage.getItem('hprd-config')`.
  2. En `js/app.js`, al cargar la página (`window.onload`), verificar si existe la clave en localStorage. Si existe, parsearla y pre-poblar los inputs visuales en `index.html`.
  3. Si no existe localStorage, poblar los inputs con valores por defecto (ej. $Z_i=40, Z_a=44, D_p=3.0, P=2.0$).
  4. Agregar un botón "Exportar a JSON" que emita el archivo, y otro "Importar" para leer configuraciones externas.
- **Criterios de terminado:** Al modificar un valor y refrescar la página (F5), los parámetros persisten y la pieza mantiene el último estado diseñado.
- **Riesgos o advertencias:** Validar que el objeto recuperado de localStorage no esté corrupto.
