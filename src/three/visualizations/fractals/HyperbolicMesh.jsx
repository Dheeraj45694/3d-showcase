import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Hyperbolic Geometry Mesh Warping
 * Poincaré disk model tessellations with Möbius transformations
 */
export default function HyperbolicMesh({
    subdivisions = 5,
    color1 = '#6366f1',
    color2 = '#a855f7',
    warpIntensity = 0.5
}) {
    const meshRef = useRef()
    const geometryRef = useRef()
    const originalPositions = useRef(null)

    // Create hyperbolic-like tessellation
    const geometry = useMemo(() => {
        const geo = new THREE.IcosahedronGeometry(3, subdivisions)

        // Store original positions
        const posArray = geo.attributes.position.array
        originalPositions.current = new Float32Array(posArray)

        // Add vertex colors
        const colors = new Float32Array(posArray.length)
        const c1 = new THREE.Color(color1)
        const c2 = new THREE.Color(color2)

        for (let i = 0; i < posArray.length / 3; i++) {
            const x = posArray[i * 3]
            const y = posArray[i * 3 + 1]
            const z = posArray[i * 3 + 2]

            // Color based on position
            const t = (Math.sin(x * 2) + Math.sin(y * 2) + Math.sin(z * 2)) / 6 + 0.5
            const color = c1.clone().lerp(c2, t)

            colors[i * 3] = color.r
            colors[i * 3 + 1] = color.g
            colors[i * 3 + 2] = color.b
        }

        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
        geometryRef.current = geo

        return geo
    }, [subdivisions, color1, color2])

    // Möbius transformation in 3D (simplified)
    const mobiusTransform = (x, y, z, a, t) => {
        // Apply hyperbolic-like deformation
        const r = Math.sqrt(x * x + y * y + z * z)
        const factor = 1 / (1 + a * r)

        // Add wave distortion
        const wave = Math.sin(r * 3 + t * 2) * warpIntensity

        return {
            x: x * factor + wave * x / (r + 0.1),
            y: y * factor + wave * y / (r + 0.1),
            z: z * factor + wave * z / (r + 0.1)
        }
    }

    useFrame((state) => {
        if (!meshRef.current || !originalPositions.current) return

        const time = state.clock.elapsedTime
        const positions = meshRef.current.geometry.attributes.position.array
        const orig = originalPositions.current
        const colors = meshRef.current.geometry.attributes.color.array

        const c1 = new THREE.Color(color1)
        const c2 = new THREE.Color(color2)

        // Animate transformation parameter
        const a = 0.1 + Math.sin(time * 0.5) * 0.08

        for (let i = 0; i < orig.length / 3; i++) {
            const idx = i * 3
            const x = orig[idx]
            const y = orig[idx + 1]
            const z = orig[idx + 2]

            // Apply Möbius-like transform
            const transformed = mobiusTransform(x, y, z, a, time)

            positions[idx] = transformed.x
            positions[idx + 1] = transformed.y
            positions[idx + 2] = transformed.z

            // Animate colors
            const colorT = (Math.sin(x + time) + Math.sin(y + time * 1.3) + Math.sin(z + time * 0.7)) / 6 + 0.5
            const color = c1.clone().lerp(c2, colorT)

            colors[idx] = color.r
            colors[idx + 1] = color.g
            colors[idx + 2] = color.b
        }

        meshRef.current.geometry.attributes.position.needsUpdate = true
        meshRef.current.geometry.attributes.color.needsUpdate = true
        meshRef.current.geometry.computeVertexNormals()

        meshRef.current.rotation.y = time * 0.1
    })

    return (
        <mesh ref={meshRef} geometry={geometry}>
            <meshStandardMaterial
                vertexColors
                wireframe
                emissive={color1}
                emissiveIntensity={0.3}
                side={THREE.DoubleSide}
            />
        </mesh>
    )
}
