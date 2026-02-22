<?php

require_once __DIR__ . '/../utils/Response.php';

class RateLimiter {
    private static $cacheDir = __DIR__ . '/../cache/rate_limit/';

    public static function check($identifier, $maxAttempts = 60, $decayMinutes = 1) {
        // Create cache directory if it doesn't exist
        if (!is_dir(self::$cacheDir)) {
            mkdir(self::$cacheDir, 0755, true);
        }

        // Clean identifier for filename
        $safeIdentifier = md5($identifier);
        $cacheFile = self::$cacheDir . $safeIdentifier . '.json';

        $now = time();
        $data = null;

        // Read existing data
        if (file_exists($cacheFile)) {
            $content = file_get_contents($cacheFile);
            $data = json_decode($content, true);

            // Check if data is still valid
            if ($data && $data['expires'] > $now) {
                if ($data['attempts'] >= $maxAttempts) {
                    $retryAfter = $data['expires'] - $now;
                    header('Retry-After: ' . $retryAfter);
                    Response::error('Too many requests. Please try again later.', 429);
                }
                $data['attempts']++;
            } else {
                // Expired, reset
                $data = [
                    'attempts' => 1,
                    'expires' => $now + ($decayMinutes * 60)
                ];
            }
        } else {
            // First attempt
            $data = [
                'attempts' => 1,
                'expires' => $now + ($decayMinutes * 60)
            ];
        }

        // Save updated data
        file_put_contents($cacheFile, json_encode($data));

        return true;
    }

    public static function clear($identifier) {
        $safeIdentifier = md5($identifier);
        $cacheFile = self::$cacheDir . $safeIdentifier . '.json';

        if (file_exists($cacheFile)) {
            unlink($cacheFile);
        }
    }

    public static function cleanExpired() {
        if (!is_dir(self::$cacheDir)) {
            return;
        }

        $now = time();
        $files = glob(self::$cacheDir . '*.json');

        foreach ($files as $file) {
            $content = file_get_contents($file);
            $data = json_decode($content, true);

            if ($data && $data['expires'] < $now) {
                unlink($file);
            }
        }
    }
}
