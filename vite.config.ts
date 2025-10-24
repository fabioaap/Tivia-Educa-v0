import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './src/core'),
      '@ecs': path.resolve(__dirname, './src/ecs'),
      '@game': path.resolve(__dirname, './src/game'),
      '@scenes': path.resolve(__dirname, './src/scenes'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@data': path.resolve(__dirname, './src/data'),
      '@storage': path.resolve(__dirname, './src/storage'),
      '@systems': path.resolve(__dirname, './src/systems'),
      '@telemetry': path.resolve(__dirname, './src/telemetry'),
      '@audio': path.resolve(__dirname, './src/audio'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@config': path.resolve(__dirname, './src/config'),
    },
  },
  build: {
    target: 'es2022',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          pixi: ['pixi.js'],
          gsap: ['gsap'],
          vendor: ['xstate', 'dexie', 'axios', 'howler'],
        },
      },
    },
  },
  plugins: [
    viteCompression({ algorithm: 'gzip' }),
    viteCompression({ algorithm: 'brotliCompress' }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Trivia Educacross',
        short_name: 'Trivia',
        description: 'Jogo de perguntas e respostas educacional',
        theme_color: '#00D9FF',
        background_color: '#000814',
        display: 'standalone',
        orientation: 'landscape',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.educacross\.com\.br\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    strictPort: true,
  },
});
