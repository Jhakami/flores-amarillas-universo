precision highp float;
uniform float uTime;
uniform float uIntensity;
uniform float uPulseAmount;
uniform float uOpacity;
uniform float uQuality;
uniform vec3 uColorCore;
uniform vec3 uColorGlow;
varying vec2 vUv;
varying vec3 vViewNormal;
varying vec3 vViewPosition;
void main() {
  vec3 viewDirection = normalize(-vViewPosition);
  float fresnel = pow(1.0 - abs(dot(normalize(vViewNormal), viewDirection)), 2.0);
  float tube = 1.0 - abs(fract(vUv.y) * 2.0 - 1.0);
  float filament = 0.92 + 0.08 * sin(vUv.x * 180.0 - uTime * 0.8) * uQuality;
  float core = pow(tube, 4.0);
  float halo = mix(0.45, 1.0, fresnel);
  float pulse = 1.0 + sin(uTime * 0.65) * uPulseAmount;
  vec3 color = mix(uColorGlow, uColorCore, core) * (0.62 + core * 0.92 + fresnel * 0.24);
  float alpha = clamp((0.58 + fresnel * 0.22) * filament * uOpacity, 0.0, 0.84);
  gl_FragColor = vec4(color * uIntensity * pulse * halo * alpha, alpha);
}
