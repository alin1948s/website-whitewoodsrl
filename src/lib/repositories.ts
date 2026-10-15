import type { AppMode, SiteLanguage } from "./db";
import type { D1Database } from "@cloudflare/workers-types";

export interface Product {
  id: string;
  categorySlug: string;
  species: string | null;
  title: string;
  intro: string;
  useText: string;
  verificationStatus: string;
  slug: string;
  isDemo: boolean;
  specs: ProductSpec[];
}

export interface ProductSpec {
  id: string;
  key: string;
  label: string;
  value: string;
  unit: string | null;
  sourceNote: string | null;
}

export interface ContentPage {
  id: string;
  slug: string;
  language: SiteLanguage;
  title: string;
  intro: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
  isDemo: boolean;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  date: string | null;
  isDemo: boolean;
  needsReview: boolean;
  seoTitle?: string | undefined;
  seoDescription?: string | undefined;
}

export interface ContentAsset {
  id: string;
  path: string;
  alt: string;
  bytes: number | null;
}

export async function getPublishedProducts(db: D1Database, language: SiteLanguage, mode: AppMode): Promise<Product[]> {
  const titleColumn = language === "ro" ? "p.title_ro" : "p.title_en";
  const introColumn = language === "ro" ? "p.intro_ro" : "p.intro_en";
  const useColumn = language === "ro" ? "p.use_ro" : "p.use_en";
  const slugColumn = language === "ro" ? "p.slug_ro" : "p.slug_en";
  const rows = await db.prepare(`
    SELECT p.id, c.slug AS category_slug, p.species, ${titleColumn} AS title,
           ${introColumn} AS intro, ${useColumn} AS use_text, p.verification_status,
           ${slugColumn} AS product_slug, p.is_demo
      FROM products p
      JOIN product_categories c ON c.id = p.category_id
     WHERE p.status = 'published'
       AND c.status = 'published'
       AND (p.is_demo = 0 OR (? = 'local' AND p.is_demo = 1))
       AND (p.verification_status = 'company_confirmed' OR (? = 'local' AND p.is_demo = 1))
     ORDER BY c.sort_order, ${titleColumn}
  `).bind(mode, mode).all<{
    id: string;
    category_slug: string;
    species: string | null;
    title: string;
    intro: string | null;
    use_text: string | null;
    verification_status: string;
    product_slug: string;
    is_demo: number;
  }>();

  return Promise.all((rows.results ?? []).map(async (row) => ({
    id: row.id,
    categorySlug: row.category_slug,
    species: row.species,
    title: row.title,
    intro: row.intro ?? "",
    useText: row.use_text ?? "",
    verificationStatus: row.verification_status,
    slug: row.product_slug,
    isDemo: row.is_demo === 1,
    specs: await getConfirmedSpecs(db, row.id, language)
  })));
}

async function getConfirmedSpecs(db: D1Database, productId: string, language: SiteLanguage): Promise<ProductSpec[]> {
  const labelColumn = language === "ro" ? "label_ro" : "label_en";
  const valueColumn = language === "ro" ? "value_ro" : "value_en";
  const rows = await db.prepare(`
    SELECT id, spec_key, ${labelColumn} AS label, ${valueColumn} AS value, unit, source_note
      FROM product_specs
     WHERE product_id = ? AND is_confirmed = 1
     ORDER BY sort_order, label
  `).bind(productId).all<{ id: string; spec_key: string; label: string; value: string; unit: string | null; source_note: string | null }>();
  return (rows.results ?? []).map((row) => ({
    id: row.id,
    key: row.spec_key,
    label: row.label,
    value: row.value,
    unit: row.unit,
    sourceNote: row.source_note
  }));
}

export async function getProductAssets(db: D1Database, productId: string, mode: AppMode): Promise<ContentAsset[]> {
  const rows = await db.prepare(`
    SELECT a.id, a.path, a.alt_ro, a.alt_en, a.bytes
      FROM assets a JOIN content_asset_links l ON l.asset_id = a.id
     WHERE l.target_type = 'product' AND l.target_id = ?
       AND (a.status = 'approved' OR (? = 'local' AND a.is_demo = 1))
       AND (a.rights_status = 'approved' OR (? = 'local' AND a.is_demo = 1))
       AND (a.is_demo = 0 OR (? = 'local' AND a.is_demo = 1))
     ORDER BY l.sort_order, a.path
  `).bind(productId, mode, mode, mode).all<{ id: string; path: string; alt_ro: string | null; alt_en: string | null; bytes: number | null }>();
  return (rows.results ?? []).map((row) => ({ id: row.id, path: row.path, alt: row.alt_ro || row.alt_en || "Fotografie WhiteWOOD", bytes: row.bytes }));
}

export async function getContentPage(db: D1Database, slug: string, language: SiteLanguage, mode: AppMode): Promise<ContentPage | null> {
  const row = await db.prepare(`
    SELECT id, slug, language, title, intro, body, seo_title, seo_description, is_demo
      FROM content_pages
     WHERE slug = ? AND language = ? AND status = 'published'
       AND (is_demo = 0 OR (? = 'local' AND is_demo = 1))
       AND (requires_review = 0 OR (? = 'local' AND is_demo = 1))
     LIMIT 1
  `).bind(slug, language, mode, mode).first<{
    id: string;
    slug: string;
    language: SiteLanguage;
    title: string;
    intro: string | null;
    body: string | null;
    seo_title: string | null;
    seo_description: string | null;
    is_demo: number;
  }>();
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    language: row.language,
    title: row.title,
    intro: row.intro ?? "",
    body: row.body ?? "",
    seoTitle: row.seo_title || row.title,
    seoDescription: row.seo_description ?? "",
    isDemo: row.is_demo === 1
  };
}

export async function getPublishedArticles(db: D1Database, language: SiteLanguage, mode: AppMode): Promise<Article[]> {
  const slugColumn = language === "ro" ? "slug_ro" : "slug_en";
  const titleColumn = language === "ro" ? "title_ro" : "title_en";
  const excerptColumn = language === "ro" ? "excerpt_ro" : "excerpt_en";
  const bodyColumn = language === "ro" ? "body_ro" : "body_en";
  const seoTitleColumn = language === "ro" ? "seo_title_ro" : "seo_title_en";
  const seoDescriptionColumn = language === "ro" ? "seo_description_ro" : "seo_description_en";
  const rows = await db.prepare(`
    SELECT id, ${slugColumn} AS slug, ${titleColumn} AS title,
           ${excerptColumn} AS excerpt, ${bodyColumn} AS body, published_at, is_demo,
           ${seoTitleColumn} AS seo_title, ${seoDescriptionColumn} AS seo_description
      FROM articles
     WHERE status = 'published' AND requires_review = 0
       AND (is_demo = 0 OR (? = 'local' AND is_demo = 1))
     ORDER BY published_at DESC, title
  `).bind(mode).all<{
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    body: string | null;
    published_at: string | null;
    is_demo: number;
    seo_title: string | null;
    seo_description: string | null;
  }>();
  return (rows.results ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    body: row.body ?? "",
    date: row.published_at,
    isDemo: row.is_demo === 1,
    needsReview: false,
    seoTitle: row.seo_title || row.title,
    seoDescription: row.seo_description || row.excerpt || ""
  }));
}

export async function getReviewArticles(db: D1Database, language: SiteLanguage, mode: AppMode): Promise<Article[]> {
  if (mode !== "local") return [];
  const slugColumn = language === "ro" ? "slug_ro" : "slug_en";
  const titleColumn = language === "ro" ? "title_ro" : "title_en";
  const excerptColumn = language === "ro" ? "excerpt_ro" : "excerpt_en";
  const rows = await db.prepare(`
    SELECT id, ${slugColumn} AS slug, ${titleColumn} AS title,
           ${excerptColumn} AS excerpt, published_at, source_date, is_demo
      FROM articles
     WHERE status = 'draft' AND requires_review = 1 AND is_demo = 1
     ORDER BY source_date DESC, title
  `).all<{
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    published_at: string | null;
    source_date: string | null;
    is_demo: number;
  }>();
  return (rows.results ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    body: "",
    date: row.published_at || row.source_date,
    isDemo: row.is_demo === 1,
    needsReview: true
  }));
}

export async function getArticleBySlug(db: D1Database, slug: string, language: SiteLanguage, mode: AppMode): Promise<Article | null> {
  const slugColumn = language === "ro" ? "slug_ro" : "slug_en";
  const titleColumn = language === "ro" ? "title_ro" : "title_en";
  const excerptColumn = language === "ro" ? "excerpt_ro" : "excerpt_en";
  const bodyColumn = language === "ro" ? "body_ro" : "body_en";
  const seoTitleColumn = language === "ro" ? "seo_title_ro" : "seo_title_en";
  const seoDescriptionColumn = language === "ro" ? "seo_description_ro" : "seo_description_en";
  const row = await db.prepare(`
    SELECT id, ${slugColumn} AS slug, ${titleColumn} AS title,
           ${excerptColumn} AS excerpt, ${bodyColumn} AS body, published_at, is_demo,
           ${seoTitleColumn} AS seo_title, ${seoDescriptionColumn} AS seo_description
      FROM articles
     WHERE ${slugColumn} = ? AND status = 'published' AND requires_review = 0
       AND (is_demo = 0 OR (? = 'local' AND is_demo = 1))
     LIMIT 1
  `).bind(slug, mode).first<{
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    body: string | null;
    published_at: string | null;
    is_demo: number;
    seo_title: string | null;
    seo_description: string | null;
  }>();
  if (!row) return null;
  return { id: row.id, slug: row.slug, title: row.title, excerpt: row.excerpt ?? "", body: row.body ?? "", date: row.published_at, isDemo: row.is_demo === 1, needsReview: false, seoTitle: row.seo_title || row.title, seoDescription: row.seo_description || row.excerpt || "" };
}
