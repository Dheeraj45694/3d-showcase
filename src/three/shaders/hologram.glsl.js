// Hologram Shader - Creates holographic/wireframe effect
export const hologramVertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    
    void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        vUv = uv;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`

export const hologramFragmentShader = `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uIsActive;
    uniform float uFresnelPower;
    uniform float uScanLineSpeed;
    uniform float uScanLineWidth;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    
    void main() {
        // Fresnel effect (edge glow)
        vec3 viewDirection = normalize(cameraPosition - vPosition);
        float fresnel = pow(1.0 - dot(viewDirection, vNormal), uFresnelPower);
        
        // Scan lines
        float scanLine = sin(vPosition.y * 10.0 - uTime * uScanLineSpeed);
        scanLine = smoothstep(uScanLineWidth, uScanLineWidth + 0.1, scanLine);
        
        // Wireframe effect
        float wireframe = 0.0;
        vec2 derivative = fwidth(vUv);
        vec2 grid = abs(fract(vUv * 20.0 - 0.5) - 0.5) / derivative;
        wireframe = min(grid.x, grid.y);
        wireframe = 1.0 - min(wireframe, 1.0);
        
        // Combine effects
        float combinedEffect = max(fresnel, wireframe * 0.5) + scanLine * 0.2;
        
        // Pulse effect
        float pulse = sin(uTime * 1.5) * 0.2 + 0.8;
        
        // Final color with activation interpolation
        vec3 finalColor = uColor * combinedEffect * pulse;
        float finalAlpha = combinedEffect * uOpacity * uIsActive;
        
        gl_FragColor = vec4(finalColor, finalAlpha);
    }
`
