# Arquitectura

## Flujo general

```text
main
  ↓
App (composition root)
  ├─ Renderer + Camera + Clock
  ├─ ConfigManager + PerformanceManager
  ├─ AssetManager + ResourceTracker
  ├─ InputManager + AudioManager
  └─ SceneManager
       ↓
    Experiences
       ↓
    Objects → Shaders
       ↓
    PostProcessing
```

Existe una sola `THREE.Scene`. `SceneManager` cambia estados narrativos y activa sistemas, pero no reemplaza páginas ni recrea la escena.

## Ciclo de vida de App

`init()` carga configuración, detecta perfil y prepara recursos. `start()` entra en `INTRO`. El loop reutiliza un objeto `frame` con `elapsed`, `delta`, viewport, pointer y perfil. `resize()` propaga dimensiones. `restart()` cancela timelines y restaura el estado sin recargar. `destroy()` libera todos los propietarios registrados.

## Máquina narrativa

```text
BOOT → LOADING → INTRO → MORPH → MESSAGE → TRAVEL
     → BLACK_HOLE_REVEAL → UNIVERSE ⇄ QUOTE_FOCUS
```

`ERROR` acepta transiciones desde cualquier estado. `REDUCED_MOTION` es una política transversal, no una experiencia incompleta. Solo hay una transición activa; cada transición debe poder cancelarse.

Contrato de experiencia:

```js
{ id, enter(context, payload), update(frame), exit(context), resize(viewport), reset(), dispose() }
```

## Continuidad de partículas

`SunflowerParticleCloud`, `ParticleMorph` y `StarField` comparten `BufferGeometry` y `ShaderMaterial`. Los atributos `aStartPosition`, `aTransitionPosition`, `aTargetPosition`, `aRandom`, `aSize`, `aDelay` y `aColorMix` se calculan una vez. Los uniforms alteran estado y apariencia sin copias por partícula en CPU.

Las estrellas adicionales de perfiles altos se reservan antes del viaje y se revelan gradualmente. `DustField` permanece separado porque su blending y movimiento difieren.

## Agujero negro y render

`BlackHole` coordina `EventHorizon`, `AccretionDisk`, `PhotonRing`, polvo y halos. Publica posición mundial sin asignaciones, recibe configuración validada y define `update`, `reveal`, `reset`, `setQuality` y `dispose`.

Pipeline:

```text
RenderPass → GravitationalLensPass → Bloom → Color → Vignette → Output
```

Cada frame la posición mundial del agujero negro se proyecta a NDC y luego UV para el lensing. LOW lo desactiva; MEDIUM usa una fórmula simplificada; HIGH habilita el efecto completo.

## Dependencias y comunicación

Las dependencias se inyectan por `context`; no hay singletons ocultos. UI emite intenciones y no muta objetos Three.js directamente. `ConfigManager` valida y publica cambios; cada consumidor aplica únicamente su sección. `ResourceTracker` registra recursos y listeners por owner.

## Resize y pérdida de contexto

El viewport es una estructura reutilizada. Resize actualiza aspecto/proyección, tamaño y DPR del renderer, composer, render targets y `uResolution/uAspect`. Ante pérdida de contexto se detiene el loop; al restaurarse se reconstruyen recursos GPU desde datos precalculados y configuración vigente.
