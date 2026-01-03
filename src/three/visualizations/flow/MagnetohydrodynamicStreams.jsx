import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Magnetohydrodynamic Streams
 * Simplified MHD equations for plasma flow visualization
 */
export default function MagnetohydrodynamicStreams({
    particleCount = 2000,
    fieldStrength = 0.5,
    color1 = '#6366f1',
    color2 = '#a855f7',
    color3 = '#f472b6'
}) {
    const pointsRef = useRef()
    const velocitiesRef = useRef([])

    // Magnetic field calculation (simplified dipole + toroidal)
    const magneticField = (x, y, z, time) => {
        // Dipole field
        const r = Math.sqrt(x * x + y * y + z * z) + 0.1
        const r5 = Math.pow(r, 5)

        // Dipole components
        const Bx = 3 * x * z / r5
        const By = 3 * y * z / r5
        const Bz = (3 * z * z - r * r) / r5

        // Add toroidal component (rotation around z-axis)
        const toroidalStrength = 0.5
        const Tx = -y * toroidalStrength / (r * r)
        const Ty = x * toroidalStrength / (r * r)
        const Tz = 0

        // Add time-varying perturbation
        const perturbation = Math.sin(time + r * 2) * 0.2

        return {
            x: (Bx + Tx) * fieldStrength + perturbation * x / r,
            y: (By + Ty) * fieldStrength + perturbation * y / r,
            z: (Bz + Tz) * fieldStrength
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
            // Initialize in toroidal distribution
            const theta = Math.random() * Math.PI * 2
            const phi = Math.random() * Math.PI * 2
            const R = 3 + Math.random() * 0.5 // Major radius
            const r = 0.5 + Math.random() * 0.5 // Minor radius

            const x = (R + r * Math.cos(phi)) * Math.cos(theta)
            const y = (R + r * Math.cos(phi)) * Math.sin(theta)
            const z = r * Math.sin(phi)

            positions[i * 3] = x
            positions[i * 3 + 1] = y
            positions[i * 3 + 2] = z

            velocitiesRef.current.push({
                x: 0, y: 0, z: 0,
                energy: Math.random()
            })

            // Aurora-like coloring
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

        const pos = pointsRef.current.geometry.attributes.position.array
        const col = pointsRef.current.geometry.attributes.color.array
        const time = state.clock.elapsedTime

        const c1 = new THREE.Color(color1)
        const c2 = new THREE.Color(color2)
        const c3 = new THREE.Color(color3)

        for (let i = 0; i < particleCount; i++) {
            const idx = i * 3
            const x = pos[idx]
            const y = pos[idx + 1]
            const z = pos[idx + 2]
            const vel = velocitiesRef.current[i]

            // Get magnetic field at position
            const B = magneticField(x, y, z, time)

            // Lorentz force (simplified: F = v × B)
            const vCrossB = {
                x: vel.y * B.z - vel.z * B.y,
                y: vel.z * B.x - vel.x * B.z,
                z: vel.x * B.y - vel.y * B.x
            }

            // Apply force
            vel.x += vCrossB.x * 0.01 + B.x * 0.005
            vel.y += vCrossB.y * 0.01 + B.y * 0.005
            vel.z += vCrossB.z * 0.01 + B.z * 0.005

            // Damping
            const damping = 0.98
            vel.x *= damping
            vel.y *= damping
            vel.z *= damping

            // Apply velocity
            pos[idx] += vel.x
            pos[idx + 1] += vel.y
            pos[idx + 2] += vel.z

            // Energy based on velocity
            vel.energy = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z)

            // Update color based on energy
            const energyNorm = Math.min(vel.energy * 10, 1)
            let color
            if (energyNorm < 0.33) {
                color = c1.clone().lerp(c2, energyNorm * 3)
            } else if (energyNorm < 0.66) {
                color = c2.clone().lerp(c3, (energyNorm - 0.33) * 3)
            } else {
                color = c3.clone()
            }

            col[idx] = color.r
            col[idx + 1] = color.g
            col[idx + 2] = color.b

            // Respawn if too far
            const dist = Math.sqrt(x * x + y * y + z * z)
            if (dist > 8 || dist < 0.5 || isNaN(x)) {
                const theta = Math.random() * Math.PI * 2
                const phi = Math.random() * Math.PI * 2
                const R = 3
                const r = 0.5

                pos[idx] = (R + r * Math.cos(phi)) * Math.cos(theta)
                pos[idx + 1] = (R + r * Math.cos(phi)) * Math.sin(theta)
                pos[idx + 2] = r * Math.sin(phi)

                vel.x = 0
                vel.y = 0
                vel.z = 0
            }
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true
        pointsRef.current.geometry.attributes.color.needsUpdate = true

        pointsRef.current.rotation.z = time * 0.1
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
