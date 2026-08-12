import "./polyfill";
import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: any, ctx: unknown) {
    const url = new URL(request.url);

    // 1. TENTA SERVIR ASSETS DIRETAMENTE DO CLOUDFLARE
    if (env && env.ASSETS) {
      try {
         // O Vite coloca os arquivos compilados na raiz (ex: /assets/styles.css)
         // Precisamos remover o /track da URL para que o ASSETS encontre o arquivo
         let assetPath = url.pathname;
         if (assetPath.startsWith('/track')) {
            assetPath = assetPath.substring(6); // remove '/track'
         }

         // Cria uma nova URL apontando para a raiz do domínio
         const assetUrl = new URL(assetPath, request.url);
         
         // Faz o fetch direto no binding do Cloudflare usando a nova Request clonada, mas com a URL corrigida
         const assetResponse = await env.ASSETS.fetch(new Request(assetUrl.toString(), request));

         if (assetResponse && assetResponse.status < 400) {
            return assetResponse;
         }
      } catch (e) {
         // Falhou em achar o asset estático, segue pro roteador
      }
    }

    // 2. ROTEAMENTO NORMAL TANSTACK
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
