import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { renderErrorPage } from "./lib/error-page";
import "./polyfill";
import "./lib/error-capture";
import { consumeLastCapturedError } from "./lib/error-capture";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) throw error;
    console.error(error);
    return new Response(renderErrorPage(), { status: 500, headers: { "content-type": "text/html; charset=utf-8" } });
  }
});

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware, csrfMiddleware],
}));

type ServerEntry = { fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response; };
let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then((m) => (m.default ?? m) as ServerEntry);
  }
  return serverEntryPromise;
}

export default {
  async fetch(request: Request, env: any, ctx: unknown) {
    const url = new URL(request.url);

    // Salva o layout e imagens
    if (env && env.ASSETS) {
      if (url.pathname.startsWith("/track/assets/") || url.pathname === "/track/hydra-logo.png") {
        try {
          const assetResponse = await env.ASSETS.fetch(request);
          if (assetResponse && assetResponse.ok) return assetResponse;
        } catch (e) { console.error("Erro asset:", e); }
      }
    }

    // Roteamento TanStack
    try {
      const handler = await getServerEntry();
      return await handler.fetch(request, env, ctx);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), { status: 500, headers: { "content-type": "text/html; charset=utf-8" } });
    }
  },
};