import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Topological Wave Collapse
 * Wave function collapse for procedural generation visualization
 */
export default function TopologicalCollapse({
    gridSize = 8,
    cellSize = 0.5,
    color1 = '#6366f1',
    color2 = '#a855f7',
    color3 = '#22d3ee'
}) {
    const groupRef = useRef()
    const cellsRef = useRef([])
    const meshesRef = useRef([])

    // Initialize grid with superposition states
    const cells = useMemo(() => {
        const data = []

        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                for (let z = 0; z < gridSize; z++) {
                    data.push({
                        x: (x - gridSize / 2) * cellSize * 1.5,
                        y: (y - gridSize / 2) * cellSize * 1.5,
                        z: (z - gridSize / 2) * cellSize * 1.5,
                        entropy: 1, // Full superposition
                        collapsed: false,
                        state: Math.floor(Math.random() * 5), // Module type
                        collapseTime: Math.random() * 10,
                        oscillation: Math.random() * Math.PI * 2
                    })
                }
            }
        }

        cellsRef.current = data
        return data
    }, [gridSize, cellSize])

    let collapseIndex = 0

    useFrame((state) => {
        if (!groupRef.current) return

        const time = state.clock.elapsedTime

        // Gradually collapse cells
        cellsRef.current.forEach((cell, i) => {
            const mesh = meshesRef.current[i]
            if (!mesh) return

            if (!cell.collapsed && time > cell.collapseTime) {
                cell.collapsed = true
                cell.entropy = 0
            }

            if (cell.collapsed) {
                // Stable collapsed state
                mesh.scale.setScalar(0.8 + Math.sin(time * 2 + cell.oscillation) * 0.05)
                mesh.material.opacity = 0.8
            } else {
                // Oscillating superposition state
                const oscillation = Math.sin(time * 5 + cell.oscillation) * 0.3 + 0.5
                mesh.scale.setScalar(oscillation)
                mesh.material.opacity = oscillation * 0.5
            }
        })

        groupRef.current.rotation.y = time * 0.05
        groupRef.current.rotation.x = Math.sin(time * 0.1) * 0.1
    })

    const c1 = new THREE.Color(color1)
    const c2 = new THREE.Color(color2)
    const c3 = new THREE.Color(color3)

    // Different geometries for different states
    const geometries = useMemo(() => [
        new THREE.BoxGeometry(cellSize, cellSize, cellSize),
        new THREE.OctahedronGeometry(cellSize * 0.6),
        new THREE.TetrahedronGeometry(cellSize * 0.6),
        new THREE.IcosahedronGeometry(cellSize * 0.5),
        new THREE.DodecahedronGeometry(cellSize * 0.5)
    ], [cellSize])

    return (
        <group ref={groupRef}>
            {cells.map((cell, i) => {
                const t = i / cells.length
                let color
                if (t < 0.33) {
                    color = c1.clone().lerp(c2, t * 3)
                } else if (t < 0.66) {
                    color = c2.clone().lerp(c3, (t - 0.33) * 3)
                } else {
                    color = c3.clone().lerp(c1, (t - 0.66) * 3)
                }

                return (
                    <mesh
                        key={i}
                        ref={(el) => meshesRef.current[i] = el}
                        position={[cell.x, cell.y, cell.z]}
                        geometry={geometries[cell.state]}
                    >
                        <meshStandardMaterial
                            color={color}
                            emissive={color}
                            emissiveIntensity={0.4}
                            transparent
                            opacity={0.5}
                            wireframe={!cell.collapsed}
                        />
                    </mesh>
                )
            })}
        </group>
    )
}
