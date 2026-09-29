# Estrategia de QA

## Matriz mínima

- Chrome Android: teléfono pequeño y moderno.
- Chrome/Edge desktop: 1366×768 y 1920×1080.
- Firefox desktop.
- Tablet vertical y horizontal.
- Safari cuando esté disponible.
- DPR 1, 1.5/1.7 y 2; perfiles LOW, MEDIUM y HIGH forzados.

## Recorrido principal

1. Fondo negro; loader solo después de 500 ms.
2. Luz y flor nacen progresivamente; prompt aparece después.
3. Un solo toque inicia una sola transición.
4. La silueta se vuelve partículas y la misma nube continúa como estrellas.
5. Mensaje aparece en el espacio y se desintegra.
6. La cámara atraviesa partículas sin fade de página.
7. El agujero negro revela glow, disco, ring, horizonte y lensing en orden.
8. Flores aparecen por clusters; touch abre la frase correcta.
9. `Esc`, `E`, `M` y `R` funcionan y no duplican listeners.

## Casos de robustez

- Resize/orientación durante cada estado.
- Doble toque, toque fuera, multitouch y dispositivo sin hover.
- Reinicio durante morph, reveal y frase abierta.
- Pestaña oculta, pérdida/restauración de WebGL y asset ausente.
- JSON válido, parcial, antiguo, desconocido, corrupto y fuera de rango.
- Audio bloqueado, archivo incompatible, reemplazo de archivo y mute.
- Reduced motion del sistema y override manual.
- Tres reinicios completos sin crecimiento sostenido de memoria.

## Accesibilidad

Verificar foco visible, orden de tabulación, nombres accesibles, anuncio de frases, contraste, targets táctiles y fallback sin WebGL. Todo debe ser utilizable sin hover y sin audio.

## Severidad

- `BLOCKER`: experiencia no inicia/termina, pérdida de datos, pantalla negra sin fallback, crash o fuga grave.
- `HIGH`: interacción principal rota, composición esencial ausente o menos de 30 FPS sostenidos.
- `MEDIUM`: defecto localizado con alternativa funcional.
- `LOW`: inconsistencia menor o pulido.

No aprobar con `BLOCKER`. Cada defecto incluye entorno, perfil, pasos, esperado, observado y evidencia.

## Gates de entrega

`npm run lint`, `npm test` y `npm run build` deben pasar. Confirmar rutas bajo el base de Pages, ausencia de errores de consola, cleanup, documentación alineada y una revisión visual contra `VISUAL_SPEC.md`.

## Reauditoría técnica V2 — 2026-09-29

Alcance: segunda inspección estática después de las correcciones, pruebas unitarias en Node y build de producción. No incluye todavía navegador con GPU, touch físico, perfilado FPS/memoria ni las capturas visuales de aceptación.

### Resultado de gates

| Gate | Resultado | Evidencia |
|---|---|---|
| ESLint | PASS | `npm run lint`, sin errores |
| Vitest | PASS | 6 archivos y 28 pruebas aprobadas |
| Build | PASS con advertencia | 88 módulos; JS 944.85 kB (258.19 kB gzip); chunk superior a 500 kB |
| Assets V2 | PASS | 3 WebP = 1,004,882 bytes; fuente local = 362,736 bytes |
| Revisión visual multidispositivo | PENDIENTE | Requiere navegador/GPU y capturas frontal, superior, laterales, baja, móvil, tablet y 1920×1080 |

### Hallazgos resueltos

- **CTA inicial:** el botón registra click y activa la transición de introducción; también libera su listener en `dispose()`.
- **Timers narrativos:** `messageTimer` se reemplaza, cancela en `restart()` y cancela en `destroy()`.
- **Gobernador de calidad:** al degradar actualiza DPR, postprocesado, agujero negro, draw range de estrellas/polvo/destellos, cantidad de instancias y textos visibles.
- **Catálogo:** contiene 96 cartas únicas — 66 flores/ramos y 30 frases — y valida enums de tipo, calidad y fuente.
- **Troika:** fuente local y precarga esperada antes de construir/habilitar los textos espaciales.
- **Cámara:** los intervalos cruzados se normalizan; las 28 pruebas, incluida coherencia de zoom/polar, pasan.
- **Assets:** el cargador prioriza los atlas WebP; los tres recursos V2 suman aproximadamente 0.96 MiB.
- **Cleanup:** UI, audio, blob URLs, timeouts, controles, geometrías, materiales, postprocesado y eventos principales tienen rutas de liberación.
- **Foco:** las flores/ramos escalan 16 %, la cámara retorna a la pose guardada y la carta restaura el foco previo.
- **Carta:** botón, `Esc` y toque exterior cierran la carta; el listener global se elimina al disponer.
- **Allocations de centrado:** `CameraRig` reutiliza los vectores usados por el tween.

### Hallazgos abiertos

#### HIGH

- **H-01 — LOW y MEDIUM no pueden alcanzar su cantidad configurada de frases.** La asignación de `minimumQuality` deja solo 3 frases disponibles en LOW y 9 en MEDIUM, aunque los perfiles solicitan 14 y 20 respectivamente. HIGH dispone de 30 y renderiza 24. Esto reduce de forma visible la composición espacial en equipos de menor calidad. Evidencia: `src/data/contentCatalog.js:5`, `src/core/App.js:15`, `src/config/performanceProfiles.js:2-4`. Reproducción Node: LOW `{flowers:39, phrases:3}`, MEDIUM `{flowers:63, phrases:9}`, HIGH `{flowers:66, phrases:30}`.

#### MEDIUM

- **M-01 — Reiniciar desde una carta enfocada no restaura la matriz de la instancia.** `restart()` cierra la carta, pero no llama `flowers.focus(this.selected, false)` ni limpia `selected`. La flor queda escalada 1.16 y, tras seleccionar otra, el estado de restauración anterior se pierde. Evidencia: `src/core/App.js:28-34`, `src/objects/FlowerInstanceSystem.js:37`.
- **M-02 — El foco floral no implementa glow selectivo.** La escala de 16 % ya está implementada, pero el shader mantiene el mismo glow para todas las instancias. Evidencia: `src/objects/FlowerInstanceSystem.js:12-14,37`.
- **M-03 — Falta el gesto de cierre hacia abajo en móvil.** La carta sí cierra mediante botón, `Esc` y toque exterior, pero no registra un gesto vertical. Evidencia: `src/ui/QuoteOverlay.js:1-6`.
- **M-04 — El diálogo modal no contiene el foco.** Se restaura el elemento previo al cerrar, pero `aria-modal="true"` no va acompañado por un focus trap mientras la carta está abierta. Evidencia: `src/ui/QuoteOverlay.js:2-4`.
- **M-05 — Falta verificación real de rendimiento y memoria.** El código permite degradación sin reconstrucción, pero aún se debe demostrar 30/45/60 FPS y tres reinicios sin crecimiento sostenido en GPU/dispositivos objetivo.

#### LOW

- **L-01 — `pointercancel` no invalida la intención de tap.** Se registran `pointerdown` y `pointerup`, pero no cancelación; una interrupción táctil puede reutilizar coordenadas antiguas. Evidencia: `src/core/App.js:20`.
- **L-02 — El bundle conserva una advertencia de tamaño.** El JS minificado mide 944.85 kB (258.19 kB gzip). No rompe el presupuesto total observado, pero Vite recomienda dividir el chunk por superar 500 kB.

### Aspectos conformes revalidados

- Layout y PRNG deterministas, sin estado acumulado.
- Migración V1 → V2 conserva contenido, audio, bloom, exposición, tiempos y densidades sin mutar la entrada.
- Dos `InstancedMesh` cubren la población floral y mantienen bajo el número de draw calls.
- Raycasting limitado al registro interactivo.
- Sin allocations observadas en el render loop estable; las allocations de selección/transición no ocurren continuamente.
- `resize()` actualiza renderer, cámara, composer, lensing y pixel ratio de partículas.
- Reduced motion desactiva auto-rotación y acorta viajes/foco, manteniendo navegación manual.

### Criterio de salida QA

Estado técnico automatizado: **APROBADO** (`lint`, 28 pruebas y build pasan). Tras esta reauditoría se corrigieron además los hallazgos H-01 y M-01–M-04: LOW dispone de 14 frases, MEDIUM de 22 y HIGH de 30; reinicio restaura la instancia; el shader añade glow selectivo; la carta soporta swipe-down y focus trap; `pointercancel` invalida el tap. El smoke test en Edge móvil simulado completó `INTRO → UNIVERSE`, habilitó órbita, abrió/cerró una carta única, restauró cámara y ejecutó drag sin errores de consola. El bundle quedó dividido en `index`, `text-engine`, `motion-ui` y `three-engine`; el mayor mide 527.45 kB (131.86 kB gzip). Permanece como validación física recomendada medir FPS/memoria y revisar Safari/dispositivos táctiles reales.
