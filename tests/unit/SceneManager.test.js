import { describe, expect, it, vi } from 'vitest';
import { SceneManager, STATES } from '../../src/core/SceneManager.js';

describe('SceneManager', () => {
  it('inicia en BOOT por defecto', () => {
    const manager = new SceneManager();
    expect(manager.getState()).toBe(STATES.BOOT);
    expect(manager.isTransitioning()).toBe(false);
  });

  it('acepta un estado inicial explícito', () => {
    expect(new SceneManager(STATES.LOADING).getState()).toBe(STATES.LOADING);
  });

  it('transiciona y publica previous, next y payload', () => {
    const manager = new SceneManager(STATES.INTRO);
    const listener = vi.fn();
    const payload = { origin: 'pointer' };
    manager.addEventListener('change', listener);
    expect(manager.transitionTo(STATES.MORPH, payload)).toBe(true);
    expect(manager.getState()).toBe(STATES.MORPH);
    expect(listener.mock.calls[0][0].detail).toEqual({ previous: STATES.INTRO, next: STATES.MORPH, payload });
  });

  it('rechaza estados desconocidos y transiciones al estado actual', () => {
    const manager = new SceneManager(STATES.INTRO);
    expect(manager.transitionTo('UNKNOWN')).toBe(false);
    expect(manager.transitionTo(STATES.INTRO)).toBe(false);
    expect(manager.getState()).toBe(STATES.INTRO);
  });

  it('rechaza una transición mientras el lock está activo', () => {
    const manager = new SceneManager(STATES.INTRO);
    manager.transitioning = true;
    expect(manager.transitionTo(STATES.MORPH)).toBe(false);
  });

  it('restart limpia el lock, vuelve a INTRO y emite el evento', () => {
    const manager = new SceneManager(STATES.UNIVERSE);
    const listener = vi.fn();
    manager.addEventListener('change', listener);
    manager.transitioning = true;
    manager.restart();
    expect(manager.isTransitioning()).toBe(false);
    expect(manager.getState()).toBe(STATES.INTRO);
    expect(listener.mock.calls[0][0].detail).toEqual({ previous: null, next: STATES.INTRO, restart: true });
  });
});
