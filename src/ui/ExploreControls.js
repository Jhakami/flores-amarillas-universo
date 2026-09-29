export class ExploreControls {
  constructor(root, onCenter) { this.hint = document.createElement('div'); this.hint.className = 'explore-hint'; this.hint.textContent = 'Arrastra para explorar · pellizca para acercarte'; this.hint.setAttribute('aria-live', 'polite'); this.center = document.createElement('button'); this.center.className = 'center-control'; this.center.textContent = 'Centrar'; this.center.setAttribute('aria-label', 'Centrar la vista del universo'); this.center.addEventListener('click', onCenter); root.append(this.hint, this.center); }
  show() { clearTimeout(this.timer); this.hint.classList.add('visible'); this.center.classList.add('visible'); this.timer=setTimeout(() => this.hint.classList.remove('visible'), 5200); }
  hide() { clearTimeout(this.timer); this.hint.classList.remove('visible'); this.center.classList.remove('visible'); }
  dispose() { clearTimeout(this.timer); this.hint.remove(); this.center.remove(); }
}
