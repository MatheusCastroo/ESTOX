<?php

require_once __DIR__ . '/Database.php';

class Auth {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function register($email, $password, $name = null) {
        // Check if user already exists
        $existing = $this->db->fetchOne(
            "SELECT id FROM users WHERE email = :email",
            ['email' => $email]
        );

        if ($existing) {
            throw new Exception('Email já está em uso');
        }

        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $userId = $this->db->generateUuid();

        // Insert user
        $user = $this->db->insert('users', [
            'id' => $userId,
            'email' => $email,
            'password' => $hashedPassword,
            'name' => $name,
            'created_at' => date('Y-m-d H:i:s')
        ]);

        unset($user['password']);
        return $user;
    }

    public function login($email, $password) {
        $user = $this->db->fetchOne(
            "SELECT * FROM users WHERE email = :email",
            ['email' => $email]
        );

        if (!$user || !password_verify($password, $user['password'])) {
            throw new Exception('Email ou senha inválidos');
        }

        unset($user['password']);
        return $user;
    }

    public function getUserById($userId) {
        $user = $this->db->fetchOne(
            "SELECT id, email, name, role, created_at FROM users WHERE id = :id",
            ['id' => $userId]
        );

        return $user;
    }
    
    /**
     * Get user role
     */
    public function getUserRole($userId) {
        $user = $this->db->fetchOne(
            "SELECT role FROM users WHERE id = :id",
            ['id' => $userId]
        );
        
        return $user['role'] ?? 'user';
    }

    public function verifyToken($token) {
        $config = require __DIR__ . '/../config/config.php';
        
        try {
            $decoded = JWT::decode($token, $config['jwt_secret'], ['HS256']);
            return $decoded->userId;
        } catch (Exception $e) {
            return null;
        }
    }

    public function generateToken($userId, $role = null) {
        $config = require __DIR__ . '/../config/config.php';
        
        // Get role from database if not provided
        if ($role === null) {
            $role = $this->getUserRole($userId);
        }
        
        $payload = [
            'userId' => $userId,
            'role' => $role,
            'iat' => time(),
            'exp' => time() + $config['jwt_expiration']
        ];

        return JWT::encode($payload, $config['jwt_secret'], 'HS256');
    }
    
    /**
     * Verify token and return user data with role
     */
    public function verifyTokenWithRole($token) {
        $config = require __DIR__ . '/../config/config.php';
        
        try {
            $decoded = JWT::decode($token, $config['jwt_secret'], ['HS256']);
            return [
                'userId' => $decoded->userId,
                'role' => $decoded->role ?? 'user'
            ];
        } catch (Exception $e) {
            return null;
        }
    }
}



