import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,          // gives you describe/it/expect without imports
    environment: 'jsdom',   // fake DOM for component tests
    setupFiles: './src/test/setup.js',
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
})
