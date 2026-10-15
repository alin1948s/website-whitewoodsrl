import sharp from "sharp";
import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "media", "originals");
const outputRoot = path.join(root, "media", "optimized");
const manifest = JSON.parse(await readFile(path.join(root, "docs", "source-assets.json"), "utf8"));

const selections = [
  { name: "hero-yard", source: "img/img-1000/about-us-01.webp", alt: "Cherestea stivuită în curtea de lucru" },
  { name: "process-yard", source: "img/_ro/img-1000/depozit-cherestea-constanta.webp", alt: "Pachete de cherestea pregătite pentru transport" },
  { name: "container-loading", source: "img/_ro/img-1000/incarcare-cherestea-container-filler.webp", alt: "Cherestea așezată pe instalația de încărcare" },
  { name: "product-beech", source: "img/img-1000/sawn-timber-beech-type-a-01.webp", alt: "Cherestea de fag stivuită" },
  { name: "product-ash", source: "img/img-1000/ash-sawn-timber-type-a-01.webp", alt: "Cherestea de frasin stivuită" },
  { name: "product-softwood", source: "img/_ro/img-1000/cherestea-rasinoase-s4s-tip-a-01.webp", alt: "Cherestea rindeluită din rășinoase" },
  { name: "product-packaging", source: "img/_ro/img-1000/lemn-pentru-ambalat-tratat-ispm15.webp", alt: "Ambalaje realizate din lemn" }
];

const rows = [];
for (const selection of selections) {
  const input = path.join(sourceRoot, selection.source);
  const inputMeta = await stat(input);
  const metadata = await sharp(input).metadata();
  const widths = [...new Set([480, 960, metadata.width].filter((width) => width && width <= metadata.width))].sort((a, b) => a - b);
  const outputs = [];
  for (const width of widths) {
    const basename = `${selection.name}-${width}`;
    const webp = path.join(outputRoot, `${basename}.webp`);
    const avif = path.join(outputRoot, `${basename}.avif`);
    await mkdir(outputRoot, { recursive: true });
    await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toFile(webp);
    await sharp(input).resize({ width, withoutEnlargement: true }).avif({ quality: 55, effort: 4 }).toFile(avif);
    outputs.push({ width, webp: path.relative(root, webp).replaceAll(path.sep, "/"), avif: path.relative(root, avif).replaceAll(path.sep, "/") });
  }
  rows.push({ source: `media/originals/${selection.source}`, sourceBytes: inputMeta.size, width: metadata.width, height: metadata.height, alt: selection.alt, outputs });
}

await import("node:fs/promises").then(({ writeFile }) => writeFile(path.join(root, "docs", "optimized-assets.json"), `${JSON.stringify(rows, null, 2)}\n`, "utf8"));
console.log(`Derivate AVIF/WebP create pentru ${rows.length} fotografii selectate. Originalele nu au fost modificate.`);
for (const row of rows) console.log(`${row.source}: ${row.width}x${row.height}`);
