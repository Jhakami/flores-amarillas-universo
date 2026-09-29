import * as THREE from 'three';
import { AccretionDisk } from './AccretionDisk.js';
import { PhotonRing } from './PhotonRing.js';

const DEFAULTS = { size: 1, horizonRadius: 0.31, diskRadius: 2.2, reveal: 0 };

export class BlackHole extends THREE.Group {
  constructor(config = {}, quality = 'HIGH') {
    super();
    this.name = 'BlackHole';
    this.config = { ...DEFAULTS, ...config };
    this.quality = quality;

    this.horizonGeometry = new THREE.SphereGeometry(this.config.horizonRadius, quality === 'LOW' ? 32 : 64, quality === 'LOW' ? 20 : 40);
    this.horizonMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, depthWrite: true, toneMapped: false });
    this.eventHorizon = new THREE.Mesh(this.horizonGeometry, this.horizonMaterial);
    this.eventHorizon.name = 'EventHorizon';
    this.eventHorizon.renderOrder = 5;

    this.accretionDisk = new AccretionDisk({
      ...config,
      innerRadius: config.diskInnerRadius ?? 0.31,
      outerRadius: config.diskOuterRadius ?? 1,
      thickness: config.diskThickness ?? 0.08,
      rotationSpeed: config.diskSpeed ?? 0.08,
    }, quality);
    this.accretionDisk.scale.setScalar(this.config.diskRadius);
    this.photonRing = new PhotonRing({
      radius: config.photonRadius ?? this.config.horizonRadius * 1.14,
      thickness: config.photonThickness ?? 0.025,
      intensity: config.photonIntensity ?? 3.2,
    }, quality);

    this.add(this.accretionDisk, this.eventHorizon, this.photonRing);
    this.scale.setScalar(this.config.size);
    this.reveal(this.config.reveal);
  }

  reveal(progress) {
    const p = THREE.MathUtils.clamp(progress, 0, 1);
    this.config.reveal = p;
    this.visible = p > 0.001;
    this.accretionDisk.reveal(THREE.MathUtils.smoothstep(p, 0.05, 0.72));
    this.photonRing.reveal(THREE.MathUtils.smoothstep(p, 0.28, 0.9));
    this.eventHorizon.scale.setScalar(THREE.MathUtils.lerp(0.25, 1, THREE.MathUtils.smoothstep(p, 0.4, 1)));
  }

  update(frame) {
    if (!this.visible) return;
    this.accretionDisk.update(frame);
    this.photonRing.update(frame);
  }

  setQuality(profile) {
    this.quality = profile;
    this.accretionDisk.setQuality(profile);
  }

  applyConfig(config = {}) {
    Object.assign(this.config, config);
    if (Number.isFinite(config.size)) this.scale.setScalar(config.size);
    if (Number.isFinite(config.diskRadius)) this.accretionDisk.scale.setScalar(config.diskRadius);
    this.accretionDisk.applyConfig({
      ...config,
      innerRadius: config.diskInnerRadius,
      outerRadius: config.diskOuterRadius,
      thickness: config.diskThickness,
      rotationSpeed: config.diskSpeed,
    });
    this.photonRing.applyConfig({
      radius: config.photonRadius,
      thickness: config.photonThickness,
      intensity: config.photonIntensity,
    });
    if (Number.isFinite(config.reveal)) this.reveal(config.reveal);
  }

  getWorldPosition(target = new THREE.Vector3()) { return super.getWorldPosition(target); }
  setVisible(value) { this.visible = Boolean(value); }
  reset() { this.accretionDisk.reset(); this.photonRing.reset(); this.reveal(0); }

  dispose() {
    this.horizonGeometry.dispose();
    this.horizonMaterial.dispose();
    this.accretionDisk.dispose();
    this.photonRing.dispose();
    this.clear();
  }
}

export default BlackHole;
