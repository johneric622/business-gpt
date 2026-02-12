-- Create messages table for chat conversations
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES business_plans(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on plan_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_messages_plan_id ON messages(plan_id);

-- Create index on created_at for chronological ordering
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(plan_id, created_at);


