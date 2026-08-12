import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    base: "/track/",
  },
  tanstackStart: {
    ssr: false,
    server: { entry: "server" },
  },
});