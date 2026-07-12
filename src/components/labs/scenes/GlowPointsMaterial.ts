import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

/**
 * Custom point-sprite material: soft radial glow falloff instead of a hard
 * square/circle dot, meant to be used with THREE.AdditiveBlending so
 * overlapping particles brighten instead of just occluding each other.
 * Reads the geometry's "color" BufferAttribute directly (no vertexColors
 * flag needed — that's a built-in-material-only concept).
 */
export const GlowPointsMaterial = shaderMaterial(
  { uOpacity: 1, uSize: 6 },
  /* vertex */ `
    attribute vec3 color;
    varying vec3 vColor;
    uniform float uSize;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = uSize * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  /* fragment */ `
    varying vec3 vColor;
    uniform float uOpacity;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      float alpha = smoothstep(0.5, 0.0, d);
      alpha = pow(alpha, 1.6) * uOpacity;
      gl_FragColor = vec4(vColor, alpha);
    }
  `,
);

extend({ GlowPointsMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    glowPointsMaterial: Record<string, unknown>;
  }
}
