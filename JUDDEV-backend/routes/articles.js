const express = require('express');
const Article = require('../models/Article');
const auth = require('../middleware/auth');
const { uploadMixed, uploadToCloudinary } = require('../middleware/upload');
const { notifySubscribers } = require('./newsletter');

const router = express.Router();

async function safeUpload(file, folder) {
  if (!file) return '';
  try { return await uploadToCloudinary(file, folder); }
  catch (e) { console.error('[Cloudinary]', e.message); return ''; }
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

    // Extract text from PDF with formatting detection
    let content = '';
    let pdfFilename = '';
    try {
      const pdfParse = require('pdf-parse/lib/pdf-parse.js');
      const dataBuffer = pdfFile.buffer;
      const pdfData = await pdfParse(dataBuffer);

      const rawText = pdfData.text || '';
      const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

      // Split into lines and group them smartly
      const lines = rawText.split('\n');
      const blocks = [];
      let currentBlock = [];

      for (const raw of lines) {
        const line = raw.trimEnd();
        if (line.trim() === '') {
          if (currentBlock.length) { blocks.push(currentBlock); currentBlock = []; }
        } else {
          currentBlock.push(line);
        }
      }
      if (currentBlock.length) blocks.push(currentBlock);

      const htmlParts = [];
      for (const block of blocks) {
        const text = block.join(' ').trim();
        if (!text || text.length < 3) continue;

        // H1: very short, all-caps, no punctuation mid-text
        if (block.length === 1 && text.length < 60 && text === text.toUpperCase() && /^[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ0-9\s\-:&'«»()]+$/u.test(text)) {
          htmlParts.push(`<h2>${esc(text)}</h2>`);
          continue;
        }

        // H2: short single line that looks like a heading (title-case, ends with colon, or numbered)
        if (block.length === 1 && text.length < 100 && (
          text.endsWith(':') ||
          /^\d+[\.\)]\s/.test(text) ||
          /^[IVX]+\.\s/.test(text) ||
          (/^[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ]/.test(text) && text.length < 60 && !/[.!?]$/.test(text))
        )) {
          htmlParts.push(`<h3>${esc(text)}</h3>`);
          continue;
        }

        // List items: lines starting with bullet-like chars
        const listLines = block.filter(l => /^[\-\•\*\–\—✓✔▶►]\s/.test(l.trim()) || /^\d+[\.\)]\s/.test(l.trim()));
        if (listLines.length > 0 && listLines.length >= block.length * 0.6) {
          const items = block.map(l => {
            const stripped = l.trim().replace(/^[\-\•\*\–\—✓✔▶►]\s+/, '').replace(/^\d+[\.\)]\s+/, '');
            return `<li>${esc(stripped)}</li>`;
          }).join('');
          htmlParts.push(`<ul style="padding-left:1.5rem;margin:0.75rem 0">${items}</ul>`);
          continue;
        }

        // Bold detection: lines that are short and at start of block (likely bold lead-in)
        const paraLines = block.map((l, i) => {
          const trimmed = l.trim();
          // First line short and followed by more content → likely bold
          if (i === 0 && block.length > 1 && trimmed.length < 80 && !trimmed.endsWith(',')) {
            return `<strong>${esc(trimmed)}</strong>`;
          }
          return esc(trimmed);
        });
        htmlParts.push(`<p>${paraLines.join(' ')}</p>`);
      }

      content = htmlParts.join('\n') || '<p>Contenu non disponible.</p>';

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
