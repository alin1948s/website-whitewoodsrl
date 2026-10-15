CREATE TABLE product_categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_ro TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ro TEXT,
  description_en TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES product_categories(id) ON DELETE RESTRICT,
  slug_ro TEXT NOT NULL UNIQUE,
  slug_en TEXT NOT NULL UNIQUE,
  species TEXT,
  title_ro TEXT NOT NULL,
  title_en TEXT NOT NULL,
  intro_ro TEXT,
  intro_en TEXT,
  use_ro TEXT,
  use_en TEXT,
  verification_status TEXT NOT NULL DEFAULT 'needs_review' CHECK (verification_status IN ('needs_review', 'source_published', 'company_confirmed')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_specs (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  spec_key TEXT NOT NULL,
  label_ro TEXT NOT NULL,
  label_en TEXT NOT NULL,
  value_ro TEXT NOT NULL,
  value_en TEXT NOT NULL,
  unit TEXT,
  is_confirmed INTEGER NOT NULL DEFAULT 0 CHECK (is_confirmed IN (0, 1)),
  source_note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (product_id, spec_key, value_ro, value_en)
);

CREATE TABLE content_pages (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('ro', 'en')),
  title TEXT NOT NULL,
  intro TEXT,
  body TEXT,
  seo_title TEXT,
  seo_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  requires_review INTEGER NOT NULL DEFAULT 1 CHECK (requires_review IN (0, 1)),
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (slug, language)
);

CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  slug_ro TEXT NOT NULL UNIQUE,
  slug_en TEXT NOT NULL UNIQUE,
  title_ro TEXT NOT NULL,
  title_en TEXT NOT NULL,
  excerpt_ro TEXT,
  excerpt_en TEXT,
  body_ro TEXT,
  body_en TEXT,
  source_url_ro TEXT,
  source_url_en TEXT,
  source_date TEXT,
  published_at TEXT,
  seo_title_ro TEXT,
  seo_title_en TEXT,
  seo_description_ro TEXT,
  seo_description_en TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  requires_review INTEGER NOT NULL DEFAULT 1 CHECK (requires_review IN (0, 1)),
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE translations (
  id TEXT PRIMARY KEY,
  translation_key TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('ro', 'en')),
  value TEXT NOT NULL,
  approval_status TEXT NOT NULL DEFAULT 'needs_review' CHECK (approval_status IN ('needs_review', 'approved')),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (translation_key, language)
);

CREATE TABLE assets (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL UNIQUE,
  original_path TEXT NOT NULL,
  source_url TEXT,
  alt_ro TEXT,
  alt_en TEXT,
  media_type TEXT NOT NULL DEFAULT 'image',
  width INTEGER,
  height INTEGER,
  bytes INTEGER,
  rights_status TEXT NOT NULL DEFAULT 'needs_confirmation' CHECK (rights_status IN ('needs_confirmation', 'approved', 'rejected')),
  status TEXT NOT NULL DEFAULT 'needs_review' CHECK (status IN ('needs_review', 'approved', 'archived')),
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE content_asset_links (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('page', 'product', 'article')),
  target_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (asset_id, target_type, target_id)
);

CREATE TABLE quote_requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  destination TEXT,
  summary TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'answered', 'archived')),
  source TEXT NOT NULL DEFAULT 'website',
  consent_version TEXT,
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quote_request_items (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  category TEXT,
  species TEXT,
  finish TEXT,
  drying TEXT,
  dimensions TEXT,
  estimated_volume TEXT,
  destination TEXT,
  notes TEXT
);

CREATE TABLE quote_request_notes (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  admin_id TEXT REFERENCES admin_users(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TEXT
);

CREATE TABLE admin_sessions (
  token_hash TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL
);

CREATE TABLE rate_limit_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scope_hash TEXT NOT NULL,
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  succeeded INTEGER NOT NULL DEFAULT 0 CHECK (succeeded IN (0, 1))
);

CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id TEXT REFERENCES admin_users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category_status ON products(category_id, status, updated_at DESC);
CREATE INDEX idx_specs_product_confirmed ON product_specs(product_id, is_confirmed, sort_order);
CREATE INDEX idx_pages_slug_language_status ON content_pages(slug, language, status);
CREATE INDEX idx_articles_status_date ON articles(status, published_at DESC);
CREATE INDEX idx_assets_status ON assets(status, rights_status);
CREATE INDEX idx_quotes_status_created ON quote_requests(status, created_at DESC);
CREATE INDEX idx_quote_items_request ON quote_request_items(request_id);
CREATE INDEX idx_quote_notes_request ON quote_request_notes(request_id, created_at DESC);
CREATE INDEX idx_sessions_admin_expiry ON admin_sessions(admin_id, expires_at);
CREATE INDEX idx_rate_scope_time ON rate_limit_events(scope_hash, occurred_at DESC);
CREATE INDEX idx_audit_entity_time ON audit_log(entity_type, entity_id, created_at DESC);
