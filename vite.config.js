import { fileURLToPath, URL } from 'node:url'
import Components from 'unplugin-vue-components/vite'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
const fs = require('fs')

// https://vitejs.dev/config/
export default defineConfig({
      plugins: [vue(), Components()],
      resolve: {
            alias: {
                  '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
      },
      server: {
            host: 'test.heartmanagement.fr',
            port: 443, // your desired port number
            https: {
                  key: fs.readFileSync('./cert/test.heartmanagement.fr-key.pem'),
                  cert: fs.readFileSync('./cert/test.heartmanagement.fr.pem'),
            },
            cors: true,
            strictPort: true // If the port is in use, Vite will exit instead of trying another one
      },
})
