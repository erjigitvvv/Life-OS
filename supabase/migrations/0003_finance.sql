-- Migration: 0003_finance.sql
-- Description: Finance module (budget, transactions, savings, debts, subscriptions)
-- Created: 2026-10-22

-- ============================================
-- BUDGET CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  allocated_amount NUMERIC(12, 2) DEFAULT 0,
  month DATE DEFAULT date_trunc('month', CURRENT_DATE),
  actual_amount NUMERIC(12, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL,
  type TEXT DEFAULT 'expense' CHECK (type IN ('income', 'expense')),
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SAVINGS GOALS
-- ============================================
CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC(12, 2) NOT NULL,
  current_amount NUMERIC(12, 2) DEFAULT 0,
  target_date DATE,
  saved_percentage NUMERIC(5, 2) GENERATED ALWAYS AS (
    CASE
      WHEN target_amount > 0 THEN (current_amount / target_amount) * 100
      ELSE 0
    END
  ) STORED,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- DEBTS
-- ============================================
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  remaining_amount NUMERIC(12, 2) NOT NULL,
  interest_rate NUMERIC(5, 2) DEFAULT 0,
  monthly_payment NUMERIC(12, 2) DEFAULT 0,
  due_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'paid_off')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly'
    CHECK (billing_cycle IN ('daily', 'weekly', 'monthly', 'yearly')),
  next_billing_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_budget_categories_user_id ON budget_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own budget_categories"
  ON budget_categories FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own transactions"
  ON transactions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own savings_goals"
  ON savings_goals FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own debts"
  ON debts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own subscriptions"
  ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_budget_categories_updated_at
  BEFORE UPDATE ON budget_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
