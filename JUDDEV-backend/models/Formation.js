const mongoose = require('mongoose');

const formationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  duration: { type: String, default: '' },
  level: { type: String, default: '' },
  price: { type: String, default: 'Sur devis' },
  description: { type: String, default: '' },
  program: [{ type: String }],
  icon: { type: String, default: '📚' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Formation', formationSchema);
