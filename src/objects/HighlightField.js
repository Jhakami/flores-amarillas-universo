import * as THREE from 'three';
import { seededRandom } from '../utils/UniverseLayout.js';
export class HighlightField extends THREE.Points {
  constructor({count=180,seed=731,radius=14,height=8}={}){const random=seededRandom(seed),positions=new Float32Array(count*3),colors=new Float32Array(count*3);const white=new THREE.Color('#fffcea'),gold=new THREE.Color('#ffd000'),mixed=new THREE.Color();for(let i=0;i<count;i++){const i3=i*3,a=random()*Math.PI*2,r=3+random()*radius;positions[i3]=Math.cos(a)*r;positions[i3+1]=(random()-.5)*height;positions[i3+2]=Math.sin(a)*r;mixed.copy(gold).lerp(white,random());mixed.toArray(colors,i3);}const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));const material=new THREE.PointsMaterial({size:.05,vertexColors:true,transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true});super(geometry,material);this.frustumCulled=false;}
  update(elapsed){this.rotation.y=elapsed*.0018;}dispose(){this.geometry.dispose();this.material.dispose();}
}
