import type { D1Database } from "@cloudflare/workers-types";
import { getEnvironment } from "./db";
import { base64UrlToBytes, bytesToBase64Url, constantTimeEqual, csrfForSession, derivePasswordHash, readCookie, sha256 } from "./security";

const SESSION_COOKIE = "ww_admin";
const SESSION_LIFETIME_SECONDS = 60 * 60 * 8;
const MAX_FAILED_LOGINS = 5;

export interface AdminSession {
  id: string;
  email: string;
  token: string;
  csrf: string;
}

interface StoredSession {
  id: string;
  email: string;
  token_hash: string;
  expires_at: string;
}

function randomToken(bytes = 32): string {
  const value = crypto.getRandomValues(new Uint8Array(bytes));
  return bytesToBase64Url(value);
}

export async function createAdminSession(db: D1Database, request: Request, admin: { id: string; email: string }): Promise<{ session: AdminSession; cookie: string }> {
  const token = randomToken();
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_SECONDS * 1000).toISOString();
  await db.prepare("INSERT INTO admin_sessions (token_hash, admin_id, expires_at) VALUES (?, ?, ?)")
    .bind(tokenHash, admin.id, expiresAt).run();
  const secret = getEnvironment().SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET nu este configurat.");
  const csrf = await csrfForSession(token, secret);
  return {
    session: { id: admin.id, email: admin.email, token, csrf },
    cookie: sessionCookie(token, request)
  };
}

function sessionCookie(token: string, request: Request): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_LIFETIME_SECONDS}${secure}`;
}

export function expiredSessionCookie(request: Request): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export async function getAdminSession(db: D1Database, request: Request): Promise<AdminSession | null> {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token || token.length > 128) return null;
  const tokenHash = await sha256(token);
  const row = await db.prepare(`
    SELECT s.token_hash, s.expires_at, u.id, u.email
      FROM admin_sessions s
      JOIN admin_users u ON u.id = s.admin_id
     WHERE s.token_hash = ? AND u.is_active = 1
     LIMIT 1
  `).bind(tokenHash).first<StoredSession>();
  if (!row) return null;
  if (Date.parse(row.expires_at) <= Date.now()) {
    await db.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").bind(tokenHash).run();
    return null;
  }
  const secret = getEnvironment().SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET nu este configurat.");
  return { id: row.id, email: row.email, token, csrf: await csrfForSession(token, secret) };
}

export async function verifyCsrf(session: AdminSession, suppliedToken: string | null): Promise<boolean> {
  return Boolean(suppliedToken && constantTimeEqual(session.csrf, suppliedToken));
}

export async function countAdminUsers(db: D1Database): Promise<number> {
  const result = await db.prepare("SELECT COUNT(*) AS count FROM admin_users").first<{ count: number }>();
  return result?.count ?? 0;
}

export async function bootstrapAdmin(db: D1Database, request: Request, input: { email: string; password: string; token: string }): Promise<{ session: AdminSession; cookie: string }> {
  const environment = getEnvironment();
  const configuredToken = environment.ADMIN_BOOTSTRAP_TOKEN;
  if (!configuredToken || !constantTimeEqual(configuredToken, input.token)) throw new Error("Tokenul de inițializare nu este valid.");
  if (input.password.length < 12 || input.password.length > 200) throw new Error("Parola trebuie să aibă între 12 și 200 de caractere.");
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new Error("Adresa de e-mail nu este validă.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordHash = await derivePasswordHash(input.password, salt);
  const result = await db.prepare(`
    INSERT INTO admin_users (id, email, password_salt, password_hash)
    SELECT ?, ?, ?, ?
     WHERE NOT EXISTS (SELECT 1 FROM admin_users)
  `).bind(crypto.randomUUID(), email, bytesToBase64Url(salt), passwordHash).run();
  if (result.meta.changes !== 1) throw new Error("Contul inițial a fost deja creat.");
  const user = await db.prepare("SELECT id, email FROM admin_users WHERE email = ? LIMIT 1").bind(email).first<{ id: string; email: string }>();
  if (!user) throw new Error("Contul admin nu a putut fi încărcat după creare.");
  await db.prepare("INSERT INTO audit_log (admin_id, entity_type, entity_id, action, summary) VALUES (?, 'admin_user', ?, 'bootstrap', 'Primul cont admin a fost inițializat.')")
    .bind(user.id, user.id).run();
  return createAdminSession(db, request, user);
}

export async function authenticateAdmin(db: D1Database, request: Request, input: { email: string; password: string }): Promise<{ session: AdminSession; cookie: string } | null> {
  const email = input.email.trim().toLowerCase();
  const ip = request.headers.get("cf-connecting-ip") || "local";
  const scopeHash = await sha256(`admin-login:${email}:${ip}`);
  const recent = await db.prepare(`
    SELECT COUNT(*) AS count FROM rate_limit_events
     WHERE scope_hash = ? AND succeeded = 0 AND occurred_at > datetime('now', '-15 minutes')
  `).bind(scopeHash).first<{ count: number }>();
  if ((recent?.count ?? 0) >= MAX_FAILED_LOGINS) return null;

  const user = await db.prepare("SELECT id, email, password_salt, password_hash FROM admin_users WHERE email = ? COLLATE NOCASE AND is_active = 1 LIMIT 1")
    .bind(email).first<{ id: string; email: string; password_salt: string; password_hash: string }>();
  const salt = user ? base64UrlToBytes(user.password_salt) : new Uint8Array(16);
  const candidate = await derivePasswordHash(input.password.slice(0, 200), salt);
  const success = Boolean(user && constantTimeEqual(candidate, user.password_hash));
  await db.prepare("INSERT INTO rate_limit_events (scope_hash, succeeded) VALUES (?, ?)").bind(scopeHash, success ? 1 : 0).run();
  if (!success || !user) return null;
  await db.prepare("UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?").bind(user.id).run();
  await db.prepare("DELETE FROM admin_sessions WHERE admin_id = ? AND expires_at <= CURRENT_TIMESTAMP").bind(user.id).run();
  return createAdminSession(db, request, user);
}

export async function deleteAdminSession(db: D1Database, session: AdminSession): Promise<void> {
  await db.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").bind(await sha256(session.token)).run();
}

export async function addAuditEntry(db: D1Database, adminId: string, entityType: string, entityId: string, action: string, summary: string): Promise<void> {
  await db.prepare("INSERT INTO audit_log (admin_id, entity_type, entity_id, action, summary) VALUES (?, ?, ?, ?, ?)")
    .bind(adminId, entityType.slice(0, 40), entityId.slice(0, 120), action.slice(0, 40), summary.slice(0, 250)).run();
}
