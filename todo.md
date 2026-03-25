# TODO / Implementation Breakdown

## 1. Introducción breve
Este documento resume y desglosa las tareas derivadas del Product Requirements Document (PRD) y del Tech Stack del proyecto "Generador Web de Harmonic Pin Ring Drive". Su objetivo es servir como una guía paso a paso para facilitar la implementación futura, manteniendo un orden lógico y asegurando que todas las características y restricciones documentadas se aborden sistemáticamente sin perder foco.

## 2. Principios de uso del documento
* Este documento no reemplaza al PRD.
* Este documento no reemplaza al Tech Stack.
* Este documento solo organiza el trabajo para su ejecución secuencial.
* Las decisiones de implementación deben mantenerse alineadas estrictamente con los documentos fuente.

## 3. Features o bloques de trabajo

### Estructura base de interfaz (UI/Layout)
**Objetivo**
Crear el cascarón visual de la aplicación web, estableciendo los paneles de interacción y el estilo técnico requerido, sin implementar aún la lógica matemática.

**Origen en documentos fuente**
* PRD → "8. Requerimientos de interfaz (UI/UX)" y "9. Requerimientos técnicos de implementación"
* Tech Stack → "5. Decisiones de frontend (Arquitectura Sugerida)" y "10. Estructura de proyecto sugerida"

**Dependencias**
Ninguna.

**Desglose de tareas**
1. Crear el archivo base `index.html` con una estructura semántica.
2. Definir los tres paneles principales según el PRD: panel izquierdo (controles), bloque inferior izquierdo (resultados) y área principal (lienzo 2D).
3. Configurar la hoja de estilos `style.css` aplicando el estilo visual "Blueprint" (fondo azul técnico, líneas claras) y un layout basado en CSS Grid y Flexbox.
4. Crear la estructura de archivos JavaScript detallada en el Tech Stack (`app.js`, `state.js`, `math.js`, `geometry.js`, `renderer.js`) y vincularlos al HTML usando módulos ES6.

**Criterios de terminado**
La interfaz visual existe, es responsive y muestra los paneles vacíos con los colores correctos. Los archivos fuente están enlazados sin errores en el navegador.

**Riesgos o advertencias**
Evitar el uso de librerías CSS externas; todo debe ser resuelto con CSS nativo según las restricciones del Tech Stack.

### Gestión de Estado y Persistencia
**Objetivo**
Administrar las variables de entrada del usuario y permitir guardar, cargar y exportar configuraciones del mecanismo.

**Origen en documentos fuente**
* PRD → "10. Modelo de datos lógico del frontend"
* Tech Stack → "7. Estrategia de cálculos y validaciones" y "8. Persistencia frontend recomendada"

**Dependencias**
Estructura base de interfaz (UI/Layout).

**Desglose de tareas**
1. Implementar en `state.js` un objeto centralizado basado en el modelo de datos (Inputs, Kinematics, Geometry, Tolerances).
2. Desarrollar la lógica para actualizar este estado global desde la interfaz.
3. Integrar guardado automático en `localStorage` cada vez que el estado sea válido.
4. Asegurar que al abrir la aplicación se recupere la última configuración almacenada en el almacenamiento local.
5. Preparar funciones para exportar el estado actual como un archivo JSON y para cargar un archivo JSON externo.

**Criterios de terminado**
El estado de la aplicación se gestiona centralizadamente y sobrevive a recargas de la página gracias a `localStorage`. Se pueden descargar y cargar archivos JSON de configuración.

**Riesgos o advertencias**
Posibles errores si el JSON guardado o importado contiene datos corruptos. Se debe considerar un estado por defecto seguro en caso de fallo de lectura.

### Panel de Entradas y Validaciones
**Objetivo**
Permitir al usuario ingresar los parámetros del sistema y garantizar que estos sean matemáticamente y geométricamente viables antes de procesarlos.

**Origen en documentos fuente**
* PRD → "5. Requerimientos funcionales" y "11. Validaciones y reglas de negocio"
* Tech Stack → "7. Estrategia de cálculos y validaciones" y "11. Riesgos y advertencias"

**Dependencias**
Gestión de Estado y Persistencia.

**Desglose de tareas**
1. Poblar el panel izquierdo con inputs para $Z_i$ (dientes internos), $Z_a$ (dientes externos), $D_p$ (diámetro del pin), $P$ (paso) y tolerancias de impresión.
2. Añadir tooltips descriptivos en las variables complejas según lo indica el PRD.
3. Configurar `app.js` para capturar eventos de entrada y enviarlos a validación.
4. Implementar validaciones que detecten límites ($Z_i > 40$, $D_p \leq P$, diferencia de dientes $Z_a - Z_i = 4$).
5. Integrar autocorrección (por ejemplo, autocompletar $Z_a$ si se ingresa $Z_i$).
6. Mostrar mensajes en rojo en la UI o bloquear el cálculo si se rompen restricciones.

**Criterios de terminado**
El usuario puede ingresar valores. Si los valores rompen las reglas matemáticas, el sistema alerta visualmente al usuario y detiene el cálculo; si son correctos, el estado se actualiza.

**Riesgos o advertencias**
Existe el riesgo de acoplar la lectura del DOM con la lógica pura. Las validaciones deben ser agnósticas a la vista.

### Motor Matemático y Cinemático
**Objetivo**
Calcular con alta precisión todas las dimensiones derivadas y relaciones del engranaje a partir de los inputs validados.

**Origen en documentos fuente**
* PRD → "6. Requerimientos matemáticos y geométricos" y "12. Resultados esperados por el usuario"
* Tech Stack → "5. Decisiones de frontend" y "7. Estrategia de cálculos y validaciones"

**Dependencias**
Panel de Entradas y Validaciones.

**Desglose de tareas**
1. Implementar en `math.js` funciones puras para calcular la cantidad de pines ($N_p$).
2. Desarrollar los cálculos para la longitud de arco ($s$) y semiejes elípticos del rotor.
3. Calcular las relaciones de reducción para los diferentes casos (fijando distintos anillos).
4. Derivar parámetros de holgura y distancias radiales (carrera del pin).
5. Exponer los resultados al objeto central de estado.

**Criterios de terminado**
El sistema puede transformar de forma predecible un set de parámetros de entrada válidos en un conjunto completo de dimensiones geométricas y relaciones cinemáticas.

**Riesgos o advertencias**
La pérdida de precisión por redondeos tempranos; se debe mantener máxima precisión de coma flotante en las operaciones.

### Visualización de Resultados y Panel CAD
**Objetivo**
Exponer los resultados numéricos en pantalla y mostrar instrucciones útiles para transferir el modelo a software de diseño (Fusion 360).

**Origen en documentos fuente**
* PRD → "2. Objetivo funcional", "12. Resultados esperados por el usuario" y "13. Recomendaciones para el modelado en Fusion 360"
* Tech Stack → "5. Decisiones de frontend"

**Dependencias**
Motor Matemático y Cinemático.

**Desglose de tareas**
1. Diseñar el bloque inferior izquierdo para mostrar tablas con los valores calculados de `Kinematics` y `Geometry`.
2. Formatear la salida numérica para presentarla redondeada al usuario, preservando el estado interno exacto.
3. Integrar en la interfaz el texto de recomendaciones para modelado (uso de *User Parameters* y *Equation Driven Curve*).
4. Conectar este panel para que se actualice dinámicamente cuando el estado cambie.

**Criterios de terminado**
La tabla de cotas y resultados es legible, se actualiza en tiempo real frente a cambios válidos, y el panel incluye las sugerencias para Fusion 360.

**Riesgos o advertencias**
Asegurarse de que las unidades e identificadores mostrados coincidan de manera precisa con lo que un usuario de CAD espera ver.

### Geometría y Renderizado SVG 2D
**Objetivo**
Dibujar el esquema del reductor basándose en cálculos geométricos, para verificar visualmente que no haya interferencias ni superposiciones evidentes.

**Origen en documentos fuente**
* PRD → "5. Requerimientos funcionales" y "9. Requerimientos técnicos de implementación"
* Tech Stack → "6. Tecnología para visualización geométrica"

**Dependencias**
Motor Matemático y Cinemático.

**Desglose de tareas**
1. Crear funciones en `geometry.js` para generar los puntos y perfiles del anillo interno, externo y de la pista de pines.
2. Usar `renderer.js` para traducir esos puntos en elementos `<path>`, `<circle>` y `<line>` de SVG.
3. Configurar el renderizado dinámico en el área principal, dibujando los elementos con colores distintivos y holguras aplicadas.
4. Enganchar la actualización del dibujo al ciclo de eventos en `app.js` tras cada cálculo exitoso.
5. Preparar la funcionalidad para que el `<svg>` generado sea descargable por el usuario.

**Criterios de terminado**
Una representación gráfica 2D precisa del mecanismo aparece en el área central, reacciona y se redibuja ante cada nuevo parámetro de entrada, y el usuario puede exportarla.

**Riesgos o advertencias**
Posibles caídas de rendimiento si la generación de la envolvente requiere excesivos nodos SVG. Se debe buscar un equilibrio entre resolución del trazo y rendimiento.

## 4. Orden sugerido de implementación
1. Estructura base de interfaz (UI/Layout)
2. Gestión de Estado y Persistencia
3. Panel de Entradas y Validaciones
4. Motor Matemático y Cinemático
5. Visualización de Resultados y Panel CAD
6. Geometría y Renderizado SVG 2D

## 5. Dudas, vacíos o definiciones pendientes
* **Generación de la envolvente del diente:** El PRD menciona que el perfil está "definido por la envolvente del radio del pin desplazándose sobre la trayectoria elíptica", pero no expone explícitamente las fórmulas matemáticas paramétricas exactas para generar esta curva; requerirá definición matemática.
* **Valores y lógica de tolerancia sugerida:** Se piden "dimensiones sugeridas para la holgura de diseño" considerando compensación en impresión 3D, pero no hay fórmulas o umbrales base explícitos (ej. cuánta tolerancia por milímetro de diámetro); se requiere definir este heurístico.
* **Momento exacto de validación:** El momento de aplicar la "autocorrección" (ej. ajustar $Z_a$) vs "alerta visual" (error en rojo) no tiene una jerarquía de eventos definida (¿se corrige al teclear, o al perder el foco del campo?).
* **Punto de referencia de la relación de transmisión:** El PRD menciona la relación "si se fija el anillo externo", pero en una tabla de resultados no queda explícito si se deben calcular las tres posibles relaciones (fijando interno, externo o pines) simultáneamente o si habrá un selector para alternarlas.
* **Formato de exportación del SVG:** El Tech Stack avala la exportación del SVG completo, pero el PRD Fase 3 habla de exportar el "perfil de diente". Falta aclarar si el botón del MVP descarga toda la escena de previsualización (assembly) o solo una curva aislada para CAD.
