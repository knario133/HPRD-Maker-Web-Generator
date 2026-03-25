# Product Requirements Document (PRD): Generador Web de Harmonic Pin Ring Drive

## 1. Visión general del producto
* **Descripción:** Una aplicación web interactiva (estilo *blueprint*) que permite calcular, dimensionar y previsualizar en 2D un sistema de reducción de engranajes tipo Harmonic-Pin-Ring.
* **Propósito:** Facilitar a diseñadores y makers la obtención de todos los parámetros geométricos y matemáticos necesarios para modelar este mecanismo en software CAD (como Fusion 360) e imprimirlo en 3D.
* **Problema que resuelve:** El cálculo manual de la cinemática, las elipses de deformación y las envolventes de los dientes de este reductor es extremadamente complejo y propenso a errores geométricos.
* **Diferenciador:** No es una calculadora genérica de engranajes cilíndricos; expone parámetros específicos de anillos flexibles, diámetros de pines cilíndricos y generadores de onda elípticos.

---

## 2. Objetivo funcional
* Permitir al usuario introducir parámetros base (número de dientes, diámetro de pines, paso).
* Calcular automáticamente dimensiones derivadas (ejes de la elipse, diámetros primitivos, relaciones de reducción).
* Visualizar en tiempo real un esquema vectorial 2D del mecanismo ensamblado.
* Proveer una tabla clara con las cotas y ecuaciones necesarias para exportar al CAD.

---

## 3. Alcance del sistema
* **Incluido en V1 (MVP):** Interfaz web responsive, motor de cálculo matemático en JavaScript, renderizado 2D en Canvas/SVG de la posición estática, y tabla de resultados/variables para CAD.
* **Fuera de alcance inicial:** Exportación directa de archivos STEP/STL, simulaciones de análisis de elementos finitos (FEA) del anillo flexible, y modo de animación en tiempo real de las trayectorias.
* **Enfoque principal:** Precisión matemática y asistencia paramétrica interactiva para el diseño.

---

## 4. Perfil de usuario
* **Makers y Entusiastas 3D:** Buscan integrar reductores compactos y de alta relación en brazos robóticos o actuadores caseros.
* **Nivel técnico:** Intermedio-Alto. Entienden conceptos como "módulo", "paso" y "relación de transmisión", y dominan herramientas como Fusion 360, pero no necesariamente cálculo diferencial avanzado.
* **Necesidades:** Obtener números precisos y tolerancias sugeridas para que la pieza impresa en 3D funcione sin atascarse.

---

## 5. Requerimientos funcionales
* **Ingreso de datos editable:** Campos para los dientes del anillo interno, anillo externo, diámetro del pin y paso del anillo.
* **Recálculo dinámico:** Cualquier cambio en un input debe actualizar instantáneamente la geometría visual y los resultados numéricos.
* **Cálculo de relaciones de transmisión:** Mostrar la reducción resultante según qué componente se fije (interno, externo o anillo de pines).
* **Exposición total de parámetros:** Como no existen componentes estándar para un HPRD impreso en 3D, la herramienta debe detallar radios, excentricidades y longitudes de curvas.
* **Representación visual:** Mostrar el anillo interno con dientes exteriores, el anillo externo con dientes interiores y la pista de pines deformada por el rotor.

---

## 6. Requerimientos matemáticos y geométricos

### Variables de entrada
* $Z_i$: Número de dientes de la corona interna.
* $Z_a$: Número de dientes de la corona externa.
* $D_p$: Diámetro de los pines cilíndricos.
* $P$: Paso de los engranajes.

### Restricciones matemáticas
* **Diferencia de dientes:** $Z_a - Z_i = 4$
* **Número de pines ($N_p$):** $N_p = Z_i + 2 = Z_a - 2$

### Fórmulas principales
* **Longitud de arco de la pista de pines:** $s = N_p \cdot P$
* **Relación de semiejes del rotor (elíptico):** $x/y = Z_i/Z_a$ (donde $x$ es el eje menor e $y$ el eje mayor).
* **Relaciones de reducción:** Por ejemplo, si se fija el anillo externo, la relación es $Z_i / (Z_a - Z_i)$.
* **Perfil de los dientes:** Definido por la envolvente del radio del pin desplazándose sobre la trayectoria elíptica.

---

## 7. Consideraciones de impresión 3D
* **Tolerancias y Holguras:** Inclusión de variables de ajuste manual para expansión térmica del material (ej. agregar +0.15mm al alojamiento del pin en impresión FDM).
* **Radios de fondo:** El fondo de los dientes debe ser semicircular para alojar perfectamente los pines.
* **Recomendaciones de material:** Sugerir en la UI el uso de materiales resilientes (PETG, Nylon) para el anillo flexible, o geometrías con paredes delgadas para evitar fatiga.
* **Pines metálicos:** Permitir definir un $D_p$ cerrado (ej. 2.00 mm o 3.00 mm) para incentivar el uso de pasadores de acero rectificado en lugar de pines de plástico, mejorando drásticamente la rigidez.

---

## 8. Requerimientos de interfaz (UI/UX)
* **Estilo visual:** Diseño tipo "Blueprint" (fondo azul técnico, líneas blancas/celestes, cotas claras), inspirado en generadores de engranajes clásicos.
* **Layout:**
  * Panel izquierdo: Controles, inputs y ajustes.
  * Bloque inferior izquierdo: Resultados numéricos.
  * Área principal (derecha): Lienzo de previsualización 2D.
* **Micro-ayudas:** Tooltips al pasar el cursor sobre variables complejas (ej. "Semieje mayor del rotor").
* **Alertas visuales:** Mensajes en rojo o bloqueos suaves si se rompen restricciones (ej. advertir si $Z_a - Z_i \neq 4$).

---

## 9. Requerimientos técnicos de implementación
* **Stack tecnológico:** HTML5, CSS3 y JavaScript puro (Vanilla JS).
* **Frameworks:** Sin frameworks pesados (React/Vue/Angular quedan fuera para mantener la simplicidad y ligereza del código).
* **Renderizado:** API nativa de `<canvas>` o manipulación del DOM con `<svg>` para dibujos nítidos.
* **Arquitectura:** Frontend puro (sin backend). Ejecución 100% local en el navegador del usuario para asegurar inmediatez en el recálculo. Organización en tres módulos principales: `calc.js` (matemáticas), `ui.js` (eventos) y `draw.js` (renderizado).

---

## 10. Modelo de datos lógico del frontend

| Objeto | Propiedades clave | Descripción |
| :--- | :--- | :--- |
| `Inputs` | `Zi`, `Za`, `Dp`, `Pitch` | Variables ingresadas directamente por el usuario. |
| `Kinematics` | `Np`, `Ratio_InFix`, `Ratio_OutFix` | Resultados derivados del cálculo de engranajes y velocidades. |
| `Geometry` | `MajorAxis`, `MinorAxis`, `TrackLength` | Parámetros del generador de onda o rotor interno. |
| `Tolerances` | `PinClearance`, `ToothClearance` | Ajustes manuales requeridos para compensación en impresión 3D. |

---

## 11. Validaciones y reglas de negocio
* **Límite mínimo de dientes:** $Z_i$ debe ser lo suficientemente alto (recomendado $> 40$) para permitir la flexión del anillo sin forzar un ángulo de presión mecánico inviable.
* **Autocorrección de diferencia:** Si el usuario ingresa $Z_i = 100$, el sistema debe sugerir o autocompletar $Z_a = 104$.
* **Validación de tamaño de pin:** El diámetro del pin ($D_p$) no puede ser mayor que el paso ($P$). Si ocurre, mostrar error: *"El diámetro del pin es demasiado grande para el paso seleccionado (provocará auto-intersección)"*.

---

## 12. Resultados esperados por el usuario
* Cantidad exacta de pines ($N_p$).
* Semiejes menor y mayor del generador elíptico.
* Distancia radial entre el diámetro primitivo interno y externo (carrera del pin).
* Dimensiones sugeridas para la holgura de diseño.

---

## 13. Recomendaciones para el modelado en Fusion 360
* **Exportación a CAD:** Instrucciones breves en la herramienta sobre cómo llevar estos datos al software.
* **User Parameters:** Indicar al usuario que cree una tabla de parámetros en Fusion 360 copiando exactamente la salida web.
* **Trazado de curvas:** Recomendar el uso de *Equation Driven Curve* en Fusion para los perfiles dentados.
* **Modelado del rotor:** Recalcar la importancia de basar el núcleo ("Transmitter") estrictamente en los radios elípticos entregados para evitar el desgaste prematuro del anillo de pines.

---

## 14. Riesgos, supuestos y decisiones de diseño
* **Riesgo geométrico:** Aproximar la envolvente de los dientes con arcos circulares simples en el CAD puede generar *backlash* (juego).
* **Riesgo de impresión:** Los materiales rígidos (como el PLA estándar) pueden fracturarse. Se asume que el usuario comprende la necesidad de buscar alternativas (PETG/TPU/Nylon) o integrar un rodamiento de sección fina real.
* **Decisión V1:** Se priorizará el "generador elíptico" por ser el más fácil de replicar para un maker, dejando opciones más complejas (como rodamientos de doble excéntrica) para futuras versiones.

---

## 15. Roadmap sugerido
* **Fase 1 (MVP):** Calculadora numérica, diagrama estático en 2D, validación de reglas matemáticas y panel de exportación manual de parámetros.
* **Fase 2 (Visualización Avanzada):** Animación interactiva en el Canvas para verificar que no existan interferencias al rotar los componentes.
* **Fase 3 (Integración CAD):** Exportación del perfil de diente en formato DXF o SVG para importación directa en Fusion 360, ahorrando la necesidad de ingresar ecuaciones a mano.
