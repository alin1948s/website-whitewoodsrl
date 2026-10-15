import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://whitewoodtrading.com";
const STARTS = [new URL("/", ORIGIN), new URL("/ro/acasa.html", ORIGIN)];
const HTML_LIMIT = 100;
const SOURCE_DIR = path.join(ROOT, "media", "originals");
const MANIFEST_FILE = path.join(ROOT, "docs", "source-assets.json");
const IMAGE_EXTENSIONS = /\.(?:webp|avif|jpe?g|png|gif|svg|pdf)(?:$|\?)/i;

const pageQueue = [...STARTS];
const seenPages = new Map();
const assets = new Map();

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match?.[1] ?? "";
}

function resolvedUrl(value, base) {
  try {
    const url = new URL(value.trim().split(/\s+/)[0], base);
    url.hash = "";
    if (url.host !== new URL(ORIGIN).host || url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

function addAsset(url, pageUrl, alt = "") {
  if (!IMAGE_EXTENSIONS.test(url.pathname)) return;
  const entry = assets.get(url.href) ?? { url: url.href, pages: new Set(), sourceAlt: new Set() };
  entry.pages.add(pageUrl.pathname || "/");
  if (alt.trim()) entry.sourceAlt.add(alt.trim());
  assets.set(url.href, entry);
}

for (let index = 0; pageQueue.length && seenPages.size < HTML_LIMIT; index += 1) {
  const pageUrl = pageQueue.shift();
  if (seenPages.has(pageUrl.href)) continue;
  try {
    const response = await fetch(pageUrl, { signal: AbortSignal.timeout(20000) });
    if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) continue;
    const html = await response.text();
    seenPages.set(pageUrl.href, { status: response.status, title: attribute(html.match(/<title\b[^>]*>([^<]*)/i)?.[0] ?? "", "content") });

    for (const tagMatch of html.matchAll(/<(?:img|source|link|a)\b[^>]*>/gi)) {
      const tag = tagMatch[0];
      const alt = attribute(tag, "alt");
      for (const name of ["src", "data-src", "href"]) {
        const raw = attribute(tag, name);
        if (!raw) continue;
        const url = resolvedUrl(raw, pageUrl);
        if (!url) continue;
        if (IMAGE_EXTENSIONS.test(url.pathname)) addAsset(url, pageUrl, alt);
        else if (/\.html?$/i.test(url.pathname) && !seenPages.has(url.href)) pageQueue.push(url);
      }
      const srcset = attribute(tag, "srcset");
      for (const candidate of srcset.split(",")) {
        const url = resolvedUrl(candidate, pageUrl);
        if (url) addAsset(url, pageUrl, alt);
      }
    }
  } catch (error) {
    console.warn(`Nu s-a putut citi ${pageUrl.href}: ${error.message}`);
  }
}

await mkdir(SOURCE_DIR, { recursive: true });
const entries = [...assets.values()].sort((a, b) => a.url.localeCompare(b.url));
let completed = 0;
let nextIndex = 0;

async function downloadWorker() {
  while (nextIndex < entries.length) {
    const entry = entries[nextIndex++];
    const url = new URL(entry.url);
    const relativePath = url.pathname.replace(/^\/+/, "");
    const localPath = path.join(SOURCE_DIR, relativePath);
    await mkdir(path.dirname(localPath), { recursive: true });
    try {
      let body;
      try {
        body = await readFile(localPath);
      } catch {
        const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        body = Buffer.from(await response.arrayBuffer());
        await writeFile(localPath, body, { flag: "wx" }).catch(async (error) => {
          if (error.code !== "EEXIST") throw error;
          body = await readFile(localPath);
        });
      }
      entry.localPath = path.relative(ROOT, localPath).replaceAll(path.sep, "/");
      entry.bytes = (await stat(localPath)).size;
      entry.sha256 = createHash("sha256").update(body).digest("hex");
    } catch (error) {
      entry.error = error.message;
    }
    entry.pages = [...entry.pages].sort();
    entry.sourceAlt = [...entry.sourceAlt].sort();
    completed += 1;
    if (completed % 20 === 0 || completed === entries.length) console.log(`Media copiată: ${completed}/${entries.length}`);
  }
}

await Promise.all(Array.from({ length: Math.min(6, entries.length) }, downloadWorker));
await writeFile(
  MANIFEST_FILE,
  `${JSON.stringify({ source: ORIGIN, crawledAt: new Date().toISOString(), pages: [...seenPages.keys()].sort(), assets: entries }, null, 2)}\n`,
  "utf8"
);
console.log(`Pagini HTML: ${seenPages.size}; asset-uri identificate: ${entries.length}; manifest: ${path.relative(ROOT, MANIFEST_FILE)}`);
