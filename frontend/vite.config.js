import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    watch: {
        usePolling: true
    }
  },
  define: {
    // Ensure process.env is polyfilled if needed by some libs, 
    // though import.meta.env is preferred in Vite
    'process.env': {} 
  }
});
