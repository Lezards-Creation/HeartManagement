import { fileURLToPath, URL } from 'node:url'
import Components from 'unplugin-vue-components/vite'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
const fs = require('fs')

// https://vitejs.dev/config/
export default defineConfig({
      plugins: [vue(), Components(), VueDevTools(),],
      resolve: {
            alias: {
                  '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
      },
      server: {
            host: 'test.heartmanagement.fr',
            port: 443,
            https: {
                  key: fs.readFileSync('./cert/test.heartmanagement.fr-key.pem'),
                  cert: fs.readFileSync('./cert/test.heartmanagement.fr.pem'),
            },
            cors: true,
            strictPort: true // If the port is in use, Vite will exit instead of trying another one
      },
})
