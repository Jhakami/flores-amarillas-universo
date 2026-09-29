import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import vertexShader from '../shaders/lens/vertex.glsl';
import fragmentShader from '../shaders/lens/fragment.glsl';

export const GravitationalLensShader = {
  uniforms: {
    tDiffuse: { value: null },
    uBlackHolePosition: { value: new THREE.Vector2(0.5, 0.5) },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uRadius: { value: 0.2 },
    uStrength: { value: 0.018 },
    uFalloff: { value: 1 },
    uAspect: { value: 1 },
    uEnabled: { value: 1 },
    uQuality: { value: 1 },
  },
  vertexShader,
  fragmentShader,
};

export class GravitationalLensPass extends ShaderPass {
  constructor(config = {}) {
    super(GravitationalLensShader);
    this.name = 'GravitationalLensPass';
    this._projected = new THREE.Vector3();
    this._worldPosition = new THREE.Vector3();
    this._cameraWorldPosition = new THREE.Vector3();
    this._baseRadius = 0.2;
    this._requestedEnabled = config.enabled !== false;
    this.quality = config.quality ?? 'HIGH';
    this.applyConfig(config);
  }

  update(camera, blackHole) {
    if (!camera || !blackHole || !blackHole.visible || this.quality === 'LOW' || !this._requestedEnabled) {
      this.uniforms.uEnabled.value = 0;
      return;
    }
    blackHole.getWorldPosition(this._worldPosition);
    camera.getWorldPosition(this._cameraWorldPosition);
    const cameraDistance = Math.max(0.001, this._cameraWorldPosition.distanceTo(this._worldPosition));
    this._projected.copy(this._worldPosition).project(camera);
    const outsideDepth = this._projected.z < -1 || this._projected.z > 1;
    const outsideFrame = Math.abs(this._projected.x) > 1.45 || Math.abs(this._projected.y) > 1.45;
    this.uniforms.uEnabled.value = outsideDepth || outsideFrame ? 0 : 1;
    this.uniforms.uBlackHolePosition.value.set(this._projected.x * 0.5 + 0.5, this._projected.y * 0.5 + 0.5);
    // Preserve the public radius setting while making the effect follow dolly zoom.
    this.uniforms.uRadius.value = this._baseRadius * THREE.MathUtils.clamp(8 / cameraDistance, 0.48, 1.8);
  }

  setQuality(profile) {
    this.quality = profile;
    this.enabled = profile !== 'LOW' && this._requestedEnabled;
    this.uniforms.uEnabled.value = this.enabled ? 1 : 0;
    this.uniforms.uQuality.value = profile === 'HIGH' ? 1 : profile === 'MEDIUM' ? 0.5 : 0;
  }
  setSize(width, height) {
    this.uniforms.uResolution.value.set(width, height);
    this.uniforms.uAspect.value = height > 0 ? width / height : 1;
  }
  applyConfig(config = {}) {
    const radius = config.lensingRadius ?? config.radius;
    if (Number.isFinite(radius)) {
      this._baseRadius = radius;
      this.uniforms.uRadius.value = radius;
    }
    const strength = config.lensingStrength ?? config.strength;
    const falloff = config.lensingFalloff ?? config.falloff;
    if (Number.isFinite(strength)) this.uniforms.uStrength.value = strength;
    if (Number.isFinite(falloff)) this.uniforms.uFalloff.value = falloff;
    if (typeof config.enabled === 'boolean') this._requestedEnabled = config.enabled;
    this.setQuality(config.quality ?? this.quality);
  }
  dispose() { this.material.dispose(); this.fsQuad.dispose(); }
}
export default GravitationalLensPass;
