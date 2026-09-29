import * as THREE from 'three';
import vertexShader from '../shaders/stars/vertex.glsl';
import fragmentShader from '../shaders/stars/fragment.glsl';

function seeded(seed) {
  return () => ((seed = Math.imul(seed ^ (seed >>> 15), 1 | seed) + 0x6d2b79f5) >>> 0) / 4294967296;
}

/** Additional deep-space stars. The morph cloud remains the primary star field. */
export class StarField extends THREE.Points {
  constructor({ count = 3000, seed = 4421, depth = 70, width = 34, pointScale = 80, opacity = 0 } = {}) {
    const random = seeded(seed);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const randoms = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      const cluster = random() < 0.7 ? Math.pow(random(), 1.9) : random();
      positions[i3] = (random() - 0.5) * width * (0.45 + cluster);
      positions[i3 + 1] = (random() - 0.5) * width * 0.62 * (0.45 + cluster);
      positions[i3 + 2] = -4 - random() * depth;
      sizes[i] = 0.7 + Math.pow(random(), 5) * 3.2;
      randoms[i] = random();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    const uniforms = {
      uTime: { value: 0 }, uPointScale: { value: pointScale },
      uPixelRatio: { value: Math.min(globalThis.devicePixelRatio || 1, 2) },
      uOpacity: { value: opacity }, uColor: { value: new THREE.Color('#fffcea') },
    };
    super(geometry, new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.uniforms = uniforms;
    this.frustumCulled = false;
  }
  update(elapsed) { this.uniforms.uTime.value = elapsed; }
  setOpacity(value) { this.uniforms.uOpacity.value = THREE.MathUtils.clamp(value, 0, 1); }
  setPixelRatio(value) { this.uniforms.uPixelRatio.value = Math.min(value, 2); }
  dispose() { this.geometry.dispose(); this.material.dispose(); }
}
export default StarField;
