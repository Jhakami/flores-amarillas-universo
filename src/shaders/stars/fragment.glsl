uniform vec3 uColor;
varying float vBrightness;
varying float vOpacity;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float alpha = (1.0 - smoothstep(0.04, 0.5, d)) * vOpacity;
  gl_FragColor = vec4(uColor * vBrightness, alpha);
}
