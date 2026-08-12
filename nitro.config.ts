import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  preset: "cloudflare-pages",
  publicAssets: [
    {
      baseURL: "/track",
      dir: "public",
    },
  ],
});
