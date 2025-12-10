const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a category name'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    trim: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  imageUrl: {
    type: String,
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Compound index for unique category names under same parent
categorySchema.index({ name: 1, parentId: 1 }, { unique: true });

// Generate slug from name before saving
categorySchema.pre('save', async function(next) {
  if (this.isModified('name') || this.isNew) {
    let baseSlug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    
    // If has parent, prepend parent slug
    if (this.parentId) {
      const parent = await mongoose.model('Category').findById(this.parentId);
      if (parent && parent.slug) {
        this.slug = `${parent.slug}-${baseSlug}`;
      } else {
        this.slug = baseSlug;
      }
    } else {
      this.slug = baseSlug;
    }
    
    // Ensure slug is unique
    const existingCategory = await mongoose.model('Category').findOne({ 
      slug: this.slug,
      _id: { $ne: this._id }
    });
    
    if (existingCategory) {
      let counter = 1;
      let uniqueSlug = `${this.slug}-${counter}`;
      while (await mongoose.model('Category').findOne({ slug: uniqueSlug })) {
        counter++;
        uniqueSlug = `${this.slug}-${counter}`;
      }
      this.slug = uniqueSlug;
    }
  }
  next();
});

// Virtual for isActive (backward compatibility)
categorySchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

module.exports = mongoose.model('Category', categorySchema);

