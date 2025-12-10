export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  parentId?: string | Category | null;
  priority: number;
  status: 'active' | 'inactive';
  createdBy?: string | {
    _id: string;
    name: string;
    email: string;
  };
  isActive?: boolean; // Backward compatibility
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory extends Category {
  parentCategory?: string | Category;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  parentId?: string | null;
  priority?: number;
  status?: 'active' | 'inactive';
  isActive?: boolean; // Backward compatibility
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export interface CategoryListResponse {
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

