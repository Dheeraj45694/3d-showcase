import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Lissajous Knot Surfaces
 * 3D parametric curves creating beautiful knot patterns
 * x = sin(a*t + δ), y = sin(b*t), z = sin(c*t)
 */
export default function LissajousKnot({
    a = 3,
    b = 2,
    c = 5,
    delta = Math.PI / 2,
    tubeRadius = 0.08,
    segments = 500,
    radialSegments = 16,
    color1 = '#6366f1',
    color2 = '#a855f7',
    animate = true
}) {
    const meshRef = useRef()
    const materialRef = useRef()

    // Generate knot curve
    const curve = useMemo(() => {
        class LissajousCurve extends THREE.Curve {
            constructor(a, b, c, delta) {
                super()
                this.a = a
                this.b = b
                this.c = c
                this.delta = delta
            }

            getPoint(t) {
                const angle = t * Math.PI * 2 * 4 // Multiple loops
                return new THREE.Vector3(
                    Math.sin(this.a * angle + this.delta) * 2,
                    Math.sin(this.b * angle) * 2,
                    Math.sin(this.c * angle) * 2
                )
            }
        }

        return new LissajousCurve(a, b, c, delta)
    }, [a, b, c, delta])

    // Create tube geometry with vertex colors
    const geometry = useMemo(() => {
        const geo = new THREE.TubeGeometry(curve, segments, tubeRadius, radialSegments, true)

        // Add vertex colors
        const colors = []
        const c1 = new THREE.Color(color1)
        const c2 = new THREE.Color(color2)

        const positions = geo.attributes.position
        for (let i = 0; i < positions.count; i++) {
            const t = i / positions.count
            const color = c1.clone().lerp(c2, Math.sin(t * Math.PI * 8) * 0.5 + 0.5)
            colors.push(color.r, color.g, color.b)
        }

        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
        return geo
    }, [curve, segments, tubeRadius, radialSegments, color1, color2])

    useFrame((state) => {
        if (!meshRef.current || !animate) return

        const time = state.clock.elapsedTime
        meshRef.current.rotation.y = time * 0.2
        meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.2

        if (materialRef.current) {
            materialRef.current.emissiveIntensity = 0.3 + Math.sin(time * 2) * 0.2
        }
    })

    return (
        <mesh ref={meshRef} geometry={geometry}>
            <meshStandardMaterial
                ref={materialRef}
                vertexColors
                emissive={color1}
                emissiveIntensity={0.3}
                metalness={0.7}
                roughness={0.3}
                side={THREE.DoubleSide}
            />
        </mesh>
    )
}
