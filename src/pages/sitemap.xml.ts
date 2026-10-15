import type { APIRoute } from "astro";
import { getDatabase } from "../lib/db";
import { getPublishedArticles, getPublishedProducts } from "../lib/repositories";

const xml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");

export const GET: APIRoute = async ({ site }) => {
  const origin = site?.origin || "https://whitewoodtrading.com";
  const db = getDatabase();
  const [roProducts, enProducts, roArticles, enArticles] = await Promise.all([
    getPublishedProducts(db, "ro", "production"),
    getPublishedProducts(db, "en", "production"),
    getPublishedArticles(db, "ro", "production"),
    getPublishedArticles(db, "en", "production")
  ]);
  const paths = new Set([
    "/ro/", "/en/", "/ro/produse/", "/en/products/",
    "/ro/despre/", "/en/about/", "/ro/proces/", "/en/process/",
    "/ro/articole/", "/en/articles/", "/ro/contact/", "/en/contact/",
    ...roProducts.map((product) => `/ro/produse/${product.slug}/`),
    ...enProducts.map((product) => `/en/products/${product.slug}/`),
    ...roArticles.map((article) => `/ro/articole/${article.slug}/`),
    ...enArticles.map((article) => `/en/articles/${article.slug}/`)
  ]);
  const rows = [...paths].sort().map((pathname) => `  <url><loc>${xml(new URL(pathname, origin).href)}</loc></url>`).join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
};
