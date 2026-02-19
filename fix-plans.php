<?php
/**
 * Script para criar os planos necessários no banco de dados
 * Execute: php fix-plans.php
 */

$dbHost = 'localhost';
$dbUser = 'root';
$dbPass = '';
$dbName = 'estox';

try {
    $pdo = new PDO(
        "mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4",
        $dbUser,
        $dbPass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
    
    echo "✅ Conectado ao banco de dados\n\n";
    
    // Função para gerar UUID simples
    function generateUuid() {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
    
    // Verificar se o plano gratuito existe
    $stmt = $pdo->query("SELECT id, name, slug FROM plans WHERE slug = 'gratuito'");
    $freePlan = $stmt->fetch();
    
    if (!$freePlan) {
        echo "📝 Criando plano gratuito...\n";
        $freePlanId = generateUuid();
        $pdo->exec("INSERT INTO plans (id, name, slug, price, vehicle_limit, features, is_active, created_at, updated_at) VALUES (
            '$freePlanId',
            'Gratuito',
            'gratuito',
            0.00,
            5,
            '[\"Até 5 veículos\", \"Catálogo com URL personalizada\", \"Integração WhatsApp\"]',
            true,
            NOW(),
            NOW()
        )");
        echo "✅ Plano gratuito criado (ID: $freePlanId)\n\n";
    } else {
        echo "✅ Plano gratuito já existe (ID: {$freePlan['id']})\n\n";
    }
    
    // Verificar e criar planos profissionais se necessário
    $plans = [
        [
            'slug' => 'profissional-mensal',
            'name' => 'Mensal',
            'price' => 105.90,
            'vehicle_limit' => 50,
            'duration_days' => 30,
            'features' => '["Até 50 veículos", "Catálogo com URL personalizada", "Suporte prioritário", "Relatórios avançados", "Integração WhatsApp", "Destaque nos anúncios"]',
            'checkout_url' => 'https://buy.stripe.com/9B600daUv0IhaAofeTfjG03'
        ],
        [
            'slug' => 'profissional-trimestral',
            'name' => 'Trimestral',
            'price' => 287.70, // 95.90/mês x 3
            'vehicle_limit' => 50,
            'duration_days' => 90,
            'features' => '["Até 50 veículos", "Catálogo com URL personalizada", "Suporte prioritário", "Relatórios avançados", "Integração WhatsApp", "Destaque nos anúncios"]',
            'checkout_url' => 'https://buy.stripe.com/5kQdR31jV4Yx8sgfeTfjG04'
        ],
        [
            'slug' => 'profissional-anual',
            'name' => 'Anual',
            'price' => 1030.80, // 85.90/mês x 12
            'vehicle_limit' => 50,
            'duration_days' => 365,
            'features' => '["Até 50 veículos", "Catálogo com URL personalizada", "Suporte prioritário", "Relatórios avançados", "Integração WhatsApp", "Destaque nos anúncios"]',
            'checkout_url' => 'https://buy.stripe.com/5kQdR31jV4Yx8sgfeTfjG04'
        ]
    ];
    
    foreach ($plans as $planData) {
        $stmt = $pdo->prepare("SELECT id FROM plans WHERE slug = ?");
        $stmt->execute([$planData['slug']]);
        $existing = $stmt->fetch();
        
        if (!$existing) {
            echo "📝 Criando plano {$planData['name']}...\n";
            $planId = generateUuid();
            
            // Verificar se a coluna checkout_url existe
            $checkCol = $pdo->query("SHOW COLUMNS FROM plans LIKE 'checkout_url'");
            $hasCheckoutUrl = $checkCol->rowCount() > 0;
            
            if ($hasCheckoutUrl) {
                $pdo->exec("INSERT INTO plans (id, name, slug, price, vehicle_limit, duration_days, features, checkout_url, is_active, created_at, updated_at) VALUES (
                    '$planId',
                    '{$planData['name']}',
                    '{$planData['slug']}',
                    {$planData['price']},
                    {$planData['vehicle_limit']},
                    {$planData['duration_days']},
                    '{$planData['features']}',
                    '{$planData['checkout_url']}',
                    true,
                    NOW(),
                    NOW()
                )");
            } else {
                $pdo->exec("INSERT INTO plans (id, name, slug, price, vehicle_limit, duration_days, features, is_active, created_at, updated_at) VALUES (
                    '$planId',
                    '{$planData['name']}',
                    '{$planData['slug']}',
                    {$planData['price']},
                    {$planData['vehicle_limit']},
                    {$planData['duration_days']},
                    '{$planData['features']}',
                    true,
                    NOW(),
                    NOW()
                )");
            }
            
            echo "✅ Plano {$planData['name']} criado (ID: $planId)\n\n";
        } else {
            echo "✅ Plano {$planData['name']} já existe\n\n";
        }
    }
    
    echo "🎉 Todos os planos estão configurados!\n";
    echo "Agora você pode fazer cadastro normalmente.\n";
    
} catch (PDOException $e) {
    echo "❌ ERRO: " . $e->getMessage() . "\n";
    exit(1);
}
