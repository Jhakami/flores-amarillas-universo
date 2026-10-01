import './styles/base.css';
import './styles/overlays.css';
import './styles/editor.css';
import './styles/responsive.css';
import './styles/v3.css';
import { App } from './core/App.js';
import { defaultConfig } from './config/defaultConfig.js';
import { contentCatalog } from './data/contentCatalog.js';
import { ErrorFallback } from './ui/ErrorFallback.js';
import { GiftForm } from './ui/GiftForm.js';
import { CinematicLetter } from './ui/CinematicLetter.js';
import { YouTubePlayerController } from './ui/YouTubePlayerController.js';
import { GiftCodec, createGiftPayload, createPersonalizedCatalog, parseYouTubeUrl } from './gift/index.js';

const canvas = document.querySelector('#experience');
const ui = document.querySelector('#ui');
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const relativePath = location.pathname.startsWith(basePath) ? location.pathname.slice(basePath.length) : location.pathname;
const segments = relativePath.split('/').filter(Boolean);
const routeUrl = path => `${basePath}/${String(path).replace(/^\//, '')}`;
const addText = (parent, tag, className, value) => { const element = document.createElement(tag); element.className = className; element.textContent = value; parent.append(element); return element; };

function preparePage() { canvas.hidden = true; ui.className = 'route-ui'; ui.replaceChildren(); const page = document.createElement('main'); page.className = 'route-page'; ui.append(page); return page; }
function linkButton(parent, label, path, primary = false) { const link = document.createElement('a'); link.className = `route-button${primary ? ' route-button--primary' : ''}`; link.href = routeUrl(path); link.textContent = label; parent.append(link); return link; }
function showLanding() { const page = preparePage(); page.classList.add('landing-page'); const card = document.createElement('section'); card.className = 'landing-card'; addText(card, 'p', 'landing-kicker', 'Una experiencia para regalar'); addText(card, 'h1', 'landing-title', 'Universo de Flores Amarillas'); addText(card, 'p', 'landing-copy', 'Crea un universo 360° con nombres, dieciocho cartas únicas, una dedicatoria y una canción de YouTube. No necesitas una cuenta.'); const actions = document.createElement('div'); actions.className = 'route-actions'; linkButton(actions, 'Crear mi universo', 'crear', true); linkButton(actions, 'Ver demostración', 'demo'); card.append(actions); page.append(card); }

async function resolveYouTube(url) {
  const { videoId } = parseYouTubeUrl(url);
  try { const endpoint = new URL('/api/youtube-metadata', location.origin); endpoint.searchParams.set('url', url); const response = await fetch(endpoint, { headers: { Accept: 'application/json' } }); const body = await response.json(); if (!response.ok) throw new Error(body.message || 'No se pudo comprobar el video.'); return { provider: 'YouTube', ...body }; }
  catch (error) { if (!import.meta.env.DEV) throw error; return { provider: 'YouTube', videoId, title: 'Video de YouTube', author: 'YouTube', thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` }; }
}

function showGiftResult(page, url, payload) { page.replaceChildren(); const card = document.createElement('section'); card.className = 'gift-result'; addText(card, 'p', 'landing-kicker', 'Tu universo está listo'); addText(card, 'h1', 'landing-title', `Para ${payload.recipient}`); addText(card, 'p', 'landing-copy', 'Copia este enlace y envíalo. Funcionará en cualquier dispositivo hasta su fecha de vencimiento.'); const link = document.createElement('input'); link.className = 'gift-result__url'; link.readOnly = true; link.value = url; link.setAttribute('aria-label', 'Enlace del regalo'); const actions = document.createElement('div'); actions.className = 'route-actions'; const copy = document.createElement('button'); copy.className = 'route-button route-button--primary'; copy.type = 'button'; copy.textContent = 'Copiar enlace'; copy.addEventListener('click', async () => { await navigator.clipboard.writeText(url); copy.textContent = 'Enlace copiado'; }); const open = document.createElement('a'); open.className = 'route-button'; open.href = url; open.textContent = 'Abrir regalo'; actions.append(copy, open); card.append(link, actions); page.append(card); link.select(); }

function showCreate() {
  const page = preparePage(); page.classList.add('create-page'); const previewPlayer = new YouTubePlayerController(); const previewLetter = new CinematicLetter(ui, { youtube: previewPlayer });
  const form = new GiftForm(page, {
    cardDefaults: contentCatalog.entries.slice(0, 18), onResolveYouTube: resolveYouTube,
    onOpenMusicPreview: metadata => previewLetter.open({ title: form.inputs.title.value || 'Una canción para ti', note: form.inputs.letterNote.value, media: metadata }),
    onSubmit: async draft => { const payload = createGiftPayload(draft, { duration: draft.duration }); const token = await GiftCodec.encodeCompressed(payload); const url = new URL(routeUrl(`gift/${token}`), location.origin).href; previewLetter.dispose(); previewPlayer.dispose(); form.dispose(); showGiftResult(page, url, payload); },
  });
}

function showRouteError(title, message) { const page = preparePage(); const card = document.createElement('section'); card.className = 'gift-result'; addText(card, 'p', 'landing-kicker', 'No pudimos abrir el regalo'); addText(card, 'h1', 'landing-title', title); addText(card, 'p', 'landing-copy', message); const actions = document.createElement('div'); actions.className = 'route-actions'; linkButton(actions, 'Crear otro universo', 'crear', true); linkButton(actions, 'Volver al inicio', ''); card.append(actions); page.append(card); }

async function startExperience(gift = null) {
  canvas.hidden = false; ui.className = ''; ui.replaceChildren(); if (!window.WebGLRenderingContext) return new ErrorFallback(ui).show();
  const initialConfig = gift ? { ...defaultConfig, content: { ...defaultConfig.content, title: gift.dedication, dedication: `De ${gift.sender}, para ${gift.recipient}` } } : undefined;
  const catalog = gift ? createPersonalizedCatalog(gift) : contentCatalog; const app = new App({ canvas, container: ui, initialConfig, catalog, gift }); await app.init(); app.start(); window.yellowUniverse = app;
}

async function bootstrap() {
  try { if (!segments.length) return showLanding(); if (segments[0] === 'crear') return showCreate(); if (segments[0] === 'demo') return startExperience(); if (segments[0] === 'gift' && segments[1]) return startExperience(await GiftCodec.decodeCompressed(segments[1])); return showRouteError('Ruta desconocida', 'El enlace no corresponde a una experiencia disponible.'); }
  catch (error) { console.error(error); const expired = error?.code === 'EXPIRED'; return showRouteError(expired ? 'Este regalo ya venció' : 'Enlace no válido', expired ? 'Pide a quien lo creó que genere uno nuevo.' : 'El enlace está incompleto, dañado o no es compatible.'); }
}

bootstrap();
