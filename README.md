# Universo de Flores Amarillas V3

Aplicación web para crear y compartir un universo romántico personalizado. Cada regalo combina una experiencia WebGL 360°, una carta, 18 elementos interactivos y una canción de YouTube. No requiere cuentas ni base de datos: los datos del regalo viajan en una URL comprimida con vencimiento.

La experiencia está construida con JavaScript modular, Vite, Three.js, GLSL, GSAP, Troika Three Text y Tweakpane. V3 añade un router del lado del cliente, creación de regalos, reproducción visible de YouTube y una función serverless de metadatos.

> V3 no es una aplicación completamente “sin backend”. No usa una base de datos ni un servidor persistente, pero sí incluye la función serverless `GET /api/youtube-metadata`, desplegada en Vercel.

## Rutas

| Ruta | Función |
|---|---|
| `/` | Presentación y accesos para crear o ver una demostración. |
| `/crear` | Formulario de personalización y vista previa de YouTube. |
| `/demo` | Universo de demostración sin payload personalizado. |
| `/gift/:token` | Decodifica y valida un regalo contenido en la URL. |
| `/api/youtube-metadata?url=...` | Valida un enlace y obtiene título, canal y miniatura mediante YouTube oEmbed. |

El router es ligero y se implementa en `src/main.js`. En Vercel, `vercel.json` reescribe todas las rutas que no empiezan por `/api/` hacia `index.html`, por lo que una URL de regalo puede abrirse y recargarse directamente.

## Crear y compartir un regalo

En `/crear` se solicitan:

- nombre del destinatario y del remitente;
- título o dedicatoria;
- carta personal de hasta 800 caracteres;
- un enlace obligatorio de YouTube;
- vencimiento de 1 hora, 6 horas, 1 día, 3 días o 7 días;
- colección de frases originales, clásicas o combinadas;
- personalización opcional de hasta 18 tarjetas.

El enlace de YouTube se valida y se consulta en `/api/youtube-metadata`. La interfaz enseña miniatura, título y canal, pero la URL original no se guarda en el regalo: el payload conserva únicamente `videoId` y metadatos saneados.

Al enviar el formulario, `GiftValidator` normaliza el payload y `GiftCodec` lo serializa como JSON, lo comprime con gzip cuando el navegador admite `CompressionStream` y lo codifica como Base64URL. El token resultante se inserta en `/gift/:token` y tiene un límite de 8 KB. El regalo funciona en otro dispositivo sin `localStorage` porque toda la información está en la URL.

La expiración se comprueba localmente al decodificar. Un token vencido, dañado, demasiado grande o de una versión desconocida muestra una pantalla accesible y no inicia WebGL. La fecha no está firmada criptográficamente; este mecanismo limita la vida útil normal del enlace, pero no pretende impedir que una persona técnica modifique su propio token.

## Música y carta cinematográfica

Dentro del universo personalizado se muestra una tarjeta con miniatura, título, canal e icono de acción; nunca muestra la URL original. Al activarla mediante un gesto del usuario:

1. se abre una carta modal sobre el universo, sin reconstruir la escena Three.js;
2. aparece un reproductor real y visible de YouTube junto a la nota;
3. se intenta iniciar la reproducción como consecuencia de ese gesto;
4. al cerrar con el botón, el fondo o `Esc`, se guarda la posición, se pausa el video y se oculta el reproductor;
5. al abrir de nuevo, la reproducción continúa desde la posición guardada.

No existe audio oculto de YouTube cuando la carta está cerrada. El reproductor usa `youtube-nocookie.com`, una única instancia por regalo y controles visibles. Si el navegador bloquea la reproducción automática posterior al gesto, los controles visibles permiten iniciarla manualmente.

## Desarrollo local

Requisitos: Node.js 20 o posterior, npm 10 o posterior y un navegador moderno con WebGL.

~~~bash
git clone https://github.com/Jhakami/flores-amarillas-universo.git
cd flores-amarillas-universo
npm install
npm run dev
~~~

Vite sirve normalmente la aplicación en `http://localhost:5173/`. El comando ya incluye `--host 0.0.0.0`, por lo que también puede abrirse desde otro dispositivo de la misma red usando la IPv4 del computador.

### Metadatos de YouTube en desarrollo

`npm run dev` ejecuta Vite, no las funciones serverless de `api/`. En ese modo, `/crear` usa un fallback **solo de desarrollo** si la petición a `/api/youtube-metadata` falla: conserva el ID validado y muestra datos genéricos con una miniatura determinista de YouTube. Ese fallback no comprueba que el video exista o permita compartir sus metadatos.

Para probar el flujo real de la API localmente, instala/inicia sesión en Vercel CLI y ejecuta desde la raíz del proyecto:

~~~bash
npx vercel dev
~~~

Usa la URL que anuncie Vercel CLI. Así se ejecutan `api/youtube-metadata.js`, los rewrites y la aplicación en el mismo origen.

## Comandos de verificación

| Comando | Función |
|---|---|
| `npm run dev` | Vite con recarga automática y fallback local de metadatos. |
| `npx vercel dev` | Aplicación y función real de metadatos en local. |
| `npm run lint` | ESLint sobre código y pruebas. |
| `npm test` | Pruebas unitarias con Vitest. |
| `npm run build` | Build optimizado en `dist/`. |
| `npm run preview` | Vista local del build estático; no ejecuta la función API. |

Antes de desplegar:

~~~bash
npm run lint
npm test
npm run build
~~~

## Despliegue

Vercel es el destino principal de V3. Detecta el build de Vite, publica `dist/`, ejecuta la función `api/youtube-metadata.js` y aplica los rewrites y encabezados de `vercel.json`. La política CSP limita scripts, frames, imágenes y conexiones a los orígenes necesarios, incluidos YouTube y `youtube-nocookie.com`.

El despliegue existente en GitHub Pages puede mantenerse como respaldo durante la validación, pero Pages solo sirve archivos estáticos: no ejecuta `/api/youtube-metadata`. Para validar V3 completa se debe usar una Preview de Vercel y probar rutas directas, recargas de `/gift/:token`, móvil, escritorio y videos no disponibles.

## Arquitectura y contenido

- [Arquitectura V3](docs/ARCHITECTURE_V3.md)
- [Fuentes literarias](docs/LITERARY_SOURCES.md)
- [Arquitectura V2](docs/ARCHITECTURE_V2.md)
- [Decisiones V2](docs/DECISIONS_V2.md)
- [Rendimiento](docs/PERFORMANCE.md)
- [QA](docs/QA.md)

Las tarjetas clásicas se identifican como `public-domain` y deben conservar autor, obra y fuente verificable. Los textos contemporáneos o inspirados se marcan como `original` y no se atribuyen a autores históricos.

## Accesibilidad y controles

- El inicio y la reproducción requieren un gesto del usuario.
- La carta es un diálogo modal con foco inicial, ciclo de tabulación y cierre mediante `Esc`.
- Hay foco visible, nombres accesibles y soporte para `prefers-reduced-motion`.
- El universo puede orbitarse mediante arrastre, rueda o gesto de pellizco.
- Las flores, ramos y frases abren tarjetas independientes.
- Si WebGL no está disponible, se muestra un fallback textual.
