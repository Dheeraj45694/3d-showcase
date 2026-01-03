import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Self-Organizing Particle Intelligence
 * Particles that self-organize into emergent patterns
 */
export default function SelfOrganizingParticles({
    particleCount = 500,
    attractorCount = 4,
    color1 = '#6366f1',
    color2 = '#a855f7',
    color3 = '#22d3ee'
}) {
    const pointsRef = useRef()
    const dataRef = useRef([])
    const attractorsRef = useRef([])

    const { positions, colors } = useMemo(() => {
        const positions = new Float32Array(particleCount * 3)
        const colors = new Float32Array(particleCount * 3)

        dataRef.current = []
        attractorsRef.current = []

        const c1 = new THREE.Color(color1)
        const c2 = new THREE.Color(color2)
        const c3 = new THREE.Color(color3)

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10

            dataRef.current.push({
                velocity: new THREE.Vector3(0, 0, 0),
                target: null,
                energy: Math.random(),
                phase: Math.random() * Math.PI * 2
            })

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

        // Initialize attractors
        for (let i = 0; i < attractorCount; i++) {
            attractorsRef.current.push({
                position: new THREE.Vector3(
                    Math.cos(i / attractorCount * Math.PI * 2) * 4,
                    Math.sin(i / attractorCount * Math.PI * 2) * 4,
                    0
                ),
                strength: 0.5 + Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2
            })
        }

        return { positions, colors }
    }, [particleCount, attractorCount, color1, color2, color3])

    useFrame((state) => {
        if (!pointsRef.current) return

        const pos = pointsRef.current.geometry.attributes.position.array
        const time = state.clock.elapsedTime

        // Update attractor positions (moving targets)
        attractorsRef.current.forEach((attractor, i) => {
            attractor.position.x = Math.cos(time * 0.3 + attractor.phase + i) * 4
            attractor.position.y = Math.sin(time * 0.4 + attractor.phase + i * 1.3) * 4
            attractor.position.z = Math.sin(time * 0.2 + i) * 2
        })

        // Update particles
        for (let i = 0; i < particleCount; i++) {
            const idx = i * 3
            const data = dataRef.current[i]
            const particlePos = new THREE.Vector3(pos[idx], pos[idx + 1], pos[idx + 2])

            // Find nearest attractor
            let nearestAttractor = attractorsRef.current[0]
            let nearestDist = Infinity

            for (const attractor of attractorsRef.current) {
                const dist = particlePos.distanceTo(attractor.position)
                if (dist < nearestDist) {
                    nearestDist = dist
                    nearestAttractor = attractor
                }
            }

            // Move towards attractor
            const toAttractor = nearestAttractor.position.clone().sub(particlePos)
            const dist = toAttractor.length()

            if (dist > 0.1) {
                toAttractor.normalize()

                // Attraction force (stronger when far)
                const attractionStrength = nearestAttractor.strength * 0.02
                data.velocity.add(toAttractor.multiplyScalar(attractionStrength))
            }

            // Repulsion from nearby particles (local avoidance)
            for (let j = 0; j < particleCount; j++) {
                if (i === j) continue

                const otherPos = new THREE.Vector3(
                    pos[j * 3],
                    pos[j * 3 + 1],
                    pos[j * 3 + 2]
                )

                const diff = particlePos.clone().sub(otherPos)
                const d = diff.length()

                if (d < 0.5 && d > 0) {
                    diff.normalize().multiplyScalar(0.01 / d)
                    data.velocity.add(diff)
                }
            }

            // Add circular motion around attractor
            const toCenter = nearestAttractor.position.clone().sub(particlePos)
            const tangent = new THREE.Vector3(-toCenter.y, toCenter.x, 0).normalize()
            data.velocity.add(tangent.multiplyScalar(0.002))

            // Damping
            data.velocity.multiplyScalar(0.95)
            data.velocity.clampLength(0, 0.1)

            // Apply velocity
            pos[idx] += data.velocity.x
            pos[idx + 1] += data.velocity.y
            pos[idx + 2] += data.velocity.z

            // Update energy
            data.energy = data.velocity.length() * 10
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true
    })

    return (
        <group>
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
                    size={0.1}
                    vertexColors
                    transparent
                    opacity={0.9}
                    sizeAttenuation
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </points>

            {/* Attractor visualizations */}
            {attractorsRef.current.map((_, i) => (
                <mesh key={i} position={attractorsRef.current[i]?.position || [0, 0, 0]}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshBasicMaterial
                        color={color1}
                        transparent
                        opacity={0.5}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
        </group>
    )
}
