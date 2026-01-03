// Site Configuration
export const siteConfig = {
    // Meta information
    meta: {
        title: '3D Portfolio | Creative Developer',
        description: 'An immersive 3D portfolio showcasing creative development work with stunning animations and interactive experiences.',
        author: 'Your Name',
    },

    // Navigation links - 12 themed visualization sections
    navigation: [
        { id: 0, label: 'Gravity', href: '#gravity' },
        { id: 1, label: 'Chaos', href: '#chaos' },
        { id: 2, label: 'Swarm', href: '#swarm' },
        { id: 3, label: 'Organic', href: '#organic' },
        { id: 4, label: 'Flow', href: '#flow' },
        { id: 5, label: 'Fractals', href: '#fractals' },
        { id: 6, label: 'Flames', href: '#flames' },
        { id: 7, label: 'Growth', href: '#growth' },
        { id: 8, label: 'City', href: '#city' },
        { id: 9, label: 'Lensing', href: '#lensing' },
        { id: 10, label: 'Particles', href: '#particles' },
        { id: 11, label: 'Waves', href: '#waves' },
    ],

    // Scroll configuration
    scroll: {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1,
        touchMultiplier: 2,
    },

    // Social links
    social: {
        github: 'https://github.com/yourusername',
        twitter: 'https://twitter.com/yourusername',
        linkedin: 'https://linkedin.com/in/yourusername',
        email: 'mailto:hello@example.com',
    },
}

export default siteConfig
