import { useRef, useMemo, useEffect, Suspense, lazy } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Float, Environment } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

// Import visualizations
import StrangeAttractor from '../visualizations/chaos/StrangeAttractor'
import PhaseSpaceTrajectory from '../visualizations/chaos/PhaseSpaceTrajectory'
import SwarmIntelligence from '../visualizations/quantum/SwarmIntelligence'
import QuantumFoam from '../visualizations/quantum/QuantumFoam'
import SelfOrganizingParticles from '../visualizations/quantum/SelfOrganizingParticles'
import ReactionDiffusion from '../visualizations/organic/ReactionDiffusion'
import CellularAutomata from '../visualizations/organic/CellularAutomata'
import NeuralNetworkMap from '../visualizations/organic/NeuralNetworkMap'
import FlowFieldNoise from '../visualizations/flow/FlowFieldNoise'
import GravitationalLensing from '../visualizations/flow/GravitationalLensing'
import MagnetohydrodynamicStreams from '../visualizations/flow/MagnetohydrodynamicStreams'
import PerlinClouds from '../visualizations/flow/PerlinClouds'
import FractalFlame from '../visualizations/fractals/FractalFlame'
import Mandelbulb from '../visualizations/fractals/Mandelbulb'
import HyperbolicMesh from '../visualizations/fractals/HyperbolicMesh'
import LissajousKnot from '../visualizations/fractals/LissajousKnot'
import MetaballFusion from '../visualizations/emergence/MetaballFusion'
import CrystalGrowth from '../visualizations/emergence/CrystalGrowth'
import EmergentCity from '../visualizations/emergence/EmergentCity'
import TopologicalCollapse from '../visualizations/emergence/TopologicalCollapse'

// ═══════════════════════════════════════════════════════════════
// ORIGINAL VISUALIZATIONS (kept for compatibility)
// ═══════════════════════════════════════════════════════════════

function GravitationalParticles({ count = 500, color = '#6366f1' }) {
    const meshRef = useRef()
    const velocities = useRef([])

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)

        velocities.current = []

        const colorObj = new THREE.Color(color)
        const color2 = new THREE.Color('#a855f7')

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            const r = 3 + Math.random() * 2

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            positions[i * 3 + 2] = r * Math.cos(phi)

            velocities.current.push({
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02,
            })

            const mixFactor = Math.random()
            const mixedColor = colorObj.clone().lerp(color2, mixFactor)
            colors[i * 3] = mixedColor.r
            colors[i * 3 + 1] = mixedColor.g
            colors[i * 3 + 2] = mixedColor.b
        }

        return { positions, colors }
    }, [count, color])

    useFrame((state) => {
        if (!meshRef.current) return

        const positions = meshRef.current.geometry.attributes.position.array
        const time = state.clock.elapsedTime

        for (let i = 0; i < count; i++) {
            const idx = i * 3
            const x = positions[idx]
            const y = positions[idx + 1]
            const z = positions[idx + 2]

            const dist = Math.sqrt(x * x + y * y + z * z)
            const gravity = 0.0008 / (dist * dist + 0.1)

            velocities.current[i].x -= (x / dist) * gravity
            velocities.current[i].y -= (y / dist) * gravity
            velocities.current[i].z -= (z / dist) * gravity

            velocities.current[i].x += -y * 0.0003
            velocities.current[i].y += x * 0.0003

            positions[idx] += velocities.current[i].x
            positions[idx + 1] += velocities.current[i].y
            positions[idx + 2] += velocities.current[i].z

            if (dist < 0.3) {
                const theta = Math.random() * Math.PI * 2
                const phi = Math.acos(2 * Math.random() - 1)
                const r = 4 + Math.random() * 2
                positions[idx] = r * Math.sin(phi) * Math.cos(theta)
                positions[idx + 1] = r * Math.sin(phi) * Math.sin(theta)
                positions[idx + 2] = r * Math.cos(phi)
                velocities.current[i] = {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02,
                }
            }
        }

        meshRef.current.geometry.attributes.position.needsUpdate = true
        meshRef.current.rotation.y = time * 0.05
    })

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={particles.positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={particles.colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    )
}

function LorenzAttractor({ scale = 0.05 }) {
    const lineRef = useRef()

    const geometry = useMemo(() => {
        const points = []
        let x = 0.1, y = 0, z = 0
        const sigma = 10, rho = 28, beta = 8 / 3
        const dt = 0.005

        for (let i = 0; i < 10000; i++) {
            const dx = sigma * (y - x) * dt
            const dy = (x * (rho - z) - y) * dt
            const dz = (x * y - beta * z) * dt

            x += dx
            y += dy
            z += dz

            points.push(new THREE.Vector3(x * scale, y * scale, (z - 25) * scale))
        }

        return new THREE.BufferGeometry().setFromPoints(points)
    }, [scale])

    useFrame((state) => {
        if (lineRef.current) {
            lineRef.current.rotation.y = state.clock.elapsedTime * 0.1
            lineRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
        }
    })

    return (
        <group position={[0, 0, 0]}>
            <line ref={lineRef} geometry={geometry}>
                <lineBasicMaterial
                    color="#6366f1"
                    transparent
                    opacity={0.7}
                    linewidth={1}
                />
            </line>
        </group>
    )
}

function MathematicalKnot() {
    const meshRef = useRef()
    const materialRef = useRef()

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.2
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
        }
        if (materialRef.current) {
            materialRef.current.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3
        }
    })

    return (
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
            <mesh ref={meshRef}>
                <torusKnotGeometry args={[1, 0.3, 200, 32, 3, 5]} />
                <meshStandardMaterial
                    ref={materialRef}
                    color="#6366f1"
                    emissive="#8b5cf6"
                    emissiveIntensity={0.5}
                    metalness={0.8}
                    roughness={0.2}
                    wireframe
                />
            </mesh>
        </Float>
    )
}

function WaveField() {
    const geometryRef = useRef()

    const { width, depth, segments } = useMemo(() => ({
        width: 10,
        depth: 10,
        segments: 64
    }), [])

    useFrame((state) => {
        if (!geometryRef.current) return

        const positions = geometryRef.current.attributes.position.array
        const time = state.clock.elapsedTime

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i]
            const z = positions[i + 2]

            const dist1 = Math.sqrt(x * x + z * z)
            const dist2 = Math.sqrt((x - 3) * (x - 3) + (z - 3) * (z - 3))
            const dist3 = Math.sqrt((x + 3) * (x + 3) + (z + 3) * (z + 3))

            positions[i + 1] =
                Math.sin(dist1 * 2 - time * 3) * 0.3 +
                Math.sin(dist2 * 2.5 - time * 2.5) * 0.2 +
                Math.sin(dist3 * 1.5 - time * 3.5) * 0.25
        }

        geometryRef.current.attributes.position.needsUpdate = true
        geometryRef.current.computeVertexNormals()
    })

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
            <planeGeometry ref={geometryRef} args={[width, depth, segments, segments]} />
            <meshStandardMaterial
                color="#6366f1"
                emissive="#8b5cf6"
                emissiveIntensity={0.3}
                metalness={0.5}
                roughness={0.5}
                side={THREE.DoubleSide}
                wireframe
            />
        </mesh>
    )
}

function DNAHelix() {
    const groupRef = useRef()

    const helixData = useMemo(() => {
        const points1 = []
        const points2 = []
        const connectors = []

        for (let i = 0; i < 200; i++) {
            const t = i * 0.1
            const radius = 0.8

            points1.push(new THREE.Vector3(
                Math.cos(t) * radius,
                t * 0.15 - 1.5,
                Math.sin(t) * radius
            ))

            points2.push(new THREE.Vector3(
                Math.cos(t + Math.PI) * radius,
                t * 0.15 - 1.5,
                Math.sin(t + Math.PI) * radius
            ))

            if (i % 10 === 0) {
                connectors.push({
                    start: points1[points1.length - 1].clone(),
                    end: points2[points2.length - 1].clone()
                })
            }
        }

        return { points1, points2, connectors }
    }, [])

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
        }
    })

    return (
        <group ref={groupRef}>
            <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
                <line>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={helixData.points1.length}
                            array={new Float32Array(helixData.points1.flatMap(p => [p.x, p.y, p.z]))}
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial color="#6366f1" linewidth={2} />
                </line>

                <line>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={helixData.points2.length}
                            array={new Float32Array(helixData.points2.flatMap(p => [p.x, p.y, p.z]))}
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial color="#a855f7" linewidth={2} />
                </line>

                {helixData.connectors.map((conn, i) => (
                    <mesh key={i} position={[
                        (conn.start.x + conn.end.x) / 2,
                        (conn.start.y + conn.end.y) / 2,
                        (conn.start.z + conn.end.z) / 2
                    ]}>
                        <sphereGeometry args={[0.05, 8, 8]} />
                        <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.5} />
                    </mesh>
                ))}
            </Float>
        </group>
    )
}

function FractalSphere() {
    const groupRef = useRef()

    const spheres = useMemo(() => {
        const result = []
        const baseRadius = 1

        result.push({ pos: [0, 0, 0], radius: baseRadius * 0.5, color: '#6366f1' })

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2
            result.push({
                pos: [Math.cos(angle) * baseRadius, 0, Math.sin(angle) * baseRadius],
                radius: 0.25,
                color: '#8b5cf6',
            })
        }

        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2
            result.push({
                pos: [Math.cos(angle) * 1.8, Math.sin(i * 0.5) * 0.3, Math.sin(angle) * 1.8],
                radius: 0.1,
                color: '#a855f7',
            })
        }

        return result
    }, [])

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
        }
    })

    return (
        <group ref={groupRef}>
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
                {spheres.map((sphere, i) => (
                    <mesh key={i} position={sphere.pos}>
                        <sphereGeometry args={[sphere.radius, 32, 32]} />
                        <meshStandardMaterial
                            color={sphere.color}
                            emissive={sphere.color}
                            emissiveIntensity={0.3}
                            metalness={0.7}
                            roughness={0.3}
                        />
                    </mesh>
                ))}
            </Float>
        </group>
    )
}

// ═══════════════════════════════════════════════════════════════
// LIGHTS
// ═══════════════════════════════════════════════════════════════

function Lights() {
    return (
        <>
            <ambientLight intensity={0.3} />
            <directionalLight position={[10, 10, 5]} intensity={1} color="#fff5e6" />
            <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#e8e0f0" />
            <pointLight position={[0, 0, 0]} intensity={1} color="#6366f1" />
            <hemisphereLight color="#fdfbf7" groundColor="#d4d0c8" intensity={0.5} />
        </>
    )
}

// ═══════════════════════════════════════════════════════════════
// VISUALIZATION SECTIONS - 24 total effects across 6 themed sections
// ═══════════════════════════════════════════════════════════════

const visualizations = [
    // Section 0: Hero - Gravitational + Torus Knot
    { component: 'hero', effects: ['GravitationalParticles', 'MathematicalKnot'] },
    // Section 1: Chaos - Strange Attractor + Phase Space
    { component: 'chaos', effects: ['StrangeAttractor', 'PhaseSpaceTrajectory'] },
    // Section 2: Quantum - Swarm + Quantum Foam
    { component: 'quantum', effects: ['SwarmIntelligence', 'QuantumFoam'] },
    // Section 3: Organic - Reaction Diffusion + Neural Network
    { component: 'organic', effects: ['ReactionDiffusion', 'NeuralNetworkMap'] },
    // Section 4: Flow - Flow Field + MHD Streams
    { component: 'flow', effects: ['FlowFieldNoise', 'MagnetohydrodynamicStreams'] },
    // Section 5: Fractals - Mandelbulb + Lissajous
    { component: 'fractals', effects: ['Mandelbulb', 'LissajousKnot'] },
]

// ═══════════════════════════════════════════════════════════════
// MAIN SCENE
// ═══════════════════════════════════════════════════════════════

export default function Scene({ activeSection, isLoaded }) {
    const groupRef = useRef()
    const { camera } = useThree()

    const cameraPositions = useMemo(() => [
        { position: [0, 2, 8], target: [0, 0, 0] },   // Section 0: Hero
        { position: [0, 1, 8], target: [0, 0, 0] },   // Section 1: Chaos
        { position: [0, 2, 10], target: [0, 0, 0] },  // Section 2: Quantum
        { position: [0, 3, 10], target: [0, 0, 0] },  // Section 3: Organic
        { position: [0, 2, 8], target: [0, 0, 0] },   // Section 4: Flow
        { position: [0, 1, 6], target: [0, 0, 0] },   // Section 5: Fractals
    ], [])

    useEffect(() => {
        if (!isLoaded) return

        const sectionIndex = Math.min(activeSection, cameraPositions.length - 1)
        const pos = cameraPositions[sectionIndex]

        gsap.to(camera.position, {
            x: pos.position[0],
            y: pos.position[1],
            z: pos.position[2],
            duration: 1.8,
            ease: 'power2.inOut',
        })

        const targetVec = { x: 0, y: 0, z: 0 }
        gsap.to(targetVec, {
            x: pos.target[0],
            y: pos.target[1],
            z: pos.target[2],
            duration: 1.8,
            ease: 'power2.inOut',
            onUpdate: () => {
                camera.lookAt(targetVec.x, targetVec.y, targetVec.z)
            }
        })
    }, [activeSection, camera, cameraPositions, isLoaded])

    return (
        <group ref={groupRef}>
            <Lights />
            <Environment preset="night" />

            {/* Section 0: Hero - Gravitational Particles + Mathematical Knot */}
            {activeSection === 0 && (
                <group>
                    <GravitationalParticles count={800} />
                    <MathematicalKnot />
                </group>
            )}

            {/* Section 1: Chaos & Attractors */}
            {activeSection === 1 && (
                <group>
                    <StrangeAttractor type="rossler" particleCount={3000} />
                    <LorenzAttractor scale={0.05} />
                </group>
            )}

            {/* Section 2: Quantum & Particles */}
            {activeSection === 2 && (
                <group>
                    <SwarmIntelligence boidCount={200} predatorCount={2} />
                    <QuantumFoam bubbleCount={100} />
                </group>
            )}

            {/* Section 3: Organic Patterns */}
            {activeSection === 3 && (
                <group>
                    <ReactionDiffusion gridSize={48} heightScale={1.5} />
                    <NeuralNetworkMap layers={[6, 10, 12, 10, 6]} />
                </group>
            )}

            {/* Section 4: Flow & Fields */}
            {activeSection === 4 && (
                <group>
                    <FlowFieldNoise particleCount={1500} />
                    <MagnetohydrodynamicStreams particleCount={1000} />
                </group>
            )}

            {/* Section 5: Fractals & Geometry */}
            {activeSection === 5 && (
                <group>
                    <Mandelbulb resolution={35} power={8} />
                    <LissajousKnot a={3} b={2} c={5} />
                </group>
            )}

            {/* Additional sections for more visualizations */}
            {activeSection === 6 && (
                <group>
                    <FractalFlame pointCount={8000} />
                    <HyperbolicMesh subdivisions={4} />
                </group>
            )}

            {activeSection === 7 && (
                <group>
                    <CrystalGrowth maxParticles={300} />
                    <MetaballFusion ballCount={6} />
                </group>
            )}

            {activeSection === 8 && (
                <group>
                    <EmergentCity buildingCount={80} />
                    <TopologicalCollapse gridSize={6} />
                </group>
            )}

            {activeSection === 9 && (
                <group>
                    <GravitationalLensing starCount={400} massCount={2} />
                    <PerlinClouds cloudCount={25} />
                </group>
            )}

            {activeSection === 10 && (
                <group>
                    <SelfOrganizingParticles particleCount={400} attractorCount={3} />
                    <PhaseSpaceTrajectory trajectoryCount={40} />
                </group>
            )}

            {activeSection === 11 && (
                <group>
                    <CellularAutomata gridSize={16} cellSize={0.25} />
                    <WaveField />
                </group>
            )}
        </group>
    )
}
