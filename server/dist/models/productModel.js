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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const variantOptionSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    values: [{ type: String, required: true }],
}, { _id: false });
const variantSchema = new mongoose_1.Schema({
    variantName: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    price: { type: Number, required: true, min: 0.01 },
    compareAtPrice: { type: Number, min: 0.01 },
    costPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    attributes: { type: Map, of: String },
}, { _id: false });
const productImageSchema = new mongoose_1.Schema({
    url: { type: String, required: true },
    altText: { type: String },
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
}, { _id: false });
const stockHistorySchema = new mongoose_1.Schema({
    date: { type: Date, default: Date.now },
    change: { type: Number, required: true },
    reason: { type: String },
    changedBy: { type: String },
}, { _id: false });
const productSEOSchema = new mongoose_1.Schema({
    metaTitle: { type: String, maxlength: 60 },
    metaDescription: { type: String, maxlength: 160 },
    slug: { type: String, required: true, unique: true },
    focusKeyword: { type: String },
}, { _id: false });
const productShippingSchema = new mongoose_1.Schema({
    weight: { type: Number, min: 0 },
    weightUnit: { type: String, enum: ['kg', 'g'], default: 'kg' },
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    shippingClass: { type: String },
    requiresShipping: { type: Boolean, default: true },
}, { _id: false });
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
    sku: { type: String, required: true, unique: true, uppercase: true },
    parentCategory: { type: String, enum: ['men', 'women', 'children'] },
    category: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Category', required: true },
    productType: { type: String, enum: ['simple', 'variant'], required: true, default: 'simple' },
    brand: { type: String, trim: true },
    vendor: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    shortDescription: { type: String, maxlength: 500 },
    longDescription: { type: String },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    // Pricing
    basePrice: { type: Number, required: true, min: 0.01 },
    compareAtPrice: { type: Number, min: 0.01 },
    costPrice: { type: Number, min: 0 },
    taxRate: { type: Number, default: 18, min: 0, max: 100 },
    // Variants
    variantOptions: [variantOptionSchema],
    variants: [variantSchema],
    // Inventory
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    trackInventory: { type: Boolean, default: true },
    stockHistory: [stockHistorySchema],
    // Images
    images: [productImageSchema],
    // SEO
    seo: { type: productSEOSchema, required: true },
    // Shipping
    shipping: productShippingSchema,
    // Relations
    relatedProducts: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Product' }],
    upSellProducts: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Product' }],
    crossSellProducts: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Product' }],
    // Scheduling
    scheduledActiveDate: { type: Date },
    scheduledSaleStart: { type: Date },
    scheduledSaleEnd: { type: Date },
}, { timestamps: true });
// Indexes for faster queries
productSchema.index({ name: 'text', sku: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ parentCategory: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ 'seo.slug': 1 });
productSchema.index({ createdAt: -1 });
// Virtual for stock status
productSchema.virtual('stockStatus').get(function () {
    var _a, _b;
    if (this.productType === 'variant') {
        const totalStock = ((_a = this.variants) === null || _a === void 0 ? void 0 : _a.reduce((sum, v) => sum + (v.stock || 0), 0)) || 0;
        if (totalStock === 0)
            return 'out_of_stock';
        const lowStockVariants = ((_b = this.variants) === null || _b === void 0 ? void 0 : _b.filter(v => v.stock > 0 && v.stock <= v.lowStockThreshold).length) || 0;
        if (lowStockVariants > 0)
            return 'low_stock';
        return 'in_stock';
    }
    else {
        if ((this.stock || 0) === 0)
            return 'out_of_stock';
        if ((this.stock || 0) <= (this.lowStockThreshold || 5))
            return 'low_stock';
        return 'in_stock';
    }
});
// Virtual for total stock (sum of all variants)
productSchema.virtual('totalStock').get(function () {
    var _a;
    if (this.productType === 'variant') {
        return ((_a = this.variants) === null || _a === void 0 ? void 0 : _a.reduce((sum, v) => sum + (v.stock || 0), 0)) || 0;
    }
    return this.stock || 0;
});
exports.Product = mongoose_1.default.model('Product', productSchema);
