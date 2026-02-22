// src/types/product.types.ts

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  rating: number;
  reviewsCount?: number;
  stock: number;
  featured?: boolean;
  specifications?: Record<string, string>;
  longDescription?: string;
}

export type SortOption = 'price-asc' | 'price-desc' | 'rating-desc' | 'name-asc';

export interface ProductFiltersState {
  searchQuery: string;
  category: string;
  sortBy: SortOption;
}
