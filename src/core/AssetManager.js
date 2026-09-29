import * as THREE from 'three';
export class AssetManager {
  constructor(){this.loader=new THREE.TextureLoader();this.assets=new Map();}
  async loadTexture(key,url){const optimized=url.replace(/-v2\.png$/,'-v2.webp');try{const texture=await this.loader.loadAsync(optimized);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;this.assets.set(key,texture);return texture;}catch{try{const texture=await this.loader.loadAsync(url);texture.colorSpace=THREE.SRGBColorSpace;this.assets.set(key,texture);return texture;}catch{return null;}}}
  get(key){return this.assets.get(key);}dispose(){for(const value of this.assets.values())value.dispose?.();this.assets.clear();}
}
