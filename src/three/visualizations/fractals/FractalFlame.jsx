import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Fractal Flame Structures
 * Iterated Function Systems with log-density coloring
 */
export default function FractalFlame({
    pointCount = 10000,
    iterations = 50,
    color1 = '#ff6b6b',
    color2 = '#6366f1',
    color3 = '#feca57'
}) {
    const pointsRef = useRef()

    // Variation functions
    const variations = useMemo(() => ({
        linear: (x, y) => ({ x, y }),
        sinusoidal: (x, y) => ({ x: Math.sin(x), y: Math.sin(y) }),
        spherical: (x, y) => {
            const r2 = x * x + y * y + 0.0001
            return { x: x / r2, y: y / r2 }
        },
        swirl: (x, y) => {
            const r2 = x * x + y * y
            const sinR = Math.sin(r2)
            const cosR = Math.cos(r2)
            return {
                x: x * sinR - y * cosR,
                y: x * cosR + y * sinR
            }
        },
        horseshoe: (x, y) => {
            const r = Math.sqrt(x * x + y * y) + 0.0001
            return {
                x: (x - y) * (x + y) / r,
                y: 2 * x * y / r
            }
        },
        polar: (x, y) => {
            const theta = Math.atan2(y, x)
            const r = Math.sqrt(x * x + y * y)
            return { x: theta / Math.PI, y: r - 1 }
        },
        handkerchief: (x, y) => {
            const r = Math.sqrt(x * x + y * y)
            const theta = Math.atan2(y, x)
            return {
                x: r * Math.sin(theta + r),
                y: r * Math.cos(theta - r)
            }
        },
        heart: (x, y) => {
            const r = Math.sqrt(x * x + y * y)
            const theta = Math.atan2(y, x)
            return {
                x: r * Math.sin(theta * r),
                y: -r * Math.cos(theta * r)
            }
        }
    }), [])

    // Generate fractal points
    const { positions, colors } = useMemo(() => {
        const positions = new Float32Array(pointCount * 3)
        const colors = new Float32Array(pointCount * 3)

        const c1 = new THREE.Color(color1)
        const c2 = new THREE.Color(color2)
        const c3 = new THREE.Color(color3)

        // IFS transforms
        const transforms = [
            { a: 0.5, b: 0, c: 0, d: 0.5, e: -0.5, f: -0.5, variation: 'swirl', weight: 0.33 },
            { a: 0.5, b: 0, c: 0, d: 0.5, e: 0.5, f: -0.5, variation: 'spherical', weight: 0.33 },
            { a: 0.5, b: 0, c: 0, d: 0.5, e: 0, f: 0.5, variation: 'sinusoidal', weight: 0.34 }
        ]

        let x = Math.random() * 2 - 1
        let y = Math.random() * 2 - 1
        let colorValue = 0

        // Chaos game
        for (let i = 0; i < pointCount; i++) {
            // Skip first iterations
            for (let j = 0; j < iterations; j++) {
                // Random transform selection
                const rand = Math.random()
                let cumWeight = 0
                let transform = transforms[0]
                let tIndex = 0

                for (let t = 0; t < transforms.length; t++) {
                    cumWeight += transforms[t].weight
                    if (rand < cumWeight) {
                        transform = transforms[t]
                        tIndex = t
                        break
                    }
                }

                // Apply affine transform
                const newX = transform.a * x + transform.b * y + transform.e
                const newY = transform.c * x + transform.d * y + transform.f

                // Apply variation
                const varied = variations[transform.variation](newX, newY)
                x = varied.x
                y = varied.y

                // Update color
                colorValue = (colorValue + tIndex / transforms.length) / 2
            }

            positions[i * 3] = x * 3
            positions[i * 3 + 1] = y * 3
            positions[i * 3 + 2] = (Math.sin(x * 5) + Math.cos(y * 5)) * 0.3

            // Color based on accumulated color value
            let color
            if (colorValue < 0.33) {
                color = c1.clone().lerp(c2, colorValue * 3)
            } else if (colorValue < 0.66) {
                color = c2.clone().lerp(c3, (colorValue - 0.33) * 3)
            } else {
                color = c3.clone().lerp(c1, (colorValue - 0.66) * 3)
            }

            colors[i * 3] = color.r
            colors[i * 3 + 1] = color.g
            colors[i * 3 + 2] = color.b
        }

        return { positions, colors }
    }, [pointCount, iterations, color1, color2, color3, variations])

    useFrame((state) => {
        if (!pointsRef.current) return
        pointsRef.current.rotation.z = state.clock.elapsedTime * 0.05
        pointsRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={pointCount}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={pointCount}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.03}
                vertexColors
                transparent
                opacity={0.7}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    )
}
