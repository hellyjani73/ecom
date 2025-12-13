import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../../services/productService';
import { ProductRequest, VariantOption, Variant, ProductImage } from '../../../services/types/product';
import categoryService from '../../../services/categoryService';
import { compressImage } from '../../../utils/helperFunction';
import { ROUTES } from '../../../constants/routes';
import './AddEdit.css';

const AdminProductAddEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [activeTab, setActiveTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; parentCategory?: string }>>([]);

  // Form state
  const [formData, setFormData] = useState<ProductRequest>({
    name: '',
    category: '',
    productType: 'simple',
    basePrice: 0,
    taxRate: 18,
    trackInventory: true,
    stock: 0,
    lowStockThreshold: 5,
    isActive: true,
    isFeatured: false,
    tags: [],
    images: [],
    seo: {
      slug: '',
    },
    shipping: {
      requiresShipping: true,
    },
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchCategories();
    if (isEditMode && id) {
      fetchProduct();
    }
  }, [id, isEditMode]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.GetAllCategories();
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await productService.GetProductById(id);
      if (response.data.success) {
        const product = response.data.data;
        setFormData({
          name: product.name,
          sku: product.sku,
          parentCategory: product.parentCategory,
          category: typeof product.category === 'string' ? product.category : (product.category as any)?._id || '',
          productType: product.productType,
          brand: product.brand,
          vendor: product.vendor,
          tags: product.tags || [],
          shortDescription: product.shortDescription,
          longDescription: product.longDescription,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          basePrice: product.basePrice,
          compareAtPrice: product.compareAtPrice,
          costPrice: product.costPrice,
          taxRate: product.taxRate,
          stock: product.stock,
          lowStockThreshold: product.lowStockThreshold,
          trackInventory: product.trackInventory,
          images: product.images || [],
          seo: product.seo,
          shipping: product.shipping,
        });
        setVariantOptions(product.variantOptions || []);
        setVariants(product.variants || []);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to fetch product');
      navigate(ROUTES.ADMIN_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProductRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file count
    if (formData.images && formData.images.length + files.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not a valid image file`);
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Max size is 5MB`);
        continue;
      }

      try {
        setUploadingImage(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64String = reader.result as string;
            const compressedImage = await compressImage(base64String);
            const uploadResponse = await productService.UploadImageToCloudinary(compressedImage);
            
            if (uploadResponse.data.success && uploadResponse.data.data) {
              const imageUrl = (uploadResponse.data.data as any)?.url;
              if (imageUrl) {
                const newImage: ProductImage = {
                  url: imageUrl,
                  altText: '',
                  isPrimary: formData.images?.length === 0,
                  order: formData.images?.length || 0,
                };
                setFormData(prev => ({
                  ...prev,
                  images: [...(prev.images || []), newImage],
                }));
              }
            }
          } catch (error: any) {
            console.error('Error uploading image:', error);
            alert(`Failed to upload ${file.name}`);
          } finally {
            setUploadingImage(false);
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    const updatedImages = formData.images?.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    })) || [];
    setFormData(prev => ({ ...prev, images: updatedImages }));
  };

  const handleDeleteImage = (index: number) => {
    const updatedImages = formData.images?.filter((_, i) => i !== index) || [];
    // Ensure at least one primary image
    if (updatedImages.length > 0 && !updatedImages.some(img => img.isPrimary)) {
      updatedImages[0].isPrimary = true;
    }
    setFormData(prev => ({ ...prev, images: updatedImages }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || [],
    }));
  };

  const generateVariantCombinations = () => {
    if (variantOptions.length === 0) {
      alert('Please add at least one variant option');
      return;
    }

    const combinations: Array<{ [key: string]: string }> = [];
    const generate = (current: { [key: string]: string }, index: number) => {
      if (index === variantOptions.length) {
        combinations.push({ ...current });
        return;
      }
      const option = variantOptions[index];
      for (const value of option.values) {
        generate({ ...current, [option.name]: value }, index + 1);
      }
    };
    generate({}, 0);

    // Create variant objects
    const newVariants: Variant[] = combinations.map((attributes) => {
      const variantName = Object.entries(attributes)
        .map(([key, value]) => value)
        .join(' - ');
      
      const variantSKU = formData.sku 
        ? `${formData.sku}-${Object.entries(attributes)
            .map(([key, value]) => {
              const keyCode = key.charAt(0).toUpperCase();
              const valueCode = value.substring(0, 2).toUpperCase().replace(/\s/g, '');
              return `${keyCode}${valueCode}`;
            })
            .join('-')}`
        : `VAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      return {
        variantName,
        sku: variantSKU,
        price: formData.basePrice || 0,
        compareAtPrice: formData.compareAtPrice,
        costPrice: formData.costPrice,
        stock: 0,
        lowStockThreshold: formData.lowStockThreshold || 5,
        isActive: true,
        attributes,
      };
    });

    setVariants(newVariants);
  };

  const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setVariants(updatedVariants);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Product name must be at least 2 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.basePrice || formData.basePrice <= 0) {
      newErrors.basePrice = 'Price must be greater than 0';
    }

    if (formData.images && formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    if (formData.productType === 'variant' && variants.length === 0) {
      newErrors.variants = 'Please generate variants for variant products';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fix the errors in the form');
      return;
    }

    try {
      setSaving(true);
      const payload: ProductRequest = {
        ...formData,
        variants: formData.productType === 'variant' ? variants : undefined,
        variantOptions: formData.productType === 'variant' ? variantOptions : undefined,
      };

      let response;
      if (isEditMode && id) {
        response = await productService.UpdateProduct(id, payload);
      } else {
        response = await productService.CreateProduct(payload);
      }

      if (response.data.success) {
        alert(isEditMode ? 'Product updated successfully!' : 'Product created successfully!');
        navigate(ROUTES.ADMIN_PRODUCTS);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  const taxAmount = (formData.basePrice * (formData.taxRate || 0)) / 100;
  const finalPrice = formData.basePrice + taxAmount;
  const profitMargin = formData.costPrice && formData.basePrice
    ? ((formData.basePrice - formData.costPrice) / formData.basePrice) * 100
    : 0;

  return (
    <div className="product-add-edit-container">
      <div className="product-header">
        <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
        <button
          className="back-btn"
          onClick={() => navigate(ROUTES.ADMIN_PRODUCTS)}
        >
          ← Back to Products
        </button>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        {/* Tabs */}
        <div className="tabs-container">
          <button
            type="button"
            className={`tab ${activeTab === 1 ? 'active' : ''}`}
            onClick={() => setActiveTab(1)}
          >
            General
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 2 ? 'active' : ''}`}
            onClick={() => setActiveTab(2)}
          >
            Pricing
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 3 ? 'active' : ''}`}
            onClick={() => setActiveTab(3)}
          >
            Images
          </button>
          {formData.productType === 'variant' && (
            <button
              type="button"
              className={`tab ${activeTab === 4 ? 'active' : ''}`}
              onClick={() => setActiveTab(4)}
            >
              Variants
            </button>
          )}
          {formData.productType === 'simple' && (
            <button
              type="button"
              className={`tab ${activeTab === 5 ? 'active' : ''}`}
              onClick={() => setActiveTab(5)}
            >
              Inventory
            </button>
          )}
          <button
            type="button"
            className={`tab ${activeTab === 6 ? 'active' : ''}`}
            onClick={() => setActiveTab(6)}
          >
            SEO & Meta
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 7 ? 'active' : ''}`}
            onClick={() => setActiveTab(7)}
          >
            Shipping
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Tab 1: General Information */}
          {activeTab === 1 && (
            <div className="tab-panel">
              <h2>General Information</h2>
              
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  maxLength={200}
                />
                {errors.name && <span className="error">{errors.name}</span>}
                <span className="char-counter">{formData.name.length}/200</span>
              </div>

              <div className="form-group">
                <label>SKU</label>
                <input
                  type="text"
                  value={formData.sku || ''}
                  onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
                  placeholder="Auto-generated if empty"
                  readOnly={!isEditMode}
                />
                <small>Format: PROD-XXXXXX (auto-generated if not provided)</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Parent Category *</label>
                  <select
                    value={formData.parentCategory || ''}
                    onChange={(e) => {
                      handleInputChange('parentCategory', e.target.value);
                      handleInputChange('category', ''); // Reset child category
                    }}
                  >
                    <option value="">Select parent category</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="children">Children</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    disabled={!formData.parentCategory}
                  >
                    <option value="">Select category</option>
                    {categories
                      .filter(cat => !formData.parentCategory || cat.parentCategory === formData.parentCategory)
                      .map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                  </select>
                  {errors.category && <span className="error">{errors.category}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Product Type *</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      value="simple"
                      checked={formData.productType === 'simple'}
                      onChange={(e) => handleInputChange('productType', e.target.value)}
                    />
                    Simple Product
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="variant"
                      checked={formData.productType === 'variant'}
                      onChange={(e) => handleInputChange('productType', e.target.value)}
                    />
                    Product with Variants
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="Enter brand name"
                  />
                </div>

                <div className="form-group">
                  <label>Vendor/Supplier</label>
                  <input
                    type="text"
                    value={formData.vendor || ''}
                    onChange={(e) => handleInputChange('vendor', e.target.value)}
                    placeholder="Enter vendor name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tags</label>
                <div className="tags-input">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tags (press Enter)"
                  />
                  <button type="button" onClick={handleAddTag}>Add</button>
                </div>
                <div className="tags-list">
                  {formData.tags?.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Short Description</label>
                <textarea
                  value={formData.shortDescription || ''}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Brief description (shown on product cards)"
                  maxLength={500}
                  rows={3}
                />
                <span className="char-counter">{(formData.shortDescription || '').length}/500</span>
              </div>

              <div className="form-group">
                <label>Long Description</label>
                <textarea
                  value={formData.longDescription || ''}
                  onChange={(e) => handleInputChange('longDescription', e.target.value)}
                  placeholder="Detailed product description"
                  rows={8}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    />
                    Active
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                    />
                    Featured Product
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Pricing */}
          {activeTab === 2 && (
            <div className="tab-panel">
              <h2>Pricing</h2>
              
              <div className="form-group">
                <label>Base Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.basePrice}
                  onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value) || 0)}
                />
                {errors.basePrice && <span className="error">{errors.basePrice}</span>}
              </div>

              <div className="form-group">
                <label>Compare At Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.compareAtPrice || ''}
                  onChange={(e) => handleInputChange('compareAtPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Original price (for showing discount)"
                />
                {formData.compareAtPrice && formData.compareAtPrice <= formData.basePrice && (
                  <span className="error">Compare at price must be greater than base price</span>
                )}
              </div>

              <div className="form-group">
                <label>Cost Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPrice || ''}
                  onChange={(e) => handleInputChange('costPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Cost price (for profit calculation)"
                />
              </div>

              <div className="form-group">
                <label>Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.taxRate || 18}
                  onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="calculated-fields">
                <div className="calc-field">
                  <label>Tax Amount:</label>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="calc-field">
                  <label>Final Price:</label>
                  <span>₹{finalPrice.toFixed(2)}</span>
                </div>
                {formData.costPrice && (
                  <div className="calc-field">
                    <label>Profit Margin:</label>
                    <span>{profitMargin.toFixed(2)}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Images */}
          {activeTab === 3 && (
            <div className="tab-panel">
              <h2>Images & Media</h2>
              
              <div className="image-upload-section">
                <div className="upload-zone">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="image-upload" className="upload-label">
                    {uploadingImage ? (
                      <div className="uploading">Uploading...</div>
                    ) : (
                      <>
                        <div className="upload-icon">📷</div>
                        <p>Drag & drop images here or click to browse</p>
                        <small>Max 10 images, 5MB each (JPG, PNG, WebP)</small>
                      </>
                    )}
                  </label>
                </div>
                {errors.images && <span className="error">{errors.images}</span>}
              </div>

              <div className="images-grid">
                {formData.images?.map((image, index) => (
                  <div key={index} className="image-item">
                    <img src={image.url} alt={image.altText || `Product image ${index + 1}`} />
                    {image.isPrimary && <span className="primary-badge">Primary</span>}
                    <div className="image-actions">
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(index)}
                        disabled={image.isPrimary}
                        className="action-btn"
                      >
                        ⭐ Set Primary
                      </button>
                      <input
                        type="text"
                        placeholder="Alt text"
                        value={image.altText || ''}
                        onChange={(e) => {
                          const updatedImages = [...(formData.images || [])];
                          updatedImages[index].altText = e.target.value;
                          setFormData(prev => ({ ...prev, images: updatedImages }));
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(index)}
                        className="delete-btn"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Variants */}
          {activeTab === 4 && formData.productType === 'variant' && (
            <div className="tab-panel">
              <h2>Variants</h2>
              
              <div className="variant-options-section">
                <h3>Variant Options</h3>
                {variantOptions.map((option, optionIndex) => (
                  <div key={optionIndex} className="variant-option">
                    <input
                      type="text"
                      placeholder="Option name (e.g., Color)"
                      value={option.name}
                      onChange={(e) => {
                        const updated = [...variantOptions];
                        updated[optionIndex].name = e.target.value;
                        setVariantOptions(updated);
                      }}
                    />
                    <div className="option-values">
                      {option.values.map((value, valueIndex) => (
                        <div key={valueIndex} className="option-value">
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => {
                              const updated = [...variantOptions];
                              updated[optionIndex].values[valueIndex] = e.target.value;
                              setVariantOptions(updated);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...variantOptions];
                              updated[optionIndex].values.splice(valueIndex, 1);
                              setVariantOptions(updated);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...variantOptions];
                          updated[optionIndex].values.push('');
                          setVariantOptions(updated);
                        }}
                      >
                        + Add Value
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setVariantOptions(variantOptions.filter((_, i) => i !== optionIndex));
                      }}
                    >
                      Remove Option
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setVariantOptions([...variantOptions, { name: '', values: [''] }])}
                >
                  + Add Option
                </button>
                <button
                  type="button"
                  onClick={generateVariantCombinations}
                  className="generate-btn"
                >
                  Generate Variants
                </button>
              </div>

              {variants.length > 0 && (
                <div className="variants-table-section">
                  <h3>Variant Combinations ({variants.length})</h3>
                  <table className="variants-table">
                    <thead>
                      <tr>
                        <th>Variant Name</th>
                        <th>SKU</th>
                        <th>Price (₹)</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((variant, index) => (
                        <tr key={index}>
                          <td>{variant.variantName}</td>
                          <td>{variant.sku}</td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              value={variant.price}
                              onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={variant.stock}
                              onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              checked={variant.isActive}
                              onChange={(e) => handleVariantChange(index, 'isActive', e.target.checked)}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => {
                                setVariants(variants.filter((_, i) => i !== index));
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {errors.variants && <span className="error">{errors.variants}</span>}
            </div>
          )}

          {/* Tab 5: Inventory */}
          {activeTab === 5 && formData.productType === 'simple' && (
            <div className="tab-panel">
              <h2>Inventory</h2>
              
              <div className="form-group">
                <label>Track Inventory</label>
                <input
                  type="checkbox"
                  checked={formData.trackInventory}
                  onChange={(e) => handleInputChange('trackInventory', e.target.checked)}
                />
              </div>

              {formData.trackInventory && (
                <>
                  <div className="form-group">
                    <label>Current Stock *</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock || 0}
                      onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Low Stock Threshold</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.lowStockThreshold || 5}
                      onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value) || 5)}
                    />
                    <small>Alert when stock falls below this number</small>
                  </div>

                  <div className="stock-status-display">
                    <label>Stock Status:</label>
                    {(formData.stock || 0) === 0 ? (
                      <span className="stock-badge out-of-stock">Out of Stock</span>
                    ) : (formData.stock || 0) <= (formData.lowStockThreshold || 5) ? (
                      <span className="stock-badge low-stock">Low Stock</span>
                    ) : (
                      <span className="stock-badge in-stock">In Stock</span>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab 6: SEO */}
          {activeTab === 6 && (
            <div className="tab-panel">
              <h2>SEO & Meta</h2>
              
              <div className="form-group">
                <label>Meta Title</label>
                <input
                  type="text"
                  maxLength={60}
                  value={formData.seo?.metaTitle || ''}
                  onChange={(e) => handleInputChange('seo', { ...formData.seo, metaTitle: e.target.value })}
                  placeholder="SEO title (max 60 characters)"
                />
                <span className="char-counter">{(formData.seo?.metaTitle || '').length}/60</span>
              </div>

              <div className="form-group">
                <label>Meta Description</label>
                <textarea
                  maxLength={160}
                  value={formData.seo?.metaDescription || ''}
                  onChange={(e) => handleInputChange('seo', { ...formData.seo, metaDescription: e.target.value })}
                  placeholder="SEO description (max 160 characters)"
                  rows={3}
                />
                <span className="char-counter">{(formData.seo?.metaDescription || '').length}/160</span>
              </div>

              <div className="form-group">
                <label>URL Slug</label>
                <input
                  type="text"
                  value={formData.seo?.slug || ''}
                  onChange={(e) => handleInputChange('seo', { ...formData.seo, slug: e.target.value })}
                  placeholder="product-url-slug"
                />
                <small>Auto-generated from product name if not provided</small>
              </div>

              <div className="form-group">
                <label>Focus Keyword</label>
                <input
                  type="text"
                  value={formData.seo?.focusKeyword || ''}
                  onChange={(e) => handleInputChange('seo', { ...formData.seo, focusKeyword: e.target.value })}
                  placeholder="Main SEO keyword"
                />
              </div>
            </div>
          )}

          {/* Tab 7: Shipping */}
          {activeTab === 7 && (
            <div className="tab-panel">
              <h2>Shipping & Dimensions</h2>
              
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.shipping?.requiresShipping !== false}
                    onChange={(e) => handleInputChange('shipping', { ...formData.shipping, requiresShipping: e.target.checked })}
                  />
                  Requires Shipping
                </label>
              </div>

              {formData.shipping?.requiresShipping !== false && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Weight</label>
                      <div className="weight-input">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.shipping?.weight || ''}
                          onChange={(e) => handleInputChange('shipping', { ...formData.shipping, weight: e.target.value ? parseFloat(e.target.value) : undefined })}
                        />
                        <select
                          value={formData.shipping?.weightUnit || 'kg'}
                          onChange={(e) => handleInputChange('shipping', { ...formData.shipping, weightUnit: e.target.value as 'kg' | 'g' })}
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Length (cm)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.shipping?.length || ''}
                        onChange={(e) => handleInputChange('shipping', { ...formData.shipping, length: e.target.value ? parseFloat(e.target.value) : undefined })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Width (cm)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.shipping?.width || ''}
                        onChange={(e) => handleInputChange('shipping', { ...formData.shipping, width: e.target.value ? parseFloat(e.target.value) : undefined })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Height (cm)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.shipping?.height || ''}
                        onChange={(e) => handleInputChange('shipping', { ...formData.shipping, height: e.target.value ? parseFloat(e.target.value) : undefined })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Shipping Class</label>
                    <select
                      value={formData.shipping?.shippingClass || ''}
                      onChange={(e) => handleInputChange('shipping', { ...formData.shipping, shippingClass: e.target.value })}
                    >
                      <option value="">Select shipping class</option>
                      <option value="standard">Standard</option>
                      <option value="express">Express</option>
                      <option value="free">Free Shipping</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate(ROUTES.ADMIN_PRODUCTS)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="save-btn"
            disabled={saving}
          >
            {saving ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductAddEdit;

