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
    this.quality = config.quality ?? 'HIGH';
    this.applyConfig(config);
  }

  update(camera, blackHole) {
    if (!camera || !blackHole || !blackHole.visible || this.quality === 'LOW') {
      this.uniforms.uEnabled.value = 0;
      return;
    }
    blackHole.getWorldPosition(this._worldPosition);
    this._projected.copy(this._worldPosition).project(camera);
    const behindCamera = this._projected.z < -1 || this._projected.z > 1;
    this.uniforms.uEnabled.value = behindCamera ? 0 : 1;
    this.uniforms.uBlackHolePosition.value.set(
      this._projected.x * 0.5 + 0.5,
      this._projected.y * 0.5 + 0.5,
    );
  }

  setQuality(profile) {
    this.quality = profile;
    this.enabled = profile !== 'LOW';
    this.uniforms.uEnabled.value = profile === 'LOW' ? 0 : 1;
    this.uniforms.uFalloff.value = profile === 'MEDIUM' ? 0.72 : 1;
  }

  setSize(width, height) {
    this.uniforms.uResolution.value.set(width, height);
    this.uniforms.uAspect.value = height > 0 ? width / height : 1;
  }

  applyConfig(config = {}) {
    if (Number.isFinite(config.lensingRadius ?? config.radius)) this.uniforms.uRadius.value = config.lensingRadius ?? config.radius;
    if (Number.isFinite(config.lensingStrength ?? config.strength)) this.uniforms.uStrength.value = config.lensingStrength ?? config.strength;
    if (Number.isFinite(config.lensingFalloff ?? config.falloff)) this.uniforms.uFalloff.value = config.lensingFalloff ?? config.falloff;
    if (config.enabled === false) this.uniforms.uEnabled.value = 0;
    this.setQuality(config.quality ?? this.quality);
  }

  dispose() {
    this.material.dispose();
    this.fsQuad.dispose();
  }
}

export default GravitationalLensPass;
