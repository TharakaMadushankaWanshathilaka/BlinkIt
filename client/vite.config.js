import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Specify the port for the development server
    port: 3000,
    // Enable strict port to avoid fallback to a random port
    strictPort: true,
    // Open the browser automatically when the server starts
    open: true,
  },
})

