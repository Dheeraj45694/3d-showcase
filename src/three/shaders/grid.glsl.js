// Grid Shader - Animated grid that warps and curves
export const gridVertexShader = `
    uniform float uTime;
    uniform float uWaveIntensity;
    uniform float uSection;
    
    varying vec2 vUv;
    varying float vElevation;
    
    void main() {
        vUv = uv;
        
        vec3 pos = position;
        
        // Calculate distance from center
        float distanceFromCenter = length(pos.xy);
        
        // Create wave effect
        float wave = sin(distanceFromCenter * 0.5 - uTime * 0.5) * uWaveIntensity;
        float wave2 = cos(distanceFromCenter * 0.3 - uTime * 0.3) * uWaveIntensity * 0.5;
        
        // Apply curvature based on section
        float curvature = pow(distanceFromCenter * 0.05, 2.0) * (uSection * 0.3 + 0.5);
        
        // Combine effects
        pos.z += wave + wave2 - curvature;
        
        vElevation = pos.z;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`

export const gridFragmentShader = `
    uniform vec3 uGridColor;
    uniform float uOpacity;
    uniform float uSection;
    
    varying vec2 vUv;
    varying float vElevation;
    
    void main() {
        // Create grid lines
        float lineWidth = 0.02;
        float gridX = step(0.98, fract(vUv.x * 25.0));
        float gridY = step(0.98, fract(vUv.y * 25.0));
        float grid = max(gridX, gridY);
        
        // Add glow based on elevation
        float glow = max(0.0, vElevation * 2.0);
        
        // Color based on section with transition
        vec3 color = mix(uGridColor, uGridColor * 1.5, glow);
        
        // Fade out towards edges
        float distanceFromCenter = length(vUv - 0.5);
        float alpha = (1.0 - smoothstep(0.3, 0.5, distanceFromCenter)) * uOpacity;
        
        gl_FragColor = vec4(color, grid * alpha);
    }
`
