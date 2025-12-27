import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement en fonction du mode (development/production)
  const env = loadEnv(mode, process.cwd(), '');

  // Utiliser l'URL de l'API définie dans .env, ou une valeur par défaut
  const target = env.VITE_API_URL || 'http://localhost:5000';

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'Résultats Élections Législatives',
          short_name: 'Élections CI',
          description: 'Application de consultation des résultats des élections législatives Côte d\'Ivoire',
          theme_color: '#f97316',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          orientation: 'portrait',
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          navigateFallback: '/index.html',
          navigateFallbackAllowlist: [/^(?!\/__).*/]
        }
      })
    ],

    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
          },
        },
      },
    },
    server: {
      proxy: {
        '/api': {
          target: target,
          changeOrigin: true,
          secure: false,
          // Ajout de headers pour bypasser les landing pages des tunnels (Serveo, Localtunnel, ngrok)
          headers: {
            'bypass-tunnel-reminder': 'true',
            'ngrok-skip-browser-warning': 'true'
          }
        },
        '/socket.io': {
          target: target,
          changeOrigin: true,
          secure: false,
          ws: true,
          headers: {
            'bypass-tunnel-reminder': 'true',
            'ngrok-skip-browser-warning': 'true'
          }
        }
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  }
})
