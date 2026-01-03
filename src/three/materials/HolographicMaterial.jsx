import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { hologramVertexShader, hologramFragmentShader } from '../shaders/hologram.glsl'

/**
 * Holographic Material component
 * Creates a wireframe/holographic effect with glow and scan lines
 * @param {boolean} isActive - Whether the holographic effect is active
 * @param {THREE.Color} color - Base color for the hologram
 * @param {number} opacity - Opacity of the effect (0-1)
 */
export function useHolographicMaterial(isActive = false, color = new THREE.Color('#6366f1'), opacity = 0.8) {
    const materialRef = useRef()

    useEffect(() => {
        if (!materialRef.current) {
            materialRef.current = new THREE.ShaderMaterial({
                vertexShader: hologramVertexShader,
                fragmentShader: hologramFragmentShader,
                transparent: true,
                side: THREE.DoubleSide,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                uniforms: {
                    uTime: { value: 0 },
                    uColor: { value: color },
                    uOpacity: { value: opacity },
                    uIsActive: { value: isActive ? 1.0 : 0.0 },
                    uFresnelPower: { value: 2.0 },
                    uScanLineSpeed: { value: 2.0 },
                    uScanLineWidth: { value: 0.1 },
                },
            })
        }
    }, [color, opacity, isActive])

    useFrame((state) => {
        if (materialRef.current?.uniforms) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime

            // Smooth transition for activation
            materialRef.current.uniforms.uIsActive.value = THREE.MathUtils.lerp(
                materialRef.current.uniforms.uIsActive.value,
                isActive ? 1.0 : 0.0,
                0.05
            )
        }
    })

    return materialRef.current
}

/**
 * Holographic Mesh Component
 * Wraps a mesh with holographic material
 */
export default function HolographicMaterial({
    children,
    isActive = false,
    color = '#6366f1',
    opacity = 0.8
}) {
    const material = useHolographicMaterial(isActive, new THREE.Color(color), opacity)

    return material ? (
        <mesh material={material}>
            {children}
        </mesh>
    ) : null
}
