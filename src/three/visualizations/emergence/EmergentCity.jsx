import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Emergent City from Agents Simulation
 * Agent-based urban growth simulation
 */
export default function EmergentCity({
    buildingCount = 100,
    roadAgents = 20,
    color1 = '#6366f1',
    color2 = '#a855f7',
    color3 = '#22d3ee'
}) {
    const groupRef = useRef()
    const buildingsRef = useRef([])
    const roadsRef = useRef([])
    const meshesRef = useRef([])

    // Initialize city
    const { buildings, roads } = useMemo(() => {
        const buildingData = []
        const roadData = []

        // Generate road network (simple grid + randomness)
        for (let i = 0; i < roadAgents; i++) {
            roadData.push({
                position: new THREE.Vector3(
                    (Math.random() - 0.5) * 20,
                    0,
                    (Math.random() - 0.5) * 20
                ),
                direction: new THREE.Vector3(
                    Math.random() - 0.5,
                    0,
                    Math.random() - 0.5
                ).normalize(),
                path: []
            })
        }

        // Generate buildings along roads
        for (let i = 0; i < buildingCount; i++) {
            const roadIndex = Math.floor(Math.random() * roadAgents)
            const offset = (Math.random() - 0.5) * 2

            buildingData.push({
                position: new THREE.Vector3(
                    (Math.random() - 0.5) * 16,
                    0,
                    (Math.random() - 0.5) * 16
                ),
                width: 0.3 + Math.random() * 0.4,
                depth: 0.3 + Math.random() * 0.4,
                height: 0.2 + Math.random() * Math.random() * 2,
                growthProgress: 0,
                growthSpeed: 0.01 + Math.random() * 0.02,
                colorIndex: Math.random()
            })
        }

        buildingsRef.current = buildingData
        roadsRef.current = roadData

        return { buildings: buildingData, roads: roadData }
    }, [buildingCount, roadAgents])

    useFrame((state) => {
        if (!groupRef.current) return

        const time = state.clock.elapsedTime

        // Grow buildings
        buildingsRef.current.forEach((building, i) => {
            const mesh = meshesRef.current[i]
            if (!mesh) return

            // Gradual growth
            if (building.growthProgress < 1) {
                building.growthProgress += building.growthSpeed
                building.growthProgress = Math.min(1, building.growthProgress)
            }

            // Update mesh
            const currentHeight = building.height * building.growthProgress
            mesh.scale.y = Math.max(0.01, building.growthProgress)
            mesh.position.y = currentHeight / 2

            // Slight sway
            mesh.rotation.x = Math.sin(time + i) * 0.01
            mesh.rotation.z = Math.cos(time * 0.7 + i) * 0.01
        })

        groupRef.current.rotation.y = time * 0.02
    })

    const c1 = new THREE.Color(color1)
    const c2 = new THREE.Color(color2)
    const c3 = new THREE.Color(color3)

    return (
        <group ref={groupRef}>
            {/* Ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial
                    color="#1e1b4b"
                    metalness={0.3}
                    roughness={0.8}
                />
            </mesh>

            {/* Buildings */}
            {buildings.map((building, i) => {
                let color
                if (building.colorIndex < 0.33) {
                    color = c1.clone().lerp(c2, building.colorIndex * 3)
                } else if (building.colorIndex < 0.66) {
                    color = c2.clone().lerp(c3, (building.colorIndex - 0.33) * 3)
                } else {
                    color = c3.clone()
                }

                return (
                    <mesh
                        key={i}
                        ref={(el) => meshesRef.current[i] = el}
                        position={[building.position.x, building.height / 2, building.position.z]}
                    >
                        <boxGeometry args={[building.width, building.height, building.depth]} />
                        <meshStandardMaterial
                            color={color}
                            emissive={color}
                            emissiveIntensity={0.3}
                            metalness={0.5}
                            roughness={0.5}
                        />
                    </mesh>
                )
            })}

            {/* Road indicators (simple dots) */}
            {roads.map((road, i) => (
                <mesh key={`road-${i}`} position={road.position}>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
                </mesh>
            ))}
        </group>
    )
}
