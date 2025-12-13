import { CommonResponse } from "./common";

export type CategoryRequest = {
  name: string;
  image: string; // Cloudinary URL
  parentCategory?: string; // 'men' | 'women' | 'children' | null
  isActive: boolean;
};

export type Category = {
  _id: string;
  name: string;
  image: string;
  parentCategory?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export interface CategoryResponse extends CommonResponse {
  data: Category;
}

export interface CategoriesResponse extends CommonResponse {
  data: Category[];
}

