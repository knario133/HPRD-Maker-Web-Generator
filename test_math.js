import { calculateNp, calculateTrackLength, calculateSemiaxisRatio, calculateRatioOutFix, calculateKinematics, checkConstraints } from './js/math.js';

console.log("Testing math functions...");

const zi = 40;
const za = 44;
const p = 2.0;
const dp = 1.5;

console.log(`Np = ${calculateNp(zi)} (Expected 42)`);
console.log(`Track Length = ${calculateTrackLength(calculateNp(zi), p)} (Expected 84)`);
console.log(`Ratio x/y = ${calculateSemiaxisRatio(zi, za)} (Expected ~0.909)`);
console.log(`Ratio OutFix = ${calculateRatioOutFix(zi, za)} (Expected 10)`);

const inputs = { zi, za, p, dp };
console.log(`Kinematics:`, calculateKinematics(inputs));

console.log("Constraints Check (Valid):", checkConstraints(inputs));

console.log("Constraints Check (Invalid Difference):", checkConstraints({ zi: 40, za: 42, p: 2, dp: 1.5 }));

console.log("Constraints Check (Invalid Dp):", checkConstraints({ zi: 40, za: 44, p: 2, dp: 2.5 }));

console.log("Constraints Check (Warning Zi):", checkConstraints({ zi: 30, za: 34, p: 2, dp: 1.5 }));
