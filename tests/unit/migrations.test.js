import { describe, expect, it } from 'vitest';
import { defaultConfig } from '../../src/config/defaultConfig.js';
import { migrateConfig } from '../../src/config/migrations.js';

describe('migrateConfig V1 -> V2', () => {
  it('crea una copia V2 completa para entradas inexistentes', () => {
    const result = migrateConfig(null);

    expect(result).toEqual(defaultConfig);
    expect(result).not.toBe(defaultConfig);
    expect(result.camera360).not.toBe(defaultConfig.camera360);
  });

  it('conserva contenido, audio, bloom, exposición y tiempos V1', () => {
    const legacy = {
      version: 1,
      content: { title: 'Un título anterior', prompt: 'Comenzar' },
      general: { background: '#010101', exposure: 1.42, quality: 'MEDIUM' },
      timing: { introDelay: 0.7, travelDuration: 4.1 },
      particles: { starCount: 6123, dustDensity: 1444 },
      bloom: { strength: 1.7, radius: 0.31, threshold: 0.2 },
      audio: { source: 'procedural', volume: 0.24, muted: true },
      performance: { minFps: 36 },
    };

    const result = migrateConfig(legacy);

    expect(result.version).toBe(2);
    expect(result.content).toEqual(legacy.content);
    expect(result.general).toEqual(legacy.general);
    expect(result.audio).toEqual(legacy.audio);
    expect(result.bloom).toEqual(legacy.bloom);
    expect(result.narrative).toMatchObject(legacy.timing);
    expect(result.narrative.messageDuration).toBe(defaultConfig.narrative.messageDuration);
    expect(result.galaxy.microstars).toBe(6123);
    expect(result.galaxy.dust).toBe(1444);
    expect(result.performance).toMatchObject({ ...defaultConfig.performance, minFps: 36 });
    expect(result.camera360).toEqual(defaultConfig.camera360);
  });

  it('no muta la configuración V1 ni comparte ramas V2 por defecto', () => {
    const legacy = { version: 1, timing: { introDelay: 0.91 } };
    const snapshot = structuredClone(legacy);
    const result = migrateConfig(legacy);

    result.camera360.damping = 0.2;
    result.spatialText.opacity = 0.2;

    expect(legacy).toEqual(snapshot);
    expect(defaultConfig.camera360.damping).toBe(0.06);
    expect(defaultConfig.spatialText.opacity).toBe(0.68);
  });
});
