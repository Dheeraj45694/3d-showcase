import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Perlin Noise Volumetric Clouds
 * Ray marching with 3D noise for cloud rendering
 */
export default function PerlinClouds({
    cloudCount = 30,
    color1 = '#6366f1',
    color2 = '#a855f7'
}) {
    const groupRef = useRef()
    const cloudsRef = useRef([])
    const meshesRef = useRef([])

    // 3D Noise function
    const noise3D = (x, y, z) => {
        return (
            Math.sin(x * 1.5) * Math.cos(y * 1.3) * Math.sin(z * 1.1) +
            Math.sin(x * 0.7 + y * 0.5) * Math.cos(z * 0.8) * 0.5 +
            Math.sin(x * 2.1 + z * 1.7) * 0.25
        ) * 0.5 + 0.5
    }

    // Initialize cloud particles
    const clouds = useMemo(() => {
        const data = []

        for (let i = 0; i < cloudCount; i++) {
            // Distribute in a cloud-like pattern
            const theta = Math.random() * Math.PI * 2
            const phi = Math.random() * Math.PI
            const r = 2 + Math.random() * 4

            data.push({
                position: new THREE.Vector3(
                    r * Math.sin(phi) * Math.cos(theta),
                    r * Math.sin(phi) * Math.sin(theta) * 0.3,
                    r * Math.cos(phi)
                ),
                baseScale: 0.5 + Math.random() * 1.5,
                phase: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 0.5
            })
        }

        cloudsRef.current = data
        return data
    }, [cloudCount])

    useFrame((state) => {
        if (!groupRef.current) return

        const time = state.clock.elapsedTime

        cloudsRef.current.forEach((cloud, i) => {
            const mesh = meshesRef.current[i]
            if (!mesh) return

            // Animate position with noise
            const noiseX = noise3D(cloud.position.x * 0.1 + time * 0.1, 0, 0)
            const noiseY = noise3D(0, cloud.position.y * 0.1 + time * 0.1, 0)
            const noiseZ = noise3D(0, 0, cloud.position.z * 0.1 + time * 0.1)

            mesh.position.x = cloud.position.x + (noiseX - 0.5) * 2
            mesh.position.y = cloud.position.y + (noiseY - 0.5)
            mesh.position.z = cloud.position.z + (noiseZ - 0.5) * 2

            // Animate scale (breathing effect)
            const scale = cloud.baseScale * (0.8 + Math.sin(time * cloud.speed + cloud.phase) * 0.2)
            mesh.scale.setScalar(scale)

            // Animate opacity
            const opacity = 0.3 + Math.sin(time + cloud.phase) * 0.15
            if (mesh.material) {
                mesh.material.opacity = opacity
            }
        })

        groupRef.current.rotation.y = time * 0.02
    })

    const c1 = new THREE.Color(color1)
    const c2 = new THREE.Color(color2)

    return (
        <group ref={groupRef}>
            {clouds.map((cloud, i) => {
                const t = i / cloudCount
                const color = c1.clone().lerp(c2, t)

                return (
                    <mesh
                        key={i}
                        ref={(el) => meshesRef.current[i] = el}
                        position={cloud.position}
                    >
                        <sphereGeometry args={[1, 16, 16]} />
                        <meshStandardMaterial
                            color={color}
                            emissive={color}
                            emissiveIntensity={0.2}
                            transparent
                            opacity={0.4}
                            metalness={0.1}
                            roughness={0.9}
                        />
                    </mesh>
                )
            })}
        </group>
    )
}
