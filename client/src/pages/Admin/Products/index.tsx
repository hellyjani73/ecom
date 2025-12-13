import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../../services/productService';
import { Product, ProductListFilters } from '../../../services/types/product';
import { ROUTES } from '../../../constants/routes';
import './Products.css';

const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [filters, setFilters] = useState<ProductListFilters>({
    search: '',
    parentCategory: '',
    category: '',
    status: 'all',
    stockStatus: 'all',
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  });

  // Categories for filter dropdowns
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; parentCategory?: string }>>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters, currentPage, pageSize]);

  const fetchCategories = async () => {
    try {
      const categoryService = (await import('../../../services/categoryService')).default;
      const response = await categoryService.GetAllCategories();
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.GetAllProducts({
        ...filters,
        page: currentPage,
        limit: pageSize,
      });
      
      if (response.data.success) {
        setProducts(response.data.data.products || []);
        setTotalProducts(response.data.data.total || 0);
        setTotalPages(response.data.data.totalPages || 1);
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      alert(error.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ProductListFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page on filter change
    }));
    setCurrentPage(1);
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p._id)));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.size === 0) {
      alert('Please select at least one product');
      return;
    }

    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete ${selectedProducts.size} product(s)?`)) {
        return;
      }
    }

    try {
      const response = await productService.BulkAction({
        productIds: Array.from(selectedProducts),
        action: action as any,
        data: action === 'updateStock' ? { stockChange: 10 } : undefined,
      });

      if (response.data.success) {
        alert(response.data.message || 'Bulk action completed successfully');
        setSelectedProducts(new Set());
        fetchProducts();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to perform bulk action');
    }
  };

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const product = products.find(p => p._id === productId);
      if (!product) return;

      const response = await productService.UpdateProduct(productId, {
        ...product,
        isActive: !currentStatus,
      } as any);

      if (response.data.success) {
        fetchProducts();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update product status');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await productService.DeleteProduct(productId);
      if (response.data.success) {
        alert('Product deleted successfully');
        fetchProducts();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const getStockStatusBadge = (product: Product) => {
    const status = product.stockStatus || 'out_of_stock';
    const labels: { [key: string]: string } = {
      in_stock: 'In Stock',
      low_stock: 'Low Stock',
      out_of_stock: 'Out of Stock',
    };
    return (
      <span className={`stock-status-badge ${status}`}>
        {labels[status]}
      </span>
    );
  };

  const getFilteredCategories = () => {
    if (!filters.parentCategory) return categories;
    return categories.filter(cat => cat.parentCategory === filters.parentCategory);
  };

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>Products Management</h1>
        <button
          className="add-product-btn"
          onClick={() => navigate(`${ROUTES.ADMIN_PRODUCTS}/add`)}
        >
          <span>+</span> Add Product
        </button>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, SKU, or tags..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>Parent Category</label>
            <select
              className="filter-select"
              value={filters.parentCategory || ''}
              onChange={(e) => {
                handleFilterChange('parentCategory', e.target.value);
                handleFilterChange('category', ''); // Reset child category
              }}
            >
              <option value="">All</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="children">Children</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              className="filter-select"
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              disabled={!filters.parentCategory}
            >
              <option value="">All</option>
              {getFilteredCategories().map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              className="filter-select"
              value={filters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="featured">Featured</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Stock Status</label>
            <select
              className="filter-select"
              value={filters.stockStatus || 'all'}
              onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
            >
              <option value="all">All</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range</label>
            <div className="price-range">
              <input
                type="number"
                className="filter-input"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
              <span>-</span>
              <input
                type="number"
                className="filter-input"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              className="filter-select"
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
            >
              <option value="date-desc">Date Added (Newest)</option>
              <option value="date-asc">Date Added (Oldest)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="stock-desc">Stock (Highest to Lowest)</option>
              <option value="stock-asc">Stock (Lowest to Highest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.size > 0 && (
        <div className="bulk-actions">
          <span className="selected-count">
            {selectedProducts.size} product(s) selected
          </span>
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleBulkAction(e.target.value);
                e.target.value = '';
              }
            }}
          >
            <option value="">Bulk Actions</option>
            <option value="activate">Activate Selected</option>
            <option value="deactivate">Deactivate Selected</option>
            <option value="delete">Delete Selected</option>
          </select>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No products found</h3>
          <p>Get started by adding your first product</p>
          <button
            className="add-product-btn"
            onClick={() => navigate(`${ROUTES.ADMIN_PRODUCTS}/add`)}
          >
            + Add Product
          </button>
        </div>
      ) : (
        <>
          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === products.length && products.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="image-cell">Image</th>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Parent Category</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Status</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
                  return (
                    <tr key={product._id}>
                      <td className="checkbox-cell">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product._id)}
                          onChange={() => handleSelectProduct(product._id)}
                        />
                      </td>
                      <td className="image-cell">
                        {primaryImage ? (
                          <img
                            src={primaryImage.url}
                            alt={primaryImage.altText || product.name}
                            className="product-image"
                          />
                        ) : (
                          <div className="product-image" style={{ background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            📦
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="product-name">{product.name}</div>
                        {product.isFeatured && (
                          <span className="category-badge" style={{ background: '#fef3c7', color: '#92400e' }}>
                            Featured
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="product-sku">{product.sku}</div>
                      </td>
                      <td>
                        {product.parentCategory && (
                          <span className="category-badge">
                            {product.parentCategory.charAt(0).toUpperCase() + product.parentCategory.slice(1)}
                          </span>
                        )}
                      </td>
                      <td>
                        {(product.category as any)?.name || 'N/A'}
                      </td>
                      <td className="price-cell">
                        ₹{product.basePrice.toFixed(2)}
                        {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', textDecoration: 'line-through' }}>
                            ₹{product.compareAtPrice.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td>{getStockStatusBadge(product)}</td>
                      <td>
                        {product.productType === 'variant'
                          ? product.totalStock || 0
                          : product.stock || 0}
                      </td>
                      <td>
                        <label className="status-toggle">
                          <input
                            type="checkbox"
                            checked={product.isActive}
                            onChange={() => handleToggleStatus(product._id, product.isActive)}
                          />
                          <span className="status-toggle-slider"></span>
                        </label>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="action-btn view-btn"
                          onClick={() => navigate(`${ROUTES.ADMIN_PRODUCTS}/${product._id}/view`)}
                          title="View"
                        >
                          👁️
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => navigate(`${ROUTES.ADMIN_PRODUCTS}/${product._id}/edit`)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(product._id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <div className="pagination-info">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalProducts)} of {totalProducts} products
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
              <select
                className="page-size-select"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminProducts;
