const express = require('express');
const Realisation = require('../models/Realisation');
const auth = require('../middleware/auth');
const { uploadImage, uploadToCloudinary } = require('../middleware/upload');

const router = express.Router();

async function safeUpload(file, folder) {
  if (!file) return '';
  try { return await uploadToCloudinary(file, folder); }
  catch (e) { console.error('[Cloudinary]', e.message); return ''; }
}

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/realisations
router.get('/', async (req, res) => {
  try {
    const realisations = await Realisation.find().sort({ order: 1, createdAt: -1 });
    res.json(realisations);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// GET /api/realisations/:id
router.get('/:id', async (req, res) => {
  try {
    const realisation = await Realisation.findOne({ id: req.params.id });
    if (!realisation) return res.status(404).json({ message: 'Réalisation non trouvée.' });
    res.json(realisation);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// POST /api/realisations
router.post('/', auth, uploadImage.single('image'), async (req, res) => {
  try {
    const { title, category, service, sector, shortDesc, longDesc, client, year, url, order } = req.body;
    const technologies = req.body.technologies ? (Array.isArray(req.body.technologies) ? req.body.technologies : req.body.technologies.split(',').map(t => t.trim()).filter(Boolean)) : [];
    const highlights = req.body.highlights ? (Array.isArray(req.body.highlights) ? req.body.highlights : req.body.highlights.split('\n').filter(Boolean)) : [];
    const images = req.body.images ? (Array.isArray(req.body.images) ? req.body.images : [req.body.images]) : [];

    const id = `realisation-${Date.now()}`;
    const image = req.file ? await safeUpload(req.file, 'juddev/realisations') : (req.body.image || '');
    if (image && !images.includes(image)) images.unshift(image);

    const youtubeUrl = req.body.youtubeUrl || '';
    const showSiteBtn = req.body.showSiteBtn !== 'false' && req.body.showSiteBtn !== false;
    const showYoutubeBtn = req.body.showYoutubeBtn === 'true' || req.body.showYoutubeBtn === true;
    const realisation = new Realisation({ id, title, category, service, sector, image, images, shortDesc, longDesc, client, year, technologies, url: url || '#', youtubeUrl, showSiteBtn, showYoutubeBtn, highlights, order: order || 0 });
    await realisation.save();
    res.status(201).json(realisation);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// PUT /api/realisations/:id
router.put('/:id', auth, uploadImage.single('image'), async (req, res) => {
  try {
    const { title, category, service, sector, shortDesc, longDesc, client, year, url, order } = req.body;
    const technologies = req.body.technologies ? (Array.isArray(req.body.technologies) ? req.body.technologies : req.body.technologies.split(',').map(t => t.trim()).filter(Boolean)) : [];
    const highlights = req.body.highlights ? (Array.isArray(req.body.highlights) ? req.body.highlights : req.body.highlights.split('\n').filter(Boolean)) : [];
    const youtubeUrl = req.body.youtubeUrl || '';
    const showSiteBtn = req.body.showSiteBtn !== 'false' && req.body.showSiteBtn !== false;
    const showYoutubeBtn = req.body.showYoutubeBtn === 'true' || req.body.showYoutubeBtn === true;

    const current = await Realisation.findOne({ id: req.params.id });
    if (!current) return res.status(404).json({ message: 'Réalisation non trouvée.' });

    const updateData = { title, category, service, sector, shortDesc, longDesc, client, year, technologies, highlights, url: url || '#', youtubeUrl, showSiteBtn, showYoutubeBtn, order: order || 0 };
    let images = req.body.images ? (Array.isArray(req.body.images) ? req.body.images : [req.body.images]) : null;
    if (images) images = images.map(img => String(img || '').trim()).filter(Boolean);

    if (req.file) updateData.image = await safeUpload(req.file, 'juddev/realisations');
    else if (req.body.image) updateData.image = req.body.image;

    if (images) updateData.images = images;
    if (updateData.image) {
      const nextImages = Array.isArray(updateData.images) ? updateData.images : (current.images || []);
      updateData.images = [updateData.image, ...nextImages.filter(img => img && img !== updateData.image)];
    } else if (Array.isArray(updateData.images) && updateData.images.length) {
      updateData.image = updateData.images[0];
    }

    const realisation = await Realisation.findOneAndUpdate({ id: req.params.id }, updateData, { new: true });
    res.json(realisation);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// DELETE /api/realisations/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const r = await Realisation.findOneAndDelete({ id: req.params.id });
    if (!r) return res.status(404).json({ message: 'Réalisation supprimée.' });
    res.json({ message: 'Réalisation supprimée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;

