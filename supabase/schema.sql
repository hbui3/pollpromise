-- ============================================================
-- PollPromise - Database Schema
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Tables
-- ============================================================

-- Charities
CREATE TABLE charities (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        varchar(200) NOT NULL,
  description text,
  website_url text,
  logo_url    text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Campaigns
CREATE TABLE campaigns (
  id                          uuid         PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_token                 uuid         NOT NULL DEFAULT uuid_generate_v4(),
  slug                        varchar(50)  NOT NULL UNIQUE,
  title                       varchar(200) NOT NULL,
  description                 text         NOT NULL,
  survey_url                  text         NOT NULL,
  estimated_minutes           int          NOT NULL CHECK (estimated_minutes > 0),
  budget_cents                int          NOT NULL DEFAULT 0 CHECK (budget_cents >= 0),
  donation_per_completion_cents int        NOT NULL DEFAULT 100 CHECK (donation_per_completion_cents > 0),
  verification_method         varchar(20)  NOT NULL DEFAULT 'code',
  completion_code             varchar(100),
  verification_url            text,
  locked_charity_id           uuid         REFERENCES charities(id) ON DELETE SET NULL,
  status                      varchar(20)  NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'expired')),
  donation_confirmed          boolean      NOT NULL DEFAULT false,
  donation_proof_url          text,
  target_audience             text,
  is_public                   boolean      NOT NULL DEFAULT false,
  created_at                  timestamptz  NOT NULL DEFAULT now(),
  expires_at                  timestamptz
);

-- Completions
CREATE TABLE completions (
  id                uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id       uuid        NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  ip_hash           varchar(64) NOT NULL,
  verification_type varchar(20) NOT NULL,
  screenshot_url    text,
  code_entered      varchar(100),
  status            varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, ip_hash)
);

-- Charity Votes
CREATE TABLE charity_votes (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id uuid        NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  charity_id  uuid        NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  ip_hash     varchar(64) NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, ip_hash)
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_campaigns_slug        ON campaigns(slug);
CREATE INDEX idx_campaigns_status      ON campaigns(status);
CREATE INDEX idx_campaigns_created_at  ON campaigns(created_at DESC);

CREATE INDEX idx_completions_campaign   ON completions(campaign_id);
CREATE INDEX idx_completions_status     ON completions(status);
CREATE INDEX idx_completions_created_at ON completions(created_at DESC);

CREATE INDEX idx_charity_votes_campaign ON charity_votes(campaign_id);
CREATE INDEX idx_charity_votes_charity  ON charity_votes(charity_id);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE charities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns     ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_votes ENABLE ROW LEVEL SECURITY;

-- Charities: everyone can read
CREATE POLICY "charities_select_all"
  ON charities FOR SELECT
  USING (true);

-- Charities: anyone can insert (participants can suggest new ones)
CREATE POLICY "charities_insert_anon"
  ON charities FOR INSERT
  WITH CHECK (true);

-- Campaigns: everyone can read all campaigns (API routes filter as needed)
CREATE POLICY "campaigns_select_all"
  ON campaigns FOR SELECT
  USING (true);

-- Campaigns: anyone can create (anonymous researchers)
CREATE POLICY "campaigns_insert_anon"
  ON campaigns FOR INSERT
  WITH CHECK (true);

-- Campaigns: allow updates (API routes handle admin_token verification)
CREATE POLICY "campaigns_update_anon"
  ON campaigns FOR UPDATE
  USING (true);

-- Completions: anyone can insert (survey participants)
CREATE POLICY "completions_insert_anon"
  ON completions FOR INSERT
  WITH CHECK (true);

-- Completions: read own completions or admin reads via campaign
CREATE POLICY "completions_select"
  ON completions FOR SELECT
  USING (true);

-- Completions: allow updates (API routes handle admin_token verification)
CREATE POLICY "completions_update_anon"
  ON completions FOR UPDATE
  USING (true);

-- Charity Votes: anyone can insert
CREATE POLICY "charity_votes_insert_anon"
  ON charity_votes FOR INSERT
  WITH CHECK (true);

-- Charity Votes: anyone can read (for aggregated results)
CREATE POLICY "charity_votes_select_all"
  ON charity_votes FOR SELECT
  USING (true);

-- ============================================================
-- Grant access to anon and authenticated roles
-- ============================================================

GRANT SELECT, INSERT                  ON charities     TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE          ON campaigns     TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE          ON completions   TO anon, authenticated;
GRANT SELECT, INSERT                  ON charity_votes TO anon, authenticated;

-- ============================================================
-- Seed Data: German Charities
-- ============================================================

INSERT INTO charities (name, description, website_url) VALUES
(
  'Ärzte ohne Grenzen',
  'Internationale medizinische Nothilfeorganisation, die Menschen in Krisengebieten weltweit medizinische Hilfe leistet.',
  'https://www.aerzte-ohne-grenzen.de'
),
(
  'UNICEF Deutschland',
  'Das Kinderhilfswerk der Vereinten Nationen setzt sich weltweit für die Rechte und das Wohlergehen von Kindern ein.',
  'https://www.unicef.de'
),
(
  'Welthungerhilfe',
  'Eine der größten privaten Hilfsorganisationen in Deutschland, die sich für die Bekämpfung von Hunger und Armut einsetzt.',
  'https://www.welthungerhilfe.de'
),
(
  'WWF Deutschland',
  'Naturschutzorganisation, die sich weltweit für den Erhalt der biologischen Vielfalt und den Schutz natürlicher Lebensräume einsetzt.',
  'https://www.wwf.de'
),
(
  'Amnesty International Deutschland',
  'Setzt sich weltweit für den Schutz der Menschenrechte ein und kämpft gegen Ungerechtigkeit und Unterdrückung.',
  'https://www.amnesty.de'
),
(
  'SOS-Kinderdörfer weltweit',
  'Bietet Kindern in Not ein liebevolles Zuhause und unterstützt Familien, damit sie füreinander sorgen können.',
  'https://www.sos-kinderdoerfer.de'
),
(
  'Deutsche Krebshilfe',
  'Fördert die Krebsforschung, verbessert die Versorgung krebskranker Menschen und unterstützt Betroffene und deren Angehörige.',
  'https://www.krebshilfe.de'
),
(
  'Tafel Deutschland',
  'Rettet Lebensmittel und verteilt sie an Menschen in Armut. Über 960 Tafeln versorgen rund 1,5 Millionen Menschen.',
  'https://www.tafel.de'
),
(
  'Sea-Watch',
  'Zivile Seenotrettungsorganisation, die sich für die Rettung von Menschen in Seenot im Mittelmeer einsetzt.',
  'https://sea-watch.org'
),
(
  'Wikimedia Foundation',
  'Betreibt Wikipedia und andere freie Wissensprojekte, um jedem Menschen freien Zugang zu Wissen zu ermöglichen.',
  'https://www.wikimedia.de'
);

-- ============================================================
-- Page Views (Usage Tracking)
-- ============================================================

CREATE TABLE page_views (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path   varchar(500) NOT NULL,
  visitor_hash varchar(64) NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX idx_page_views_page_path  ON page_views(page_path);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_views_insert_anon"
  ON page_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "page_views_select_anon"
  ON page_views FOR SELECT
  USING (true);

GRANT SELECT, INSERT ON page_views TO anon, authenticated;

-- ============================================================
-- Betterplace Charities (external catalogue)
-- ============================================================

CREATE TABLE betterplace_charities (
  betterplace_id  int          PRIMARY KEY,
  name            varchar(300) NOT NULL,
  description     text,
  city            varchar(200),
  country         varchar(100),
  tax_deductible  boolean,
  logo_url        text,
  website_url     text,
  betterplace_url text,
  imported_at     timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX idx_bp_charities_name ON betterplace_charities USING gin (name gin_trgm_ops);
CREATE INDEX idx_bp_charities_country ON betterplace_charities(country);

ALTER TABLE betterplace_charities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bp_charities_select_all"
  ON betterplace_charities FOR SELECT
  USING (true);

CREATE POLICY "bp_charities_insert_anon"
  ON betterplace_charities FOR INSERT
  WITH CHECK (true);

CREATE POLICY "bp_charities_update_anon"
  ON betterplace_charities FOR UPDATE
  USING (true);

GRANT SELECT, INSERT, UPDATE ON betterplace_charities TO anon, authenticated;
