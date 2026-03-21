const mongoose = require('mongoose');

const contactInfoSchema = new mongoose.Schema({
  email: { type: String, default: 'contact@juddev.com' },
  phone: { type: String, default: '+237 6XX XXX XXX' },
  address: { type: String, default: 'Yaoundé, Cameroun' },
  hours: { type: String, default: 'Lun - Ven: 8h00 - 18h00' },
  social: {
    linkedin: { type: String, default: '#' },
    twitter: { type: String, default: '#' },
    github: { type: String, default: '#' },
    instagram: { type: String, default: '#' }
  }
}, { timestamps: true });

module.exports = mongoose.model('ContactInfo', contactInfoSchema);
