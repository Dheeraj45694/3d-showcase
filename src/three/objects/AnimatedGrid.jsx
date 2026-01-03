import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { gridVertexShader, gridFragmentShader } from '../shaders/grid.glsl'

export default function AnimatedGrid({ activeSection = 0 }) {
    const gridRef = useRef()

    useFrame((state) => {
        if (!gridRef.current) return

        const time = state.clock.elapsedTime

        // Update shader uniforms
        if (gridRef.current.material?.uniforms) {
            gridRef.current.material.uniforms.uTime.value = time
            gridRef.current.material.uniforms.uSection.value = activeSection

            // Animate wave intensity based on section
            const targetWave = activeSection === 1 ? 0.5 : 0.2
            gridRef.current.material.uniforms.uWaveIntensity.value = THREE.MathUtils.lerp(
                gridRef.current.material.uniforms.uWaveIntensity.value,
                targetWave,
                0.05
            )
        }
    })

    const gridMaterial = new THREE.ShaderMaterial({
        vertexShader: gridVertexShader,
        fragmentShader: gridFragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        uniforms: {
            uTime: { value: 0 },
            uSection: { value: 0 },
            uWaveIntensity: { value: 0.2 },
            uGridColor: { value: new THREE.Color('#6366f1') },
            uOpacity: { value: 0.15 },
        },
    })

    return (
        <mesh
            ref={gridRef}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -2, 0]}
            material={gridMaterial}
        >
            <planeGeometry args={[50, 50, 50, 50]} />
        </mesh>
    )
}
