import { describe, expect, it } from 'vitest';
import { ContentCatalog, contentCatalog } from '../../src/data/contentCatalog.js';

const validEntry = (overrides = {}) => ({
  id: 'card-01',
  type: 'sunflower',
  assetVariant: 0,
  label: 'Una flor',
  card: {
    title: 'Una flor',
    body: 'Un mensaje original.',
    author: 'Texto original',
    work: '',
    sourceType: 'original',
  },
  minimumQuality: 'LOW',
  ...overrides,
});

describe('ContentCatalog', () => {
  it('publica un catálogo válido, con ids y cartas únicas', () => {
    expect(contentCatalog.validate()).toBe(true);
    expect(contentCatalog.entries.length).toBeGreaterThan(0);
    expect(new Set(contentCatalog.entries.map(entry => entry.id)).size).toBe(contentCatalog.entries.length);
    expect(new Set(contentCatalog.entries.map(entry => entry.card)).size).toBe(contentCatalog.entries.length);
  });

  it('resuelve ids conocidos y devuelve null para ids desconocidos', () => {
    const first = contentCatalog.entries[0];
    expect(contentCatalog.get(first.id)).toBe(first);
    expect(contentCatalog.get('does-not-exist')).toBeNull();
  });

  it('filtra perfiles de calidad de forma acumulativa', () => {
    const low = contentCatalog.list('LOW');
    const medium = contentCatalog.list('MEDIUM');
    const high = contentCatalog.list('HIGH');

    expect(low.every(entry => entry.minimumQuality === 'LOW')).toBe(true);
    expect(medium.map(entry => entry.id)).toEqual(expect.arrayContaining(low.map(entry => entry.id)));
    expect(high.map(entry => entry.id)).toEqual(expect.arrayContaining(medium.map(entry => entry.id)));
    expect(high).toHaveLength(contentCatalog.entries.length);
  });

  it('rechaza ids duplicados y fuentes literarias desconocidas', () => {
    const duplicate = validEntry();
    expect(new ContentCatalog([duplicate, { ...duplicate }]).validate()).toBe(false);
    expect(new ContentCatalog([
      validEntry({ card: { ...validEntry().card, sourceType: 'copyrighted' } }),
    ]).validate()).toBe(false);
  });

  it('rechaza tipos de objeto y perfiles de calidad fuera del contrato', () => {
    expect(new ContentCatalog([validEntry({ type: 'planet' })]).validate()).toBe(false);
    expect(new ContentCatalog([validEntry({ minimumQuality: 'ULTRA' })]).validate()).toBe(false);
  });
});
