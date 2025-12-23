import { Request } from 'express';
import mongoose from 'mongoose';
import { Product, IProduct, IVariant } from '../models/productModel';
import { Category } from '../models/categoryModel';
import { AuthenticatedRequest } from '../middleware/middleware';

// Helper function to generate category code from category name
const getCategoryCode = (categoryName: string): string => {
  // Take first 4 characters, remove spaces and special chars, convert to uppercase
  return categoryName
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 4)
    .toUpperCase()
    .padEnd(4, 'X'); // Pad to 4 chars if shorter
};

// Helper function to generate unique SKU
const generateSKU = async (parentCategory?: string, categoryId?: string): Promise<string> => {
  let sku: string;
  let isUnique = false;
  
  // Get parent category code (MEN, WOMEN, CHILDREN)
  const parentCode = parentCategory ? parentCategory.toUpperCase().substring(0, 3) : 'GEN';
  
  // Get category code
  let categoryCode = 'CAT';
  if (categoryId) {
    try {
      const category = await Category.findById(categoryId);
      if (category) {
        categoryCode = getCategoryCode(category.name);
      }
    } catch (error) {
      console.error('Error fetching category for SKU generation:', error);
    }
  }
  
  while (!isUnique) {
    // Generate exactly 6 random alphanumeric characters (uppercase)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomChars = '';
    for (let i = 0; i < 6; i++) {
      randomChars += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    sku = `PROD-${parentCode}-${categoryCode}-${randomChars}`;
    
    // Check if SKU exists
    const existing = await Product.findOne({ sku });
    if (!existing) {
      isUnique = true;
    }
  }
  
  return sku!;
};

// Helper function to generate slug from name
const generateSlug = async (name: string): Promise<string> => {
  let baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single
  
  let slug = baseSlug;
  let counter = 1;
  
  // Ensure uniqueness
  while (true) {
    const existing = await Product.findOne({ 'seo.slug': slug });
    if (!existing) {
      break;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

// Helper function to generate variant combinations
const generateVariantCombinations = (options: Array<{ name: string; values: string[] }>): Array<{ [key: string]: string }> => {
  if (options.length === 0) return [];
  
  const combinations: Array<{ [key: string]: string }> = [];
  
  const generate = (current: { [key: string]: string }, index: number) => {
    if (index === options.length) {
      combinations.push({ ...current });
      return;
    }
    
    const option = options[index];
    for (const value of option.values) {
      generate({ ...current, [option.name]: value }, index + 1);
    }
  };
  
  generate({}, 0);
  return combinations;
};

// Helper function to generate variant SKU
const generateVariantSKU = (productSKU: string, attributes: { [key: string]: string }): string => {
  const codes = Object.entries(attributes)
    .map(([key, value]) => {
      // Take first letter of key and first 2 letters of value
      const keyCode = key.charAt(0).toUpperCase();
      const valueCode = value.substring(0, 2).toUpperCase().replace(/\s/g, '');
      return `${keyCode}${valueCode}`;
    })
    .join('-');
  
  return `${productSKU}-${codes}`;
};

export class ProductService {
  // Create a new product
  public async createProduct(req: AuthenticatedRequest) {
    try {
      const data = req.body;
      
      // Validate required fields
      if (!data.name || !data.category || !data.basePrice) {
        throw new Error('Product name, category, and base price are required');
      }
      
      // Generate SKU if not provided
      let sku = data.sku;
      if (!sku) {
        sku = await generateSKU(data.parentCategory, data.category);
      } else {
        // Check if SKU already exists
        const existing = await Product.findOne({ sku: sku.toUpperCase() });
        if (existing) {
          throw new Error('SKU already exists. Please use a unique SKU.');
        }
      }
      
      // Generate slug
      const slug = await generateSlug(data.name);
      
      // Handle variants if product type is variant
      let variants: IVariant[] = [];
      if (data.productType === 'variant' && data.variantOptions && data.variantOptions.length > 0) {
        // Generate all variant combinations
        const combinations = generateVariantCombinations(data.variantOptions);
        
        // Create variant objects
        variants = combinations.map((attributes) => {
          const variantName = Object.entries(attributes)
            .map(([key, value]) => value)
            .join(' - ');
          
          const variantSKU = generateVariantSKU(sku, attributes);
          
          return {
            variantName,
            sku: variantSKU,
            price: data.basePrice, // Default to base price, can be edited
            compareAtPrice: data.compareAtPrice,
            costPrice: data.costPrice,
            stock: 0,
            lowStockThreshold: data.lowStockThreshold || 5,
            isActive: true,
            attributes,
          };
        });
      }
      
      // Prepare product data
      const productData: any = {
        name: data.name.trim(),
        sku: sku.toUpperCase(),
        parentCategory: data.parentCategory,
        category: data.category,
        productType: data.productType || 'simple',
        brand: data.brand?.trim(),
        vendor: data.vendor?.trim(),
        tags: data.tags || [],
        shortDescription: data.shortDescription?.trim(),
        longDescription: data.longDescription,
        isActive: data.isActive !== undefined ? data.isActive : true,
        isFeatured: data.isFeatured || false,
        basePrice: data.basePrice,
        compareAtPrice: data.compareAtPrice,
        costPrice: data.costPrice,
        taxRate: data.taxRate || undefined,
        variantOptions: data.variantOptions || [],
        variants: variants,
        stock: data.productType === 'simple' ? (data.stock || 0) : undefined,
        lowStockThreshold: data.lowStockThreshold || 5,
        trackInventory: data.trackInventory !== undefined ? data.trackInventory : true,
        images: data.images || [],
        seo: {
          metaTitle: data.seo?.metaTitle || `${data.name} | Store`,
          metaDescription: data.seo?.metaDescription || data.shortDescription?.substring(0, 160),
          slug: slug,
          focusKeyword: data.seo?.focusKeyword,
        },
        shipping: data.shipping,
        relatedProducts: data.relatedProducts || [],
        upSellProducts: data.upSellProducts || [],
        crossSellProducts: data.crossSellProducts || [],
        scheduledActiveDate: data.scheduledActiveDate,
        scheduledSaleStart: data.scheduledSaleStart,
        scheduledSaleEnd: data.scheduledSaleEnd,
      };
      
      // Ensure images array is properly formatted
      if (productData.images && productData.images.length > 0) {
        productData.images = productData.images.map((img: any, index: number) => ({
          url: img.url || '',
          altText: img.altText || '',
          isPrimary: img.isPrimary || (index === 0 && !productData.images.some((i: any) => i.isPrimary)),
          order: img.order !== undefined ? img.order : index,
        }));
        
        // Ensure at least one image is primary
        const hasPrimary = productData.images.some((img: any) => img.isPrimary);
        if (!hasPrimary && productData.images.length > 0) {
          productData.images[0].isPrimary = true;
        }
      } else {
        productData.images = [];
      }
      
      const product = new Product(productData);
      await product.save();
      
      return {
        product: await Product.findById(product._id).populate('category', 'name image'),
        message: 'Product created successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to create product');
    }
  }
  
  // Get all products with filters, search, sorting, pagination
  public async getAllProducts(req: Request) {
    try {
      const {
        search,
        parentCategory,
        category,
        status,
        stockStatus,
        minPrice,
        maxPrice,
        size,
        color,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 10,
      } = req.query;
      
      // Build query
      const query: any = {};
      
      // Search
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search as string, 'i')] } },
        ];
      }
      
      // Filters
      if (parentCategory) {
        query.parentCategory = parentCategory;
      }
      
      if (category) {
        query.category = category;
      }
      
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      } else if (status === 'featured') {
        query.isFeatured = true;
      }
      
      if (minPrice || maxPrice) {
        query.basePrice = {};
        if (minPrice) query.basePrice.$gte = Number(minPrice);
        if (maxPrice) query.basePrice.$lte = Number(maxPrice);
      }
      
      // Stock status filter (will be applied after fetching)
      
      // Build sort
      const sort: any = {};
      if (sortBy === 'name') {
        sort.name = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'price') {
        sort.basePrice = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'date') {
        sort.createdAt = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'stock') {
        sort.stock = sortOrder === 'asc' ? 1 : -1;
      } else {
        sort.createdAt = -1;
      }
      
      // Execute query - fetch all matching products first (before size/color filters)
      let products = await Product.find(query)
        .populate('category', 'name image')
        .sort(sort)
        .lean();
      
      // Apply size filter if specified
      if (size) {
        products = products.filter((product: any) => {
          if (product.productType === 'variant') {
            // Check if any variant has the specified size
            return product.variants?.some((v: any) => 
              v.attributes && (v.attributes.Size === size || v.attributes.size === size)
            ) || false;
          }
          // Simple products don't have size variants
          return false;
        });
      }

      // Apply color filter if specified
      if (color) {
        products = products.filter((product: any) => {
          if (product.productType === 'variant') {
            // Check if any variant has the specified color
            return product.variants?.some((v: any) => 
              v.attributes && (v.attributes.Color === color || v.attributes.color === color)
            ) || false;
          }
          // Simple products don't have color variants
          return false;
        });
      }

      // Apply stock status filter if specified
      if (stockStatus && stockStatus !== 'all') {
        products = products.filter((product: any) => {
          let status: string;
          if (product.productType === 'variant') {
            const totalStock = product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
            if (totalStock === 0) {
              status = 'out_of_stock';
            } else {
              // Check if any variant has low stock
              const lowStockThreshold = product.lowStockThreshold || 5;
              const hasLowStock = product.variants?.some((v: any) => {
                const variantStock = v.stock || 0;
                const variantThreshold = v.lowStockThreshold || lowStockThreshold;
                return variantStock > 0 && variantStock <= variantThreshold;
              });
              if (hasLowStock) {
                status = 'low_stock';
              } else {
                status = 'in_stock';
              }
            }
          } else {
            if (product.stock === 0) status = 'out_of_stock';
            else if (product.stock <= (product.lowStockThreshold || 5)) status = 'low_stock';
            else status = 'in_stock';
          }
          return status === stockStatus;
        });
      }
      
      // Add computed fields
      products = products.map((product: any) => {
        let stockStatus: string;
        let totalStock = 0;
        
        if (product.productType === 'variant') {
          totalStock = product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
          if (totalStock === 0) {
            stockStatus = 'out_of_stock';
          } else {
            // Check if any variant has low stock
            const lowStockThreshold = product.lowStockThreshold || 5;
            const hasLowStock = product.variants?.some((v: any) => {
              const variantStock = v.stock || 0;
              const variantThreshold = v.lowStockThreshold || lowStockThreshold;
              return variantStock > 0 && variantStock <= variantThreshold;
            });
            if (hasLowStock) {
              stockStatus = 'low_stock';
            } else {
              stockStatus = 'in_stock';
            }
          }
        } else {
          totalStock = product.stock || 0;
          if (totalStock === 0) {
            stockStatus = 'out_of_stock';
          } else if (totalStock <= (product.lowStockThreshold || 5)) {
            stockStatus = 'low_stock';
          } else {
            stockStatus = 'in_stock';
          }
        }
        
        return {
          ...product,
          stockStatus,
          totalStock,
        };
      });
      
      // Get total count (after applying all filters including size, color, and stockStatus)
      const total = products.length;
      
      // Apply pagination to filtered results
      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;
      const paginatedProducts = products.slice(skip, skip + limitNum);
      
      return {
        products: paginatedProducts,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        message: 'Products fetched successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to fetch products');
    }
  }
  
  // Get product by ID
  public async getProductById(req: Request) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id).populate('category', 'name image');
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      const productObj = product.toObject();
      
      // Log product data for debugging
      console.log('Fetching product:', {
        id: product._id,
        name: product.name,
        productType: product.productType,
        imagesCount: product.images?.length || 0,
        images: product.images,
        stock: product.stock,
        variantsCount: product.variants?.length || 0,
        variantsWithImages: product.variants?.filter((v: any) => v.images && v.images.length > 0).length || 0,
        variantsWithStock: product.variants?.filter((v: any) => (v.stock || 0) > 0).length || 0,
        totalVariantStock: product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0,
        sampleVariant: product.variants?.[0] ? {
          name: product.variants[0].variantName,
          stock: product.variants[0].stock,
          imagesCount: product.variants[0].images?.length || 0,
          images: product.variants[0].images,
        } : null,
      });
      
      // Add computed fields
      let stockStatus: string;
      let totalStock = 0;
      
      if (product.productType === 'variant') {
        totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
        if (totalStock === 0) {
          stockStatus = 'out_of_stock';
        } else if (product.variants?.some(v => v.stock > 0 && v.stock <= (v.lowStockThreshold || 5))) {
          stockStatus = 'low_stock';
        } else {
          stockStatus = 'in_stock';
        }
      } else {
        totalStock = product.stock || 0;
        if (totalStock === 0) {
          stockStatus = 'out_of_stock';
        } else if (totalStock <= (product.lowStockThreshold || 5)) {
          stockStatus = 'low_stock';
        } else {
          stockStatus = 'in_stock';
        }
      }
      
      // Ensure variants are properly included in the response
      const responseProduct = {
        ...productObj,
        stockStatus,
        totalStock,
        // Explicitly ensure variants are included with all their data
        variants: productObj.variants || [],
      };
      
      // Log what we're returning
      console.log('Returning product with variants:', {
        variantsCount: responseProduct.variants?.length || 0,
        variantsWithStock: responseProduct.variants?.filter((v: any) => (v.stock || 0) > 0).length || 0,
        variantsWithImages: responseProduct.variants?.filter((v: any) => v.images && v.images.length > 0).length || 0,
        totalVariantStock: responseProduct.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0,
        sampleVariant: responseProduct.variants?.[0] ? {
          name: responseProduct.variants[0].variantName,
          stock: responseProduct.variants[0].stock,
          imagesCount: responseProduct.variants[0].images?.length || 0,
        } : null,
      });
      
      return {
        product: responseProduct,
        message: 'Product fetched successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to fetch product');
    }
  }
  
  // Update product
  public async updateProduct(req: AuthenticatedRequest) {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const product = await Product.findById(id);
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Check if SKU is being changed and if it's unique
      if (data.sku && data.sku !== product.sku) {
        const existing = await Product.findOne({ sku: data.sku.toUpperCase(), _id: { $ne: id } });
        if (existing) {
          throw new Error('SKU already exists. Please use a unique SKU.');
        }
        product.sku = data.sku.toUpperCase();
      }
      
      // Update slug if name changed
      if (data.name && data.name !== product.name) {
        product.seo.slug = await generateSlug(data.name);
      }
      
      // Update other fields
      if (data.name !== undefined) product.name = data.name.trim();
      if (data.parentCategory !== undefined) product.parentCategory = data.parentCategory;
      if (data.category !== undefined) {
        // Ensure category is a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(data.category)) {
          product.category = new mongoose.Types.ObjectId(data.category);
        } else {
          throw new Error('Invalid category ID format');
        }
      }
      if (data.productType !== undefined) product.productType = data.productType;
      if (data.brand !== undefined) product.brand = data.brand?.trim();
      if (data.vendor !== undefined) product.vendor = data.vendor?.trim();
      if (data.tags !== undefined) product.tags = data.tags;
      if (data.shortDescription !== undefined) product.shortDescription = data.shortDescription?.trim();
      if (data.longDescription !== undefined) product.longDescription = data.longDescription;
      if (data.isActive !== undefined) product.isActive = data.isActive;
      if (data.isFeatured !== undefined) product.isFeatured = data.isFeatured;
      if (data.basePrice !== undefined) product.basePrice = data.basePrice;
      if (data.compareAtPrice !== undefined) product.compareAtPrice = data.compareAtPrice;
      if (data.costPrice !== undefined) product.costPrice = data.costPrice;
      if (data.taxRate !== undefined) product.taxRate = data.taxRate;
      // Handle stock - only update for simple products
      if (data.productType === 'simple') {
        if (data.stock !== undefined && data.stock !== null) {
          product.stock = Number(data.stock);
        }
        // If stock is not provided but product is simple, preserve existing stock
      } else if (data.productType === 'variant') {
        // For variant products, stock is calculated from variants
        // Don't update main stock field - it should remain as is (usually 0 or undefined)
        // Only update if explicitly set to a value
        if (data.stock !== undefined && data.stock !== null) {
          product.stock = Number(data.stock);
        }
        // Otherwise preserve existing stock value
      }
      
      if (data.lowStockThreshold !== undefined) product.lowStockThreshold = data.lowStockThreshold;
      if (data.trackInventory !== undefined) product.trackInventory = data.trackInventory;
      
      // Update images if provided as an array
      console.log('Update request images:', {
        provided: data.images !== undefined,
        isArray: Array.isArray(data.images),
        length: Array.isArray(data.images) ? data.images.length : 0,
        existingImages: product.images?.length || 0,
        productType: product.productType,
      });
      
      if (data.images !== undefined) {
        if (Array.isArray(data.images)) {
          // If array is provided
          if (data.images.length === 0) {
            // Empty array - for variant products, preserve existing images
            // For simple products, clear images (user explicitly cleared)
            if (product.productType === 'variant') {
              console.log('Variant product with empty images array - preserving existing images');
              // Don't update images - preserve existing
            } else {
              console.log('Simple product with empty images array - clearing images');
              product.images = [];
            }
          } else {
            // Ensure images array is properly formatted
            const formattedImages = data.images
              .filter((img: any) => img && img.url) // Filter out invalid images
              .map((img: any, index: number) => ({
                url: img.url || '',
                altText: img.altText || '',
                isPrimary: img.isPrimary || (index === 0 && !data.images.some((i: any) => i.isPrimary)),
                order: img.order !== undefined ? img.order : index,
              }));
            
            // Ensure at least one image is primary if images exist
            if (formattedImages.length > 0 && !formattedImages.some((img: any) => img.isPrimary)) {
              formattedImages[0].isPrimary = true;
            }
            
            product.images = formattedImages;
            console.log('Updated images:', formattedImages.length, formattedImages.map((img: any) => img.url));
          }
        } else {
          // If images is not an array but is defined, preserve existing images
          console.log('Images not an array, preserving existing:', product.images?.length || 0);
        }
      } else {
        // If images is not provided in update, preserve existing images
        console.log('Images not provided in update, preserving existing:', product.images?.length || 0);
      }
      if (data.variants !== undefined) {
        // Ensure variant images and stock are properly formatted
        const formattedVariants = data.variants.map((variant: any) => {
          const variantImages = variant.images || [];
          const formattedVariantImages = variantImages
            .filter((img: any) => img && img.url)
            .map((img: any, index: number) => ({
              url: img.url || '',
              altText: img.altText || '',
              isPrimary: img.isPrimary || (index === 0 && !variantImages.some((i: any) => i.isPrimary)),
              order: img.order !== undefined ? img.order : index,
            }));
          
          // Ensure at least one image is primary if images exist
          if (formattedVariantImages.length > 0 && !formattedVariantImages.some((img: any) => img.isPrimary)) {
            formattedVariantImages[0].isPrimary = true;
          }
          
          return {
            variantName: variant.variantName || '',
            sku: variant.sku || '',
            price: variant.price !== undefined ? Number(variant.price) : 0,
            costPrice: variant.costPrice !== undefined ? Number(variant.costPrice) : undefined,
            stock: variant.stock !== undefined && variant.stock !== null ? Number(variant.stock) : 0,
            lowStockThreshold: variant.lowStockThreshold !== undefined ? Number(variant.lowStockThreshold) : (product.lowStockThreshold || 5),
            isActive: variant.isActive !== undefined ? variant.isActive : true,
            attributes: variant.attributes || {},
            images: formattedVariantImages,
          };
        });
        
        console.log('Updating variants:', {
          count: formattedVariants.length,
          variantsWithImages: formattedVariants.filter((v: any) => v.images && v.images.length > 0).length,
          variantsWithStock: formattedVariants.filter((v: any) => (v.stock || 0) > 0).length,
          totalVariantStock: formattedVariants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0),
          sampleVariant: formattedVariants[0] ? {
            name: formattedVariants[0].variantName,
            stock: formattedVariants[0].stock,
            imagesCount: formattedVariants[0].images?.length || 0,
          } : null,
        });
        
        product.variants = formattedVariants;
      }
      if (data.variantOptions !== undefined) product.variantOptions = data.variantOptions;
      if (data.seo !== undefined) {
        if (data.seo.metaTitle !== undefined) product.seo.metaTitle = data.seo.metaTitle;
        if (data.seo.metaDescription !== undefined) product.seo.metaDescription = data.seo.metaDescription;
        if (data.seo.focusKeyword !== undefined) product.seo.focusKeyword = data.seo.focusKeyword;
      }
      if (data.shipping !== undefined) product.shipping = { ...product.shipping, ...data.shipping };
      
      // Validate before saving
      const validationError = product.validateSync();
      if (validationError) {
        const errors = Object.values(validationError.errors || {}).map((err: any) => err.message);
        throw new Error(`Validation error: ${errors.join(', ')}`);
      }
      
      await product.save();
      
      return {
        product: await Product.findById(id).populate('category', 'name image'),
        message: 'Product updated successfully',
      };
    } catch (error: any) {
      // Log detailed error for debugging
      console.error('Error updating product:', {
        error: error.message,
        stack: error.stack,
        name: error.name,
        errors: error.errors,
      });
      throw new Error(error?.message || 'Failed to update product');
    }
  }
  
  // Delete product
  public async deleteProduct(req: AuthenticatedRequest) {
    try {
      const { id } = req.params;
      
      // TODO: Check if product has orders before deleting
      // For now, just delete
      
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        throw new Error('Product not found');
      }
      
      return {
        message: 'Product deleted successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to delete product');
    }
  }
  
  // Bulk operations
  public async bulkAction(req: AuthenticatedRequest) {
    try {
      const { productIds, action, data } = req.body;
      
      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        throw new Error('Product IDs are required');
      }
      
      switch (action) {
        case 'activate':
          await Product.updateMany({ _id: { $in: productIds } }, { isActive: true });
          return { message: 'Products activated successfully' };
        
        case 'deactivate':
          await Product.updateMany({ _id: { $in: productIds } }, { isActive: false });
          return { message: 'Products deactivated successfully' };
        
        case 'delete':
          // TODO: Check for orders
          await Product.deleteMany({ _id: { $in: productIds } });
          return { message: 'Products deleted successfully' };
        
        case 'updateStock':
          if (data?.stockChange) {
            await Product.updateMany(
              { _id: { $in: productIds }, productType: 'simple' },
              { $inc: { stock: data.stockChange } }
            );
          }
          return { message: 'Stock updated successfully' };
        
        case 'applyDiscount':
          if (data?.discountPercent) {
            const products = await Product.find({ _id: { $in: productIds } });
            for (const product of products) {
              const discount = (product.basePrice * data.discountPercent) / 100;
              product.basePrice = product.basePrice - discount;
              await product.save();
            }
          }
          return { message: 'Discount applied successfully' };
        
        case 'changeCategory':
          if (data?.categoryId) {
            await Product.updateMany(
              { _id: { $in: productIds } },
              { category: data.categoryId }
            );
          }
          return { message: 'Category changed successfully' };
        
        default:
          throw new Error('Invalid bulk action');
      }
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to perform bulk action');
    }
  }
  
  // Upload image to Cloudinary
  public async uploadImage(req: AuthenticatedRequest) {
    try {
      const { image } = req.body;
      
      if (!image) {
        throw new Error('Image is required');
      }
      
      const { uploadToCloudinary } = await import('../utils/cloudinaryUtil');
      const imageUrl = await uploadToCloudinary(image);
      
      return {
        url: imageUrl,
        message: 'Image uploaded successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to upload image');
    }
  }

  // Get featured products (public endpoint)
  public async getFeaturedProducts(req: Request) {
    try {
      const { limit = 5 } = req.query;
      const limitNum = Number(limit);

      // Fetch featured and active products
      const products = await Product.find({
        isFeatured: true,
        isActive: true,
      })
        .populate('category', 'name image')
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .lean();

      // Format products with computed fields
      const formattedProducts = products.map((product: any) => {
        let stockStatus: string;
        let totalStock = 0;

        if (product.productType === 'variant') {
          totalStock = product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
          if (totalStock === 0) {
            stockStatus = 'out_of_stock';
          } else if (product.variants?.some((v: any) => v.stock > 0 && v.stock <= (v.lowStockThreshold || 5))) {
            stockStatus = 'low_stock';
          } else {
            stockStatus = 'in_stock';
          }
        } else {
          totalStock = product.stock || 0;
          if (totalStock === 0) {
            stockStatus = 'out_of_stock';
          } else if (totalStock <= (product.lowStockThreshold || 5)) {
            stockStatus = 'low_stock';
          } else {
            stockStatus = 'in_stock';
          }
        }

        return {
          ...product,
          stockStatus,
          totalStock,
        };
      });

      return {
        products: formattedProducts,
        message: 'Featured products fetched successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to fetch featured products');
    }
  }
}

