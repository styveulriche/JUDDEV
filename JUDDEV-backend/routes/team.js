const express = require('express');
const Team = require('../models/Team');
const auth = require('../middleware/auth');
const { uploadImage, uploadToCloudinary } = require('../middleware/upload');

const router = express.Router();

// GET /api/team
router.get('/', async (req, res) => {
  try {
    const members = await Team.find().sort({ order: 1, createdAt: 1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// POST /api/team
router.post('/', auth, uploadImage.single('photo'), async (req, res) => {
  try {
    const { name, role, order } = req.body;
    const tags = req.body.tags
      ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim()).filter(Boolean))
      : [];
    const socials = {
      linkedin: req.body.linkedin || '#',
      github: req.body.github || '#',
      twitter: req.body.twitter || '#',
      behance: req.body.behance || ''
    };
    let photo = req.body.photo || '';
    if (req.file) {
      const url = await uploadToCloudinary(req.file, 'juddev/team');
      if (url) photo = url;
    }
    const words = (name || '').split(' ').filter(Boolean);
    const initials = req.body.initials || words.map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const id = `member-${Date.now()}`;
    const member = new Team({ id, name, role, initials, photo, tags, socials, order: parseInt(order) || 0 });
    await member.save();
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// PUT /api/team/:id
router.put('/:id', auth, uploadImage.single('photo'), async (req, res) => {
  try {
    const { name, role, initials, order } = req.body;
    const tags = req.body.tags
      ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim()).filter(Boolean))
      : [];
    const socials = {
      linkedin: req.body.linkedin || '#',
      github: req.body.github || '#',
      twitter: req.body.twitter || '#',
      behance: req.body.behance || ''
    };
    const updateData = { name, role, initials, tags, socials, order: parseInt(order) || 0 };
    if (req.file) {
      const url = await uploadToCloudinary(req.file, 'juddev/team');
      if (url) updateData.photo = url;
    } else if (req.body.photo !== undefined) {
      updateData.photo = req.body.photo;
    }
    const member = await Team.findOneAndUpdate({ id: req.params.id }, updateData, { new: true });
    if (!member) return res.status(404).json({ message: 'Membre non trouvé.' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// DELETE /api/team/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const member = await Team.findOneAndDelete({ id: req.params.id });
    if (!member) return res.status(404).json({ message: 'Membre non trouvé.' });
    res.json({ message: 'Membre supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
