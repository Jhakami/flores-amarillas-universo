import * as THREE from 'three';
import vertexShader from '../shaders/stars/vertex.glsl';
import fragmentShader from '../shaders/stars/fragment.glsl';

export function splitBalancedLines(text, maxLines = 2) {
  const normalized = String(text ?? '').trim().replace(/\s+/g, ' ');
  if (!normalized || maxLines < 2) return normalized ? [normalized] : [];
  const words = normalized.split(' ');
  if (words.length < 3) return [normalized];
  let splitIndex = 1;
  let smallestDifference = Number.POSITIVE_INFINITY;
  for (let index = 1; index < words.length; index += 1) {
    const first = words.slice(0, index).join(' ');
    const second = words.slice(index).join(' ');
    const difference = Math.abs(first.length - second.length);
    if (difference < smallestDifference) {
      smallestDifference = difference;
      splitIndex = index;
    }
  }
  return [words.slice(0, splitIndex).join(' '), words.slice(splitIndex).join(' ')];
}

export class TextParticleCloud extends THREE.Points {
  static sampleText({ text, font = '700 86px serif', width = 1024, height = 320, step = 4, scale = 0.0055 } = {}) {
    if (typeof document === 'undefined') return new Float32Array(0);
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.clearRect(0, 0, width, height); context.fillStyle = '#fff'; context.font = font;
    context.textAlign = 'center'; context.textBaseline = 'middle';
    const lines = String(text ?? '').includes('\n') ? String(text).split('\n').map(line => line.trim()).filter(Boolean) : splitBalancedLines(text);
    const lineHeight = 98;
    const firstY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => context.fillText(line, width / 2, firstY + index * lineHeight, width * 0.88));
    const data = context.getImageData(0, 0, width, height).data;
    const values = [];
    for (let y = 0; y < height; y += step) for (let x = 0; x < width; x += step) {
      if (data[(y * width + x) * 4 + 3] > 96) values.push((x - width / 2) * scale, (height / 2 - y) * scale, 0);
    }
    return new Float32Array(values);
  }

  constructor({ positions, text = 'Flores Amarillas', pointScale = 80 } = {}) {
    const points = positions || TextParticleCloud.sampleText({ text });
    const count = points.length / 3;
    const sizes = new Float32Array(count);
    const randoms = new Float32Array(count);
    for (let i = 0; i < count; i += 1) { sizes[i] = 1.4 + (i % 7) * 0.18; randoms[i] = ((i * 16807) % 2147483647) / 2147483647; }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    const uniforms = { uTime: { value: 0 }, uPointScale: { value: pointScale }, uPixelRatio: { value: Math.min(globalThis.devicePixelRatio || 1, 2) }, uOpacity: { value: 0 }, uColor: { value: new THREE.Color('#fff4a8') } };
    super(geometry, new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.uniforms = uniforms; this.frustumCulled = false;
  }
  update(elapsed) { this.uniforms.uTime.value = elapsed; }
  setOpacity(value) { this.uniforms.uOpacity.value = THREE.MathUtils.clamp(value, 0, 1); }
  setPixelRatio(value) { this.uniforms.uPixelRatio.value = Math.min(value, 2); }
  dispose() { this.geometry.dispose(); this.material.dispose(); }
}
export default TextParticleCloud;
