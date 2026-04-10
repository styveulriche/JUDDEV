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

// ============================================================
// PDF TEXT → HTML CONVERTER (improved)
// Produces clean, structured HTML from raw PDF text output.
// Cannot extract images (pdf-parse limitation) — use PDF embed instead.
// ============================================================
function pdfTextToHtml(rawText) {
  if (!rawText || !rawText.trim()) return '<p>Contenu non disponible.</p>';

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = rawText.split('\n');
  const html = [];
  let i = 0;

  function peek(offset = 0) { return (lines[i + offset] || '').trim(); }
  function skipBlanks() { while (i < lines.length && !lines[i].trim()) i++; }

  skipBlanks();

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    // Empty line — skip
    if (!line) { i++; continue; }

    // ── ALL-CAPS single line ≤ 100 chars → <h2>
    const isAllCaps = line.length >= 3 && line.length <= 100
      && line === line.toUpperCase()
      && /[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ]{3,}/.test(line)
      && !/[a-z0-9àâäéèêëîïôùûüç]/.test(line);

    if (isAllCaps) {
      html.push(`<h2>${esc(line)}</h2>`);
      i++;
      continue;
    }

    // ── Numbered/outline section: "1.", "1.1", "I.", "A." + content → <h3>
    if (/^(\d+\.){1,3}\s+\S/.test(line) || /^[IVX]+\.\s+\S/.test(line) || /^[A-Z][\.\)]\s+\S/.test(line)) {
      if (line.length < 120) {
        html.push(`<h3>${esc(line)}</h3>`);
        i++;
        continue;
      }
    }

    // ── Bullet / numbered list block
    const isBullet = l => /^[\-\•\*\–\—✓✔▶►◦→⚫•]\s/.test(l);
    const isNumber = l => /^\d+[\.\)]\s+\S/.test(l);

    if (isBullet(line) || isNumber(line)) {
      const isOl = isNumber(line);
      const items = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        if (!l) { i++; break; }
        if (isBullet(l) || isNumber(l)) {
          const text = l.replace(/^[\-\•\*\–\—✓✔▶►◦→⚫•]\s+/, '').replace(/^\d+[\.\)]\s+/, '');
          items.push(`<li>${esc(text)}</li>`);
          i++;
        } else if (items.length && l.length < 200 && !isAllCapsStr(l) && !isBullet(l) && !isNumber(l)) {
          // Continuation of last bullet item
          const last = items[items.length - 1];
          items[items.length - 1] = last.replace('</li>', ` ${esc(l)}</li>`);
          i++;
        } else {
          break;
        }
      }
      if (items.length) {
        html.push(`<${isOl ? 'ol' : 'ul'}>${items.join('')}</${isOl ? 'ol' : 'ul'}>`);
      }
      continue;
    }

    // ── Paragraph: collect consecutive non-blank lines
    const paraLines = [];
    while (i < lines.length && lines[i].trim()) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (!paraLines.length) continue;

    const combined = paraLines.join(' ').trim();

    // Single short line, starts with uppercase, no terminal sentence punctuation
    // AND next non-blank line is a long paragraph → treat as <h3>
    if (paraLines.length === 1 && combined.length >= 3 && combined.length <= 80
      && /^[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ]/.test(combined)
      && !/[.!?]$/.test(combined)) {

      let j = i;
      while (j < lines.length && !lines[j].trim()) j++;
      const nextLine = (lines[j] || '').trim();
      if (nextLine.length > 60) {
        html.push(`<h3>${esc(combined)}</h3>`);
        continue;
      }
    }

    // Multi-line paragraph: if first line is short + bold-ish lead-in
    if (paraLines.length > 1 && paraLines[0].length < 60 && !/[.!?]$/.test(paraLines[0])) {
      html.push(`<p><strong>${esc(paraLines[0])}</strong> ${paraLines.slice(1).map(esc).join(' ')}</p>`);
    } else {
      html.push(`<p>${esc(combined)}</p>`);
    }
  }

  return html.filter(Boolean).join('\n') || '<p>Contenu non disponible.</p>';
}

function isAllCapsStr(s) {
  return s === s.toUpperCase() && /[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ]{3,}/.test(s) && !/[a-z]/.test(s);
}

// Extract EN translations from request body
function extractTranslations(body) {
  return {
    en: {
      title: body.titleEn || '',
      shortDesc: body.shortDescEn || '',
      content: body.contentEn || ''
    }
  };
}

// ============================================================
// GET /api/articles
// ============================================================
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find({ published: true }).sort({ date: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// GET /api/articles/comments - All comments (admin)
router.get('/comments', auth, async (req, res) => {
  try {
    const articles = await Article.find({ 'comments.0': { $exists: true } }, 'id title comments');
    const allComments = [];
    articles.forEach(a => {
      a.comments.forEach(c => {
        allComments.push({
          articleId: a.id, articleTitle: a.title, commentId: c._id,
          name: c.name, email: c.email, text: c.text, date: c.date
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

// ============================================================
// POST /api/articles - Manual creation
// ============================================================
router.post('/', auth, uploadMixed.fields([{ name: 'image', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, category, author, shortDesc, content } = req.body;
    const tags = req.body.tags
      ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim()).filter(Boolean))
      : [];
    const image = req.files?.image?.[0]
      ? await safeUpload(req.files.image[0], 'juddev/articles')
      : (req.body.image || '');

    const id = `article-${Date.now()}`;
    const article = new Article({
      id, title, category, author, shortDesc,
      content: content || '',
      image, tags,
      sourceType: 'manual',
      translations: extractTranslations(req.body),
      date: new Date()
    });
    await article.save();
    notifySubscribers(article).catch(() => {});
    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// ============================================================
// POST /api/articles/from-pdf - Create from PDF
// Embeds the PDF URL for perfect fidelity display.
// Also extracts HTML text as accessible fallback content.
// ============================================================
router.post('/from-pdf', auth, uploadMixed.fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, category, author, shortDesc } = req.body;
    const tags = req.body.tags
      ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim()).filter(Boolean))
      : [];
    const image = req.files?.image?.[0]
      ? await safeUpload(req.files.image[0], 'juddev/articles')
      : (req.body.image || '');

    if (!req.files?.pdfFile?.[0]) {
      return res.status(400).json({ message: 'Fichier PDF requis.' });
    }

    const pdfFile = req.files.pdfFile[0];

    // 1. Upload PDF to Cloudinary → stored as pdfFile URL for iframe embed
    let pdfUrl = '';
    try {
      pdfUrl = await uploadToCloudinary(pdfFile, 'juddev/pdfs');
    } catch (e) {
      console.error('[PDF Cloudinary]', e.message);
    }

    // 2. Extract text with improved HTML conversion (fallback / accessible content)
    let content = '';
    try {
      const pdfParse = require('pdf-parse/lib/pdf-parse.js');
      const pdfData = await pdfParse(pdfFile.buffer);
      content = pdfTextToHtml(pdfData.text || '');
    } catch (pdfErr) {
      console.error('[PDF parse]', pdfErr.message);
      content = `<p>Le contenu de cet article est disponible dans le PDF ci-dessus.</p>`;
    }

    const id = `article-${Date.now()}`;
    const article = new Article({
      id, title, category, author, shortDesc,
      content,
      image,
      tags,
      sourceType: 'pdf',
      pdfFile: pdfUrl,
      translations: extractTranslations(req.body),
      date: new Date()
    });
    await article.save();
    notifySubscribers(article).catch(() => {});
    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// ============================================================
// PUT /api/articles/:id - Update
// ============================================================
router.put('/:id', auth, uploadMixed.fields([{ name: 'image', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, category, author, shortDesc, content, published } = req.body;
    const tags = req.body.tags
      ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim()).filter(Boolean))
      : [];

    const updateData = {
      title, category, author, shortDesc, content, tags,
      'translations.en.title': req.body.titleEn || '',
      'translations.en.shortDesc': req.body.shortDescEn || '',
      'translations.en.content': req.body.contentEn || ''
    };
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

// ============================================================
// DELETE /api/articles/:id
// ============================================================
router.delete('/:id', auth, async (req, res) => {
  try {
    const article = await Article.findOneAndDelete({ id: req.params.id });
    if (!article) return res.status(404).json({ message: 'Article non trouvé.' });
    res.json({ message: 'Article supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ============================================================
// POST /api/articles/:id/comments - Public
// ============================================================
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
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
