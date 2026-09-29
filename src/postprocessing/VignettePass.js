import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import vertexShader from '../shaders/lens/vertex.glsl';
import fragmentShader from '../shaders/vignette/fragment.glsl';

export const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    uOffset: { value: 1.08 },
    uDarkness: { value: 0.24 },
  },
  vertexShader,
  fragmentShader,
};

export class VignettePass extends ShaderPass {
  constructor(config = {}) {
    super(VignetteShader);
    this.name = 'VignettePass';
    this.applyConfig(config);
  }

  applyConfig(config = {}) {
    if (Number.isFinite(config.offset)) this.uniforms.uOffset.value = config.offset;
    if (Number.isFinite(config.darkness)) this.uniforms.uDarkness.value = config.darkness;
    if (typeof config.enabled === 'boolean') this.enabled = config.enabled;
  }

  dispose() { this.material.dispose(); this.fsQuad.dispose(); }
}

export default VignettePass;
