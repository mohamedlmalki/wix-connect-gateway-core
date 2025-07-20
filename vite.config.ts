import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// --- PASTE YOUR LIVE WIX URL HERE ---
const wixSiteUrl = 'https://helpednav.wixsite.com/my-site-1';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // This is the entire server configuration.
    // It tells Vite to forward any request that starts with '/_functions'
    // to your live Wix site.
    proxy: {
      '/_functions': {
        target: wixSiteUrl,
        changeOrigin: true,
      },
    },
  },
});