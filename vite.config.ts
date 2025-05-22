
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const isDev = mode === "local" || mode === "dev" || mode === "development";
  const backendUrl = env.VITE_API_URL || "http://localhost:3001";

  return {
    server: {
      port: 8080,
      host: "::",
      allowedHosts: [
        "312e80dd-dd4b-4c0c-9d91-8003327f2c48.lovableproject.com",
        "e23ce393-ab5c-4db7-bf4d-6a17d78624dc.lovableproject.com",
      ],
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/seoul-api": {
          target: "http://openapi.seoul.go.kr:8088",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/seoul-api/, ""),
        },
        "/auth": {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
    plugins: [react(), isDev && componentTagger()].filter(Boolean),
    define: {
      "process.env": env,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
