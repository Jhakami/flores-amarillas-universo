import { describe, expect, it } from 'vitest';
import { splitBalancedLines } from '../../src/objects/TextParticleCloud.js';

describe('splitBalancedLines', () => {
  it('divide el título principal sin perder ni recortar palabras', () => {
    const text = 'Feliz día de las Flores Amarillas';
    const lines = splitBalancedLines(text);

    expect(lines).toEqual(['Feliz día de las', 'Flores Amarillas']);
    expect(lines.join(' ')).toBe(text);
  });

  it('conserva textos breves en una sola línea', () => {
    expect(splitBalancedLines('Para ti')).toEqual(['Para ti']);
  });
});
