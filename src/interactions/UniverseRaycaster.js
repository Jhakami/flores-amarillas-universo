import * as THREE from 'three';
export class UniverseRaycaster {
  constructor(camera, registry, onSelect) { this.camera = camera; this.registry = registry; this.onSelect = onSelect; this.raycaster = new THREE.Raycaster(); this.pointer = new THREE.Vector2(); }
  pick(clientX, clientY, width = innerWidth, height = innerHeight) { this.pointer.set(clientX / width * 2 - 1, -(clientY / height) * 2 + 1); this.raycaster.setFromCamera(this.pointer, this.camera); const hits = this.raycaster.intersectObjects(this.registry.objects, false); for (const hit of hits) { const resolved = this.registry.resolve(hit); if (resolved) { this.onSelect(resolved); return true; } } return false; }
}
