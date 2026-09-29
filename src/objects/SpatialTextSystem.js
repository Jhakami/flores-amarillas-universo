import * as THREE from 'three';
import { Text, preloadFont } from 'troika-three-text';

const FONT_URL = `${import.meta.env.BASE_URL}assets/fonts/great-vibes.ttf`;

export class SpatialTextSystem extends THREE.Group {
  static preload(characters) { return new Promise(resolve => preloadFont({ font: FONT_URL, characters }, resolve)); }
  constructor({ entries, layout }) { super(); this.items = []; this.hitboxes = []; this._cameraPosition = new THREE.Vector3(); const phraseEntries = entries.filter(entry => entry.type === 'phrase'); const transforms = layout.generate(phraseEntries.length + 9).slice(9); phraseEntries.forEach((entry, index) => this.addPhrase(entry, transforms[index], index)); this.addTitle(); this.visible = false; }
  addTitle() { const title = new Text(); title.text = 'Feliz día de las\nFlores Amarillas'; title.font = FONT_URL; title.fontSize = 0.72; title.lineHeight = 0.88; title.textAlign = 'center'; title.anchorX = 'center'; title.anchorY = 'middle'; title.color = 0xfff4a8; title.outlineColor = 0x6d4b00; title.outlineWidth = '2%'; title.position.set(0, 4.3, 0); title.userData.title = true; title.sync(); this.title = title; this.add(title); }
  addPhrase(entry, transform, index) { const text = new Text(); text.text = entry.label; text.font = FONT_URL; text.fontSize = 0.32 + index % 3 * 0.05; text.anchorX = 'center'; text.anchorY = 'middle'; text.color = index % 2 ? 0xfff4a8 : 0xffd84d; text.fillOpacity = 0.68; text.outlineColor = 0x2b1900; text.outlineWidth = '1.5%'; text.position.copy(transform.position); text.position.multiplyScalar(0.9); text.sync(); const hitbox = new THREE.Mesh(new THREE.PlaneGeometry(Math.max(1.25, entry.label.length * 0.12), 0.72), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); hitbox.position.copy(text.position); hitbox.userData.contentId = entry.id; this.items.push({ text, hitbox, phase: transform.phase }); this.hitboxes.push(hitbox); this.add(text, hitbox); }
  register(registry) { this.hitboxes.forEach(hitbox => registry.register(hitbox, hit => ({ id: hitbox.userData.contentId, object: hitbox, point: hit.point, worldPosition: hitbox.getWorldPosition(new THREE.Vector3()), radius: 0.7 }))); }
  reveal(value) { this.visible = value > 0.001; this.scale.setScalar(Math.max(0.001, value)); }
  update(elapsed, camera) { this._cameraPosition.copy(camera.position); this.title.quaternion.copy(camera.quaternion); for (const item of this.items) { item.text.quaternion.copy(camera.quaternion); item.hitbox.quaternion.copy(camera.quaternion); const pulse = 1 + Math.sin(elapsed * 0.35 + item.phase) * 0.025; item.text.scale.setScalar(pulse); } }
  setQuality(profile){this.items.forEach((item,index)=>{const visible=index<profile.texts;item.text.visible=visible;item.hitbox.visible=visible;});}
  dispose() { this.title.dispose(); for (const item of this.items) { item.text.dispose(); item.hitbox.geometry.dispose(); item.hitbox.material.dispose(); } }
}
