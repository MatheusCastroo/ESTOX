<?php

// Load environment variables before database connection
require_once __DIR__ . '/../config/load-env.php';

class Database {
    private static $instance = null;
    private $connection;

    private function __construct() {
        $config = require __DIR__ . '/../config/database.php';
        
        // Check if we're using default values (likely .env not loaded)
        $usingDefaults = ($config['username'] === 'root' && $config['password'] === '');
        if ($usingDefaults) {
            // Check if .env files exist
            $envPaths = [
                __DIR__ . '/../.env',
                __DIR__ . '/../../.env',
            ];
            $envExists = false;
            foreach ($envPaths as $envPath) {
                if (file_exists($envPath)) {
                    $envExists = true;
                    break;
                }
            }
            
            if (!$envExists) {
                http_response_code(500);
                echo json_encode([
                    'error' => 'Arquivo .env não encontrado. Configure o banco de dados no arquivo .env na pasta api/',
                    'help' => 'Acesse: https://seudominio.com.br/criar-env-hostinger.php para criar o arquivo .env automaticamente',
                    'default_config_used' => true,
                    'checked_paths' => $envPaths
                ]);
                exit;
            }
        }
        
        try {
            $dsn = sprintf(
                "mysql:host=%s;port=%s;dbname=%s;charset=%s",
                $config['host'],
                $config['port'],
                $config['database'],
                $config['charset']
            );
            
            $this->connection = new PDO(
                $dsn,
                $config['username'],
                $config['password'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::ATTR_TIMEOUT => 5,              // 5 seconds connection timeout
                    PDO::ATTR_PERSISTENT => false,       // No persistent connections (prevents connection exhaustion)
                ]
            );
            
            // Set MySQL timeouts
            $this->connection->exec("SET SESSION wait_timeout = 30");
            $this->connection->exec("SET SESSION interactive_timeout = 30");
        } catch (PDOException $e) {
            http_response_code(500);
            $errorMsg = 'Database connection failed: ' . $e->getMessage();
            
            // Add helpful message if using default credentials
            if ($usingDefaults && strpos($e->getMessage(), 'Access denied') !== false) {
                $errorMsg .= '. Verifique se o arquivo .env está configurado corretamente com as credenciais do banco de dados.';
            }
            
            echo json_encode(['error' => $errorMsg]);
            exit;
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->connection;
    }

    public function query($sql, $params = []) {
        try {
            // Check if connection is still alive
            if (!$this->connection) {
                throw new Exception('Database connection lost');
            }
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            // Log error but don't expose details to client
            error_log('Database query error: ' . $e->getMessage());
            
            // Check for connection timeout or server gone away
            if (strpos($e->getMessage(), 'server has gone away') !== false || 
                strpos($e->getMessage(), 'Connection timed out') !== false) {
                throw new Exception('Database connection timeout. Please try again.');
            }
            
            throw new Exception('Database query failed');
        }
    }

    public function fetchAll($sql, $params = []) {
        return $this->query($sql, $params)->fetchAll();
    }

    public function fetchOne($sql, $params = []) {
        $result = $this->query($sql, $params)->fetch();
        return $result ?: null;
    }

    public function insert($table, $data) {
        $columns = implode(', ', array_keys($data));
        $placeholders = ':' . implode(', :', array_keys($data));
        
        $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
        $this->query($sql, $data);
        
        // Get the last inserted ID or UUID
        $id = isset($data['id']) ? $data['id'] : $this->connection->lastInsertId();
        
        // Fetch the inserted record
        return $this->fetchOne(
            "SELECT * FROM {$table} WHERE id = :id",
            ['id' => $id]
        );
    }

    public function update($table, $data, $where, $whereParams = []) {
        $set = [];
        foreach (array_keys($data) as $key) {
            $set[] = "{$key} = :{$key}";
        }
        $setClause = implode(', ', $set);
        
        $sql = "UPDATE {$table} SET {$setClause} WHERE {$where}";
        $params = array_merge($data, $whereParams);
        $this->query($sql, $params);
        
        // Fetch the updated record using the WHERE clause
        $fetchSql = "SELECT * FROM {$table} WHERE {$where}";
        return $this->fetchOne($fetchSql, $whereParams);
    }

    public function delete($table, $where, $params = []) {
        $sql = "DELETE FROM {$table} WHERE {$where}";
        $this->query($sql, $params);
        return true;
    }

    public function generateUuid() {
        $result = $this->query("SELECT UUID() as uuid");
        return $result->fetch()['uuid'];
    }
}



