-- BBB Link Enhancer Database Schema
-- Para usar com Supabase ou PostgreSQL

-- Habilitar UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários admin
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'viewer', 'super_admin')),
  totp_secret TEXT, -- Para 2FA
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Tabela de contas de afiliado
CREATE TABLE IF NOT EXISTS affiliate_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL CHECK (platform IN ('amazon', 'mercadolivre', 'magalu', 'americanas', 'casasbahia', 'shopee', 'aliexpress', 'other')),
  account_tag TEXT NOT NULL, -- Ex: 'buscabr-20' para Amazon
  account_name TEXT,
  owner TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  test_mode BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, account_tag)
);

-- Índices para affiliate_accounts
CREATE INDEX idx_affiliate_platform ON affiliate_accounts(platform);
CREATE INDEX idx_affiliate_status ON affiliate_accounts(status);

-- Tabela principal de redirects/shortlinks
CREATE TABLE IF NOT EXISTS redirects (
  key TEXT PRIMARY KEY, -- Ex: 'abc123'
  dest TEXT NOT NULL, -- URL completa com tag de afiliado
  platform TEXT,
  affiliate_account_id UUID REFERENCES affiliate_accounts(id),
  owner TEXT, -- Identificador da campanha/owner
  title TEXT, -- Título do produto/campanha
  description TEXT,
  image_url TEXT,
  add_to_cart BOOLEAN DEFAULT false, -- Se deve tentar add-to-cart (Amazon)
  deep_link BOOLEAN DEFAULT true, -- Se deve tentar deep link para apps
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para redirects
CREATE INDEX idx_redirects_active ON redirects(active);
CREATE INDEX idx_redirects_platform ON redirects(platform);
CREATE INDEX idx_redirects_owner ON redirects(owner);
CREATE INDEX idx_redirects_created_at ON redirects(created_at DESC);
CREATE INDEX idx_redirects_expires_at ON redirects(expires_at) WHERE expires_at IS NOT NULL;

-- Tabela de clicks detalhados
CREATE TABLE IF NOT EXISTS clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  click_id TEXT UNIQUE NOT NULL, -- ID único do click
  redirect_key TEXT REFERENCES redirects(key) ON DELETE CASCADE,
  platform TEXT,
  owner TEXT,
  
  -- Informações do usuário
  ip_address INET,
  ip_country TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  is_mobile BOOLEAN DEFAULT false,
  
  -- Origem
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  
  -- Persistência
  cookie_set BOOLEAN DEFAULT false,
  localstorage_set BOOLEAN DEFAULT false,
  deep_link_attempted BOOLEAN DEFAULT false,
  add_to_cart_attempted BOOLEAN DEFAULT false,
  
  -- Timestamps
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Performance
  redirect_time_ms INTEGER, -- Tempo do redirect em ms
  page_load_time_ms INTEGER -- Tempo de carregamento da página intermediária
);

-- Índices para clicks
CREATE INDEX idx_clicks_redirect_key ON clicks(redirect_key);
CREATE INDEX idx_clicks_click_id ON clicks(click_id);
CREATE INDEX idx_clicks_clicked_at ON clicks(clicked_at DESC);
CREATE INDEX idx_clicks_platform ON clicks(platform);
CREATE INDEX idx_clicks_owner ON clicks(owner);
CREATE INDEX idx_clicks_country ON clicks(ip_country);
CREATE INDEX idx_clicks_device ON clicks(device_type);
CREATE INDEX idx_clicks_referrer ON clicks(referrer);

-- Tabela de conversões
CREATE TABLE IF NOT EXISTS conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  click_id TEXT REFERENCES clicks(click_id),
  redirect_key TEXT REFERENCES redirects(key),
  
  -- Informações da transação
  affiliate_platform TEXT NOT NULL,
  affiliate_tx_id TEXT NOT NULL, -- ID da transação no painel do afiliado
  order_id TEXT,
  product_name TEXT,
  product_asin TEXT, -- Para Amazon
  product_id TEXT, -- ID genérico do produto
  
  -- Valores
  sale_amount DECIMAL(10, 2),
  commission_amount DECIMAL(10, 2),
  commission_rate DECIMAL(5, 2), -- Porcentagem
  currency TEXT DEFAULT 'BRL',
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
  rejection_reason TEXT,
  
  -- Datas
  sale_date TIMESTAMPTZ,
  confirmed_date TIMESTAMPTZ,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Reconciliação
  matched_by TEXT CHECK (matched_by IN ('click_id', 'time_window', 'manual', 'api')),
  confidence_score DECIMAL(3, 2), -- 0.00 a 1.00
  notes TEXT,
  
  UNIQUE(affiliate_platform, affiliate_tx_id)
);

-- Índices para conversions
CREATE INDEX idx_conversions_click_id ON conversions(click_id);
CREATE INDEX idx_conversions_redirect_key ON conversions(redirect_key);
CREATE INDEX idx_conversions_status ON conversions(status);
CREATE INDEX idx_conversions_sale_date ON conversions(sale_date DESC);
CREATE INDEX idx_conversions_platform ON conversions(affiliate_platform);

-- Tabela de métricas agregadas (para dashboard)
CREATE TABLE IF NOT EXISTS daily_metrics (
  date DATE NOT NULL,
  redirect_key TEXT,
  platform TEXT,
  owner TEXT,
  
  -- Métricas
  clicks INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  commission DECIMAL(10, 2) DEFAULT 0,
  
  -- Dispositivos
  mobile_clicks INTEGER DEFAULT 0,
  desktop_clicks INTEGER DEFAULT 0,
  
  -- Performance
  avg_redirect_time_ms INTEGER,
  cookie_set_rate DECIMAL(5, 2), -- Porcentagem
  
  PRIMARY KEY (date, COALESCE(redirect_key, ''), COALESCE(platform, ''), COALESCE(owner, ''))
);

-- Índices para daily_metrics
CREATE INDEX idx_daily_metrics_date ON daily_metrics(date DESC);
CREATE INDEX idx_daily_metrics_redirect_key ON daily_metrics(redirect_key);
CREATE INDEX idx_daily_metrics_platform ON daily_metrics(platform);
CREATE INDEX idx_daily_metrics_owner ON daily_metrics(owner);

-- Tabela de audit log
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT, -- 'redirect', 'conversion', 'user', etc.
  entity_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para audit_logs
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);

-- Tabela de API keys
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_hash TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  permissions JSONB DEFAULT '["read"]'::jsonb,
  rate_limit INTEGER DEFAULT 60, -- Requests por minuto
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para api_keys
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_active ON api_keys(active);

-- Tabela de webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  events TEXT[] DEFAULT ARRAY['conversion.confirmed'],
  secret TEXT,
  active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de jobs/tasks
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL, -- 'import_csv', 'reconcile', 'export', etc.
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  payload JSONB,
  result JSONB,
  error TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para jobs
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

-- Views úteis

-- View de performance por link
CREATE OR REPLACE VIEW link_performance AS
SELECT 
  r.key,
  r.title,
  r.platform,
  r.owner,
  r.click_count,
  r.conversion_count,
  CASE 
    WHEN r.click_count > 0 
    THEN ROUND((r.conversion_count::NUMERIC / r.click_count) * 100, 2)
    ELSE 0 
  END as conversion_rate,
  COALESCE(SUM(c.commission_amount), 0) as total_commission,
  r.created_at,
  r.active
FROM redirects r
LEFT JOIN conversions c ON c.redirect_key = r.key AND c.status = 'confirmed'
GROUP BY r.key, r.title, r.platform, r.owner, r.click_count, r.conversion_count, r.created_at, r.active;

-- View de métricas diárias
CREATE OR REPLACE VIEW daily_dashboard AS
SELECT 
  date,
  SUM(clicks) as total_clicks,
  SUM(unique_visitors) as total_visitors,
  SUM(conversions) as total_conversions,
  SUM(revenue) as total_revenue,
  SUM(commission) as total_commission,
  CASE 
    WHEN SUM(clicks) > 0 
    THEN ROUND((SUM(conversions)::NUMERIC / SUM(clicks)) * 100, 2)
    ELSE 0 
  END as conversion_rate,
  ROUND(AVG(cookie_set_rate), 2) as avg_cookie_rate
FROM daily_metrics
GROUP BY date
ORDER BY date DESC;

-- View de dispositivos
CREATE OR REPLACE VIEW device_stats AS
SELECT 
  device_type,
  COUNT(*) as click_count,
  ROUND((COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM clicks)) * 100, 2) as percentage,
  AVG(redirect_time_ms) as avg_redirect_time,
  SUM(CASE WHEN cookie_set THEN 1 ELSE 0 END) as cookies_set,
  SUM(CASE WHEN deep_link_attempted THEN 1 ELSE 0 END) as deep_links
FROM clicks
WHERE clicked_at > NOW() - INTERVAL '30 days'
GROUP BY device_type
ORDER BY click_count DESC;

-- Functions

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_redirects_updated_at BEFORE UPDATE ON redirects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_conversions_updated_at BEFORE UPDATE ON conversions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_affiliate_accounts_updated_at BEFORE UPDATE ON affiliate_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Função para incrementar clicks
CREATE OR REPLACE FUNCTION increment_click_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE redirects 
  SET 
    click_count = click_count + 1,
    last_clicked_at = NEW.clicked_at
  WHERE key = NEW.redirect_key;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para incrementar clicks
CREATE TRIGGER increment_redirect_clicks AFTER INSERT ON clicks
  FOR EACH ROW EXECUTE FUNCTION increment_click_count();

-- Função para incrementar conversões
CREATE OR REPLACE FUNCTION increment_conversion_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    UPDATE redirects 
    SET conversion_count = conversion_count + 1
    WHERE key = NEW.redirect_key;
  ELSIF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
    UPDATE redirects 
    SET conversion_count = GREATEST(conversion_count - 1, 0)
    WHERE key = NEW.redirect_key;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para incrementar conversões
CREATE TRIGGER update_redirect_conversions 
  AFTER INSERT OR UPDATE OF status ON conversions
  FOR EACH ROW EXECUTE FUNCTION increment_conversion_count();

-- Dados iniciais

-- Inserir usuário admin padrão (senha: admin123 - MUDAR EM PRODUÇÃO!)
-- Use bcrypt para gerar o hash correto
INSERT INTO users (username, email, password_hash, role) VALUES 
  ('admin', 'admin@bbbrasil.com', '$2b$10$YourHashedPasswordHere', 'super_admin')
ON CONFLICT (username) DO NOTHING;

-- Inserir contas de afiliado exemplo
INSERT INTO affiliate_accounts (platform, account_tag, account_name, owner, status) VALUES
  ('amazon', 'buscabr-20', 'Busca Busca Principal', 'BBB', 'active'),
  ('mercadolivre', 'MLB-123456', 'Busca Busca ML', 'BBB', 'active')
ON CONFLICT (platform, account_tag) DO NOTHING;

-- Comentários nas tabelas
COMMENT ON TABLE users IS 'Usuários administrativos do sistema';
COMMENT ON TABLE redirects IS 'Links curtos e seus destinos';
COMMENT ON TABLE clicks IS 'Registro detalhado de cada click';
COMMENT ON TABLE conversions IS 'Vendas confirmadas e comissões';
COMMENT ON TABLE daily_metrics IS 'Métricas agregadas por dia para dashboard';
COMMENT ON TABLE audit_logs IS 'Log de todas as ações administrativas';

-- Estatísticas e maintenance
ANALYZE users, redirects, clicks, conversions, daily_metrics;
