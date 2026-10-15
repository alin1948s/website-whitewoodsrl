import type { APIRoute } from "astro";
import { authenticateAdmin } from "../../../lib/auth";
import { getDatabase, getSiteOrigin } from "../../../lib/db";
import { sameOriginRequest } from "../../../lib/security";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!sameOriginRequest(request, getSiteOrigin(request.url))) return new Response("Originea cererii nu este validă.", { status: 403 });
  const data = await request.formData();
  const email = typeof data.get("email") === "string" ? String(data.get("email")).slice(0, 254) : "";
  const password = typeof data.get("password") === "string" ? String(data.get("password")).slice(0, 200) : "";
  const signedIn = await authenticateAdmin(getDatabase(), request, { email, password });
  if (!signedIn) {
    const failure = new URL("/admin/login/?error=1", request.url);
    return new Response(null, { status: 303, headers: { Location: `${failure.pathname}${failure.search}`, "Cache-Control": "no-store" } });
  }
  return new Response(null, { status: 303, headers: { Location: "/admin/", "Set-Cookie": signedIn.cookie, "Cache-Control": "no-store" } });
};
