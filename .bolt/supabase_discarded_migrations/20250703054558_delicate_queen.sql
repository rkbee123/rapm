/*
  # n8n Integration Tables

  1. New Tables
    - `campaign_metrics` - Store campaign performance metrics from n8n
    - `raw_data_imports` - Store raw data imports for flexible processing

  2. Security
    - Enable RLS on new tables
    - Add policies for authenticated access
*/

-- Campaign metrics table
CREATE TABLE IF NOT EXISTS campaign_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id text,
  campaign_name text,
  metric_type text NOT NULL,
  metric_value numeric,
  metric_date date DEFAULT CURRENT_DATE,
  source text DEFAULT 'manual',
  raw_data jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read campaign metrics"
  ON campaign_metrics
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "System can insert campaign metrics"
  ON campaign_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update campaign metrics"
  ON campaign_metrics
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "System can delete campaign metrics"
  ON campaign_metrics
  FOR DELETE
  TO authenticated
  USING (true);

-- Raw data imports table
CREATE TABLE IF NOT EXISTS raw_data_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type text NOT NULL,
  source text NOT NULL DEFAULT 'unknown',
  raw_data jsonb NOT NULL,
  metadata jsonb DEFAULT '{}',
  processed boolean DEFAULT false,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE raw_data_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read raw data imports"
  ON raw_data_imports
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "System can insert raw data imports"
  ON raw_data_imports
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update raw data imports"
  ON raw_data_imports
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "System can delete raw data imports"
  ON raw_data_imports
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign_id ON campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_metric_type ON campaign_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_metric_date ON campaign_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_source ON campaign_metrics(source);

CREATE INDEX IF NOT EXISTS idx_raw_data_imports_data_type ON raw_data_imports(data_type);
CREATE INDEX IF NOT EXISTS idx_raw_data_imports_source ON raw_data_imports(source);
CREATE INDEX IF NOT EXISTS idx_raw_data_imports_processed ON raw_data_imports(processed);
CREATE INDEX IF NOT EXISTS idx_raw_data_imports_created_at ON raw_data_imports(created_at);