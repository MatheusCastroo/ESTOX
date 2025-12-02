<?php

class Response {
    public static function json($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success($data = null, $message = null) {
        $response = ['success' => true];
        if ($message) $response['message'] = $message;
        if ($data !== null) $response['data'] = $data;
        self::json($response);
    }

    public static function error($message, $statusCode = 400, $errors = null) {
        $response = [
            'success' => false,
            'error' => $message
        ];
        if ($errors) $response['errors'] = $errors;
        self::json($response, $statusCode);
    }

    public static function unauthorized($message = 'Não autorizado') {
        self::error($message, 401);
    }

    public static function forbidden($message = 'Acesso negado') {
        self::error($message, 403);
    }

    public static function notFound($message = 'Recurso não encontrado') {
        self::error($message, 404);
    }
}



