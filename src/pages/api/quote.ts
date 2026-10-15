import type { APIRoute } from "astro";
import { getAppMode, getDatabase, getEnvironment, getSiteOrigin } from "../../lib/db";
import { safeLocalPath, sameOriginRequest, sha256 } from "../../lib/security";

export const prerender = false;

function field(data: FormData, name: string, maxLength: number): string {
  const value = data.get(name);
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function reply(request: Request, body: { ok: boolean; message: string; redirect?: string }, status = 200): Response {
  if (request.headers.get("accept")?.includes("application/json")) {
    return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  }
  if (body.ok && body.redirect) return Response.redirect(new URL(`${body.redirect}?sent=1`, request.url), 303);
  return new Response(`<!doctype html><html lang="ro"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Solicitare netrimisă | WhiteWOOD</title><body style="margin:0;padding:10vh 8vw;background:#f3f0e8;color:#20231f;font:16px/1.6 system-ui"><h1>Nu am putut trimite solicitarea</h1><p>${body.message}</p><a href="/ro/contact/">Revino la formular</a></body></html>`, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export const POST: APIRoute = async ({ request }) => {
  const environment = getEnvironment();
  const mode = getAppMode();
  const siteOrigin = getSiteOrigin(request.url);
  if (!sameOriginRequest(request, siteOrigin)) return reply(request, { ok: false, message: "Formularul a expirat. Reîncarcă pagina și încearcă din nou." }, 403);
  if (mode === "production" && environment.PRIVACY_NOTICE_APPROVED !== "true") {
    return reply(request, { ok: false, message: "Formularul nu este disponibil momentan. Te rugăm să ne contactezi prin telefon sau e-mail." }, 503);
  }

  const data = await request.formData();
  if (field(data, "website", 200)) return reply(request, { ok: false, message: "Cererea nu a putut fi procesată." }, 400);
  const language = field(data, "language", 2) === "en" ? "en" : "ro";
  const returnPathCandidate = field(data, "return_path", 100);
  const returnPath = safeLocalPath(returnPathCandidate, `/${language}/contact/`);
  const name = field(data, "name", 120);
  const company = field(data, "company", 160);
  const email = field(data, "email", 254).toLowerCase();
  const phone = field(data, "phone", 50);
  const country = field(data, "country", 100);
  const destination = field(data, "destination", 120);
  const volume = field(data, "estimated_volume", 60);
  const notes = field(data, "notes", 2000);
  const consent = field(data, "data_ack", 10) === "yes";
  if (!name || !company || !email || !consent) return reply(request, { ok: false, message: language === "ro" ? "Completează câmpurile marcate cu * și confirmă că ai citit informarea privind protecția datelor." : "Complete the fields marked with * and confirm that you have read the personal data notice." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(request, { ok: false, message: language === "ro" ? "Adresa de e-mail nu este validă." : "Enter a valid email address." }, 400);

  let parsedSpecs: Array<{ key: string; value: string }>;
  try {
    const raw = field(data, "specs_json", 1500);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed) || parsed.length > 10) throw new Error("invalid specs");
    parsedSpecs = parsed.map((item) => {
      if (!item || typeof item !== "object") throw new Error("invalid spec");
      const candidate = item as Record<string, unknown>;
      if (typeof candidate.key !== "string" || candidate.key.length > 60 || typeof candidate.value !== "string" || candidate.value.length > 160) throw new Error("invalid spec");
      return { key: candidate.key, value: candidate.value };
    });
  } catch {
    return reply(request, { ok: false, message: language === "ro" ? "Selecția de dimensiuni nu a putut fi confirmată. Reîncarcă pagina și încearcă din nou." : "We couldn’t confirm your selected dimensions. Reload the page and try again." }, 400);
  }

  const ip = request.headers.get("cf-connecting-ip") || "local";
  const scopeHash = await sha256(`quote:${ip}`);
  const db = getDatabase();
  const recent = await db.prepare(`SELECT COUNT(*) AS count FROM rate_limit_events WHERE scope_hash = ? AND occurred_at > datetime('now', '-1 hour')`)
    .bind(scopeHash).first<{ count: number }>();
  if ((recent?.count ?? 0) >= 5) return reply(request, { ok: false, message: language === "ro" ? "Ai trimis mai multe solicitări într-un interval scurt. Încearcă din nou mai târziu." : "Several requests were sent in a short time. Please try again later." }, 429);
  const attempt = await db.prepare("INSERT INTO rate_limit_events (scope_hash, succeeded) VALUES (?, 0)").bind(scopeHash).run();
  const rateEventId = attempt.meta.last_row_id;

  const productId = field(data, "product_id", 80);
  const product = await db.prepare(`
    SELECT p.id, p.species, p.title_ro, p.title_en, c.slug AS category_slug
     FROM products p JOIN product_categories c ON c.id = p.category_id
     WHERE p.id = ? AND p.status = 'published' AND c.status = 'published'
       AND (p.is_demo = 0 OR (? = 'local' AND p.is_demo = 1))
       AND (p.verification_status = 'company_confirmed' OR (? = 'local' AND p.is_demo = 1))
     LIMIT 1
  `).bind(productId, mode, mode).first<{ id: string; species: string | null; title_ro: string; title_en: string; category_slug: string }>();
  if (!product) return reply(request, { ok: false, message: language === "ro" ? "Alege un produs din catalog." : "Choose a product from the catalogue." }, 400);

  const selectedSpecs: Array<{ key: string; label: string; value: string; unit: string | null }> = [];
  for (const selection of parsedSpecs) {
    const labelColumn = language === "ro" ? "label_ro" : "label_en";
    const valueColumn = language === "ro" ? "value_ro" : "value_en";
    const row = await db.prepare(`SELECT ${labelColumn} AS label, ${valueColumn} AS value, unit FROM product_specs WHERE product_id = ? AND spec_key = ? AND is_confirmed = 1 AND ${valueColumn} = ? LIMIT 1`)
      .bind(product.id, selection.key, selection.value).first<{ label: string; value: string; unit: string | null }>();
    if (!row) return reply(request, { ok: false, message: language === "ro" ? "Unele dimensiuni s-au actualizat. Reîncarcă pagina și selectează variantele disponibile." : "Some dimensions have changed. Reload the page and select an available option." }, 400);
    selectedSpecs.push({ key: selection.key, label: row.label, value: row.value, unit: row.unit });
  }

  const summaryLines = [`${language === "ro" ? product.title_ro : product.title_en}${product.species ? ` — ${product.species}` : ""}`];
  for (const spec of selectedSpecs) summaryLines.push(`${spec.label}: ${spec.value}${spec.unit ? ` ${spec.unit}` : ""}`);
  if (volume) summaryLines.push(`${language === "ro" ? "Volum estimativ" : "Estimated volume"}: ${volume}`);
  if (destination) summaryLines.push(`${language === "ro" ? "Destinație" : "Destination"}: ${destination}`);
  if (notes) summaryLines.push(`${language === "ro" ? "Observații" : "Notes"}: ${notes}`);
  const summary = summaryLines.join("\n").slice(0, 4000);
  const finish = selectedSpecs.filter((item) => /finish|surface|planing/i.test(item.key)).map((item) => item.value).join(", ");
  const drying = selectedSpecs.filter((item) => /dry|humidity/i.test(item.key)).map((item) => item.value).join(", ");
  const dimensions = selectedSpecs.filter((item) => /dimension|length|width|thickness|size/i.test(item.key)).map((item) => `${item.label}: ${item.value}${item.unit ? ` ${item.unit}` : ""}`).join("; ");
  const otherSpecs = selectedSpecs.filter((item) => !/finish|surface|planing|dry|humidity|dimension|length|width|thickness|size/i.test(item.key)).map((item) => `${item.label}: ${item.value}`).join("; ");
  const internalItemNotes = [notes, otherSpecs].filter(Boolean).join("\n").slice(0, 2500);
  const requestId = crypto.randomUUID();
  try {
    await db.batch([
      db.prepare(`INSERT INTO quote_requests (id,name,company,email,phone,country,destination,summary,status,source,consent_version,is_demo)
                  VALUES (?,?,?,?,?,?,?,?,'new','website',?,?)`)
        .bind(requestId, name, company, email, phone || null, country || null, destination || null, summary, mode === "local" ? "local-test-v1" : "privacy-approved-v1", mode === "local" ? 1 : 0),
      db.prepare(`INSERT INTO quote_request_items (id,request_id,product_id,category,species,finish,drying,dimensions,estimated_volume,destination,notes)
                  VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(crypto.randomUUID(), requestId, product.id, product.category_slug, product.species, finish || null, drying || null, dimensions || null, volume || null, destination || null, internalItemNotes || null)
    ]);
  } catch (error) {
    console.error("Quote request insert failed", error);
    return reply(request, { ok: false, message: language === "ro" ? "Nu am putut trimite solicitarea. Încearcă din nou sau contactează-ne prin telefon ori e-mail." : "We couldn’t send your request. Please try again or contact us by phone or email." }, 503);
  }
  try {
    await db.prepare("UPDATE rate_limit_events SET succeeded = 1 WHERE id = ?").bind(rateEventId).run();
  } catch (error) {
    console.warn("Rate-limit success marker failed", error);
  }
  return reply(request, { ok: true, message: language === "ro" ? "Solicitarea a fost înregistrată. Mulțumim pentru interesul acordat!" : "Your enquiry has been received. Thank you for your interest!", redirect: returnPath });
};
