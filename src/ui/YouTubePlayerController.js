const API_SRC = 'https://www.youtube.com/iframe_api';
let apiPromise;

const loadYouTubeApi = () => {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve(window.YT);
    };
    const existing = document.querySelector(`script[src="${API_SRC}"]`);
    if (existing) return;
    const script = document.createElement('script');
    script.src = API_SRC;
    script.async = true;
    script.onerror = () => {
      apiPromise = undefined;
      reject(new Error('No se pudo cargar el reproductor de YouTube.'));
    };
    document.head.append(script);
  });
  return apiPromise;
};

const parseVideoId = value => {
  if (/^[\w-]{11}$/.test(value || '')) return value;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '');
    let candidate = '';
    if (host === 'youtu.be') candidate = url.pathname.split('/').filter(Boolean)[0] || '';
    if (['youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com'].includes(host)) {
      if (url.pathname === '/watch') candidate = url.searchParams.get('v') || '';
      const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/);
      candidate ||= match?.[1] || '';
    }
    return /^[\w-]{11}$/.test(candidate) ? candidate : '';
  } catch {
    return '';
  }
};

export class YouTubePlayerController {
  static parseVideoId(value) { return parseVideoId(value); }

  constructor({ onStateChange = () => {}, onError = () => {}, onAutoplayBlocked = () => {} } = {}) {
    this.onStateChange = onStateChange;
    this.onError = onError;
    this.onAutoplayBlocked = onAutoplayBlocked;
    this.videoId = '';
    this.position = 0;
    this.ready = null;
    this.player = null;
    this.container = document.createElement('div');
    this.container.className = 'youtube-player';
    this.container.hidden = true;
    this.container.setAttribute('aria-hidden', 'true');
    this.host = document.createElement('div');
    this.host.className = 'youtube-player__host';
    this.container.append(this.host);
  }

  mount(root) {
    if (this.container.parentNode !== root) root.append(this.container);
    return this;
  }

  async ensurePlayer() {
    if (this.player) return this.player;
    if (this.ready) return this.ready;
    this.ready = loadYouTubeApi().then(YT => new Promise(resolve => {
      this.player = new YT.Player(this.host, {
        host: 'https://www.youtube-nocookie.com',
        width: '100%',
        height: '100%',
        playerVars: { controls: 1, playsinline: 1, rel: 0, origin: window.location.origin },
        events: {
          onReady: () => resolve(this.player),
          onStateChange: event => this.onStateChange(event.data),
          onError: event => this.onError(event.data),
          onAutoplayBlocked: () => this.onAutoplayBlocked(),
        },
      });
    })).catch(error => {
      this.ready = null;
      this.onError(error);
      throw error;
    });
    return this.ready;
  }

  show() {
    this.container.hidden = false;
    this.container.setAttribute('aria-hidden', 'false');
  }

  isVisible() {
    return !this.container.hidden && this.container.getAttribute('aria-hidden') !== 'true';
  }

  async open(source, { autoplay = true } = {}) {
    const videoId = parseVideoId(source?.videoId || source?.url || source);
    if (!videoId) throw new Error('El enlace de YouTube no es válido.');
    this.show();
    const player = await this.ensurePlayer();
    const changed = videoId !== this.videoId;
    this.videoId = videoId;
    if (changed) this.position = 0;
    if (autoplay) {
      player.loadVideoById({ videoId, startSeconds: this.position });
      if (this.isVisible()) player.playVideo();
    } else {
      player.cueVideoById({ videoId, startSeconds: this.position });
    }
  }

  async resume() {
    if (!this.videoId) return;
    this.show();
    const player = await this.ensurePlayer();
    player.seekTo(this.position, true);
    if (this.isVisible()) player.playVideo();
  }

  pause() {
    if (!this.player) return this.position;
    const current = Number(this.player.getCurrentTime?.());
    if (Number.isFinite(current)) this.position = current;
    this.player.pauseVideo?.();
    return this.position;
  }

  close() {
    this.pause();
    this.container.hidden = true;
    this.container.setAttribute('aria-hidden', 'true');
    return this.position;
  }

  dispose() {
    this.close();
    this.player?.destroy?.();
    this.player = null;
    this.ready = null;
    this.container.remove();
  }
}
