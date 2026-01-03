/**
 * 3D Math utility functions
 */

/**
 * Linear interpolation between two values
 */
export const lerp = (start, end, factor) => {
    return start + (end - start) * factor
}

/**
 * Clamp a value between min and max
 */
export const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max)
}

/**
 * Map a value from one range to another
 */
export const mapRange = (value, inMin, inMax, outMin, outMax) => {
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin)
}

/**
 * Easing functions for smooth animations
 */
export const easing = {
    // Ease in quad
    easeInQuad: (t) => t * t,

    // Ease out quad
    easeOutQuad: (t) => t * (2 - t),

    // Ease in-out quad
    easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

    // Ease in cubic
    easeInCubic: (t) => t * t * t,

    // Ease out cubic
    easeOutCubic: (t) => (--t) * t * t + 1,

    // Ease in-out cubic
    easeInOutCubic: (t) =>
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
}

/**
 * Calculate distance between two 3D points
 */
export const distance3D = (p1, p2) => {
    const dx = p2[0] - p1[0]
    const dy = p2[1] - p1[1]
    const dz = p2[2] - p1[2]
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * Normalize a vector
 */
export const normalize = (vector) => {
    const length = Math.sqrt(vector[0] ** 2 + vector[1] ** 2 + vector[2] ** 2)
    return length > 0 ? [vector[0] / length, vector[1] / length, vector[2] / length] : [0, 0, 0]
}

/**
 * Convert degrees to radians
 */
export const degToRad = (degrees) => (degrees * Math.PI) / 180

/**
 * Convert radians to degrees
 */
export const radToDeg = (radians) => (radians * 180) / Math.PI

export default {
    lerp,
    clamp,
    mapRange,
    easing,
    distance3D,
    normalize,
    degToRad,
    radToDeg,
}
