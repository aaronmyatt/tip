// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  runtimeConfig: {
    public: {},
  },
  compatibilityDate: "2024-04-03",
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  image: {
    dir: "assets",
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  css: ["~/assets/main.css"],
  modules: [
    "nuxt-quasar-ui",
    "@vueuse/nuxt",
    "@nuxt/image",
    "@nuxt/icon",
    "@nuxt/content",
  ],
  quasar: {
    plugins: [
      "Notify",
    ],
  },
});
