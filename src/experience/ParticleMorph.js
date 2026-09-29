import * as THREE from 'three';

/** Timeline adapter for a persistent SunflowerParticleCloud. */
export class ParticleMorph {
  constructor({ cloud, duration = 2.2, reducedMotion = false, onComplete = null } = {}) {
    if (!cloud) throw new TypeError('ParticleMorph requires a cloud');
    this.id = 'particle-morph'; this.cloud = cloud; this.duration = Math.max(0.1, duration);
    this.reducedMotion = reducedMotion; this.onComplete = onComplete;
    this.elapsed = 0; this.active = false; this.completed = false;
  }
  enter(_context, payload = {}) {
    this.elapsed = 0; this.active = true; this.completed = false;
    if (Number.isFinite(payload.duration)) this.duration = Math.max(0.1, payload.duration);
    this.cloud.setReducedMotion(this.reducedMotion); this.cloud.reset(); this.cloud.visible = true;
  }
  update(frame) {
    if (!this.active) return;
    this.elapsed += frame.delta;
    const raw = THREE.MathUtils.clamp(this.elapsed / this.duration, 0, 1);
    const compression = THREE.MathUtils.clamp(this.elapsed / 0.25, 0, 1);
    const explosion = THREE.MathUtils.clamp((this.elapsed - 0.25) / 1.35, 0, 1);
    const stars = THREE.MathUtils.clamp((raw - 0.42) / 0.58, 0, 1);
    this.cloud.scale.setScalar(compression < 1 ? 1 - compression * 0.04 : 0.96 + Math.min(explosion / 0.26, 1) * 0.09);
    this.cloud.setExplosionProgress(explosion); this.cloud.setProgress(raw); this.cloud.setStarProgress(stars);
    if (raw >= 1 && !this.completed) { this.completed = true; this.active = false; this.cloud.scale.setScalar(1); if (this.onComplete) this.onComplete(this.cloud); }
  }
  exit() { this.active = false; }
  resize(viewport) { if (viewport?.pixelRatio) this.cloud.setPixelRatio(viewport.pixelRatio); }
  reset() { this.elapsed = 0; this.active = false; this.completed = false; this.cloud.scale.setScalar(1); this.cloud.reset(); }
  dispose() { this.active = false; this.onComplete = null; }
}
export default ParticleMorph;
