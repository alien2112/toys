// src/types/review.types.ts

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}
