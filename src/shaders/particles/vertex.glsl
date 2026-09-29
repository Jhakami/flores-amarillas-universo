uniform float uTime;
uniform float uProgress;
uniform float uExplosionProgress;
uniform float uStarProgress;
uniform float uPointScale;
uniform float uPixelRatio;
uniform float uReducedMotion;

attribute vec3 aStartPosition;
attribute vec3 aTransitionPosition;
attribute vec3 aTargetPosition;
attribute float aRandom;
attribute float aSize;
attribute float aDelay;
attribute float aColorMix;

varying float vColorMix;
varying float vStarProgress;
varying float vAlpha;

float easeInOut(float x) {
  return x * x * (3.0 - 2.0 * x);
}

void main() {
  float staggered = clamp((uProgress - aDelay * 0.22) / 0.78, 0.0, 1.0);
  float progress = easeInOut(staggered);
  float firstLeg = easeInOut(min(progress * 2.0, 1.0));
  float secondLeg = easeInOut(max(progress * 2.0 - 1.0, 0.0));
  vec3 position = mix(aStartPosition, aTransitionPosition, firstLeg);
  position = mix(position, aTargetPosition, secondLeg);

  float motion = 1.0 - uReducedMotion * 0.72;
  float tremor = sin(uTime * (0.55 + aRandom) + aRandom * 31.0);
  vec3 radial = normalize(aTransitionPosition + vec3(0.0001));
  position += radial * tremor * 0.025 * uExplosionProgress * (1.0 - progress) * motion;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  float perspective = uPointScale / max(1.0, -mvPosition.z);
  float starSize = mix(aSize, max(0.65, aSize * 0.34), uStarProgress);
  gl_PointSize = clamp(starSize * perspective * uPixelRatio, 0.8, 6.5);
  vColorMix = aColorMix;
  vStarProgress = uStarProgress;
  vAlpha = smoothstep(0.0, 0.06, max(uProgress, 1.0 - uExplosionProgress));
}
