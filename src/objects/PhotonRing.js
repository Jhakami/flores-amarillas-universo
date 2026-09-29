import * as THREE from 'three';
import vertexShader from '../shaders/photon-ring/vertex.glsl';
import fragmentShader from '../shaders/photon-ring/fragment.glsl';

const DEFAULTS = { radius: 0.35, thickness: 0.022, intensity: 3.2, pulseAmount: 0.025, opacity: 1 };

export class PhotonRing extends THREE.Group {
  constructor(config = {}, quality = 'HIGH') {
    super();
    this.name = 'PhotonRing';
    this.config = { ...DEFAULTS, ...config };
    const segments = quality === 'LOW' ? 64 : quality === 'MEDIUM' ? 96 : 160;
    this.geometry = new THREE.TorusGeometry(this.config.radius, this.config.thickness, 12, segments);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: this.config.intensity },
        uPulseAmount: { value: this.config.pulseAmount },
        uOpacity: { value: this.config.opacity },
        uColorCore: { value: new THREE.Color(config.colorCore ?? '#ffffff') },
        uColorGlow: { value: new THREE.Color(config.colorGlow ?? '#fff200') },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = 'PhotonRingMesh';
    this.mesh.renderOrder = 4;
    this.add(this.mesh);
  }

  update(frame) { this.material.uniforms.uTime.value = frame?.elapsed ?? 0; }
  reveal(progress) { this.material.uniforms.uOpacity.value = THREE.MathUtils.clamp(progress, 0, 1) * this.config.opacity; }

  applyConfig(config = {}) {
    Object.assign(this.config, config);
    const u = this.material.uniforms;
    if (Number.isFinite(config.intensity)) u.uIntensity.value = config.intensity;
    if (Number.isFinite(config.pulseAmount)) u.uPulseAmount.value = config.pulseAmount;
    if (Number.isFinite(config.opacity)) u.uOpacity.value = config.opacity;
    if (config.colorCore) u.uColorCore.value.set(config.colorCore);
    if (config.colorGlow) u.uColorGlow.value.set(config.colorGlow);
    if (Number.isFinite(config.radius) || Number.isFinite(config.thickness)) {
      const old = this.geometry;
      this.geometry = new THREE.TorusGeometry(this.config.radius, this.config.thickness, 12, old.parameters.tubularSegments);
      this.mesh.geometry = this.geometry;
      old.dispose();
    }
  }

  reset() { this.material.uniforms.uTime.value = 0; this.material.uniforms.uOpacity.value = 0; }
  dispose() { this.geometry.dispose(); this.material.dispose(); }
}

export default PhotonRing;
