import { ContentCatalog, contentCatalog } from '../data/contentCatalog.js';
import { assertGiftPayload } from './GiftValidator.js';

export const GIFT_CARD_COUNT = 18;

const compatibleType = objectType => objectType === 'spatial-phrase' ? 'phrase' : objectType;
const cloneEntry = (entry, index) => {
  const objectType = entry.objectType ?? (entry.type === 'phrase' ? 'spatial-phrase' : entry.type);
  return {
    id: entry.id || `gift-card-${String(index + 1).padStart(2, '0')}`,
    objectType,
    type: compatibleType(objectType),
    assetVariant: entry.assetVariant ?? index % 8,
    label: entry.label,
    card: { ...entry.card },
    minimumQuality: 'LOW',
  };
};

const matchesPack = (entry, quotePack) => {
  if (quotePack === 'mixed') return true;
  if (quotePack === 'classic') return entry.card?.sourceType === 'public-domain';
  return entry.card?.sourceType === 'original';
};

const uniqueId = (wanted, used, index) => {
  const root = String(wanted || `gift-card-${index + 1}`).replace(/[^A-Za-z0-9_-]/g, '-').slice(0, 56) || 'gift-card';
  let id = root;
  let suffix = 2;
  while (used.has(id)) id = `${root}-${suffix++}`;
  used.add(id);
  return id;
};

export function createPersonalizedCatalog(payload, base = contentCatalog, options = {}) {
  const gift = assertGiftPayload(payload, { allowExpired: options.allowExpired ?? true });
  const sourceEntries = Array.isArray(base) ? base : base?.entries;
  if (!Array.isArray(sourceEntries) || sourceEntries.length === 0) throw new TypeError('Se requiere un catálogo base con tarjetas.');

  const custom = gift.cards.map(cloneEntry);
  let preferred = sourceEntries.filter(entry => matchesPack(entry, gift.quotePack));
  if (gift.quotePack === 'mixed') {
    const originals = sourceEntries.filter(entry => entry.card?.sourceType === 'original');
    const classics = sourceEntries.filter(entry => entry.card?.sourceType === 'public-domain');
    preferred = Array.from({ length: Math.max(originals.length, classics.length) }, (_, index) => [originals[index], classics[index]]).flat().filter(Boolean);
  }
  const fallback = sourceEntries.filter(entry => !preferred.includes(entry));
  const candidates = [...custom, ...preferred.map(cloneEntry), ...fallback.map(cloneEntry)];
  const selected = candidates.slice(0, GIFT_CARD_COUNT);
  let cursor = 0;
  while (selected.length < GIFT_CARD_COUNT) {
    const seed = cloneEntry(sourceEntries[cursor % sourceEntries.length], cursor);
    const cycle = Math.floor(cursor / sourceEntries.length) + 2;
    seed.id = `${seed.id}-${cycle}`;
    seed.card.title = `${seed.card.title} · ${cycle}`;
    selected.push(seed);
    cursor += 1;
  }

  const usedIds = new Set();
  const entries = selected.map((entry, index) => {
    const copy = cloneEntry(entry, index);
    copy.id = uniqueId(copy.id, usedIds, index);
    if (index === 0) {
      copy.objectType = 'spatial-phrase';
      copy.type = 'phrase';
      copy.label = `De ${gift.sender}, para ${gift.recipient}`;
      if (custom.length === 0) copy.card = { title: gift.dedication, body: copy.card.body, author: gift.sender, work: 'Universo de Flores Amarillas', sourceType: 'original' };
    }
    return Object.freeze({ ...copy, card: Object.freeze(copy.card) });
  });
  return new ContentCatalog(entries);
}

export const buildGiftCatalog = createPersonalizedCatalog;
