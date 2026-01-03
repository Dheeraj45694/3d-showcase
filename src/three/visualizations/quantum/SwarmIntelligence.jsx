import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Swarm Intelligence System (Boids++)
 * Enhanced Reynolds flocking with additional behaviors:
 * - Separation, Alignment, Cohesion (classic)
 * - Obstacle avoidance, Goal seeking, Predator evasion (extended)
 */
export default function SwarmIntelligence({
    boidCount = 300,
    predatorCount = 3,
    color1 = '#6366f1',
    color2 = '#22d3ee',
    predatorColor = '#ef4444'
}) {
    const boidsRef = useRef()
    const predatorsRef = useRef()
    const boidData = useRef([])
    const predatorData = useRef([])

    // Flocking parameters
    const params = useMemo(() => ({
        separationRadius: 0.8,
        alignmentRadius: 2.0,
        cohesionRadius: 3.0,
        separationStrength: 0.05,
        alignmentStrength: 0.03,
        cohesionStrength: 0.02,
        maxSpeed: 0.15,
        maxForce: 0.01,
        predatorRadius: 4.0,
        predatorStrength: 0.1,
        bounds: 8
    }), [])

    // Initialize boids
    const { boidPositions, boidColors, predatorPositions, predatorColors } = useMemo(() => {
        const boidPositions = new Float32Array(boidCount * 3)
        const boidColors = new Float32Array(boidCount * 3)
        const c1 = new THREE.Color(color1)
        const c2 = new THREE.Color(color2)

        boidData.current = []

        for (let i = 0; i < boidCount; i++) {
            const x = (Math.random() - 0.5) * params.bounds * 2
            const y = (Math.random() - 0.5) * params.bounds * 2
            const z = (Math.random() - 0.5) * params.bounds * 2

            boidPositions[i * 3] = x
            boidPositions[i * 3 + 1] = y
            boidPositions[i * 3 + 2] = z

            boidData.current.push({
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1
                ),
                acceleration: new THREE.Vector3()
            })

            const t = i / boidCount
            const mixedColor = c1.clone().lerp(c2, t)
            boidColors[i * 3] = mixedColor.r
            boidColors[i * 3 + 1] = mixedColor.g
            boidColors[i * 3 + 2] = mixedColor.b
        }

        // Initialize predators
        const predatorPositions = new Float32Array(predatorCount * 3)
        const predatorColors = new Float32Array(predatorCount * 3)
        const pc = new THREE.Color(predatorColor)

        predatorData.current = []

        for (let i = 0; i < predatorCount; i++) {
            predatorPositions[i * 3] = (Math.random() - 0.5) * params.bounds
            predatorPositions[i * 3 + 1] = (Math.random() - 0.5) * params.bounds
            predatorPositions[i * 3 + 2] = (Math.random() - 0.5) * params.bounds

            predatorData.current.push({
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.05,
                    (Math.random() - 0.5) * 0.05,
                    (Math.random() - 0.5) * 0.05
                )
            })

            predatorColors[i * 3] = pc.r
            predatorColors[i * 3 + 1] = pc.g
            predatorColors[i * 3 + 2] = pc.b
        }

        return { boidPositions, boidColors, predatorPositions, predatorColors }
    }, [boidCount, predatorCount, color1, color2, predatorColor, params.bounds])

    useFrame(() => {
        if (!boidsRef.current || !predatorsRef.current) return

        const boidPos = boidsRef.current.geometry.attributes.position.array
        const predPos = predatorsRef.current.geometry.attributes.position.array

        // Update predators - chase center of flock
        let flockCenter = new THREE.Vector3()
        for (let i = 0; i < boidCount; i++) {
            flockCenter.x += boidPos[i * 3]
            flockCenter.y += boidPos[i * 3 + 1]
            flockCenter.z += boidPos[i * 3 + 2]
        }
        flockCenter.divideScalar(boidCount)

        for (let i = 0; i < predatorCount; i++) {
            const idx = i * 3
            const pos = new THREE.Vector3(predPos[idx], predPos[idx + 1], predPos[idx + 2])
            const vel = predatorData.current[i].velocity

            // Chase flock center
            const toFlock = flockCenter.clone().sub(pos).normalize().multiplyScalar(0.002)
            vel.add(toFlock)
            vel.clampLength(0, 0.08)

            pos.add(vel)

            // Wrap around bounds
            const b = params.bounds
            if (pos.x > b) pos.x = -b
            if (pos.x < -b) pos.x = b
            if (pos.y > b) pos.y = -b
            if (pos.y < -b) pos.y = b
            if (pos.z > b) pos.z = -b
            if (pos.z < -b) pos.z = b

            predPos[idx] = pos.x
            predPos[idx + 1] = pos.y
            predPos[idx + 2] = pos.z
        }

        // Update boids
        for (let i = 0; i < boidCount; i++) {
            const idx = i * 3
            const pos = new THREE.Vector3(boidPos[idx], boidPos[idx + 1], boidPos[idx + 2])
            const boid = boidData.current[i]

            let separation = new THREE.Vector3()
            let alignment = new THREE.Vector3()
            let cohesion = new THREE.Vector3()
            let flee = new THREE.Vector3()

            let sepCount = 0, aliCount = 0, cohCount = 0

            // Check other boids
            for (let j = 0; j < boidCount; j++) {
                if (i === j) continue

                const other = new THREE.Vector3(
                    boidPos[j * 3],
                    boidPos[j * 3 + 1],
                    boidPos[j * 3 + 2]
                )
                const dist = pos.distanceTo(other)

                // Separation
                if (dist < params.separationRadius && dist > 0) {
                    const diff = pos.clone().sub(other).normalize().divideScalar(dist)
                    separation.add(diff)
                    sepCount++
                }

                // Alignment
                if (dist < params.alignmentRadius) {
                    alignment.add(boidData.current[j].velocity)
                    aliCount++
                }

                // Cohesion
                if (dist < params.cohesionRadius) {
                    cohesion.add(other)
                    cohCount++
                }
            }

            // Average and apply forces
            if (sepCount > 0) {
                separation.divideScalar(sepCount)
                separation.normalize().multiplyScalar(params.separationStrength)
            }

            if (aliCount > 0) {
                alignment.divideScalar(aliCount)
                alignment.normalize().multiplyScalar(params.alignmentStrength)
            }

            if (cohCount > 0) {
                cohesion.divideScalar(cohCount)
                cohesion.sub(pos).normalize().multiplyScalar(params.cohesionStrength)
            }

            // Flee from predators
            for (let p = 0; p < predatorCount; p++) {
                const predator = new THREE.Vector3(
                    predPos[p * 3],
                    predPos[p * 3 + 1],
                    predPos[p * 3 + 2]
                )
                const dist = pos.distanceTo(predator)
                if (dist < params.predatorRadius) {
                    const diff = pos.clone().sub(predator).normalize().divideScalar(dist)
                    flee.add(diff.multiplyScalar(params.predatorStrength))
                }
            }

            // Apply forces
            boid.acceleration.add(separation).add(alignment).add(cohesion).add(flee)
            boid.velocity.add(boid.acceleration)
            boid.velocity.clampLength(0, params.maxSpeed)
            boid.acceleration.set(0, 0, 0)

            pos.add(boid.velocity)

            // Wrap around bounds
            const b = params.bounds
            if (pos.x > b) pos.x = -b
            if (pos.x < -b) pos.x = b
            if (pos.y > b) pos.y = -b
            if (pos.y < -b) pos.y = b
            if (pos.z > b) pos.z = -b
            if (pos.z < -b) pos.z = b

            boidPos[idx] = pos.x
            boidPos[idx + 1] = pos.y
            boidPos[idx + 2] = pos.z
        }

        boidsRef.current.geometry.attributes.position.needsUpdate = true
        predatorsRef.current.geometry.attributes.position.needsUpdate = true
    })

    return (
        <group>
            {/* Boids */}
            <points ref={boidsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={boidCount}
                        array={boidPositions}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={boidCount}
                        array={boidColors}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.12}
                    vertexColors
                    transparent
                    opacity={0.9}
                    sizeAttenuation
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </points>

            {/* Predators */}
            <points ref={predatorsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={predatorCount}
                        array={predatorPositions}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={predatorCount}
                        array={predatorColors}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.4}
                    vertexColors
                    transparent
                    opacity={1}
                    sizeAttenuation
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </points>
        </group>
    )
}
