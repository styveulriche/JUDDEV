const express = require('express');
const Formation = require('../models/Formation');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/formations
router.get('/', async (req, res) => {
  try {
    const formations = await Formation.find().sort({ order: 1, createdAt: 1 });
    res.json(formations);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// GET /api/formations/:id
router.get('/:id', async (req, res) => {
  try {
    const formation = await Formation.findOne({ id: req.params.id });
    if (!formation) return res.status(404).json({ message: 'Formation non trouvée.' });
    res.json(formation);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// POST /api/formations
router.post('/', auth, async (req, res) => {
  try {
    const { title, duration, level, price, description, icon, order } = req.body;
    const program = req.body.program ? (Array.isArray(req.body.program) ? req.body.program : req.body.program.split('\n').filter(Boolean)) : [];

    const id = `formation-${Date.now()}`;
    const formation = new Formation({ id, title, duration, level, price, description, program, icon: icon || '📚', order: order || 0 });
    await formation.save();
    res.status(201).json(formation);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// PUT /api/formations/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, duration, level, price, description, icon, order } = req.body;
    const program = req.body.program ? (Array.isArray(req.body.program) ? req.body.program : req.body.program.split('\n').filter(Boolean)) : [];

    const updateData = { title, duration, level, price, description, program, icon: icon || '📚', order: order || 0 };
    const formation = await Formation.findOneAndUpdate({ id: req.params.id }, updateData, { new: true });
    if (!formation) return res.status(404).json({ message: 'Formation non trouvée.' });
    res.json(formation);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// DELETE /api/formations/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const formation = await Formation.findOneAndDelete({ id: req.params.id });
    if (!formation) return res.status(404).json({ message: 'Formation non trouvée.' });
    res.json({ message: 'Formation supprimée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
