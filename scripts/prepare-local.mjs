import { randomBytes } from "node:crypto";
import { access, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".dev.vars");
try {
  await access(envPath);
  console.log(".dev.vars există deja; fișierul nu a fost suprascris.");
} catch {
  const sessionSecret = randomBytes(48).toString("base64url");
  const bootstrapToken = randomBytes(32).toString("base64url");
  await writeFile(
    envPath,
    `APP_MODE=local\nSITE_ORIGIN=http://localhost:4321\nSESSION_SECRET=${sessionSecret}\nADMIN_BOOTSTRAP_TOKEN=${bootstrapToken}\nPRIVACY_NOTICE_APPROVED=false\n`,
    { encoding: "utf8", flag: "wx" }
  );
  console.log(".dev.vars creat cu secrete random locale (exclus din Git).");
  console.log("Tokenul inițial este stocat în .dev.vars; citește-l local când creezi primul cont la /admin/setup.");
}
