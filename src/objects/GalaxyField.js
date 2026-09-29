import * as THREE from 'three';
import { VolumetricDust } from './VolumetricDust.js';
import { HighlightField } from './HighlightField.js';
export class GalaxyField extends THREE.Group {
  constructor({cloud,profile,config}){super();this.cloud=cloud;this.dust=new VolumetricDust({count:profile.dust,seed:config.galaxy.seed+1,radius:config.galaxy.radius,height:config.galaxy.height});this.highlights=new HighlightField({count:profile.highlights,seed:config.galaxy.seed+2,radius:config.galaxy.radius,height:config.galaxy.height});this.add(this.dust,this.highlights);this.visible=false;}
  reveal(value){this.visible=value>0.001;this.dust.setOpacity(Math.min(.42,value*.36));this.highlights.material.opacity=Math.min(.52,value*.5);}
  update(frame){if(!this.visible)return;this.dust.update(frame.elapsed);this.highlights.update(frame.elapsed);}
  setQuality(profile){this.dust.geometry.setDrawRange(0,Math.min(profile.dust,this.dust.geometry.getAttribute('position').count));this.highlights.geometry.setDrawRange(0,Math.min(profile.highlights,this.highlights.geometry.getAttribute('position').count));}
  setPixelRatio(value){this.dust.setPixelRatio(value);}dispose(){this.dust.dispose();this.highlights.dispose();}
}
