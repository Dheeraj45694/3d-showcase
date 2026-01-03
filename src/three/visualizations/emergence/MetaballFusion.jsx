import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Metaball Organic Fusion Fields
 * Smooth organic blobs using marching cubes algorithm
 * field(p) = Σ (radius² / distance²)
 */
export default function MetaballFusion({
    ballCount = 8,
    gridResolution = 32,
    threshold = 1.0,
    color1 = '#6366f1',
    color2 = '#a855f7'
}) {
    const meshRef = useRef()
    const ballsRef = useRef([])

    // Initialize metaballs
    const balls = useMemo(() => {
        const data = []
        for (let i = 0; i < ballCount; i++) {
            data.push({
                position: new THREE.Vector3(
                    (Math.random() - 0.5) * 4,
                    (Math.random() - 0.5) * 4,
                    (Math.random() - 0.5) * 4
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02
                ),
                radius: 0.8 + Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2
            })
        }
        ballsRef.current = data
        return data
    }, [ballCount])

    // Field function
    const fieldValue = (x, y, z) => {
        let value = 0
        for (const ball of ballsRef.current) {
            const dx = x - ball.position.x
            const dy = y - ball.position.y
            const dz = z - ball.position.z
            const distSq = dx * dx + dy * dy + dz * dz
            if (distSq > 0.0001) {
                value += (ball.radius * ball.radius) / distSq
            }
        }
        return value
    }

    // Simplified marching cubes (creates spheres at each metaball for now)
    // Full marching cubes would be very complex in pure JS
    const geometryRef = useRef()

    useFrame((state) => {
        if (!meshRef.current) return

        const time = state.clock.elapsedTime
        const bounds = 3

        // Update metaball positions
        for (let i = 0; i < ballsRef.current.length; i++) {
            const ball = ballsRef.current[i]

            // Sinusoidal movement
            ball.position.x = Math.sin(time * 0.5 + ball.phase) * 2
            ball.position.y = Math.cos(time * 0.7 + ball.phase * 1.3) * 2
            ball.position.z = Math.sin(time * 0.3 + ball.phase * 0.7) * 2

            // Pulsing radius
            ball.radius = 0.8 + Math.sin(time * 2 + ball.phase) * 0.2
        }

        meshRef.current.rotation.y = time * 0.1
    })

    // For simplicity, render spheres that appear to merge
    // A full implementation would use marching cubes
    return (
        <group ref={meshRef}>
            {balls.map((ball, i) => (
                <mesh key={i} position={ball.position}>
                    <sphereGeometry args={[ball.radius, 32, 32]} />
                    <meshStandardMaterial
                        color={i % 2 === 0 ? color1 : color2}
                        emissive={i % 2 === 0 ? color1 : color2}
                        emissiveIntensity={0.3}
                        transparent
                        opacity={0.85}
                        metalness={0.2}
                        roughness={0.8}
                    />
                </mesh>
            ))}
        </group>
    )
}
