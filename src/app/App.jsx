import { useEffect, useState, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import {
    useProgress,
    Html,
    ScrollControls,
    Scroll,
    useScroll
} from '@react-three/drei'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Scene from '../three/canvas/Scene'
import Loader from '../components/layout/Loader'
import Navigation from '../components/layout/Navigation'
import SectionIndicators from '../components/ui/SectionIndicators'
import InfoBox from '../components/ui/InfoBox'
import { siteConfig } from '../config/site.config'

gsap.registerPlugin(ScrollTrigger)

function App() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [activeSection, setActiveSection] = useState(0)
    const containerRef = useRef(null)
    const lenisRef = useRef(null)

    useEffect(() => {
        // Initialize Lenis smooth scroll
        lenisRef.current = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        })

        // Connect Lenis to ScrollTrigger
        lenisRef.current.on('scroll', ScrollTrigger.update)

        gsap.ticker.add((time) => {
            lenisRef.current?.raf(time * 1000)
        })

        gsap.ticker.lagSmoothing(0)

        return () => {
            lenisRef.current?.destroy()
            gsap.ticker.remove(lenisRef.current?.raf)
        }
    }, [])

    // Section detection
    useEffect(() => {
        const sections = document.querySelectorAll('.section')

        sections.forEach((section, index) => {
            ScrollTrigger.create({
                trigger: section,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => setActiveSection(index),
                onEnterBack: () => setActiveSection(index),
            })
        })

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill())
        }
    }, [isLoaded])

    const scrollToSection = (index) => {
        const sections = document.querySelectorAll('.section')
        if (sections[index]) {
            lenisRef.current?.scrollTo(sections[index], {
                offset: 0,
                duration: 1.5,
            })
        }
    }

    return (
        <>
            <Loader onComplete={() => setIsLoaded(true)} />

            <Navigation
                activeSection={activeSection}
                onNavigate={scrollToSection}
                isVisible={isLoaded}
            />

            {/* 3D Canvas */}
            <div className="canvas-container">
                <Canvas
                    camera={{ position: [0, 3, 12], fov: 35 }}
                    dpr={[1, 2]}
                    gl={{
                        antialias: true,
                        alpha: true,
                        powerPreference: 'high-performance',
                        toneMapping: 3, // ACESFilmicToneMapping
                        toneMappingExposure: 1.2,
                    }}
                >
                    <Suspense fallback={null}>
                        <Scene activeSection={activeSection} isLoaded={isLoaded} />
                    </Suspense>
                </Canvas>
            </div>

            {/* HTML Content - 12 Visualization Sections */}
            <div className="scroll-container" ref={containerRef}>
                {/* Section 0: Gravity - Gravitational Particles + Mathematical Knot */}
                <section className="section" id="gravity"></section>

                {/* Section 1: Chaos - Strange Attractor + Lorenz */}
                <section className="section" id="chaos"></section>

                {/* Section 2: Swarm - Boids++ + Quantum Foam */}
                <section className="section" id="swarm"></section>

                {/* Section 3: Organic - Reaction Diffusion + Neural Network */}
                <section className="section" id="organic"></section>

                {/* Section 4: Flow - Flow Field + MHD Streams */}
                <section className="section" id="flow"></section>

                {/* Section 5: Fractals - Mandelbulb + Lissajous */}
                <section className="section" id="fractals"></section>

                {/* Section 6: Flames - Fractal Flame + Hyperbolic Mesh */}
                <section className="section" id="flames"></section>

                {/* Section 7: Growth - Crystal + Metaball */}
                <section className="section" id="growth"></section>

                {/* Section 8: City - Emergent City + Topological Collapse */}
                <section className="section" id="city"></section>

                {/* Section 9: Lensing - Gravitational Lensing + Perlin Clouds */}
                <section className="section" id="lensing"></section>

                {/* Section 10: Particles - Self-Organizing + Phase Space */}
                <section className="section" id="particles"></section>

                {/* Section 11: Waves - Cellular Automata + Wave Field */}
                <section className="section" id="waves"></section>
            </div>

            {/* Section Navigation Indicators */}
            <SectionIndicators
                activeSection={activeSection}
                sections={siteConfig.navigation}
                onNavigate={scrollToSection}
            />
        </>
    )
}

export default App
