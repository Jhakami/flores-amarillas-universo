# Rendimiento

## Presupuestos

| Perfil | DPR máx. | Estrellas | Polvo | Lensing | Bloom |
|---|---:|---:|---:|---|---|
| LOW | 1.25 | 1,000–1,800 | ~500 | Off | Reducido |
| MEDIUM | 1.5–1.7 | 3,000–4,000 | 1,000–1,800 | Básico | Normal |
| HIGH | 2.0 | 8,000–15,000 | 2,000–4,000 | Completo | Completo |

La selección considera DPR, núcleos, memoria declarada, área de pantalla, interacción y reduced motion. Las APIs ausentes se tratan como información desconocida, no como dispositivo potente.

## Reglas del frame

- Cero arrays, geometrías, materiales, colores o vectores nuevos en loops calientes.
- Precalcular posiciones y semillas; reutilizar temporales.
- Actualizar uniforms y matrices, no buffers completos.
- Agrupar flores y partículas para minimizar draw calls.
- Pausar RAF y audio al ocultar la pestaña.
- Medir CPU y GPU por separado cuando sea posible.

## Degradación dinámica

Usar una media móvil, ignorar carga y transiciones deliberadamente pesadas, y degradar tras una ventana sostenida bajo 30 FPS. Orden: DPR, polvo, lensing, bloom, estrellas secundarias y complejidad de shader. Aplicar un solo escalón por ventana para evitar oscilación. No aumentar calidad durante la sesión salvo acción explícita.

## Resize y memoria

Limitar DPR antes de asignar targets. Reutilizar render targets si el tamaño no cambia. En resize actualizar renderer, composer, targets y uniforms. Cada owner libera geometrías, materiales, texturas, targets, timelines, object URLs, audio nodes y listeners.

## Instrumentación

Registrar perfil, DPR efectivo, promedio/p95 de frame time, draw calls, triángulos, texturas y degradaciones. No enviar telemetría externa. La auditoría manual debe usar Performance y Memory de DevTools con tres ciclos de reinicio.

## Criterio

Objetivo 60 FPS; mínimo funcional 30 FPS en el perfil adecuado. Una caída puntual durante compilación de shader es tolerable; una media sostenida menor a 30 FPS es `HIGH` o `BLOCKER` si impide la secuencia.
