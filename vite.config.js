/* global process */

import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
export default defineConfig({
  // Vercel serves the SPA at the domain root. GitHub Pages keeps its repository subpath.
  base: process.env.VERCEL ? '/' : '/flores-amarillas-universo/',
  plugins: [glsl()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 550,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('troika-three-text') || id.includes('troika-three-utils') || id.includes('webgl-sdf-generator')) return 'text-engine';
          if (id.includes('node_modules/three')) return 'three-engine';
          if (id.includes('node_modules/gsap') || id.includes('node_modules/tweakpane')) return 'motion-ui';
        },
      },
    },
  },
  test: { environment: 'node' },
});
