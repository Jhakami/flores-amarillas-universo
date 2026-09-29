import { defaultConfig } from './defaultConfig.js';

const clone = value => JSON.parse(JSON.stringify(value));
export function migrateConfig(value) {
  if (!value || typeof value !== 'object') return clone(defaultConfig);
  if (value.version >= 2) return value;
  return {
    ...value, version: 2,
    narrative: { ...defaultConfig.narrative, ...(value.timing || {}) },
    camera360: clone(defaultConfig.camera360), galaxy: { ...defaultConfig.galaxy, microstars: value.particles?.starCount ?? defaultConfig.galaxy.microstars, dust: value.particles?.dustDensity ?? defaultConfig.galaxy.dust },
    spatialText: clone(defaultConfig.spatialText), interactions: clone(defaultConfig.interactions), cards: clone(defaultConfig.cards),
    performance: { ...defaultConfig.performance, ...(value.performance || {}) },
  };
}
