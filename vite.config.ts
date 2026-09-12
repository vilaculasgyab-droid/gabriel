// Sanitize container environment global __dirname if set to '.'
if (typeof globalThis !== 'undefined' && (globalThis as any).__dirname === '.') {
  delete (globalThis as any).__dirname;
}
if (typeof global !== 'undefined' && (global as any).__dirname === '.') {
  delete (global as any).__dirname;
}

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.svg',
          'favicon.png',
          'apple-touch-icon.png',
          'icon.svg',
          'offline.html',
          'manifest.webmanifest',
          'sitemap.xml',
          'robots.txt',
          'hero-bg-epi-tabletop.jpg',
        ],
        manifest: {
          id: '/',
          name: 'FortiMoz - EPIs e Segurança no Trabalho',
          short_name: 'FortiMoz',
          description: 'Equipamentos de Proteção Individual (EPIs), calçado de segurança, capacetes, proteção respiratória e vestuário profissional em Moçambique.',
          theme_color: '#020617',
          background_color: '#020617',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          lang: 'pt-MZ',
          dir: 'ltr',
          categories: ['shopping', 'business'],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],
          navigateFallback: '/index.html',
          // Ensure admin, API endpoints, sitemap.xml and robots.txt are never intercepted with SPA index.html fallback
          navigateFallbackDenylist: [/^\/admin/, /^\/api/, /^\/sitemap\.xml$/, /^\/robots\.txt$/],
          cleanupOutdatedCaches: true,
          cacheId: 'fortimoz-v2',
          runtimeCaching: [
            {
              // API routes must ALWAYS be NetworkOnly, never cached by the Service Worker
              urlPattern: /^\/api\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              // Supabase REST data queries must ALWAYS be NetworkOnly (source of truth)
              urlPattern: /.*supabase\.co\/rest\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              // Supabase Storage images must prefer the network with NetworkFirst
              urlPattern: /.*supabase\.co\/storage\/v1\/object\/public\/product-images\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'fortimoz-supabase-images',
                networkTimeoutSeconds: 2,
                expiration: {
                  maxEntries: 120,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days fallback
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'fortimoz-google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'fortimoz-gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|webp|ico)$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'fortimoz-media-cache',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
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
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
