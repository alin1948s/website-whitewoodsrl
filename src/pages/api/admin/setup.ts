import type { APIRoute } from "astro";
import { bootstrapAdmin, countAdminUsers } from "../../../lib/auth";
import { getDatabase, getSiteOrigin } from "../../../lib/db";
import { sameOriginRequest } from "../../../lib/security";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!sameOriginRequest(request, getSiteOrigin(request.url))) return Response.json({ ok: false, message: "Originea cererii nu este validă." }, { status: 403 });
  const db = getDatabase();
  if (await countAdminUsers(db) > 0) return Response.json({ ok: false, message: "Contul inițial există deja." }, { status: 409 });
  const data = await request.formData();
  const email = typeof data.get("email") === "string" ? String(data.get("email")).trim() : "";
  const password = typeof data.get("password") === "string" ? String(data.get("password")) : "";
  const token = typeof data.get("bootstrap_token") === "string" ? String(data.get("bootstrap_token")) : "";
  try {
    const { cookie } = await bootstrapAdmin(db, request, { email, password, token });
    return new Response(null, { status: 303, headers: { Location: "/admin/", "Set-Cookie": cookie, "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Contul admin nu a putut fi creat.";
    return new Response(message, { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  }
};
