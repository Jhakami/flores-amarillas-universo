# Decisiones de arquitectura

## ADR-001 — Vanilla JS modular

Se elige JavaScript ES Modules con Vite y Three.js. React no aporta valor al render loop y aumentaría dos modelos de estado. La UI DOM pequeña se administra en módulos dedicados.

## ADR-002 — Una escena persistente

Las fases son estados sobre una escena compartida. Esto garantiza continuidad espacial, evita cortes y permite que la flor se convierta realmente en estrellas.

## ADR-003 — Geometría compartida para el morph

La nube inicial y el StarField comparten buffers. La GPU interpola posiciones precalculadas; no hay simulación CPU por partícula ni sustitución visible.

## ADR-004 — Billboards para flores

Se prefieren imágenes transparentes originales sobre modelos 3D para reducir peso y draw calls. Muchas flores utilizarán geometría/material compartido o instancing. GLTF/DRACO/KTX2 solo se añadirán si un asset futuro lo exige.

## ADR-005 — Postprocesado adaptativo

El lensing es un pass screen-space y el bloom es selectivo cuando el hardware lo permite. Se preserva la composición en LOW desactivando distorsión costosa y reduciendo bloom, no eliminando el agujero negro.

## ADR-006 — Configuración versionada y segura

`defaultConfig` es la fuente única. Importaciones se fusionan por campos permitidos, validan tipos, aplican límites y migran por versión. El texto se asigna como texto, nunca como HTML.

## ADR-007 — Audio tras gesto

El `AudioContext` se crea/reanuda únicamente por interacción explícita. Los archivos locales se reproducen mediante object URL y se revocan al reemplazar o destruir.

## ADR-008 — Assets locales y despliegue estático

La experiencia no depende de servicios en ejecución. Assets, fuentes y shaders se incluyen en el build y respetan el `base` de GitHub Pages.

## ADR-009 — Degradación antes que frames inestables

La narrativa y la interacción son invariantes. DPR, densidad, octavas de ruido, lensing, bloom y detalles secundarios pueden reducirse si el promedio sostenido cae por debajo de 30 FPS.
