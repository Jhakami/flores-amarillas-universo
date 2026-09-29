import * as THREE from 'three';

export function seededRandom(seed = 20240921) { let value = seed >>> 0; return () => { value += 0x6d2b79f5; let t = value; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

export class UniverseLayout {
  constructor({ seed = 20240921, radius = 9, height = 6 } = {}) { this.seed = seed; this.radius = radius; this.height = height; }
  generate(count) { const random = seededRandom(this.seed); const result = []; const golden = Math.PI * (3 - Math.sqrt(5)); for (let i = 0; i < count; i += 1) { const ring = i % 5; const baseRadius = 3.4 + ring * (this.radius - 3.4) / 4; const radius = baseRadius * (0.88 + random() * 0.25); const angle = i * golden + (random() - 0.5) * 0.45; const latitude = (random() - 0.5) * this.height + Math.sin(angle * 2.1) * (0.35 + ring * 0.12); result.push({ position: new THREE.Vector3(Math.cos(angle) * radius, latitude, Math.sin(angle) * radius), scale: 0.42 + random() * 0.82 + (ring === 4 ? 0.22 : 0), rotation: (random() - 0.5) * 0.32, phase: random() * Math.PI * 2, orbitSpeed: (0.008 + random() * 0.018) * (random() > 0.5 ? 1 : -1), variant: i % 8 }); } return result; }
}
