# WhiteWOOD SRL — plan de implementare

Ultima actualizare: 10 octombrie 2026

## Stare

- Proiectul `websites/whitewoodsrl` a fost gol la începutul lucrării; nu există stack de păstrat.
- Recon-ul site-ului public, în română și engleză, a identificat 26 de pagini HTML și 289 de URL-uri media unice (inclusiv toate variantele responsive `srcset`). Lista și proveniența sunt în [`ASSET_INVENTORY.md`](./ASSET_INVENTORY.md) și [`source-assets.json`](./source-assets.json).
- Nu s-au accesat servicii Cloudflare și nu s-au rulat migrații remote.
- Seed-ul D1 local conține texte bilingve și specificații detaliate preluate din paginile publice WhiteWOOD. Interfața publică nu mai afișează anunțuri de tip draft, câmpuri goale sau mesaje de completat.
- D1 de producție rămâne nepopulat de această lucrare. Produsele, specificațiile și textele demo locale nu devin automat conținut de producție; afirmațiile care cer confirmare directă rămân listate mai jos.

## Fazele de lucru

| Fază | Livrabile | Stare |
|---|---|---|
| 1 — Recon și inventar | Auditul proiectului și al site-ului, URL map, inventarul media și lista de reconfirmări | Încheiată |
| 2 — Arhitectură | Astro + TypeScript strict, adapter Cloudflare Workers, schemă D1 versionată, repository server-side, D1 local persistent, autentificare admin, rutare bilingvă | Încheiată |
| 3 — Design system | Tokens CSS, tipografie, layout-uri responsive, navigație, motiv editorial inspirat de fibra și marcajele de sortare | Încheiată |
| 4 — Site public | Acasă, catalog și detalii de produs, proces/logistică, despre, arhivă de articole cu date și context istoric, formular ghidat, redirect-uri, sitemap și robots.txt | Încheiată |
| 5 — Admin și date | Login/bootstrap fără parolă implicită, categorii și produse, conținut bilingv, articole, asset-uri, cereri, note și audit log | Încheiată |
| 6 — Finisare | Responsive, accesibilitate, SEO, build/UI, ghid local și Cloudflare, backup/export | Încheiată |

## Structura site-ului

- `/ro/` și `/en/` pentru pagina principală și paginile editoriale.
- Produse: `/ro/produse/fag`, `/ro/produse/frasin`, `/ro/produse/rasinoase`, `/ro/produse/ambalaje` și corespondentele în engleză. Seed-ul local prezintă dimensiunile, finisajele, umiditatea, utilizările și normele publicate.
- `/ro/proces`, `/ro/despre`, `/ro/articole`, `/ro/contact` și pagini de confidențialitate/cookies. Articolele din 2017 și 2021 sunt prezentate ca arhivă, cu data și contextul publicării. Pagini de confidențialitate/cookies trimit la informările oficiale publicate de WhiteWOOD; formularul de producție rămâne dezactivat până la aprobarea textului aplicabil noului site.
- `/admin` cu autentificare, dashboard și ecrane pentru categorii/produse, pagini/articole/traduceri/asset-uri și cereri.
- URL-urile vechi din `whitewoodtrading.com` sunt mapate în `astro.config.mjs`. Cele două articole cu dată cunoscută păstrează pagini de arhivă cu rezumate editate; articolul fără dată și corp verificabil duce la arhiva generală.

## Arhitectură tehnică

- Astro cu adapter oficial Cloudflare, randare server-side pe Worker, TypeScript strict și CSS propriu cu tokens. Pagini editoriale randate pe server; JavaScript limitat la meniu, configurator și validare/formular.
- Binding-ul `DB` este singurul punct de acces la D1. Codul browserului nu primește binding sau credențiale. Repository-urile server-side separă produsele, conținutul, traducerile, asset-urile, cererile și autentificarea.
- Migrații SQL versionate în `migrations/`; configul local folosește un identificator D1 local și persistă în `.wrangler/`, exclus din Git. Configurația de producție pornește cu ID placeholder și nu poate fi folosită până la configurarea explicită a contului și ID-ului companiei.
- Comenzile locale folosesc exclusiv Wrangler local și `--local`. Ghidul va distinge fără echivoc `DB local` de `D1 Cloudflare`; nicio comandă remote nu va fi rulată în implementare.
- Adminul folosește conturi create prin bootstrap explicit cu token local/secret furnizat la configurare; nu există cont sau parolă implicită. Parolele sunt stocate ca hash PBKDF2 prin Web Crypto, sesiunile au cookie `HttpOnly`, `SameSite=Strict`, expirare și stocare numai în D1. Sesiunile Astro sunt dezactivate; login-ul are limitare de încercări, iar endpointurile de mutație verifică originea, sesiunea și tokenul CSRF.
- Originalele descărcate și derivatele optimizate stau în `media/`, în afara directorului public. Scriptul de build copiază derivate în `public/images/` numai dacă există aprobare explicită de media. Nu se activează upload fără stocare configurată. Formularele validează în browser și pe server și confirmă salvarea numai după succesul D1.
- Schema include `product_categories`, `products`, `product_specs`, `content_pages`, `articles`, `translations`, `assets`, `quote_requests`, `quote_request_items`, `admin_users`, `admin_sessions`, `rate_limit_events` și `audit_log`.

## Model de date

- `product_categories`: slug stabil, status, sortare, descrieri și etichete bilingve; categoriile pot fi gestionate din admin.
- `products`: categorie, specie, slug-uri RO/EN, status draft/publicat/arhivat, rezumat, utilizări și legături către asset-uri.
- `product_specs`: cheia și valoarea specificației cu limbă, unitate, sortare și stare de aprobare; valori neconfirmate nu apar în configurator.
- `content_pages`, `articles`, `translations`: draft/publicat, limbă, conținut și metadate SEO; articolele existente au data sursei și indicator pentru revizie.
- `assets`: cale, sursă, format/dimensiuni, text alternativ per limbă, categorie și relația cu paginile/produsele.
- `quote_requests`, `quote_request_items`: contact, destinație, specificații solicitate, stare, date, consimțământ/versiune text și note interne. Nu se stochează atașamente.
- `admin_users`, `admin_sessions`, `rate_limit_events`, `audit_log`: identitate, hashuri/secrete, limitare login și istoric de modificări.

## URL map observat

### Română

| URL vechi | Destinație planificată |
|---|---|
| `/ro/acasa.html` | `/ro/` |
| `/ro/despre-noi.html` | `/ro/despre` |
| `/ro/cherestea-fag.html` | `/ro/produse/fag` |
| `/ro/cherestea-frasin.html` | `/ro/produse/frasin` |
| `/ro/cherestea-rasinoase.html` | `/ro/produse/rasinoase` |
| `/ro/lemn-pentru-ambalat.html` | `/ro/produse/ambalaje` |
| `/ro/articole-lemn.html` | `/ro/articole` |
| `/ro/articole/cherestea-rasinoase-cherestea-fag-frasin-consum-exploatare-rationala-lemn-pandemie.html` | `/ro/articole/cherestea-si-exploatare/` (rezumat de arhivă datat 10 martie 2021) |
| `/ro/articole/lemn-aliatul-unu-constructiile-prietenoase-mediului-omului.html` | `/ro/articole/` (arhiva; data și corpul nu au fost importate) |
| `/ro/articole/lemnul-material-prietenos-omului-multiple-utilizari.html` | `/ro/articole/lemnul-si-utilizarile-sale/` (rezumat de arhivă datat 26 mai 2017) |
| `/ro/contact.html` | `/ro/contact` |
| `/ro/protectie-date-caracter-personal.html` | `/ro/confidentialitate` (text de aprobat) |
| `/ro/politica-cookie.html` | `/ro/cookies` (text de aprobat) |

### Engleză

| URL vechi | Destinație planificată |
|---|---|
| `/` | `/en/` |
| `/about-us.html` | `/en/about` |
| `/beech-sawn-timber.html` | `/en/products/beech` |
| `/ash-sawn-timber.html` | `/en/products/ash` |
| `/softwood-sawn-timber.html` | `/en/products/softwood` |
| `/wood-for-packages.html` | `/en/products/packaging` |
| `/timber-blog.html` | `/en/articles` |
| `/blog/softwood-swan-timber-hardwood-sawn-timber-consumption-rational-exploitation-covid.html` | `/en/articles/timber-and-rational-use/` (archive summary dated 10 March 2021) |
| `/blog/wood-human-friendly-material-with-multiple-uses.html` | `/en/articles/wood-and-its-uses/` (archive summary dated 26 May 2017) |
| `/blog/wood-number-one-ally-eco-friendly-human-friendly-building-constructions.html` | `/en/articles/` (archive; date and body were not imported) |
| `/contact-us.html` | `/en/contact` |
| `/privacy-policy.html` | `/en/privacy` (text de aprobat) |
| `/cookie-policy.html` | `/en/cookies` (text de aprobat) |

Maparea trebuie verificată din nou la implementarea redirect-urilor; lista de mai sus reflectă URL-urile observate în recon.

## Elemente care necesită reconfirmare WhiteWOOD

1. Confirmarea directă a telefonului, adreselor de e-mail și sediului Aviator Popișteanu înainte de producție. Paginile principale și de contact actuale indică Aviator Popișteanu, în timp ce articolul din arhiva 2021 indică adresa veche din Str. Eliza Zamfirescu Leonida. Seed-ul local reflectă pagina curentă de contact.
2. Țările de export listate (Iordania, Pakistan, India, EAU, Iran), destinațiile active și aprobarea unei hărți publice.
3. Disponibilitatea curentă pentru fag, frasin, molid/brad și lemn de ambalaj; diferența dintre molidul publicat și bradul menționat fără specificații proprii.
4. Confirmarea claselor, dimensiunilor, umidității, metodelor de uscare, finisajelor, toleranțelor, utilizărilor și normelor de calitate. Valoarea `0.40mm+` pentru sortimentul TASS la fag nu este afișată deoarece pare o unitate greșită; versiunea română și engleză diferă și la limita de noduri A/B (grosime/fața piesei). Greșeala „Beech Sawn Timber” de pe pagina engleză de frasin a fost corectată în traducerea locală folosind pagina română de frasin.
5. ISPM15, tratamentele DB/HT/MB, certificatul fitosanitar și permisiunea de a folosi marcajele/logourile asociate.
6. Serviciul Container Filler, TÜV AUSTRIA, capacitatea de încărcare, durata de zece minute și utilizarea spațiului de 84%. Versiunea română și engleză diferă între 60 m³ și 60 m²; valorile și certificarea nu sunt afișate în paginile noi.
7. Anul 1996, formularea despre piețele din Orientul Mijlociu și celelalte afirmații despre istoric/calitate.
8. Aprobarea, drepturile și textele alternative pentru imaginile/logo-urile copiate din site-ul companiei.
9. Actualitatea articolelor din 2017/2021. Site-ul nou le prezintă ca arhivă, păstrează datele originale și rezumă temele fără a le transforma în ghid comercial sau tehnic actual.
10. Aprobarea informării de confidențialitate pentru noul formular și noul flux de date. Paginile noi trimit la informările publicate pe domeniul actual; formularul de producție este dezactivat până la aprobarea textului aplicabil.

## Verificări efectuate

- `npm run check`: 46 fișiere verificate, 0 erori, 0 avertismente și 0 observații.
- `npm run build`: build Cloudflare Worker reușit. Derivatele media nu sunt incluse în `dist/` cât timp `PUBLIC_MEDIA_APPROVED=false`.
- Revizie finală după completarea conținutului: detaliu de produs la 390 px și 820 px, catalog la 1440 px, plus paginile Despre, Proces, Contact și Arhivă în română și engleză; fără scroll orizontal. Imaginile de pe paginile Despre/Proces au fost restabilite în preview-ul local și verificate încărcate.
- Formularul de ofertă a fost trimis cu date demonstrative prin D1 local, a afișat confirmarea după salvare și rândul de verificare a fost eliminat ulterior.
- `sitemap.xml` și `robots.txt` au răspuns cu HTTP 200 în dezvoltarea locală.
- Scanarea bundle-ului de producție nu a găsit secretele locale. Originalele media și derivatele optimizate rămân în `media/`; buildul de producție nu include fotografii cât timp `PUBLIC_MEDIA_APPROVED=false`. `npm run dev` copiază temporar cele 42 de derivate folosite în preview în `public/images/`.

## Setup, migrații și livrare

Comenzile executabile pentru D1 local/remote, seed demo, bootstrap admin, export/backup și deployment sunt în `README.md`. `.dev.vars` și `.wrangler/` rămân ignorate de Git. Configurația production păstrează ID D1 placeholder, iar aprobările privacy/media sunt false. Nu s-au creat resurse Cloudflare, nu s-au rulat migrări remote și nu s-a făcut deploy.

Verificarea tehnică și vizuală locală se încheie înainte de predare. Orice problemă de layout la lățimi mici/medii/mari se corectează înainte de a marca faza 6 încheiată.
