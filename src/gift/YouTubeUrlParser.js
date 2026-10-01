const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const MAX_URL_LENGTH = 500;

export class YouTubeUrlError extends Error {
  constructor(message, code = 'INVALID_YOUTUBE_URL') {
    super(message);
    this.name = 'YouTubeUrlError';
    this.code = code;
  }
}

const cleanVideoId = value => {
  const videoId = String(value ?? '').trim();
  if (!VIDEO_ID_PATTERN.test(videoId)) {
    throw new YouTubeUrlError('El enlace no contiene un identificador válido de YouTube.', 'INVALID_VIDEO_ID');
  }
  return videoId;
};

export const isYouTubeVideoId = value => VIDEO_ID_PATTERN.test(String(value ?? ''));

export function parseYouTubeUrl(input) {
  const raw = String(input ?? '').trim();
  if (!raw || raw.length > MAX_URL_LENGTH) {
    throw new YouTubeUrlError(raw ? 'El enlace de YouTube es demasiado largo.' : 'Ingresa un enlace de YouTube.');
  }

  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new YouTubeUrlError('El enlace de YouTube no es válido.');
  }

  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
    throw new YouTubeUrlError('El enlace de YouTube no es válido.');
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
  let candidate = '';
  if (hostname === 'youtu.be') {
    candidate = url.pathname.split('/').filter(Boolean)[0] ?? '';
  } else if (['youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(hostname)) {
    const parts = url.pathname.split('/').filter(Boolean);
    if (url.pathname === '/watch') candidate = url.searchParams.get('v') ?? '';
    else if (['shorts', 'embed', 'live'].includes(parts[0])) candidate = parts[1] ?? '';
  } else {
    throw new YouTubeUrlError('Usa un enlace de youtube.com o youtu.be.', 'UNSUPPORTED_HOST');
  }

  const videoId = cleanVideoId(candidate);
  return Object.freeze({
    videoId,
    canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
  });
}

export const extractYouTubeVideoId = input => parseYouTubeUrl(input).videoId;

