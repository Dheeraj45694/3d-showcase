import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Strange Attractor Particle Fields
 * Implements multiple chaotic attractor systems:
 * - Lorenz, Rössler, Aizawa, Chen, Thomas
 */
export default function StrangeAttractor({
    type = 'lorenz',
    particleCount = 5000,
    trailLength = 50,
    color1 = '#6366f1',
    color2 = '#a855f7',
    color3 = '#f472b6'
}) {
    const pointsRef = useRef()
    const trailsRef = useRef([])

    // Attractor parameters
    const params = useMemo(() => ({
        lorenz: { sigma: 10, rho: 28, beta: 8 / 3 },
        rossler: { a: 0.2, b: 0.2, c: 5.7 },
        aizawa: { a: 0.95, b: 0.7, c: 0.6, d: 3.5, e: 0.25, f: 0.1 },
        chen: { a: 40, b: 3, c: 28 },
        thomas: { b: 0.208186 }
    }), [])

    // Initialize particles
    const { positions, colors, velocities, trails } = useMemo(() => {
        const positions = new Float32Array(particleCount * 3)
        const colors = new Float32Array(particleCount * 3)
        const velocities = []
        const trails = []

        const c1 = new THREE.Color(color1)
        const c2 = new THREE.Color(color2)
        const c3 = new THREE.Color(color3)

        for (let i = 0; i < particleCount; i++) {
            // Random starting positions near attractor
            positions[i * 3] = (Math.random() - 0.5) * 2
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2
            positions[i * 3 + 2] = (Math.random() - 0.5) * 2 + 25

            velocities.push({ x: 0, y: 0, z: 0 })
            trails.push([])

            // Gradient colors
            const t = i / particleCount
            let mixedColor
            if (t < 0.5) {
                mixedColor = c1.clone().lerp(c2, t * 2)
            } else {
                mixedColor = c2.clone().lerp(c3, (t - 0.5) * 2)
            }
            colors[i * 3] = mixedColor.r
            colors[i * 3 + 1] = mixedColor.g
            colors[i * 3 + 2] = mixedColor.b
        }

        trailsRef.current = trails
        return { positions, colors, velocities, trails }
    }, [particleCount, color1, color2, color3])

    // Attractor equations
    const attractors = useMemo(() => ({
        lorenz: (x, y, z, p) => ({
            dx: p.sigma * (y - x),
            dy: x * (p.rho - z) - y,
            dz: x * y - p.beta * z
        }),
        rossler: (x, y, z, p) => ({
            dx: -(y + z),
            dy: x + p.a * y,
            dz: p.b + z * (x - p.c)
        }),
        aizawa: (x, y, z, p) => ({
            dx: (z - p.b) * x - p.d * y,
            dy: p.d * x + (z - p.b) * y,
            dz: p.c + p.a * z - (z * z * z) / 3 - (x * x + y * y) * (1 + p.e * z) + p.f * z * x * x * x
        }),
        chen: (x, y, z, p) => ({
            dx: p.a * (y - x),
            dy: (p.c - p.a) * x - x * z + p.c * y,
            dz: x * y - p.b * z
        }),
        thomas: (x, y, z, p) => ({
            dx: Math.sin(y) - p.b * x,
            dy: Math.sin(z) - p.b * y,
            dz: Math.sin(x) - p.b * z
        })
    }), [])

    useFrame((state, delta) => {
        if (!pointsRef.current) return

        const positions = pointsRef.current.geometry.attributes.position.array
        const dt = Math.min(delta, 0.016) * 0.5
        const p = params[type]
        const attractor = attractors[type]
        const scale = type === 'thomas' ? 3 : 0.05

        for (let i = 0; i < particleCount; i++) {
            const idx = i * 3
            let x = positions[idx]
            let y = positions[idx + 1]
            let z = positions[idx + 2]

            // Apply attractor equations
            const { dx, dy, dz } = attractor(x / scale, y / scale, z / scale, p)

            x += dx * dt * scale
            y += dy * dt * scale
            z += dz * dt * scale

            // Keep particles bounded
            const maxDist = 50
            const dist = Math.sqrt(x * x + y * y + z * z)
            if (dist > maxDist || isNaN(x) || isNaN(y) || isNaN(z)) {
                x = (Math.random() - 0.5) * 2
                y = (Math.random() - 0.5) * 2
                z = (Math.random() - 0.5) * 2 + 25
            }

            positions[idx] = x
            positions[idx + 1] = y
            positions[idx + 2] = z
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true
        pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particleCount}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={particleCount}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}
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
