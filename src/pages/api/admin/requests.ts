import type { APIRoute } from "astro";
import { authorizeAdminForm, cleanField, isAuthorized, redirectAdmin } from "../../../lib/admin-endpoint";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const authorized = await authorizeAdminForm(request);
  if (!isAuthorized(authorized)) return authorized;
  const { db, session, data } = authorized;
  const id = cleanField(data, "id", 80);
  const action = cleanField(data, "action", 30);
  const requestRow = await db.prepare("SELECT id FROM quote_requests WHERE id = ? LIMIT 1").bind(id).first<{ id: string }>();
  if (!requestRow) return new Response("Cererea nu există.", { status: 404 });
  if (action === "status") {
    const status = cleanField(data, "status", 30);
    if (!(status === "new" || status === "in_progress" || status === "answered" || status === "archived")) return new Response("Starea cererii nu este validă.", { status: 400 });
    await db.batch([
      db.prepare("UPDATE quote_requests SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(status, id),
      db.prepare("INSERT INTO audit_log (admin_id,entity_type,entity_id,action,summary) VALUES (?,'quote_request',?,'status',?)").bind(session.id, id, `Stare schimbată în ${status}.`)
    ]);
    return redirectAdmin("/admin/requests/?saved=1");
  }
  if (action === "note") {
    const note = cleanField(data, "note", 3000);
    if (!note) return new Response("Nota internă nu poate fi goală.", { status: 400 });
    await db.batch([
      db.prepare("INSERT INTO quote_request_notes (id,request_id,admin_id,note) VALUES (?,?,?,?)").bind(crypto.randomUUID(), id, session.id, note),
      db.prepare("INSERT INTO audit_log (admin_id,entity_type,entity_id,action,summary) VALUES (?,'quote_request',?,'note','Notă internă adăugată.')").bind(session.id, id)
    ]);
    return redirectAdmin("/admin/requests/?saved=1");
  }
  return new Response("Acțiunea solicitată nu este disponibilă.", { status: 400 });
};
