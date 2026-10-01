const safeImageUrl = value => {
  try {
    const url = new URL(value, window.location.href);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};

const appendText = (parent, tag, className) => {
  const element = document.createElement(tag);
  element.className = className;
  parent.append(element);
  return element;
};

export class MusicMetadataCard {
  constructor(root, { onOpen = () => {} } = {}) {
    this.metadata = null;
    this.onOpen = onOpen;
    this.el = document.createElement('button');
    this.el.type = 'button';
    this.el.className = 'music-metadata-card';
    this.el.hidden = true;
    this.el.setAttribute('aria-label', 'Abrir vista previa de la música');

    this.thumbnail = document.createElement('img');
    this.thumbnail.className = 'music-metadata-card__thumbnail';
    this.thumbnail.alt = '';
    this.thumbnail.loading = 'lazy';
    this.thumbnail.referrerPolicy = 'no-referrer';
    this.copy = document.createElement('span');
    this.copy.className = 'music-metadata-card__copy';
    this.provider = appendText(this.copy, 'span', 'music-metadata-card__provider');
    this.title = appendText(this.copy, 'strong', 'music-metadata-card__title');
    this.author = appendText(this.copy, 'span', 'music-metadata-card__author');
    this.action = appendText(this.el, 'span', 'music-metadata-card__action');
    this.action.textContent = 'Vista previa';
    this.el.prepend(this.thumbnail, this.copy);

    this.handleClick = () => this.metadata && this.onOpen(this.metadata);
    this.el.addEventListener('click', this.handleClick);
    root.append(this.el);
  }

  setMetadata(metadata) {
    if (!metadata) return this.clear();
    this.metadata = Object.freeze({ ...metadata });
    const title = metadata.title || 'Música seleccionada';
    const author = metadata.author || metadata.channel || metadata.channelTitle || '';
    const thumbnail = safeImageUrl(metadata.thumbnail || metadata.thumbnailUrl || '');
    this.provider.textContent = metadata.provider || 'YouTube';
    this.title.textContent = title;
    this.author.textContent = author;
    this.author.hidden = !author;
    this.thumbnail.hidden = !thumbnail;
    if (thumbnail) this.thumbnail.src = thumbnail;
    else this.thumbnail.removeAttribute('src');
    this.el.setAttribute('aria-label', `Abrir vista previa de ${title}`);
    this.el.hidden = false;
  }

  setLoading(loading = true) {
    this.el.classList.toggle('is-loading', loading);
    this.el.disabled = loading;
    this.el.setAttribute('aria-busy', String(loading));
  }

  clear() {
    this.metadata = null;
    this.el.hidden = true;
    this.thumbnail.removeAttribute('src');
    this.title.textContent = '';
    this.author.textContent = '';
  }

  dispose() {
    this.el.removeEventListener('click', this.handleClick);
    this.el.remove();
  }
}
