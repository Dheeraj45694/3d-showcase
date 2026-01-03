import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Cellular Automata Landscapes
 * 3D Game of Life with multiple rulesets
 */
export default function CellularAutomata({
    gridSize = 24,
    cellSize = 0.2,
    color1 = '#6366f1',
    color2 = '#a855f7',
    color3 = '#22d3ee'
}) {
    const groupRef = useRef()
    const gridRef = useRef(null)
    const meshesRef = useRef([])

    // 3D Grid initialization
    const cells = useMemo(() => {
        const size = gridSize
        const grid = new Uint8Array(size * size * size)
        const ages = new Uint8Array(size * size * size)

        // Random initial state
        for (let i = 0; i < grid.length; i++) {
            grid[i] = Math.random() > 0.85 ? 1 : 0
            ages[i] = 0
        }

        gridRef.current = { grid, ages, size }

        // Create cell data
        const cellData = []
        for (let z = 0; z < size; z++) {
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    cellData.push({
                        x: (x - size / 2) * cellSize * 1.5,
                        y: (y - size / 2) * cellSize * 1.5,
                        z: (z - size / 2) * cellSize * 1.5,
                        index: z * size * size + y * size + x
                    })
                }
            }
        }

        return cellData
    }, [gridSize, cellSize])

    // Count neighbors in 3D
    const countNeighbors = (grid, x, y, z, size) => {
        let count = 0
        for (let dz = -1; dz <= 1; dz++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0 && dz === 0) continue

                    const nx = (x + dx + size) % size
                    const ny = (y + dy + size) % size
                    const nz = (z + dz + size) % size

                    if (grid[nz * size * size + ny * size + nx]) {
                        count++
                    }
                }
            }
        }
        return count
    }

    let frameCount = 0

    useFrame((state) => {
        if (!groupRef.current || !gridRef.current) return

        frameCount++
        if (frameCount % 5 !== 0) return // Slow down simulation

        const { grid, ages, size } = gridRef.current
        const newGrid = new Uint8Array(size * size * size)
        const newAges = new Uint8Array(size * size * size)

        const c1 = new THREE.Color(color1)
        const c2 = new THREE.Color(color2)
        const c3 = new THREE.Color(color3)

        // 3D Game of Life rules (4555 variant)
        // Born with 4 neighbors
        // Survives with 5-5 neighbors
        for (let z = 0; z < size; z++) {
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const idx = z * size * size + y * size + x
                    const neighbors = countNeighbors(grid, x, y, z, size)
                    const alive = grid[idx]

                    if (alive) {
                        // Survival rule
                        newGrid[idx] = (neighbors >= 4 && neighbors <= 6) ? 1 : 0
                        newAges[idx] = newGrid[idx] ? Math.min(ages[idx] + 1, 20) : 0
                    } else {
                        // Birth rule
                        newGrid[idx] = (neighbors === 4) ? 1 : 0
                        newAges[idx] = 0
                    }

                    // Update mesh visibility and color
                    const mesh = meshesRef.current[idx]
                    if (mesh) {
                        mesh.visible = newGrid[idx] === 1

                        if (mesh.visible && mesh.material) {
                            const age = newAges[idx] / 20
                            let color
                            if (age < 0.33) {
                                color = c1.clone().lerp(c2, age * 3)
                            } else if (age < 0.66) {
                                color = c2.clone().lerp(c3, (age - 0.33) * 3)
                            } else {
                                color = c3.clone()
                            }
                            mesh.material.color = color
                            mesh.material.emissive = color
                            mesh.material.emissiveIntensity = 0.3 + age * 0.4
                        }
                    }
                }
            }
        }

        gridRef.current.grid = newGrid
        gridRef.current.ages = newAges

        groupRef.current.rotation.y = state.clock.elapsedTime * 0.05
    })

    return (
        <group ref={groupRef}>
            {cells.map((cell, i) => (
                <mesh
                    key={i}
                    ref={(el) => meshesRef.current[cell.index] = el}
                    position={[cell.x, cell.y, cell.z]}
                    visible={gridRef.current?.grid[cell.index] === 1}
                >
                    <boxGeometry args={[cellSize, cellSize, cellSize]} />
                    <meshStandardMaterial
                        color={color1}
                        emissive={color1}
                        emissiveIntensity={0.3}
                        transparent
                        opacity={0.8}
                    />
                </mesh>
            ))}
        </group>
    )
}
