import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../../services/productService';
import { Product } from '../../../services/types/product';
import { ROUTES } from '../../../constants/routes';
import './View.css';

const AdminProductView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await productService.GetProductById(id);
      if (response.data.success) {
        setProduct(response.data.data);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to fetch product');
      navigate(ROUTES.ADMIN_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await productService.DeleteProduct(id);
      if (response.data.success) {
        alert('Product deleted successfully');
        navigate(ROUTES.ADMIN_PRODUCTS);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete product');
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!product) {
    return <div className="error-container">Product not found</div>;
  }

  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const stockStatus = product.stockStatus || 'out_of_stock';
  const stockStatusLabels: { [key: string]: string } = {
    in_stock: 'In Stock',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
  };

  return (
    <div className="product-view-container">
      <div className="product-view-header">
        <div>
          <h1>{product.name}</h1>
          <p className="product-sku">SKU: {product.sku}</p>
        </div>
        <div className="header-actions">
          <button
            className="action-btn edit-btn"
            onClick={() => navigate(`${ROUTES.ADMIN_PRODUCTS}/${id}/edit`)}
          >
            ✏️ Edit Product
          </button>
          <button
            className="action-btn delete-btn"
            onClick={handleDelete}
          >
            🗑️ Delete
          </button>
          <button
            className="action-btn back-btn"
            onClick={() => navigate(ROUTES.ADMIN_PRODUCTS)}
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="product-view-content">
        {/* Images Section */}
        {product.images && product.images.length > 0 && (
          <div className="view-section">
            <h2>Product Images</h2>
            <div className="images-gallery">
              {product.images.map((image, index) => (
                <div key={index} className="gallery-item">
                  <img src={image.url} alt={image.altText || `Product image ${index + 1}`} />
                  {image.isPrimary && <span className="primary-badge">Primary</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Basic Info */}
        <div className="view-section">
          <h2>Basic Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Product Name:</label>
              <span>{product.name}</span>
            </div>
            <div className="info-item">
              <label>SKU:</label>
              <span>{product.sku}</span>
            </div>
            <div className="info-item">
              <label>Parent Category:</label>
              <span>{product.parentCategory ? product.parentCategory.charAt(0).toUpperCase() + product.parentCategory.slice(1) : 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Category:</label>
              <span>{(product.category as any)?.name || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Product Type:</label>
              <span>{product.productType === 'variant' ? 'Product with Variants' : 'Simple Product'}</span>
            </div>
            <div className="info-item">
              <label>Brand:</label>
              <span>{product.brand || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Vendor:</label>
              <span>{product.vendor || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span>
                <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
                {product.isFeatured && (
                  <span className="status-badge featured">Featured</span>
                )}
              </span>
            </div>
            {product.tags && product.tags.length > 0 && (
              <div className="info-item">
                <label>Tags:</label>
                <div className="tags-list">
                  {product.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="view-section">
          <h2>Pricing</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Base Price:</label>
              <span className="price">₹{product.basePrice.toFixed(2)}</span>
            </div>
            {product.compareAtPrice && (
              <div className="info-item">
                <label>Compare At Price:</label>
                <span style={{ textDecoration: 'line-through', color: '#6b7280' }}>
                  ₹{product.compareAtPrice.toFixed(2)}
                </span>
              </div>
            )}
            {product.costPrice && (
              <div className="info-item">
                <label>Cost Price:</label>
                <span>₹{product.costPrice.toFixed(2)}</span>
              </div>
            )}
            <div className="info-item">
              <label>Tax Rate:</label>
              <span>{product.taxRate}%</span>
            </div>
            <div className="info-item">
              <label>Tax Amount:</label>
              <span>₹{((product.basePrice * product.taxRate) / 100).toFixed(2)}</span>
            </div>
            <div className="info-item">
              <label>Final Price:</label>
              <span className="price">₹{(product.basePrice + (product.basePrice * product.taxRate) / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Inventory */}
        {product.productType === 'simple' && (
          <div className="view-section">
            <h2>Inventory</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Current Stock:</label>
                <span>{product.stock || 0}</span>
              </div>
              <div className="info-item">
                <label>Low Stock Threshold:</label>
                <span>{product.lowStockThreshold || 5}</span>
              </div>
              <div className="info-item">
                <label>Stock Status:</label>
                <span className={`stock-badge ${stockStatus}`}>
                  {stockStatusLabels[stockStatus]}
                </span>
              </div>
              <div className="info-item">
                <label>Track Inventory:</label>
                <span>{product.trackInventory ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Variants */}
        {product.productType === 'variant' && product.variants && product.variants.length > 0 && (
          <div className="view-section">
            <h2>Variants ({product.variants.length})</h2>
            <table className="variants-table">
              <thead>
                <tr>
                  <th>Variant Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((variant, index) => (
                  <tr key={index}>
                    <td>{variant.variantName}</td>
                    <td>{variant.sku}</td>
                    <td>₹{variant.price.toFixed(2)}</td>
                    <td>{variant.stock}</td>
                    <td>
                      <span className={`status-badge ${variant.isActive ? 'active' : 'inactive'}`}>
                        {variant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Descriptions */}
        <div className="view-section">
          <h2>Descriptions</h2>
          {product.shortDescription && (
            <div className="description-item">
              <label>Short Description:</label>
              <p>{product.shortDescription}</p>
            </div>
          )}
          {product.longDescription && (
            <div className="description-item">
              <label>Long Description:</label>
              <div dangerouslySetInnerHTML={{ __html: product.longDescription }} />
            </div>
          )}
        </div>

        {/* SEO */}
        {product.seo && (
          <div className="view-section">
            <h2>SEO & Meta</h2>
            <div className="info-grid">
              {product.seo.metaTitle && (
                <div className="info-item">
                  <label>Meta Title:</label>
                  <span>{product.seo.metaTitle}</span>
                </div>
              )}
              {product.seo.metaDescription && (
                <div className="info-item">
                  <label>Meta Description:</label>
                  <span>{product.seo.metaDescription}</span>
                </div>
              )}
              <div className="info-item">
                <label>URL Slug:</label>
                <span>{product.seo.slug}</span>
              </div>
              {product.seo.focusKeyword && (
                <div className="info-item">
                  <label>Focus Keyword:</label>
                  <span>{product.seo.focusKeyword}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="view-section">
          <h2>Timestamps</h2>
          <div className="info-grid">
            {product.createdAt && (
              <div className="info-item">
                <label>Created At:</label>
                <span>{new Date(product.createdAt).toLocaleString()}</span>
              </div>
            )}
            {product.updatedAt && (
              <div className="info-item">
                <label>Last Updated:</label>
                <span>{new Date(product.updatedAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductView;

