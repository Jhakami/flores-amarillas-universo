import { describe, expect, it } from 'vitest';
import { CAMERA_STATES } from '../../src/core/CameraRig.js';
import { defaultConfig } from '../../src/config/defaultConfig.js';
import { validateConfig } from '../../src/config/configSchema.js';

describe('contrato de CameraRig', () => {
  it('expone todos los estados V2', () => {
    expect(CAMERA_STATES).toEqual({
      INTRO_LOCKED: 'INTRO_LOCKED',
      CINEMATIC_TRAVEL: 'CINEMATIC_TRAVEL',
      ORBIT: 'ORBIT',
      FOCUS_TARGET: 'FOCUS_TARGET',
      RETURN_TO_ORBIT: 'RETURN_TO_ORBIT',
      REDUCED_MOTION: 'REDUCED_MOTION',
    });
  });

  it('usa límites seguros y pan desactivable desde el rig', () => {
    expect(defaultConfig.camera360).toMatchObject({
      damping: 0.06,
      minDistance: 4.5,
      maxDistance: 18,
      minPolarAngle: 0.12,
      maxPolarAngle: 3.02,
      idleDelay: 8,
    });
    expect(defaultConfig.camera360.minDistance).toBeLessThan(defaultConfig.camera360.maxDistance);
    expect(defaultConfig.camera360.minPolarAngle).toBeLessThan(defaultConfig.camera360.maxPolarAngle);
  });

  it('limita numéricos extremos de cámara a los rangos públicos', () => {
    const result = validateConfig({
      version: 2,
      camera360: {
        damping: -1,
        minDistance: -30,
        maxDistance: 100,
        minPolarAngle: -2,
        maxPolarAngle: 8,
        autoRotateSpeed: 7,
        idleDelay: 1,
      },
    });

    expect(result.camera360).toMatchObject({
      damping: 0.01,
      minDistance: 3,
      maxDistance: 30,
      minPolarAngle: 0.02,
      maxPolarAngle: 3.12,
      autoRotateSpeed: 1,
      idleDelay: 2,
    });
  });

  it('normaliza límites cruzados para que OrbitControls nunca reciba un intervalo vacío', () => {
    const result = validateConfig({
      version: 2,
      camera360: { minDistance: 30, maxDistance: 1, minPolarAngle: 3, maxPolarAngle: 0.1 },
    });

    expect(result.camera360.minDistance).toBeLessThan(result.camera360.maxDistance);
    expect(result.camera360.minPolarAngle).toBeLessThan(result.camera360.maxPolarAngle);
  });
});
