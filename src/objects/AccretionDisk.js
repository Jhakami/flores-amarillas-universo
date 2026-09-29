import * as THREE from 'three';
import vertexShader from '../shaders/accretion/vertex.glsl';
import fragmentShader from '../shaders/accretion/fragment.glsl';

const DEFAULTS = {
  innerRadius: 0.28, outerRadius: 1, thickness: 0.08, inclination: 0,
  rotationSpeed: 0.08, noiseScale: 3.4, noiseStrength: 0.11,
  bandFrequency: 42, brightness: 0.78, opacity: 0.82, verticalWarp: 0.035,
};
const QUALITY = {
  LOW: { radialSegments: 5, tubularSegments: 72, shader: 0 },
  MEDIUM: { radialSegments: 9, tubularSegments: 128, shader: 0.5 },
  HIGH: { radialSegments: 14, tubularSegments: 192, shader: 1 },
};
function qualitySettings(profile) { return QUALITY[profile] ?? QUALITY.HIGH; }

// Closed annular volume: inner and outer walls remain visible at grazing angles.
function createAnnulusGeometry(innerRadius, outerRadius, thickness, profile) {
  const { radialSegments, tubularSegments } = qualitySettings(profile);
  const halfHeight = Math.max(0.006, Math.min(0.12, thickness * 0.12));
  const positions = [];
  const uvs = [];
  const indices = [];
  const addSurface = (height, flip) => {
    const offset = positions.length / 3;
    for (let ring = 0; ring <= radialSegments; ring += 1) {
      const radialT = ring / radialSegments;
      const radius = THREE.MathUtils.lerp(innerRadius, outerRadius, radialT);
      for (let segment = 0; segment <= tubularSegments; segment += 1) {
        const angleT = segment / tubularSegments;
        const angle = angleT * Math.PI * 2;
        positions.push(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
        uvs.push(angleT, radialT);
      }
    }
    const stride = tubularSegments + 1;
    for (let ring = 0; ring < radialSegments; ring += 1) {
      for (let segment = 0; segment < tubularSegments; segment += 1) {
        const a = offset + ring * stride + segment;
        const b = a + stride;
        if (flip) indices.push(a, b + 1, b, a, a + 1, b + 1);
        else indices.push(a, b, b + 1, a, b + 1, a + 1);
      }
    }
  };
  const addWall = (radius, inward) => {
    const offset = positions.length / 3;
    for (let segment = 0; segment <= tubularSegments; segment += 1) {
      const angleT = segment / tubularSegments;
      const angle = angleT * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      positions.push(x, -halfHeight, z, x, halfHeight, z);
      uvs.push(angleT, 0, angleT, 1);
    }
    for (let segment = 0; segment < tubularSegments; segment += 1) {
      const a = offset + segment * 2;
      if (inward) indices.push(a, a + 3, a + 1, a, a + 2, a + 3);
      else indices.push(a, a + 1, a + 3, a, a + 3, a + 2);
    }
  };
  addSurface(halfHeight, false);
  addSurface(-halfHeight, true);
  addWall(innerRadius, true);
  addWall(outerRadius, false);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

export class AccretionDisk extends THREE.Group {
  constructor(config = {}, quality = 'HIGH') {
    super();
    this.name = 'AccretionDisk';
    this.config = { ...DEFAULTS, ...config };
    this.quality = quality;
    this.geometry = createAnnulusGeometry(this.config.innerRadius, this.config.outerRadius, this.config.thickness, quality);
    this.material = new THREE.ShaderMaterial({
      vertexShader, fragmentShader,
      uniforms: {
        uTime: { value: 0 }, uInnerRadius: { value: this.config.innerRadius },
        uOuterRadius: { value: this.config.outerRadius }, uThickness: { value: this.config.thickness },
        uRotationSpeed: { value: this.config.rotationSpeed }, uNoiseScale: { value: this.config.noiseScale },
        uNoiseStrength: { value: this.config.noiseStrength }, uBandFrequency: { value: this.config.bandFrequency },
        uBrightness: { value: this.config.brightness }, uOpacity: { value: this.config.opacity },
        uQuality: { value: qualitySettings(quality).shader }, uVerticalWarp: { value: this.config.verticalWarp },
        uColorInner: { value: new THREE.Color(config.colorInner ?? '#ffffff') },
        uColorMiddle: { value: new THREE.Color(config.colorMiddle ?? '#fff200') },
        uColorOuter: { value: new THREE.Color(config.colorOuter ?? '#ffb800') },
      },
      transparent: true, depthWrite: false, depthTest: true,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = 'AccretionDiskSurface';
    this.mesh.rotation.z = this.config.inclination;
    this.mesh.renderOrder = 3;
    this.add(this.mesh);
  }
  _rebuildGeometry() {
    const previous = this.geometry;
    this.geometry = createAnnulusGeometry(this.config.innerRadius, this.config.outerRadius, this.config.thickness, this.quality);
    this.mesh.geometry = this.geometry;
    previous.dispose();
  }
  update(frame) { this.material.uniforms.uTime.value = frame?.elapsed ?? 0; }
  reveal(progress) { this.material.uniforms.uOpacity.value = THREE.MathUtils.clamp(progress, 0, 1) * this.config.opacity; }
  applyConfig(config = {}) {
    const rebuild = Number.isFinite(config.innerRadius) || Number.isFinite(config.outerRadius) || Number.isFinite(config.thickness);
    Object.entries(config).forEach(([key, value]) => { if (value !== undefined) this.config[key] = value; });
    const u = this.material.uniforms;
    const keys = {
      innerRadius: 'uInnerRadius', outerRadius: 'uOuterRadius', thickness: 'uThickness',
      rotationSpeed: 'uRotationSpeed', noiseScale: 'uNoiseScale', noiseStrength: 'uNoiseStrength',
      bandFrequency: 'uBandFrequency', brightness: 'uBrightness', opacity: 'uOpacity', verticalWarp: 'uVerticalWarp',
    };
    Object.entries(keys).forEach(([key, uniform]) => { if (Number.isFinite(config[key])) u[uniform].value = config[key]; });
    if (Number.isFinite(config.inclination)) this.mesh.rotation.z = config.inclination;
    if (config.colorInner) u.uColorInner.value.set(config.colorInner);
    if (config.colorMiddle) u.uColorMiddle.value.set(config.colorMiddle);
    if (config.colorOuter) u.uColorOuter.value.set(config.colorOuter);
    if (rebuild) this._rebuildGeometry();
  }
  setQuality(profile) {
    if (!QUALITY[profile]) return;
    const changed = this.quality !== profile;
    this.quality = profile;
    this.material.uniforms.uQuality.value = qualitySettings(profile).shader;
    if (changed) this._rebuildGeometry();
  }
  reset() { this.material.uniforms.uTime.value = 0; this.material.uniforms.uOpacity.value = 0; }
  dispose() { this.geometry.dispose(); this.material.dispose(); }
}
export default AccretionDisk;
