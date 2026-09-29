import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GravitationalLensPass } from './GravitationalLensPass.js';
import { VignettePass } from './VignettePass.js';

const DEFAULTS = {
  bloomStrength: 0.48,
  bloomRadius: 0.24,
  bloomThreshold: 0.72,
  exposure: 0.78,
  vignetteOffset: 1.08,
  vignetteDarkness: 0.38,
};

export class PostProcessing {
  constructor({ renderer, scene, camera, blackHole = null, config = {}, quality = 'HIGH' }) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.blackHole = blackHole;
    this.config = { ...DEFAULTS, ...config };
    this.quality = quality;

    this.composer = new EffectComposer(renderer);
    this.renderPass = new RenderPass(scene, camera);
    this.lensPass = new GravitationalLensPass({ ...config, quality });
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(1, 1),
      this.config.bloomStrength,
      this.config.bloomRadius,
      this.config.bloomThreshold,
    );
    this.vignettePass = new VignettePass({
      offset: this.config.vignetteOffset,
      darkness: this.config.vignetteDarkness,
      enabled: true,
    });
    this.outputPass = new OutputPass();

    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.lensPass);
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(this.vignettePass);
    this.composer.addPass(this.outputPass);
    this.renderer.toneMappingExposure = this.config.exposure;
    this.setQuality(quality);
  }

  render(delta = 0) {
    this.lensPass.update(this.camera, this.blackHole);
    this.composer.render(delta);
  }

  update(_frame) { this.lensPass.update(this.camera, this.blackHole); }

  resize(width, height, pixelRatio = this.renderer.getPixelRatio()) {
    this.composer.setPixelRatio(pixelRatio);
    this.composer.setSize(width, height);
    this.lensPass.setSize(width * pixelRatio, height * pixelRatio);
  }

  setBlackHole(blackHole) { this.blackHole = blackHole; }

  setQuality(profile) {
    this.quality = profile;
    this.lensPass.setQuality(profile);
    this.vignettePass.enabled = true;
    const factor = profile === 'LOW' ? 0.62 : profile === 'MEDIUM' ? 0.82 : 1;
    this.bloomPass.strength = this.config.bloomStrength * factor;
    this.bloomPass.radius = this.config.bloomRadius * (profile === 'LOW' ? 0.7 : 1);
  }

  applyConfig(config = {}) {
    Object.assign(this.config, config);
    if (Number.isFinite(config.bloomStrength)) this.bloomPass.strength = config.bloomStrength;
    if (Number.isFinite(config.bloomRadius)) this.bloomPass.radius = config.bloomRadius;
    if (Number.isFinite(config.bloomThreshold)) this.bloomPass.threshold = config.bloomThreshold;
    if (Number.isFinite(config.exposure)) this.renderer.toneMappingExposure = config.exposure;
    this.lensPass.applyConfig(config);
    this.vignettePass.applyConfig({ offset: config.vignetteOffset, darkness: config.vignetteDarkness });
    this.setQuality(config.quality ?? this.quality);
  }

  dispose() {
    this.renderPass.dispose?.();
    this.lensPass.dispose();
    this.bloomPass.dispose();
    this.vignettePass.dispose();
    this.outputPass.dispose?.();
    this.composer.dispose();
  }
}

export default PostProcessing;
