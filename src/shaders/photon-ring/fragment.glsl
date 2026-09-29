precision highp float;

uniform float uTime;
uniform float uIntensity;
uniform float uPulseAmount;
uniform float uOpacity;
uniform vec3 uColorCore;
uniform vec3 uColorGlow;
varying vec2 vUv;

void main() {
  float crossSection = abs(vUv.y - 0.5) * 2.0;
  float core = pow(max(0.0, 1.0 - crossSection), 7.0);
  float halo = pow(max(0.0, 1.0 - crossSection), 1.8);
  float pulse = 1.0 + sin(uTime * 0.65) * uPulseAmount;
  vec3 color = mix(uColorGlow, uColorCore, core) * (halo + core * 2.5) * uIntensity * pulse;
  float alpha = smoothstep(1.0, 0.04, crossSection) * uOpacity;
  gl_FragColor = vec4(color * alpha, alpha);
}
