<?php
/**
 * Verificar arquivos .env
 * Acesse: http://localhost/ESTOX/api/check-env.php
 */

$envPaths = [
    __DIR__ . '/.env',
    __DIR__ . '/../.env',
];

echo "<h1>🔍 Verificação de Arquivos .env</h1>";
echo "<style>body{font-family:Arial;max-width:800px;margin:50px auto;padding:20px;} .info{background:#f0f0f0;padding:15px;margin:10px 0;border-radius:5px;} .success{background:#d1fae5;} .warning{background:#fef3c7;}</style>";

foreach ($envPaths as $path) {
    echo "<div class='info'>";
    echo "<h3>📁 " . htmlspecialchars($path) . "</h3>";
    
    if (file_exists($path)) {
        echo "<p style='color:green;'>✅ Arquivo existe</p>";
        
        $content = file_get_contents($path);
        $lines = explode("\n", $content);
        
        echo "<h4>Conteúdo:</h4>";
        echo "<pre style='background:#fff;padding:10px;border:1px solid #ddd;'>";
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) {
                echo htmlspecialchars($line) . "\n";
            } else {
                // Mascarar senhas
                if (stripos($line, 'PASSWORD') !== false || stripos($line, 'PASS') !== false) {
                    $parts = explode('=', $line, 2);
                    if (count($parts) === 2) {
                        echo htmlspecialchars($parts[0]) . "=" . (empty($parts[1]) ? '(vazio)' : '***') . "\n";
                    } else {
                        echo htmlspecialchars($line) . "\n";
                    }
                } else {
                    echo htmlspecialchars($line) . "\n";
                }
            }
        }
        echo "</pre>";
        
        // Verificar se tem DB_PASSWORD definido
        if (preg_match('/DB_PASSWORD\s*=\s*(.+)/i', $content, $matches)) {
            $password = trim($matches[1]);
            if (!empty($password)) {
                echo "<div class='warning'>";
                echo "<strong>⚠️ ATENÇÃO:</strong> DB_PASSWORD está definido com valor: <code>***</code><br>";
                echo "Em localhost, a senha deve estar vazia. Remova ou deixe: <code>DB_PASSWORD=</code>";
                echo "</div>";
            } else {
                echo "<p style='color:green;'>✅ DB_PASSWORD está vazio (correto para localhost)</p>";
            }
        }
    } else {
        echo "<p style='color:orange;'>⚠️ Arquivo não existe (isso é OK - sistema usa detecção automática)</p>";
    }
    
    echo "</div>";
}

echo "<div class='info success'>";
echo "<h3>💡 Recomendação</h3>";
echo "<p>Em <strong>localhost</strong>, você NÃO precisa de arquivo .env.</p>";
echo "<p>O sistema detecta automaticamente e usa:</p>";
echo "<ul>";
echo "<li>Database: <code>estox</code></li>";
echo "<li>User: <code>root</code></li>";
echo "<li>Password: <code>(vazia)</code></li>";
echo "</ul>";
echo "<p>Se você tem um arquivo .env com senha, remova a linha <code>DB_PASSWORD</code> ou delete o arquivo.</p>";
echo "</div>";
