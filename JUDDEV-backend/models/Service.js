const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '⚙️' },
  image: { type: String, default: '' },
  shortDesc: { type: String, default: '' },
  longDesc: { type: String, default: '' },
  features: [{ type: String }],
  technologies: [{ type: String }],
  category: { type: String, default: 'web' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
