import { describe, expect, it, vi, afterEach } from 'vitest';
import handler, {
  extractYouTubeVideoId,
  sanitizeYouTubeMetadata,
} from '../../api/youtube-metadata.js';

const VIDEO_ID = 'dQw4w9WgXcQ';

function responseRecorder() {
  return {
    headers: {},
    statusCode: 0,
    setHeader(name, value) { this.headers[name] = value; },
    end(body) { this.body = JSON.parse(body); },
  };
}

describe('extractYouTubeVideoId', () => {
  it.each([
    [`https://www.youtube.com/watch?v=${VIDEO_ID}&t=42`, VIDEO_ID],
    [`https://youtu.be/${VIDEO_ID}?si=abc`, VIDEO_ID],
    [`https://youtube.com/shorts/${VIDEO_ID}`, VIDEO_ID],
    [`https://www.youtube.com/embed/${VIDEO_ID}`, VIDEO_ID],
  ])('extrae el ID de %s', (url, expected) => {
    expect(extractYouTubeVideoId(url)).toBe(expected);
  });

  it.each([
    `https://youtube.com.example/watch?v=${VIDEO_ID}`,
    `https://example.com/?youtube.com/watch?v=${VIDEO_ID}`,
    `javascript:alert(1)`,
    `https://youtube.com/watch?v=short`,
    `https://youtu.be/${VIDEO_ID}/extra`,
  ])('rechaza %s', (url) => {
    expect(() => extractYouTubeVideoId(url)).toThrow();
  });
});

describe('sanitizeYouTubeMetadata', () => {
  it('limita texto y reemplaza miniaturas externas', () => {
    expect(sanitizeYouTubeMetadata({
      title: '  Una\n canción  ',
      author_name: 'Canal\u0000 oficial',
      thumbnail_url: 'https://attacker.example/image.jpg',
    }, VIDEO_ID)).toEqual({
      videoId: VIDEO_ID,
      title: 'Una canción',
      author: 'Canal oficial',
      thumbnail: `https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`,
    });
  });
});

describe('youtube metadata handler', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('consulta únicamente el oEmbed oficial con el ID validado', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        title: 'Video',
        author_name: 'Canal',
        thumbnail_url: `https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`,
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const response = responseRecorder();

    await handler({ method: 'GET', query: { url: `https://youtu.be/${VIDEO_ID}` } }, response);

    expect(response.statusCode).toBe(200);
    expect(response.body.videoId).toBe(VIDEO_ID);
    const requestedUrl = fetchMock.mock.calls[0][0];
    expect(requestedUrl.origin).toBe('https://www.youtube.com');
    expect(requestedUrl.pathname).toBe('/oembed');
    expect(requestedUrl.searchParams.get('url')).toBe(`https://www.youtube.com/watch?v=${VIDEO_ID}`);
  });

  it('rechaza métodos distintos de GET sin consultar YouTube', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = responseRecorder();

    await handler({ method: 'POST', query: {} }, response);

    expect(response.statusCode).toBe(405);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
