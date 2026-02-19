#!/bin/bash

# Script para build de produção
# Execute: bash build_for_production.sh

echo "🚀 Iniciando build para produção..."

# Limpar builds anteriores
echo "🧹 Limpando builds anteriores..."
rm -rf .next
rm -rf node_modules/.cache

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build do Next.js
echo "🔨 Fazendo build do Next.js..."
npm run build

# Verificar se o build foi bem-sucedido
if [ -d ".next" ]; then
    echo "✅ Build concluído com sucesso!"
    echo "📁 Pasta .next criada"
    echo ""
    echo "📤 Próximos passos:"
    echo "1. Faça upload da pasta .next para o servidor"
    echo "2. Faça upload de todas as outras pastas e arquivos"
    echo "3. Configure o .env no servidor"
    echo "4. Instale as dependências no servidor: npm install --production"
    echo "5. Configure Node.js no hPanel da Hostinger"
else
    echo "❌ Erro no build. Verifique os logs acima."
    exit 1
fi
