precision highp float;

uniform float uTime;
uniform float uInnerRadius;
uniform float uOuterRadius;
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

varying vec2 vUv;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + 1.0), f.x), f.y);
}

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float radius = length(p);
  float ringWidth = max(uOuterRadius - uInnerRadius, 0.001);
  float radial = (radius - uInnerRadius) / ringWidth;
  if (radial < 0.0 || radial > 1.0) discard;

  float angle = atan(p.y, p.x);
  float spin = angle + uTime * uRotationSpeed * mix(1.7, 0.65, radial);
  float turbulence = valueNoise(vec2(spin * uNoiseScale, radial * uNoiseScale * 3.0 - uTime * 0.035));
  if (uQuality > 0.5) {
    turbulence = mix(turbulence, valueNoise(vec2(spin * uNoiseScale * 2.1, radial * 9.0 + uTime * 0.02)), 0.35);
  }
  float warped = radial + (turbulence - 0.5) * uNoiseStrength;
  float bands = 0.58 + 0.42 * sin(warped * uBandFrequency + spin * 1.25);
  bands = mix(bands, 1.0, 0.38);

  float edge = smoothstep(0.0, uThickness, radial) * smoothstep(0.0, uThickness, 1.0 - radial);
  float hotCore = pow(1.0 - radial, 2.2);
  vec3 outerMix = mix(uColorMiddle, uColorOuter, smoothstep(0.25, 1.0, radial));
  vec3 color = mix(outerMix, uColorInner, hotCore);
  float streak = mix(0.72, 1.3, turbulence) * bands;
  float alpha = edge * streak * uOpacity;
  color *= uBrightness * mix(0.7, 2.0, hotCore);

  gl_FragColor = vec4(color * alpha, alpha);
}
