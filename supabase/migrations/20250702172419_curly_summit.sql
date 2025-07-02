/*
  # Backend Integration Tables

  1. New Tables
    - `ai_insights` - Store AI-generated insights and recommendations
    - `webhook_logs` - Log all incoming webhook events
    - `linkedin_messages` - Track LinkedIn messages sent
    - `linkedin_profile_views` - Track profile views
    - `follow_up_tasks` - Manage follow-up actions

  2. Table Updates
    - Add `linkedin_url` to linkedin_contacts
    - Add `message_text` to linkedin_contacts
    - Add `accepted_at` and `declined_at` to linkedin_contacts

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- AI Insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'campaign')),
  title text NOT NULL,
  summary text NOT NULL,
  recommendations text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read AI insights"
  ON ai_insights
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "System can insert AI insights"
  ON ai_insights
  FOR INSERT
  TO authenticated
  USING (true);

-- Webhook logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  event_type text NOT NULL,
  data jsonb,
  processed_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error', 'pending')),
  error_message text
);

ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read webhook logs"
  ON webhook_logs
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "System can insert webhook logs"
  ON webhook_logs
  FOR INSERT
  TO authenticated
  USING (true);

-- LinkedIn messages table
CREATE TABLE IF NOT EXISTS linkedin_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_name text NOT NULL,
  recipient_url text,
  message_text text NOT NULL,
  conversation_id text,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE linkedin_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read LinkedIn messages"
  ON linkedin_messages
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "System can insert LinkedIn messages"
  ON linkedin_messages
  FOR INSERT
  TO authenticated
  USING (true);

-- LinkedIn profile views table
CREATE TABLE IF NOT EXISTS linkedin_profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewed_profile_name text NOT NULL,
  viewed_profile_url text,
  viewed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE linkedin_profile_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read profile views"
  ON linkedin_profile_views
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "System can insert profile views"
  ON linkedin_profile_views
  FOR INSERT
  TO authenticated
  USING (true);

-- Follow-up tasks table
CREATE TABLE IF NOT EXISTS follow_up_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name text NOT NULL,
  contact_url text,
  task_type text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE follow_up_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read follow-up tasks"
  ON follow_up_tasks
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "System can manage follow-up tasks"
  ON follow_up_tasks
  FOR ALL
  TO authenticated
  USING (true);

-- Update linkedin_contacts table with new fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'linkedin_contacts' AND column_name = 'linkedin_url'
  ) THEN
    ALTER TABLE linkedin_contacts ADD COLUMN linkedin_url text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'linkedin_contacts' AND column_name = 'message_text'
  ) THEN
    ALTER TABLE linkedin_contacts ADD COLUMN message_text text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'linkedin_contacts' AND column_name = 'accepted_at'
  ) THEN
    ALTER TABLE linkedin_contacts ADD COLUMN accepted_at timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'linkedin_contacts' AND column_name = 'declined_at'
  ) THEN
    ALTER TABLE linkedin_contacts ADD COLUMN declined_at timestamptz;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON ai_insights(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_source ON webhook_logs(source);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_linkedin_messages_sent_at ON linkedin_messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_status ON follow_up_tasks(status);
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_scheduled_for ON follow_up_tasks(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_linkedin_contacts_linkedin_url ON linkedin_contacts(linkedin_url);