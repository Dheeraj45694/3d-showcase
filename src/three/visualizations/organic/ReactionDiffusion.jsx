import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Reaction-Diffusion System (Turing Patterns)
 * Gray-Scott model creating organic patterns
 * A' = Da * ∇²A - A*B² + f*(1-A)
 * B' = Db * ∇²B + A*B² - (k+f)*B
 */
export default function ReactionDiffusion({
    gridSize = 64,
    feed = 0.055,
    kill = 0.062,
    diffusionA = 1.0,
    diffusionB = 0.5,
    color1 = '#6366f1',
    color2 = '#1e1b4b',
    heightScale = 2
}) {
    const meshRef = useRef()
    const gridRef = useRef({ A: null, B: null })
    const geometryRef = useRef()

    // Initialize grids
    const { geometry, gridA, gridB } = useMemo(() => {
        const size = gridSize

        // Create plane geometry
        const geo = new THREE.PlaneGeometry(10, 10, size - 1, size - 1)

        // Initialize concentration grids
        const A = new Float32Array(size * size).fill(1)
        const B = new Float32Array(size * size).fill(0)

        // Seed with small area of B
        const centerX = Math.floor(size / 2)
        const centerY = Math.floor(size / 2)
        const seedRadius = 5

        for (let i = -seedRadius; i <= seedRadius; i++) {
            for (let j = -seedRadius; j <= seedRadius; j++) {
                if (i * i + j * j <= seedRadius * seedRadius) {
                    const idx = (centerY + j) * size + (centerX + i)
                    if (idx >= 0 && idx < size * size) {
                        B[idx] = 1
                    }
                }
            }
        }

        // Add some random seeds
        for (let s = 0; s < 10; s++) {
            const sx = Math.floor(Math.random() * (size - 10)) + 5
            const sy = Math.floor(Math.random() * (size - 10)) + 5
            for (let i = -2; i <= 2; i++) {
                for (let j = -2; j <= 2; j++) {
                    const idx = (sy + j) * size + (sx + i)
                    if (idx >= 0 && idx < size * size) {
                        B[idx] = 1
                    }
                }
            }
        }

        // Add vertex colors
        const colors = new Float32Array(geo.attributes.position.count * 3)
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

        gridRef.current = { A, B }
        geometryRef.current = geo

        return { geometry: geo, gridA: A, gridB: B }
    }, [gridSize])

    // Laplacian kernel
    const laplacian = (grid, x, y, size) => {
        const idx = (i, j) => ((j + size) % size) * size + ((i + size) % size)

        return (
            grid[idx(x - 1, y)] * 0.2 +
            grid[idx(x + 1, y)] * 0.2 +
            grid[idx(x, y - 1)] * 0.2 +
            grid[idx(x, y + 1)] * 0.2 +
            grid[idx(x - 1, y - 1)] * 0.05 +
            grid[idx(x + 1, y - 1)] * 0.05 +
            grid[idx(x - 1, y + 1)] * 0.05 +
            grid[idx(x + 1, y + 1)] * 0.05 -
            grid[idx(x, y)]
        )
    }

    useFrame(() => {
        if (!meshRef.current || !gridRef.current.A) return

        const { A, B } = gridRef.current
        const size = gridSize
        const newA = new Float32Array(size * size)
        const newB = new Float32Array(size * size)

        // Simulation step
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const idx = y * size + x
                const a = A[idx]
                const b = B[idx]

                const lapA = laplacian(A, x, y, size)
                const lapB = laplacian(B, x, y, size)

                const reaction = a * b * b

                newA[idx] = a + (diffusionA * lapA - reaction + feed * (1 - a)) * 0.8
                newB[idx] = b + (diffusionB * lapB + reaction - (kill + feed) * b) * 0.8

                // Clamp values
                newA[idx] = Math.max(0, Math.min(1, newA[idx]))
                newB[idx] = Math.max(0, Math.min(1, newB[idx]))
            }
        }

        gridRef.current.A = newA
        gridRef.current.B = newB

        // Update geometry
        const positions = meshRef.current.geometry.attributes.position.array
        const colors = meshRef.current.geometry.attributes.color.array
        const c1 = new THREE.Color(color1)
        const c2 = new THREE.Color(color2)

        for (let i = 0; i < size * size; i++) {
            const b = newB[i]

            // Height displacement
            positions[i * 3 + 2] = b * heightScale

            // Color based on concentration
            const color = c2.clone().lerp(c1, b)
            colors[i * 3] = color.r
            colors[i * 3 + 1] = color.g
            colors[i * 3 + 2] = color.b
        }

        meshRef.current.geometry.attributes.position.needsUpdate = true
        meshRef.current.geometry.attributes.color.needsUpdate = true
        meshRef.current.geometry.computeVertexNormals()
    })

    return (
        <mesh
            ref={meshRef}
            geometry={geometry}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -1, 0]}
        >
            <meshStandardMaterial
                vertexColors
                side={THREE.DoubleSide}
                metalness={0.5}
                roughness={0.5}
            />
        </mesh>
    )
}
