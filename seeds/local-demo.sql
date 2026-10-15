-- Conținut demonstrativ de dezvoltare locală, transcris din paginile publice WhiteWOOD.
-- Nu reprezintă confirmarea stocului sau a unei oferte comerciale curente.

INSERT INTO product_categories (id, slug, name_ro, name_en, description_ro, description_en, sort_order, status, is_demo)
VALUES
  ('category-beech', 'beech', 'Fag', 'Beech', 'Fag (Fagus sylvatica), clasele A și A/B, în variante tivite și netivite.', 'Beech (Fagus sylvatica), grades A and A/B, available in edged and unedged variants.', 1, 'published', 1),
  ('category-ash', 'ash', 'Frasin', 'Ash', 'Cherestea de frasin (Fraxinus), clasa A, tivită sau netivită.', 'Grade A ash (Fraxinus) sawn timber, edged or unedged.', 2, 'published', 1),
  ('category-softwood', 'softwood', 'Rășinoase', 'Softwood', 'Molid (Picea abies), clasa A, rindeluit S4S sau dimensionat.', 'Grade A spruce (Picea abies), S4S planed or dimensioned.', 3, 'published', 1),
  ('category-packaging', 'packaging', 'Lemn pentru ambalaje', 'Wood for packaging', 'Lemn uscat și rindeluit pe patru fețe, pentru ambalarea mărfurilor.', 'Dried, four-side planed wood for packaging goods.', 4, 'published', 1)
ON CONFLICT(id) DO UPDATE SET
  slug=excluded.slug, name_ro=excluded.name_ro, name_en=excluded.name_en,
  description_ro=excluded.description_ro, description_en=excluded.description_en,
  sort_order=excluded.sort_order, status=excluded.status, is_demo=excluded.is_demo;

INSERT INTO products (id, category_id, slug_ro, slug_en, species, title_ro, title_en, intro_ro, intro_en, use_ro, use_en, verification_status, status, is_demo)
VALUES
  ('product-beech', 'category-beech', 'fag', 'beech', 'Fagus sylvatica', 'Cherestea de fag', 'Beech sawn timber',
   'Cherestea de fag (Fagus sylvatica), clasa A sau A/B, tivită ori netivită. Disponibilă aburită, cu muchie pătrată, uscată sau zvântată, în lungimi TAL și TAS.',
   'Beech (Fagus sylvatica) sawn timber, grade A or A/B, edged or unedged. Available steamed, square-edged, dried or air-seasoned, in TAL and TAS lengths.',
   'Utilizări: construcții, industria mobilei, parchet masiv, tâmplărie, garduri și scări.

Clasa A: fără noduri; curbura este limitată la 15 mm/m; inima roșie nu este admisă.

Clasa A/B: noduri sănătoase pe o față sau muchie la cel mult 25% din piesele lotului, cu dimensiunea de maximum 1/4 din grosime sau 20 mm. Celelalte trei fețe nu admit defecte sau puncte singulare; curbura este limitată la 15 mm/m. Inima roșie este acceptată în funcție de înțelegerea comercială.',
   'Uses: construction, furniture, solid wood flooring, joinery, fences and stairs.

Grade A: no knots; bow is limited to 15 mm/m; red heart is not permitted.

Grade A/B: sound knots are accepted on one face or edge on up to 25% of pieces in a lot, with a maximum size of one quarter of the thickness or 20 mm. The other three faces must be free of defects or isolated marks; bow is limited to 15 mm/m. Red heart is accepted by commercial agreement.',
   'source_published', 'published', 1),
  ('product-ash', 'category-ash', 'frasin', 'ash', 'Fraxinus', 'Cherestea de frasin', 'Ash sawn timber',
   'Cherestea de frasin (Fraxinus), clasa A, tivită sau netivită, uscată și cu muchie pătrată. Lungimi: 2,30–3,80 m; grosimi: 25, 50 și 80 mm; lățimi: de la 100 mm.',
   'Ash (Fraxinus) sawn timber, grade A, edged or unedged, dried and square-edged. Lengths: 2.30–3.80 m; thicknesses: 25, 50 and 80 mm; widths: from 100 mm.',
   'Utilizări — tivit: șarpante, mobilier, schiuri și bâte de baseball.

Utilizări — netivit: ateliere de mobilă, elemente curbate și sănii.

Norme — tivit: nodurile nu sunt admise; curbura este limitată la 15 mm/m; inima roșie nu este admisă.

Norme — netivit: noduri sănătoase pe o față sau muchie la cel mult 25% din piesele lotului, cu dimensiunea de maximum 1/4 din grosime sau 20 mm. Celelalte trei fețe nu admit defecte sau puncte singulare; curbura este limitată la 15 mm/m. Inima roșie este acceptată în funcție de înțelegerea comercială.',
   'Uses — edged: roof structures, furniture, skis and baseball bats.

Uses — unedged: furniture workshops, curved components and sledges.

Edged grade: knots are not accepted; bow is limited to 15 mm/m; red heart is not permitted.

Unedged grade: sound knots are accepted on one face or edge on up to 25% of pieces in a lot, with a maximum size of one quarter of the thickness or 20 mm. The other three faces must be free of defects or isolated marks; bow is limited to 15 mm/m. Red heart is accepted by commercial agreement.',
   'source_published', 'published', 1),
  ('product-softwood', 'category-softwood', 'rasinoase', 'softwood', 'Molid (Picea abies)', 'Cherestea de rășinoase', 'Softwood sawn timber',
   'Molid clasa A rindeluit pe patru fețe (S4S), cu umiditate de 10–14%, sau dimensionat, uscat ori zvântat, cu umiditate de 10–24%.',
   'Grade A spruce, planed on all four sides (S4S) and dried to 10–14% moisture, or dimensioned, dried or air-seasoned to 10–24%.',
   'S4S, 10–14%: pentru dulgherie fină, mobilier și decorațiuni. Sunt admise doar particularitățile structurale și nodurile mici prevăzute pentru acest sortiment.

   Dimensionat, 10–24%: pentru structuri, construcții, dulgherie obișnuită, catarge de nave, lăzi, cutii, elemente decorative și scări. Sunt admise particularitățile structurale și nodurile în limitele aferente sortimentului.',
   'S4S, 10–14%: for fine carpentry, furniture and decoration. Only the structural features and small knots allowed for this grade are accepted.

   Dimensioned, 10–24%: for structures, construction, general carpentry, ship masts, crates, boxes, decorative components and stairs. Structural features and knots are accepted within the limits for this grade.',
   'source_published', 'published', 1),
  ('product-packaging', 'category-packaging', 'ambalaje', 'packaging', NULL, 'Lemn pentru ambalaje', 'Wood for packaging',
   'Lemn uscat, rindeluit pe patru fețe, pentru ambalarea și protejarea mărfurilor în timpul transportului internațional.',
   'Dried, four-side planed timber for packaging and protecting goods during international transport.',
   'Folosit la ambalarea și protejarea mărfurilor în timpul transportului. Lemnul este uscat și rindeluit pe patru fețe.',
   'Used to package and protect goods during transport. The timber is dried and planed on all four faces.',
   'source_published', 'published', 1)
ON CONFLICT(id) DO UPDATE SET
  category_id=excluded.category_id, slug_ro=excluded.slug_ro, slug_en=excluded.slug_en,
  species=excluded.species, title_ro=excluded.title_ro, title_en=excluded.title_en,
  intro_ro=excluded.intro_ro, intro_en=excluded.intro_en, use_ro=excluded.use_ro,
  use_en=excluded.use_en, verification_status=excluded.verification_status,
  status=excluded.status, is_demo=excluded.is_demo;

UPDATE products SET use_en =
  'Uses: construction, furniture, solid wood flooring, joinery, fences and stairs.' || char(10) || char(10) ||
  'Grade A: no knots; bow is limited to 15 mm/m; red heart is not permitted.' || char(10) || char(10) ||
  'Grade A/B: sound knots are accepted on one face or edge on up to 25% of pieces in a lot. Knots must not exceed one quarter of the thickness or 20 mm. The other three faces must be free of defects or isolated marks; bow is limited to 15 mm/m. Red heart is accepted by commercial agreement.'
WHERE id = 'product-beech';

UPDATE products SET use_en =
  'Uses — edged: roof structures, furniture, skis and baseball bats.' || char(10) || char(10) ||
  'Uses — unedged: furniture workshops, curved components and sledges.' || char(10) || char(10) ||
  'Edged grade: knots are not accepted; bow is limited to 15 mm/m; red heart is not permitted.' || char(10) || char(10) ||
  'Unedged grade: sound knots are accepted on one face or edge on up to 25% of pieces in a lot. Knots must not exceed one quarter of the thickness or 20 mm. The other three faces must be free of defects or isolated marks; bow is limited to 15 mm/m. Red heart is accepted by commercial agreement.'
WHERE id = 'product-ash';

UPDATE products SET use_ro =
  'S4S, 10–14% umiditate — pentru dulgherie fină, mobilier și decorațiuni. La o piesă tip de 1 m × 0,10 m sunt admise până la două particularități structurale pe ambele fețe și trei pe fața opusă. Sunt admise noduri mici de maximum 20 mm pe o față și până la trei noduri de maximum 25 mm diametru pe fața opusă. Micile noduri negre care rezistă la prelucrare sunt tolerate.' || char(10) || char(10) ||
  'Dimensionat, 10–24% umiditate — pentru structuri, construcții, dulgherie obișnuită, catarge de nave, lăzi, cutii, elemente decorative și scări. La o piesă tip de 1 m × 0,10 m sunt admise până la trei particularități structurale pe ambele fețe și cinci pe fața opusă. Sunt admise până la trei noduri sănătoase de 30 mm diametru pe o față și cinci de 40 mm pe fața opusă; pot rămâne câteva noduri exterioare mici pe fața opusă.'
WHERE id = 'product-softwood';

UPDATE products SET use_en =
  'S4S, 10–14% moisture — for fine carpentry, furniture and decoration. On a typical 1 m × 0.10 m piece, up to two structural features are allowed on both faces and three on the opposite face. Small knots up to 20 mm are accepted on one face, with up to three knots of 25 mm diameter on the opposite face. Small black knots that remain after processing are tolerated.' || char(10) || char(10) ||
  'Dimensioned, 10–24% moisture — for structures, construction, general carpentry, ship masts, crates, boxes, decorative components and stairs. On a typical 1 m × 0.10 m piece, up to three structural features are allowed on both faces and five on the opposite face. Up to three sound knots of 30 mm diameter are accepted on one face and five of 40 mm on the opposite face; a few small external knots may remain on the opposite face.'
WHERE id = 'product-softwood';

DELETE FROM product_specs WHERE product_id IN ('product-beech', 'product-ash', 'product-softwood', 'product-packaging');
INSERT INTO product_specs (id, product_id, spec_key, label_ro, label_en, value_ro, value_en, unit, is_confirmed, source_note, sort_order)
VALUES
  ('spec-beech-finish', 'product-beech', 'finish', 'Prelucrare și uscare', 'Processing and drying', 'Aburit; muchie pătrată; uscat sau zvântat', 'Steamed; square-edged; dried or air-seasoned', NULL, 1, 'https://whitewoodtrading.com/ro/cherestea-fag.html', 1),
  ('spec-beech-tal', 'product-beech', 'length-tal', 'Lungime TAL (lung)', 'TAL length (long)', '1,80 m+', '1.80 m+', NULL, 1, 'https://whitewoodtrading.com/ro/cherestea-fag.html', 2),
  ('spec-beech-tas', 'product-beech', 'length-tas', 'Lungime TAS (mediu)', 'TAS length (medium)', '1,10–1,80 m', '1.10–1.80 m', NULL, 1, 'https://whitewoodtrading.com/ro/cherestea-fag.html', 3),
  ('spec-beech-thickness', 'product-beech', 'thickness', 'Grosimi', 'Thicknesses', '25; 38; 50; 60; 70; 80; 100', '25; 38; 50; 60; 70; 80; 100', 'mm', 1, 'https://whitewoodtrading.com/ro/cherestea-fag.html', 4),
  ('spec-beech-width', 'product-beech', 'width', 'Lățime', 'Width', '100+', '100+', 'mm', 1, 'https://whitewoodtrading.com/ro/cherestea-fag.html', 5),
  ('spec-ash-variant-edged', 'product-ash', 'variant', 'Variantă', 'Variant', 'Tivită — clasa A, uscată', 'Edged — grade A, dried', NULL, 1, 'https://whitewoodtrading.com/ro/cherestea-frasin.html', 1),
  ('spec-ash-variant-unedged', 'product-ash', 'variant', 'Variantă', 'Variant', 'Netivită — clasa A, uscată', 'Unedged — grade A, dried', NULL, 1, 'https://whitewoodtrading.com/ro/cherestea-frasin.html', 2),
  ('spec-ash-length', 'product-ash', 'length', 'Lungimi', 'Lengths', '2,30; 2,60; 2,90; 3,20; 3,50; 3,80', '2.30; 2.60; 2.90; 3.20; 3.50; 3.80', 'm', 1, 'https://whitewoodtrading.com/ro/cherestea-frasin.html', 3),
  ('spec-ash-thickness', 'product-ash', 'thickness', 'Grosimi', 'Thicknesses', '25; 50; 80', '25; 50; 80', 'mm', 1, 'https://whitewoodtrading.com/ro/cherestea-frasin.html', 4),
  ('spec-ash-width', 'product-ash', 'width', 'Lățime', 'Width', '100+', '100+', 'mm', 1, 'https://whitewoodtrading.com/ro/cherestea-frasin.html', 5),
  ('spec-softwood-variant-planed', 'product-softwood', 'variant', 'Variantă', 'Variant', 'Molid clasa A — S4S, rindeluit și uscat, umiditate 10–14%', 'Grade A spruce — S4S planed and dried, moisture 10–14%', NULL, 1, 'https://whitewoodtrading.com/ro/cherestea-rasinoase.html', 1),
  ('spec-softwood-variant-dimensioned', 'product-softwood', 'variant', 'Variantă', 'Variant', 'Molid clasa A — dimensionat, uscat sau zvântat, umiditate 10–24%', 'Grade A spruce — dimensioned, dried or air-seasoned, moisture 10–24%', NULL, 1, 'https://whitewoodtrading.com/ro/cherestea-rasinoase.html', 2),
  ('spec-softwood-length', 'product-softwood', 'length', 'Lungimi', 'Lengths', '3; 4', '3; 4', 'm', 1, 'https://whitewoodtrading.com/ro/cherestea-rasinoase.html', 3),
  ('spec-softwood-thickness', 'product-softwood', 'thickness', 'Grosimi', 'Thicknesses', '22–150', '22–150', 'mm', 1, 'https://whitewoodtrading.com/ro/cherestea-rasinoase.html', 4),
  ('spec-softwood-width', 'product-softwood', 'width', 'Lățimi', 'Widths', '50; 100; 120–300', '50; 100; 120–300', 'mm', 1, 'https://whitewoodtrading.com/ro/cherestea-rasinoase.html', 5),
  ('spec-packaging-processing', 'product-packaging', 'processing', 'Prelucrare', 'Processing', 'Uscat; rindeluit pe patru fețe', 'Dried; planed on all four faces', NULL, 1, 'https://whitewoodtrading.com/ro/lemn-pentru-ambalat.html', 1);

INSERT INTO content_pages (id, slug, language, title, intro, body, seo_title, seo_description, status, requires_review, is_demo)
VALUES
  ('page-home-ro', 'home', 'ro', 'Cherestea românească, de la fibră la destinație', 'Cherestea și grinzi din fag, frasin și molid, alături de lemn pentru ambalaje. Descoperă sortimente pentru construcții, mobilier și finisaje.', 'Din 1996, WhiteWOOD se ocupă de exploatarea și prelucrarea lemnului. Gama cuprinde cherestea și grinzi din fag, frasin, molid și brad, precum și lemn pentru ambalaje. Sortarea, uscarea și ambalarea pregătesc cheresteaua pentru expediere.', 'WhiteWOOD | Cherestea românească', 'Cherestea de fag, frasin și molid, lemn pentru ambalaje și pregătirea loturilor pentru expediere din Portul Constanța.', 'published', 0, 1),
  ('page-home-en', 'home', 'en', 'Romanian sawn timber, from grain to destination', 'Sawn timber and beams in beech, ash and spruce, alongside wood for packaging. Explore grades for construction, furniture and finishing.', 'Since 1996, WhiteWOOD has worked in timber harvesting and processing. Its range includes sawn timber and beams in beech, ash, spruce and fir, as well as wood for packaging. Grading, drying and packaging prepare sawn timber for shipment.', 'WhiteWOOD | Romanian sawn timber', 'Beech, ash and spruce timber, wood for packaging, and shipment preparation at the Port of Constanța.', 'published', 0, 1),
  ('page-about-ro', 'about', 'ro', 'Despre WhiteWOOD', 'WhiteWOOD SRL produce și exportă cherestea și grinzi pentru construcții.', 'Din 1996, WhiteWOOD SRL se ocupă de exploatarea și prelucrarea lemnului. Compania produce și exportă cherestea și grinzi pentru construcții. Gama cuprinde fag (Fagus sylvatica), frasin (Fraxinus), molid (Picea abies), brad (Abies) și lemn pentru ambalaje.

Amplasarea într-o regiune forestieră bogată în rășinoase completează experiența echipei în prelucrarea lemnului.', 'Despre WhiteWOOD', 'Din 1996, WhiteWOOD prelucrează și exportă cherestea și grinzi din fag, frasin, molid și brad, precum și lemn pentru ambalaje.', 'published', 0, 1),
  ('page-about-en', 'about', 'en', 'About WhiteWOOD', 'WhiteWOOD SRL produces and exports sawn timber and beams for construction.', 'Since 1996, WhiteWOOD SRL has worked in timber harvesting and processing. The company produces and exports sawn timber and beams for construction. Its range includes beech (Fagus sylvatica), ash (Fraxinus), spruce (Picea abies), fir (Abies) and wood for packaging.

Based in a forest region rich in softwood species, WhiteWOOD builds on its team’s timber-processing experience.', 'About WhiteWOOD', 'Since 1996, WhiteWOOD has processed and exported beech, ash, spruce and fir timber and beams, alongside wood for packaging.', 'published', 0, 1),
  ('page-process-ro', 'process', 'ro', 'Verificare, uscare și pregătire pentru transport', 'Impregnare Tanalith, uscare, sortare, ambalare și încărcare cu Container Filler la Portul Constanța.', 'În funcție de sortiment, cheresteaua este tratată, uscată, verificată și sortată, apoi vopsită, marcată, ambalată și pachetizată. Echipamentul Container Filler încarcă cheresteaua în containere. Depozitele și logistica WhiteWOOD sunt la Portul Constanța, Poarta 2.', 'Procesare și logistică | WhiteWOOD', 'Impregnare Tanalith, uscare, sortare, ambalare și încărcare cu Container Filler la Portul Constanța.', 'published', 0, 1),
  ('page-process-en', 'process', 'en', 'Grading, drying and preparation for shipment', 'Tanalith treatment, drying, sorting, packaging and Container Filler loading at the Port of Constanța.', 'Depending on the grade, timber is treated, dried, checked and sorted, then painted, marked, packaged and bundled. Container Filler equipment loads sawn timber into containers. WhiteWOOD’s storage and logistics operations are at Gate 2 of the Port of Constanța.', 'Processing and logistics | WhiteWOOD', 'Tanalith treatment, drying, sorting, packaging and Container Filler loading at the Port of Constanța.', 'published', 0, 1),
  ('page-privacy-ro', 'privacy', 'ro', 'Protecția datelor cu caracter personal', 'Folosim datele transmise prin formular pentru a răspunde solicitării tale.', 'Informarea completă cuprinde detalii despre datele prelucrate, scopurile și perioadele de păstrare, precum și drepturile tale.', 'Protecția datelor | WhiteWOOD', 'Informații despre datele folosite pentru a răspunde solicitărilor WhiteWOOD.', 'published', 0, 1),
  ('page-privacy-en', 'privacy', 'en', 'Personal data protection', 'We use the information submitted through our form to respond to your enquiry.', 'The full notice explains the data processed, the purposes and retention periods, and your rights.', 'Personal data protection | WhiteWOOD', 'Information about the personal data used to respond to WhiteWOOD enquiries.', 'published', 0, 1),
  ('page-cookies-ro', 'cookies', 'ro', 'Politica de cookie', 'Harta Google integrată pe pagina Contact poate utiliza cookie-uri și tehnologii proprii.', 'Pentru detalii despre datele folosite de Google și setările de confidențialitate, consultă politica Google.', 'Politica de cookie | WhiteWOOD', 'Informații despre cookie-urile și tehnologiile folosite de harta Google integrată pe site.', 'published', 0, 1),
  ('page-cookies-en', 'cookies', 'en', 'Cookie policy', 'The Google Map embedded on our Contact page may use cookies and its own technologies.', 'For details about the data Google uses and its privacy settings, read Google’s privacy policy.', 'Cookie policy | WhiteWOOD', 'Information about cookies and technologies used by Google Maps embedded on the website.', 'published', 0, 1)
ON CONFLICT(id) DO UPDATE SET
  slug=excluded.slug, language=excluded.language, title=excluded.title, intro=excluded.intro,
  body=excluded.body, seo_title=excluded.seo_title, seo_description=excluded.seo_description,
  status=excluded.status, requires_review=excluded.requires_review, is_demo=excluded.is_demo;

INSERT INTO articles (id, slug_ro, slug_en, title_ro, title_en, excerpt_ro, excerpt_en, body_ro, body_en, source_url_ro, source_url_en, source_date, published_at, seo_title_ro, seo_title_en, seo_description_ro, seo_description_en, status, requires_review, is_demo)
VALUES
  ('article-pandemic', 'cherestea-si-exploatare', 'timber-and-rational-use',
   'Cheresteaua de rășinoase și cea de esențe tari în timpul pandemiei', 'Softwood and hardwood sawn timber during the pandemic',
   'În 2021, cererea pentru cherestea de esențe tari și rășinoase a evoluat diferit în timpul pandemiei, iar trasabilitatea a rămas esențială pentru utilizarea responsabilă a lemnului.', 'In 2021, demand for hardwood and softwood timber shifted during the pandemic, while traceability remained central to responsible timber use.',
   'Lemnul este folosit de mii de ani, de la unelte și obiecte casnice la structuri de construcții, mobilier și elemente decorative. Specia și forma cherestelei se aleg în funcție de proiect și de proprietățile necesare.

Gestionarea responsabilă a pădurilor și trasabilitatea lemnului contribuie la protejarea resursei. În 2021, sistemul SUMAL urmărea mișcarea materialelor lemnoase și proveniența acestora.

În martie 2021, în timpul pandemiei, economia internațională a încetinit, însă cheresteaua a continuat să se tranzacționeze. Fagul, frasinul și stejarul au rămas căutate pentru proiecte cu finisaje de calitate, iar cererea pentru brad și molid a crescut, inclusiv în sectorul construcțiilor.

Gama WhiteWOOD cuprinde molid rindeluit și uscat, cu umiditate de 10–14%, pentru dulgherie fină, mobilier și decorațiuni, precum și molid dimensionat, cu umiditate de 10–24%, pentru structuri și construcții. Cheresteaua de fag este disponibilă în clasele A și A/B, iar cea de frasin în clasa A, tivită sau netivită. La Portul Constanța, echipamentul Container Filler este folosit la încărcarea cherestelei în containere.',
   'Timber has been used for thousands of years, from tools and household objects to building structures, furniture and decorative elements. The species and form of sawn timber depend on the project and the properties required.

Responsible forest management and timber traceability help protect this resource. In 2021, the SUMAL system tracked timber movements and provenance.

In March 2021, during the pandemic, the international economy slowed, while timber continued to trade. Beech, ash and oak remained in demand for projects with high-quality finishes, and demand for fir and spruce grew in the construction sector.

The WhiteWOOD range includes planed and dried spruce with 10–14% moisture for fine carpentry, furniture and decoration, and dimensioned spruce with 10–24% moisture for structures and construction. Beech sawn timber is available in grades A and A/B, while ash is available in grade A, edged or unedged. At the Port of Constanța, Container Filler equipment is used to load sawn timber into containers.',
   'https://whitewoodtrading.com/ro/articole/cherestea-rasinoase-cherestea-fag-frasin-consum-exploatare-rationala-lemn-pandemie.html', 'https://whitewoodtrading.com/blog/softwood-swan-timber-hardwood-sawn-timber-consumption-rational-exploitation-covid.html',
   '2021-03-10', '2021-03-10', 'Cherestea în timpul pandemiei | WhiteWOOD', 'Timber during the pandemic | WhiteWOOD', 'Utilizările lemnului și cererea pentru cherestea de rășinoase și esențe tari în perioada pandemiei.', 'Timber uses and demand for softwood and hardwood during the pandemic.', 'published', 0, 1),
  ('article-uses', 'lemnul-si-utilizarile-sale', 'wood-and-its-uses',
   'Lemnul: un material cu multiple utilizări', 'Wood: a material with many uses',
   'De la construcții și mobilier la ambalaje și echipamente sportive, lemnul își găsește locul în proiecte foarte diferite.', 'From construction and furniture to packaging and sports equipment, timber has a place in many kinds of projects.',
   'Alegerea lemnului începe cu specia, duritatea, culoarea și textura, în raport cu bugetul și utilizarea finală. Aceste caracteristici influențează atât aspectul, cât și performanța materialului.

În construcții, cheresteaua, grinzile, stâlpii, șipcile și scândurile se folosesc la structuri de acoperiș, pardoseli, tâmplărie, scări și balustrade. Lemnul masiv și cel stratificat oferă opțiuni pentru forme și aplicații diferite.

Mobilierul, obiectele de uz casnic, lăzile și cutiile de transport, echipamentele sportive și instrumentele muzicale sunt alte exemple ale versatilității lemnului. Pentru fiecare proiect, alegerea speciei potrivite pune în valoare proprietățile și finisajul dorit.',
   'Choosing timber begins with species, hardness, colour and texture, balanced against budget and end use. These characteristics influence both the material’s appearance and performance.

In construction, sawn timber, beams, posts, battens and boards are used for roof structures, floors, joinery, stairs and balustrades. Solid and engineered timber offer options for different forms and applications.

Furniture, household objects, transport crates and boxes, sports equipment and musical instruments are further examples of timber’s versatility. Choosing the right species for each project brings out the material’s qualities and the finish required.',
   'https://whitewoodtrading.com/ro/articole/lemnul-material-prietenos-omului-multiple-utilizari.html', 'https://whitewoodtrading.com/blog/wood-human-friendly-material-with-multiple-uses.html',
   '2017-05-26', '2017-05-26', 'Lemnul și utilizările sale | WhiteWOOD', 'Wood and its uses | WhiteWOOD', 'Utilizările lemnului în construcții, mobilier, ambalaje și echipamente sportive.', 'Timber uses in construction, furniture, packaging and sports equipment.', 'published', 0, 1),
  ('article-construction', 'lemnul-in-constructii', 'wood-in-construction', 'Lemnul în construcții', 'Wood in construction', NULL, NULL, NULL, NULL, 'https://whitewoodtrading.com/ro/articole/lemn-aliatul-unu-constructiile-prietenoase-mediului-omului.html', 'https://whitewoodtrading.com/blog/wood-number-one-ally-eco-friendly-human-friendly-building-constructions.html', NULL, NULL, NULL, NULL, NULL, NULL, 'draft', 1, 1)
ON CONFLICT(id) DO UPDATE SET
  slug_ro=excluded.slug_ro, slug_en=excluded.slug_en, title_ro=excluded.title_ro, title_en=excluded.title_en,
  excerpt_ro=excluded.excerpt_ro, excerpt_en=excluded.excerpt_en, body_ro=excluded.body_ro, body_en=excluded.body_en,
  source_url_ro=excluded.source_url_ro, source_url_en=excluded.source_url_en, source_date=excluded.source_date,
  published_at=excluded.published_at, seo_title_ro=excluded.seo_title_ro, seo_title_en=excluded.seo_title_en,
  seo_description_ro=excluded.seo_description_ro, seo_description_en=excluded.seo_description_en,
  status=excluded.status, requires_review=excluded.requires_review, is_demo=excluded.is_demo;
