# Arquitectura V2

```text
App
├─ SceneManager ─ narrativa continua
├─ CameraRig ─ cámara cinemática + OrbitControls + foco
├─ GalaxyField ─ morph compartido + polvo + destellos
├─ BlackHole ─ horizonte + disco + photon ring
├─ UniverseLayout ─ posiciones deterministas
├─ FlowerInstanceSystem ─ atlas + instancing + hit mapping
├─ SpatialTextSystem ─ texto SDF + hitboxes
├─ InteractiveRegistry ─ raycast → content id
├─ FocusController ─ cámara + glow + carta
├─ ConfigManager ─ migración y persistencia V2
└─ PostProcessing ─ lensing + bloom + vignette
```

`App` es el único composition root. Los objetos no importan UI ni configuración global. La escena Three.js es única y las etapas se revelan modificando uniforms, visibilidad progresiva y cámara.

## Ciclo de frame

1. `Clock.tick()` reutiliza el frame.
2. `CameraRig.update()` procesa damping y estados.
3. Los sistemas visuales actualizan uniforms o matrices preasignadas.
4. `FocusController` actualiza la transición activa.
5. `PostProcessing.render()` proyecta el agujero negro y compone la imagen.

## Ownership

Core e integración pertenecen al Technical Lead; partículas al Galaxy Engineer; agujero negro al GLSL Engineer; cámara a Motion/UX; instancing y layout a World/Floral; textos y catálogo a Content; cartas/editor a UI; pruebas a QA/Performance.
