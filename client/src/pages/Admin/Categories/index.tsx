import React, { useState, useEffect } from 'react';
import categoryService from '../../../services/categoryService';
import { Category, CategoryRequest } from '../../../services/types/category';
import { compressImage } from '../../../utils/helperFunction';
import './Categories.css';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<CategoryRequest>({
    name: '',
    image: '',
    isActive: true,
  });
  
  const [errors, setErrors] = useState<{
    name?: string;
    image?: string;
  }>({});
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.GetAllCategories();
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      alert(error.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image: 'Please select a valid image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'Image size should be less than 5MB' });
      return;
    }

    try {
      setUploadingImage(true);
      setErrors({ ...errors, image: '' });

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          
          // Compress image
          const compressedImage = await compressImage(base64String);
          
          // Upload to Cloudinary via backend
          const uploadResponse = await categoryService.UploadImageToCloudinary(compressedImage);
          
          if (uploadResponse.data.success && uploadResponse.data.data) {
            const imageUrl = (uploadResponse.data.data as any)?.url;
            if (imageUrl) {
              setFormData({ ...formData, image: imageUrl });
              setImagePreview(imageUrl);
              setErrors({ ...errors, image: '' });
            } else {
              setErrors({ ...errors, image: 'Failed to get image URL from response' });
            }
          } else {
            setErrors({ ...errors, image: uploadResponse.data.message || 'Failed to upload image' });
          }
        } catch (error: any) {
          console.error('Error processing image:', error);
          if (error.response?.status === 401) {
            setErrors({ ...errors, image: 'Authentication failed. Please login again.' });
            // Redirect to login after a delay
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          } else {
            setErrors({ ...errors, image: error.response?.data?.message || error.message || 'Failed to process image' });
          }
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Error reading file:', error);
      setErrors({ ...errors, image: 'Failed to read image file' });
      setUploadingImage(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; image?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    // Image is only required when creating, not when editing
    if (!editingCategory && !formData.image) {
      newErrors.image = 'Category image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const payload: CategoryRequest = {
        name: formData.name.trim(),
        image: formData.image,
        isActive: formData.isActive,
      };

      const response = await categoryService.CreateCategory(payload);
      
      if (response.data.success) {
        alert('Category created successfully!');
        // Reset form
        setFormData({
          name: '',
          image: '',
          isActive: true,
        });
        setImagePreview('');
        setErrors({});
        setShowCreateForm(false);
        // Refresh categories list
        fetchCategories();
      } else {
        alert(response.data.message || 'Failed to create category');
      }
    } catch (error: any) {
      console.error('Error creating category:', error);
      alert(error.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      const response = await categoryService.UpdateCategory(category._id, {
        isActive: !category.isActive,
      });
      
      if (response.data.success) {
        fetchCategories();
      } else {
        alert(response.data.message || 'Failed to update category');
      }
    } catch (error: any) {
      console.error('Error updating category:', error);
      alert(error.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const response = await categoryService.DeleteCategory(id);
      if (response.data.success) {
        alert('Category deleted successfully!');
        fetchCategories();
      } else {
        alert(response.data.message || 'Failed to delete category');
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      image: '',
      isActive: true,
    });
    setImagePreview('');
    setErrors({});
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      image: category.image,
      isActive: category.isActive,
    });
    setImagePreview(category.image);
    setErrors({});
    setShowCreateForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCategory) return;

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const payload: Partial<CategoryRequest> = {
        name: formData.name.trim(),
        image: formData.image,
        isActive: formData.isActive,
      };

      const response = await categoryService.UpdateCategory(editingCategory._id, payload);
      
      if (response.data.success) {
        alert('Category updated successfully!');
        handleCancelForm();
        fetchCategories();
      } else {
        alert(response.data.message || 'Failed to update category');
      }
    } catch (error: any) {
      console.error('Error updating category:', error);
      alert(error.response?.data?.message || 'Failed to update category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="categories-page">
      <div className="categories-header">
        <div className="header-content">
          <div>
            <h1>Categories Management</h1>
            <p>Create and manage product categories</p>
          </div>
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="create-category-btn"
            >
              + Create Category
            </button>
          )}
        </div>
      </div>

      <div className="categories-content">
        {/* Create/Edit Category Form */}
        {showCreateForm && (
          <div className="category-form-card">
            <div className="form-header">
              <h2>{editingCategory ? 'Edit Category' : 'Create New Category'}</h2>
              <button
                onClick={handleCancelForm}
                className="close-form-btn"
                type="button"
              >
                ✕
              </button>
            </div>
            <form onSubmit={editingCategory ? handleUpdate : handleSubmit} className="category-form">
              <div className="form-group">
                <label htmlFor="name">
                  Category Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setErrors({ ...errors, name: '' });
                  }}
                  placeholder="Enter category name"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="image">
                  Category Image <span className="required">*</span>
                </label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploadingImage}
                    className="image-input"
                  />
                  <label htmlFor="image" className="image-upload-label">
                    {uploadingImage ? (
                      <span>Uploading...</span>
                    ) : imagePreview ? (
                      <span>Change Image</span>
                    ) : (
                      <span>Choose Image</span>
                    )}
                  </label>
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                </div>
                {errors.image && <span className="error-message">{errors.image}</span>}
                {!imagePreview && !errors.image && (
                  <p className="help-text">Upload an image for the category (Max 5MB)</p>
                )}
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Active Category</span>
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="submit-btn"
                >
                  {submitting 
                    ? (editingCategory ? 'Updating...' : 'Creating...') 
                    : (editingCategory ? 'Update Category' : 'Create Category')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        <div className="categories-list-card">
          <h2>All Categories</h2>
          {loading ? (
            <div className="loading-state">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="empty-state">No categories found. Create your first category above.</div>
          ) : (
            <div className="categories-table">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category._id}>
                      <td>
                        <div className="category-image-cell">
                          <img src={category.image} alt={category.name} />
                        </div>
                      </td>
                      <td>{category.name}</td>
                      <td>
                        <span
                          className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}
                        >
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(category)}
                            className="action-btn edit-btn"
                            title="Edit"
                          >
                            ✏️
                          </button>
                         
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
