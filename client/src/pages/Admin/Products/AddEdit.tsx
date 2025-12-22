import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../../services/productService';
import { ProductRequest, VariantOption, Variant, ProductImage } from '../../../services/types/product';
import categoryService from '../../../services/categoryService';
import brandService from '../../../services/brandService';
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
  const [brands, setBrands] = useState<Array<{ _id: string; name: string }>>([]);
  const [showBrandInput, setShowBrandInput] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  // Form state
  const [formData, setFormData] = useState<ProductRequest>({
    name: '',
    category: '',
    productType: 'simple',
    basePrice: 0, // This will be sellingPrice
    costPrice: undefined, // This will be buyingPrice
    taxRate: undefined, // Optional
    trackInventory: true,
    stock: 0,
    lowStockThreshold: 5,
    isActive: true,
    isFeatured: false,
    images: [],
    seo: {
      slug: '',
    },
    shipping: {
      requiresShipping: true,
    },
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Helper to check if a tab has errors
  const getTabHasError = (tabNumber: number): boolean => {
    if (tabNumber === 1) {
      return !!(errors.name || errors.parentCategory || errors.category);
    } else if (tabNumber === 2) {
      return !!errors.basePrice;
    } else if (tabNumber === 3) {
      if (formData.productType === 'variant') {
        return !!errors.variants;
      } else {
        return !!errors.images;
      }
    }
    return false;
  };
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);

  // Default colors and sizes - defined as constants
  const defaultColors: string[] = ['Red', 'Blue', 'Black', 'White', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Gray', 'Brown', 'Navy'];
  const defaultSizes: string[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  
  // Preset color and size options

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    if (isEditMode && id) {
      fetchProduct();
    }
  }, [id, isEditMode]);

  // Auto-generate variants when Color and Size options change
  useEffect(() => {
    const colorOption = variantOptions.find(opt => opt.name.toLowerCase() === 'color');
    const sizeOption = variantOptions.find(opt => opt.name.toLowerCase() === 'size');
    
    // Only generate if both Color and Size have values
    if (colorOption && sizeOption && 
        colorOption.values.length > 0 && colorOption.values.every(v => v.trim()) &&
        sizeOption.values.length > 0 && sizeOption.values.every(v => v.trim())) {
      
      const combinations: Array<{ [key: string]: string }> = [];
      const generate = (current: { [key: string]: string }, options: VariantOption[], index: number) => {
        if (index === options.length) {
          combinations.push({ ...current });
          return;
        }
        const option = options[index];
        for (const value of option.values) {
          if (value.trim()) {
            generate({ ...current, [option.name]: value.trim() }, options, index + 1);
          }
        }
      };
      generate({}, [colorOption, sizeOption], 0);

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
          costPrice: formData.costPrice,
          stock: 0,
          lowStockThreshold: formData.lowStockThreshold || 5,
          isActive: true,
          attributes,
          images: [],
        };
      });

      setVariants(newVariants);
    } else {
      // Clear variants if Color or Size is empty
      setVariants([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantOptions, formData.sku, formData.basePrice, formData.costPrice, formData.lowStockThreshold]);

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

  const fetchBrands = async () => {
    try {
      const response = await brandService.GetAllBrands(true); // Only fetch active brands
      if (response.data.success) {
        setBrands(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const handleAddBrand = async () => {
    if (newBrandName.trim()) {
      try {
        const response = await brandService.CreateBrand({
          name: newBrandName.trim(),
          isActive: true,
        });
        if (response.data.success) {
          await fetchBrands(); // Refresh brands list
          handleInputChange('brand', newBrandName.trim());
          setNewBrandName('');
          setShowBrandInput(false);
        } else {
          alert(response.data.message || 'Failed to create brand');
        }
      } catch (error: any) {
        console.error('Error creating brand:', error);
        alert(error.response?.data?.message || 'Failed to create brand');
      }
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
        costPrice: formData.costPrice,
        stock: 0,
        lowStockThreshold: formData.lowStockThreshold || 5,
        isActive: true,
        attributes,
        images: [], // Initialize empty images array for color variants
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

    if (!formData.parentCategory) {
      newErrors.parentCategory = 'Parent category is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.basePrice || formData.basePrice <= 0) {
      newErrors.basePrice = 'Selling price is required and must be greater than 0';
    }

    if (formData.images && formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    if (formData.productType === 'variant' && variants.length === 0) {
      newErrors.variants = 'Please generate variants for variant products';
    }

    setErrors(newErrors);
    
    // Scroll to first error and switch to appropriate tab
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.keys(newErrors)[0];
      
      // Determine which tab contains the error
      if (firstError === 'name' || firstError === 'parentCategory' || firstError === 'category') {
        setActiveTab(1);
      } else if (firstError === 'basePrice' || firstError === 'sellingPrice') {
        setActiveTab(2);
      } else if (firstError === 'variants' && formData.productType === 'variant') {
        setActiveTab(3); // Variants tab for variant products
      } else if (firstError === 'images' && formData.productType === 'simple') {
        setActiveTab(3); // Images tab for simple products only
      }
      
      // Scroll to error after tab switch
      setTimeout(() => {
        const errorElement = document.querySelector(`[name="${firstError}"], .error, [data-error="${firstError}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndNext = () => {
    // Validate only the current tab, not the entire form
    const currentTabErrors: { [key: string]: string } = {};
    
    // Validate based on current tab
    if (activeTab === 1) {
      // General tab validation
      if (!formData.name || formData.name.trim().length < 2) {
        currentTabErrors.name = 'Product name must be at least 2 characters';
      }
      if (!formData.parentCategory) {
        currentTabErrors.parentCategory = 'Parent category is required';
      }
      if (!formData.category) {
        currentTabErrors.category = 'Category is required';
      }
    } else if (activeTab === 2) {
      // Pricing tab validation
      if (!formData.basePrice || formData.basePrice <= 0) {
        currentTabErrors.basePrice = 'Selling price is required and must be greater than 0';
      }
    } else if (activeTab === 3) {
      if (formData.productType === 'variant') {
        // Variants tab validation
        if (variants.length === 0) {
          currentTabErrors.variants = 'Please generate variants for variant products';
        }
      } else {
        // Images tab validation for simple products
        if (!formData.images || formData.images.length === 0) {
          currentTabErrors.images = 'At least one image is required';
        }
      }
    }
    
    // If there are errors in current tab, show them and don't proceed
    if (Object.keys(currentTabErrors).length > 0) {
      setErrors(currentTabErrors);
      setTimeout(() => {
        const errorElement = document.querySelector(`[name="${Object.keys(currentTabErrors)[0]}"], .error`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }
    
    // Clear errors for current tab
    setErrors({});

    // Move to next tab
    // Variant: 1=General, 2=Pricing, 3=Variants, 4=SEO, 5=Shipping (total 5)
    // Simple: 1=General, 2=Pricing, 3=Images, 4=Inventory, 5=SEO, 6=Shipping (total 6)
    const totalTabs = formData.productType === 'variant' ? 5 : 6;
    if (activeTab < totalTabs) {
      setActiveTab(activeTab + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const payload: ProductRequest = {
        ...formData,
        basePrice: formData.basePrice, // sellingPrice
        costPrice: formData.costPrice, // buyingPrice (optional)
        taxRate: formData.taxRate || undefined, // Optional
        compareAtPrice: undefined, // Remove compareAtPrice
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

  const sellingPrice = formData.basePrice || 0;
  const buyingPrice = formData.costPrice || 0;
  const taxRate = formData.taxRate || 0;
  const taxAmount = (sellingPrice * taxRate) / 100;
  const finalPrice = sellingPrice + taxAmount;
  const profitMargin = buyingPrice && sellingPrice
    ? ((sellingPrice - buyingPrice) / sellingPrice) * 100
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
            className={`tab ${activeTab === 1 ? 'active' : ''} ${getTabHasError(1) ? 'has-error' : ''}`}
            onClick={() => setActiveTab(1)}
          >
            General
            {getTabHasError(1) && <span className="error-indicator">!</span>}
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 2 ? 'active' : ''} ${getTabHasError(2) ? 'has-error' : ''}`}
            onClick={() => setActiveTab(2)}
          >
            Pricing
            {getTabHasError(2) && <span className="error-indicator">!</span>}
          </button>
          {formData.productType === 'variant' && (
            <button
              type="button"
              className={`tab ${activeTab === 3 ? 'active' : ''} ${getTabHasError(3) ? 'has-error' : ''}`}
              onClick={() => setActiveTab(3)}
            >
              Variants
              {getTabHasError(3) && <span className="error-indicator">!</span>}
            </button>
          )}
          {formData.productType === 'simple' && (
            <button
              type="button"
              className={`tab ${activeTab === 3 ? 'active' : ''} ${getTabHasError(3) ? 'has-error' : ''}`}
              onClick={() => setActiveTab(3)}
            >
              Images
              {getTabHasError(3) && <span className="error-indicator">!</span>}
            </button>
          )}
          {formData.productType === 'simple' && (
            <button
              type="button"
              className={`tab ${activeTab === 4 ? 'active' : ''}`}
              onClick={() => setActiveTab(4)}
            >
              Inventory
            </button>
          )}
          <button
            type="button"
            className={`tab ${activeTab === (formData.productType === 'variant' ? 4 : 5) ? 'active' : ''}`}
            onClick={() => setActiveTab(formData.productType === 'variant' ? 4 : 5)}
          >
            SEO & Meta
          </button>
          <button
            type="button"
            className={`tab ${activeTab === (formData.productType === 'variant' ? 5 : 6) ? 'active' : ''}`}
            onClick={() => setActiveTab(formData.productType === 'variant' ? 5 : 6)}
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
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  maxLength={200}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error">{errors.name}</span>}
                <span className="char-counter">{formData.name.length}/200</span>
              </div>

              <div className="form-group">
                <label>SKU {!isEditMode && <span className="optional">(Optional)</span>}</label>
                <input
                  type="text"
                  value={formData.sku || ''}
                  onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
                  placeholder={isEditMode ? "SKU" : "Leave empty for auto-generation"}
                  readOnly={isEditMode && !!formData.sku}
                />
                <small>Format: PROD-[PARENT]-[CATEGORY]-XXXXXX {!isEditMode && "(auto-generated if not provided)"}</small>
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
                    data-error="parentCategory"
                    className={errors.parentCategory ? 'error' : ''}
                  >
                    <option value="">Select parent category</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="children">Children</option>
                  </select>
                  {errors.parentCategory && <span className="error">{errors.parentCategory}</span>}
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    data-error="category"
                    className={errors.category ? 'error' : ''}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
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
                  {!showBrandInput ? (
                    <div className="brand-select-wrapper">
                      <select
                        value={formData.brand || ''}
                        onChange={(e) => {
                          if (e.target.value === '__add_new__') {
                            setShowBrandInput(true);
                          } else {
                            handleInputChange('brand', e.target.value);
                          }
                        }}
                      >
                        <option value="">Select brand</option>
                        {brands.map((brand) => (
                          <option key={brand._id} value={brand.name}>
                            {brand.name}
                          </option>
                        ))}
                        <option value="__add_new__">+ Add New Brand</option>
                      </select>
                    </div>
                  ) : (
                    <div className="brand-input-wrapper">
                      <input
                        type="text"
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                        placeholder="Enter new brand name"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddBrand();
                          }
                        }}
                      />
                      <div className="brand-input-actions">
                        <button
                          type="button"
                          onClick={handleAddBrand}
                          className="add-brand-btn"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowBrandInput(false);
                            setNewBrandName('');
                          }}
                          className="cancel-brand-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
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

              {/* <div className="form-group">
                <label>Long Description</label>
                <textarea
                  value={formData.longDescription || ''}
                  onChange={(e) => handleInputChange('longDescription', e.target.value)}
                  placeholder="Detailed product description"
                  rows={8}
                />
              </div> */}

              <div className="form-row checkbox-row">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    />
                    <span>Active</span>
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                    />
                    <span>Featured Product</span>
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
                <label>Selling Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.basePrice || ''}
                  onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value) || 0)}
                  className={errors.basePrice ? 'error' : ''}
                  name="basePrice"
                  placeholder="Enter selling price"
                />
                {errors.basePrice && <span className="error">{errors.basePrice}</span>}
                <small className="help-text">The price at which the product will be sold</small>
              </div>

              <div className="form-group">
                <label>Buying Price (₹) <span className="optional">(Optional)</span></label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPrice || ''}
                  onChange={(e) => handleInputChange('costPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Enter buying price"
                />
                <small className="help-text">The cost price at which you purchased the product</small>
              </div>

              <div className="form-group">
                <label>Tax Rate (%) <span className="optional">(Optional)</span></label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.taxRate || ''}
                  onChange={(e) => handleInputChange('taxRate', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Enter tax rate (e.g., 18)"
                />
                <small className="help-text">Tax percentage to be applied (optional)</small>
              </div>

              <div className="calculated-fields">
                {taxRate > 0 && (
                  <div className="calc-field">
                    <label>Tax Amount:</label>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxRate > 0 && (
                  <div className="calc-field">
                    <label>Final Price (with tax):</label>
                    <span>₹{finalPrice.toFixed(2)}</span>
                  </div>
                )}
                {buyingPrice > 0 && sellingPrice > 0 && (
                  <div className="calc-field">
                    <label>Profit Margin:</label>
                    <span>{profitMargin.toFixed(2)}%</span>
                  </div>
                )}
                {buyingPrice > 0 && sellingPrice > 0 && (
                  <div className="calc-field">
                    <label>Profit Amount:</label>
                    <span>₹{(sellingPrice - buyingPrice).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Variants (for variant products) or Images (for simple products) */}
          {activeTab === 3 && formData.productType === 'variant' && (
            <div className="tab-panel">
              <h2>Product Variants</h2>
              
              <div className="variant-options-section">
                <h3>Variant Options</h3>
                
                {/* Default Colors - Click to Add */}
                <div className="default-options-section">
                  <div className="default-option-group">
                    <label>Colors - Click to Add:</label>
                    <div className="default-options-grid">
                      {defaultColors.map((color) => {
                        const colorOption = variantOptions.find(opt => opt.name.toLowerCase() === 'color');
                        const isAdded = colorOption?.values.includes(color) || false;
                        return (
                          <button
                            key={color}
                            type="button"
                            className={`default-option-btn ${isAdded ? 'added' : ''}`}
                            onClick={() => {
                              const existingColorOption = variantOptions.find(opt => opt.name.toLowerCase() === 'color');
                              if (!existingColorOption) {
                                // Create Color option with this color
                                setVariantOptions([...variantOptions, { name: 'Color', values: [color] }]);
                              } else {
                                // Add color to existing Color option if not already there
                                if (!existingColorOption.values.includes(color)) {
                                  const updated = variantOptions.map(opt =>
                                    opt.name.toLowerCase() === 'color'
                                      ? { ...opt, values: [...opt.values, color] }
                                      : opt
                                  );
                                  setVariantOptions(updated);
                                }
                              }
                            }}
                            disabled={isAdded}
                          >
                            {color} {isAdded && '✓'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="default-option-group">
                    <label>Sizes - Click to Add:</label>
                    <div className="default-options-grid">
                      {defaultSizes.map((size) => {
                        const sizeOption = variantOptions.find(opt => opt.name.toLowerCase() === 'size');
                        const isAdded = sizeOption?.values.includes(size) || false;
                        return (
                          <button
                            key={size}
                            type="button"
                            className={`default-option-btn ${isAdded ? 'added' : ''}`}
                            onClick={() => {
                              const existingSizeOption = variantOptions.find(opt => opt.name.toLowerCase() === 'size');
                              if (!existingSizeOption) {
                                // Create Size option with this size
                                setVariantOptions([...variantOptions, { name: 'Size', values: [size] }]);
                              } else {
                                // Add size to existing Size option if not already there
                                if (!existingSizeOption.values.includes(size)) {
                                  const updated = variantOptions.map(opt =>
                                    opt.name.toLowerCase() === 'size'
                                      ? { ...opt, values: [...opt.values, size] }
                                      : opt
                                  );
                                  setVariantOptions(updated);
                                }
                              }
                            }}
                            disabled={isAdded}
                          >
                            {size} {isAdded && '✓'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

              {variants.length > 0 && (
                <div className="variants-table-section">
                  <h3>Variant Combinations ({variants.length})</h3>
                  
                  {/* Color-based Image Management */}
                  {(() => {
                    const colorOption = variantOptions.find(opt => opt.name.toLowerCase() === 'color');
                    if (!colorOption) return null;
                    
                    const colorVariants = variants.filter(v => v.attributes[colorOption.name]);
                    const uniqueColors = Array.from(new Set(colorVariants.map(v => v.attributes[colorOption.name])));
                    
                    return uniqueColors.length > 0 ? (
                      <div className="color-images-section">
                        <h4>Color Variant Images</h4>
                        <p className="section-description">Upload images for each color variant. The first image will be set as primary.</p>
                        {uniqueColors.map((color) => {
                          const colorVariantsForColor = variants.filter(v => v.attributes[colorOption.name] === color);
                          const firstVariant = colorVariantsForColor[0];
                          const variantIndex = variants.findIndex(v => v.variantName === firstVariant.variantName);
                          
                          return (
                            <div key={color} className="color-variant-group">
                              <div className="color-header">
                                <h5>{color}</h5>
                                <span className="variant-count">{colorVariantsForColor.length} variant{colorVariantsForColor.length !== 1 ? 's' : ''}</span>
                              </div>
                              <div className="color-images-grid">
                                {(variants[variantIndex]?.images || []).map((img, imgIndex) => (
                                  <div key={imgIndex} className="color-image-item">
                                    <img src={img.url} alt={img.altText || `${color} image ${imgIndex + 1}`} />
                                    {img.isPrimary && <span className="primary-badge">Primary</span>}
                                    <div className="image-actions">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...variants];
                                          updated[variantIndex].images = updated[variantIndex].images?.map((im, idx) => ({
                                            ...im,
                                            isPrimary: idx === imgIndex
                                          }));
                                          setVariants(updated);
                                        }}
                                        disabled={img.isPrimary}
                                        className="action-btn"
                                      >
                                        ⭐ Set Primary
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...variants];
                                          updated[variantIndex].images = updated[variantIndex].images?.filter((_, idx) => idx !== imgIndex);
                                          setVariants(updated);
                                        }}
                                        className="delete-btn"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <div className="upload-color-image">
                                  <label className="upload-label">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      onChange={async (e) => {
                                        const files = Array.from(e.target.files || []);
                                        if (files.length === 0) return;
                                        
                                        try {
                                          setUploadingImage(true);
                                          const uploadedImages: Array<{ url: string; altText: string; isPrimary: boolean; order: number }> = [];
                                          
                                          for (const file of files) {
                                            if (file.size > 5 * 1024 * 1024) {
                                              alert(`${file.name} is too large. Max 5MB.`);
                                              continue;
                                            }
                                            
                                            const reader = new FileReader();
                                            const base64 = await new Promise<string>((resolve) => {
                                              reader.onloadend = () => resolve(reader.result as string);
                                              reader.readAsDataURL(file);
                                            });
                                            
                                            const compressed = await compressImage(base64);
                                            const uploadResponse = await productService.UploadImageToCloudinary(compressed);
                                            
                                            if (uploadResponse.data.success && uploadResponse.data.data) {
                                              const imageUrl = (uploadResponse.data.data as any)?.url;
                                              if (imageUrl) {
                                                const currentVariant = variants[variantIndex];
                                                uploadedImages.push({
                                                  url: imageUrl,
                                                  altText: `${color} - ${file.name}`,
                                                  isPrimary: uploadedImages.length === 0 && (!currentVariant?.images || currentVariant.images.length === 0),
                                                  order: uploadedImages.length
                                                });
                                              }
                                            }
                                          }
                                          
                                          if (uploadedImages.length > 0) {
                                            const updated = [...variants];
                                            // Share images across all variants of the same color
                                            colorVariantsForColor.forEach((cv) => {
                                              const cvIndex = variants.findIndex(v => v.variantName === cv.variantName);
                                              if (cvIndex !== -1) {
                                                updated[cvIndex].images = [
                                                  ...(updated[cvIndex].images || []),
                                                  ...uploadedImages.map((img, idx) => ({
                                                    ...img,
                                                    order: (updated[cvIndex].images?.length || 0) + idx
                                                  }))
                                                ];
                                              }
                                            });
                                            setVariants(updated);
                                          }
                                        } catch (error) {
                                          console.error('Error uploading images:', error);
                                          alert('Failed to upload images');
                                        } finally {
                                          setUploadingImage(false);
                                        }
                                      }}
                                    />
                                    <div className="upload-icon">📷</div>
                                    <span>Add Images</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null;
                  })()}

                  <table className="variants-table">
                    <thead>
                      <tr>
                        <th>Variant Title</th>
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
                          <td>
                            <strong>{variant.variantName}</strong>
                            <div className="variant-attributes">
                              {Object.entries(variant.attributes).map(([key, value]) => (
                                <span key={key} className="attribute-badge">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <input
                              type="text"
                              value={variant.sku}
                              onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                              className="sku-input"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={variant.price}
                              onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)}
                              className="price-input"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              value={variant.stock}
                              onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)}
                              className="stock-input"
                            />
                          </td>
                          <td>
                            <label className="status-toggle">
                              <input
                                type="checkbox"
                                checked={variant.isActive}
                                onChange={(e) => handleVariantChange(index, 'isActive', e.target.checked)}
                              />
                              <span className={variant.isActive ? 'active' : 'inactive'}>
                                {variant.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </label>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="delete-variant-btn"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this variant?')) {
                                  setVariants(variants.filter((_, i) => i !== index));
                                }
                              }}
                            >
                              🗑️ Delete
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

          {/* Tab 3: Images (for simple products only) */}
          {activeTab === 3 && formData.productType === 'simple' && (
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


          {/* Tab 4: Inventory (for simple products) */}
          {activeTab === 4 && formData.productType === 'simple' && (
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

          {/* Tab 4: SEO & Meta (for variant) or Tab 5: SEO & Meta (for simple) */}
          {((formData.productType === 'variant' && activeTab === 4) || (formData.productType === 'simple' && activeTab === 5)) && (
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

          {/* Tab 5: Shipping (for variant) or Tab 6: Shipping (for simple) */}
          {((formData.productType === 'variant' && activeTab === 5) || (formData.productType === 'simple' && activeTab === 6)) && (
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
          {(() => {
            const totalTabs = formData.productType === 'variant' ? 5 : 6;
            const isLastTab = activeTab === totalTabs;
            return !isLastTab ? (
              <button
                type="button"
                className="save-next-btn"
                onClick={handleSaveAndNext}
              >
                Save & Next
              </button>
            ) : null;
          })()}
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

