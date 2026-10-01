import { MusicMetadataCard } from './MusicMetadataCard.js';

const field = ({ name, label, type = 'text', required = false, maxLength, placeholder = '' }) => {
  const wrap = document.createElement('label');
  wrap.className = 'gift-form__field';
  const caption = document.createElement('span');
  caption.textContent = label;
  const input = type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
  if (type !== 'textarea') input.type = type;
  input.name = name;
  input.required = required;
  input.placeholder = placeholder;
  if (maxLength) input.maxLength = maxLength;
  wrap.append(caption, input);
  return { wrap, input };
};

const phraseStyleField = () => {
  const label = document.createElement('label');
  label.className = 'gift-form__field';
  const caption = document.createElement('span');
  caption.textContent = 'Estilo de las frases';
  const select = document.createElement('select');
  select.name = 'phraseStyle';
  [['mixed', 'Originales y clásicas'], ['original', 'Solo originales'], ['classic', 'Autores clásicos']]
    .forEach(([value, text]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      select.append(option);
    });
  label.append(caption, select);
  return { wrap: label, input: select };
};

const durationField = () => {
  const label = document.createElement('label');
  label.className = 'gift-form__field';
  const caption = document.createElement('span');
  caption.textContent = 'Duración del enlace';
  const select = document.createElement('select');
  select.name = 'duration';
  [['1h', '1 hora'], ['6h', '6 horas'], ['1d', '1 día'], ['3d', '3 días'], ['7d', '7 días']]
    .forEach(([value, labelText]) => { const option = document.createElement('option'); option.value = value; option.textContent = labelText; select.append(option); });
  select.value = '1d';
  label.append(caption, select);
  return { wrap: label, input: select };
};

export class GiftForm {
  constructor(root, { onResolveYouTube, onSubmit, onOpenMusicPreview = () => {}, cardDefaults = [] } = {}) {
    if (typeof onResolveYouTube !== 'function' || typeof onSubmit !== 'function') {
      throw new TypeError('GiftForm requiere onResolveYouTube y onSubmit.');
    }
    this.onResolveYouTube = onResolveYouTube;
    this.onSubmit = onSubmit;
    this.music = null;
    this.resolveSequence = 0;
    this.el = document.createElement('form');
    this.el.className = 'gift-form';
    this.el.noValidate = true;
    const title = document.createElement('h1');
    title.className = 'gift-form__title';
    title.textContent = 'Crea un universo para alguien especial';
    const lead = document.createElement('p');
    lead.className = 'gift-form__lead';
    lead.textContent = 'Personaliza la dedicatoria, las frases y la canción del regalo.';
    this.status = document.createElement('p');
    this.status.className = 'gift-form__status';
    this.status.setAttribute('role', 'status');
    this.status.setAttribute('aria-live', 'polite');
    this.inputs = {};

    const definitions = [
      { name: 'recipientName', label: 'Para', required: true, maxLength: 60, placeholder: 'Nombre de quien recibirá el regalo' },
      { name: 'senderName', label: 'De', required: true, maxLength: 60, placeholder: 'Tu nombre' },
      { name: 'title', label: 'Título', required: true, maxLength: 80, placeholder: 'Feliz día de las Flores Amarillas' },
      { name: 'dedication', label: 'Dedicatoria', type: 'textarea', required: true, maxLength: 420, placeholder: 'Escribe algo que solo ustedes comprendan…' },
    ];
    const fields = document.createElement('div');
    fields.className = 'gift-form__fields';
    definitions.forEach(definition => {
      const item = field(definition);
      this.inputs[definition.name] = item.input;
      fields.append(item.wrap);
    });
    const style = phraseStyleField();
    this.inputs.phraseStyle = style.input;
    fields.append(style.wrap);
    const duration = durationField();
    this.inputs.duration = duration.input;
    fields.append(duration.wrap);

    const musicField = field({ name: 'musicUrl', label: 'Canción de YouTube', type: 'url', required: true, maxLength: 500, placeholder: 'https://youtu.be/…' });
    this.inputs.musicUrl = musicField.input;
    this.resolveButton = document.createElement('button');
    this.resolveButton.type = 'button';
    this.resolveButton.className = 'gift-form__resolve';
    this.resolveButton.textContent = 'Comprobar canción';
    musicField.wrap.append(this.resolveButton);
    fields.append(musicField.wrap);

    const noteField = field({ name: 'letterNote', label: 'Carta personal', type: 'textarea', required: true, maxLength: 800, placeholder: 'Lo que quieres que lea al escucharla…' });
    this.inputs.letterNote = noteField.input;
    fields.append(noteField.wrap);
    this.preview = document.createElement('div');
    this.preview.className = 'gift-form__music-preview';
    this.musicCard = new MusicMetadataCard(this.preview, { onOpen: onOpenMusicPreview });
    this.cardEditors = [];
    this.advanced = this.createAdvancedEditor(cardDefaults.slice(0, 18));
    this.submitButton = document.createElement('button');
    this.submitButton.type = 'submit';
    this.submitButton.className = 'gift-form__submit';
    this.submitButton.textContent = 'Crear mi universo';
    this.el.append(title, lead, fields, this.preview, this.advanced, this.status, this.submitButton);
    root.append(this.el);

    this.handleResolve = () => this.resolveMusic();
    this.handleMusicInput = () => {
      this.resolveSequence += 1;
      this.music = null;
      this.musicCard.clear();
      this.status.textContent = '';
    };
    this.handleSubmit = event => this.submit(event);
    this.resolveButton.addEventListener('click', this.handleResolve);
    this.inputs.musicUrl.addEventListener('input', this.handleMusicInput);
    this.el.addEventListener('submit', this.handleSubmit);
  }

  createAdvancedEditor(entries) {
    const details = document.createElement('details'); details.className = 'gift-form__advanced';
    const summary = document.createElement('summary'); summary.textContent = 'Personalización avanzada de las 18 tarjetas';
    const help = document.createElement('p'); help.textContent = 'Solo se guardarán las tarjetas que modifiques.';
    details.append(summary, help);
    entries.forEach((entry, index) => {
      const group = document.createElement('fieldset'); const legend = document.createElement('legend'); legend.textContent = `Tarjeta ${index + 1}`;
      const title = field({ name: `cardTitle${index}`, label: 'Título', maxLength: 120 });
      const body = field({ name: `cardBody${index}`, label: 'Mensaje', type: 'textarea', maxLength: 500 });
      title.input.value = entry.card?.title || entry.label || ''; body.input.value = entry.card?.body || '';
      group.append(legend, title.wrap, body.wrap); details.append(group);
      this.cardEditors.push({ entry, title: title.input, body: body.input });
    });
    return details;
  }

  async resolveMusic() {
    const url = this.inputs.musicUrl.value.trim();
    if (!url) {
      this.inputs.musicUrl.setCustomValidity('Ingresa un enlace de YouTube.');
      this.inputs.musicUrl.reportValidity();
      return null;
    }
    const sequence = ++this.resolveSequence;
    this.inputs.musicUrl.setCustomValidity('');
    this.resolveButton.disabled = true;
    this.resolveButton.textContent = 'Comprobando…';
    this.status.textContent = 'Buscando la canción…';
    try {
      const metadata = await this.onResolveYouTube(url);
      if (sequence !== this.resolveSequence) return null;
      if (!metadata?.videoId) throw new Error('No pudimos reconocer ese video.');
      this.music = Object.freeze({ provider: 'youtube', url, ...metadata });
      this.musicCard.setMetadata(this.music);
      this.status.textContent = 'Canción lista para la carta.';
      return this.music;
    } catch (error) {
      if (sequence !== this.resolveSequence) return null;
      this.music = null;
      this.musicCard.clear();
      this.inputs.musicUrl.setCustomValidity(error?.message || 'No se pudo comprobar el enlace.');
      this.inputs.musicUrl.reportValidity();
      this.status.textContent = error?.message || 'No se pudo comprobar el enlace.';
      return null;
    } finally {
      if (sequence === this.resolveSequence) {
        this.resolveButton.disabled = false;
        this.resolveButton.textContent = 'Comprobar canción';
      }
    }
  }

  draft() {
    const cards = this.cardEditors.flatMap(({ entry, title, body }) => {
      const nextTitle = title.value.trim(); const nextBody = body.value.trim();
      if (nextTitle === (entry.card?.title || entry.label || '') && nextBody === (entry.card?.body || '')) return [];
      return [{ id: entry.id, objectType: entry.objectType || (entry.type === 'phrase' ? 'spatial-phrase' : entry.type), label: nextTitle, card: { title: nextTitle, body: nextBody, author: 'Texto original', work: 'Carta personalizada', sourceType: 'original' } }];
    });
    return Object.freeze({
      recipientName: this.inputs.recipientName.value.trim(),
      senderName: this.inputs.senderName.value.trim(),
      title: this.inputs.title.value.trim(),
      dedication: this.inputs.dedication.value.trim(),
      phraseStyle: this.inputs.phraseStyle.value,
      duration: this.inputs.duration.value,
      letterNote: this.inputs.letterNote.value.trim(),
      music: this.music,
      cards,
    });
  }

  async submit(event) {
    event.preventDefault();
    [...this.el.elements].forEach(control => control.setCustomValidity?.(''));
    if (!this.el.checkValidity()) {
      this.el.reportValidity();
      return;
    }
    if (!this.music) {
      this.inputs.musicUrl.setCustomValidity('Comprueba la canción antes de crear el regalo.');
      this.inputs.musicUrl.reportValidity();
      return;
    }
    this.submitButton.disabled = true;
    this.status.textContent = 'Creando tu universo…';
    try {
      await this.onSubmit(this.draft());
      this.status.textContent = 'Tu universo está listo.';
    } catch (error) {
      this.status.textContent = error?.message || 'No se pudo crear el regalo. Inténtalo nuevamente.';
    } finally {
      this.submitButton.disabled = false;
    }
  }

  dispose() {
    this.resolveSequence += 1;
    this.resolveButton.removeEventListener('click', this.handleResolve);
    this.inputs.musicUrl.removeEventListener('input', this.handleMusicInput);
    this.el.removeEventListener('submit', this.handleSubmit);
    this.musicCard.dispose();
    this.el.remove();
  }
}
