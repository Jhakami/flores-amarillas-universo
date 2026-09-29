import * as THREE from 'three';
import vertexShader from '../shaders/photon-ring/vertex.glsl';
import fragmentShader from '../shaders/photon-ring/fragment.glsl';

const DEFAULTS = { radius: 0.35, thickness: 0.022, intensity: 1, pulseAmount: 0.018, opacity: 0.86 };
const QUALITY = {
  LOW: { radial: 8, tubular: 64, shader: 0 },
  MEDIUM: { radial: 12, tubular: 112, shader: 0.5 },
  HIGH: { radial: 18, tubular: 176, shader: 1 },
};

export class PhotonRing extends THREE.Group {
  constructor(config = {}, quality = 'HIGH') {
    super();
    this.name = 'PhotonRing';
    this.config = { ...DEFAULTS, ...config };
    this.quality = QUALITY[quality] ? quality : 'HIGH';
    this.geometry = this._createGeometry();
    this.material = new THREE.ShaderMaterial({
      vertexShader, fragmentShader,
      uniforms: {
        uTime: { value: 0 }, uIntensity: { value: this.config.intensity },
        uPulseAmount: { value: this.config.pulseAmount }, uOpacity: { value: this.config.opacity },
        uQuality: { value: QUALITY[this.quality].shader },
        uColorCore: { value: new THREE.Color(config.colorCore ?? '#ffffff') },
        uColorGlow: { value: new THREE.Color(config.colorGlow ?? '#fff200') },
      },
      transparent: true, depthWrite: false, depthTest: true,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = 'PhotonRingMesh';
    // TorusGeometry is created around Z; rotate it into the disk's XZ plane.
    this.mesh.rotation.x = Math.PI * 0.5;
    this.mesh.renderOrder = 4;
    this.add(this.mesh);
  }

  _createGeometry() {
    const settings = QUALITY[this.quality];
    return new THREE.TorusGeometry(this.config.radius, this.config.thickness, settings.radial, settings.tubular);
  }
  _rebuildGeometry() {
    const previous = this.geometry;
    this.geometry = this._createGeometry();
    this.mesh.geometry = this.geometry;
    previous.dispose();
  }
  update(frame) { this.material.uniforms.uTime.value = frame?.elapsed ?? 0; }
  reveal(progress) { this.material.uniforms.uOpacity.value = THREE.MathUtils.clamp(progress, 0, 1) * this.config.opacity; }
  applyConfig(config = {}) {
    const rebuild = Number.isFinite(config.radius) || Number.isFinite(config.thickness);
    Object.entries(config).forEach(([key, value]) => { if (value !== undefined) this.config[key] = value; });
    const u = this.material.uniforms;
    if (Number.isFinite(config.intensity)) u.uIntensity.value = config.intensity;
    if (Number.isFinite(config.pulseAmount)) u.uPulseAmount.value = config.pulseAmount;
    if (Number.isFinite(config.opacity)) u.uOpacity.value = config.opacity;
    if (config.colorCore) u.uColorCore.value.set(config.colorCore);
    if (config.colorGlow) u.uColorGlow.value.set(config.colorGlow);
    if (rebuild) this._rebuildGeometry();
  }
  setQuality(profile) {
    if (!QUALITY[profile]) return;
    const changed = this.quality !== profile;
    this.quality = profile;
    this.material.uniforms.uQuality.value = QUALITY[profile].shader;
    if (changed) this._rebuildGeometry();
  }
  reset() { this.material.uniforms.uTime.value = 0; this.material.uniforms.uOpacity.value = 0; }
  dispose() { this.geometry.dispose(); this.material.dispose(); }
}
export default PhotonRing;
