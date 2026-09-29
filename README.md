# Universo de Flores Amarillas

Experiencia WebGL cinematográfica 360° en la que un girasol se transforma de forma continua en partículas, estrellas y un universo explorable con un agujero negro, flores, ramos, frases espaciales y cartas románticas interactivas.

## Requisitos

- Node.js 20 o posterior.
- npm 10 o posterior.
- Navegador con WebGL 2 recomendado.

## Desarrollo

```bash
npm install
npm run dev
```

Validación y producción:

```bash
npm run lint
npm test
npm run build
npm run preview
```

En Termux, instala Node LTS con `pkg install nodejs-lts`, clona el repositorio, ejecuta `npm install` y después `npm run dev -- --host 0.0.0.0`.

## Controles

- Tocar o hacer clic en el girasol: iniciar.
- Arrastrar: orbitar 360° alrededor del universo.
- Rueda o pellizco: acercar y alejar dentro de límites seguros.
- Tocar una flor, ramo o frase: enfocar el objeto y abrir su carta única.
- Botón `Centrar`: regresar a la composición principal.
- `E`: abrir o cerrar el editor visual.
- `Esc`: cerrar una frase o el editor.
- `M`: activar o silenciar el audio.
- `R`: reiniciar la secuencia.

El audio nunca comienza automáticamente.

## Arquitectura

`App` crea los servicios y mantiene un único loop. `SceneManager` gobierna los estados narrativos sobre una sola escena. `CameraRig` encapsula la cámara cinemática, OrbitControls y el foco reversible. La nube del girasol conserva sus buffers como campo estelar; flores y ramos se agrupan con instancing, y Troika genera el texto espacial SDF. El render pasa por lensing, bloom y acabado final adaptados al perfil.

Consulta la [arquitectura V2](docs/ARCHITECTURE_V2.md), las [decisiones V2](docs/DECISIONS_V2.md) y la [especificación visual V2](docs/VISUAL_SPEC_V2.md).

## Editor y configuración

El editor Tweakpane permanece oculto por defecto. Permite modificar contenido, tiempos, agujero negro, bloom, partículas, flores, cámara, audio y accesibilidad.

La configuración se valida, se guarda en `localStorage` bajo `yellowUniverseConfig` y puede exportarse o importarse como JSON. La opción de restauración recupera los valores oficiales.

## Rendimiento y accesibilidad

Los perfiles LOW, MEDIUM y HIGH ajustan DPR, densidad y postprocesado. Si el frame rate permanece bajo 30 FPS, la calidad desciende sin cambiar la narrativa. `prefers-reduced-motion` reduce el viaje, el parallax y la aceleración.

Consulta la documentación de [rendimiento](docs/PERFORMANCE.md) y [QA](docs/QA.md).

## Despliegue

Vite utiliza `base: '/flores-amarillas-universo/'`. El workflow de GitHub Pages instala dependencias, ejecuta lint, pruebas y build, y publica `dist/`.

En GitHub configura **Settings → Pages → Source → GitHub Actions**.

## Colaboración

Lee [AGENTS.md](AGENTS.md) antes de modificar módulos compartidos. El contrato vigente se encuentra en [MASTER_PROMPT_V2.md](MASTER_PROMPT_V2.md).
