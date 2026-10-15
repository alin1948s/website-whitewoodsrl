import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  try {
    const response = await next();
    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    headers.set("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; media-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-src 'self' https://www.google.com; form-action 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'");
    if (context.url.pathname.startsWith("/admin") || context.url.pathname.startsWith("/api/")) headers.set("Cache-Control", "no-store");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  } catch (error) {
    console.error("Request failed", context.url.pathname, error);
    const isApi = context.url.pathname.startsWith("/api/");
    const message = "Baza de date nu a putut confirma operația. Datele nu au fost confirmate ca salvate.";
    if (isApi) return Response.json({ ok: false, message }, { status: 503, headers: { "Cache-Control": "no-store" } });
    return new Response(`<!doctype html><html lang="ro"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Serviciu indisponibil | WhiteWOOD</title><body style="margin:0;padding:12vh 8vw;background:#f3f0e8;color:#20231f;font:16px/1.6 system-ui"><p style="letter-spacing:.12em;text-transform:uppercase;color:#385345">WhiteWOOD</p><h1 style="font:500 clamp(2.5rem,8vw,5rem)/1 Georgia,serif;max-width:12ch">Nu am putut încărca datele.</h1><p style="max-width:50ch">${message}</p><a href="/ro/">Înapoi la pagina principală</a></body></html>`, { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  }
});
