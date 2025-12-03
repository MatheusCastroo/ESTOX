-- AutoStock Database Seed
-- Script 002: Seed initial plans
-- MySQL Version

INSERT INTO plans (id, name, slug, price, vehicle_limit, features) VALUES
(
  UUID(),
  'Básico',
  'basico',
  99.90,
  20,
  '["Até 20 veículos", "Catálogo online personalizado", "Leads via WhatsApp", "Suporte por email"]'
),
(
  UUID(),
  'Profissional',
  'profissional',
  199.90,
  50,
  '["Até 50 veículos", "Tudo do Básico", "Relatórios avançados", "Destaque nos resultados", "Suporte prioritário"]'
),
(
  UUID(),
  'Enterprise',
  'enterprise',
  399.90,
  -1,
  '["Veículos ilimitados", "Tudo do Profissional", "API de integração", "Multi-usuários", "Gerente de conta dedicado"]'
)
ON DUPLICATE KEY UPDATE name=name;
