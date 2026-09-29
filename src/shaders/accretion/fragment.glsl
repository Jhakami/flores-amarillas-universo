precision highp float;
uniform float uTime;
uniform float uThickness;
uniform float uRotationSpeed;
uniform float uNoiseScale;
uniform float uNoiseStrength;
uniform float uBandFrequency;
uniform float uBrightness;
uniform float uOpacity;
uniform float uQuality;
uniform vec3 uColorInner;
uniform vec3 uColorMiddle;
uniform vec3 uColorOuter;
varying float vRadius;
varying float vAngle;
varying float vHeight;
varying vec3 vViewNormal;
float hash21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float valueNoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + 1.0), f.x), f.y);
}
void main() {
  float radial = clamp(vRadius, 0.0, 1.0);
  float spin = vAngle - uTime * uRotationSpeed * mix(2.1, 0.65, radial);
  float turbulence = valueNoise(vec2(spin * uNoiseScale, radial * uNoiseScale * 3.0 - uTime * 0.045));
  if (uQuality > 0.25) {
    float octave = valueNoise(vec2(spin * uNoiseScale * 2.13, radial * 10.0 + uTime * 0.025));
    turbulence = mix(turbulence, octave, 0.22 + uQuality * 0.14);
  }
  float warped = radial + (turbulence - 0.5) * uNoiseStrength;
  float bands = 0.68 + 0.32 * sin(warped * uBandFrequency + spin * 1.35);
  float fine = 1.0;
  if (uQuality > 0.75) fine = 0.86 + 0.14 * sin(warped * uBandFrequency * 2.35 - spin * 2.0);
  float edgeWidth = clamp(uThickness, 0.015, 0.42);
  float edge = smoothstep(0.0, edgeWidth, radial) * smoothstep(0.0, edgeWidth, 1.0 - radial);
  float hotCore = pow(1.0 - radial, 2.35);
  vec3 color = mix(uColorMiddle, uColorOuter, smoothstep(0.18, 1.0, radial));
  color = mix(color, uColorInner, hotCore);
  float grazingGlow = mix(1.24, 0.88, abs(vViewNormal.z));
  float verticalFade = 0.88 + 0.12 * exp(-abs(vHeight) * 18.0);
  float alpha = edge * mix(0.68, 1.3, turbulence) * bands * fine * uOpacity * verticalFade * grazingGlow;
  color *= uBrightness * mix(0.72, 2.15, hotCore);
  gl_FragColor = vec4(color * alpha, alpha);
}
