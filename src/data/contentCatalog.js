import { ContentCatalog as BaseCatalog, contentCatalog as baseCatalog } from './contentCatalogBase.js';

const openings = ['Una luz tranquila','Un recuerdo dorado','La órbita más bonita','Un instante contigo','Una pequeña certeza','La flor que vuelve','Un cielo compartido','Ese brillo tuyo','Una dulce casualidad','El lugar del encuentro','Una promesa sencilla','La ruta de las estrellas'];
const endings = ['me recuerda que la ternura también puede ser una forma de valentía.','dice que hay personas capaces de volver extraordinario un día común.','guarda todo lo que a veces el corazón no consigue decir en voz alta.','existe para recordarte que tu presencia deja luz incluso cuando te marchas.','nació de la idea de que encontrarte fue una de esas coincidencias que merecen celebrarse.','quiere acompañarte cuando necesites una razón pequeña para sonreír.'];
const extras = Array.from({length:72},(_,index)=>{const chapter=Math.floor(index/12)+1,phrase=index>=48,phraseIndex=index-48;const title=`${openings[index%openings.length]} · ${chapter}`;const minimumQuality=phrase?(phraseIndex<11?'LOW':phraseIndex<17?'MEDIUM':'HIGH'):(index>=28?'MEDIUM':'LOW');return Object.freeze({id:`memory-${String(index+25).padStart(2,'0')}`,type:phrase?'phrase':(index%4===0?'bouquet':'sunflower'),assetVariant:index%8,label:phrase?openings[index%openings.length]:title,card:Object.freeze({title,body:`Esta flor ${endings[(index+chapter)%endings.length]}`,author:'Texto original',work:'Universo de Flores Amarillas',sourceType:'original'}),minimumQuality});});
const classicalSources = [
  ['Poesía eres tú','Poesía... eres tú.','Gustavo Adolfo Bécquer','Rima XXI'],
  ['Una pregunta azul','¿Qué es poesía? dices mientras clavas en mi pupila tu pupila azul.','Gustavo Adolfo Bécquer','Rima XXI'],
  ['La rosa junto al corazón','¿Cómo vive esa rosa que has prendido junto a tu corazón?','Gustavo Adolfo Bécquer','Rima XXII'],
  ['Sobre el volcán, la flor','Nunca hasta ahora contemplé en la tierra sobre el volcán la flor.','Gustavo Adolfo Bécquer','Rima XXII'],
  ['Por una mirada','Por una mirada, un mundo.','Gustavo Adolfo Bécquer','Rima XXIII'],
  ['Por una sonrisa','Por una sonrisa, un cielo.','Gustavo Adolfo Bécquer','Rima XXIII'],
  ['Por un beso','Por un beso... ¡yo no sé qué te diera por un beso!','Gustavo Adolfo Bécquer','Rima XXIII'],
  ['Una rosa blanca','Cultivo una rosa blanca.','José Martí','Versos sencillos, XXXIX'],
  ['En julio como en enero','En julio como en enero.','José Martí','Versos sencillos, XXXIX'],
  ['Para el amigo sincero','Para el amigo sincero que me da su mano franca.','José Martí','Versos sencillos, XXXIX'],
  ['La flor elegida','Cardo ni ortiga cultivo; cultivo la rosa blanca.','José Martí','Versos sencillos, XXXIX'],
  ['Detente, sombra','Detente, sombra de mi bien esquivo.','Sor Juana Inés de la Cruz','Detente sombra'],
  ['El hechizo que más quiero','Imagen del hechizo que más quiero.','Sor Juana Inés de la Cruz','Detente sombra'],
  ['Bella ilusión','Bella ilusión por quien alegre muero.','Sor Juana Inés de la Cruz','Detente sombra'],
  ['Dulce ficción','Dulce ficción por quien penosa vivo.','Sor Juana Inés de la Cruz','Detente sombra'],
  ['Mi llama','Nadar sabe mi llama el agua fría.','Francisco de Quevedo','Amor constante más allá de la muerte'],
  ['Ceniza con sentido','Serán ceniza, mas tendrá sentido.','Francisco de Quevedo','Amor constante más allá de la muerte'],
  ['Polvo enamorado','Polvo serán, mas polvo enamorado.','Francisco de Quevedo','Amor constante más allá de la muerte'],
].map(([title,body,author,work],index)=>Object.freeze({id:`classic-${String(index+1).padStart(2,'0')}`,type:index%4===3?'phrase':(index%5===0?'bouquet':'sunflower'),assetVariant:index%8,label:title,card:Object.freeze({title,body,author,work,sourceType:'public-domain'}),minimumQuality:'LOW'}));
export class ContentCatalog extends BaseCatalog {
  validate(){const ids=new Set(),types=new Set(['sunflower','bouquet','phrase']),qualities=new Set(['LOW','MEDIUM','HIGH']);return this.entries.every(entry=>{if(!entry.id||ids.has(entry.id)||!types.has(entry.type)||!qualities.has(entry.minimumQuality)||!entry.card?.title||!entry.card?.body||!['original','public-domain'].includes(entry.card.sourceType))return false;ids.add(entry.id);return true;});}
}
export const contentCatalog = new ContentCatalog([...baseCatalog.entries,...classicalSources,...extras]);
