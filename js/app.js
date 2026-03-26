import { checkConstraints, calculateKinematics } from './math.js';
import { render } from './renderer.js';
import { saveState, loadState } from './state.js';

/**
 * Objeto Central de Estado
 * Mantiene los valores de toda la aplicación.
 */
let State = {
    inputs: {
        zi: 40,
        za: 44,
        dp: 3.0,
        p: 2.0
    },
    tolerances: {
        pinClearance: 0.15,
        toothClearance: 0.15
    },
    kinematics: {},
    isValid: true
};

/**
 * Inicialización de la aplicación
 */
function initApp() {
    // Intentar cargar estado previo
    const savedState = loadState();
    if (savedState && savedState.inputs) {
        State = savedState;
        // Poblar el DOM con los valores guardados
        document.querySelectorAll('input[data-input]').forEach(input => {
            const prop = input.getAttribute('data-input');
            if (prop in State.inputs) {
                input.value = State.inputs[prop];
            } else if (prop in State.tolerances) {
                input.value = State.tolerances[prop];
            }
        });
    } else {
        // Defaults en DOM si no hay State
        State.inputs.zi = parseFloat(document.getElementById('zi').value) || 40;
        State.inputs.za = parseFloat(document.getElementById('za').value) || 44;
        State.inputs.dp = parseFloat(document.getElementById('dp').value) || 3.0;
        State.inputs.p = parseFloat(document.getElementById('p').value) || 2.0;
    }

    initInputs();
    initButtons();
    updateStateAndRecalculate();
}

/**
 * Agrega event listeners a todos los campos de entrada.
 */
function initInputs() {
    const inputs = document.querySelectorAll('input[data-input]');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            handleInputChange(e.target);
        });
    });
}

/**
 * Inicializa los botones de Exportar e Importar JSON.
 */
function initButtons() {
    const btnExport = document.getElementById('btn-export');
    const btnImport = document.getElementById('btn-import');
    const inputImport = document.getElementById('input-import');

    if (btnExport) {
        btnExport.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(State));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "harmonic_pin_ring_drive_config.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        });
    }

    if (btnImport && inputImport) {
        btnImport.addEventListener('click', () => {
            inputImport.click();
        });

        inputImport.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const loadedState = JSON.parse(evt.target.result);
                    if (loadedState && loadedState.inputs) {
                        State = loadedState;
                        // Repoblar DOM
                        document.querySelectorAll('input[data-input]').forEach(input => {
                            const prop = input.getAttribute('data-input');
                            if (prop in State.inputs) {
                                input.value = State.inputs[prop];
                            } else if (prop in State.tolerances) {
                                input.value = State.tolerances[prop];
                            }
                        });
                        updateStateAndRecalculate();
                    }
                } catch (err) {
                    console.error("Error leyendo archivo JSON:", err);
                    alert("Error leyendo el archivo. El formato debe ser un JSON de estado válido.");
                }
            };
            reader.readAsText(file);
        });
    }
}

/**
 * Manejador de eventos input.
 * Realiza autocorrecciones inmediatas y dispara el ciclo de actualización.
 */
function handleInputChange(inputElement) {
    const prop = inputElement.getAttribute('data-input');
    let value = parseFloat(inputElement.value);

    // Convertir NaN a cero (o ignorar) temporalmente mientras se teclea
    if (isNaN(value)) return;

    // Autocorrección de diferencia (Regla de negocio 11)
    if (prop === 'zi') {
        const newZa = value + 4;
        const zaInput = document.getElementById('za');
        if (zaInput && parseFloat(zaInput.value) !== newZa) {
            zaInput.value = newZa;
            State.inputs.za = newZa;
            // Despachar evento para reflejar que un input manual dispararía una actualización.
            zaInput.dispatchEvent(new Event('input'));
        }
    }

    // Actualizar el valor en el State
    if (prop in State.inputs) {
        State.inputs[prop] = value;
    } else if (prop in State.tolerances) {
        State.tolerances[prop] = value;
    }

    updateStateAndRecalculate();
}

/**
 * Recalcula toda la lógica a partir de las entradas.
 * Maneja el flujo general de la app, deteniéndose si hay errores.
 */
function updateStateAndRecalculate() {
    const alertBox = document.getElementById('alert-box');
    if (!alertBox) return;

    // Limpiar alertas previas
    alertBox.classList.add('hidden');
    alertBox.className = 'alert-box hidden';
    alertBox.textContent = '';

    // Validar restricciones matemáticas
    const validation = checkConstraints(State.inputs);
    State.isValid = validation.valid !== false;

    // Mostrar mensaje de error o warning si aplica
    if (validation.message) {
        alertBox.textContent = validation.message;
        alertBox.classList.remove('hidden');
        if (validation.type === 'error') {
            alertBox.classList.add('alert-error');
        } else if (validation.type === 'warning') {
            alertBox.classList.add('alert-warning');
        }
    }

    // Si hay un error bloqueante, detener flujo de renderizado y cálculo
    if (!State.isValid) {
        console.warn('Flujo interrumpido debido a error matemático:', validation.message);
        return;
    }

    // Calcular cinemática
    State.kinematics = calculateKinematics(State.inputs);

    updateResults(State);
    render(State);
    saveState(State);
}

/**
 * Actualiza el panel de resultados numéricos en el DOM.
 * @param {Object} state - El estado actual de la aplicación.
 */
function updateResults(state) {
    const formatNumber = (num) => (typeof num === 'number' && !Number.isInteger(num)) ? num.toFixed(3) : num;
    const updateElement = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    const kin = state.kinematics;
    if (!kin) return;

    updateElement('res-np', formatNumber(kin.np));
    updateElement('res-infix', formatNumber(kin.ratioInFix));
    updateElement('res-outfix', formatNumber(kin.ratioOutFix));
    updateElement('res-minor-axis', formatNumber(kin.minorAxis));
    updateElement('res-major-axis', formatNumber(kin.majorAxis));
    updateElement('res-radial-stroke', formatNumber(kin.radialStroke));
    updateElement('res-track-length', formatNumber(kin.trackLength));
}

// Iniciar aplicación cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', initApp);
