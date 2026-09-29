precision highp float;
uniform float uTime;
uniform float uInnerRadius;
uniform float uOuterRadius;
uniform float uRotationSpeed;
uniform float uVerticalWarp;
uniform float uQuality;
varying float vRadius;
varying float vAngle;
varying float vHeight;
varying vec3 vViewNormal;
void main() {
  vec3 displaced = position;
  float radius = length(position.xz);
  float radial = clamp((radius - uInnerRadius) / max(uOuterRadius - uInnerRadius, 0.001), 0.0, 1.0);
  float angle = atan(position.z, position.x);
  float wave = sin(angle * 5.0 - uTime * uRotationSpeed * 5.0 + radial * 11.0);
  wave += sin(angle * 11.0 + uTime * uRotationSpeed * 3.0 - radial * 19.0) * 0.35 * uQuality;
  displaced.y += wave * uVerticalWarp * mix(0.35, 1.0, uQuality) * sin(radial * 3.14159265);
  vRadius = radial;
  vAngle = angle;
  vHeight = displaced.y;
  vViewNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
