const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, default: 'kg' },
  category: {
    type: String,
    enum: ['vegetables', 'fruits', 'grains', 'dairy', 'poultry', 'herbs', 'other'],
    required: true
  },
  images: [{ type: String }],
  harvestDate: { type: Date },
  isOrganic: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  averageRating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 }
}, { timestamps: true });

// Text index for search
productSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
