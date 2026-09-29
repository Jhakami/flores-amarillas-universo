precision highp float;

uniform sampler2D tDiffuse;
uniform vec2 uBlackHolePosition;
uniform vec2 uResolution;
uniform float uRadius;
uniform float uStrength;
uniform float uFalloff;
uniform float uAspect;
uniform float uEnabled;
varying vec2 vUv;

void main() {
  if (uEnabled < 0.5 || uRadius <= 0.0 || uStrength <= 0.0) {
    gl_FragColor = texture2D(tDiffuse, vUv);
    return;
  }

  vec2 delta = vUv - uBlackHolePosition;
  delta.x *= uAspect;
  float distanceToHole = length(delta);
  float influence = 1.0 - smoothstep(0.0, uRadius, distanceToHole);
  float safeDistance = max(distanceToHole, uRadius * 0.09);
  float deflection = uStrength * influence * influence / safeDistance;
  deflection = min(deflection, uRadius * 0.36);
  vec2 direction = delta / safeDistance;
  direction.x /= uAspect;
  vec2 distortedUv = clamp(vUv - direction * deflection * uFalloff, vec2(0.001), vec2(0.999));
  gl_FragColor = texture2D(tDiffuse, distortedUv);
}
