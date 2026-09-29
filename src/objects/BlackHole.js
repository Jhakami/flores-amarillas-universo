import * as THREE from 'three';
import { AccretionDisk } from './AccretionDisk.js';
import { PhotonRing } from './PhotonRing.js';

const DEFAULTS = {
  size: 1, horizonRadius: 0.31, diskRadius: 2.2, reveal: 0,
  funnelStrength: 0.055, horizonGlow: 0.16,
};
const HORIZON_SEGMENTS = {
  LOW: [28, 18], MEDIUM: [44, 28], HIGH: [64, 40],
};

function createHorizonGeometry(radius, funnelStrength, quality) {
  const [width, height] = HORIZON_SEGMENTS[quality] ?? HORIZON_SEGMENTS.HIGH;
  const geometry = new THREE.SphereGeometry(radius, width, height);
  const positions = geometry.attributes.position;
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const z = positions.getZ(index);
    if (y > 0) {
      const polar = 1 - Math.min(1, Math.hypot(x, z) / radius);
      positions.setY(index, y + funnelStrength * polar * polar);
    }
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

export class BlackHole extends THREE.Group {
  constructor(config = {}, quality = 'HIGH') {
    super();
    this.name = 'BlackHole';
    this.config = { ...DEFAULTS, ...config };
    this.quality = HORIZON_SEGMENTS[quality] ? quality : 'HIGH';
    this.horizonGeometry = createHorizonGeometry(this.config.horizonRadius, this.config.funnelStrength, this.quality);
    this.horizonMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, depthWrite: true, toneMapped: false });
    this.eventHorizon = new THREE.Mesh(this.horizonGeometry, this.horizonMaterial);
    this.eventHorizon.name = 'EventHorizon';
    this.eventHorizon.renderOrder = 5;

    this.haloGeometry = new THREE.SphereGeometry(1, 32, 20);
    this.haloMaterial = new THREE.MeshBasicMaterial({
      color: config.horizonGlowColor ?? 0xffc400,
      transparent: true,
      opacity: this.config.horizonGlow,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    this.horizonHalo = new THREE.Mesh(this.haloGeometry, this.haloMaterial);
    this.horizonHalo.name = 'EventHorizonHalo';
    this.horizonHalo.scale.setScalar(this.config.horizonRadius * 1.11);
    this.horizonHalo.renderOrder = 2;

    this.accretionDisk = new AccretionDisk({
      ...config,
      innerRadius: config.diskInnerRadius ?? (this.config.horizonRadius * 1.16 / this.config.diskRadius),
      outerRadius: config.diskOuterRadius ?? 1,
      thickness: config.diskThickness ?? 0.08,
      inclination: config.diskInclination ?? 0,
      rotationSpeed: config.diskSpeed ?? 0.08,
      verticalWarp: config.diskVerticalWarp ?? 0.035,
    }, this.quality);
    this.accretionDisk.scale.setScalar(this.config.diskRadius);
    this.photonRing = new PhotonRing({
      radius: config.photonRadius ?? this.config.horizonRadius * 1.14,
      thickness: config.photonThickness ?? 0.025,
      intensity: config.photonIntensity ?? 3.2,
    }, this.quality);

    this.add(this.accretionDisk, this.horizonHalo, this.eventHorizon, this.photonRing);
    this.scale.setScalar(this.config.size);
    this.reveal(this.config.reveal);
  }

  _rebuildHorizon() {
    const previous = this.horizonGeometry;
    this.horizonGeometry = createHorizonGeometry(this.config.horizonRadius, this.config.funnelStrength, this.quality);
    this.eventHorizon.geometry = this.horizonGeometry;
    this.horizonHalo.scale.setScalar(this.config.horizonRadius * 1.11);
    previous.dispose();
  }
  reveal(progress) {
    const p = THREE.MathUtils.clamp(progress, 0, 1);
    this.config.reveal = p;
    this.visible = p > 0.001;
    this.accretionDisk.reveal(THREE.MathUtils.smoothstep(p, 0.05, 0.72));
    this.photonRing.reveal(THREE.MathUtils.smoothstep(p, 0.28, 0.9));
    const horizonReveal = THREE.MathUtils.lerp(0.25, 1, THREE.MathUtils.smoothstep(p, 0.4, 1));
    this.eventHorizon.scale.setScalar(horizonReveal);
    this.horizonHalo.visible = this.quality !== 'LOW' && p > 0.32;
    this.haloMaterial.opacity = this.config.horizonGlow * THREE.MathUtils.smoothstep(p, 0.32, 0.92);
  }
  update(frame) {
    if (!this.visible) return;
    this.accretionDisk.update(frame);
    this.photonRing.update(frame);
  }
  setQuality(profile) {
    if (!HORIZON_SEGMENTS[profile]) return;
    const changed = this.quality !== profile;
    this.quality = profile;
    this.accretionDisk.setQuality(profile);
    this.photonRing.setQuality(profile);
    this.horizonHalo.visible = profile !== 'LOW' && this.config.reveal > 0.32;
    if (changed) this._rebuildHorizon();
  }
  applyConfig(config = {}) {
    const rebuildHorizon = Number.isFinite(config.horizonRadius) || Number.isFinite(config.funnelStrength);
    Object.assign(this.config, config);
    if (Number.isFinite(config.size)) this.scale.setScalar(config.size);
    if (Number.isFinite(config.diskRadius)) this.accretionDisk.scale.setScalar(config.diskRadius);
    if (Number.isFinite(config.horizonGlow)) this.haloMaterial.opacity = config.horizonGlow;
    if (config.horizonGlowColor) this.haloMaterial.color.set(config.horizonGlowColor);
    this.accretionDisk.applyConfig({
      ...config,
      innerRadius: config.diskInnerRadius, outerRadius: config.diskOuterRadius,
      thickness: config.diskThickness, inclination: config.diskInclination,
      rotationSpeed: config.diskSpeed, verticalWarp: config.diskVerticalWarp,
    });
    this.photonRing.applyConfig({
      radius: config.photonRadius ?? (Number.isFinite(config.horizonRadius) ? config.horizonRadius * 1.14 : undefined),
      thickness: config.photonThickness, intensity: config.photonIntensity,
      pulseAmount: config.photonPulseAmount, colorCore: config.photonColorCore, colorGlow: config.photonColorGlow,
    });
    if (rebuildHorizon) this._rebuildHorizon();
    if (Number.isFinite(config.reveal)) this.reveal(config.reveal);
  }
  getWorldPosition(target = new THREE.Vector3()) { return super.getWorldPosition(target); }
  setVisible(value) { this.visible = Boolean(value); }
  reset() { this.accretionDisk.reset(); this.photonRing.reset(); this.reveal(0); }
  dispose() {
    this.horizonGeometry.dispose();
    this.horizonMaterial.dispose();
    this.haloGeometry.dispose();
    this.haloMaterial.dispose();
    this.accretionDisk.dispose();
    this.photonRing.dispose();
    this.clear();
  }
}
export default BlackHole;
