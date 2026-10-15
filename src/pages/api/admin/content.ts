import type { APIRoute } from "astro";
import { allowedSlug, allowedStatus, authorizeAdminForm, cleanField, isAuthorized, redirectAdmin } from "../../../lib/admin-endpoint";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const authorized = await authorizeAdminForm(request);
  if (!isAuthorized(authorized)) return authorized;
  const { db, session, data } = authorized;
  const action = cleanField(data, "action", 30);

  if (action === "save-page") {
    const id = cleanField(data, "id", 80) || crypto.randomUUID();
    const slug = cleanField(data, "slug", 120);
    const language = cleanField(data, "language", 2);
    const title = cleanField(data, "title", 180);
    const intro = cleanField(data, "intro", 1000);
    const body = cleanField(data, "body", 12000);
    const seoTitle = cleanField(data, "seo_title", 180);
    const seoDescription = cleanField(data, "seo_description", 300);
    const status = cleanField(data, "status", 20);
    const requiresReview = data.get("requires_review") === "1" ? 1 : 0;
    if (!allowedSlug(slug) || !(language === "ro" || language === "en") || !title || !allowedStatus(status)) return new Response("Datele paginii nu sunt valide.", { status: 400 });
    const existing = await db.prepare("SELECT id FROM content_pages WHERE id = ? LIMIT 1").bind(id).first<{ id: string }>();
    const statement = existing
      ? db.prepare("UPDATE content_pages SET slug=?,language=?,title=?,intro=?,body=?,seo_title=?,seo_description=?,status=?,requires_review=?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
          .bind(slug, language, title, intro || null, body || null, seoTitle || null, seoDescription || null, status, requiresReview, id)
      : db.prepare("INSERT INTO content_pages (id,slug,language,title,intro,body,seo_title,seo_description,status,requires_review,is_demo) VALUES (?,?,?,?,?,?,?,?,?,?,0)")
          .bind(id, slug, language, title, intro || null, body || null, seoTitle || null, seoDescription || null, status, requiresReview);
    await db.batch([
      statement,
      db.prepare("INSERT INTO audit_log (admin_id,entity_type,entity_id,action,summary) VALUES (?,'content_page',?,?,?)")
        .bind(session.id, id, existing ? "update" : "create", `${language} · ${title}`.slice(0, 250))
    ]);
    return redirectAdmin("/admin/content/?saved=1");
  }

  if (action === "save-article") {
    const id = cleanField(data, "id", 80) || crypto.randomUUID();
    const slugRo = cleanField(data, "slug_ro", 120);
    const slugEn = cleanField(data, "slug_en", 120);
    const titleRo = cleanField(data, "title_ro", 180);
    const titleEn = cleanField(data, "title_en", 180);
    const excerptRo = cleanField(data, "excerpt_ro", 1000);
    const excerptEn = cleanField(data, "excerpt_en", 1000);
    const bodyRo = cleanField(data, "body_ro", 16000);
    const bodyEn = cleanField(data, "body_en", 16000);
    const sourceRo = cleanField(data, "source_url_ro", 500);
    const sourceEn = cleanField(data, "source_url_en", 500);
    const sourceDate = cleanField(data, "source_date", 20);
    const publishedAt = cleanField(data, "published_at", 20);
    const seoTitleRo = cleanField(data, "seo_title_ro", 180);
    const seoTitleEn = cleanField(data, "seo_title_en", 180);
    const seoDescriptionRo = cleanField(data, "seo_description_ro", 300);
    const seoDescriptionEn = cleanField(data, "seo_description_en", 300);
    const status = cleanField(data, "status", 20);
    const requiresReview = data.get("requires_review") === "1" ? 1 : 0;
    if (!allowedSlug(slugRo) || !allowedSlug(slugEn) || !titleRo || !titleEn || !allowedStatus(status)) return new Response("Datele articolului nu sunt valide.", { status: 400 });
    const existing = await db.prepare("SELECT id FROM articles WHERE id = ? LIMIT 1").bind(id).first<{ id: string }>();
    const statement = existing
      ? db.prepare(`UPDATE articles SET slug_ro=?,slug_en=?,title_ro=?,title_en=?,excerpt_ro=?,excerpt_en=?,body_ro=?,body_en=?,source_url_ro=?,source_url_en=?,source_date=?,published_at=?,seo_title_ro=?,seo_title_en=?,seo_description_ro=?,seo_description_en=?,status=?,requires_review=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
          .bind(slugRo, slugEn, titleRo, titleEn, excerptRo || null, excerptEn || null, bodyRo || null, bodyEn || null, sourceRo || null, sourceEn || null, sourceDate || null, publishedAt || null, seoTitleRo || null, seoTitleEn || null, seoDescriptionRo || null, seoDescriptionEn || null, status, requiresReview, id)
      : db.prepare(`INSERT INTO articles (id,slug_ro,slug_en,title_ro,title_en,excerpt_ro,excerpt_en,body_ro,body_en,source_url_ro,source_url_en,source_date,published_at,seo_title_ro,seo_title_en,seo_description_ro,seo_description_en,status,requires_review,is_demo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0)`)
          .bind(id, slugRo, slugEn, titleRo, titleEn, excerptRo || null, excerptEn || null, bodyRo || null, bodyEn || null, sourceRo || null, sourceEn || null, sourceDate || null, publishedAt || null, seoTitleRo || null, seoTitleEn || null, seoDescriptionRo || null, seoDescriptionEn || null, status, requiresReview);
    await db.batch([
      statement,
      db.prepare("INSERT INTO audit_log (admin_id,entity_type,entity_id,action,summary) VALUES (?,'article',?,?,?)")
        .bind(session.id, id, existing ? "update" : "create", `${status}: ${titleRo}`.slice(0, 250))
    ]);
    return redirectAdmin("/admin/content/?saved=1#articles");
  }

  if (action === "save-asset") {
    const id = cleanField(data, "id", 100);
    const altRo = cleanField(data, "alt_ro", 240);
    const altEn = cleanField(data, "alt_en", 240);
    const status = cleanField(data, "status", 30);
    const rightsStatus = cleanField(data, "rights_status", 30);
    const associationsRaw = cleanField(data, "associations", 1200);
    if (!id || !(status === "needs_review" || status === "approved" || status === "archived") || !(rightsStatus === "needs_confirmation" || rightsStatus === "approved" || rightsStatus === "rejected")) return new Response("Datele asset-ului nu sunt valide.", { status: 400 });
    const associations = associationsRaw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (associations.length > 20) return new Response("Un asset poate avea cel mult 20 de asocieri.", { status: 400 });
    const targets: Array<{ type: "page" | "product" | "article"; id: string }> = [];
    for (const association of associations) {
      const [type, ...idParts] = association.split(":");
      const targetId = idParts.join(":").trim();
      if (!(type === "page" || type === "product" || type === "article") || !targetId || targetId.length > 100) return new Response("Format asociere: page:id, product:id sau article:id.", { status: 400 });
      const table = type === "page" ? "content_pages" : type === "product" ? "products" : "articles";
      const found = await db.prepare(`SELECT id FROM ${table} WHERE id = ? LIMIT 1`).bind(targetId).first<{ id: string }>();
      if (!found) return new Response(`Nu există ${type} cu ID ${targetId}.`, { status: 400 });
      targets.push({ type, id: targetId });
    }
    const asset = await db.prepare("SELECT path FROM assets WHERE id = ? LIMIT 1").bind(id).first<{ path: string }>();
    if (!asset) return new Response("Asset-ul nu există.", { status: 404 });
    const statements = [
      db.prepare("UPDATE assets SET alt_ro=?,alt_en=?,status=?,rights_status=? WHERE id=?").bind(altRo || null, altEn || null, status, rightsStatus, id),
      db.prepare("DELETE FROM content_asset_links WHERE asset_id = ?").bind(id)
    ];
    for (const [index, target] of targets.entries()) statements.push(
      db.prepare("INSERT INTO content_asset_links (id,asset_id,target_type,target_id,sort_order) VALUES (?,?,?,?,?)")
        .bind(crypto.randomUUID(), id, target.type, target.id, index)
    );
    statements.push(db.prepare("INSERT INTO audit_log (admin_id,entity_type,entity_id,action,summary) VALUES (?,'asset',?,'update',?)")
      .bind(session.id, id, `${status}/${rightsStatus}: ${asset.path}`.slice(0, 250)));
    await db.batch(statements);
    return redirectAdmin("/admin/content/?saved=1#assets");
  }

  if (action === "save-translation") {
    const id = cleanField(data, "id", 80) || crypto.randomUUID();
    const key = cleanField(data, "translation_key", 120);
    const language = cleanField(data, "language", 2);
    const value = cleanField(data, "value", 3000);
    const approval = cleanField(data, "approval_status", 30);
    if (!/^[a-z0-9._-]+$/.test(key) || !(language === "ro" || language === "en") || !value || !(approval === "needs_review" || approval === "approved")) return new Response("Traducerea nu este validă.", { status: 400 });
    await db.batch([
      db.prepare(`INSERT INTO translations (id,translation_key,language,value,approval_status) VALUES (?,?,?,?,?)
                  ON CONFLICT(translation_key,language) DO UPDATE SET value=excluded.value,approval_status=excluded.approval_status,updated_at=CURRENT_TIMESTAMP`)
        .bind(id, key, language, value, approval),
      db.prepare("INSERT INTO audit_log (admin_id,entity_type,entity_id,action,summary) VALUES (?,'translation',?,'update',?)")
        .bind(session.id, `${key}:${language}`, `${approval}: ${key}`.slice(0, 250))
    ]);
    return redirectAdmin("/admin/content/?saved=1#translations");
  }

  return new Response("Acțiunea solicitată nu este disponibilă.", { status: 400 });
};
