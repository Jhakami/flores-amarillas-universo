# Guía de colaboración

## Fuente de verdad

Leer antes de editar: `MASTER_PROMPT.md`, `docs/ARCHITECTURE.md`, `docs/VISUAL_SPEC.md` y `docs/DECISIONS.md`. Los contratos compartidos se actualizan primero en documentación y después en código.

## Ownership

| Área | Archivos principales | Responsable |
|---|---|---|
| Runtime e integración | `src/core/`, `src/main.js` | Technical Lead |
| Morph y estrellas | `SunflowerParticleCloud`, `ParticleMorph`, `StarField`, `DustField`, shaders asociados | Particle Engineer |
| Agujero negro | `BlackHole`, `AccretionDisk`, `PhotonRing`, lensing y shaders asociados | GLSL Engineer |
| Movimiento e input | experiencias, cámara, `src/interactions/` | Motion/UX |
| UI y contenido | `src/ui/`, `src/data/`, estilos | UI/Editor |
| Configuración | `src/config/`, `ConfigManager` | Technical Lead + UI/Editor |
| Rendimiento | `PerformanceManager`, perfiles y auditorías | Performance Engineer |
| Verificación | `tests/`, `docs/QA.md` | QA Engineer |

No modificar archivos fuera del ownership asignado sin coordinación. En particular, el especialista GLSL no toca UI; partículas no reestructura core; QA no incorpora features; revisión visual propone cambios, pero no altera arquitectura.

## Archivos de alto conflicto

No editar simultáneamente `App.js`, `SceneManager.js`, `defaultConfig.js`, `PostProcessing.js`, `main.js`, `styles/base.css` ni `vite.config.js`. Reservar ownership antes de trabajar y mantener los cambios pequeños.

## Flujo de ramas y PR

- Partir de `develop` con ramas `feat/<area>`, `fix/<problema>`, `perf/<área>` o `qa/<área>`.
- Un PR debe tener un objetivo, capturas o grabación si cambia lo visual, perfil probado y evidencia de `lint`, pruebas y build.
- No mezclar refactors generales con una feature visual.
- El autor debe documentar uniforms nuevos, rango, default, impacto de calidad y fallback LOW.
- Revisión obligatoria del dueño del módulo y del Technical Lead si cambia un contrato.

## Checklist de revisión

- Narrativa continua y sin reemplazos ocultos.
- Sin allocations evitables en `update()` o render loop.
- `resize()` actualiza cámara, renderer, composer, targets y uniforms de resolución.
- `dispose()` cubre recursos WebGL, eventos, timelines y audio.
- Touch no depende de hover y los targets son adecuados.
- DPR y complejidad respetan el perfil.
- No aprobar mientras exista un defecto `BLOCKER`.
