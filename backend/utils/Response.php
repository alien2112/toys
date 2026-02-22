<?php

class Response {
    public static function json($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    public static function success($data = null, $message = null, $statusCode = 200) {
        $response = ['success' => true];
        if ($message) $response['message'] = $message;
        if ($data !== null) $response['data'] = $data;
        self::json($response, $statusCode);
    }

    public static function error($message, $statusCode = 400, $errors = null) {
        $response = ['success' => false, 'message' => $message];
        if ($errors) $response['errors'] = $errors;
        self::json($response, $statusCode);
    }
}
