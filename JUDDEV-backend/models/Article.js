const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  image: { type: String, default: '' },
  shortDesc: { type: String, default: '' },
  content: { type: String, default: '' },
  author: { type: String, default: '' },
  tags: [{ type: String }],
  sourceType: { type: String, enum: ['manual', 'pdf'], default: 'manual' },
  pdfFile: { type: String, default: '' },
  published: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);
