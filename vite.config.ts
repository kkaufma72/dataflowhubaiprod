import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    strictPort: true, // Force the specified port
    host: true, // Listen on all addresses
    watch: {
      usePolling: true,
      interval: 2000, // Increased polling interval for better stability
      ignored: ['**/node_modules/**', '**/.git/**']
    },
    hmr: {
      timeout: 180000, // Increased timeout for better reliability
      clientPort: 3002 // Ensure client and server ports match
    },
    fs: {
      strict: false, // Disable strict mode for file system access
      allow: ['.']
    }
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart': ['chart.js', 'react-chartjs-2'],
          'ui': ['lucide-react'],
          'data': ['papaparse', 'file-saver', 'jszip']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['@tensorflow/tfjs'],
    force: true, // Force dependency optimization
    esbuildOptions: {
      target: 'esnext'
    }
  },
  test: {
    environment: 'jsdom'
  }
});