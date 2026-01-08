-- AutoStock Database Seed
-- Script 008: Seed Professional plans (Mensal, Trimestral)
-- MySQL Version

-- Desativar plano antigo 'profissional' se existir (não deletar para não quebrar referências)
UPDATE plans SET is_active = false WHERE slug = 'profissional' AND is_active = true;

-- Deletar planos antigos do tipo profissional com periodicidade se existirem
-- (Esses são seguros para deletar pois não devem estar em uso ainda)
DELETE FROM plans WHERE slug IN ('profissional-mensal', 'profissional-trimestral', 'profissional-anual');

-- Inserir planos Profissional com diferentes periodicidades
-- Preços: Mensal (R$ 139,90/mês), Trimestral (R$ 119,90/mês = R$ 359,70/trimestre)
INSERT INTO plans (id, name, slug, price, vehicle_limit, features, is_active) VALUES
(
  UUID(),
  'Mensal',
  'profissional-mensal',
  139.90,  -- Valor cheio mensal (sem desconto)
  50,
  '["Até 50 veículos", "Catálogo com URL personalizada", "Suporte prioritário", "Relatórios avançados", "Integração WhatsApp", "Destaque nos anúncios"]',
  true
),
(
  UUID(),
  'Trimestral',
  'profissional-trimestral',
  359.70,  -- R$ 119,90/mês x 3 = R$ 359,70/trimestre (Economia de R$ 20,00/mês - 14,3% desconto)
  50,
  '["Até 50 veículos", "Catálogo com URL personalizada", "Suporte prioritário", "Relatórios avançados", "Integração WhatsApp", "Destaque nos anúncios"]',
  true
);

