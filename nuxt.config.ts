// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // SPA-like behavior (no SSR) for a simple frontend app.
  ssr: false,

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
      link: [
        { rel: 'stylesheet', href: 'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700&display=swap' }
      ],
      meta: [
        { name: 'theme-color', content: '#fcfdfc' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      // Backend default (Express): http://localhost:1337
      backendBaseUrl: process.env.NUXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:1337',
    },
  },

  css: ['~/assets/css/style.css']
})
