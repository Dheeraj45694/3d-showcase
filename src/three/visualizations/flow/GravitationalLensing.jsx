import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Gravitational Lensing Distortion Fields
 * Schwarzschild metric light bending visualization
 * deflection = 4 * G * M / (c² * r)
 */
export default function GravitationalLensing({
    starCount = 500,
    massCount = 3,
    distortionStrength = 2,
    color1 = '#ffffff',
    color2 = '#6366f1',
    lensColor = '#a855f7'
}) {
    const starsRef = useRef()
    const lensesRef = useRef([])
    const originalPositions = useRef(null)

    // Initialize star field
    const { positions, colors, sizes, masses } = useMemo(() => {
        const positions = new Float32Array(starCount * 3)
        const colors = new Float32Array(starCount * 3)
        const sizes = new Float32Array(starCount)
        const original = new Float32Array(starCount * 3)

        const c1 = new THREE.Color(color1)
        const c2 = new THREE.Color(color2)

        for (let i = 0; i < starCount; i++) {
            // Distribute on a sphere (background)
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            const r = 15

            const x = r * Math.sin(phi) * Math.cos(theta)
            const y = r * Math.sin(phi) * Math.sin(theta)
            const z = r * Math.cos(phi)

            positions[i * 3] = x
            positions[i * 3 + 1] = y
            positions[i * 3 + 2] = z

            original[i * 3] = x
            original[i * 3 + 1] = y
            original[i * 3 + 2] = z

            // Random colors (white to blue)
            const t = Math.random()
            const color = c1.clone().lerp(c2, t * 0.3)
            colors[i * 3] = color.r
            colors[i * 3 + 1] = color.g
            colors[i * 3 + 2] = color.b

            sizes[i] = Math.random() * 0.1 + 0.02
        }

        originalPositions.current = original

        // Initialize massive objects (lenses)
        const masses = []
        for (let i = 0; i < massCount; i++) {
            masses.push({
                position: new THREE.Vector3(
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 2
                ),
                mass: 1 + Math.random() * 2,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02,
                    0
                )
            })
        }
        lensesRef.current = masses

        return { positions, colors, sizes, masses }
    }, [starCount, massCount, color1, color2])

    useFrame((state) => {
        if (!starsRef.current || !originalPositions.current) return

        const time = state.clock.elapsedTime
        const pos = starsRef.current.geometry.attributes.position.array
        const orig = originalPositions.current

        // Update lens positions
        for (const lens of lensesRef.current) {
            lens.position.x = Math.sin(time * 0.3 + lens.mass) * 3
            lens.position.y = Math.cos(time * 0.4 + lens.mass * 0.7) * 3
        }

        // Apply gravitational lensing distortion
        for (let i = 0; i < starCount; i++) {
            const idx = i * 3
            let totalDisplacementX = 0
            let totalDisplacementY = 0

            const starX = orig[idx]
            const starY = orig[idx + 1]
            const starZ = orig[idx + 2]

            // Project to 2D plane for lensing calculation
            for (const lens of lensesRef.current) {
                const dx = starX - lens.position.x
                const dy = starY - lens.position.y
                const dist = Math.sqrt(dx * dx + dy * dy)

                if (dist > 0.5) {
                    // Gravitational deflection (simplified)
                    const deflection = (lens.mass * distortionStrength) / (dist * dist)

                    // Tangential displacement
                    totalDisplacementX += (dx / dist) * deflection
                    totalDisplacementY += (dy / dist) * deflection
                }
            }

            // Apply distortion
            pos[idx] = starX + totalDisplacementX
            pos[idx + 1] = starY + totalDisplacementY
            pos[idx + 2] = starZ
        }

        starsRef.current.geometry.attributes.position.needsUpdate = true
    })

    return (
        <group>
            {/* Background stars */}
            <points ref={starsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={starCount}
                        array={positions}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={starCount}
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

            {/* Lens objects (black holes / massive objects) */}
            {masses.map((mass, i) => (
                <mesh key={i} position={mass.position}>
                    <sphereGeometry args={[0.3 * mass.mass, 32, 32]} />
                    <meshBasicMaterial
                        color="#000000"
                        transparent
                        opacity={0.9}
                    />
                </mesh>
            ))}

            {/* Accretion disk effect */}
            {masses.map((mass, i) => (
                <mesh
                    key={`ring-${i}`}
                    position={mass.position}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <ringGeometry args={[0.4 * mass.mass, 0.8 * mass.mass, 64]} />
                    <meshBasicMaterial
                        color={lensColor}
                        transparent
                        opacity={0.4}
                        side={THREE.DoubleSide}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
        </group>
    )
}
