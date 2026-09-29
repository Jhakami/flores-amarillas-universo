uniform vec3 uColorStart;
uniform vec3 uColorMid;
uniform vec3 uColorEnd;
uniform float uOpacity;

varying float vColorMix;
varying float vStarProgress;
varying float vAlpha;

void main() {
  vec2 point = gl_PointCoord - 0.5;
  float radius = length(point);
  if (radius > 0.5) discard;
  float core = 1.0 - smoothstep(0.04, 0.5, radius);
  float halo = 1.0 - smoothstep(0.18, 0.5, radius);
  vec3 petal = mix(uColorStart, uColorMid, vColorMix);
  vec3 color = mix(petal, uColorEnd, vStarProgress);
  float alpha = (core + halo * 0.42) * vAlpha * uOpacity;
  gl_FragColor = vec4(color, alpha);
}
