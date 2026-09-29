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
