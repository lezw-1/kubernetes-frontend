import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load .env file variables for the current mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      // Proxy IAM requests to avoid CORS in development
      proxy: {
        ...(env.VITE_IAM_URL
          ? {
              [env.VITE_IAM_SUBPATH || '/iam']: {
                target: env.VITE_IAM_URL,
                changeOrigin: true,
              },
            }
          : {}),
        ...(env.VITE_API_URL
          ? {
              '/api': {
                target: env.VITE_API_URL,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''), // Rewrites the URL path before forwarding the request to Keycloak.
              },
            }
          : {}),
      },
    },
  };
});
