const mongoose = require('mongoose');

const realisationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, default: '' },
  service: { type: String, default: '' },
  sector: { type: String, default: '' },
  image: { type: String, default: '' },
  images: [{ type: String }],
  shortDesc: { type: String, default: '' },
  longDesc: { type: String, default: '' },
  client: { type: String, default: '' },
  year: { type: String, default: '' },
  technologies: [{ type: String }],
  url: { type: String, default: '#' },
  highlights: [{ type: String }],
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Realisation', realisationSchema);
