import React, { useState, useEffect } from 'react';
import brandService, { Brand, BrandRequest } from '../../../services/brandService';
import '../AdminPage.css';
import './Settings.css';

const AdminSettings: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<BrandRequest>({
    name: '',
    isActive: true,
  });
  
  const [errors, setErrors] = useState<{
    name?: string;
  }>({});

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await brandService.GetAllBrands();
      if (response.data.success) {
        setBrands(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching brands:', error);
      alert(error.response?.data?.message || 'Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Brand name is required';
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
      const response = await brandService.CreateBrand(formData);
      
      if (response.data.success) {
        alert('Brand created successfully!');
        // Reset form
        setFormData({
          name: '',
          isActive: true,
        });
        setErrors({});
        setShowCreateForm(false);
        // Refresh brands list
        fetchBrands();
      } else {
        alert(response.data.message || 'Failed to create brand');
      }
    } catch (error: any) {
      console.error('Error creating brand:', error);
      alert(error.response?.data?.message || 'Failed to create brand');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (brand: Brand) => {
    try {
      const response = await brandService.UpdateBrand(brand._id, {
        isActive: !brand.isActive,
      });
      
      if (response.data.success) {
        fetchBrands();
      } else {
        alert(response.data.message || 'Failed to update brand');
      }
    } catch (error: any) {
      console.error('Error updating brand:', error);
      alert(error.response?.data?.message || 'Failed to update brand');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) {
      return;
    }

    try {
      const response = await brandService.DeleteBrand(id);
      if (response.data.success) {
        alert('Brand deleted successfully!');
        fetchBrands();
      } else {
        alert(response.data.message || 'Failed to delete brand');
      }
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      alert(error.response?.data?.message || 'Failed to delete brand');
    }
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingBrand(null);
    setFormData({
      name: '',
      isActive: true,
    });
    setErrors({});
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      isActive: brand.isActive,
    });
    setErrors({});
    setShowCreateForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingBrand) return;

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await brandService.UpdateBrand(editingBrand._id, formData);
      
      if (response.data.success) {
        alert('Brand updated successfully!');
        handleCancelForm();
        fetchBrands();
      } else {
        alert(response.data.message || 'Failed to update brand');
      }
    } catch (error: any) {
      console.error('Error updating brand:', error);
      alert(error.response?.data?.message || 'Failed to update brand');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="header-content">
          <div>
            <h1>Settings</h1>
            <p>Manage system settings and configurations</p>
          </div>
        </div>
      </div>

      <div className="settings-content">
        {/* Brand Management Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Brand Management</h2>
            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="create-btn"
              >
                + Create Brand
              </button>
            )}
          </div>

          {/* Create/Edit Brand Form */}
          {showCreateForm && (
            <div className="brand-form-card">
              <div className="form-header">
                <h3>{editingBrand ? 'Edit Brand' : 'Create New Brand'}</h3>
                <button
                  onClick={handleCancelForm}
                  className="close-form-btn"
                  type="button"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={editingBrand ? handleUpdate : handleSubmit} className="brand-form">
                <div className="form-group">
                  <label htmlFor="name">
                    Brand Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setErrors({ ...errors, name: '' });
                    }}
                    placeholder="Enter brand name"
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <span>Active Brand</span>
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
                    disabled={submitting}
                    className="submit-btn"
                  >
                    {submitting 
                      ? (editingBrand ? 'Updating...' : 'Creating...') 
                      : (editingBrand ? 'Update Brand' : 'Create Brand')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Brands List */}
          <div className="brands-list-card">
            <h3>All Brands</h3>
            {loading ? (
              <div className="loading-state">Loading brands...</div>
            ) : brands.length === 0 ? (
              <div className="empty-state">No brands found. Create your first brand above.</div>
            ) : (
              <div className="brands-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands.map((brand) => (
                      <tr key={brand._id}>
                        <td>{brand.name}</td>
                        <td>
                          <span
                            className={`status-badge ${brand.isActive ? 'active' : 'inactive'}`}
                          >
                            {brand.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEdit(brand)}
                              className="action-btn edit-btn"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleToggleActive(brand)}
                              className="action-btn toggle-btn"
                              title={brand.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {brand.isActive ? '👁️' : '👁️‍🗨️'}
                            </button>
                            <button
                              onClick={() => handleDelete(brand._id)}
                              className="action-btn delete-btn"
                              title="Delete"
                            >
                              🗑️
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
    </div>
  );
};

export default AdminSettings;
