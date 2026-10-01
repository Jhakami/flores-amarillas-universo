/* global AbortController, URL, clearTimeout, fetch, setTimeout */

const MAX_URL_LENGTH = 2048;
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
]);
const SHORT_HOSTS = new Set(['youtu.be', 'www.youtu.be']);
const THUMBNAIL_HOST_PATTERN = /(^|\.)ytimg\.com$/;
const OEMBED_ENDPOINT = 'https://www.youtube.com/oembed';
const UPSTREAM_TIMEOUT_MS = 4500;

export class YouTubeUrlError extends Error {
  constructor(message, code = 'INVALID_YOUTUBE_URL') {
    super(message);
    this.name = 'YouTubeUrlError';
    this.code = code;
  }
}

function assertVideoId(value) {
  if (!VIDEO_ID_PATTERN.test(value ?? '')) {
    throw new YouTubeUrlError('El enlace no contiene un ID de video válido.');
  }
  return value;
}

export function extractYouTubeVideoId(input) {
  if (typeof input !== 'string' || input.length === 0 || input.length > MAX_URL_LENGTH) {
    throw new YouTubeUrlError('La URL de YouTube es obligatoria o excede el límite permitido.');
  }

  let parsed;
  try {
    parsed = new URL(input.trim());
  } catch {
    throw new YouTubeUrlError('La URL de YouTube no es válida.');
  }

  if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.port) {
    throw new YouTubeUrlError('La URL debe usar HTTP o HTTPS y no incluir credenciales ni puertos.');
  }

  const hostname = parsed.hostname.toLowerCase();
  if (SHORT_HOSTS.has(hostname)) {
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length !== 1) {
      throw new YouTubeUrlError('El enlace corto de YouTube no tiene un formato válido.');
    }
    return assertVideoId(segments[0]);
  }

  if (!YOUTUBE_HOSTS.has(hostname)) {
    throw new YouTubeUrlError('El dominio debe ser youtube.com o youtu.be.');
  }

  if (parsed.pathname === '/watch') {
    return assertVideoId(parsed.searchParams.get('v'));
  }

  const match = parsed.pathname.match(/^\/(?:shorts|embed)\/([^/]+)\/?$/);
  if (match) return assertVideoId(match[1]);

  throw new YouTubeUrlError('El formato del enlace de YouTube no es compatible.');
}

function sanitizeText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/\p{Cc}/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function sanitizeThumbnail(value, videoId) {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && THUMBNAIL_HOST_PATTERN.test(url.hostname.toLowerCase())) {
      return url.toString();
    }
  } catch {
    // A deterministic YouTube-owned fallback avoids passing arbitrary upstream URLs to clients.
  }
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function sanitizeYouTubeMetadata(payload, videoId) {
  const title = sanitizeText(payload?.title, 200);
  const author = sanitizeText(payload?.author_name, 120);
  if (!title || !author) throw new Error('La respuesta de YouTube no contiene metadatos válidos.');

  return {
    videoId,
    title,
    author,
    thumbnail: sanitizeThumbnail(payload?.thumbnail_url, videoId),
  };
}

function sendJson(response, status, body, cacheControl = 'no-store') {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', cacheControl);
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.end(JSON.stringify(body));
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return sendJson(response, 405, { error: 'METHOD_NOT_ALLOWED', message: 'Solo se permite GET.' });
  }

  const input = Array.isArray(request.query?.url) ? null : request.query?.url;
  let videoId;
  try {
    videoId = extractYouTubeVideoId(input);
  } catch (error) {
    const message = error instanceof YouTubeUrlError ? error.message : 'La URL de YouTube no es válida.';
    return sendJson(response, 400, { error: 'INVALID_YOUTUBE_URL', message });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const endpoint = new URL(OEMBED_ENDPOINT);
    endpoint.searchParams.set('url', `https://www.youtube.com/watch?v=${videoId}`);
    endpoint.searchParams.set('format', 'json');

    const upstream = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (upstream.status === 404 || upstream.status === 401 || upstream.status === 403) {
      return sendJson(response, 404, {
        error: 'VIDEO_UNAVAILABLE',
        message: 'El video no existe, es privado o no permite compartir sus metadatos.',
      }, 'public, max-age=60, s-maxage=300');
    }
    if (!upstream.ok) throw new Error(`YouTube oEmbed respondió ${upstream.status}`);

    const raw = await upstream.json();
    const metadata = sanitizeYouTubeMetadata(raw, videoId);
    return sendJson(response, 200, metadata, 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
  } catch (error) {
    const timedOut = error?.name === 'AbortError';
    return sendJson(response, timedOut ? 504 : 502, {
      error: timedOut ? 'YOUTUBE_TIMEOUT' : 'YOUTUBE_UPSTREAM_ERROR',
      message: timedOut
        ? 'YouTube tardó demasiado en responder. Inténtalo nuevamente.'
        : 'No fue posible consultar los metadatos de YouTube.',
    });
  } finally {
    clearTimeout(timeout);
  }
}
