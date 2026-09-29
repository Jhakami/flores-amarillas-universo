# Especificación visual

## Intención

Romántica, etérea, cósmica, nostálgica, elegante y misteriosa. La flor es la materia prima del universo. Evitar estética infantil, arcade, neón excesivo, interfaz de red social o landing page.

## Paleta

| Uso | Color |
|---|---|
| Vacío | `#000000`, `#020205` |
| Luz cálida | `#FFFFFF`, `#FFFCEA`, `#FFFBD0` |
| Amarillo | `#FFF200`, `#FFE000`, `#FFD000` |
| Oro | `#FFB700`, `#FFB800` |
| Texto tenue | `#EAD885` |

## Tipografía

- Mensaje ceremonial: Great Vibes o equivalente manuscrita legible.
- Invitación y frases: Cormorant Garamond.
- Controles y autor: Inter o sans-serif del sistema.
- Frases: 24–30 px móvil; 30–38 px escritorio.

## Composición y escala

El girasol ocupa 22–32 % de la altura móvil y 18–24 % en escritorio. Se centra con pequeñas asimetrías de partículas. El agujero negro aparece inicialmente distante y nunca domina hasta completar su reveal. Las flores forman clusters con vacíos deliberados, distintas profundidades y algunas parcialmente fuera del encuadre.

## Movimiento

- Girasol: respiración 0.985–1.015 en 3–4 s y flotación visual máxima de 4–8 px.
- Cámara: trayectoria dirigida; parallax pequeño y amortiguado, nunca cámara libre.
- Disco: rotación lenta, bandas con velocidades diferenciadas, sin apariencia de hélice.
- Partículas: dispersión luminosa orgánica, no explosión violenta.
- Reduced motion conserva significado y secuencia, reduciendo distancia, velocidad y amplitud.

## Luz, profundidad y efectos

Usar ACES Filmic con exposición inicial 1.1. Bloom base: strength 1.35, radius 0.48, threshold 0.24. Priorizar photon ring, disco, pétalos y estrellas principales; UI y horizonte no deben quemarse. Viñeta y grano son apenas perceptibles. La profundidad se comunica mediante escala, nitidez, contraste, parallax y fog muy leve.

## Escenas

- Intro: negro dominante, una única luz central tenue y polvo dorado escaso.
- Morph: el foco sigue siendo la flor mientras su silueta se vuelve luz.
- Mensaje: integrado en el volumen, sin tarjeta ni pantalla aparte.
- Viaje: corredores estelares con clusters y zonas vacías, no un plano uniforme.
- Universo: agujero negro como ancla visual; flores equilibran diagonales y profundidad.
- Frase: cristal oscuro `rgba(5,5,8,.78)`, blur 16–24 px y borde dorado al 20 %.

## Revisión visual

Evaluar en este orden: jerarquía, composición, profundidad, contraste, escala, espaciado, bloom y atmósfera. Ningún efecto individual debe competir con el hilo narrativo.
