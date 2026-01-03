import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Mandelbulb / 4D Fractal Projections
 * 3D Mandelbrot set extension via spherical coordinates
 * Uses ray marching for rendering
 */
export default function Mandelbulb({
    power = 8,
    iterations = 8,
    resolution = 50,
    color1 = '#6366f1',
    color2 = '#a855f7',
    color3 = '#22d3ee'
}) {
    const pointsRef = useRef()
    const powerRef = useRef(power)

    // Generate Mandelbulb points
    const { positions, colors } = useMemo(() => {
        const points = []
        const pointColors = []

        const c1 = new THREE.Color(color1)
        const c2 = new THREE.Color(color2)
        const c3 = new THREE.Color(color3)

        const n = power
        const maxIter = iterations
        const size = resolution
        const scale = 1.5

        // Sample points in 3D space
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                for (let k = 0; k < size; k++) {
                    const x0 = (i / size - 0.5) * 2 * scale
                    const y0 = (j / size - 0.5) * 2 * scale
                    const z0 = (k / size - 0.5) * 2 * scale

                    let x = x0, y = y0, z = z0
                    let iter = 0
                    let bailout = false

                    for (let m = 0; m < maxIter && !bailout; m++) {
                        const r = Math.sqrt(x * x + y * y + z * z)

                        if (r > 2) {
                            bailout = true
                            iter = m
                            break
                        }

                        // Convert to spherical coordinates
                        const theta = Math.atan2(Math.sqrt(x * x + y * y), z)
                        const phi = Math.atan2(y, x)

                        // Mandelbulb formula
                        const rn = Math.pow(r, n)
                        x = rn * Math.sin(theta * n) * Math.cos(phi * n) + x0
                        y = rn * Math.sin(theta * n) * Math.sin(phi * n) + y0
                        z = rn * Math.cos(theta * n) + z0

                        iter = m
                    }

                    // Only add points that are part of the set (didn't escape)
                    if (!bailout) {
                        points.push(x0 * 2, y0 * 2, z0 * 2)

                        // Color based on position
                        const t = (i + j + k) / (size * 3)
                        let color
                        if (t < 0.33) {
                            color = c1.clone().lerp(c2, t * 3)
                        } else if (t < 0.66) {
                            color = c2.clone().lerp(c3, (t - 0.33) * 3)
                        } else {
                            color = c3.clone().lerp(c1, (t - 0.66) * 3)
                        }
                        pointColors.push(color.r, color.g, color.b)
                    }
                }
            }
        }

        return {
            positions: new Float32Array(points),
            colors: new Float32Array(pointColors)
        }
    }, [power, iterations, resolution, color1, color2, color3])

    useFrame((state) => {
        if (!pointsRef.current) return

        const time = state.clock.elapsedTime
        pointsRef.current.rotation.y = time * 0.1
        pointsRef.current.rotation.x = Math.sin(time * 0.2) * 0.3
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={colors.length / 3}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    )
}
