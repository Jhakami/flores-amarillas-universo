const createText = (tag, className, text = '') => {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
};

const safeMediaUrl = value => {
  try {
    const url = new URL(value, window.location.href);
    return ['https:', 'blob:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};

export class CinematicLetter {
  constructor(root, { youtube = null, onClose = () => {} } = {}) {
    this.youtube = youtube;
    this.onClose = onClose;
    this.previousFocus = null;
    this.el = document.createElement('section');
    this.el.className = 'cinematic-letter';
    this.el.hidden = true;
    this.el.setAttribute('role', 'dialog');
    this.el.setAttribute('aria-modal', 'true');

    this.backdrop = document.createElement('button');
    this.backdrop.type = 'button';
    this.backdrop.className = 'cinematic-letter__backdrop';
    this.backdrop.setAttribute('aria-label', 'Cerrar carta');
    this.panel = document.createElement('article');
    this.panel.className = 'cinematic-letter__panel';
    this.closeButton = document.createElement('button');
    this.closeButton.type = 'button';
    this.closeButton.className = 'cinematic-letter__close';
    this.closeButton.textContent = '×';
    this.closeButton.setAttribute('aria-label', 'Cerrar carta');
    this.kicker = createText('p', 'cinematic-letter__kicker', 'Esta canción guardaba una carta');
    this.title = createText('h2', 'cinematic-letter__title');
    this.note = createText('p', 'cinematic-letter__note');
    const instanceId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.title.id = `cinematic-letter-title-${instanceId}`;
    this.note.id = `cinematic-letter-note-${instanceId}`;
    this.el.setAttribute('aria-labelledby', this.title.id);
    this.el.setAttribute('aria-describedby', this.note.id);
    this.media = document.createElement('div');
    this.media.className = 'cinematic-letter__media';
    this.video = document.createElement('video');
    this.video.className = 'cinematic-letter__video';
    this.video.controls = true;
    this.video.playsInline = true;
    this.video.hidden = true;
    this.media.append(this.video);
    this.youtube?.mount(this.media);
    this.panel.append(this.closeButton, this.kicker, this.title, this.media, this.note);
    this.el.append(this.backdrop, this.panel);
    root.append(this.el);

    this.handleClose = () => this.close();
    this.handleKeydown = event => this.onKeydown(event);
    this.closeButton.addEventListener('click', this.handleClose);
    this.backdrop.addEventListener('click', this.handleClose);
    this.el.addEventListener('keydown', this.handleKeydown);
  }

  async open({ title = 'Una canción para ti', note = '', media = null } = {}) {
    this.previousFocus = document.activeElement;
    this.title.textContent = title;
    this.note.textContent = note;
    this.note.hidden = !note;
    this.el.hidden = false;
    document.body.classList.add('has-cinematic-letter');
    this.closeButton.focus();

    if (media?.provider === 'youtube' || media?.videoId) {
      this.video.hidden = true;
      this.video.pause();
      this.video.removeAttribute('src');
      await this.youtube?.open(media, { autoplay: true });
      return;
    }

    this.youtube?.close();
    const source = safeMediaUrl(media?.url || media?.src || '');
    this.video.hidden = !source;
    if (source) {
      this.video.src = source;
      try { await this.video.play(); } catch { /* The visible controls remain as fallback. */ }
    }
  }

  close() {
    if (this.el.hidden) return;
    this.youtube?.close();
    this.video.pause();
    this.video.removeAttribute('src');
    this.video.load();
    this.el.hidden = true;
    document.body.classList.remove('has-cinematic-letter');
    this.previousFocus?.focus?.();
    this.onClose();
  }

  onKeydown(event) {
    if (event.key === 'Escape') return this.close();
    if (event.key !== 'Tab') return;
    const focusable = [...this.panel.querySelectorAll('button:not([disabled]), video[controls], iframe')]
      .filter(element => !element.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  dispose() {
    this.closeButton.removeEventListener('click', this.handleClose);
    this.backdrop.removeEventListener('click', this.handleClose);
    this.el.removeEventListener('keydown', this.handleKeydown);
    this.close();
    this.el.remove();
  }
}
