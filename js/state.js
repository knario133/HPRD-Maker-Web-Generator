/**
 * Módulo de Persistencia
 * Funciones para guardar y cargar configuraciones de localStorage.
 */

const STORAGE_KEY = 'hprd-config';

/**
 * Guarda el objeto State en localStorage.
 * @param {Object} state - El estado actual de la aplicación.
 */
export function saveState(state) {
    try {
        const dataStr = JSON.stringify(state);
        localStorage.setItem(STORAGE_KEY, dataStr);
    } catch (e) {
        console.warn('Error al guardar el estado en localStorage', e);
    }
}

/**
 * Carga el objeto State desde localStorage.
 * @returns {Object|null} El estado guardado o null si no existe / error.
 */
export function loadState() {
    try {
        const dataStr = localStorage.getItem(STORAGE_KEY);
        if (dataStr) {
            return JSON.parse(dataStr);
        }
    } catch (e) {
        console.warn('Error al cargar el estado desde localStorage', e);
    }
    return null;
}
