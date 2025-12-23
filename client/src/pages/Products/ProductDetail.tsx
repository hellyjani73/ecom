import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, ShoppingCart, Star, Minus, Plus } from 'lucide-react';
import { productService } from '../../services/productService';
import { Product, Variant } from '../../services/types/product';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { createToast, ToastContainer } from '../../components/common/Toast';
import { formatPrice } from '../../utils/formatPrice';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [toasts, setToasts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'shipping' | 'reviews'>('description');

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.GetPublicProductById(id!);
      if (response.data.success) {
        const productData = response.data.data;
        setProduct(productData);
        
        // Set default variant if product has variants
        if (productData.productType === 'variant' && productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
          const firstVariant = productData.variants[0];
          if (firstVariant.attributes) {
            setSelectedSize(firstVariant.attributes.Size || '');
            setSelectedColor(firstVariant.attributes.Color || '');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const itemToAdd = selectedVariant || {
      variantName: product.name,
      sku: product.sku,
      price: product.basePrice,
      stock: product.stock || 0,
      isActive: product.isActive,
      attributes: {},
    };

    addToCart({
      productId: product._id,
      product,
      variant: selectedVariant || undefined,
      quantity,
      selectedSize,
      selectedColor,
      price: selectedVariant?.price || product.basePrice,
    });

    showToast('Product added to cart', 'success');
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const toast = createToast(message, type);
    setToasts((prev) => [...prev, toast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };


  const getImages = () => {
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      return selectedVariant.images.map(img => img.url);
    }
    return product?.images?.map(img => img.url) || [];
  };

  const getAvailableSizes = () => {
    if (!product || product.productType !== 'variant' || !product.variants) return [];
    const sizes = new Set<string>();
    product.variants.forEach(v => {
      if (v.attributes?.Size) {
        sizes.add(v.attributes.Size);
      }
    });
    return Array.from(sizes);
  };

  const getAvailableColors = () => {
    if (!product || product.productType !== 'variant' || !product.variants) return [];
    const colors = new Set<string>();
    product.variants.forEach(v => {
      if (v.attributes?.Color) {
        colors.add(v.attributes.Color);
      }
    });
    return Array.from(colors);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    if (product && product.productType === 'variant' && product.variants) {
      const variant = product.variants.find(
        v => v.attributes?.Size === size && v.attributes?.Color === selectedColor
      ) || product.variants.find(v => v.attributes?.Size === size);
      if (variant) {
        setSelectedVariant(variant);
        if (variant.attributes?.Color) {
          setSelectedColor(variant.attributes.Color);
        }
      }
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (product && product.productType === 'variant' && product.variants) {
      const variant = product.variants.find(
        v => v.attributes?.Color === color && v.attributes?.Size === selectedSize
      ) || product.variants.find(v => v.attributes?.Color === color);
      if (variant) {
        setSelectedVariant(variant);
        if (variant.attributes?.Size) {
          setSelectedSize(variant.attributes.Size);
        }
      }
    }
  };

  const currentPrice = selectedVariant?.price || product?.basePrice || 0;
  const originalPrice = selectedVariant?.compareAtPrice || product?.compareAtPrice;
  const discount = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const stock = selectedVariant?.stock || product?.stock || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Product not found</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const images = getImages();
  const availableSizes = getAvailableSizes();
  const availableColors = getAvailableColors();

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="text-sm text-gray-600">
            <a href="/" className="hover:text-gray-900">Home</a>
            <span className="mx-2">/</span>
            <a href="/products" className="hover:text-gray-900">Product</a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div>
            <div className="relative mb-4">
              <img
                src={images[selectedImageIndex] || 'https://via.placeholder.com/600x600?text=Product'}
                alt={product.name}
                className="w-full aspect-square object-cover rounded-lg"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-gray-900' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <p className="text-sm text-gray-600 mb-2">{product.brand || 'Brand'}</p>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-600">4.8 (188 Reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-3xl font-bold text-green-600">{formatPrice(currentPrice)}</span>
                {originalPrice && originalPrice > currentPrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">{formatPrice(originalPrice)}</span>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                      {discount}% off
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Variant Selection */}
            {product.productType === 'variant' && (
              <>
                {availableColors.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Select Color</label>
                    <div className="flex gap-2">
                      {availableColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorChange(color)}
                          className={`px-4 py-2 border-2 rounded-lg font-medium transition-colors ${
                            selectedColor === color
                              ? 'border-gray-900 bg-gray-900 text-white'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {availableSizes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">Select Size</label>
                      <a href="#" className="text-sm text-blue-600">Size Guide</a>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {availableSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => handleSizeChange(size)}
                          className={`px-4 py-2 border-2 rounded-lg font-medium transition-colors ${
                            selectedSize === size
                              ? 'border-gray-900 bg-gray-900 text-white'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="border rounded-lg p-2 hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  className="border rounded-lg p-2 hover:bg-gray-50"
                  disabled={quantity >= stock}
                >
                  <Plus className="w-4 h-4" />
                </button>
                {stock > 0 && (
                  <span className="text-sm text-gray-600">{stock} available</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleAddToCart}
                className="flex-1 border-2 border-gray-900 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={() => {
                  handleAddToCart();
                  navigate('/cart');
                }}
                className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Buy Now
              </button>
            </div>

            {/* Additional Actions */}
            <div className="flex gap-4 text-sm">
              <button
                onClick={() => {
                  if (!product) return;
                  if (isInWishlist(product._id)) {
                    removeFromWishlist(product._id);
                    showToast('Product removed from wishlist', 'info');
                  } else {
                    addToWishlist({
                      productId: product._id,
                      product,
                      addedAt: new Date().toISOString(),
                    });
                    showToast('Product added to wishlist', 'success');
                  }
                }}
                className={`flex items-center gap-2 transition-colors ${
                  product && isInWishlist(product._id)
                    ? 'text-red-600 hover:text-red-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    product && isInWishlist(product._id) ? 'fill-current' : ''
                  }`}
                />
                Wishlist
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex border-b mb-6">
            {(['description', 'specifications', 'shipping', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-gray-900 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="prose max-w-none">
            {activeTab === 'description' && (
              <div>
                <p className="text-gray-700 mb-4">{product.shortDescription}</p>
                <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: product.longDescription || '' }} />
              </div>
            )}
            {activeTab === 'specifications' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">SKU:</span> {product.sku}
                  </div>
                  <div>
                    <span className="font-medium">Brand:</span> {product.brand || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Category:</span> {typeof product.category === 'object' && product.category !== null && 'name' in product.category ? (product.category as any).name : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Stock:</span> {stock} units
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'shipping' && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg mb-2">Shipping & Returns</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Free shipping on orders over SAR 200</li>
                  <li>Standard shipping: 5-7 business days</li>
                  <li>Express shipping: 2-3 business days</li>
                  <li>30-day return policy</li>
                </ul>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

