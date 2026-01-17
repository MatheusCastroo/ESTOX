<?php
/**
 * Rate Limiter
 * Prevents abuse and overload by limiting requests per IP
 */

class RateLimiter {
    private static $cacheDir = null;
    
    // Rate limits (requests per window) - More restrictive to prevent overload
    private static $publicLimits = [
        'window' => 60,        // 60 seconds
        'max_requests' => 60   // 60 requests per minute (reduced from 100)
    ];
    
    private static $authenticatedLimits = [
        'window' => 60,        // 60 seconds
        'max_requests' => 120  // 120 requests per minute (reduced from 200)
    ];
    
    private static function getCacheDir() {
        if (self::$cacheDir === null) {
            // Use sys_get_temp_dir() for cross-platform compatibility
            self::$cacheDir = sys_get_temp_dir() . '/estocx_rate_limit';
            
            // Create directory if it doesn't exist
            if (!is_dir(self::$cacheDir)) {
                @mkdir(self::$cacheDir, 0755, true);
            }
        }
        return self::$cacheDir;
    }
    
    /**
     * Get client IP address
     */
    private static function getClientIp() {
        $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                
                // Handle comma-separated IPs (from proxies)
                if (strpos($ip, ',') !== false) {
                    $ips = explode(',', $ip);
                    $ip = trim($ips[0]);
                }
                
                // Validate IP
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
    
    /**
     * Check if request should be rate limited
     * @param bool $isAuthenticated Whether the request is authenticated
     * @return array ['allowed' => bool, 'remaining' => int, 'reset' => int]
     */
    public static function check($isAuthenticated = false) {
        $ip = self::getClientIp();
        $limits = $isAuthenticated ? self::$authenticatedLimits : self::$publicLimits;
        
        $cacheFile = self::getCacheDir() . '/' . md5($ip) . '.json';
        $currentTime = time();
        
        // Read existing data
        $data = [
            'count' => 0,
            'reset_time' => $currentTime + $limits['window']
        ];
        
        if (file_exists($cacheFile)) {
            $fileData = @json_decode(@file_get_contents($cacheFile), true);
            if ($fileData && isset($fileData['count']) && isset($fileData['reset_time'])) {
                // If reset time has passed, reset counter
                if ($currentTime < $fileData['reset_time']) {
                    $data = $fileData;
                }
            }
        }
        
        // Increment count
        $data['count']++;
        $data['reset_time'] = $currentTime + $limits['window'];
        
        // Save data
        @file_put_contents($cacheFile, json_encode($data), LOCK_EX);
        
        $remaining = max(0, $limits['max_requests'] - $data['count']);
        $allowed = $data['count'] <= $limits['max_requests'];
        
        return [
            'allowed' => $allowed,
            'remaining' => $remaining,
            'reset' => $data['reset_time'],
            'limit' => $limits['max_requests']
        ];
    }
    
    /**
     * Clean old cache files (should be called periodically)
     */
    public static function cleanup() {
        $cacheDir = self::getCacheDir();
        if (!is_dir($cacheDir)) {
            return;
        }
        
        $files = glob($cacheDir . '/*.json');
        $currentTime = time();
        
        foreach ($files as $file) {
            $data = @json_decode(@file_get_contents($file), true);
            if ($data && isset($data['reset_time']) && $currentTime >= $data['reset_time']) {
                @unlink($file);
            }
        }
    }
}



