import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, Grid, List } from 'lucide-react';
import { productService } from '../../services/productService';
import { Product, ProductListFilters } from '../../services/types/product';
import { createToast, ToastContainer } from '../../components/common/Toast';
import ProductCard from '../../components/Products/ProductCard';

const ProductListing: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [toasts, setToasts] = useState<any[]>([]);

  // Filter states
  const [filters, setFilters] = useState<ProductListFilters>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    parentCategory: searchParams.get('parentCategory') || '',
    status: 'active',
    page: 1,
    limit: 12,
  });

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [openFilters, setOpenFilters] = useState({
    brand: true,
    price: true,
    size: true,
    color: true,
  });

  const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Green', value: '#008000' },
    { name: 'Yellow', value: '#FFFF00' },
    { name: 'Pink', value: '#FFC0CB' },
    { name: 'Purple', value: '#800080' },
    { name: 'Orange', value: '#FFA500' },
  ];

  // Update filters when URL params change
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    setFilters(prev => ({
      ...prev,
      category: categoryParam || '',
      search: searchParam || '',
    }));
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [filters, sortBy, priceRange, selectedBrands, selectedSizes, selectedColors]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const sortMap: Record<string, { sortBy: 'name' | 'price' | 'date' | 'stock'; sortOrder: 'asc' | 'desc' }> = {
        popular: { sortBy: 'date', sortOrder: 'desc' },
        'price-low': { sortBy: 'price', sortOrder: 'asc' },
        'price-high': { sortBy: 'price', sortOrder: 'desc' },
        newest: { sortBy: 'date', sortOrder: 'desc' },
      };

      const sortConfig = sortMap[sortBy] || sortMap.popular;
      const response = await productService.GetPublicProducts({
        ...filters,
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 300000 ? priceRange[1] : undefined,
        size: selectedSizes.length > 0 ? selectedSizes[0] : undefined,
        color: selectedColors.length > 0 ? selectedColors[0] : undefined,
      });

      if (response.data.success) {
        setProducts(response.data.data.products || []);
        setTotalProducts(response.data.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (toast: any) => {
    setToasts((prev) => [...prev, toast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleFilter = (filterName: keyof typeof openFilters) => {
    setOpenFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="text-sm text-gray-600 mb-2">
            <a href="/" className="hover:text-gray-900">Home</a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Products</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
              {totalProducts} result{totalProducts !== 1 ? 's' : ''} for products
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 border rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-600'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-600'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-4 py-2 text-sm"
              >
                <option value="popular">Sort by: Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-lg p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Filter</h2>
                <a href="#" className="text-sm text-blue-600">Advanced</a>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <button
                  onClick={() => toggleFilter('brand')}
                  className="flex items-center justify-between w-full mb-3 font-semibold"
                >
                  Brand
                  <ChevronDown className={`w-4 h-4 transition-transform ${openFilters.brand ? 'rotate-180' : ''}`} />
                </button>
                {openFilters.brand && (
                  <div>
                    <input
                      type="text"
                      placeholder="Q Search brand..."
                      className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
                    />
                    <div className="space-y-2">
                      {['Nike', 'Adidas', 'Apple', 'New Balance', 'Puma', 'Uniqlo'].map((brand) => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBrands([...selectedBrands, brand]);
                              } else {
                                setSelectedBrands(selectedBrands.filter((b) => b !== brand));
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <button
                  onClick={() => toggleFilter('price')}
                  className="flex items-center justify-between w-full mb-3 font-semibold"
                >
                  Price
                  <ChevronDown className={`w-4 h-4 transition-transform ${openFilters.price ? 'rotate-180' : ''}`} />
                </button>
                {openFilters.price && (
                  <div>
                    <div className="mb-4">
                      <input
                        type="range"
                        min="0"
                        max="300000"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-full"
                      />
                      <input
                        type="range"
                        min="0"
                        max="300000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Size Filter */}
              <div className="mb-6">
                <button
                  onClick={() => toggleFilter('size')}
                  className="flex items-center justify-between w-full mb-3 font-semibold"
                >
                  Size
                  <ChevronDown className={`w-4 h-4 transition-transform ${openFilters.size ? 'rotate-180' : ''}`} />
                </button>
                {openFilters.size && (
                  <div className="grid grid-cols-4 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          if (selectedSizes.includes(size)) {
                            setSelectedSizes(selectedSizes.filter((s) => s !== size));
                          } else {
                            setSelectedSizes([...selectedSizes, size]);
                          }
                        }}
                        className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                          selectedSizes.includes(size)
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Color Filter */}
              <div>
                <button
                  onClick={() => toggleFilter('color')}
                  className="flex items-center justify-between w-full mb-3 font-semibold"
                >
                  Color
                  <ChevronDown className={`w-4 h-4 transition-transform ${openFilters.color ? 'rotate-180' : ''}`} />
                </button>
                {openFilters.color && (
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => {
                          if (selectedColors.includes(color.name)) {
                            setSelectedColors(selectedColors.filter((c) => c !== color.name));
                          } else {
                            setSelectedColors([...selectedColors, color.name]);
                          }
                        }}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColors.includes(color.name)
                            ? 'border-gray-900 scale-110'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg animate-pulse">
                    <div className="aspect-square bg-gray-200"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onToast={showToast}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;

