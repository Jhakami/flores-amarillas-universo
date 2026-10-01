import { describe, expect, it } from 'vitest';
import {
  GiftCodec,
  GiftCodecError,
  GiftValidationError,
  createGiftPayload,
  createPersonalizedCatalog,
  extractYouTubeVideoId,
  validateGiftPayload,
} from '../../src/gift/index.js';

const NOW = Date.UTC(2026, 8, 21, 12);
const draft = (overrides = {}) => ({
  recipientName: 'Lía 🌻',
  senderName: 'Álex',
  title: 'Un universo para ti',
  dedication: 'Gracias por llenar de luz cada día.',
  phraseStyle: 'mixed',
  music: {
    url: 'https://youtu.be/dQw4w9WgXcQ?t=3',
    title: 'Una canción',
    author: 'Un canal',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  },
  ...overrides,
});

describe('YouTubeUrlParser', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=share', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ?t=10', 'dQw4w9WgXcQ'],
    ['https://youtube.com/shorts/dQw4w9WgXcQ?si=x', 'dQw4w9WgXcQ'],
  ])('extrae IDs de %s', (url, expected) => expect(extractYouTubeVideoId(url)).toBe(expected));

  it.each(['https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ', 'https://example.com/dQw4w9WgXcQ', 'nota-un-link'])('rechaza %s', url => {
    expect(() => extractYouTubeVideoId(url)).toThrow();
  });
});

describe('GiftValidator y GiftCodec', () => {
  it('normaliza el formulario existente y descarta la URL original', () => {
    const gift = createGiftPayload(draft(), { now: NOW, duration: '6h' });
    expect(gift.recipient).toBe('Lía 🌻');
    expect(gift.youtube.videoId).toBe('dQw4w9WgXcQ');
    expect(gift.youtube.url).toBeUndefined();
    expect(gift.expiresAt).toBe(NOW + 6 * 60 * 60 * 1000);
  });

  it('conserva UTF-8 al viajar en Base64URL', () => {
    const gift = createGiftPayload(draft(), { now: NOW });
    const token = GiftCodec.encode(gift, { now: NOW });
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(GiftCodec.decode(token, { now: NOW })).toEqual(gift);
  });

  it('comprime el regalo para la URL y conserva UTF-8 al descomprimir', async () => {
    const gift = createGiftPayload(draft({ letterNote: 'Una carta con luz 🌻 '.repeat(18) }), { now: NOW });
    const token = await GiftCodec.encodeCompressed(gift, { now: NOW });
    expect(token).toMatch(/^z\.[A-Za-z0-9_-]+$/);
    expect(token.length).toBeLessThan(GiftCodec.encode(gift, { now: NOW }).length);
    await expect(GiftCodec.decodeCompressed(token, { now: NOW })).resolves.toEqual(gift);
  });

  it('rechaza regalos vencidos, versiones desconocidas y tokens dañados', () => {
    const gift = createGiftPayload(draft(), { now: NOW });
    expect(validateGiftPayload({ ...gift, expiresAt: NOW - 1 }, { now: NOW }).errors[0].code).toBe('EXPIRED');
    expect(() => GiftCodec.encode({ ...gift, version: 2 }, { now: NOW })).toThrow(GiftValidationError);
    expect(() => GiftCodec.decode('abc', { now: NOW })).toThrow(GiftCodecError);
  });

  it('limita la carta a 800 caracteres y el token a 8 KB', () => {
    expect(validateGiftPayload({ ...draft(), letter: 'x'.repeat(801) }, { now: NOW }).valid).toBe(false);
    const gift = createGiftPayload(draft({ dedication: 'x'.repeat(500), letter: 'x'.repeat(800) }), { now: NOW });
    const huge = { ...gift, visualPreset: { noise: 'x'.repeat(9000) } };
    expect(() => GiftCodec.encode(huge, { now: NOW })).toThrow(GiftCodecError);
  });
});

describe('createPersonalizedCatalog', () => {
  it('produce exactamente 18 objetos y cartas independientes', () => {
    const gift = createGiftPayload(draft(), { now: NOW });
    const catalog = createPersonalizedCatalog(gift);
    expect(catalog.entries).toHaveLength(18);
    expect(catalog.validate()).toBe(true);
    expect(new Set(catalog.entries.map(entry => entry.id)).size).toBe(18);
    expect(new Set(catalog.entries.map(entry => entry.card)).size).toBe(18);
    expect(catalog.entries[0].label).toBe('De Álex, para Lía 🌻');
    expect(new Set(catalog.entries.map(entry => entry.card.sourceType))).toEqual(new Set(['original', 'public-domain']));
  });

  it('coloca las tarjetas avanzadas primero sin compartir referencias', () => {
    const cards = [{
      id: 'nuestra-historia', objectType: 'bouquet', label: 'Nuestra historia',
      title: 'El comienzo', body: 'Todo empezó con una sonrisa.', sourceType: 'original',
    }];
    const gift = createGiftPayload(draft({ cards }), { now: NOW });
    const catalog = createPersonalizedCatalog(gift);
    expect(catalog.entries[0]).toMatchObject({ id: 'nuestra-historia', type: 'phrase', label: 'De Álex, para Lía 🌻' });
    expect(catalog.entries[0].card.title).toBe('El comienzo');
    expect(catalog.entries[0].card).not.toBe(gift.cards[0].card);
  });
});
