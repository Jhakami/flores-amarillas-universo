import { describe, expect, it } from 'vitest';
import { UniverseLayout, seededRandom } from '../../src/utils/UniverseLayout.js';

const snapshotLayout = values => values.map(item => ({
  position: item.position.toArray(),
  scale: item.scale,
  rotation: item.rotation,
  phase: item.phase,
  orbitSpeed: item.orbitSpeed,
  variant: item.variant,
}));

describe('seededRandom', () => {
  it('genera una secuencia determinista dentro de [0, 1)', () => {
    const first = seededRandom(42);
    const second = seededRandom(42);
    const a = Array.from({ length: 24 }, () => first());
    const b = Array.from({ length: 24 }, () => second());

    expect(a).toEqual(b);
    expect(a.every(value => value >= 0 && value < 1)).toBe(true);
  });
});

describe('UniverseLayout', () => {
  it('produce exactamente el mismo layout para la misma semilla', () => {
    const options = { seed: 917, radius: 11, height: 7 };
    expect(snapshotLayout(new UniverseLayout(options).generate(40)))
      .toEqual(snapshotLayout(new UniverseLayout(options).generate(40)));
  });

  it('reinicia el generador en cada cálculo y no acumula estado', () => {
    const layout = new UniverseLayout({ seed: 2024, radius: 10, height: 6 });
    expect(snapshotLayout(layout.generate(18))).toEqual(snapshotLayout(layout.generate(18)));
  });

  it('cambia la distribución al cambiar la semilla', () => {
    const first = snapshotLayout(new UniverseLayout({ seed: 1 }).generate(12));
    const second = snapshotLayout(new UniverseLayout({ seed: 2 }).generate(12));
    expect(first).not.toEqual(second);
  });

  it('respeta cantidad, valores finitos y variantes de atlas', () => {
    const result = new UniverseLayout({ seed: 99, radius: 12, height: 8 }).generate(65);

    expect(result).toHaveLength(65);
    result.forEach((item, index) => {
      expect(item.position.toArray().every(Number.isFinite)).toBe(true);
      expect(Number.isFinite(item.scale)).toBe(true);
      expect(item.scale).toBeGreaterThan(0);
      expect(item.variant).toBe(index % 8);
      expect(Math.abs(item.position.y)).toBeLessThanOrEqual(5.2);
    });
  });
});
