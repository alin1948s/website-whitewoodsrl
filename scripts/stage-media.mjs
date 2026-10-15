import { cp, mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "public", "images");
const optimized = path.join(root, "media", "optimized");
const outputRelative = path.relative(root, output);
if (outputRelative !== path.join("public", "images")) throw new Error("Refuz să modific un director media în afara public/images.");

const mode = process.argv[2] === "local" ? "local" : "production";
let approved = mode === "local";
if (mode === "production") {
  if (process.env.PUBLIC_MEDIA_APPROVED === "true") approved = true;
  else {
    const config = JSON.parse(await readFile(path.join(root, "wrangler.jsonc"), "utf8"));
    approved = config.env?.production?.vars?.PUBLIC_MEDIA_APPROVED === "true";
  }
}

await rm(output, { recursive: true, force: true });
if (approved) {
  await mkdir(path.dirname(output), { recursive: true });
  await cp(optimized, output, { recursive: true });
  console.log(`${mode}: derivatele media au fost copiate în public/images.`);
} else {
  console.log("Build de producție: fotografiile sunt omise până la aprobarea drepturilor de utilizare.");
}
