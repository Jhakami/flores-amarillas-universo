import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { gsap } from 'gsap';

export const CAMERA_STATES = Object.freeze({
  INTRO_LOCKED: 'INTRO_LOCKED', CINEMATIC_TRAVEL: 'CINEMATIC_TRAVEL', ORBIT: 'ORBIT',
  FOCUS_TARGET: 'FOCUS_TARGET', RETURN_TO_ORBIT: 'RETURN_TO_ORBIT', REDUCED_MOTION: 'REDUCED_MOTION',
});

export class CameraRig extends EventTarget {
  constructor(camera, element, config, reducedMotion = false) {
    super(); this.camera = camera; this.config = config; this.reducedMotion = reducedMotion;
    this.state = reducedMotion ? CAMERA_STATES.REDUCED_MOTION : CAMERA_STATES.INTRO_LOCKED;
    this.controls = new OrbitControls(camera, element); this.controls.enabled = false;
    this.controls.enablePan = false; this.controls.enableDamping = true;
    this.controls.dampingFactor = config.camera360.damping;
    this.controls.minDistance = config.camera360.minDistance; this.controls.maxDistance = config.camera360.maxDistance;
    this.controls.minPolarAngle = config.camera360.minPolarAngle; this.controls.maxPolarAngle = config.camera360.maxPolarAngle;
    this.controls.target.set(0, 0, 0); this.controls.autoRotate = false;
    this.savedPosition = new THREE.Vector3(); this.savedTarget = new THREE.Vector3();
    this.focusPosition = new THREE.Vector3(); this.focusTarget = new THREE.Vector3(); this.direction = new THREE.Vector3(); this.centerTarget = new THREE.Vector3(); this.zeroTarget = new THREE.Vector3();
    this.lastInteraction = performance.now(); this.tween = null;
    this.onStart = () => { this.lastInteraction = performance.now(); this.controls.autoRotate = false; };
    this.controls.addEventListener('start', this.onStart);
  }
  setState(state) { this.state = state; this.controls.enabled = state === CAMERA_STATES.ORBIT || state === CAMERA_STATES.REDUCED_MOTION; }
  beginTravel() { this.setState(CAMERA_STATES.CINEMATIC_TRAVEL); }
  enterOrbit() { this.setState(this.reducedMotion ? CAMERA_STATES.REDUCED_MOTION : CAMERA_STATES.ORBIT); this.controls.update(); }
  update() { if (!this.controls.enabled) return; const idle = performance.now() - this.lastInteraction; this.controls.autoRotate = !this.reducedMotion && this.config.camera360.autoRotate && idle > this.config.camera360.idleDelay * 1000; this.controls.autoRotateSpeed = this.config.camera360.autoRotateSpeed; this.controls.update(); }
  focus(worldPosition, radius = 0.7, onComplete) {
    if (this.state !== CAMERA_STATES.ORBIT && this.state !== CAMERA_STATES.REDUCED_MOTION) return false;
    this.savedPosition.copy(this.camera.position); this.savedTarget.copy(this.controls.target); this.focusTarget.copy(worldPosition);
    this.direction.copy(this.camera.position).sub(worldPosition).normalize();
    this.focusPosition.copy(worldPosition).addScaledVector(this.direction, Math.max(2.2, radius * 4));
    this.setState(CAMERA_STATES.FOCUS_TARGET); const values = { t: 0 };
    this.tween?.kill(); this.tween = gsap.to(values, { t: 1, duration: this.reducedMotion ? 0.25 : 0.8, ease: 'power2.inOut', onUpdate: () => { this.camera.position.lerpVectors(this.savedPosition, this.focusPosition, values.t); this.controls.target.lerpVectors(this.savedTarget, this.focusTarget, values.t); this.camera.lookAt(this.controls.target); }, onComplete }); return true;
  }
  restore(onComplete) { if (this.state !== CAMERA_STATES.FOCUS_TARGET) { onComplete?.(); return; } const fromPosition = this.camera.position.clone(), fromTarget = this.controls.target.clone(), values = { t: 0 }; this.setState(CAMERA_STATES.RETURN_TO_ORBIT); this.tween?.kill(); this.tween = gsap.to(values, { t: 1, duration: this.reducedMotion ? 0.2 : 0.7, ease: 'power2.inOut', onUpdate: () => { this.camera.position.lerpVectors(fromPosition, this.savedPosition, values.t); this.controls.target.lerpVectors(fromTarget, this.savedTarget, values.t); this.camera.lookAt(this.controls.target); }, onComplete: () => { this.enterOrbit(); onComplete?.(); } }); }
  center() { if (!this.controls.enabled) return; const distance = THREE.MathUtils.clamp(this.camera.position.length(), this.controls.minDistance, this.controls.maxDistance); const start = this.camera.position.clone(); const end = new THREE.Vector3(0, distance * 0.28, distance); const values = { t: 0 }; this.centerTarget.copy(this.controls.target); gsap.to(values, { t: 1, duration: this.reducedMotion ? 0.2 : 0.9, ease: 'power2.inOut', onUpdate: () => { this.camera.position.lerpVectors(start, end, values.t); this.controls.target.lerpVectors(this.centerTarget,this.zeroTarget,values.t); }, onComplete: () => this.controls.update() }); }
  applyConfig(config) { this.config = config; Object.assign(this.controls, { dampingFactor: config.camera360.damping, minDistance: config.camera360.minDistance, maxDistance: config.camera360.maxDistance, minPolarAngle: config.camera360.minPolarAngle, maxPolarAngle: config.camera360.maxPolarAngle }); }
  reset(distance = 12) { this.tween?.kill(); this.controls.autoRotate = false; this.controls.target.set(0, 0, 0); this.camera.position.set(0, 1.8, distance); this.camera.lookAt(0, 0, 0); this.setState(CAMERA_STATES.INTRO_LOCKED); }
  dispose() { this.tween?.kill(); this.controls.removeEventListener('start', this.onStart); this.controls.dispose(); }
}
