const originals = [
  ['Tu luz encontró un lugar en este universo.', 'Hay personas que no llegan para ocupar un espacio, sino para encenderlo. Esta flor guarda ese instante en que todo empezó a verse más cálido.'],
  ['La casualidad más bonita', 'Entre millones de caminos posibles, el mío tuvo la fortuna de cruzarse con el tuyo.'],
  ['Mi estación favorita', 'Si estás cerca, cualquier día puede sentirse como primavera.'],
  ['Constelación secreta', 'Hay una forma de mirarte que convierte hasta el silencio en una constelación.'],
  ['Para cuando dudes', 'Guarda esta pequeña luz: incluso en tus noches más largas sigues siendo alguien extraordinario.'],
  ['Una travesura del destino', 'Tal vez el destino solo quería divertirse cuando decidió que iba a encontrarte y ya no podría olvidarte.'],
  ['Quédate un poco más', 'No hace falta detener el tiempo; basta con que algunos minutos lleven tu nombre.'],
  ['La flor que elegiría', 'Si pudiera escoger una flor entre todas, elegiría la que se parece a tu manera de iluminar.'],
  ['Cerca de ti', 'La distancia se vuelve pequeña cuando alguien vive con tanta fuerza en nuestros pensamientos.'],
  ['Una promesa amarilla', 'Que nunca nos falten motivos para volver, palabras sinceras y flores después de la lluvia.'],
  ['El centro de mi universo', 'No eres el mundo entero, pero haces que el mío encuentre su órbita.'],
  ['Luz en movimiento', 'Hay afectos que no se quedan quietos: crecen, viajan y aprenden a florecer.'],
  ['Donde floreces', 'Donde floreces tú, el universo aprende a tener luz.'],
  ['Siempre', 'A veces una sola palabra alcanza para guardar todo lo que todavía queremos vivir.'],
  ['Mi lugar favorito', 'No es un sitio en el mapa; es ese momento sencillo en el que te siento cerca.'],
  ['Una noche blanca', 'La noche parecía interminable hasta que una conversación le enseñó a amanecer.'],
  ['Órbita compartida', 'No quiero atraparte: quiero aprender la hermosa gravedad de caminar a tu lado.'],
  ['Flor de septiembre', 'Llegaste con la delicadeza de una flor y la fuerza tranquila de toda una estación.'],
  ['Lo que permanece', 'Las cosas verdaderas no siempre hacen ruido; a veces brillan despacio y se quedan.'],
  ['Para ti', 'Este universo no intenta ser infinito. Solo intenta decirte algo que cabe en una flor.'],
  ['Luz en mi vida', 'Incluso un día común puede volverse memorable cuando tu risa lo atraviesa.'],
  ['El hilo dorado', 'Quizá todas nuestras casualidades estaban unidas por un hilo que solo ahora podemos ver.'],
  ['Volver a encontrarte', 'Si las estrellas cambiaran de lugar, aprendería el cielo de nuevo para llegar a ti.'],
  ['Gracias por existir', 'Entre todas las maravillas posibles, agradezco especialmente la coincidencia de compartir este tiempo contigo.'],
];

const types = ['sunflower', 'sunflower', 'bouquet', 'phrase'];
const entries = originals.map(([title, body], index) => Object.freeze({
  id: `memory-${String(index + 1).padStart(2, '0')}`,
  type: types[index % types.length], assetVariant: index % 8,
  label: index % 4 === 3 ? title : title.split(' ').slice(0, 4).join(' '),
  card: Object.freeze({ title, body, author: 'Texto original', work: '', sourceType: 'original' }),
  minimumQuality: index > 19 ? 'HIGH' : index > 13 ? 'MEDIUM' : 'LOW',
}));

export class ContentCatalog {
  constructor(customEntries = entries) { this.entries = Object.freeze([...customEntries]); this.byId = new Map(this.entries.map(entry => [entry.id, entry])); }
  get(id) { return this.byId.get(id) ?? null; }
  list(quality = 'HIGH') { const rank = { LOW: 0, MEDIUM: 1, HIGH: 2 }; return this.entries.filter(entry => rank[entry.minimumQuality] <= rank[quality]); }
  validate() { const ids = new Set(); return this.entries.every(entry => { if (!entry.id || ids.has(entry.id) || !entry.card?.title || !entry.card?.body || !['original', 'public-domain'].includes(entry.card.sourceType)) return false; ids.add(entry.id); return true; }); }
}

export const contentCatalog = new ContentCatalog();
