# Arquitectura de Universo de Flores Amarillas V3

## Objetivo y límites

V3 convierte la experiencia Three.js en una aplicación de regalos compartibles. Mantiene una sola escena WebGL y un solo ciclo de renderizado, y añade páginas HTML accesibles para presentación y creación. No usa React, cuentas, almacenamiento remoto ni base de datos.

La aplicación sí tiene una pieza de backend: una función serverless de Vercel que consulta metadatos públicos de YouTube. El regalo, en cambio, no se guarda en el servidor; viaja por completo dentro de su URL.

## Mapa de rutas

`src/main.js` calcula la ruta respecto de `import.meta.env.BASE_URL` y selecciona uno de estos flujos:

| Ruta | Renderizado | Dependencias principales |
|---|---|---|
| `/` | Landing HTML | `showLanding` |
| `/crear` | Formulario HTML | `GiftForm`, `GiftCodec`, API de metadatos |
| `/demo` | Escena WebGL predeterminada | `App`, `contentCatalog` |
| `/gift/:token` | Escena WebGL personalizada | `GiftCodec`, `GiftValidator`, `PersonalizedCatalog`, `App` |
| `/api/youtube-metadata` | JSON serverless | YouTube oEmbed oficial |

Una ruta desconocida y cualquier error de decodificación muestran un estado accesible sin iniciar la experiencia. `vercel.json` excluye `/api/` del rewrite SPA y envía las demás rutas a `index.html`.

## Flujo de creación

~~~text
GiftForm
  → parseYouTubeUrl (validación temprana)
  → GET /api/youtube-metadata?url=...
  → miniatura + título + canal saneados
  → createGiftPayload
  → GiftValidator
  → JSON
  → gzip mediante CompressionStream (si está disponible)
  → Base64URL
  → /gift/:token
~~~

El formulario permite nombres, dedicatoria, carta, vencimiento, colección de frases y edición avanzada de tarjetas. YouTube es obligatorio. La URL original se usa para resolver metadatos, pero `normalizeYouTube` produce exclusivamente:

~~~js
{
  videoId,
  title,
  author,
  thumbnail
}
~~~

El payload validado tiene la forma:

~~~js
{
  version: 1,
  recipient,
  sender,
  dedication,
  letter,
  expiresAt,
  youtube,
  quotePack,
  cards,
  visualPreset
}
~~~

## Codec, tamaño y expiración

`GiftCodec.encodeCompressed` valida antes de serializar. Cuando existe `CompressionStream`, comprime el JSON con gzip y crea un token prefijado por `z.`. Si la API no existe, crea un token JSON Base64URL prefijado por `j.`. El decodificador también admite el formato Base64URL sin prefijo para compatibilidad.

El token está limitado a 8 KiB medidos como UTF-8. `GiftValidator` limita además campos individuales, la carta a 800 caracteres, las personalizaciones a 18 tarjetas y el vencimiento seleccionable a un máximo de 7 días.

Al abrir `/gift/:token`, `decodeCompressed` descomprime, parsea y vuelve a validar. `expiresAt <= Date.now()` produce `EXPIRED`; la interfaz informa que el regalo venció y no crea `App`. La expiración no tiene firma y debe entenderse como una restricción funcional, no como un control antifalsificación.

## Función de metadatos de YouTube

`api/youtube-metadata.js` acepta únicamente `GET`. Sus pasos son:

1. rechazar URLs vacías, excesivas, con credenciales, puerto o dominio no permitido;
2. extraer un ID de 11 caracteres de `youtube.com/watch`, `/shorts`, `/embed` o `youtu.be`;
3. construir internamente una URL canónica;
4. consultar `https://www.youtube.com/oembed` con timeout;
5. limitar y sanear título y autor;
6. permitir miniaturas HTTPS de `ytimg.com` o usar una miniatura determinista;
7. responder JSON con políticas de caché diferenciadas.

La función devuelve errores estructurados para método no permitido, URL inválida, video no disponible, timeout y fallo upstream. No usa una clave de YouTube ni acepta destinos arbitrarios, lo que reduce el riesgo de SSRF.

Con `vite` puro la ruta API no existe. `resolveYouTube` solo en `import.meta.env.DEV` recurre a un fallback con el ID ya validado, título/canal genéricos y miniatura de YouTube. Para probar la función real y los rewrites debe usarse `vercel dev`.

## Apertura de un regalo

~~~text
/gift/:token
  → GiftCodec.decodeCompressed
  → GiftValidator
  → createPersonalizedCatalog (18 entradas)
  → App({ gift, catalog, initialConfig })
  → escena y UI personalizadas
~~~

`createPersonalizedCatalog` clona cada tarjeta para evitar referencias compartidas. Coloca primero las tarjetas personalizadas, completa hasta 18 según `quotePack` y fuerza `minimumQuality: LOW` para que las 18 permanezcan disponibles incluso en el perfil de rendimiento bajo. La dedicatoria, el remitente y el destinatario también se integran en la introducción y el contenido espacial.

## Carta y ciclo de vida de YouTube

`App` crea exactamente una instancia de `YouTubePlayerController`, una `CinematicLetter` y una `MusicMetadataCard` para un regalo. La tarjeta compacta enseña los metadatos, no un iframe ni la URL.

~~~text
toque en tarjeta
  → CinematicLetter.open
  → reproductor visible
  → loadVideoById(startSeconds: posición guardada)
  → playVideo

cerrar / fondo / Esc
  → getCurrentTime
  → pauseVideo
  → ocultar reproductor
  → restaurar foco
~~~

La carta no detiene ni reconstruye el bucle WebGL. El iframe usa el host de privacidad mejorada `youtube-nocookie.com`, `playsinline` y controles visibles. El controlador conserva la posición en memoria mientras la página siga abierta. Al destruir `App`, detiene el video, destruye el reproductor y elimina sus nodos.

Este contrato es deliberado: no se reproduce audio de YouTube con el reproductor oculto. Al cerrar la carta, el video queda pausado. Al reabrir, busca la posición guardada y vuelve a reproducir como consecuencia del nuevo gesto.

## Capas principales

~~~text
main.js (router y composición por ruta)
├─ páginas: landing + GiftForm + estados de error
├─ gift: parser + validator + codec + catálogo personalizado
├─ core/App: escena, estado, UI y ciclo de vida
│  ├─ experience + objects + shaders + postprocessing
│  ├─ interactions + cámara + raycasting
│  └─ MusicMetadataCard + CinematicLetter + YouTubePlayerController
└─ api/youtube-metadata.js (función serverless aislada)
~~~

## Seguridad y privacidad

- La URL original de YouTube se descarta del payload.
- Los tokens son codificados, no cifrados: quien reciba el enlace puede decodificar su contenido.
- No deben incluirse secretos ni datos sensibles en una carta.
- La CSP de Vercel permite únicamente los orígenes necesarios para aplicación, fuentes, miniaturas e iframe de YouTube.
- `frame-ancestors 'none'`, `X-Frame-Options: DENY` y una política de permisos reducida limitan capacidades no utilizadas.
- Los metadatos externos se insertan mediante `textContent`; no se interpretan como HTML.

## Desarrollo, pruebas y despliegue

Para la interfaz y WebGL:

~~~bash
npm install
npm run dev
~~~

Para ejecutar también la función serverless:

~~~bash
npx vercel dev
~~~

`npm run preview` sirve `dist/`, pero tampoco emula `api/`. La verificación mínima antes de una Preview de Vercel es:

~~~bash
npm run lint
npm test
npm run build
~~~

Las pruebas cubren extracción de IDs, rechazo de dominios falsos, saneamiento de metadatos, consulta exclusiva a oEmbed, payload UTF-8, token corrupto, versión desconocida, expiración, límites, 18 tarjetas independientes y pausa/reanudación del controlador.

En Vercel se debe validar además la recarga directa de todas las rutas, la API contra videos públicos y no disponibles, la reproducción tras un gesto, la pausa al cerrar, móvil, escritorio y CSP. GitHub Pages puede conservarse como respaldo estático, pero no ofrece la función serverless y por sí solo no representa el flujo completo de V3.

