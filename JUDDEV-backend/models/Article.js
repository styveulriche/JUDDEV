const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, default: '' },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

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
  published: { type: Boolean, default: true },
  comments: [commentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);
