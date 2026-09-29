import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
export default defineConfig({ base: '/flores-amarillas-universo/', plugins: [glsl()], build: { target: 'es2022' }, test: { environment: 'node' } });
