import * as THREE from 'three';

const VERTEX_SHADER = `
  attribute vec2 aUvOffset; attribute float aFocus; varying vec2 vUv; varying float vReveal; varying float vFocus;
  uniform float uTime; uniform float uReveal; uniform float uFloatAmplitude; uniform float uFloatSpeed;
  void main(){ vUv = uv * .5 + aUvOffset; vReveal = smoothstep(0., 1., uReveal); vFocus=aFocus;
    vec3 p = position; p.y += sin(uTime * uFloatSpeed + float(gl_InstanceID) * 1.71) * uFloatAmplitude;
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(0.,0.,0.,1.);
    mvPosition.xy += p.xy * length(vec3(instanceMatrix[0][0], instanceMatrix[1][0], instanceMatrix[2][0])) * vReveal;
    gl_Position = projectionMatrix * mvPosition; }
`;
const FRAGMENT_SHADER = `
  uniform sampler2D uMap; uniform float uReveal; varying vec2 vUv; varying float vReveal; varying float vFocus;
  void main(){ vec4 tex = texture2D(uMap,vUv); if(tex.a < .08) discard; float glow = smoothstep(.12,.95,tex.r) * (.1+vFocus*.42); gl_FragColor=vec4(tex.rgb + vec3(1.,.72,.12)*glow,tex.a*vReveal); }
`;

export class FlowerInstanceSystem extends THREE.Group {
  constructor({ sunflowerAtlas, bouquetAtlas, entries, layout, config }) {
    super(); this.entries = entries; this.layout = layout; this.config = config; this.revealProgress = 0;
    this.transforms = layout.generate(entries.length); this.dummy = new THREE.Object3D(); this.worldPosition = new THREE.Vector3();
    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1); const offsets = new Float32Array(entries.length * 2);
    this.transforms.forEach((item, index) => { offsets[index * 2] = (item.variant % 2) * 0.5; offsets[index * 2 + 1] = item.variant % 4 > 1 ? 0 : 0.5; });
    this.geometry.setAttribute('aUvOffset', new THREE.InstancedBufferAttribute(offsets, 2));this.geometry.setAttribute('aFocus',new THREE.InstancedBufferAttribute(new Float32Array(entries.length),1));
    const uniforms = { uMap: { value: sunflowerAtlas }, uTime: { value: 0 }, uReveal: { value: 0 }, uFloatAmplitude: { value: config.flowers.floatAmplitude }, uFloatSpeed: { value: config.flowers.floatSpeed } };
    this.material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERTEX_SHADER, fragmentShader: FRAGMENT_SHADER, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, entries.length); this.mesh.frustumCulled = false;
    this.bouquetGeometry = this.geometry.clone(); this.bouquetMaterial = this.material.clone(); this.bouquetMaterial.uniforms = THREE.UniformsUtils.clone(uniforms); this.bouquetMaterial.uniforms.uMap.value = bouquetAtlas;
    this.bouquetMesh = new THREE.InstancedMesh(this.bouquetGeometry, this.bouquetMaterial, entries.length); this.bouquetMesh.frustumCulled = false;
    this.indexMaps = { flower: new Map(), bouquet: new Map() }; let flowerIndex = 0, bouquetIndex = 0;
    entries.forEach((entry, index) => { const item = this.transforms[index]; this.dummy.position.copy(item.position); this.dummy.rotation.set(0, 0, item.rotation); this.dummy.scale.setScalar(item.scale * (entry.type === 'bouquet' ? 1.35 : 1)); this.dummy.updateMatrix(); if (entry.type === 'bouquet') { this.bouquetMesh.setMatrixAt(bouquetIndex, this.dummy.matrix); this.indexMaps.bouquet.set(bouquetIndex++, entry.id); } else { this.mesh.setMatrixAt(flowerIndex, this.dummy.matrix); this.indexMaps.flower.set(flowerIndex++, entry.id); } });
    this.mesh.count = flowerIndex; this.bouquetMesh.count = bouquetIndex; this.baseCounts={flower:flowerIndex,bouquet:bouquetIndex};this.focusMatrix=new THREE.Matrix4();this.focusPosition=new THREE.Vector3();this.focusQuaternion=new THREE.Quaternion();this.focusScale=new THREE.Vector3();this.mesh.instanceMatrix.needsUpdate = true; this.bouquetMesh.instanceMatrix.needsUpdate = true; this.add(this.mesh, this.bouquetMesh);
  }
  register(registry) { registry.register(this.mesh, hit => this.resolve(hit, 'flower')); registry.register(this.bouquetMesh, hit => this.resolve(hit, 'bouquet')); }
  resolve(hit, kind) { const id = this.indexMaps[kind].get(hit.instanceId); if (!id) return null; const source = kind === 'flower' ? this.mesh : this.bouquetMesh; source.getMatrixAt(hit.instanceId, this.dummy.matrix); this.worldPosition.setFromMatrixPosition(this.dummy.matrix).applyMatrix4(this.matrixWorld); return { id, object: source, instanceId: hit.instanceId, point: hit.point, worldPosition: this.worldPosition.clone(), radius: kind === 'bouquet' ? 1.1 : 0.7 }; }
  reveal(value) { this.revealProgress = THREE.MathUtils.clamp(value, 0, 1); this.material.uniforms.uReveal.value = this.revealProgress; this.bouquetMaterial.uniforms.uReveal.value = this.revealProgress; }
  update(elapsed) { this.material.uniforms.uTime.value = elapsed; this.bouquetMaterial.uniforms.uTime.value = elapsed; }
  focus(selection,active){if(!selection||!(selection.object===this.mesh||selection.object===this.bouquetMesh)||selection.instanceId===undefined)return;const mesh=selection.object;if(active){mesh.getMatrixAt(selection.instanceId,this.focusMatrix);this.focusMatrix.decompose(this.focusPosition,this.focusQuaternion,this.focusScale);this.focusScale.multiplyScalar(1.16);this.dummy.position.copy(this.focusPosition);this.dummy.quaternion.copy(this.focusQuaternion);this.dummy.scale.copy(this.focusScale);this.dummy.updateMatrix();mesh.setMatrixAt(selection.instanceId,this.dummy.matrix);mesh.geometry.getAttribute('aFocus').setX(selection.instanceId,1);this.focused={mesh,id:selection.instanceId};}else if(this.focused){this.focusScale.multiplyScalar(1/1.16);this.dummy.position.copy(this.focusPosition);this.dummy.quaternion.copy(this.focusQuaternion);this.dummy.scale.copy(this.focusScale);this.dummy.updateMatrix();this.focused.mesh.setMatrixAt(this.focused.id,this.dummy.matrix);this.focused.mesh.geometry.getAttribute('aFocus').setX(this.focused.id,0);this.focused.mesh.geometry.getAttribute('aFocus').needsUpdate=true;this.focused=null;}mesh.geometry.getAttribute('aFocus').needsUpdate=true;mesh.instanceMatrix.needsUpdate=true;}
  setQuality(profile){const total=this.baseCounts.flower+this.baseCounts.bouquet,ratio=Math.min(1,profile.flowers/Math.max(1,total));this.mesh.count=Math.max(1,Math.floor(this.baseCounts.flower*ratio));this.bouquetMesh.count=Math.max(1,Math.floor(this.baseCounts.bouquet*ratio));}
  applyConfig(config) { this.config = config; for (const material of [this.material, this.bouquetMaterial]) { material.uniforms.uFloatAmplitude.value = config.flowers.floatAmplitude; material.uniforms.uFloatSpeed.value = config.flowers.floatSpeed; } }
  dispose() { this.geometry.dispose(); this.bouquetGeometry.dispose(); this.material.dispose(); this.bouquetMaterial.dispose(); }
}
