import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Procedural Crystal Growth
 * Diffusion-Limited Aggregation (DLA) simulation
 */
export default function CrystalGrowth({
    maxParticles = 500,
    growthRate = 3,
    branchingFactor = 0.7,
    color1 = '#6366f1',
    color2 = '#a855f7',
    color3 = '#22d3ee'
}) {
    const groupRef = useRef()
    const crystalRef = useRef([])
    const meshesRef = useRef([])
    const particlesRef = useRef([])

    // Initialize crystal seed
    const { initialCrystal, colors } = useMemo(() => {
        // Start with a small seed crystal
        const seed = [
            { pos: new THREE.Vector3(0, 0, 0), generation: 0 }
        ]

        crystalRef.current = seed

        // Initialize wandering particles
        for (let i = 0; i < 50; i++) {
            particlesRef.current.push({
                pos: new THREE.Vector3(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10
                ),
                active: true
            })
        }

        const c1 = new THREE.Color(color1)
        const c2 = new THREE.Color(color2)
        const c3 = new THREE.Color(color3)

        return {
            initialCrystal: seed,
            colors: { c1, c2, c3 }
        }
    }, [color1, color2, color3])

    let frameCount = 0

    useFrame((state) => {
        if (!groupRef.current) return

        frameCount++
        if (frameCount % 2 !== 0) return

        const crystal = crystalRef.current
        const particles = particlesRef.current

        // Limit crystal size
        if (crystal.length >= maxParticles) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
            return
        }

        // Move wandering particles (random walk)
        for (const particle of particles) {
            if (!particle.active) continue

            particle.pos.x += (Math.random() - 0.5) * 0.3
            particle.pos.y += (Math.random() - 0.5) * 0.3
            particle.pos.z += (Math.random() - 0.5) * 0.3

            // Check collision with crystal
            for (const node of crystal) {
                const dist = particle.pos.distanceTo(node.pos)
                if (dist < 0.4) {
                    // Attach to crystal
                    const direction = particle.pos.clone().sub(node.pos).normalize()
                    const newPos = node.pos.clone().add(direction.multiplyScalar(0.35))

                    // Add branching chance
                    if (Math.random() < branchingFactor || crystal.length < 10) {
                        crystal.push({
                            pos: newPos,
                            generation: node.generation + 1
                        })
                    }

                    // Reset particle
                    particle.pos.set(
                        (Math.random() - 0.5) * 10,
                        (Math.random() - 0.5) * 10,
                        (Math.random() - 0.5) * 10
                    )
                    break
                }
            }

            // Respawn if too far
            if (particle.pos.length() > 8) {
                particle.pos.set(
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 6
                )
            }
        }

        // Update meshes
        meshesRef.current.forEach((mesh, i) => {
            if (mesh && crystal[i]) {
                mesh.visible = true
                mesh.position.copy(crystal[i].pos)

                // Color based on generation
                const gen = crystal[i].generation
                const maxGen = 20
                const t = Math.min(gen / maxGen, 1)

                if (mesh.material) {
                    let color
                    if (t < 0.5) {
                        color = colors.c1.clone().lerp(colors.c2, t * 2)
                    } else {
                        color = colors.c2.clone().lerp(colors.c3, (t - 0.5) * 2)
                    }
                    mesh.material.color = color
                    mesh.material.emissive = color
                }
            }
        })

        groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    })

    // Pre-create mesh pool
    const meshPool = useMemo(() => {
        return Array(maxParticles).fill(null).map((_, i) => ({
            id: i,
            visible: false
        }))
    }, [maxParticles])

    return (
        <group ref={groupRef}>
            {meshPool.map((_, i) => (
                <mesh
                    key={i}
                    ref={(el) => meshesRef.current[i] = el}
                    visible={false}
                >
                    <octahedronGeometry args={[0.15, 0]} />
                    <meshStandardMaterial
                        color={color1}
                        emissive={color1}
                        emissiveIntensity={0.4}
                        metalness={0.8}
                        roughness={0.2}
                    />
                </mesh>
            ))}
        </group>
    )
}
