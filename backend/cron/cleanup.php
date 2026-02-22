#!/usr/bin/env php
<?php

/**
 * Cleanup Script
 * Run this via cron: 0 * * * * php /path/to/backend/cron/cleanup.php
 */

require_once __DIR__ . '/../utils/Cache.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

echo "[" . date('Y-m-d H:i:s') . "] Starting cleanup...\n";

// Clean expired cache files
try {
    Cache::cleanExpired();
    echo "[" . date('Y-m-d H:i:s') . "] Cache cleaned\n";
} catch (Exception $e) {
    echo "[" . date('Y-m-d H:i:s') . "] Cache cleanup error: " . $e->getMessage() . "\n";
}

// Clean expired rate limit files
try {
    RateLimiter::cleanExpired();
    echo "[" . date('Y-m-d H:i:s') . "] Rate limiter cleaned\n";
} catch (Exception $e) {
    echo "[" . date('Y-m-d H:i:s') . "] Rate limiter cleanup error: " . $e->getMessage() . "\n";
}

echo "[" . date('Y-m-d H:i:s') . "] Cleanup completed\n";
