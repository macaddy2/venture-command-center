-- ============================================================
-- Venture Command Center — Supabase SQL Schema
-- ============================================================
-- Run this in the Supabase SQL editor to create all tables.
-- ============================================================

-- Ventures
CREATE TABLE IF NOT EXISTS ventures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    prefix VARCHAR(10) NOT NULL,
    geo VARCHAR(5) NOT NULL DEFAULT 'UK',
    tier VARCHAR(20) NOT NULL DEFAULT 'Incubating',
    status TEXT NOT NULL DEFAULT '',
    stage TEXT NOT NULL DEFAULT '',
    color VARCHAR(10) NOT NULL DEFAULT '#6366F1',
    light_color VARCHAR(10) NOT NULL DEFAULT '#E8DAEF',
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'backlog',
    priority VARCHAR(5) NOT NULL DEFAULT 'P2',
    due_date DATE,
    milestone_id UUID,
    blocked_by UUID REFERENCES tasks(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    assignee TEXT DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_date DATE NOT NULL,
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Roles
CREATE TABLE IF NOT EXISTS team_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    assignee_name TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registrations
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GitHub Stats
CREATE TABLE IF NOT EXISTS github_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
    repos INT DEFAULT 0,
    commits_7d INT DEFAULT 0,
    prs_open INT DEFAULT 0,
    last_activity TEXT DEFAULT '',
    repo_url TEXT DEFAULT '',
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Insights
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venture_id UUID REFERENCES ventures(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL DEFAULT 'general',
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health Snapshots
CREATE TABLE IF NOT EXISTS health_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
    score INT NOT NULL CHECK (score >= 0 AND score <= 100),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Records
CREATE TABLE IF NOT EXISTS financials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL DEFAULT 'expense',
    category TEXT NOT NULL DEFAULT '',
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(5) NOT NULL DEFAULT 'GBP',
    description TEXT DEFAULT '',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'other',
    url TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    category VARCHAR(30) NOT NULL DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risks
CREATE TABLE IF NOT EXISTS risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    likelihood VARCHAR(20) NOT NULL DEFAULT 'medium',
    impact VARCHAR(20) NOT NULL DEFAULT 'medium',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    mitigation TEXT DEFAULT '',
    owner TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring Tasks
CREATE TABLE IF NOT EXISTS recurring_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    pattern VARCHAR(20) NOT NULL DEFAULT 'weekly',
    next_due DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    priority VARCHAR(5) NOT NULL DEFAULT 'P2',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resource Sharing
CREATE TABLE IF NOT EXISTS resource_sharing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
    to_venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
    resource_type VARCHAR(30) NOT NULL DEFAULT 'knowledge',
    description TEXT DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_venture_id ON tasks(venture_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_milestones_venture_id ON milestones(venture_id);
CREATE INDEX IF NOT EXISTS idx_github_stats_venture_id ON github_stats(venture_id);
CREATE INDEX IF NOT EXISTS idx_health_snapshots_venture_id ON health_snapshots(venture_id);
CREATE INDEX IF NOT EXISTS idx_financials_venture_id ON financials(venture_id);
CREATE INDEX IF NOT EXISTS idx_risks_venture_id ON risks(venture_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_venture_id ON ai_insights(venture_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at on modify
CREATE TRIGGER ventures_updated_at BEFORE UPDATE ON ventures FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security (enable for all tables)
ALTER TABLE ventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_sharing ENABLE ROW LEVEL SECURITY;

-- Permissive policies (allow all for anon key — single-user app)
CREATE POLICY "Allow all" ON ventures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON milestones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON team_roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON registrations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON github_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON ai_insights FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON health_snapshots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON financials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON risks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON recurring_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON resource_sharing FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE ventures;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE milestones;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_insights;
