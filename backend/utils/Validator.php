<?php

class Validator {
    public static function email($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    public static function required($value) {
        if (is_string($value)) {
            return trim($value) !== '';
        }
        return !empty($value);
    }

    public static function numeric($value) {
        return is_numeric($value);
    }

    public static function integer($value) {
        return filter_var($value, FILTER_VALIDATE_INT) !== false;
    }

    public static function minLength($value, $min) {
        return strlen($value) >= $min;
    }

    public static function maxLength($value, $max) {
        return strlen($value) <= $max;
    }

    public static function price($value) {
        return is_numeric($value) && $value > 0;
    }

    public static function quantity($value) {
        return is_int($value) && $value > 0;
    }

    public static function inRange($value, $min, $max) {
        return $value >= $min && $value <= $max;
    }

    public static function slug($value) {
        return preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $value);
    }

    public static function url($value) {
        return filter_var($value, FILTER_VALIDATE_URL) !== false;
    }

    public static function phone($value) {
        // Basic phone validation (adjust pattern as needed)
        return preg_match('/^[\d\s\-\+\(\)]+$/', $value);
    }

    public static function strongPassword($password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        return strlen($password) >= 8 
            && preg_match('/[A-Z]/', $password)
            && preg_match('/[a-z]/', $password)
            && preg_match('/[0-9]/', $password);
    }

    public static function sanitizeString($value) {
        return htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8');
    }

    public static function sanitizeArray($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitizeArray'], $data);
        }
        return self::sanitizeString($data);
    }
}
