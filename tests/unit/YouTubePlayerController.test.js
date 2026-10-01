import { describe, expect, it } from 'vitest';
import { YouTubePlayerController } from '../../src/ui/YouTubePlayerController.js';

describe('YouTubePlayerController.parseVideoId', () => {
  it.each([
    ['dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ?t=4', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
  ])('obtiene el ID desde %s', (source, expected) => {
    expect(YouTubePlayerController.parseVideoId(source)).toBe(expected);
  });

  it.each([
    '',
    'https://example.com/watch?v=dQw4w9WgXcQ',
    'javascript:alert(1)',
    'https://youtube.com/watch?v=demasiado-corto',
  ])('rechaza una fuente no permitida: %s', source => {
    expect(YouTubePlayerController.parseVideoId(source)).toBe('');
  });
});
