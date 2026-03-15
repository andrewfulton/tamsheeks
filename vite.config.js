import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'

export default defineConfig({
  base: '/tamsheeks/',
  plugins: [tailwindcss(), svelte()],
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib'),
    },
  },
})
