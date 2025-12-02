-- AutoStock RLS Policies
-- Script 003: Row Level Security

-- Habilitar RLS em todas as tabelas
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Políticas para Plans (leitura pública)
DROP POLICY IF EXISTS "Plans are viewable by everyone" ON plans;
CREATE POLICY "Plans are viewable by everyone" ON plans
  FOR SELECT USING (is_active = true);

-- Políticas para Stores
DROP POLICY IF EXISTS "Users can view their own stores" ON stores;
CREATE POLICY "Users can view their own stores" ON stores
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own stores" ON stores;
CREATE POLICY "Users can insert their own stores" ON stores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own stores" ON stores;
CREATE POLICY "Users can update their own stores" ON stores
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can view active stores by slug" ON stores;
CREATE POLICY "Public can view active stores by slug" ON stores
  FOR SELECT USING (is_active = true);

-- Políticas para Vehicles
DROP POLICY IF EXISTS "Store owners can manage their vehicles" ON vehicles;
CREATE POLICY "Store owners can manage their vehicles" ON vehicles
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Public can view available vehicles" ON vehicles;
CREATE POLICY "Public can view available vehicles" ON vehicles
  FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE is_active = true)
  );

-- Políticas para Leads
DROP POLICY IF EXISTS "Store owners can view their leads" ON leads;
CREATE POLICY "Store owners can view their leads" ON leads
  FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Store owners can update their leads" ON leads;
CREATE POLICY "Store owners can update their leads" ON leads
  FOR UPDATE USING (
    store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Anyone can create leads" ON leads;
CREATE POLICY "Anyone can create leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Políticas para Vehicle Views
DROP POLICY IF EXISTS "Store owners can view their vehicle views" ON vehicle_views;
CREATE POLICY "Store owners can view their vehicle views" ON vehicle_views
  FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Anyone can insert vehicle views" ON vehicle_views;
CREATE POLICY "Anyone can insert vehicle views" ON vehicle_views
  FOR INSERT WITH CHECK (true);

-- Políticas para Notification Settings
DROP POLICY IF EXISTS "Store owners can manage notification settings" ON notification_settings;
CREATE POLICY "Store owners can manage notification settings" ON notification_settings
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())
  );
