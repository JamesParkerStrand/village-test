import * as BABYLON from "@babylonjs/core";


export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Get rotation angle from one point to another in radians
 * @param {number} x1 - Starting point X
 * @param {number} y1 - Starting point Y
 * @param {number} x2 - Target point X
 * @param {number} y2 - Target point Y
 * @returns {number} angle in radians
 */
export function getRotationTowards(x1, y1, x2, y2) {
  return -Math.atan2(y2 - y1, x2 - x1) + degToRad(90);
}
