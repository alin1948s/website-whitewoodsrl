import { env } from "cloudflare:workers";
import type { D1Database } from "@cloudflare/workers-types";

export type SiteLanguage = "ro" | "en";
export type AppMode = "local" | "production";

export interface AppEnvironment {
  DB: D1Database;
  APP_MODE?: string;
  SITE_ORIGIN?: string;
  SESSION_SECRET?: string;
  ADMIN_BOOTSTRAP_TOKEN?: string;
  PRIVACY_NOTICE_APPROVED?: string;
  PUBLIC_MEDIA_APPROVED?: string;
}

export class DatabaseUnavailableError extends Error {
  constructor() {
    super("Baza de date nu este disponibilă; operația nu a fost confirmată.");
    this.name = "DatabaseUnavailableError";
  }
}

export function getEnvironment(): AppEnvironment {
  return env as unknown as AppEnvironment;
}

export function getDatabase(): D1Database {
  const database = getEnvironment().DB;
  if (!database) throw new DatabaseUnavailableError();
  return database;
}

export function getAppMode(): AppMode {
  return getEnvironment().APP_MODE === "production" ? "production" : "local";
}

export function getSiteOrigin(requestUrl?: string): string {
  const configured = getEnvironment().SITE_ORIGIN;
  if (configured) return configured.replace(/\/$/, "");
  return requestUrl ? new URL(requestUrl).origin : "http://localhost:4321";
}

export function mediaIsAllowed(): boolean {
  const environment = getEnvironment();
  return environment.APP_MODE !== "production" || environment.PUBLIC_MEDIA_APPROVED === "true";
}
