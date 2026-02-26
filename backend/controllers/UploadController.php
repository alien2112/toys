<?php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class UploadController {
    private $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    private $maxFileSize = 5242880; // 5MB
    private $baseImagePath;
    private $baseUrl;

    public function __construct() {
        // Use configurable upload path (supports both relative and absolute paths)
        $uploadPath = getenv('UPLOAD_PATH');
        if ($uploadPath) {
            // If absolute path provided, use it directly
            $this->baseImagePath = $uploadPath;
        } else {
            // Default to relative path from document root
            $this->baseImagePath = $_SERVER['DOCUMENT_ROOT'] . '/../images/';
            // Fallback to current directory structure if DOCUMENT_ROOT not available
            if (!is_dir($this->baseImagePath)) {
                $this->baseImagePath = __DIR__ . '/../../images/';
            }
        }

        // Normalize path
        $this->baseImagePath = rtrim($this->baseImagePath, '/') . '/';

        // Set base URL for returning image URLs
        $this->baseUrl = getenv('API_BASE_URL') ?: '';

        // Create base directory if it doesn't exist
        if (!is_dir($this->baseImagePath)) {
            if (!@mkdir($this->baseImagePath, 0755, true)) {
                error_log('CRITICAL: Failed to create base upload directory: ' . $this->baseImagePath);
            }
        }

        // Check if writable
        if (!is_writable($this->baseImagePath)) {
            error_log('WARNING: Upload directory is not writable: ' . $this->baseImagePath);
        }
    }

    public function uploadProductImage() {
        return $this->uploadImage('products');
    }

    public function uploadBannerImage() {
        return $this->uploadImage('banners');
    }

    public function uploadCategoryImage() {
        return $this->uploadImage('categories');
    }

    public function uploadUserImage() {
        return $this->uploadImage('users');
    }

    public function uploadLogoImage() {
        // Require admin authentication
        $user = AuthMiddleware::requireAdmin();

        // Validate file upload
        if (!isset($_FILES['image'])) {
            Response::error('No file uploaded', 400);
        }

        $file = $_FILES['image'];
        $type = $_POST['type'] ?? 'banner';

        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            Response::error('File upload error: ' . $this->getUploadErrorMessage($file['error']), 400);
        }

        // Validate file size
        if ($file['size'] > $this->maxFileSize) {
            Response::error('File size exceeds maximum allowed (5MB)', 400);
        }

        // Validate MIME type using finfo
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $this->allowedMimeTypes)) {
            Response::error('Invalid file type. Only JPG, PNG, and GIF are allowed', 400);
        }

        // Additional security: check file extension
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if (!in_array($fileExtension, $allowedExtensions)) {
            Response::error('Invalid file extension', 400);
        }

        // Create filename based on type
        $filename = $type . '-' . time();

        try {
            // Upload to banners/home directory
            $relativePath = $this->convertToWebP($file['tmp_name'], 'banners/home', $filename);

            Response::success([
                'path' => $relativePath,
                'filename' => basename($relativePath),
                'url' => '/' . $relativePath
            ], 'Banner image uploaded successfully', 201);
        } catch (Exception $e) {
            error_log('Banner upload error: ' . $e->getMessage());
            Response::error('Failed to process banner image: ' . $e->getMessage(), 500);
        }
    }

    private function uploadImage($type) {
        // Require admin authentication
        $user = AuthMiddleware::requireAdmin();

        // Validate file upload
        if (!isset($_FILES['image'])) {
            Response::error('No file uploaded', 400);
        }

        $file = $_FILES['image'];

        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            Response::error('File upload error: ' . $this->getUploadErrorMessage($file['error']), 400);
        }

        // Validate file size
        if ($file['size'] > $this->maxFileSize) {
            Response::error('File size exceeds maximum allowed (5MB)', 400);
        }

        // Validate MIME type using finfo
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $this->allowedMimeTypes)) {
            Response::error('Invalid file type. Only JPG, PNG, and GIF are allowed', 400);
        }

        // Additional security: check file extension
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        if (!in_array($fileExtension, $allowedExtensions)) {
            Response::error('Invalid file extension', 400);
        }

        // Get desired filename from POST data or use original filename
        $desiredName = isset($_POST['filename']) && !empty($_POST['filename']) 
            ? $_POST['filename'] 
            : pathinfo($file['name'], PATHINFO_FILENAME);

        // Sanitize filename
        $safeName = $this->sanitizeFilename($desiredName);

        if (empty($safeName)) {
            Response::error('Invalid filename', 400);
        }

        // Handle duplicates
        $finalName = $this->handleDuplicate($safeName, $type);

        try {
            // Upload and optionally convert to WebP
            $relativePath = $this->convertToWebP($file['tmp_name'], $type, $finalName);

            Response::success([
                'path' => $relativePath,
                'filename' => basename($relativePath),
                'url' => '/' . $relativePath
            ], 'Image uploaded successfully', 201);
        } catch (Exception $e) {
            error_log('Image upload error: ' . $e->getMessage());
            Response::error('Failed to process image: ' . $e->getMessage(), 500);
        }
    }

    private function sanitizeFilename($name) {
        // Remove any path traversal attempts
        $name = basename($name);
        
        // Remove special characters, keep only alphanumeric, dash, and underscore
        $name = preg_replace('/[^a-z0-9\-_]/i', '', $name);
        
        // Convert to lowercase
        $name = strtolower($name);
        
        // Remove multiple consecutive dashes
        $name = preg_replace('/-+/', '-', $name);
        
        // Trim dashes from start and end
        $name = trim($name, '-_');
        
        return $name;
    }

    private function handleDuplicate($name, $type) {
        $targetDir = $this->baseImagePath . $type . '/';
        $finalName = $name;
        $counter = 1;

        while (file_exists($targetDir . $finalName . '.webp')) {
            $finalName = $name . '-' . $counter;
            $counter++;
        }

        return $finalName;
    }

    private function convertToWebP($sourcePath, $type, $filename) {
        $targetDir = $this->baseImagePath . $type . '/';

        // Create directory if it doesn't exist (handles nested directories)
        if (!is_dir($targetDir)) {
            if (!@mkdir($targetDir, 0755, true)) {
                error_log('Failed to create directory: ' . $targetDir . ' - Error: ' . error_get_last()['message']);
                throw new Exception('Failed to create upload directory. Please check permissions or contact server administrator.');
            }
            // Verify directory was actually created
            if (!is_dir($targetDir)) {
                throw new Exception('Upload directory could not be created: ' . $targetDir);
            }
        }

        // Check if directory is writable
        if (!is_writable($targetDir)) {
            error_log('Directory not writable: ' . $targetDir . ' - Current permissions: ' . substr(sprintf('%o', fileperms($targetDir)), -4));
            throw new Exception('Upload directory is not writable. Please check permissions (need 755 or 775).');
        }

        // Get original file extension
        $imageType = exif_imagetype($sourcePath);
        $extension = '';
        
        switch ($imageType) {
            case IMAGETYPE_JPEG:
                $extension = 'jpg';
                break;
            case IMAGETYPE_PNG:
                $extension = 'png';
                break;
            case IMAGETYPE_GIF:
                $extension = 'gif';
                break;
            default:
                throw new Exception('Unsupported image type');
        }

        $destPath = $targetDir . $filename . '.' . $extension;

        // Check if GD library is available for WebP conversion
        if (function_exists('imagecreatefromjpeg') && function_exists('imagewebp')) {
            try {
                // Try to convert to WebP
                $image = null;
                switch ($imageType) {
                    case IMAGETYPE_JPEG:
                        $image = imagecreatefromjpeg($sourcePath);
                        break;
                    case IMAGETYPE_PNG:
                        $image = imagecreatefrompng($sourcePath);
                        imagealphablending($image, false);
                        imagesavealpha($image, true);
                        break;
                    case IMAGETYPE_GIF:
                        $image = imagecreatefromgif($sourcePath);
                        break;
                }

                if ($image !== false && $image !== null) {
                    $webpPath = $targetDir . $filename . '.webp';
                    if (imagewebp($image, $webpPath, 80)) {
                        imagedestroy($image);
                        chmod($webpPath, 0644);
                        return 'images/' . $type . '/' . $filename . '.webp';
                    }
                    imagedestroy($image);
                }
            } catch (Exception $e) {
                // Fall through to simple copy
            }
        }

        // Fallback: Just copy the original file
        if (!move_uploaded_file($sourcePath, $destPath)) {
            throw new Exception('Failed to save uploaded file');
        }

        chmod($destPath, 0644);
        return 'images/' . $type . '/' . $filename . '.' . $extension;
    }

    private function getUploadErrorMessage($errorCode) {
        switch ($errorCode) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                return 'File is too large';
            case UPLOAD_ERR_PARTIAL:
                return 'File was only partially uploaded';
            case UPLOAD_ERR_NO_FILE:
                return 'No file was uploaded';
            case UPLOAD_ERR_NO_TMP_DIR:
                return 'Missing temporary folder';
            case UPLOAD_ERR_CANT_WRITE:
                return 'Failed to write file to disk';
            case UPLOAD_ERR_EXTENSION:
                return 'File upload stopped by extension';
            default:
                return 'Unknown upload error';
        }
    }

    public function deleteImage() {
        $user = AuthMiddleware::requireAdmin();
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['path'])) {
            Response::error('Image path is required', 400);
        }

        $path = $data['path'];
        
        // Security: ensure path is within images directory
        $realPath = realpath($this->baseImagePath . '../' . $path);
        $baseRealPath = realpath($this->baseImagePath);
        
        if ($realPath === false || strpos($realPath, $baseRealPath) !== 0) {
            Response::error('Invalid image path', 400);
        }

        if (file_exists($realPath)) {
            if (unlink($realPath)) {
                Response::success(null, 'Image deleted successfully');
            } else {
                Response::error('Failed to delete image', 500);
            }
        } else {
            Response::error('Image not found', 404);
        }
    }
}
