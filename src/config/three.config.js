// Three.js Configuration
export const threeConfig = {
    // Camera settings
    camera: {
        fov: 35,
        near: 0.1,
        far: 1000,
        initialPosition: [0, 2, 12],
    },

    // Renderer settings
    renderer: {
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: 3, // ACESFilmicToneMapping
        toneMappingExposure: 1.2,
    },

    // Performance settings
    performance: {
        dpr: [1, 2], // Device pixel ratio range
        maxParticles: 100,
        shadowMapSize: [2048, 2048],
    },

    // Animation settings
    animation: {
        cameraTransitionDuration: 1.8,
        cameraEasing: 'power2.inOut',
        modelTransitionDuration: 1.2,
    },
}

export default threeConfig
