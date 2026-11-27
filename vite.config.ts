import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: {
    // Das Firebase SDK (~560 kB) wird per dynamic import() erst nach dem ersten Rendern
    // nachgeladen und blockiert den Start nicht – daher Warnschwelle knapp darüber.
    chunkSizeWarningLimit: 600,
  },
});
