-- PostgreSQL production-target schema. This migration is documentation and is
-- not executed by the local JSON development server.
CREATE TYPE source_kind AS ENUM ('manual', 'csv_import', 'statement_import', 'official_api', 'authorized_aggregator');
CREATE TYPE instrument_type AS ENUM ('stock', 'etf', 'index_fund', 'mutual_fund', 'bond', 'bond_fund', 'government_security', 'reit', 'invit', 'gold', 'commodity', 'cash', 'alternative', 'other');

CREATE TABLE portfolios (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  base_currency CHAR(3) NOT NULL DEFAULT 'INR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE data_sources (
  id UUID PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  provider_code TEXT NOT NULL,
  kind source_kind NOT NULL,
  status TEXT NOT NULL,
  last_successful_sync_at TIMESTAMPTZ,
  freshness_as_of TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  data_source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,
  external_account_ref TEXT,
  display_name TEXT NOT NULL,
  account_type TEXT,
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  UNIQUE (data_source_id, external_account_ref)
);
CREATE TABLE instruments (
  id UUID PRIMARY KEY,
  isin TEXT,
  exchange_symbol TEXT,
  scheme_code TEXT,
  name TEXT NOT NULL,
  type instrument_type NOT NULL,
  issuer TEXT,
  domicile TEXT,
  underlying_index TEXT,
  expense_ratio NUMERIC(8,5),
  attributes JSONB NOT NULL DEFAULT '{}',
  UNIQUE NULLS NOT DISTINCT (isin, exchange_symbol, scheme_code)
);
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  instrument_id UUID NOT NULL REFERENCES instruments(id),
  external_transaction_ref TEXT,
  transaction_type TEXT NOT NULL,
  quantity NUMERIC(22,8) NOT NULL,
  price NUMERIC(22,8),
  fees NUMERIC(22,8) NOT NULL DEFAULT 0,
  occurred_at TIMESTAMPTZ NOT NULL,
  source_confidence NUMERIC(4,3) NOT NULL DEFAULT 1,
  metadata JSONB NOT NULL DEFAULT '{}',
  UNIQUE (account_id, external_transaction_ref)
);
CREATE TABLE positions (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  instrument_id UUID NOT NULL REFERENCES instruments(id),
  quantity NUMERIC(22,8) NOT NULL,
  average_cost NUMERIC(22,8),
  as_of TIMESTAMPTZ NOT NULL,
  source_confidence NUMERIC(4,3) NOT NULL,
  UNIQUE (account_id, instrument_id, as_of)
);
CREATE TABLE audit_events (
  id UUID PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  source_kind source_kind,
  payload JSONB NOT NULL DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX transactions_account_instrument_time_idx ON transactions(account_id, instrument_id, occurred_at);
CREATE INDEX positions_account_instrument_idx ON positions(account_id, instrument_id);
CREATE INDEX instruments_isin_idx ON instruments(isin) WHERE isin IS NOT NULL;
