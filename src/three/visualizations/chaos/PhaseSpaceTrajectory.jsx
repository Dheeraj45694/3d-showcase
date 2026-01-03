import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Phase Space Trajectory Visuals
 * Visualizes dynamical system phase portraits
 */
export default function PhaseSpaceTrajectory({
    trajectoryCount = 50,
    pointsPerTrajectory = 200,
    color1 = '#6366f1',
    color2 = '#a855f7',
    color3 = '#22d3ee'
}) {
    const groupRef = useRef()

    // Generate phase space trajectories
    const geometries = useMemo(() => {
        const geos = []

        const c1 = new THREE.Color(color1)
        const c2 = new THREE.Color(color2)
        const c3 = new THREE.Color(color3)

        // Van der Pol oscillator parameters
        const mu = 1.5

        for (let t = 0; t < trajectoryCount; t++) {
            const points = []
            const colors = []

            // Random initial conditions
            let x = (Math.random() - 0.5) * 4
            let y = (Math.random() - 0.5) * 4
            const z0 = (Math.random() - 0.5) * 2

            const dt = 0.02

            for (let i = 0; i < pointsPerTrajectory; i++) {
                // Van der Pol equations
                const dx = y
                const dy = mu * (1 - x * x) * y - x

                x += dx * dt
                y += dy * dt

                // Map to 3D with time as z
                points.push(new THREE.Vector3(x, y, z0 + i * 0.02))

                // Color based on position in trajectory
                const progress = i / pointsPerTrajectory
                let color
                if (progress < 0.33) {
                    color = c1.clone().lerp(c2, progress * 3)
                } else if (progress < 0.66) {
                    color = c2.clone().lerp(c3, (progress - 0.33) * 3)
                } else {
                    color = c3.clone().lerp(c1, (progress - 0.66) * 3)
                }
                colors.push(color)
            }

            // Create line geometry
            const geometry = new THREE.BufferGeometry().setFromPoints(points)

            const colorArray = new Float32Array(colors.length * 3)
            colors.forEach((c, i) => {
                colorArray[i * 3] = c.r
                colorArray[i * 3 + 1] = c.g
                colorArray[i * 3 + 2] = c.b
            })
            geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3))

            geos.push({
                geometry,
                phase: Math.random() * Math.PI * 2
            })
        }

        return geos
    }, [trajectoryCount, pointsPerTrajectory, color1, color2, color3])

    useFrame((state) => {
        if (!groupRef.current) return

        const time = state.clock.elapsedTime
        groupRef.current.rotation.y = time * 0.1
        groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.2
    })

    return (
        <group ref={groupRef}>
            {geometries.map((geo, i) => (
                <line key={i} geometry={geo.geometry}>
                    <lineBasicMaterial
                        vertexColors
                        transparent
                        opacity={0.6}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </line>
            ))}
        </group>
    )
}
