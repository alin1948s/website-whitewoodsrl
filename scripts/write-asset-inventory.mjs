import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "docs", "source-assets.json");
const inventoryPath = path.join(root, "docs", "ASSET_INVENTORY.md");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

const dictionary = [
  [/cherestea|sawn.?timber|timber/gi, "cherestea"],
  [/beech/gi, "fag"],
  [/ash/gi, "frasin"],
  [/softwood/gi, "rășinoase"],
  [/spruce/gi, "molid"],
  [/fir/gi, "brad"],
  [/rough/gi, "brută"],
  [/edge/gi, "tivită"],
  [/container.?filler/gi, "încărcarea containerului"],
  [/container/gi, "container"],
  [/loading|incarcare/gi, "încărcare"],
  [/package|packag/gi, "ambalaj"],
  [/wood/gi, "lemn"],
  [/about.?us/gi, "activitatea WhiteWOOD"],
  [/craftsmanship/gi, "prelucrarea lemnului"],
  [/carpenter/gi, "prelucrarea lemnului"],
  [/multiple.?uses/gi, "utilizări multiple"],
  [/eco.?house/gi, "casă din lemn"],
  [/depozit/gi, "depozit"],
  [/fag/gi, "fag"],
  [/frasin/gi, "frasin"],
  [/rasinoase/gi, "rășinoase"],
  [/ambalat/gi, "ambalaj"],
  [/logistica/gi, "logistică"],
  [/servicii/gi, "servicii"],
  [/producator/gi, "producător"],
  [/firma/gi, "companie"],
  [/lemn/gi, "lemn"]
];

function humanize(file) {
  let value = path.posix.basename(file, path.posix.extname(file)).replace(/-\d+$/, "").replace(/[-_]+/g, " ");
  for (const [pattern, replacement] of dictionary) value = value.replace(pattern, replacement);
  value = value.replace(/\s+/g, " ").trim();
  return value ? `${value[0].toLocaleUpperCase("ro-RO")}${value.slice(1)}` : "Asset WhiteWOOD";
}

function placement(asset) {
  const file = asset.url.toLowerCase();
  if (file.includes("/svg/harta")) return "Păstrat în arhivă; nefolosit până la reconfirmarea destinațiilor de export.";
  if (file.includes("/svg/ippc")) return "Păstrat în arhivă; nefolosit până la reconfirmarea produsului și dreptului de utilizare a marcajului.";
  if (file.includes("pattern-green")) return "Păstrat în arhivă; nefolosit, aparține direcției grafice a vechiului site.";
  if (file.includes("/ico/")) return "Păstrat în arhivă; faviconul nou se decide după aprobarea logo-ului.";
  if (file.includes("/logo/")) return "Header/footer, după confirmarea drepturilor asupra logo-ului.";
  if (file.includes("/arts/")) return "Arhivă de articole; ascuns până la revizia conținutului vechi.";
  if (file.includes("wood-package") || file.includes("ambalat")) return "Pagina produsului pentru ambalaje, după reconfirmarea ofertei și tratamentelor.";
  if (file.includes("container") || file.includes("incarcare") || file.includes("logistica") || file.includes("depozit")) return "Pagina de proces și logistică, după inspecția cadrului și reconfirmarea afirmațiilor comerciale.";
  if (file.includes("beech") || file.includes("fag")) return "Pagina produsului fag și galeria de produse.";
  if (file.includes("ash") || file.includes("frasin")) return "Pagina produsului frasin și galeria de produse.";
  if (file.includes("softwood") || file.includes("spruce") || file.includes("rasinoase") || file.includes("molid")) return "Pagina rășinoaselor/molidului și galeria de produse.";
  if (file.includes("/few/")) return "Pagina principală; se alege numai după compararea rezoluției și conținutului.";
  if (file.includes("about-us") || file.includes("firma") || file.includes("producator") || file.includes("craftsmanship")) return "Pagina despre WhiteWOOD, numai dacă fotografia este relevantă și autorizată.";
  return "Se păstrează; utilizarea finală depinde de inspecția vizuală.";
}

function alt(asset) {
  const useful = asset.sourceAlt?.find((value) => value.length > 3 && !/^image\s*:/i.test(value));
  return useful || humanize(new URL(asset.url).pathname);
}

function note(asset) {
  if (asset.error) return `Nu s-a putut descărca: ${asset.error}.`;
  const pathPart = new URL(asset.url).pathname;
  const dimensions = pathPart.match(/img-(\d+)/i)?.[1];
  const size = asset.bytes ? `${(asset.bytes / 1024).toFixed(1)} KB` : "dimensiune necunoscută";
  const resolution = dimensions ? `variantă servită din directorul img-${dimensions}` : "dimensiune publicată de site";
  return `${resolution}; ${size}. Sursă WhiteWOOD, drepturi/versiune curentă de confirmat. Altul final se verifică după inspecția fotografiei.`;
}

const rows = manifest.assets.map((asset) => {
  const sourcePath = new URL(asset.url).pathname;
  const localPath = asset.localPath ? `\`${asset.localPath}\`` : "—";
  const pageList = asset.pages?.length ? asset.pages.map((page) => `\`${page}\``).join(", ") : "pagina sursă necunoscută";
  return `| \`${sourcePath}\` | ${localPath} | ${placement(asset)} | ${alt(asset).replaceAll("|", "\\|")} | ${note(asset).replaceAll("|", "\\|")} Pagină: ${pageList} |`;
});

const header = `# WhiteWOOD SRL — inventar de asset-uri

Ultima actualizare: 10 octombrie 2026

## Proveniență și stare

Crawlerul a parcurs **${manifest.pages.length} pagini HTML** din site-ul public și a identificat **${manifest.assets.length} URL-uri media unice**, incluzând toate variantele responsive srcset. Copiile descărcate din site se păstrează intacte în media/originals/, în afara directorului public; derivatele optimizate se generează separat în media/optimized/. Numai după aprobarea drepturilor, scriptul de pregătire poate copia derivatele în public/images/. Manifestul cu URL, hash SHA-256, mărime și paginile sursă este în source-assets.json.

Aceste fișiere sunt variante publicate/redimensionate, nu neapărat originale de cameră. Deși provin din website-ul WhiteWOOD, drepturile de reutilizare și aprobarea pentru redesign trebuie confirmate de companie. Mărimile și hash-urile fișierelor sunt măsurate; dimensiunile pixel și subiectele fotografiilor au fost verificate vizual pentru selecția de șase imagini optimizate. Alt-urile sunt propuneri inițiale și se aliniază la fotografia inspectată înainte de lansare.

Harta exportului și marcajele IPPC sunt arhivate, dar nu apar în designul nou până la reconfirmarea informațiilor și drepturilor. Patternul grafic vechi și iconurile vechi se păstrează, însă designul nou nu depinde de ele. Articolele din 2017/2021 se păstrează pentru revizie și nu sunt afișate drept conținut actual.

## Inventarul fișier cu fișier

| Sursă publică | Copie locală intactă | Utilizare propusă / decizie | Alt text propus | Calitate, drepturi și pagină sursă |
|---|---|---|---|---|
${rows.join("\n")}
`;

await writeFile(inventoryPath, header, "utf8");
console.log(`Inventar generat: ${manifest.assets.length} fișiere în docs/ASSET_INVENTORY.md`);
