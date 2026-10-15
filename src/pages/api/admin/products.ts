import type { APIRoute } from "astro";
import { allowedSlug, allowedStatus, authorizeAdminForm, cleanField, isAuthorized, redirectAdmin } from "../../../lib/admin-endpoint";

export const prerender = false;

interface EditableSpec {
  key: string;
  label_ro: string;
  label_en: string;
  value_ro: string;
  value_en: string;
  unit: string | null;
  is_confirmed: boolean;
  source_note: string | null;
}

function parseSpecs(raw: string): EditableSpec[] {
  const value: unknown = JSON.parse(raw || "[]");
  if (!Array.isArray(value) || value.length > 40) throw new Error("Folosește o listă JSON de cel mult 40 de valori.");
  return value.map((item) => {
    if (!item || typeof item !== "object") throw new Error("Formatul specificațiilor nu este valid.");
    const row = item as Record<string, unknown>;
    const required = ["key", "label_ro", "label_en", "value_ro", "value_en"];
    for (const key of required) if (typeof row[key] !== "string" || !String(row[key]).trim() || String(row[key]).length > (key.startsWith("label") ? 120 : 300)) throw new Error(`Câmp invalid în specificație: ${key}.`);
    if (row.is_confirmed !== undefined && typeof row.is_confirmed !== "boolean") throw new Error("is_confirmed trebuie să fie true sau false.");
    return {
      key: String(row.key).slice(0, 60),
      label_ro: String(row.label_ro).trim(),
      label_en: String(row.label_en).trim(),
      value_ro: String(row.value_ro).trim(),
      value_en: String(row.value_en).trim(),
      unit: typeof row.unit === "string" ? row.unit.slice(0, 30) : null,
      is_confirmed: row.is_confirmed === true,
      source_note: typeof row.source_note === "string" ? row.source_note.slice(0, 500) : null
    };
  });
}

export const POST: APIRoute = async ({ request }) => {
  const authorized = await authorizeAdminForm(request);
  if (!isAuthorized(authorized)) return authorized;
  const { db, session, data } = authorized;
  const action = cleanField(data, "action", 30);

  if (action === "save-category") {
    const id = cleanField(data, "id", 80) || `category-${crypto.randomUUID()}`;
    const slug = cleanField(data, "slug", 120);
    const nameRo = cleanField(data, "name_ro", 160);
    const nameEn = cleanField(data, "name_en", 160);
    const descriptionRo = cleanField(data, "description_ro", 1000);
    const descriptionEn = cleanField(data, "description_en", 1000);
    const status = cleanField(data, "status", 20);
    const sortText = cleanField(data, "sort_order", 4);
    const sortOrder = sortText ? Number(sortText) : 0;
    if (!allowedSlug(slug) || !nameRo || !nameEn || !allowedStatus(status) || !Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 9999) {
      return new Response("Completează numele, slug-ul, ordinea și starea categoriei cu valori valide.", { status: 400 });
    }
    const existing = await db.prepare("SELECT id FROM product_categories WHERE id=? LIMIT 1").bind(id).first<{ id: string }>();
    const saveCategory = existing
      ? db.prepare("UPDATE product_categories SET slug=?,name_ro=?,name_en=?,description_ro=?,description_en=?,sort_order=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
          .bind(slug, nameRo, nameEn, descriptionRo || null, descriptionEn || null, sortOrder, status, id)
      : db.prepare("INSERT INTO product_categories (id,slug,name_ro,name_en,description_ro,description_en,sort_order,status,is_demo) VALUES (?,?,?,?,?,?,?,?,0)")
          .bind(id, slug, nameRo, nameEn, descriptionRo || null, descriptionEn || null, sortOrder, status);
    await db.batch([
      saveCategory,
      db.prepare("INSERT INTO audit_log (admin_id,entity_type,entity_id,action,summary) VALUES (?,'product_category',?,?,?)")
        .bind(session.id, id, existing ? "update" : "create", `${status}: ${nameRo} / ${nameEn}`.slice(0, 250))
    ]);
    return redirectAdmin("/admin/products/?saved=1#categories");
  }

  const id = cleanField(data, "id", 80) || crypto.randomUUID();
  const categoryId = cleanField(data, "category_id", 80);
  const slugRo = cleanField(data, "slug_ro", 120);
  const slugEn = cleanField(data, "slug_en", 120);
  const species = cleanField(data, "species", 180);
  const titleRo = cleanField(data, "title_ro", 160);
  const titleEn = cleanField(data, "title_en", 160);
  const introRo = cleanField(data, "intro_ro", 900);
  const introEn = cleanField(data, "intro_en", 900);
  const useRo = cleanField(data, "use_ro", 900);
  const useEn = cleanField(data, "use_en", 900);
  const status = cleanField(data, "status", 20);
  const verification = cleanField(data, "verification_status", 40);
  if (!categoryId || !allowedSlug(slugRo) || !allowedSlug(slugEn) || !titleRo || !titleEn || !allowedStatus(status)) return new Response("Completează categoria, slug-urile, titlurile și starea cu valori valide.", { status: 400 });
  if (!(verification === "needs_review" || verification === "source_published" || verification === "company_confirmed")) return new Response("Starea de verificare nu este validă.", { status: 400 });
  if (status === "published" && verification !== "company_confirmed") return new Response("Pentru publicare, compania trebuie să confirme produsul.", { status: 400 });
  let specs: EditableSpec[];
  try { specs = parseSpecs(cleanField(data, "specs_json", 16000)); }
  catch (error) { return new Response(error instanceof Error ? error.message : "Specificațiile nu sunt valide.", { status: 400 }); }
  const category = await db.prepare("SELECT id,status FROM product_categories WHERE id = ? LIMIT 1").bind(categoryId).first<{ id: string; status: string }>();
  if (!category) return new Response("Categoria selectată nu există.", { status: 400 });
  if (status === "published" && category.status !== "published") return new Response("Publică mai întâi categoria acestui produs.", { status: 400 });

  const existing = await db.prepare("SELECT id FROM products WHERE id = ? LIMIT 1").bind(id).first<{ id: string }>();
  const updateProduct = existing
    ? db.prepare(`UPDATE products SET category_id=?,slug_ro=?,slug_en=?,species=?,title_ro=?,title_en=?,intro_ro=?,intro_en=?,use_ro=?,use_en=?,verification_status=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
        .bind(categoryId, slugRo, slugEn, species || null, titleRo, titleEn, introRo || null, introEn || null, useRo || null, useEn || null, verification, status, id)
    : db.prepare(`INSERT INTO products (id,category_id,slug_ro,slug_en,species,title_ro,title_en,intro_ro,intro_en,use_ro,use_en,verification_status,status,is_demo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,0)`)
        .bind(id, categoryId, slugRo, slugEn, species || null, titleRo, titleEn, introRo || null, introEn || null, useRo || null, useEn || null, verification, status);
  const statements = [updateProduct, db.prepare("DELETE FROM product_specs WHERE product_id = ?").bind(id)];
  for (const spec of specs) {
    statements.push(db.prepare(`INSERT INTO product_specs (id,product_id,spec_key,label_ro,label_en,value_ro,value_en,unit,is_confirmed,source_note,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(crypto.randomUUID(), id, spec.key, spec.label_ro, spec.label_en, spec.value_ro, spec.value_en, spec.unit, spec.is_confirmed ? 1 : 0, spec.source_note, statements.length));
  }
  statements.push(db.prepare("INSERT INTO audit_log (admin_id,entity_type,entity_id,action,summary) VALUES (?,'product',?,?,?)")
    .bind(session.id, id, existing ? "update" : "create", `${status}: ${titleRo}`.slice(0, 250)));
  await db.batch(statements);
  return redirectAdmin("/admin/products/?saved=1");
};
