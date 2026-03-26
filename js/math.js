/**
 * Motor Matemático Central (Cinemática y Geometría)
 * Todas las funciones aquí son puras, no modifican variables globales
 * ni acceden al DOM.
 */

/**
 * Calcula el número de pines.
 * @param {number} zi - Dientes Corona Interna
 * @returns {number} Número de pines (Np)
 */
export function calculateNp(zi) {
    return zi + 2;
}

/**
 * Calcula la longitud de arco (TrackLength).
 * @param {number} np - Número de pines
 * @param {number} p - Paso de engranajes
 * @returns {number} Longitud de arco
 */
export function calculateTrackLength(np, p) {
    return np * p;
}

/**
 * Calcula las proporciones de los semiejes del rotor interno (x/y).
 * Retorna la proporción (eje menor / eje mayor).
 * @param {number} zi - Dientes Corona Interna
 * @param {number} za - Dientes Corona Externa
 * @returns {number} Relación de semiejes
 */
export function calculateSemiaxisRatio(zi, za) {
    return zi / za;
}

/**
 * Calcula la relación de reducción cuando el anillo externo está fijo (OutFix).
 * @param {number} zi - Dientes Corona Interna
 * @param {number} za - Dientes Corona Externa
 * @returns {number} Relación de reducción (OutFix)
 */
export function calculateRatioOutFix(zi, za) {
    return zi / (za - zi);
}

/**
 * Calcula la relación de reducción cuando el anillo interno está fijo (InFix).
 * @param {number} zi - Dientes Corona Interna
 * @param {number} za - Dientes Corona Externa
 * @returns {number} Relación de reducción (InFix)
 */
export function calculateRatioInFix(zi, za) {
    return za / (za - zi);
}

/**
 * Calcula el semieje mayor (majorAxis)
 * usando la aproximación del perímetro elíptico base: s / (PI * (1 + x/y))
 * @param {number} trackLength - Longitud de arco de pista
 * @param {number} semiaxisRatio - Relación de semiejes
 * @returns {number} Semieje mayor
 */
export function calculateMajorAxis(trackLength, semiaxisRatio) {
    return trackLength / (Math.PI * (1 + semiaxisRatio));
}

/**
 * Calcula el semieje menor (minorAxis)
 * @param {number} majorAxis - Semieje mayor
 * @param {number} semiaxisRatio - Relación de semiejes
 * @returns {number} Semieje menor
 */
export function calculateMinorAxis(majorAxis, semiaxisRatio) {
    return majorAxis * semiaxisRatio;
}

/**
 * Calcula la carrera radial (radialStroke)
 * @param {number} majorAxis - Semieje mayor
 * @param {number} minorAxis - Semieje menor
 * @returns {number} Carrera radial
 */
export function calculateRadialStroke(majorAxis, minorAxis) {
    return majorAxis - minorAxis;
}

/**
 * Calcula la cinemática completa a partir del estado.
 * @param {Object} inputs - Objeto con zi, za, dp, p
 * @returns {Object} Objeto Kinematics
 */
export function calculateKinematics(inputs) {
    const { zi, za, p } = inputs;
    const np = calculateNp(zi);
    const trackLength = calculateTrackLength(np, p);
    const semiaxisRatio = calculateSemiaxisRatio(zi, za);
    const ratioOutFix = calculateRatioOutFix(zi, za);
    const ratioInFix = calculateRatioInFix(zi, za);
    const majorAxis = calculateMajorAxis(trackLength, semiaxisRatio);
    const minorAxis = calculateMinorAxis(majorAxis, semiaxisRatio);
    const radialStroke = calculateRadialStroke(majorAxis, minorAxis);

    return {
        np,
        trackLength,
        semiaxisRatio,
        ratioOutFix,
        ratioInFix,
        majorAxis,
        minorAxis,
        radialStroke
    };
}

/**
 * Valida las reglas de negocio y restricciones.
 * @param {Object} inputs - Objeto con zi, za, dp, p
 * @returns {Object} Objeto con valid, type y message (en caso de error o warning)
 */
export function checkConstraints(inputs) {
    const { zi, za, dp, p } = inputs;

    // Diferencia estricta de 4 dientes
    if (za - zi !== 4) {
        return {
            valid: false,
            type: 'error',
            message: 'La diferencia entre la Corona Externa y la Interna debe ser exactamente 4 (Za - Zi = 4).'
        };
    }

    // El diámetro del pin no puede ser mayor que el paso
    if (dp > p) {
        return {
            valid: false,
            type: 'error',
            message: 'El diámetro del pin es demasiado grande para el paso seleccionado (provocará auto-intersección).'
        };
    }

    // Warning suave: Zi recomendado mayor a 40
    if (zi <= 40) {
        return {
            valid: true,
            type: 'warning',
            message: 'Se recomienda que la Corona Interna (Zi) tenga más de 40 dientes para facilitar la flexión.'
        };
    }

    return { valid: true };
}
