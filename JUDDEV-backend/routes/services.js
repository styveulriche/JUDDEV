const express = require('express');
const Service = require('../models/Service');
const auth = require('../middleware/auth');
const { uploadImage, uploadToCloudinary } = require('../middleware/upload');

const router = express.Router();

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ order: 1, createdAt: 1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// GET /api/services/:id
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findOne({ id: req.params.id });
    if (!service) return res.status(404).json({ message: 'Service non trouvé.' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// POST /api/services
router.post('/', auth, uploadImage.single('image'), async (req, res) => {
  try {
    const { title, subtitle, icon, shortDesc, longDesc, category, order } = req.body;
    const features = req.body.features ? (Array.isArray(req.body.features) ? req.body.features : req.body.features.split('\n').filter(Boolean)) : [];
    const technologies = req.body.technologies ? (Array.isArray(req.body.technologies) ? req.body.technologies : req.body.technologies.split(',').map(t => t.trim()).filter(Boolean)) : [];

    const id = slugify(title) || `service-${Date.now()}`;
    const image = req.file ? await uploadToCloudinary(req.file, 'juddev/services') : (req.body.image || '');

    const service = new Service({ id, title, subtitle, icon, image, shortDesc, longDesc, features, technologies, category, order: order || 0 });
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Un service avec cet ID existe déjà.' });
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// PUT /api/services/:id
router.put('/:id', auth, uploadImage.single('image'), async (req, res) => {
  try {
    const { title, subtitle, icon, shortDesc, longDesc, category, order } = req.body;
    const features = req.body.features ? (Array.isArray(req.body.features) ? req.body.features : req.body.features.split('\n').filter(Boolean)) : [];
    const technologies = req.body.technologies ? (Array.isArray(req.body.technologies) ? req.body.technologies : req.body.technologies.split(',').map(t => t.trim()).filter(Boolean)) : [];

    const updateData = { title, subtitle, icon, shortDesc, longDesc, features, technologies, category, order: order || 0 };
    if (req.file) updateData.image = await uploadToCloudinary(req.file, 'juddev/services');
    else if (req.body.image) updateData.image = req.body.image;

    const service = await Service.findOneAndUpdate({ id: req.params.id }, updateData, { new: true });
    if (!service) return res.status(404).json({ message: 'Service non trouvé.' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// DELETE /api/services/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({ id: req.params.id });
    if (!service) return res.status(404).json({ message: 'Service non trouvé.' });
    res.json({ message: 'Service supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
