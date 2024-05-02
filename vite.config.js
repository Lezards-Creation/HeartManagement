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
            port: 9000, // your desired port number
            https: {
                  key: fs.readFileSync('./cert/localhost+2-key.pem'),
                  cert: fs.readFileSync('./cert/localhost+2.pem'),
            },
      },
})
