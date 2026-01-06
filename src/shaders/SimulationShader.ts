export const simulationFragmentShader = `
uniform sampler2D uTexture;
uniform vec2 uResolution;

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    
    // Size of one pixel
    vec2 pixel = 1.0 / uResolution.xy;

    // Get the state of the current cell
    float current = texture2D(uTexture, uv).r;

    // Count alive neighbors
    float neighbors = 0.0;
    
    // Iterate through 3x3 grid around current pixel
    for (float i = -1.0; i <= 1.0; i++) {
        for (float j = -1.0; j <= 1.0; j++) {
            // Skip the center pixel (current cell)
            if (i == 0.0 && j == 0.0) continue;
            
            vec2 offset = vec2(i, j) * pixel;
            neighbors += texture2D(uTexture, uv + offset).r;
        }
    }

    float nextState = 0.0;

    if (current > 0.5) {
        // Alive cell rules
        if (neighbors >= 1.9 && neighbors <= 3.1) {
            nextState = 1.0; // Stay alive
        } else {
            nextState = 0.0; // Die (underpopulation or overpopulation)
        }
    } else {
        // Dead cell rules
        if (neighbors >= 2.9 && neighbors <= 3.1) {
            nextState = 1.0; // Become alive (reproduction)
        } else {
            nextState = 0.0; // Stay dead
        }
    }

    gl_FragColor = vec4(vec3(nextState), 1.0);
}
`;

export const simulationVertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
