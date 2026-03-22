const express = require('express');
const Article = require('../models/Article');
const auth = require('../middleware/auth');
const { uploadMixed, uploadToCloudinary } = require('../middleware/upload');
const { notifySubscribers } = require('./newsletter');

const router = express.Router();

// Upload vers Cloudinary sans bloquer si les credentials manquent
async function safeUpload(file, folder) {
  if (!file) return '';
  try {
    return await uploadToCloudinary(file, folder);
  } catch (e) {
    console.error('[Cloudinary] Upload échoué:', e.message);
    return '';
  }
}

// GET /api/articles
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find({ published: true }).sort({ date: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// GET /api/articles/comments - All comments from all articles (admin)
router.get('/comments', auth, async (req, res) => {
  try {
    const articles = await Article.find({ 'comments.0': { $exists: true } }, 'id title comments');
    const allComments = [];
    articles.forEach(a => {
      a.comments.forEach(c => {
        allComments.push({
          articleId: a.id,
          articleTitle: a.title,
          commentId: c._id,
          name: c.name,
          email: c.email,
          text: c.text,
          date: c.date
        });
      });
    });
    allComments.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(allComments);
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
    const image = req.files?.image?.[0] ? await safeUpload(req.files.image[0], 'juddev/articles') : (req.body.image || '');

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
    // Notify newsletter subscribers
    notifySubscribers(article).catch(() => {});
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
    const image = req.files?.image?.[0] ? await safeUpload(req.files.image[0], 'juddev/articles') : (req.body.image || '');

    if (!req.files?.pdfFile?.[0]) {
      return res.status(400).json({ message: 'Fichier PDF requis.' });
    }

    const pdfFile = req.files.pdfFile[0];

    // Extract text from PDF
    let content = '';
    let pdfFilename = '';
    try {
      const pdfParse = require('pdf-parse');
      const dataBuffer = pdfFile.buffer;
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

    // Upload PDF to Cloudinary if parse succeeded (optional)
    try {
      pdfFilename = await uploadToCloudinary(pdfFile, 'juddev/pdfs');
    } catch (e) {
      console.error('PDF Cloudinary upload error:', e.message);
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
    // Notify newsletter subscribers
    notifySubscribers(article).catch(() => {});
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
    if (req.files?.image?.[0]) updateData.image = await safeUpload(req.files.image[0], 'juddev/articles');
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

// POST /api/articles/:id/comments - Public
router.post('/:id/comments', async (req, res) => {
  try {
    const { name, email, text } = req.body;
    if (!name || !text) return res.status(400).json({ message: 'Nom et commentaire requis.' });
    const article = await Article.findOne({ id: req.params.id });
    if (!article) return res.status(404).json({ message: 'Article non trouvé.' });
    article.comments.push({ name, email: email || '', text });
    await article.save();
    res.status(201).json(article.comments);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// DELETE /api/articles/:id/comments/:commentId - Protected
router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const article = await Article.findOne({ id: req.params.id });
    if (!article) return res.status(404).json({ message: 'Article non trouvé.' });
    const comment = article.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Commentaire non trouvé.' });
    comment.deleteOne();
    await article.save();
    res.json({ message: 'Commentaire supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

module.exports = router;
