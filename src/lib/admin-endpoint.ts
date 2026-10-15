import { getAdminSession, verifyCsrf, type AdminSession } from "./auth";
import { getDatabase, getSiteOrigin } from "./db";
import { sameOriginRequest } from "./security";
import type { D1Database } from "@cloudflare/workers-types";

export interface AuthorizedAdminForm {
  db: D1Database;
  session: AdminSession;
  data: FormData;
}

export async function authorizeAdminForm(request: Request): Promise<AuthorizedAdminForm | Response> {
  if (!sameOriginRequest(request, getSiteOrigin(request.url))) return new Response("Originea cererii nu este validă.", { status: 403 });
  const db = getDatabase();
  const session = await getAdminSession(db, request);
  if (!session) return Response.redirect(new URL("/admin/login/", request.url), 303);
  const data = await request.formData();
  const suppliedCsrf = typeof data.get("csrf") === "string" ? String(data.get("csrf")) : null;
  if (!(await verifyCsrf(session, suppliedCsrf))) return new Response("Tokenul de sesiune nu este valid.", { status: 403 });
  return { db, session, data };
}

export function isAuthorized(value: AuthorizedAdminForm | Response): value is AuthorizedAdminForm {
  return !(value instanceof Response);
}

export function redirectAdmin(path: string): Response {
  return new Response(null, { status: 303, headers: { Location: path, "Cache-Control": "no-store" } });
}

export function cleanField(data: FormData, name: string, limit: number): string {
  const value = data.get(name);
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

export function allowedStatus(value: string): value is "draft" | "published" | "archived" {
  return value === "draft" || value === "published" || value === "archived";
}

export function allowedSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 120;
}
