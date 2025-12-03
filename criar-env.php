<?php
/**
 * Script para criar o arquivo .env automaticamente
 * Execute: php criar-env.php
 */

$envContent = <<<'ENV'
# ESTOX - Configuração do Banco de Dados MySQL
# Configuração para uso com phpMyAdmin (XAMPP)

DB_HOST=localhost
DB_PORT=3306
DB_NAME=estox
DB_USER=root
DB_PASSWORD=

# JWT Secret - Chave secreta para assinar tokens JWT
# IMPORTANTE: Altere esta chave para um valor único e seguro em produção!
# Esta chave foi gerada automaticamente - você pode gerar uma nova usando:
# php -r "echo bin2hex(random_bytes(32));"
JWT_SECRET={JWT_SECRET}

# CORS Origins - URLs permitidas para fazer requisições à API
# Separe múltiplas URLs por vírgula
# Para desenvolvimento local com HTML estático na porta 8080
CORS_ORIGINS=http://localhost:8080,http://localhost:3000
ENV;

// Gerar chave JWT segura
$jwtSecret = bin2hex(random_bytes(32));

// Substituir placeholder
$envContent = str_replace('{JWT_SECRET}', $jwtSecret, $envContent);

// Caminho do arquivo .env na raiz do projeto
$envPath = __DIR__ . '/.env';

// Verificar se já existe
if (file_exists($envPath)) {
    echo "⚠️  O arquivo .env já existe!\n";
    echo "Deseja sobrescrever? (s/N): ";
    $handle = fopen("php://stdin", "r");
    $line = fgets($handle);
    fclose($handle);
    
    if (trim(strtolower($line)) !== 's') {
        echo "❌ Operação cancelada.\n";
        exit(1);
    }
}

// Criar arquivo
if (file_put_contents($envPath, $envContent)) {
    echo "✅ Arquivo .env criado com sucesso em: $envPath\n";
    echo "📝 Chave JWT gerada automaticamente.\n";
    echo "\n";
    echo "🔧 Configurações:\n";
    echo "   - DB_HOST: localhost\n";
    echo "   - DB_PORT: 3306\n";
    echo "   - DB_NAME: estox\n";
    echo "   - DB_USER: root\n";
    echo "   - DB_PASSWORD: (vazio)\n";
    echo "   - JWT_SECRET: (gerado automaticamente)\n";
    echo "   - CORS_ORIGINS: http://localhost:8080,http://localhost:3000\n";
    echo "\n";
    echo "💡 Você pode ajustar essas configurações editando o arquivo .env\n";
} else {
    echo "❌ Erro ao criar o arquivo .env!\n";
    echo "Verifique as permissões da pasta.\n";
    exit(1);
}

