import * as THREE from 'three';
import vertexShader from '../shaders/stars/vertex.glsl';
import fragmentShader from '../shaders/stars/fragment.glsl';

function randomFactory(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }

export class DustField extends THREE.Points {
  constructor({ count = 1000, seed = 8128, radius = 16, depth = 45, pointScale = 115 } = {}) {
    const random = randomFactory(seed);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const randoms = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      const angle = random() * Math.PI * 2;
      const distance = Math.sqrt(random()) * radius;
      positions[i3] = Math.cos(angle) * distance;
      positions[i3 + 1] = (random() - 0.5) * radius * 0.48;
      positions[i3 + 2] = -random() * depth;
      sizes[i] = 1.2 + random() * 2.8;
      randoms[i] = random();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    const uniforms = { uTime: { value: 0 }, uPointScale: { value: pointScale }, uPixelRatio: { value: Math.min(globalThis.devicePixelRatio || 1, 2) }, uOpacity: { value: 0.34 }, uColor: { value: new THREE.Color('#ffd000') } };
    super(geometry, new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.uniforms = uniforms;
    this.rotationSpeed = 0.0035;
    this.frustumCulled = false;
  }
  update(elapsed) { this.uniforms.uTime.value = elapsed; this.rotation.z = elapsed * this.rotationSpeed; }
  setOpacity(value) { this.uniforms.uOpacity.value = THREE.MathUtils.clamp(value, 0, 1); }
  setPixelRatio(value) { this.uniforms.uPixelRatio.value = Math.min(value, 2); }
  dispose() { this.geometry.dispose(); this.material.dispose(); }
}
export default DustField;
