import { fileURLToPath, URL } from 'node:url'
import Components from 'unplugin-vue-components/vite'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
      plugins: [vue(), Components()],
      resolve: {
            alias: {
                  '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
      },
})
