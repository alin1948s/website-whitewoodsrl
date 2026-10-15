import type { APIRoute } from "astro";
import { deleteAdminSession, expiredSessionCookie, getAdminSession, verifyCsrf } from "../../../lib/auth";
import { getDatabase, getSiteOrigin } from "../../../lib/db";
import { sameOriginRequest } from "../../../lib/security";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const db = getDatabase();
  if (!sameOriginRequest(request, getSiteOrigin(request.url))) return new Response("Originea cererii nu este validă.", { status: 403 });
  const session = await getAdminSession(db, request);
  if (!session) return Response.redirect(new URL("/admin/login/", request.url), 303);
  const data = await request.formData();
  const token = typeof data.get("csrf") === "string" ? String(data.get("csrf")) : null;
  if (!(await verifyCsrf(session, token))) return new Response("Tokenul de sesiune nu este valid.", { status: 403 });
  await deleteAdminSession(db, session);
  return new Response(null, { status: 303, headers: { Location: "/admin/login/", "Set-Cookie": expiredSessionCookie(request), "Cache-Control": "no-store" } });
};
