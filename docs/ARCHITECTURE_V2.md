# Arquitectura detallada V2

## 1. Propósito

La arquitectura sostiene una experiencia WebGL continua, explorable y adaptable. No existen páginas ni escenas independientes que se intercambien mediante CSS. Hay una sola THREE.Scene, una sola cámara activa, un renderer y un ciclo requestAnimationFrame.

Objetivos:

- Mantener continuidad entre girasol, partículas y estrellas.
- Separar narrativa, mundo 3D, interacción, interfaz y render.
- Evitar dependencias circulares y singletons ocultos.
- Evitar allocations y exceso de draw calls por frame.
- Permitir reinicio, resize, degradación de calidad y cleanup.
- Conservar accesibilidad sin duplicar visuales WebGL en el DOM.

## 2. Mapa general

~~~text
index.html
    │
    ▼
src/main.js
    │ crea
    ▼
App ──────────────────────────────────────────────────────────┐
│                                                            │
├─ Core                                                      │
│  ├─ Renderer / Camera / Clock                              │
│  ├─ SceneManager / CameraRig                               │
│  ├─ AssetManager / ConfigManager / PerformanceManager      │
│  ├─ InputManager / AudioManager / ResourceTracker          │
│  └─ InteractiveRegistry                                    │
│                                                            │
├─ Narrativa                                                 │
│  └─ ParticleMorph                                          │
│                                                            │
├─ Mundo 3D                                                  │
│  ├─ Sunflower                                              │
│  ├─ SunflowerParticleCloud / TextParticleCloud             │
│  ├─ GalaxyField / BlackHole                                │
│  ├─ FlowerInstanceSystem / SpatialTextSystem               │
│  └─ ParticlePool                                           │
│                                                            │
├─ Interacción                                               │
│  ├─ UniverseRaycaster                                      │
│  └─ KeyboardController                                     │
│                                                            │
├─ UI accesible                                              │
│  ├─ IntroPrompt / MessageOverlay / ExploreControls         │
│  ├─ QuoteOverlay / AudioControl / LiveEditor               │
│  └─ LoadingOverlay / ErrorFallback                         │
│                                                            │
└─ Postprocesado                                             │
   └─ Render → Lens → Bloom → Vignette → Output              │
                                                             │
requestAnimationFrame ◄───────────────────────────────────────┘
~~~

## 3. Reglas entre capas

1. App es el único composition root.
2. Los objetos Three.js no importan la UI.
3. La UI emite intenciones y no modifica shaders directamente.
4. El contenido visual almacena IDs; el texto completo vive en el catálogo.
5. Los servicios se entregan mediante referencias explícitas.
6. Cada sistema libera los recursos que crea.
7. Solo App conecta módulos de capas diferentes.

## 4. Entrada

Archivos:

- index.html
- src/main.js

Responsabilidades:

- Obtener el canvas y el contenedor de UI.
- Comprobar WebGL.
- Crear App.
- Ejecutar init y start.
- Mostrar ErrorFallback cuando la inicialización falla.

La entrada no conoce objetos, shaders ni timelines.

## 5. App y ciclo de vida

src/core/App.js construye el grafo completo.

~~~text
constructor
  → servicios sincrónicos
init
  → assets y objetos visuales
start
  → introducción
update
  → frame
resize
  → viewport y DPR
restart
  → restauración narrativa
destroy
  → cleanup total
~~~

### init

1. Muestra el loader si la carga tarda.
2. Carga flor protagonista y atlas.
3. Crea nubes de partículas.
4. Crea galaxia y agujero negro.
5. Filtra el catálogo según calidad.
6. Precarga glifos de Troika.
7. Genera layout determinista.
8. Crea flores, textos y pool.
9. Registra elementos interactivos.
10. Construye postprocesado, cámara y UI.
11. Registra eventos.
12. Propaga el primer resize.

### update

El orden del frame es:

~~~text
Clock.tick
  → Sunflower
  → SunflowerParticleCloud
  → TextParticleCloud
  → GalaxyField
  → BlackHole
  → FlowerInstanceSystem
  → SpatialTextSystem
  → ParticlePool
  → ParticleMorph
  → CameraRig
  → PerformanceManager
  → PostProcessing.render
~~~

No se crean geometrías, materiales, arrays de partículas ni números aleatorios dentro del loop estable.

## 6. Máquina narrativa

SceneManager conserva estados lógicos, no escenas.

~~~text
BOOT
  → INTRO
  → MORPH
  → MESSAGE
  → TRAVEL
  → BLACK_HOLE_REVEAL
  → UNIVERSE
  ⇄ QUOTE_FOCUS
~~~

| Estado | Responsabilidad |
|---|---|
| INTRO | nacimiento y respiración del girasol |
| MORPH | flor convertida en nube |
| MESSAGE | título de partículas |
| TRAVEL | cámara y revelado galáctico |
| BLACK_HOLE_REVEAL | disco, ring, flores y frases |
| UNIVERSE | órbita e interacción |
| QUOTE_FOCUS | foco reversible y carta |

## 7. Servicios Core

| Servicio | Responsabilidad |
|---|---|
| Renderer | WebGLRenderer, color space, tone mapping y DPR |
| Camera | PerspectiveCamera y aspecto |
| Clock | elapsed y delta |
| CameraRig | viaje, órbita, foco, retorno y reduced motion |
| AssetManager | carga y caché de texturas |
| ConfigManager | persistencia, importación y exportación |
| PerformanceManager | perfil y degradación |
| InputManager | gesto de activación |
| AudioManager | ambiente y archivo local |
| ResourceTracker | recursos y listeners |
| InteractiveRegistry | objetos interactivos y contenido |

## 8. Continuidad de partículas

SunflowerParticleCloud conserva una BufferGeometry con:

~~~text
aStartPosition
aTransitionPosition
aTargetPosition
aRandom
aSize
aDelay
aColorMix
~~~

ParticleMorph cambia uniforms:

~~~text
forma del girasol
  → separación
  → dispersión
  → campo estelar
~~~

La geometría no se destruye al completar el morph. Los puntos iniciales continúan dentro del universo.

## 9. Título corregido

TextParticleCloud realiza el siguiente proceso fuera del render loop:

1. Normaliza espacios.
2. Busca el corte más equilibrado entre palabras.
3. Dibuja dos líneas centradas en canvas.
4. Limita cada línea al 88 por ciento del ancho.
5. Muestrea píxeles con alfa.
6. Construye la geometría de puntos.

El título queda:

~~~text
Feliz día de las
Flores Amarillas
~~~

Antes, el texto completo se dibujaba en una sola línea de ancho fijo y la palabra Amarillas quedaba recortada. Además, MessageOverlay dibujaba otra copia HTML encima. Ahora MessageOverlay es un anunciador aria-live visualmente oculto. La única representación visible durante MESSAGE es TextParticleCloud.

Regla: un texto narrativo no debe dibujarse simultáneamente como DOM visible y WebGL en la misma posición.

## 10. Galaxia

GalaxyField coordina:

- Nube estelar compartida.
- VolumetricDust.
- HighlightField.

Las capas se separan por blending, tamaño y velocidad. El reveal cambia uniforms y opacidades, sin reconstruir buffers.

## 11. Agujero negro

~~~text
BlackHole
├─ EventHorizon
├─ EventHorizonHalo
├─ AccretionDisk
└─ PhotonRing
~~~

- EventHorizon: oclusión negra.
- AccretionDisk: volumen anular y shader procedural.
- PhotonRing: torus luminoso.
- GravitationalLensPass: distorsión alrededor de la posición proyectada.

La intensidad se limita en shader, configuración y postprocesado para que la suma aditiva no destruya el fondo.

## 12. Flores y textos

### FlowerInstanceSystem

Usa atlas e InstancedMesh. Cada instancia tiene transformación, variante, ID, progreso y estado de foco. instanceId se convierte en contentId mediante InteractiveRegistry.

### SpatialTextSystem

Usa Troika SDF. Cada frase tiene mesh, hitbox, ID y fase. El título y las frases miran a la cámara para conservar legibilidad sin abandonar el espacio 3D.

## 13. Cámara

CameraRig encapsula OrbitControls:

~~~text
INTRO_LOCKED
CINEMATIC_TRAVEL
ORBIT
FOCUS_TARGET
RETURN_TO_ORBIT
REDUCED_MOTION
~~~

- Pan desactivado.
- Zoom limitado.
- Límites polares validados.
- Damping activo.
- Auto-rotación tras inactividad.
- Gestos detienen la auto-rotación.
- El foco guarda posición y target.
- El cierre restaura la pose exacta.

## 14. Interacción

~~~text
pointerdown
  → guardar coordenadas
pointerup
  → descartar si fue drag
UniverseRaycaster
  → consultar solo InteractiveRegistry
  → resolver contentId
App.openCard
  → QUOTE_FOCUS
  → escala y partículas
  → CameraRig.focus
  → QuoteOverlay.open
~~~

contentCatalog es la fuente de verdad. Las instancias solo conservan IDs.

## 15. UI accesible

| Módulo | Función |
|---|---|
| LoadingOverlay | carga lenta |
| IntroPrompt | gesto inicial |
| MessageOverlay | anuncio no visual |
| ExploreControls | ayuda y centrado |
| QuoteOverlay | carta modal |
| AudioControl | sonido y archivo local |
| LiveEditor | configuración |
| ErrorFallback | alternativa sin WebGL |

Los overlays viven en DOM para mantener foco, teclado y lector de pantalla. No deben competir visualmente con el canvas.

## 16. Pipeline de render

~~~text
Scene + Camera
    ↓
RenderPass
    ↓
GravitationalLensPass
    ↓
UnrealBloomPass
    ↓
VignettePass
  ├─ compresión de altas luces
  ├─ restauración del negro
  └─ viñeta
    ↓
OutputPass
~~~

Cada frame el agujero negro se proyecta de coordenadas mundiales a NDC y UV. LOW desactiva lensing; MEDIUM y HIGH ajustan su complejidad.

La protección contra sobreexposición combina:

- Intensidad limitada de disco y ring.
- Tamaño y alfa limitados en partículas.
- Umbral alto de bloom.
- Exposición validada.
- Compresión de altas luces.
- Viñeta en todos los perfiles.
- Migración de configuraciones antiguas.

## 17. Configuración

~~~text
defaultConfig V3
    ↓
migrateConfig
    ↓
validateConfig
    ↓
ConfigManager
    ↓
App.applyConfig
    ├─ Renderer
    ├─ Camera
    ├─ CameraRig
    ├─ Flowers
    ├─ BlackHole
    └─ PostProcessing
~~~

La clave es yellowUniverseConfig. Los valores desconocidos se eliminan, los tipos incorrectos se rechazan y los números se limitan.

## 18. Resize y calidad

App.resize propaga dimensiones a renderer, cámara, composer, lensing y partículas. El DPR proviene del perfil y no se usa sin límite.

| Perfil | DPR | Estrellas | Polvo | Destellos | Flores | Textos |
|---|---:|---:|---:|---:|---:|---:|
| LOW | 1.25 | 2,000 | 700 | 80 | 20 | 14 |
| MEDIUM | 1.6 | 6,000 | 2,000 | 180 | 42 | 20 |
| HIGH | 2.0 | 14,000 | 5,000 | 320 | 72 | 24 |

Al degradar se reducen DPR, efectos, draw ranges, instancias y textos visibles. La narrativa no cambia.

## 19. Reinicio y cleanup

restart:

- Cancela timers y timelines.
- Cierra la carta.
- Restaura la instancia enfocada.
- Restablece cámara y estado.
- Oculta universo y textos.
- Reinicia uniforms.
- Muestra flor y prompt.

destroy libera listeners, controles, audio, object URLs, geometrías, materiales, texturas, targets, UI y registro interactivo.

## 20. Pruebas y despliegue

Las pruebas cubren estados, configuración, migraciones, catálogo, layout, cámara y división completa del título.

~~~text
npm run lint
npm test
npm run build
~~~

Cada PR ejecuta esos gates. Cada push a main compila y publica dist en GitHub Pages.

## 21. Ownership

| Área | Propietario |
|---|---|
| App, contratos y estado | Technical Lead |
| Partículas y galaxia | Galaxy Engineer |
| Agujero negro y shaders | GLSL Engineer |
| Cámara y gestos | Motion/UX |
| Flores, atlas y layout | Floral/World |
| Troika, catálogo y contenido | Text/Content |
| Overlays y editor | UI |
| DPR, perfiles y memoria | Performance |
| Pruebas y regresiones | QA |

Los cambios en App, configuración, catálogo o pipeline se coordinan primero porque cruzan varias capas.
