uniform float uTime;
uniform float uPointScale;
uniform float uPixelRatio;
uniform float uOpacity;
attribute float aSize;
attribute float aRandom;
varying float vBrightness;
varying float vOpacity;
void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  float twinkle = 0.78 + 0.22 * sin(uTime * (0.7 + aRandom) + aRandom * 41.0);
  gl_PointSize = clamp(aSize * twinkle * uPointScale * uPixelRatio / max(1.0, -mvPosition.z), 1.0, 8.0);
  vBrightness = twinkle;
  vOpacity = uOpacity;
}
