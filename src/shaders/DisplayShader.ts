export const displayFragmentShader = `
uniform sampler2D uTexture;

varying vec2 vUv;

void main() {
    float state = texture2D(uTexture, vUv).r;
    
    // Map alive state to a color (e.g., green/cyan) and dead to dark
    vec3 aliveColor = vec3(0.0, 1.0, 0.8);
    vec3 deadColor = vec3(0.05, 0.05, 0.05);
    
    vec3 color = mix(deadColor, aliveColor, state);
    
    gl_FragColor = vec4(color, 1.0);
}
`;

export const displayVertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
