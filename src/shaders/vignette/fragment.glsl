precision highp float;

uniform sampler2D tDiffuse;
uniform float uOffset;
uniform float uDarkness;
varying vec2 vUv;

void main() {
  vec4 source = texture2D(tDiffuse, vUv);
  vec2 uv = (vUv - 0.5) * vec2(uOffset);
  float vignette = smoothstep(0.82, 0.18, dot(uv, uv));
  source.rgb = mix(source.rgb * (1.0 - uDarkness), source.rgb, vignette);
  gl_FragColor = source;
}
