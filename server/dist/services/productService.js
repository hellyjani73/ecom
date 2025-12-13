"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const productModel_1 = require("../models/productModel");
// Helper function to generate unique SKU
const generateSKU = () => __awaiter(void 0, void 0, void 0, function* () {
    let sku;
    let isUnique = false;
    while (!isUnique) {
        // Generate 6 random alphanumeric characters
        const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
        sku = `PROD-${randomChars}`;
        // Check if SKU exists
        const existing = yield productModel_1.Product.findOne({ sku });
        if (!existing) {
            isUnique = true;
        }
    }
    return sku;
});
// Helper function to generate slug from name
const generateSlug = (name) => __awaiter(void 0, void 0, void 0, function* () {
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
        const existing = yield productModel_1.Product.findOne({ 'seo.slug': slug });
        if (!existing) {
            break;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
});
// Helper function to generate variant combinations
const generateVariantCombinations = (options) => {
    if (options.length === 0)
        return [];
    const combinations = [];
    const generate = (current, index) => {
        if (index === options.length) {
            combinations.push(Object.assign({}, current));
            return;
        }
        const option = options[index];
        for (const value of option.values) {
            generate(Object.assign(Object.assign({}, current), { [option.name]: value }), index + 1);
        }
    };
    generate({}, 0);
    return combinations;
};
// Helper function to generate variant SKU
const generateVariantSKU = (productSKU, attributes) => {
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
class ProductService {
    // Create a new product
    createProduct(req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            try {
                const data = req.body;
                // Validate required fields
                if (!data.name || !data.category || !data.basePrice) {
                    throw new Error('Product name, category, and base price are required');
                }
                // Generate SKU if not provided
                let sku = data.sku;
                if (!sku) {
                    sku = yield generateSKU();
                }
                else {
                    // Check if SKU already exists
                    const existing = yield productModel_1.Product.findOne({ sku: sku.toUpperCase() });
                    if (existing) {
                        throw new Error('SKU already exists. Please use a unique SKU.');
                    }
                }
                // Generate slug
                const slug = yield generateSlug(data.name);
                // Handle variants if product type is variant
                let variants = [];
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
                const productData = {
                    name: data.name.trim(),
                    sku: sku.toUpperCase(),
                    parentCategory: data.parentCategory,
                    category: data.category,
                    productType: data.productType || 'simple',
                    brand: (_a = data.brand) === null || _a === void 0 ? void 0 : _a.trim(),
                    vendor: (_b = data.vendor) === null || _b === void 0 ? void 0 : _b.trim(),
                    tags: data.tags || [],
                    shortDescription: (_c = data.shortDescription) === null || _c === void 0 ? void 0 : _c.trim(),
                    longDescription: data.longDescription,
                    isActive: data.isActive !== undefined ? data.isActive : true,
                    isFeatured: data.isFeatured || false,
                    basePrice: data.basePrice,
                    compareAtPrice: data.compareAtPrice,
                    costPrice: data.costPrice,
                    taxRate: data.taxRate || 18,
                    variantOptions: data.variantOptions || [],
                    variants: variants,
                    stock: data.productType === 'simple' ? (data.stock || 0) : undefined,
                    lowStockThreshold: data.lowStockThreshold || 5,
                    trackInventory: data.trackInventory !== undefined ? data.trackInventory : true,
                    images: data.images || [],
                    seo: {
                        metaTitle: ((_d = data.seo) === null || _d === void 0 ? void 0 : _d.metaTitle) || `${data.name} | Store`,
                        metaDescription: ((_e = data.seo) === null || _e === void 0 ? void 0 : _e.metaDescription) || ((_f = data.shortDescription) === null || _f === void 0 ? void 0 : _f.substring(0, 160)),
                        slug: slug,
                        focusKeyword: (_g = data.seo) === null || _g === void 0 ? void 0 : _g.focusKeyword,
                    },
                    shipping: data.shipping,
                    relatedProducts: data.relatedProducts || [],
                    upSellProducts: data.upSellProducts || [],
                    crossSellProducts: data.crossSellProducts || [],
                    scheduledActiveDate: data.scheduledActiveDate,
                    scheduledSaleStart: data.scheduledSaleStart,
                    scheduledSaleEnd: data.scheduledSaleEnd,
                };
                // Ensure at least one image if provided
                if (productData.images.length > 0) {
                    // Set first image as primary if none is marked
                    const hasPrimary = productData.images.some((img) => img.isPrimary);
                    if (!hasPrimary) {
                        productData.images[0].isPrimary = true;
                    }
                }
                const product = new productModel_1.Product(productData);
                yield product.save();
                return {
                    product: yield productModel_1.Product.findById(product._id).populate('category', 'name image'),
                    message: 'Product created successfully',
                };
            }
            catch (error) {
                throw new Error((error === null || error === void 0 ? void 0 : error.message) || 'Failed to create product');
            }
        });
    }
    // Get all products with filters, search, sorting, pagination
    getAllProducts(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { search, parentCategory, category, status, stockStatus, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10, } = req.query;
                // Build query
                const query = {};
                // Search
                if (search) {
                    query.$or = [
                        { name: { $regex: search, $options: 'i' } },
                        { sku: { $regex: search, $options: 'i' } },
                        { tags: { $in: [new RegExp(search, 'i')] } },
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
                }
                else if (status === 'inactive') {
                    query.isActive = false;
                }
                else if (status === 'featured') {
                    query.isFeatured = true;
                }
                if (minPrice || maxPrice) {
                    query.basePrice = {};
                    if (minPrice)
                        query.basePrice.$gte = Number(minPrice);
                    if (maxPrice)
                        query.basePrice.$lte = Number(maxPrice);
                }
                // Stock status filter (will be applied after fetching)
                // Build sort
                const sort = {};
                if (sortBy === 'name') {
                    sort.name = sortOrder === 'asc' ? 1 : -1;
                }
                else if (sortBy === 'price') {
                    sort.basePrice = sortOrder === 'asc' ? 1 : -1;
                }
                else if (sortBy === 'date') {
                    sort.createdAt = sortOrder === 'asc' ? 1 : -1;
                }
                else if (sortBy === 'stock') {
                    sort.stock = sortOrder === 'asc' ? 1 : -1;
                }
                else {
                    sort.createdAt = -1;
                }
                // Pagination
                const pageNum = Number(page);
                const limitNum = Number(limit);
                const skip = (pageNum - 1) * limitNum;
                // Execute query
                let products = yield productModel_1.Product.find(query)
                    .populate('category', 'name image')
                    .sort(sort)
                    .skip(skip)
                    .limit(limitNum)
                    .lean();
                // Apply stock status filter if specified
                if (stockStatus && stockStatus !== 'all') {
                    products = products.filter((product) => {
                        var _a, _b;
                        let status;
                        if (product.productType === 'variant') {
                            const totalStock = ((_a = product.variants) === null || _a === void 0 ? void 0 : _a.reduce((sum, v) => sum + (v.stock || 0), 0)) || 0;
                            if (totalStock === 0)
                                status = 'out_of_stock';
                            else if ((_b = product.variants) === null || _b === void 0 ? void 0 : _b.some((v) => v.stock > 0 && v.stock <= (v.lowStockThreshold || 5))) {
                                status = 'low_stock';
                            }
                            else {
                                status = 'in_stock';
                            }
                        }
                        else {
                            if (product.stock === 0)
                                status = 'out_of_stock';
                            else if (product.stock <= (product.lowStockThreshold || 5))
                                status = 'low_stock';
                            else
                                status = 'in_stock';
                        }
                        return status === stockStatus;
                    });
                }
                // Add computed fields
                products = products.map((product) => {
                    var _a, _b;
                    let stockStatus;
                    let totalStock = 0;
                    if (product.productType === 'variant') {
                        totalStock = ((_a = product.variants) === null || _a === void 0 ? void 0 : _a.reduce((sum, v) => sum + (v.stock || 0), 0)) || 0;
                        if (totalStock === 0) {
                            stockStatus = 'out_of_stock';
                        }
                        else if ((_b = product.variants) === null || _b === void 0 ? void 0 : _b.some((v) => v.stock > 0 && v.stock <= (v.lowStockThreshold || 5))) {
                            stockStatus = 'low_stock';
                        }
                        else {
                            stockStatus = 'in_stock';
                        }
                    }
                    else {
                        totalStock = product.stock || 0;
                        if (totalStock === 0) {
                            stockStatus = 'out_of_stock';
                        }
                        else if (totalStock <= (product.lowStockThreshold || 5)) {
                            stockStatus = 'low_stock';
                        }
                        else {
                            stockStatus = 'in_stock';
                        }
                    }
                    return Object.assign(Object.assign({}, product), { stockStatus,
                        totalStock });
                });
                // Get total count
                const total = yield productModel_1.Product.countDocuments(query);
                return {
                    products,
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum),
                    message: 'Products fetched successfully',
                };
            }
            catch (error) {
                throw new Error((error === null || error === void 0 ? void 0 : error.message) || 'Failed to fetch products');
            }
        });
    }
    // Get product by ID
    getProductById(req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { id } = req.params;
                const product = yield productModel_1.Product.findById(id).populate('category', 'name image');
                if (!product) {
                    throw new Error('Product not found');
                }
                // Add computed fields
                let stockStatus;
                let totalStock = 0;
                if (product.productType === 'variant') {
                    totalStock = ((_a = product.variants) === null || _a === void 0 ? void 0 : _a.reduce((sum, v) => sum + (v.stock || 0), 0)) || 0;
                    if (totalStock === 0) {
                        stockStatus = 'out_of_stock';
                    }
                    else if ((_b = product.variants) === null || _b === void 0 ? void 0 : _b.some(v => v.stock > 0 && v.stock <= (v.lowStockThreshold || 5))) {
                        stockStatus = 'low_stock';
                    }
                    else {
                        stockStatus = 'in_stock';
                    }
                }
                else {
                    totalStock = product.stock || 0;
                    if (totalStock === 0) {
                        stockStatus = 'out_of_stock';
                    }
                    else if (totalStock <= (product.lowStockThreshold || 5)) {
                        stockStatus = 'low_stock';
                    }
                    else {
                        stockStatus = 'in_stock';
                    }
                }
                return {
                    product: Object.assign(Object.assign({}, product.toObject()), { stockStatus,
                        totalStock }),
                    message: 'Product fetched successfully',
                };
            }
            catch (error) {
                throw new Error((error === null || error === void 0 ? void 0 : error.message) || 'Failed to fetch product');
            }
        });
    }
    // Update product
    updateProduct(req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const { id } = req.params;
                const data = req.body;
                const product = yield productModel_1.Product.findById(id);
                if (!product) {
                    throw new Error('Product not found');
                }
                // Check if SKU is being changed and if it's unique
                if (data.sku && data.sku !== product.sku) {
                    const existing = yield productModel_1.Product.findOne({ sku: data.sku.toUpperCase(), _id: { $ne: id } });
                    if (existing) {
                        throw new Error('SKU already exists. Please use a unique SKU.');
                    }
                    product.sku = data.sku.toUpperCase();
                }
                // Update slug if name changed
                if (data.name && data.name !== product.name) {
                    product.seo.slug = yield generateSlug(data.name);
                }
                // Update other fields
                if (data.name !== undefined)
                    product.name = data.name.trim();
                if (data.parentCategory !== undefined)
                    product.parentCategory = data.parentCategory;
                if (data.category !== undefined)
                    product.category = data.category;
                if (data.productType !== undefined)
                    product.productType = data.productType;
                if (data.brand !== undefined)
                    product.brand = (_a = data.brand) === null || _a === void 0 ? void 0 : _a.trim();
                if (data.vendor !== undefined)
                    product.vendor = (_b = data.vendor) === null || _b === void 0 ? void 0 : _b.trim();
                if (data.tags !== undefined)
                    product.tags = data.tags;
                if (data.shortDescription !== undefined)
                    product.shortDescription = (_c = data.shortDescription) === null || _c === void 0 ? void 0 : _c.trim();
                if (data.longDescription !== undefined)
                    product.longDescription = data.longDescription;
                if (data.isActive !== undefined)
                    product.isActive = data.isActive;
                if (data.isFeatured !== undefined)
                    product.isFeatured = data.isFeatured;
                if (data.basePrice !== undefined)
                    product.basePrice = data.basePrice;
                if (data.compareAtPrice !== undefined)
                    product.compareAtPrice = data.compareAtPrice;
                if (data.costPrice !== undefined)
                    product.costPrice = data.costPrice;
                if (data.taxRate !== undefined)
                    product.taxRate = data.taxRate;
                if (data.stock !== undefined)
                    product.stock = data.stock;
                if (data.lowStockThreshold !== undefined)
                    product.lowStockThreshold = data.lowStockThreshold;
                if (data.trackInventory !== undefined)
                    product.trackInventory = data.trackInventory;
                if (data.images !== undefined)
                    product.images = data.images;
                if (data.variants !== undefined)
                    product.variants = data.variants;
                if (data.variantOptions !== undefined)
                    product.variantOptions = data.variantOptions;
                if (data.seo !== undefined) {
                    if (data.seo.metaTitle !== undefined)
                        product.seo.metaTitle = data.seo.metaTitle;
                    if (data.seo.metaDescription !== undefined)
                        product.seo.metaDescription = data.seo.metaDescription;
                    if (data.seo.focusKeyword !== undefined)
                        product.seo.focusKeyword = data.seo.focusKeyword;
                }
                if (data.shipping !== undefined)
                    product.shipping = Object.assign(Object.assign({}, product.shipping), data.shipping);
                yield product.save();
                return {
                    product: yield productModel_1.Product.findById(id).populate('category', 'name image'),
                    message: 'Product updated successfully',
                };
            }
            catch (error) {
                throw new Error((error === null || error === void 0 ? void 0 : error.message) || 'Failed to update product');
            }
        });
    }
    // Delete product
    deleteProduct(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // TODO: Check if product has orders before deleting
                // For now, just delete
                const product = yield productModel_1.Product.findByIdAndDelete(id);
                if (!product) {
                    throw new Error('Product not found');
                }
                return {
                    message: 'Product deleted successfully',
                };
            }
            catch (error) {
                throw new Error((error === null || error === void 0 ? void 0 : error.message) || 'Failed to delete product');
            }
        });
    }
    // Bulk operations
    bulkAction(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productIds, action, data } = req.body;
                if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
                    throw new Error('Product IDs are required');
                }
                switch (action) {
                    case 'activate':
                        yield productModel_1.Product.updateMany({ _id: { $in: productIds } }, { isActive: true });
                        return { message: 'Products activated successfully' };
                    case 'deactivate':
                        yield productModel_1.Product.updateMany({ _id: { $in: productIds } }, { isActive: false });
                        return { message: 'Products deactivated successfully' };
                    case 'delete':
                        // TODO: Check for orders
                        yield productModel_1.Product.deleteMany({ _id: { $in: productIds } });
                        return { message: 'Products deleted successfully' };
                    case 'updateStock':
                        if (data === null || data === void 0 ? void 0 : data.stockChange) {
                            yield productModel_1.Product.updateMany({ _id: { $in: productIds }, productType: 'simple' }, { $inc: { stock: data.stockChange } });
                        }
                        return { message: 'Stock updated successfully' };
                    case 'applyDiscount':
                        if (data === null || data === void 0 ? void 0 : data.discountPercent) {
                            const products = yield productModel_1.Product.find({ _id: { $in: productIds } });
                            for (const product of products) {
                                const discount = (product.basePrice * data.discountPercent) / 100;
                                product.basePrice = product.basePrice - discount;
                                yield product.save();
                            }
                        }
                        return { message: 'Discount applied successfully' };
                    case 'changeCategory':
                        if (data === null || data === void 0 ? void 0 : data.categoryId) {
                            yield productModel_1.Product.updateMany({ _id: { $in: productIds } }, { category: data.categoryId });
                        }
                        return { message: 'Category changed successfully' };
                    default:
                        throw new Error('Invalid bulk action');
                }
            }
            catch (error) {
                throw new Error((error === null || error === void 0 ? void 0 : error.message) || 'Failed to perform bulk action');
            }
        });
    }
    // Upload image to Cloudinary
    uploadImage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { image } = req.body;
                if (!image) {
                    throw new Error('Image is required');
                }
                const { uploadToCloudinary } = yield Promise.resolve().then(() => __importStar(require('../utils/cloudinaryUtil')));
                const imageUrl = yield uploadToCloudinary(image);
                return {
                    url: imageUrl,
                    message: 'Image uploaded successfully',
                };
            }
            catch (error) {
                throw new Error((error === null || error === void 0 ? void 0 : error.message) || 'Failed to upload image');
            }
        });
    }
}
exports.ProductService = ProductService;
