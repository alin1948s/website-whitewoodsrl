import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(path.join(root, "docs", "source-assets.json"), "utf8"));
const quote = (value) => value == null ? "NULL" : `'${String(value).replaceAll("'", "''")}'`;
const statements = [];
const linked = new Set();

for (const asset of manifest.assets) {
  if (!asset.localPath) continue;
  const originalPath = asset.localPath;
  const assetPath = originalPath;
  let width = null;
  let height = null;
  try {
    const meta = await sharp(path.join(root, originalPath)).metadata();
    width = meta.width ?? null;
    height = meta.height ?? null;
  } catch {}
  const imageUrl = new URL(asset.url);
  const extension = path.extname(imageUrl.pathname).toLowerCase();
  const mediaType = ({
    ".avif": "image/avif", ".gif": "image/gif", ".jpeg": "image/jpeg", ".jpg": "image/jpeg",
    ".pdf": "application/pdf", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp"
  })[extension] ?? "application/octet-stream";
  const inferredAlt = asset.sourceAlt?.[0] || imageUrl.pathname.split("/").pop().replace(/[-_]+/g, " ").replace(/\.(webp|png|svg|jpe?g)$/i, "");
  const id = `asset-${createHash("sha256").update(imageUrl.pathname).digest("hex").slice(0, 24)}`;
  statements.push(`INSERT OR IGNORE INTO assets (id,path,original_path,source_url,alt_ro,alt_en,media_type,width,height,bytes,rights_status,status,is_demo) VALUES (${quote(id)},${quote(assetPath)},${quote(originalPath)},${quote(asset.url)},${quote(inferredAlt)},${quote(asset.sourceAlt?.[0] || null)},${quote(mediaType)},${width ?? "NULL"},${height ?? "NULL"},${asset.bytes ?? "NULL"},'needs_confirmation','needs_review',1);`);

  const file = imageUrl.pathname.toLowerCase();
  const associations = [];
  if (file.includes("beech") || file.includes("fag")) associations.push(["product", "product-beech"]);
  if (file.includes("ash") || file.includes("frasin")) associations.push(["product", "product-ash"]);
  if (file.includes("softwood") || file.includes("spruce") || file.includes("rasinoase") || file.includes("molid")) associations.push(["product", "product-softwood"]);
  if (file.includes("wood-package") || file.includes("packag") || file.includes("ambalat")) associations.push(["product", "product-packaging"]);
  if (file.includes("container") || file.includes("incarcare") || file.includes("logistic") || file.includes("depozit")) associations.push(["page", "page-process-ro"]);
  if (file.includes("/few/") || file.includes("about-us") || file.includes("timber-manufacturer")) associations.push(["page", "page-home-ro"]);
  for (const [targetType, targetId] of associations) {
    const linkKey = `${id}:${targetType}:${targetId}`;
    if (linked.has(linkKey)) continue;
    linked.add(linkKey);
    const linkId = `link-${createHash("sha256").update(linkKey).digest("hex").slice(0, 24)}`;
    statements.push(`INSERT OR IGNORE INTO content_asset_links (id,asset_id,target_type,target_id,sort_order) VALUES (${quote(linkId)},${quote(id)},${quote(targetType)},${quote(targetId)},0);`);
  }
}

const sqlPath = path.join(root, "seeds", "local-assets.generated.sql");
await writeFile(sqlPath, `-- Generated from docs/source-assets.json. Local demo metadata only.\n${statements.join("\n")}\n`, "utf8");
console.log(`Generated ${manifest.assets.length} local asset records and ${linked.size} associations.`);
