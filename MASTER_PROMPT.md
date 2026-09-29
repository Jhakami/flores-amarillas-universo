# Universo de Flores Amarillas — contrato maestro

Construir una experiencia WebGL cinematográfica, romántica, misteriosa y espacial que se perciba como una secuencia continua, nunca como una web tradicional o una colección de pantallas:

`oscuridad → girasol → pétalos → partículas → estrellas → mensaje → viaje → agujero negro → flores orbitales → frases`

## Principios obligatorios

- Vanilla JavaScript modular, Vite, Three.js, GSAP, GLSL, EffectComposer, UnrealBloomPass, Tweakpane, Web Audio API y `localStorage`; React queda fuera.
- Una única escena Three.js. Los estados son fases narrativas, no páginas alternadas con `display:none`.
- El girasol visible se sustituye gradualmente por una representación de partículas y esa misma geometría continúa como campo estelar.
- Las posiciones iniciales, de transición y finales se precalculan en `BufferGeometry`; no se generan posiciones ni objetos dentro del render loop.
- El agujero negro incluye horizonte negro, disco procedural, photon ring, bloom y lente gravitacional proyectada en screen space.
- Las flores orbitales tienen profundidad, clusters e interacción táctil mediante raycasting; cada una revela una frase.
- Editor oculto por defecto (`E`) con persistencia, reset e importación/exportación JSON validada.
- Audio únicamente después de un gesto explícito. Debe existir ambiente procedural y opción de archivo local.
- Calidad LOW/MEDIUM/HIGH adaptada al dispositivo y degradación dinámica si el rendimiento permanece bajo 30 FPS.
- Soporte completo de touch, teclado, resize, cambio de orientación y `prefers-reduced-motion`.
- Cleanup explícito de geometrías, materiales, texturas, render targets, audio y listeners.

## Dirección visual

Negro absoluto o casi absoluto; blancos cálidos, amarillos y dorados. Movimiento lento, orgánico y elegante. Bloom selectivo y contenido. Nada infantil, caricaturesco, arcade, con estética de chat o teléfono simulado.

El inicio presenta una luz central tenue tras 400–700 ms y un girasol suspendido que nace durante 1.4–1.8 s, respira suavemente y muestra “Toca para iniciar”. Al tocarlo se comprime, acumula luz, se dispersa y hace morph. El mensaje “Feliz día de las Flores Amarillas” aparece dentro del espacio y también se desintegra. El viaje revela gradualmente el agujero negro y luego las flores.

## Calidad y entrega

La experiencia debe ocupar todo el viewport, compilar con `npm run build`, funcionar en GitHub Pages bajo `/flores-amarillas-universo/` y sostener 60 FPS cuando sea posible, nunca efectos que mantengan menos de 30 FPS. La entrega incluye documentación real, pruebas, workflow de Pages y fallback accesible cuando WebGL no esté disponible.

## Definition of Done

No está terminado si la flor solo desaparece, si el universo aparece por un fade que oculta un reemplazo, si la nube inicial no continúa como estrellas, si falta algún componente esencial del agujero negro, si las flores no se pueden tocar, si la configuración no se valida o si existen recursos sin liberar.
