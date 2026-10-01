# Fuentes literarias de V3

## Política editorial

El catálogo distingue dos tipos de contenido:

- `original`: texto creado para el proyecto o por la persona que crea el regalo. No se atribuye a un autor histórico.
- `public-domain`: fragmento de una obra de dominio público con autor, obra y fuente verificable.

Una tarjeta clásica debe conservar `author`, `work` y `sourceType: "public-domain"`. Si el texto se adapta de forma sustancial o solo imita el estilo de un autor, se registra como original y no se presenta como cita literal.

Wikisource es la fuente de cotejo de las obras que siguen. Los enlaces y la correspondencia entre título, autor y texto se verificaron el 1 de octubre de 2026. Wikisource publica sus transcripciones bajo sus propios términos; el estado de dominio público indicado aquí corresponde a las obras originales de autores fallecidos hace más de un siglo, no a cualquier material editorial añadido por terceros.

## Gustavo Adolfo Bécquer — *Rimas*

Edición de referencia indicada por Wikisource: *Rimas* (1885).

| Obra | Identificación textual | Fuente verificada |
|---|---|---|
| Rima XXI | Comienza «¿Qué es poesía? dices mientras clavas…» | [Wikisource: Rima XXI](https://es.wikisource.org/wiki/Rimas_%28B%C3%A9cquer%2C_1885%29/Rima_XXI) |
| Rima XXII | Comienza «¿Cómo vive esa rosa que has prendido…» | [Wikisource: Rima XXII](https://es.wikisource.org/wiki/Rimas_%28B%C3%A9cquer%2C_1885%29/Rima_XXII) |
| Rima XXIII | Comienza «Por una mirada, un mundo…» | [Wikisource: Rima XXIII](https://es.wikisource.org/wiki/Rimas_%28B%C3%A9cquer%2C_1885%29/Rima_XXIII) |

Metadatos recomendados:

~~~js
{
  author: 'Gustavo Adolfo Bécquer',
  work: 'Rimas, Rima XXI', // o XXII / XXIII
  sourceType: 'public-domain'
}
~~~

## José Martí — *Versos sencillos*, XXXIX

El poema XXXIX es el de la rosa blanca y comienza «Cultivo una rosa blanca…».

- Autor: José Martí.
- Obra: *Versos sencillos*, XXXIX.
- Fuente: [Wikisource: Versos sencillos/XXXIX](https://es.wikisource.org/wiki/Versos_sencillos/XXXIX).
- Tipo: `public-domain`.

## Sor Juana Inés de la Cruz — *Detente, sombra*

El soneto comienza «Detente, sombra de mi bien esquivo…». Wikisource también lo identifica como obra de Sor Juana Inés de la Cruz.

- Autor: Sor Juana Inés de la Cruz.
- Obra: *Detente, sombra*.
- Fuente: [Wikisource: Detente sombra](https://es.wikisource.org/wiki/Detente_sombra).
- Tipo: `public-domain`.

## Francisco de Quevedo — *Amor constante más allá de la muerte*

El soneto comienza «Cerrar podrá mis ojos la postrera…» y concluye con la conocida imagen del «polvo enamorado».

- Autor: Francisco de Quevedo.
- Obra: *Amor constante más allá de la muerte*.
- Fuente: [Wikisource: Amor constante más allá de la muerte](https://es.wikisource.org/wiki/Amor_constante_m%C3%A1s_all%C3%A1_de_la_muerte).
- Tipo: `public-domain`.

## Checklist para añadir una cita

1. Abrir la obra completa o su página individual en una fuente textual fiable.
2. Comprobar autor, título, numeración y redacción exacta del fragmento.
3. Confirmar que la obra original está en dominio público en el territorio de publicación previsto.
4. Copiar solo el fragmento necesario y respetar ortografía y puntuación de la edición elegida, o declarar cualquier modernización.
5. Registrar `author`, `work`, `sourceType: "public-domain"` y el enlace de verificación en este documento.
6. Si no puede verificarse una atribución, usar texto original sin nombre de autor.

