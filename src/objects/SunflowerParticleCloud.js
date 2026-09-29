import * as THREE from 'three';
import vertexShader from '../shaders/particles/vertex.glsl';
import fragmentShader from '../shaders/particles/fragment.glsl';

function mulberry32(seed) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class SunflowerParticleCloud extends THREE.Points {
  constructor({ count = 4000, seed = 1977, radius = 1.15, starDepth = 42, pointScale = 90 } = {}) {
    const random = mulberry32(seed);
    const start = new Float32Array(count * 3);
    const transition = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const sizes = new Float32Array(count);
    const delays = new Float32Array(count);
    const colors = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      const r = random();
      let x;
      let y;
      if (r < 0.38) {
        const angle = random() * Math.PI * 2;
        const diskRadius = Math.sqrt(random()) * radius * 0.34;
        x = Math.cos(angle) * diskRadius;
        y = Math.sin(angle) * diskRadius;
        colors[i] = random() * 0.35;
      } else {
        const petals = 34;
        const petal = Math.floor(random() * petals);
        const angle = (petal / petals) * Math.PI * 2 + (random() - 0.5) * 0.075;
        const along = Math.pow(random(), 0.58);
        const width = Math.sin(along * Math.PI) * radius * 0.075 * (random() - 0.5);
        const localRadius = radius * (0.28 + along * 0.72);
        x = Math.cos(angle) * localRadius - Math.sin(angle) * width;
        y = Math.sin(angle) * localRadius + Math.cos(angle) * width;
        colors[i] = 0.4 + random() * 0.6;
      }
      const z = (random() - 0.5) * 0.11;
      start[i3] = x;
      start[i3 + 1] = y;
      start[i3 + 2] = z;
      const invLength = 1 / Math.max(0.0001, Math.hypot(x, y));
      const burst = radius * (1.15 + random() * 2.2);
      transition[i3] = x + x * invLength * burst + (random() - 0.5) * 0.35;
      transition[i3 + 1] = y + y * invLength * burst + (random() - 0.5) * 0.35;
      transition[i3 + 2] = z + (random() - 0.5) * 3.5;
      const cluster = random() < 0.64 ? Math.pow(random(), 1.8) : random();
      target[i3] = (random() - 0.5) * (12 + cluster * 18);
      target[i3 + 1] = (random() - 0.5) * (8 + cluster * 12);
      target[i3 + 2] = -2 - random() * starDepth;
      randoms[i] = random();
      sizes[i] = 1.7 + random() * 3.4;
      delays[i] = random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(start, 3));
    geometry.setAttribute('aStartPosition', new THREE.BufferAttribute(start, 3));
    geometry.setAttribute('aTransitionPosition', new THREE.BufferAttribute(transition, 3));
    geometry.setAttribute('aTargetPosition', new THREE.BufferAttribute(target, 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aDelay', new THREE.BufferAttribute(delays, 1));
    geometry.setAttribute('aColorMix', new THREE.BufferAttribute(colors, 1));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -starDepth * 0.5), starDepth);

    const uniforms = {
      uTime: { value: 0 }, uProgress: { value: 0 }, uExplosionProgress: { value: 0 },
      uStarProgress: { value: 0 }, uPointScale: { value: pointScale },
      uPixelRatio: { value: Math.min(globalThis.devicePixelRatio || 1, 2) },
      uReducedMotion: { value: 0 }, uOpacity: { value: 1 },
      uColorStart: { value: new THREE.Color('#ffb700') },
      uColorMid: { value: new THREE.Color('#fff200') },
      uColorEnd: { value: new THREE.Color('#fffcea') },
    };
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    super(geometry, material);
    this.frustumCulled = false;
    this.uniforms = uniforms;
    this.mode = 'SUNFLOWER';
  }

  update(elapsed) { this.uniforms.uTime.value = elapsed; }
  setProgress(value) { this.uniforms.uProgress.value = THREE.MathUtils.clamp(value, 0, 1); }
  setExplosionProgress(value) { this.uniforms.uExplosionProgress.value = THREE.MathUtils.clamp(value, 0, 1); }
  setStarProgress(value) { this.uniforms.uStarProgress.value = THREE.MathUtils.clamp(value, 0, 1); if (value >= 1) this.mode = 'STARFIELD'; }
  setReducedMotion(value) { this.uniforms.uReducedMotion.value = value ? 1 : 0; }
  setPixelRatio(value) { this.uniforms.uPixelRatio.value = Math.min(value, 2); }
  reset() { this.mode = 'SUNFLOWER'; this.setProgress(0); this.setExplosionProgress(0); this.setStarProgress(0); }
  dispose() { this.geometry.dispose(); this.material.dispose(); }
}

export default SunflowerParticleCloud;
