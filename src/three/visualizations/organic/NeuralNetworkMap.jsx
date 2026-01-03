import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Neural Network Activation Maps
 * Visualizes neural network node/edge structure with activation pulses
 */
export default function NeuralNetworkMap({
    layers = [8, 12, 16, 12, 8],
    nodeSize = 0.1,
    color1 = '#6366f1',
    color2 = '#22d3ee',
    pulseColor = '#f472b6'
}) {
    const groupRef = useRef()
    const nodesRef = useRef([])
    const edgesRef = useRef([])
    const pulsesRef = useRef([])

    // Build network structure
    const { nodes, edges } = useMemo(() => {
        const nodeData = []
        const edgeData = []

        const layerSpacing = 2
        const nodeSpacing = 0.8

        // Create nodes per layer
        layers.forEach((nodeCount, layerIndex) => {
            const x = (layerIndex - (layers.length - 1) / 2) * layerSpacing

            for (let i = 0; i < nodeCount; i++) {
                const y = (i - (nodeCount - 1) / 2) * nodeSpacing
                const z = Math.sin(layerIndex + i) * 0.3

                nodeData.push({
                    position: new THREE.Vector3(x, y, z),
                    layer: layerIndex,
                    index: i,
                    activation: Math.random()
                })
            }
        })

        // Create edges between layers
        let edgeIndex = 0
        layers.forEach((nodeCount, layerIndex) => {
            if (layerIndex === 0) return

            const prevLayerStart = layers.slice(0, layerIndex).reduce((a, b) => a + b, 0) - layers[layerIndex - 1]
            const currLayerStart = layers.slice(0, layerIndex).reduce((a, b) => a + b, 0)

            // Connect each node to previous layer (sparse connections)
            for (let i = 0; i < nodeCount; i++) {
                const currNode = nodeData[currLayerStart + i]

                for (let j = 0; j < layers[layerIndex - 1]; j++) {
                    // Sparse connection (not all nodes connected)
                    if (Math.random() > 0.4) continue

                    const prevNode = nodeData[layers.slice(0, layerIndex - 1).reduce((a, b) => a + b, 0) + j]

                    edgeData.push({
                        start: prevNode.position.clone(),
                        end: currNode.position.clone(),
                        weight: Math.random(),
                        pulseProgress: -1,
                        id: edgeIndex++
                    })
                }
            }
        })

        nodesRef.current = nodeData
        edgesRef.current = edgeData

        return { nodes: nodeData, edges: edgeData }
    }, [layers])

    // Create edge geometry
    const edgeGeometry = useMemo(() => {
        const positions = []
        const colors = []

        const c1 = new THREE.Color(color1)
        const c2 = new THREE.Color(color2)

        edges.forEach(edge => {
            positions.push(edge.start.x, edge.start.y, edge.start.z)
            positions.push(edge.end.x, edge.end.y, edge.end.z)

            const color = c1.clone().lerp(c2, edge.weight)
            colors.push(color.r, color.g, color.b)
            colors.push(color.r, color.g, color.b)
        })

        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

        return geo
    }, [edges, color1, color2])

    let pulseTimer = 0

    useFrame((state, delta) => {
        if (!groupRef.current) return

        const time = state.clock.elapsedTime

        // Spawn new pulses
        pulseTimer += delta
        if (pulseTimer > 0.5 && pulsesRef.current.length < 20) {
            // Start pulse from random input node
            const randomEdge = edgesRef.current[Math.floor(Math.random() * edgesRef.current.length)]
            if (randomEdge) {
                pulsesRef.current.push({
                    edge: randomEdge,
                    progress: 0,
                    speed: 0.02 + Math.random() * 0.02
                })
            }
            pulseTimer = 0
        }

        // Update pulses
        pulsesRef.current = pulsesRef.current.filter(pulse => {
            pulse.progress += pulse.speed
            return pulse.progress < 1
        })

        // Animate node activations
        nodesRef.current.forEach(node => {
            node.activation = 0.3 + Math.sin(time * 2 + node.layer + node.index) * 0.35 + 0.35
        })

        groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.3
    })

    return (
        <group ref={groupRef}>
            {/* Edges */}
            <lineSegments geometry={edgeGeometry}>
                <lineBasicMaterial
                    vertexColors
                    transparent
                    opacity={0.3}
                    blending={THREE.AdditiveBlending}
                />
            </lineSegments>

            {/* Nodes */}
            {nodes.map((node, i) => (
                <mesh key={i} position={node.position}>
                    <sphereGeometry args={[nodeSize, 16, 16]} />
                    <meshStandardMaterial
                        color={node.layer === 0 ? color1 : node.layer === layers.length - 1 ? color2 : pulseColor}
                        emissive={node.layer === 0 ? color1 : node.layer === layers.length - 1 ? color2 : pulseColor}
                        emissiveIntensity={0.5}
                        transparent
                        opacity={0.8}
                    />
                </mesh>
            ))}

            {/* Pulses */}
            {pulsesRef.current.map((pulse, i) => {
                const pos = pulse.edge.start.clone().lerp(pulse.edge.end, pulse.progress)
                return (
                    <mesh key={`pulse-${i}`} position={pos}>
                        <sphereGeometry args={[0.08, 8, 8]} />
                        <meshBasicMaterial
                            color={pulseColor}
                            transparent
                            opacity={1 - pulse.progress}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                )
            })}
        </group>
    )
}
