/**
 * Renderizador SVG
 * Recibe el estado calculado y dibuja el mecanismo en el viewport SVG.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

export function render(state) {
    const viewport = document.getElementById('viewport');
    if (!viewport) return;

    // Limpiar el lienzo
    viewport.innerHTML = '';

    // Si el estado no es válido, no renderizamos nada
    if (!state.isValid || !state.kinematics) return;

    const { inputs, kinematics } = state;

    // Configuraciones de estilo
    const styles = {
        innerRing: { stroke: '#e0f2fe', strokeWidth: 1.5, fill: 'none' },
        outerRing: { stroke: '#8ab4f8', strokeWidth: 2, fill: 'none' },
        pin: { stroke: '#ffffff', strokeWidth: 1, fill: 'rgba(255,255,255,0.2)' },
        rotor: { stroke: '#fca5a5', strokeWidth: 1.5, fill: 'none', strokeDasharray: '4 4' }
    };

    // Función auxiliar para crear elementos SVG
    const createSvgElement = (type, attributes = {}, style = {}) => {
        const el = document.createElementNS(SVG_NS, type);
        for (const [key, value] of Object.entries(attributes)) {
            el.setAttribute(key, value);
        }
        for (const [key, value] of Object.entries(style)) {
            el.style[key] = value;
        }
        return el;
    };

    // 1. Dibujar Rotor Elíptico
    const rotor = createSvgElement('ellipse', {
        cx: 0,
        cy: 0,
        rx: kinematics.majorAxis,
        ry: kinematics.minorAxis
    }, styles.rotor);
    viewport.appendChild(rotor);

    // 2. Dibujar Anillo Interno
    // El radio base es un poco mayor que el semieje mayor para evitar colisión,
    // pero para visualización simplificada usamos los semiejes calculados para escalar todo el sistema.
    // Base radius of the inner ring (approximated as a circle for the blueprint)
    const rInnerBase = kinematics.minorAxis;
    let dInner = '';
    const pointsInner = inputs.zi * 2; // Dos puntos por diente (valle y cresta)
    for (let i = 0; i <= pointsInner; i++) {
        const theta = (i / pointsInner) * 2 * Math.PI;
        // Si es par, cresta, si es impar, valle (sumamos altura del diente)
        const toothHeight = inputs.dp * 0.4;
        const r = rInnerBase + (i % 2 === 0 ? toothHeight : 0);
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        dInner += (i === 0 ? `M ${x} ${y} ` : `L ${x} ${y} `);
    }
    const innerRing = createSvgElement('path', { d: dInner }, styles.innerRing);
    viewport.appendChild(innerRing);

    // 3. Dibujar Anillo Externo
    const rOuterBase = kinematics.majorAxis + inputs.dp * 1.5;
    let dOuter = '';
    const pointsOuter = inputs.za * 2;
    for (let i = 0; i <= pointsOuter; i++) {
        const theta = (i / pointsOuter) * 2 * Math.PI;
        // Inverso: muesca hacia adentro
        const toothHeight = inputs.dp * 0.4;
        const r = rOuterBase - (i % 2 === 0 ? toothHeight : 0);
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        dOuter += (i === 0 ? `M ${x} ${y} ` : `L ${x} ${y} `);
    }
    const outerRing = createSvgElement('path', { d: dOuter }, styles.outerRing);
    viewport.appendChild(outerRing);

    // 4. Dibujar Pista de Pines
    const pinRadius = inputs.dp / 2;
    for (let i = 0; i < kinematics.np; i++) {
        const theta = (i / kinematics.np) * 2 * Math.PI;
        // Los pines se alojan sobre la pista elíptica
        const x = kinematics.majorAxis * Math.cos(theta);
        const y = kinematics.minorAxis * Math.sin(theta);

        const pin = createSvgElement('circle', {
            cx: x,
            cy: y,
            r: pinRadius
        }, styles.pin);

        viewport.appendChild(pin);
    }
}
