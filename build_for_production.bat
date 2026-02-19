@echo off
REM Script para build de produção no Windows
REM Execute: build_for_production.bat

echo 🚀 Iniciando build para produção...

REM Limpar builds anteriores
echo 🧹 Limpando builds anteriores...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

REM Instalar dependências
echo 📦 Instalando dependências...
call npm install

REM Build do Next.js
echo 🔨 Fazendo build do Next.js...
call npm run build

REM Verificar se o build foi bem-sucedido
if exist .next (
    echo ✅ Build concluído com sucesso!
    echo 📁 Pasta .next criada
    echo.
    echo 📤 Próximos passos:
    echo 1. Faça upload da pasta .next para o servidor
    echo 2. Faça upload de todas as outras pastas e arquivos
    echo 3. Configure o .env no servidor
    echo 4. Instale as dependências no servidor: npm install --production
    echo 5. Configure Node.js no hPanel da Hostinger
) else (
    echo ❌ Erro no build. Verifique os logs acima.
    exit /b 1
)

pause
