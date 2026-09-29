import * as THREE from 'three';
import vertexShader from '../shaders/accretion/vertex.glsl';
import fragmentShader from '../shaders/accretion/fragment.glsl';

const DEFAULTS = {
  innerRadius: 0.28,
  outerRadius: 1,
  thickness: 0.08,
  inclination: 1.05,
  rotationSpeed: 0.08,
  noiseScale: 3.4,
  noiseStrength: 0.11,
  bandFrequency: 42,
  brightness: 2.1,
  opacity: 1,
};

export class AccretionDisk extends THREE.Group {
  constructor(config = {}, quality = 'HIGH') {
    super();
    this.name = 'AccretionDisk';
    this.config = { ...DEFAULTS, ...config };
    this.geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uInnerRadius: { value: this.config.innerRadius },
        uOuterRadius: { value: this.config.outerRadius },
        uThickness: { value: this.config.thickness },
        uRotationSpeed: { value: this.config.rotationSpeed },
        uNoiseScale: { value: this.config.noiseScale },
        uNoiseStrength: { value: this.config.noiseStrength },
        uBandFrequency: { value: this.config.bandFrequency },
        uBrightness: { value: this.config.brightness },
        uOpacity: { value: this.config.opacity },
        uQuality: { value: quality === 'HIGH' ? 1 : 0 },
        uColorInner: { value: new THREE.Color(config.colorInner ?? '#ffffff') },
        uColorMiddle: { value: new THREE.Color(config.colorMiddle ?? '#fff200') },
        uColorOuter: { value: new THREE.Color(config.colorOuter ?? '#ffb800') },
      },
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = 'AccretionDiskSurface';
    this.mesh.rotation.x = this.config.inclination;
    this.mesh.renderOrder = 3;
    this.add(this.mesh);
  }

  update(frame) {
    this.material.uniforms.uTime.value = frame?.elapsed ?? 0;
  }

  reveal(progress) {
    this.material.uniforms.uOpacity.value = THREE.MathUtils.clamp(progress, 0, 1) * this.config.opacity;
  }

  applyConfig(config = {}) {
    Object.assign(this.config, config);
    const u = this.material.uniforms;
    const keys = {
      innerRadius: 'uInnerRadius', outerRadius: 'uOuterRadius', thickness: 'uThickness',
      rotationSpeed: 'uRotationSpeed', noiseScale: 'uNoiseScale', noiseStrength: 'uNoiseStrength',
      bandFrequency: 'uBandFrequency', brightness: 'uBrightness', opacity: 'uOpacity',
    };
    Object.entries(keys).forEach(([key, uniform]) => {
      if (Number.isFinite(config[key])) u[uniform].value = config[key];
    });
    if (Number.isFinite(config.inclination)) this.mesh.rotation.x = config.inclination;
    if (config.colorInner) u.uColorInner.value.set(config.colorInner);
    if (config.colorMiddle) u.uColorMiddle.value.set(config.colorMiddle);
    if (config.colorOuter) u.uColorOuter.value.set(config.colorOuter);
  }

  setQuality(profile) {
    this.material.uniforms.uQuality.value = profile === 'HIGH' ? 1 : 0;
  }

  reset() {
    this.material.uniforms.uTime.value = 0;
    this.material.uniforms.uOpacity.value = 0;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}

export default AccretionDisk;
