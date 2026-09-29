import { defaultConfig } from './defaultConfig.js';

const clone = value => JSON.parse(JSON.stringify(value));
const finiteOr = (value, fallback) => Number.isFinite(value) ? value : fallback;
export function migrateConfig(value) {
  if (!value || typeof value !== 'object') return clone(defaultConfig);
  let migrated = value;
  if ((value.version ?? 1) < 2) migrated = {
    ...value, version: 2,
    narrative: { ...defaultConfig.narrative, ...(value.timing || {}) },
    camera360: clone(defaultConfig.camera360), galaxy: { ...defaultConfig.galaxy, microstars: value.particles?.starCount ?? defaultConfig.galaxy.microstars, dust: value.particles?.dustDensity ?? defaultConfig.galaxy.dust },
    spatialText: clone(defaultConfig.spatialText), interactions: clone(defaultConfig.interactions), cards: clone(defaultConfig.cards),
    performance: { ...defaultConfig.performance, ...(value.performance || {}) },
  };
  if ((migrated.version ?? 2) < 3) migrated = {
    ...migrated,
    version: 3,
    general: { ...migrated.general, exposure: Math.min(finiteOr(migrated.general?.exposure, defaultConfig.general.exposure), 0.9) },
    bloom: {
      ...migrated.bloom,
      strength: Math.min(finiteOr(migrated.bloom?.strength, defaultConfig.bloom.strength), 0.65),
      radius: Math.min(finiteOr(migrated.bloom?.radius, defaultConfig.bloom.radius), 0.32),
      threshold: Math.max(finiteOr(migrated.bloom?.threshold, defaultConfig.bloom.threshold), 0.62),
    },
    blackHole: { ...migrated.blackHole, photonIntensity: Math.min(finiteOr(migrated.blackHole?.photonIntensity, defaultConfig.blackHole.photonIntensity), 1.25) },
  };
  return migrated;
}
