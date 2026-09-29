import * as THREE from 'three';
import { seededRandom } from '../utils/UniverseLayout.js';

const vertexShader = `attribute float aSize;attribute float aSeed;uniform float uTime;uniform float uPixelRatio;varying float vAlpha;void main(){vec3 p=position;float a=uTime*.012*(aSeed>.5?1.:-1.);float c=cos(a),s=sin(a);p.xz=mat2(c,-s,s,c)*p.xz;vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=aSize*uPixelRatio*(120./max(1.,-mv.z));vAlpha=.18+.28*aSeed;gl_Position=projectionMatrix*mv;}`;
const fragmentShader = `varying float vAlpha;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float a=smoothstep(.5,0.,d)*vAlpha;gl_FragColor=vec4(1.,.82,.28,a);}`;

export class VolumetricDust extends THREE.Points {
  constructor({count=2000,seed=9164,radius=13,height=7}={}){const random=seededRandom(seed),positions=new Float32Array(count*3),sizes=new Float32Array(count),seeds=new Float32Array(count);for(let i=0;i<count;i++){const i3=i*3,angle=random()*Math.PI*2,ring=2.7+Math.pow(random(),.72)*radius,tilt=(i%4-1.5)*.11;positions[i3]=Math.cos(angle)*ring;positions[i3+1]=(random()-.5)*height+Math.sin(angle)*ring*tilt;positions[i3+2]=Math.sin(angle)*ring;sizes[i]=.6+random()*2.1;seeds[i]=random();}const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('aSize',new THREE.BufferAttribute(sizes,1));geometry.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));const uniforms={uTime:{value:0},uPixelRatio:{value:Math.min(devicePixelRatio||1,2)}};super(geometry,new THREE.ShaderMaterial({vertexShader,fragmentShader,uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));this.uniforms=uniforms;this.frustumCulled=false;}
  update(elapsed){this.uniforms.uTime.value=elapsed;}setPixelRatio(value){this.uniforms.uPixelRatio.value=Math.min(value,2);}dispose(){this.geometry.dispose();this.material.dispose();}
}
