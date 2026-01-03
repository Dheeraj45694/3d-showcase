import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Quantum Foam Simulation
 * Visualizes quantum vacuum fluctuations at Planck scale
 * Dynamic spheres spawning/despawning based on probability fields
 */
export default function QuantumFoam({
    bubbleCount = 200,
    maxRadius = 0.3,
    noiseScale = 0.5,
    color1 = '#6366f1',
    color2 = '#a855f7',
    color3 = '#22d3ee'
}) {
    const groupRef = useRef()
    const bubblesRef = useRef([])
    const meshRefs = useRef([])

    // Initialize bubbles
    const bubbles = useMemo(() => {
        const data = []

        for (let i = 0; i < bubbleCount; i++) {
            data.push({
                position: new THREE.Vector3(
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 8
                ),
                baseRadius: Math.random() * maxRadius + 0.05,
                phase: Math.random() * Math.PI * 2,
                frequency: 0.5 + Math.random() * 2,
                lifetime: Math.random(),
                color: new THREE.Color().lerpColors(
                    new THREE.Color(color1),
                    new THREE.Color(color2),
                    Math.random()
                )
            })
        }

        bubblesRef.current = data
        return data
    }, [bubbleCount, maxRadius, color1, color2])

    // 4D noise function (x, y, z, time)
    const noise4D = (x, y, z, w) => {
        return (
            Math.sin(x * 1.5 + w) *
            Math.cos(y * 1.3 + w * 0.7) *
            Math.sin(z * 1.1 + w * 1.2) *
            Math.cos((x + y + z) * 0.5 + w)
        ) * 0.5 + 0.5
    }

    useFrame((state) => {
        if (!groupRef.current) return

        const time = state.clock.elapsedTime

        bubblesRef.current.forEach((bubble, i) => {
            const mesh = meshRefs.current[i]
            if (!mesh) return

            // Quantum probability field
            const probability = noise4D(
                bubble.position.x * noiseScale,
                bubble.position.y * noiseScale,
                bubble.position.z * noiseScale,
                time * 0.5
            )

            // Radius fluctuates based on probability
            const targetRadius = probability > 0.4
                ? bubble.baseRadius * probability * 2
                : 0

            // Smooth interpolation
            mesh.scale.setScalar(
                THREE.MathUtils.lerp(mesh.scale.x, targetRadius, 0.1)
            )

            // Opacity based on probability
            if (mesh.material) {
                mesh.material.opacity = probability * 0.6
            }

            // Gentle position drift
            bubble.position.x += Math.sin(time * bubble.frequency + bubble.phase) * 0.002
            bubble.position.y += Math.cos(time * bubble.frequency * 0.7 + bubble.phase) * 0.002
            bubble.position.z += Math.sin(time * bubble.frequency * 1.3 + bubble.phase) * 0.002

            // Wrap around bounds
            const bounds = 4
            if (bubble.position.x > bounds) bubble.position.x = -bounds
            if (bubble.position.x < -bounds) bubble.position.x = bounds
            if (bubble.position.y > bounds) bubble.position.y = -bounds
            if (bubble.position.y < -bounds) bubble.position.y = bounds
            if (bubble.position.z > bounds) bubble.position.z = -bounds
            if (bubble.position.z < -bounds) bubble.position.z = bounds

            mesh.position.copy(bubble.position)
        })

        groupRef.current.rotation.y = time * 0.03
    })

    return (
        <group ref={groupRef}>
            {bubbles.map((bubble, i) => (
                <mesh
                    key={i}
                    ref={(el) => meshRefs.current[i] = el}
                    position={bubble.position}
                >
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshStandardMaterial
                        color={bubble.color}
                        emissive={bubble.color}
                        emissiveIntensity={0.5}
                        transparent
                        opacity={0.5}
                        metalness={0.3}
                        roughness={0.7}
                    />
                </mesh>
            ))}
        </group>
    )
}
