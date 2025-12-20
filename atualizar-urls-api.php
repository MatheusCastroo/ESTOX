<?php
/**
 * Script para atualizar todas as URLs da API nos arquivos JavaScript
 * Execute: C:\xampp\php\php.exe atualizar-urls-api.php
 */

$oldUrl = 'http://localhost/api';
$newUrl = 'http://localhost/ESTOX/api';

$files = [
    'html-version/assets/js/auth.js',
    'html-version/assets/js/catalog.js',
    'html-version/assets/js/dashboard.js',
    'html-version/assets/js/leads.js',
    'html-version/assets/js/new-vehicle.js',
    'html-version/assets/js/reports.js',
    'html-version/assets/js/settings.js',
    'html-version/assets/js/vehicle-detail.js',
    'html-version/assets/js/vehicles.js',
    'html-version/onboarding.html'
];

$updated = 0;
$errors = [];

echo "🔄 Atualizando URLs da API...\n\n";

foreach ($files as $file) {
    $filePath = __DIR__ . '/' . $file;
    
    if (!file_exists($filePath)) {
        $errors[] = "❌ Arquivo não encontrado: $file";
        continue;
    }
    
    $content = file_get_contents($filePath);
    $originalContent = $content;
    
    // Substituir a URL
    $content = str_replace($oldUrl, $newUrl, $content);
    
    if ($content !== $originalContent) {
        if (file_put_contents($filePath, $content)) {
            echo "✅ Atualizado: $file\n";
            $updated++;
        } else {
            $errors[] = "❌ Erro ao salvar: $file";
        }
    } else {
        echo "⏭️  Sem alterações: $file\n";
    }
}

echo "\n" . str_repeat("=", 60) . "\n";
echo "📊 RESUMO\n";
echo str_repeat("=", 60) . "\n";
echo "✅ Arquivos atualizados: $updated\n";

if (count($errors) > 0) {
    echo "❌ Erros: " . count($errors) . "\n";
    foreach ($errors as $error) {
        echo "   $error\n";
    }
}

echo "\n💡 Próximos passos:\n";
echo "   1. Teste o cadastro novamente\n";
echo "   2. Verifique se todas as requisições estão funcionando\n";
echo "   3. Ou configure um Virtual Host para usar URLs limpas (veja CONFIGURAR_VIRTUAL_HOST.md)\n";









