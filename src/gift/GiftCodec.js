import { GIFT_TOKEN_MAX_BYTES, GiftValidationError, assertGiftPayload } from './GiftValidator.js';

export class GiftCodecError extends Error {
  constructor(message, code = 'INVALID_TOKEN', cause) {
    super(message, cause ? { cause } : undefined);
    this.name = 'GiftCodecError';
    this.code = code;
  }
}

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

const bytesToBase64 = bytes => {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
  return btoa(binary);
};

const base64ToBytes = base64 => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
};

const ensureTokenSize = token => {
  if (encoder.encode(token).byteLength > GIFT_TOKEN_MAX_BYTES) {
    throw new GiftCodecError('El regalo supera el límite de 8 KB.', 'TOKEN_TOO_LARGE');
  }
};

const toUrlSafe = bytes => bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
const fromUrlSafe = value => {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  return base64ToBytes(value.replace(/-/g, '+').replace(/_/g, '/') + padding);
};

const transformBytes = async (bytes, stream) => {
  const result = await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer();
  return new Uint8Array(result);
};

export class GiftCodec {
  static encode(payload, options = {}) {
    const value = assertGiftPayload(payload, options);
    const json = JSON.stringify(value);
    const token = toUrlSafe(encoder.encode(json));
    ensureTokenSize(token);
    return token;
  }

  static decode(token, options = {}) {
    const value = String(token ?? '').trim();
    if (!value || !/^[A-Za-z0-9_-]+$/.test(value)) throw new GiftCodecError('El enlace del regalo no es válido.');
    ensureTokenSize(value);
    try {
      const json = decoder.decode(fromUrlSafe(value));
      return assertGiftPayload(JSON.parse(json), options);
    } catch (error) {
      if (error instanceof GiftValidationError) throw error;
      throw new GiftCodecError('El enlace del regalo está dañado.', 'MALFORMED_TOKEN', error);
    }
  }


  static async encodeCompressed(payload, options = {}) {
    const value = assertGiftPayload(payload, options);
    const raw = encoder.encode(JSON.stringify(value));
    if (typeof CompressionStream === 'undefined') return `j.${this.encode(value, options)}`;
    const compressed = await transformBytes(raw, new CompressionStream('gzip'));
    const token = `z.${toUrlSafe(compressed)}`;
    ensureTokenSize(token);
    return token;
  }

  static async decodeCompressed(token, options = {}) {
    const value = String(token ?? '').trim();
    if (value.startsWith('j.')) return this.decode(value.slice(2), options);
    if (!value.startsWith('z.')) return this.decode(value, options);
    ensureTokenSize(value);
    if (!/^z\.[A-Za-z0-9_-]+$/.test(value)) throw new GiftCodecError('El enlace del regalo no es válido.');
    if (typeof DecompressionStream === 'undefined') throw new GiftCodecError('Este navegador no puede abrir enlaces comprimidos.', 'UNSUPPORTED_COMPRESSION');
    try {
      const bytes = await transformBytes(fromUrlSafe(value.slice(2)), new DecompressionStream('gzip'));
      return assertGiftPayload(JSON.parse(decoder.decode(bytes)), options);
    } catch (error) {
      if (error instanceof GiftValidationError) throw error;
      if (error instanceof GiftCodecError) throw error;
      throw new GiftCodecError('El enlace del regalo está dañado.', 'MALFORMED_TOKEN', error);
    }
  }
}

export const encodeGift = (payload, options) => GiftCodec.encode(payload, options);
export const decodeGift = (token, options) => GiftCodec.decode(token, options);
export const encodeCompressedGift = (payload, options) => GiftCodec.encodeCompressed(payload, options);
export const decodeCompressedGift = (token, options) => GiftCodec.decodeCompressed(token, options);
