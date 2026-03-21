const express = require('express');
const path = require('path');
const Article = require('../models/Article');
const auth = require('../middleware/auth');
const { uploadMixed } = require('../middleware/upload');

const router = express.Router();

// GET /api/articles
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find({ published: true }).sort({ date: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// GET /api/articles/:id
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findOne({ id: req.params.id });
    if (!article) return res.status(404).json({ message: 'Article non trouvé.' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// POST /api/articles - Create article manually
router.post('/', auth, uploadMixed.fields([{ name: 'image', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, category, author, shortDesc, content } = req.body;
    const tags = req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim()).filter(Boolean)) : [];
    const image = req.files?.image?.[0] ? `/uploads/images/${req.files.image[0].filename}` : (req.body.image || '');

    const id = `article-${Date.now()}`;
    const article = new Article({
      id, title, category, author, shortDesc,
      content: content || '',
      image,
      tags,
      sourceType: 'manual',
      date: new Date()
    });
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// POST /api/articles/from-pdf - Create article from PDF
router.post('/from-pdf', auth, uploadMixed.fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, category, author, shortDesc } = req.body;
    const tags = req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim()).filter(Boolean)) : [];
    const image = req.files?.image?.[0] ? `/uploads/images/${req.files.image[0].filename}` : (req.body.image || '');

    if (!req.files?.pdfFile?.[0]) {
      return res.status(400).json({ message: 'Fichier PDF requis.' });
    }

    const pdfPath = req.files.pdfFile[0].path;
    const pdfFilename = `/uploads/pdfs/${req.files.pdfFile[0].filename}`;

    // Extract text from PDF
    let content = '';
    try {
      const pdfParse = require('pdf-parse');
      const fs = require('fs');
      const dataBuffer = fs.readFileSync(pdfPath);
      const pdfData = await pdfParse(dataBuffer);

      // Convert plain text to HTML paragraphs
      const rawText = pdfData.text || '';
      const paragraphs = rawText
        .split(/\n\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 10);

      content = paragraphs.map(p => {
        // Detect headings (short lines, all caps, or ending with colon)
        const lines = p.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length === 1 && (p.length < 80 || p === p.toUpperCase() || p.endsWith(':'))) {
          return `<h2>${p}</h2>`;
        }
        return `<p>${lines.join(' ')}</p>`;
      }).join('\n');

    } catch (pdfErr) {
      console.error('PDF parse error:', pdfErr);
      content = `<p>Contenu extrait du PDF. Erreur de parsing: ${pdfErr.message}</p>`;
    }

    const id = `article-${Date.now()}`;
    const article = new Article({
      id, title, category, author, shortDesc,
      content,
      image,
      tags,
      sourceType: 'pdf',
      pdfFile: pdfFilename,
      date: new Date()
    });
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// PUT /api/articles/:id
router.put('/:id', auth, uploadMixed.fields([{ name: 'image', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, category, author, shortDesc, content, published } = req.body;
    const tags = req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim()).filter(Boolean)) : [];

    const updateData = { title, category, author, shortDesc, content, tags };
    if (published !== undefined) updateData.published = published === 'true' || published === true;
    if (req.files?.image?.[0]) updateData.image = `/uploads/images/${req.files.image[0].filename}`;
    else if (req.body.image) updateData.image = req.body.image;

    const article = await Article.findOneAndUpdate({ id: req.params.id }, updateData, { new: true });
    if (!article) return res.status(404).json({ message: 'Article non trouvé.' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// DELETE /api/articles/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const article = await Article.findOneAndDelete({ id: req.params.id });
    if (!article) return res.status(404).json({ message: 'Article non trouvé.' });
    res.json({ message: 'Article supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
