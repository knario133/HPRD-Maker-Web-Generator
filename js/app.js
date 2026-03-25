import { checkConstraints, calculateKinematics } from './math.js';

/**
 * Objeto Central de Estado
 * Mantiene los valores de toda la aplicación.
 */
const State = {
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
    initInputs();
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

    // Aquí (en el futuro) se llamará al renderizado
    // render(State);
}

// Iniciar aplicación cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', initApp);
