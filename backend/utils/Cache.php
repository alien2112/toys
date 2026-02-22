<?php

class Cache {
    private static $cacheDir = __DIR__ . '/../cache/data/';

    private static function ensureCacheDir() {
        if (!is_dir(self::$cacheDir)) {
            mkdir(self::$cacheDir, 0755, true);
        }
    }

    public static function get($key) {
        self::ensureCacheDir();
        
        $file = self::$cacheDir . md5($key) . '.cache';

        if (!file_exists($file)) {
            return null;
        }

        $content = file_get_contents($file);
        $data = json_decode($content, true);

        if (!$data || !isset($data['expires']) || !isset($data['value'])) {
            return null;
        }

        if ($data['expires'] < time()) {
            unlink($file);
            return null;
        }

        return $data['value'];
    }

    public static function set($key, $value, $ttl = 3600) {
        self::ensureCacheDir();
        
        $file = self::$cacheDir . md5($key) . '.cache';

        $data = [
            'value' => $value,
            'expires' => time() + $ttl,
            'created' => time()
        ];

        return file_put_contents($file, json_encode($data)) !== false;
    }

    public static function delete($key) {
        self::ensureCacheDir();
        
        $file = self::$cacheDir . md5($key) . '.cache';

        if (file_exists($file)) {
            return unlink($file);
        }

        return true;
    }

    public static function clear() {
        self::ensureCacheDir();
        
        $files = glob(self::$cacheDir . '*.cache');
        
        foreach ($files as $file) {
            unlink($file);
        }

        return true;
    }

    public static function cleanExpired() {
        self::ensureCacheDir();
        
        $now = time();
        $files = glob(self::$cacheDir . '*.cache');

        foreach ($files as $file) {
            $content = file_get_contents($file);
            $data = json_decode($content, true);

            if ($data && isset($data['expires']) && $data['expires'] < $now) {
                unlink($file);
            }
        }
    }
}
