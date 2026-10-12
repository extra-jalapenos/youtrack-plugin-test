import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'
console.log(resolve(__dirname, 'index.html'))
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   input: {
      main: resolve(__dirname, 'index.html')
    },
   build: {
    rollupOptions: {
      input: {
          main: resolve(__dirname, 'src/index.html')
      }
    },
  },
})
