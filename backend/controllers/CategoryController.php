<?php

require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../utils/Response.php';

class CategoryController {
    private $category;

    public function __construct() {
        $this->category = new Category();
    }

    public function getAll() {
        try {
            $categories = $this->category->getAll();
            
            // Add product count to each category
            foreach ($categories as &$cat) {
                $cat['product_count'] = $this->category->getProductCount($cat['id']);
            }
            
            Response::success($categories);
        } catch (Exception $e) {
            Response::error('Failed to fetch categories', 500);
        }
    }

    public function getById($id) {
        try {
            $category = $this->category->getById($id);
            
            if (!$category) {
                Response::error('Category not found', 404);
                return;
            }
            
            $category['product_count'] = $this->category->getProductCount($id);
            Response::success($category);
        } catch (Exception $e) {
            Response::error('Failed to fetch category', 500);
        }
    }

    public function create() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['name']) || empty(trim($data['name']))) {
                Response::error('Category name is required', 400);
                return;
            }

            $name = trim($data['name']);
            $slug = isset($data['slug']) ? trim($data['slug']) : $this->generateSlug($name);
            $description = isset($data['description']) ? trim($data['description']) : null;

            // Check if slug already exists
            $existing = $this->category->getBySlug($slug);
            if ($existing) {
                Response::error('Category with this slug already exists', 400);
                return;
            }

            if ($this->category->create($name, $slug, $description)) {
                $newCategory = $this->category->getBySlug($slug);
                Response::success($newCategory, 'Category created successfully');
            } else {
                Response::error('Failed to create category', 500);
            }
        } catch (Exception $e) {
            Response::error('Failed to create category', 500);
        }
    }

    public function update($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['name']) || empty(trim($data['name']))) {
                Response::error('Category name is required', 400);
                return;
            }

            $name = trim($data['name']);
            $slug = isset($data['slug']) ? trim($data['slug']) : $this->generateSlug($name);
            $description = isset($data['description']) ? trim($data['description']) : null;

            // Check if slug already exists for another category
            $existing = $this->category->getBySlug($slug);
            if ($existing && $existing['id'] != $id) {
                Response::error('Category with this slug already exists', 400);
                return;
            }

            if ($this->category->update($id, $name, $slug, $description)) {
                $updatedCategory = $this->category->getById($id);
                Response::success($updatedCategory, 'Category updated successfully');
            } else {
                Response::error('Failed to update category', 500);
            }
        } catch (Exception $e) {
            Response::error('Failed to update category', 500);
        }
    }

    public function delete($id) {
        try {
            $category = $this->category->getById($id);
            
            if (!$category) {
                Response::error('Category not found', 404);
                return;
            }

            $productCount = $this->category->getProductCount($id);
            
            if ($productCount > 0) {
                Response::error("Cannot delete category. It contains {$productCount} products. Please reassign or delete the products first.", 400);
                return;
            }

            if ($this->category->delete($id)) {
                Response::success(null, 'Category deleted successfully');
            } else {
                Response::error('Failed to delete category', 500);
            }
        } catch (Exception $e) {
            Response::error('Failed to delete category', 500);
        }
    }

    public function search() {
        try {
            $query = isset($_GET['q']) ? trim($_GET['q']) : '';
            
            if (empty($query)) {
                Response::error('Search query is required', 400);
                return;
            }

            $categories = $this->category->search($query);
            
            // Add product count to each category
            foreach ($categories as &$cat) {
                $cat['product_count'] = $this->category->getProductCount($cat['id']);
            }
            
            Response::success($categories);
        } catch (Exception $e) {
            Response::error('Failed to search categories', 500);
        }
    }

    private function generateSlug($name) {
        // Convert Arabic and English to URL-friendly slug
        $slug = strtolower($name);
        $slug = preg_replace('/[^a-z0-9\s-اآءئؤةببتةثجحخدذرزسشصضطظعغفقكلمنهويى]/u', '', $slug);
        $slug = preg_replace('/\s+/', '-', $slug);
        $slug = trim($slug, '-');
        
        // If slug becomes empty after cleaning, use a timestamp
        if (empty($slug)) {
            $slug = 'category-' . time();
        }
        
        return $slug;
    }
}
