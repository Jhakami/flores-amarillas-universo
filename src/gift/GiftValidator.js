import { isYouTubeVideoId, parseYouTubeUrl } from './YouTubeUrlParser.js';

export const GIFT_VERSION = 1;
export const GIFT_TOKEN_MAX_BYTES = 8 * 1024;
export const GIFT_MAX_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
export const GIFT_DURATIONS_MS = Object.freeze({
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '3d': 3 * 24 * 60 * 60 * 1000,
  '7d': GIFT_MAX_DURATION_MS,
});

const PACKS = new Set(['original', 'classic', 'mixed']);
const OBJECT_TYPES = new Set(['sunflower', 'bouquet', 'spatial-phrase']);
const SOURCE_TYPES = new Set(['original', 'public-domain']);

export class GiftValidationError extends Error {
  constructor(errors) {
    super(errors[0]?.message || 'El regalo no es válido.');
    this.name = 'GiftValidationError';
    this.code = errors[0]?.code || 'INVALID_GIFT';
    this.errors = errors;
  }
}

const text = value => String(value ?? '').trim();
const readText = (errors, value, path, { required = true, max }) => {
  const result = text(value);
  if (required && !result) errors.push({ path, code: 'REQUIRED', message: `Falta ${path}.` });
  if (result.length > max) errors.push({ path, code: 'TOO_LONG', message: `${path} supera ${max} caracteres.` });
  return result;
};

const normalizeObjectType = value => value === 'phrase' ? 'spatial-phrase' : value;

const normalizeCard = (card, index, errors) => {
  const path = `cards[${index}]`;
  if (!card || typeof card !== 'object' || Array.isArray(card)) {
    errors.push({ path, code: 'INVALID_CARD', message: `${path} no es una tarjeta válida.` });
    return null;
  }
  const nested = card.card && typeof card.card === 'object' ? card.card : card;
  const objectType = normalizeObjectType(card.objectType ?? card.type ?? 'sunflower');
  if (!OBJECT_TYPES.has(objectType)) errors.push({ path: `${path}.objectType`, code: 'INVALID_OBJECT_TYPE', message: 'El tipo de objeto no es válido.' });
  const sourceType = nested.sourceType ?? 'original';
  if (!SOURCE_TYPES.has(sourceType)) errors.push({ path: `${path}.sourceType`, code: 'INVALID_SOURCE', message: 'La fuente de la tarjeta no es válida.' });
  return {
    id: readText(errors, card.id ?? `custom-${index + 1}`, `${path}.id`, { max: 64 }),
    objectType,
    label: readText(errors, card.label ?? nested.title, `${path}.label`, { max: 100 }),
    card: {
      title: readText(errors, nested.title, `${path}.title`, { max: 120 }),
      body: readText(errors, nested.body, `${path}.body`, { max: 500 }),
      author: readText(errors, nested.author ?? 'Texto original', `${path}.author`, { required: false, max: 100 }),
      work: readText(errors, nested.work, `${path}.work`, { required: false, max: 120 }),
      sourceType,
    },
  };
};

const normalizeYouTube = (source, errors) => {
  const music = source?.youtube ?? source?.music;
  if (!music || typeof music !== 'object') {
    errors.push({ path: 'youtube', code: 'REQUIRED', message: 'Falta el video de YouTube.' });
    return { videoId: '', title: '', author: '', thumbnail: '' };
  }
  let videoId = text(music.videoId);
  if (!videoId && music.url) {
    try { videoId = parseYouTubeUrl(music.url).videoId; } catch (error) {
      errors.push({ path: 'youtube.videoId', code: error.code, message: error.message });
    }
  }
  if (!isYouTubeVideoId(videoId)) errors.push({ path: 'youtube.videoId', code: 'INVALID_VIDEO_ID', message: 'El identificador de YouTube no es válido.' });
  const thumbnail = readText(errors, music.thumbnail, 'youtube.thumbnail', { max: 500 });
  if (thumbnail) {
    try {
      const thumbnailUrl = new URL(thumbnail);
      const host = thumbnailUrl.hostname.toLowerCase();
      const allowed = host === 'i.ytimg.com' || host === 'img.youtube.com' || host.endsWith('.ytimg.com');
      if (thumbnailUrl.protocol !== 'https:' || !allowed) throw new Error();
    } catch {
      errors.push({ path: 'youtube.thumbnail', code: 'INVALID_THUMBNAIL', message: 'La miniatura de YouTube no es válida.' });
    }
  }
  return {
    videoId,
    title: readText(errors, music.title, 'youtube.title', { max: 200 }),
    author: readText(errors, music.author ?? music.channel, 'youtube.author', { max: 120 }),
    thumbnail,
  };
};

export function normalizeGiftPayload(source, { now = Date.now(), duration = '1d' } = {}) {
  const input = source && typeof source === 'object' && !Array.isArray(source) ? source : {};
  const durationMs = typeof duration === 'number' ? duration : GIFT_DURATIONS_MS[duration];
  const letter = input.letter ?? [input.dedication, input.letterNote].map(text).filter(Boolean).join('\n\n');
  return {
    version: Number(input.version ?? GIFT_VERSION),
    recipient: text(input.recipient ?? input.recipientName),
    sender: text(input.sender ?? input.senderName),
    dedication: text(input.title ?? input.dedication),
    letter: text(letter),
    expiresAt: Number(input.expiresAt ?? (now + (durationMs || GIFT_DURATIONS_MS['1d']))),
    youtube: input.youtube ?? input.music,
    quotePack: text(input.quotePack ?? input.phraseStyle ?? 'mixed'),
    cards: Array.isArray(input.cards) ? input.cards : [],
    visualPreset: input.visualPreset ?? 'golden-universe',
  };
}

export function validateGiftPayload(source, options = {}) {
  const now = options.now ?? Date.now();
  const input = normalizeGiftPayload(source, { ...options, now });
  const errors = [];
  if (input.version !== GIFT_VERSION) errors.push({ path: 'version', code: 'UNSUPPORTED_VERSION', message: 'La versión del regalo no es compatible.' });
  const expiresAt = input.expiresAt;
  if (!Number.isSafeInteger(expiresAt)) errors.push({ path: 'expiresAt', code: 'INVALID_EXPIRATION', message: 'La fecha de expiración no es válida.' });
  else if (!options.allowExpired && expiresAt <= now) errors.push({ path: 'expiresAt', code: 'EXPIRED', message: 'Este regalo ya venció.' });
  else if (options.enforceDuration && expiresAt > now + GIFT_MAX_DURATION_MS) errors.push({ path: 'expiresAt', code: 'DURATION_TOO_LONG', message: 'La duración máxima es de 7 días.' });
  if (!PACKS.has(input.quotePack)) errors.push({ path: 'quotePack', code: 'INVALID_QUOTE_PACK', message: 'La colección de frases no es válida.' });
  if (input.cards.length > 18) errors.push({ path: 'cards', code: 'TOO_MANY_CARDS', message: 'Solo se permiten 18 tarjetas personalizadas.' });

  const value = {
    version: input.version,
    recipient: readText(errors, input.recipient, 'recipient', { max: 60 }),
    sender: readText(errors, input.sender, 'sender', { max: 60 }),
    dedication: readText(errors, input.dedication, 'dedication', { max: 100 }),
    letter: readText(errors, input.letter, 'letter', { max: 800 }),
    expiresAt,
    youtube: normalizeYouTube(input, errors),
    quotePack: input.quotePack,
    cards: input.cards.slice(0, 18).map((card, index) => normalizeCard(card, index, errors)).filter(Boolean),
    visualPreset: typeof input.visualPreset === 'string'
      ? readText(errors, input.visualPreset, 'visualPreset', { max: 40 })
      : input.visualPreset,
  };
  if (typeof value.visualPreset !== 'string' && (typeof value.visualPreset !== 'object' || !value.visualPreset || Array.isArray(value.visualPreset))) {
    errors.push({ path: 'visualPreset', code: 'INVALID_PRESET', message: 'El preset visual no es válido.' });
  }
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors), value: Object.freeze(value) });
}

export function assertGiftPayload(source, options = {}) {
  const result = validateGiftPayload(source, options);
  if (!result.valid) throw new GiftValidationError(result.errors);
  return result.value;
}

export function createGiftPayload(draft, { now = Date.now(), duration = '1d' } = {}) {
  const durationMs = typeof duration === 'number' ? duration : GIFT_DURATIONS_MS[duration];
  if (!Object.values(GIFT_DURATIONS_MS).includes(durationMs)) {
    throw new GiftValidationError([{ path: 'expiresAt', code: 'INVALID_DURATION', message: 'Selecciona una duración válida.' }]);
  }
  return assertGiftPayload({ ...draft, version: GIFT_VERSION, expiresAt: now + durationMs }, { now, enforceDuration: true });
}
