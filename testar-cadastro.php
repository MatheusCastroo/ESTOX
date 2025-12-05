<?php
/**
 * Script para testar o cadastro via API
 * Execute: C:\xampp\php\php.exe testar-cadastro.php
 */

$apiUrl = 'http://localhost/ESTOX/api/auth?action=register';

$testData = [
    'email' => 'teste' . time() . '@example.com',
    'password' => 'senha123',
    'name' => 'Usuário Teste'
];

echo "🧪 Testando cadastro na API...\n\n";
echo "URL: $apiUrl\n";
echo "Dados: " . json_encode($testData, JSON_PRETTY_PRINT) . "\n\n";

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Origin: http://localhost:8080'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo str_repeat("=", 60) . "\n";
echo "📊 RESULTADO\n";
echo str_repeat("=", 60) . "\n";
echo "HTTP Code: $httpCode\n";

if ($error) {
    echo "❌ Erro CURL: $error\n";
} else {
    $data = json_decode($response, true);
    if ($data) {
        echo "✅ Resposta JSON recebida:\n";
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
        
        if (isset($data['success']) && $data['success']) {
            echo "\n✅ Cadastro funcionando corretamente!\n";
        } else {
            echo "\n⚠️ Cadastro retornou erro: " . ($data['error'] ?? 'Erro desconhecido') . "\n";
        }
    } else {
        echo "⚠️ Resposta não é JSON válido:\n";
        echo $response . "\n";
    }
}

echo "\n💡 Se o teste funcionou aqui, o problema pode ser:\n";
echo "   1. CORS não permitindo a origem do frontend\n";
echo "   2. URL incorreta no frontend (já atualizada)\n";
echo "   3. Erro JavaScript no frontend\n";

