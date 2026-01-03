/**
 * Performance monitoring utilities
 */

/**
 * Simple FPS counter
 */
export class FPSCounter {
    constructor() {
        this.frames = []
        this.lastTime = performance.now()
    }

    update() {
        const now = performance.now()
        const delta = now - this.lastTime
        this.lastTime = now

        this.frames.push(delta)
        if (this.frames.length > 60) {
            this.frames.shift()
        }
    }

    getFPS() {
        if (this.frames.length === 0) return 0
        const average = this.frames.reduce((a, b) => a + b) / this.frames.length
        return Math.round(1000 / average)
    }
}

/**
 * Check if device is mobile
 */
export const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    )
}

/**
 * Get device pixel ratio with cap
 */
export const getPixelRatio = (max = 2) => {
    return Math.min(window.devicePixelRatio || 1, max)
}

/**
 * Check if device supports WebGL 2
 */
export const supportsWebGL2 = () => {
    try {
        const canvas = document.createElement('canvas')
        return !!(
            window.WebGL2RenderingContext &&
            canvas.getContext('webgl2')
        )
    } catch (e) {
        return false
    }
}

/**
 * Throttle function calls
 */
export const throttle = (func, delay) => {
    let timeoutId
    let lastExecTime = 0

    return (...args) => {
        const currentTime = Date.now()

        if (currentTime - lastExecTime < delay) {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
                lastExecTime = currentTime
                func(...args)
            }, delay)
        } else {
            lastExecTime = currentTime
            func(...args)
        }
    }
}

/**
 * Debounce function calls
 */
export const debounce = (func, delay) => {
    let timeoutId

    return (...args) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => func(...args), delay)
    }
}

export default {
    FPSCounter,
    isMobile,
    getPixelRatio,
    supportsWebGL2,
    throttle,
    debounce,
}
