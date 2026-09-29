# Universo de Flores Amarillas V2

La aplicación es una sola escena WebGL continua: oscuridad → girasol → partículas → título → viaje → universo 360° → agujero negro → exploración → cartas.

## Contratos

- La cámara orbita un centro controlado; no existe vuelo libre ni pan.
- La geometría del girasol sobrevive al morph y termina como campo estelar.
- El agujero negro conserva volumen desde cualquier ángulo.
- Flores, ramos y frases son objetos 3D interactivos con una carta única.
- LOW, MEDIUM y HIGH conservan la narrativa.
- Todo sistema WebGL libera geometrías, materiales, texturas, eventos y controles.

## Definition of Done

Se puede rodear el universo sin ver una lámina plana; touch, teclado y movimiento reducido son funcionales; no hay allocations evitables por frame; lint, pruebas y build finalizan sin errores.
