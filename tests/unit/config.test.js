import { describe, expect, it } from 'vitest';
import { defaultConfig } from '../../src/config/defaultConfig.js';
import { validateConfig } from '../../src/config/configSchema.js';

describe('validateConfig', () => {
  it('acepta y conserva una configuración por defecto válida', () => {
    const result = validateConfig(structuredClone(defaultConfig));
    expect(result).toEqual(defaultConfig);
  });

  it('combina configuraciones parciales con defaults', () => {
    const result = validateConfig({ version: 1, bloom: { strength: 1.8 } });
    expect(result.bloom.strength).toBe(1.8);
    expect(result.camera).toEqual(defaultConfig.camera);
  });

  it('limita valores numéricos a rangos seguros', () => {
    const result = validateConfig({
      version: 1,
      bloom: { strength: 99 },
      particles: { starCount: -50 },
      camera: { fov: 200 },
    });
    expect(result.bloom.strength).toBeLessThanOrEqual(2.5);
    expect(result.particles.starCount).toBeGreaterThanOrEqual(500);
    expect(result.camera.fov).toBeLessThanOrEqual(75);
  });

  it('ignora campos desconocidos y tipos incorrectos', () => {
    const result = validateConfig({
      version: 1,
      injected: true,
      bloom: { strength: 'mucho', injected: true },
    });
    expect(result).not.toHaveProperty('injected');
    expect(result.bloom).not.toHaveProperty('injected');
    expect(result.bloom.strength).toBe(defaultConfig.bloom.strength);
  });

  it('no muta la entrada', () => {
    const input = { version: 1, bloom: { strength: 1.7 } };
    const snapshot = structuredClone(input);
    validateConfig(input);
    expect(input).toEqual(snapshot);
  });
});
