<?php

require_once __DIR__ . '/../classes/Database.php';
require_once __DIR__ . '/../classes/Response.php';
require_once __DIR__ . '/../classes/Middleware.php';

Middleware::cors();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance();
$userId = Middleware::requireAuth();

// REQ-FR-031: Get user's store_id to ensure data isolation
$storeId = Middleware::getUserStoreId($db, $userId);

switch ($method) {
    case 'GET':
        $settings = $db->fetchOne(
            "SELECT * FROM notification_settings WHERE store_id = :store_id",
            ['store_id' => $storeId]
        );
        
        Response::success(['settings' => $settings]);
        break;
        
    case 'PUT':
        // #region agent log
        $logPath = __DIR__ . '/../../.cursor/debug.log';
        $logData = [
            'location' => 'api/endpoints/notifications.php:PUT:entry',
            'message' => 'Iniciando PUT /notifications',
            'data' => [
                'userId' => $userId,
                'storeId' => $storeId
            ],
            'timestamp' => time() * 1000,
            'runId' => 'run1',
            'hypothesisId' => 'D'
        ];
        @file_put_contents($logPath, json_encode($logData) . "\n", FILE_APPEND);
        // #endregion
        
        try {
            $data = Middleware::getJsonInput();
            
            // #region agent log
            $logData2 = [
                'location' => 'api/endpoints/notifications.php:PUT:afterGetJson',
                'message' => 'JSON parseado com sucesso',
                'data' => [
                    'dataKeys' => array_keys($data ?? [])
                ],
                'timestamp' => time() * 1000,
                'runId' => 'run1',
                'hypothesisId' => 'B'
            ];
            @file_put_contents($logPath, json_encode($logData2) . "\n", FILE_APPEND);
            // #endregion
        } catch (Exception $e) {
            // #region agent log
            $logDataErr = [
                'location' => 'api/endpoints/notifications.php:PUT:jsonError',
                'message' => 'Erro ao parsear JSON',
                'data' => [
                    'error' => $e->getMessage(),
                    'errorType' => get_class($e)
                ],
                'timestamp' => time() * 1000,
                'runId' => 'run1',
                'hypothesisId' => 'B'
            ];
            @file_put_contents($logPath, json_encode($logDataErr) . "\n", FILE_APPEND);
            // #endregion
            throw $e;
        }
        
        $updateData = [];
        $allowedFields = ['new_lead_email', 'weekly_report', 'platform_updates'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = (bool)$data[$field];
            }
        }
        
        // #region agent log
        $logData3 = [
            'location' => 'api/endpoints/notifications.php:PUT:beforeUpdate',
            'message' => 'Preparando dados para update',
            'data' => [
                'updateFields' => array_keys($updateData),
                'storeId' => $storeId
            ],
            'timestamp' => time() * 1000,
            'runId' => 'run1',
            'hypothesisId' => 'D'
        ];
        @file_put_contents($logPath, json_encode($logData3) . "\n", FILE_APPEND);
        // #endregion
        
        if (empty($updateData)) {
            Response::error('Nenhum campo para atualizar', 400);
        }
        
        $updateData['updated_at'] = date('Y-m-d H:i:s');
        
        // #region agent log
        $logData4 = [
            'location' => 'api/endpoints/notifications.php:PUT:beforeDbUpdate',
            'message' => 'Chamando db->update()',
            'data' => [
                'table' => 'notification_settings',
                'storeId' => $storeId
            ],
            'timestamp' => time() * 1000,
            'runId' => 'run1',
            'hypothesisId' => 'D'
        ];
        @file_put_contents($logPath, json_encode($logData4) . "\n", FILE_APPEND);
        // #endregion
        
        try {
            $updatedSettings = $db->update('notification_settings', $updateData, 'store_id = :store_id', ['store_id' => $storeId]);
            
            // #region agent log
            $logData5 = [
                'location' => 'api/endpoints/notifications.php:PUT:afterDbUpdate',
                'message' => 'db->update() executado com sucesso',
                'data' => [
                    'hasResult' => !empty($updatedSettings)
                ],
                'timestamp' => time() * 1000,
                'runId' => 'run1',
                'hypothesisId' => 'D'
            ];
            @file_put_contents($logPath, json_encode($logData5) . "\n", FILE_APPEND);
            // #endregion
        } catch (Exception $e) {
            // #region agent log
            $logDataErr2 = [
                'location' => 'api/endpoints/notifications.php:PUT:dbUpdateError',
                'message' => 'Erro no db->update()',
                'data' => [
                    'error' => $e->getMessage(),
                    'errorType' => get_class($e),
                    'errorCode' => method_exists($e, 'getCode') ? $e->getCode() : null
                ],
                'timestamp' => time() * 1000,
                'runId' => 'run1',
                'hypothesisId' => 'D'
            ];
            @file_put_contents($logPath, json_encode($logDataErr2) . "\n", FILE_APPEND);
            // #endregion
            throw $e;
        }
        
        Response::success(['settings' => $updatedSettings], 'Configurações atualizadas com sucesso');
        break;
        
    default:
        Response::error('Método não permitido', 405);
}



