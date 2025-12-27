<?php
/**
 * Test Simple - Teste básico de PHP
 * Acesse: https://nerdparadise.com.br/api/test-simple.php
 */

header('Content-Type: text/plain; charset=utf-8');

echo "✅ PHP está funcionando!\n\n";
echo "Data/Hora: " . date('Y-m-d H:i:s') . "\n";
echo "PHP Version: " . phpversion() . "\n";
echo "Servidor: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'desconhecido') . "\n";
echo "Arquivo atual: " . __FILE__ . "\n";
echo "Diretório: " . __DIR__ . "\n\n";

echo "Se você vê esta mensagem, PHP está funcionando corretamente na pasta /api/\n";




