import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Flow Field Noise Sculptures
 * Particles flowing through a 3D curl noise field
 */
export default function FlowFieldNoise({
    particleCount = 2000,
    noiseScale = 0.08,
    noiseStrength = 0.03,
    color1 = '#6366f1',
    color2 = '#a855f7',
    color3 = '#22d3ee'
}) {
    const pointsRef = useRef()
    const velocitiesRef = useRef([])

    // 3D Simplex-like noise function
    const noise3D = (x, y, z, time) => {
        // Multi-octave noise
        let value = 0
        let amplitude = 1
        let frequency = 1

        for (let i = 0; i < 3; i++) {
            value += amplitude * (
                Math.sin(x * frequency + time) *
                Math.cos(y * frequency * 1.3 + time * 0.7) *
                Math.sin(z * frequency * 0.9 + time * 1.1) +
                Math.sin((x + y) * frequency * 0.7) *
                Math.cos((y + z) * frequency * 0.8)
            )
            amplitude *= 0.5
            frequency *= 2
        }

        return value
    }

    // Curl noise for divergence-free flow
    const curlNoise = (x, y, z, time) => {
        const eps = 0.01

        // Compute partial derivatives
        const dx = (noise3D(x + eps, y, z, time) - noise3D(x - eps, y, z, time)) / (2 * eps)
        const dy = (noise3D(x, y + eps, z, time) - noise3D(x, y - eps, z, time)) / (2 * eps)
        const dz = (noise3D(x, y, z + eps, time) - noise3D(x, y, z - eps, time)) / (2 * eps)

        // Curl = ∇ × F
        return {
            x: dy - dz,
            y: dz - dx,
            z: dx - dy
        }
    }

    const { positions, colors } = useMemo(() => {
        const positions = new Float32Array(particleCount * 3)
        const colors = new Float32Array(particleCount * 3)

        velocitiesRef.current = []

        const c1 = new THREE.Color(color1)
        const c2 = new THREE.Color(color2)
        const c3 = new THREE.Color(color3)

        for (let i = 0; i < particleCount; i++) {
            // Spawn in a sphere
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            const r = 3 + Math.random() * 5

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            positions[i * 3 + 2] = r * Math.cos(phi)

            velocitiesRef.current.push({
                x: 0,
                y: 0,
                z: 0,
                life: Math.random()
            })

            // Rainbow gradient
            const t = i / particleCount
            let color
            if (t < 0.33) {
                color = c1.clone().lerp(c2, t * 3)
            } else if (t < 0.66) {
                color = c2.clone().lerp(c3, (t - 0.33) * 3)
            } else {
                color = c3.clone().lerp(c1, (t - 0.66) * 3)
            }

            colors[i * 3] = color.r
            colors[i * 3 + 1] = color.g
            colors[i * 3 + 2] = color.b
        }

        return { positions, colors }
    }, [particleCount, color1, color2, color3])

    useFrame((state) => {
        if (!pointsRef.current) return

        const positions = pointsRef.current.geometry.attributes.position.array
        const time = state.clock.elapsedTime * 0.3

        for (let i = 0; i < particleCount; i++) {
            const idx = i * 3
            const x = positions[idx]
            const y = positions[idx + 1]
            const z = positions[idx + 2]
            const vel = velocitiesRef.current[i]

            // Get curl noise velocity
            const curl = curlNoise(x * noiseScale, y * noiseScale, z * noiseScale, time)

            // Apply curl force
            vel.x += curl.x * noiseStrength
            vel.y += curl.y * noiseStrength
            vel.z += curl.z * noiseStrength

            // Damping
            vel.x *= 0.98
            vel.y *= 0.98
            vel.z *= 0.98

            // Apply velocity
            positions[idx] += vel.x
            positions[idx + 1] += vel.y
            positions[idx + 2] += vel.z

            // Respawn if too far
            const dist = Math.sqrt(x * x + y * y + z * z)
            if (dist > 15 || dist < 0.5) {
                const theta = Math.random() * Math.PI * 2
                const phi = Math.acos(2 * Math.random() - 1)
                const r = 3 + Math.random() * 3

                positions[idx] = r * Math.sin(phi) * Math.cos(theta)
                positions[idx + 1] = r * Math.sin(phi) * Math.sin(theta)
                positions[idx + 2] = r * Math.cos(phi)

                vel.x = 0
                vel.y = 0
                vel.z = 0
            }
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true
        pointsRef.current.rotation.y = time * 0.05
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
                size={0.06}
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
