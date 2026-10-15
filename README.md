# WhiteWOOD SRL Website

A bilingual Romanian and English website for WhiteWOOD, with server-rendered editorial pages, a D1 catalogue, a B2B form and private administration.

## Screenshots

These screenshots show the English website.

### Home page

![WhiteWOOD home page in English](screenshots/home.jpg)

### Product catalogue

![WhiteWOOD timber catalogue in English](screenshots/products.jpg)

### Processing and logistics

![WhiteWOOD timber processing and preparation page in English](screenshots/process.jpg)

## Requirements

- Node.js 22.12 or later
- npm

A Cloudflare account is not needed for local development. Wrangler runs a local D1 database with the same schema as production D1.

## Local development

From this directory:

~~~powershell
npm ci
npm run db:setup:local
npm run dev
~~~

Open the local address printed by Astro. Setup creates **.dev.vars** only if that file does not already exist, applies migrations with **--local**, and loads demo data and the asset index into local D1. Data persists in **.wrangler/**, which is ignored by Git. **npm run dev** prepares AVIF/WebP derivatives in **public/images/**; original media copies remain in **media/originals/** outside the public directory.

For the first local account, open **/admin/setup/**, enter an email and a password of at least 12 characters, then use the token in the local, Git-ignored **.dev.vars** file. The setup page closes after the first account is created. There is no default account or password.

A request submitted in local mode is marked **LOCAL DEMO**, stored only in local D1 and visible at **/admin/requests/**. Email delivery is not configured. The local form does not indicate that a request was sent to the company.

## Checks and production build

~~~powershell
npm run check
npm run build
npm run preview
~~~

**npm run build** prepares the production version. Photographs are copied to **public/images/** only when **PUBLIC_MEDIA_APPROVED=true** is configured for production; the default is **false**. The runtime setting also controls image display. Recreate derivatives with **npm run assets:optimize** without changing the originals.

Inventory and media commands:

~~~powershell
npm run assets:inventory
npm run assets:optimize
~~~

## D1 and migrations

The server-side binding is named **DB**. Development uses persistent local D1 through Wrangler, while production uses the Cloudflare D1 database defined separately in **wrangler.jsonc**. Local mode does not use the production binding; if the database is unavailable, the site does not report the save as successful or automatically switch to another database.

**Local commands** — these do not access Cloudflare D1:

~~~powershell
npm run db:migrate:local
npm run db:seed:local
npm run db:setup:local
npx wrangler d1 export whitewoodsrl-local --local --output=./backup-local.sql
~~~

**Remote commands** — intentionally not run as part of this work:

~~~powershell
npm run db:migrate:production
npx wrangler d1 export whitewoodsrl-production --remote --env production --output=./backup-production.sql
~~~

Before any remote command, create/configure D1 in the WhiteWOOD Cloudflare account and replace the placeholder ID in **wrangler.jsonc** with the ID issued by Cloudflare. The remote migration command changes the Cloudflare database schema. Exports may contain personal data and must be stored with access controls.

## Cloudflare production

No Cloudflare resources were created, no remote migrations were run and no deployment was made. For a future launch:

1. Configure the production D1 database and its ID in **wrangler.jsonc**.
2. Review legal text and the enquiry processing flow; enable the form only after the privacy notice is approved.
3. Confirm rights to the photographs and approve the selection used on the website.
4. Configure server-side secrets:

   ~~~powershell
   npx wrangler secret put SESSION_SECRET --env production
   npx wrangler secret put ADMIN_BOOTSTRAP_TOKEN --env production
   ~~~

5. Set **PRIVACY_NOTICE_APPROVED=true** and **PUBLIC_MEDIA_APPROVED=true** in production variables only after the corresponding approvals. For the build, set **PUBLIC_MEDIA_APPROVED=true** in the build process environment or in **wrangler.jsonc**.
6. Apply migrations with **npm run db:migrate:production**, then create the first administrator at **/admin/setup/** using the one-time token. After bootstrap, remove **ADMIN_BOOTSTRAP_TOKEN** from the production environment.
7. Deploy only after checking the environment, IDs and approvals:

   ~~~powershell
   npm run deploy:production
   ~~~

Variable names: **APP_MODE**, **SITE_ORIGIN**, **SESSION_SECRET**, **ADMIN_BOOTSTRAP_TOKEN**, **PRIVACY_NOTICE_APPROVED** and **PUBLIC_MEDIA_APPROVED**. **DB** is a binding, not a text secret. Do not put secrets in code, Git or the browser. **.dev.vars** is ignored by Git.

## Pages and URLs

- RO: **/ro/**, **/ro/produse/**, **/ro/proces/**, **/ro/despre/**, **/ro/articole/**, **/ro/contact/**, **/ro/confidentialitate/** and **/ro/cookies/**.
- EN: **/en/**, **/en/products/**, **/en/process/**, **/en/about/**, **/en/articles/**, **/en/contact/**, **/en/privacy/** and **/en/cookies/**.
- Products and articles have detail pages; only confirmed products and approved articles are published.
- Admin: **/admin/** with login, initial setup, catalogue/categories, bilingual pages, articles, translations, media library, requests, notes and audit log.
- Redirects for old URLs are defined in **astro.config.mjs**. Old article URLs lead to the article archive pending review.
- **sitemap.xml** includes public pages, products and approved articles; **robots.txt** excludes the admin and API.

## Content status before launch

See the [implementation plan](docs/IMPLEMENTATION_PLAN.md) and [asset inventory](docs/ASSET_INVENTORY.md). Before publication, WhiteWOOD should reconfirm contact details, current stock and offers, specifications/moisture/dimensions, treatments and certifications, logistics routes, commercial rights for photographs, and privacy/cookie text. Demo technical fields should not be published in production until confirmed.

The form does not accept attachments because file storage is not configured. The local seed mirrors the contact details on the current WhiteWOOD page; they still need direct confirmation before importing them into production D1. No export map, capacity figures or certifications are displayed.

## Official technical references

- [Astro Cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [D1 local development](https://developers.cloudflare.com/d1/best-practices/local-development/)
- [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/)
- [Wrangler D1 commands and export](https://developers.cloudflare.com/d1/wrangler-commands/)
