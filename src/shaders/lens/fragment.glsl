precision highp float;
uniform sampler2D tDiffuse;
uniform vec2 uBlackHolePosition;
uniform vec2 uResolution;
uniform float uRadius;
uniform float uStrength;
uniform float uFalloff;
uniform float uAspect;
uniform float uEnabled;
uniform float uQuality;
varying vec2 vUv;
void main() {
  if (uEnabled < 0.5 || uRadius <= 0.0 || uStrength <= 0.0) {
    gl_FragColor = texture2D(tDiffuse, vUv);
    return;
  }
  vec2 delta = vUv - uBlackHolePosition;
  delta.x *= uAspect;
  float distanceToHole = length(delta);
  float innerRadius = uRadius * 0.12;
  float outerMask = 1.0 - smoothstep(uRadius * 0.35, uRadius, distanceToHole);
  float innerMask = smoothstep(innerRadius * 0.45, innerRadius, distanceToHole);
  float influence = outerMask * innerMask;
  float safeDistance = max(distanceToHole, innerRadius);
  float deflection = min(uStrength * influence * influence / safeDistance, uRadius * 0.34) * uFalloff;
  vec2 direction = delta / safeDistance;
  direction.x /= uAspect;
  vec2 distortedUv = clamp(vUv - direction * deflection, vec2(0.001), vec2(0.999));
  vec4 color = texture2D(tDiffuse, distortedUv);
  if (uQuality > 0.75 && influence > 0.001) {
    vec2 chroma = direction * deflection * 0.055;
    color.r = texture2D(tDiffuse, clamp(distortedUv - chroma, vec2(0.001), vec2(0.999))).r;
    color.b = texture2D(tDiffuse, clamp(distortedUv + chroma, vec2(0.001), vec2(0.999))).b;
  }
  gl_FragColor = color;
}
