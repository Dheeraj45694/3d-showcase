import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════
// ENHANCED PARTICLE SYSTEM - Flow Field Physics
// ═══════════════════════════════════════════════════════════════

export default function Particles({ count = 200 }) {
    const meshRef = useRef()
    const velocities = useRef([])

    // Simplex-like noise function for flow field
    const noise3D = (x, y, z) => {
        return Math.sin(x * 1.5) * Math.cos(y * 1.5) * Math.sin(z * 1.5) +
            Math.sin(x * 0.5 + y * 0.7) * 0.5
    }

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)
        const sizes = new Float32Array(count)

        velocities.current = []

        const color1 = new THREE.Color('#6366f1')
        const color2 = new THREE.Color('#a855f7')
        const color3 = new THREE.Color('#f472b6')

        for (let i = 0; i < count; i++) {
            // Distribute in a larger volume
            positions[i * 3] = (Math.random() - 0.5) * 30
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20
            positions[i * 3 + 2] = (Math.random() - 0.5) * 30

            velocities.current.push({
                x: 0,
                y: 0,
                z: 0,
                phase: Math.random() * Math.PI * 2
            })

            // Gradient colors
            const t = i / count
            let mixedColor
            if (t < 0.5) {
                mixedColor = color1.clone().lerp(color2, t * 2)
            } else {
                mixedColor = color2.clone().lerp(color3, (t - 0.5) * 2)
            }

            colors[i * 3] = mixedColor.r
            colors[i * 3 + 1] = mixedColor.g
            colors[i * 3 + 2] = mixedColor.b

            sizes[i] = Math.random() * 0.1 + 0.02
        }

        return { positions, colors, sizes }
    }, [count])

    useFrame((state) => {
        if (!meshRef.current) return

        const positions = meshRef.current.geometry.attributes.position.array
        const time = state.clock.elapsedTime

        for (let i = 0; i < count; i++) {
            const idx = i * 3
            const x = positions[idx]
            const y = positions[idx + 1]
            const z = positions[idx + 2]

            // Flow field based on 3D noise
            const noiseScale = 0.03
            const noiseStrength = 0.02

            // Calculate flow field direction
            const angle = noise3D(x * noiseScale + time * 0.1, y * noiseScale, z * noiseScale) * Math.PI * 2
            const angle2 = noise3D(x * noiseScale, y * noiseScale + time * 0.1, z * noiseScale) * Math.PI * 2

            // Apply flow force
            velocities.current[i].x += Math.cos(angle) * noiseStrength
            velocities.current[i].y += Math.sin(angle2) * noiseStrength * 0.5
            velocities.current[i].z += Math.sin(angle) * noiseStrength

            // Add gentle upward drift
            velocities.current[i].y += 0.001

            // Damping
            velocities.current[i].x *= 0.98
            velocities.current[i].y *= 0.98
            velocities.current[i].z *= 0.98

            // Limit velocity
            const maxVel = 0.1
            velocities.current[i].x = Math.max(-maxVel, Math.min(maxVel, velocities.current[i].x))
            velocities.current[i].y = Math.max(-maxVel, Math.min(maxVel, velocities.current[i].y))
            velocities.current[i].z = Math.max(-maxVel, Math.min(maxVel, velocities.current[i].z))

            // Apply velocity
            positions[idx] += velocities.current[i].x
            positions[idx + 1] += velocities.current[i].y
            positions[idx + 2] += velocities.current[i].z

            // Wrap around boundaries
            const boundary = 15
            if (positions[idx] > boundary) positions[idx] = -boundary
            if (positions[idx] < -boundary) positions[idx] = boundary
            if (positions[idx + 1] > 10) positions[idx + 1] = -10
            if (positions[idx + 1] < -10) positions[idx + 1] = 10
            if (positions[idx + 2] > boundary) positions[idx + 2] = -boundary
            if (positions[idx + 2] < -boundary) positions[idx + 2] = boundary
        }

        meshRef.current.geometry.attributes.position.needsUpdate = true

        // Gentle rotation of entire system
        meshRef.current.rotation.y = time * 0.02
    })

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={particles.positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={particles.colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}
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
