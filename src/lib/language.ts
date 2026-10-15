import type { SiteLanguage } from "./db";
export type { SiteLanguage } from "./db";

export function isLanguage(value: string | undefined): value is SiteLanguage {
  return value === "ro" || value === "en";
}

export function languageOrRomanian(value: string | undefined): SiteLanguage {
  return isLanguage(value) ? value : "ro";
}

export const translations = {
  ro: {
    navigation: [
      { label: "Produse", href: "/ro/produse/" },
      { label: "Proces", href: "/ro/proces/" },
      { label: "Despre", href: "/ro/despre/" },
      { label: "Articole", href: "/ro/articole/" }
    ],
    contact: "Contact",
    quote: "Solicită o ofertă",
    home: "Acasă",
    read: "Vezi produsul",
    request: "Solicită o ofertă",
    review: "Informații de reconfirmat",
    footerNote: "WhiteWOOD SRL · Cherestea și grinzi pentru construcții, mobilier și ambalaje."
  },
  en: {
    navigation: [
      { label: "Products", href: "/en/products/" },
      { label: "Process", href: "/en/process/" },
      { label: "About", href: "/en/about/" },
      { label: "Journal", href: "/en/articles/" }
    ],
    contact: "Contact",
    quote: "Request a quote",
    home: "Home",
    read: "View product",
    request: "Request a quote",
    review: "Details to be reconfirmed",
    footerNote: "WhiteWOOD SRL · Sawn timber and beams for construction, furniture and packaging."
  }
} as const;

export const categorySlugs = ["beech", "ash", "softwood", "packaging"] as const;
export type CategorySlug = (typeof categorySlugs)[number];

export function categoryPath(language: SiteLanguage, category: CategorySlug): string {
  const slug = language === "ro"
    ? { beech: "fag", ash: "frasin", softwood: "rasinoase", packaging: "ambalaje" }[category]
    : category;
  return `/${language}/${language === "ro" ? "produse" : "products"}/${slug}/`;
}

export function productSlug(language: SiteLanguage, category: CategorySlug): string {
  return language === "ro"
    ? { beech: "fag", ash: "frasin", softwood: "rasinoase", packaging: "ambalaje" }[category]
    : category;
}

export function mapProductSlug(language: SiteLanguage, slug: string): CategorySlug | null {
  const roMap: Record<string, CategorySlug> = { fag: "beech", frasin: "ash", rasinoase: "softwood", ambalaje: "packaging" };
  if (language === "ro") return roMap[slug] ?? null;
  return categorySlugs.includes(slug as CategorySlug) ? (slug as CategorySlug) : null;
}
