<?php
/**
 * Email Service Class
 * Handles sending subscription-related emails
 */

class EmailService {
    private $fromEmail;
    private $fromName;
    
    public function __construct() {
        $this->fromEmail = getenv('EMAIL_FROM') ?: 'noreply@estocx.com.br';
        $this->fromName = getenv('EMAIL_FROM_NAME') ?: 'Estocx';
    }
    
    /**
     * Send trial reminder email (7, 10, or 14 days before expiration)
     */
    public function sendTrialReminder($store, $daysRemaining) {
        $user = $this->getStoreUser($store['user_id']);
        if (!$user) return false;
        
        $subject = $this->getReminderSubject($daysRemaining);
        $body = $this->getReminderBody($store, $daysRemaining, $user);
        
        return $this->sendEmail($user['email'], $subject, $body, $store['id'], "trial_reminder_{$daysRemaining}d");
    }
    
    /**
     * Send payment success email
     */
    public function sendPaymentSuccess($store, $transaction) {
        $user = $this->getStoreUser($store['user_id']);
        if (!$user) return false;
        
        $subject = "Pagamento confirmado - {$store['name']}";
        $body = $this->getPaymentSuccessBody($store, $transaction);
        
        return $this->sendEmail($user['email'], $subject, $body, $store['id'], 'payment_success');
    }
    
    /**
     * Send payment failed email
     */
    public function sendPaymentFailed($store, $transaction) {
        $user = $this->getStoreUser($store['user_id']);
        if (!$user) return false;
        
        $subject = "Falha no pagamento - {$store['name']}";
        $body = $this->getPaymentFailedBody($store, $transaction);
        
        return $this->sendEmail($user['email'], $subject, $body, $store['id'], 'payment_failed');
    }
    
    /**
     * Get reminder subject based on days
     */
    private function getReminderSubject($daysRemaining) {
        switch ($daysRemaining) {
            case 7:
                return "Lembrete — 7 dias";
            case 10:
                return "Lembrete — 10 dias";
            case 14:
                return "Último aviso — 14 dias";
            default:
                return "Lembrete sobre seu plano ESTOCX";
        }
    }
    
    /**
     * Get reminder email body
     */
    private function getReminderBody($store, $daysRemaining, $user) {
        $checkoutUrl = getenv('APP_URL') . '/renovar-plano?store=' . $store['id'];
        $userName = $user['name'] ?? 'Olá';
        
        $message = match($daysRemaining) {
            7 => "Olá!\n\n" .
                 "Seu período gratuito do nosso sistema termina em alguns dias.\n" .
                 "Para continuar usando normalmente, basta fazer a renovação do plano.\n\n" .
                 "<a href=\"{$checkoutUrl}\" class=\"button\">Renovar Plano</a>\n\n" .
                 "Se precisar de ajuda ou tiver alguma dúvida, estamos à disposição 😊\n\n" .
                 "Abraços,\n" .
                 "Equipe ESTOCX",
                 
            10 => "Olá!\n\n" .
                  "Passando aqui para lembrar que seu plano está bem perto do vencimento.\n" .
                  "Caso ainda não tenha feito a renovação, é só acessar seu painel e concluir o pagamento.\n\n" .
                  "<a href=\"{$checkoutUrl}\" class=\"button\">Renovar Plano</a>\n\n" .
                  "Queremos garantir que nada do seu sistema seja interrompido.\n\n" .
                  "Conte com a gente!\n" .
                  "Equipe ESTOCX",
                  
            14 => "Olá!\n\n" .
                  "Este é o último lembrete sobre a renovação do seu plano.\n" .
                  "Se o pagamento não for confirmado, sua conta será temporariamente desativada.\n\n" .
                  "<a href=\"{$checkoutUrl}\" class=\"button\">Renovar Plano</a>\n\n" .
                  "Fique tranquilo(a): nenhuma informação será apagada — basta renovar para tudo voltar ao normal.\n\n" .
                  "Caso precise de ajuda, fale com a nossa equipe.\n\n" .
                  "Obrigado,\n" .
                  "Equipe ESTOCX",
                  
            default => "Olá!\n\n" .
                       "Seu plano está próximo do vencimento.\n\n" .
                       "<a href=\"{$checkoutUrl}\" class=\"button\">Renovar Plano</a>\n\n" .
                       "Equipe ESTOX"
        };
        
        return $this->wrapEmailTemplate($message, $store['name']);
    }
    
    /**
     * Get payment success body
     */
    private function getPaymentSuccessBody($store, $transaction) {
        $amount = isset($transaction['amount']) ? number_format($transaction['amount'] / 100, 2, ',', '.') : 'N/A';
        
        return $this->wrapEmailTemplate(
            "Olá!\n\n" .
            "Seu pagamento foi confirmado com sucesso!\n\n" .
            "Sua loja <strong>{$store['name']}</strong> está ativa e funcionando normalmente.\n\n" .
            "Obrigado por confiar no ESTOCX!\n\n" .
            "Abraços,\n" .
                 "Equipe ESTOCX",
            $store['name']
        );
    }
    
    /**
     * Get payment failed body
     */
    private function getPaymentFailedBody($store, $transaction) {
        $checkoutUrl = getenv('APP_URL') . '/renovar-plano?store=' . $store['id'];
        
        return $this->wrapEmailTemplate(
            "Olá!\n\n" .
            "Infelizmente, seu pagamento não foi processado.\n\n" .
            "Por favor, tente novamente ou entre em contato conosco se precisar de ajuda.\n\n" .
            "<a href=\"{$checkoutUrl}\" class=\"button\">Tentar Novamente</a>\n\n" .
            "Caso precise de ajuda, fale com a nossa equipe.\n\n" .
            "Obrigado,\n" .
                 "Equipe ESTOCX",
            $store['name']
        );
    }
    
    /**
     * Wrap message in email template
     */
    private function wrapEmailTemplate($message, $storeName) {
        // Convert line breaks and preserve HTML
        $formattedMessage = nl2br($message);
        
        return "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
        }
        .header { 
            background: #0D47A1; 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content { 
            padding: 30px 20px; 
            font-size: 16px;
        }
        .content p {
            margin: 0 0 15px 0;
        }
        .footer { 
            text-align: center; 
            padding: 20px; 
            color: #666; 
            font-size: 12px; 
            background: #f9f9f9;
            border-top: 1px solid #e0e0e0;
        }
        .button { 
            display: inline-block; 
            background: #0D47A1; 
            color: white !important; 
            padding: 14px 28px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0;
            font-weight: 600;
            text-align: center;
        }
        .button:hover {
            background: #1565C0;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 20px 15px;
            }
        }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>ESTOCX</h1>
        </div>
        <div class='content'>
            {$formattedMessage}
        </div>
        <div class='footer'>
            <p>Este é um e-mail automático do ESTOCX. Por favor, não responda.</p>
            <p>&copy; " . date('Y') . " ESTOCX. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>";
    }
    
    /**
     * Send email using PHP mail() or SMTP
     */
    private function sendEmail($to, $subject, $body, $storeId, $emailType) {
        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=UTF-8',
            "From: {$this->fromName} <{$this->fromEmail}>",
            "Reply-To: {$this->fromEmail}"
        ];
        
        $success = mail($to, $subject, $body, implode("\r\n", $headers));
        
        // Log email
        $this->logEmail($storeId, $emailType, $to, $subject, $success);
        
        return $success;
    }
    
    /**
     * Log email to database
     */
    private function logEmail($storeId, $emailType, $recipient, $subject, $success) {
        global $db;
        
        try {
            $db->insert('subscription_emails', [
                'id' => $db->generateUuid(),
                'store_id' => $storeId,
                'email_type' => $emailType,
                'recipient_email' => $recipient,
                'subject' => $subject,
                'status' => $success ? 'sent' : 'failed',
                'sent_at' => date('Y-m-d H:i:s')
            ]);
        } catch (Exception $e) {
            error_log("Error logging email: " . $e->getMessage());
        }
    }
    
    /**
     * Get store user
     */
    private function getStoreUser($userId) {
        global $db;
        
        try {
            return $db->fetchOne("SELECT * FROM users WHERE id = :id", ['id' => $userId]);
        } catch (Exception $e) {
            return null;
        }
    }
}

