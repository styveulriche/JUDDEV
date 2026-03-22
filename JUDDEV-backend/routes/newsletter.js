const express = require('express');
const Subscriber = require('../models/Subscriber');

const router = express.Router();

// Helper to send email
async function sendEmail(to, subject, html) {
  if (!process.env.SMTP_PASS || process.env.SMTP_PASS === 'your_gmail_app_password_here') {
    console.log('[Email] SMTP non configuré — variable SMTP_PASS manquante ou par défaut');
    return;
  }
  console.log('[Email] Tentative envoi vers:', to, '| Sujet:', subject);
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    await transporter.sendMail({
      from: `"JUDDEV CORPORATION" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });
    console.log('[Email] ✅ Envoyé avec succès vers:', to);
  } catch (err) {
    console.error('[Email] ❌ Erreur:', err.message);
  }
}

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('[Newsletter] Abonnement demandé:', email);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Adresse email invalide.' });
    }

    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log('[Newsletter] Email déjà abonné:', email);
      return res.status(200).json({ message: 'Vous êtes déjà abonné(e).' });
    }

    await Subscriber.create({ email: email.toLowerCase() });
    console.log('[Newsletter] Nouvel abonné créé:', email);

    // Send welcome email
    await sendEmail(
      email,
      'Bienvenue dans la newsletter JUDDEV CORPORATION !',
      `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0e1a;color:#e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#0066ff,#00d4ff);padding:2rem;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:1.5rem">JUDDEV CORPORATION</h1>
          <p style="color:rgba(255,255,255,0.85);margin:0.5rem 0 0">Votre partenaire technologique d'excellence</p>
        </div>
        <div style="padding:2rem">
          <h2 style="color:#ffffff;margin-top:0">Merci pour votre abonnement !</h2>
          <p style="color:#94a3b8;line-height:1.7">Vous recevrez désormais nos derniers articles et insights directement dans votre boîte mail.</p>
          <p style="color:#94a3b8;line-height:1.7">Restez à la pointe de l'innovation avec nos publications sur le développement web, mobile, l'IA, le cloud et bien plus.</p>
          <div style="margin-top:1.5rem;padding:1rem;background:rgba(0,102,255,0.1);border:1px solid rgba(0,102,255,0.2);border-radius:8px">
            <p style="color:#94a3b8;font-size:0.85rem;margin:0">Pas de spam, désinscription facile à tout moment.</p>
          </div>
        </div>
        <div style="padding:1rem 2rem;background:rgba(0,0,0,0.2);text-align:center">
          <p style="color:#64748b;font-size:0.8rem;margin:0">© 2025 JUDDEV CORPORATION — Yaoundé, Cameroun</p>
        </div>
      </div>
      `
    );

    res.status(201).json({ message: 'Abonnement réussi ! Vous recevrez nos prochains articles par email.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// GET /api/newsletter/subscribers (admin only)
router.get('/subscribers', async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// DELETE /api/newsletter/subscribers/:id (admin only)
const auth = require('../middleware/auth');
router.delete('/subscribers/:id', auth, async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id);
    res.json({ message: 'Abonné supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Exported function to notify subscribers about a new article
async function notifySubscribers(article) {
  try {
    const subscribers = await Subscriber.find();
    if (!subscribers.length) return;

    const emails = subscribers.map(s => s.email);
    const siteUrl = process.env.FRONTEND_URL || 'http://localhost:5000';

    await sendEmail(
      emails.join(','),
      `Nouvel article : ${article.title}`,
      `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0e1a;color:#e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#0066ff,#00d4ff);padding:2rem;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:1.5rem">JUDDEV CORPORATION</h1>
          <p style="color:rgba(255,255,255,0.85);margin:0.5rem 0 0">Nouvel article publié</p>
        </div>
        <div style="padding:2rem">
          ${article.image ? `<img src="${siteUrl}${article.image.startsWith('/') ? '' : '/'}${article.image}" alt="${article.title}" style="width:100%;border-radius:8px;margin-bottom:1.5rem;object-fit:cover;max-height:250px" />` : ''}
          <span style="display:inline-block;background:rgba(0,102,255,0.15);color:#1a7aff;padding:0.25rem 0.75rem;border-radius:999px;font-size:0.8rem;margin-bottom:1rem">${article.category || 'Article'}</span>
          <h2 style="color:#ffffff;margin:0 0 1rem">${article.title}</h2>
          <p style="color:#94a3b8;line-height:1.7">${article.shortDesc || ''}</p>
          <a href="${siteUrl}/article-detail.html?id=${article.id}" style="display:inline-block;margin-top:1.5rem;background:linear-gradient(135deg,#0066ff,#00d4ff);color:#fff;padding:0.75rem 2rem;border-radius:8px;text-decoration:none;font-weight:600">Lire l'article →</a>
        </div>
        <div style="padding:1rem 2rem;background:rgba(0,0,0,0.2);text-align:center">
          <p style="color:#64748b;font-size:0.8rem;margin:0">© 2025 JUDDEV CORPORATION — <a href="${siteUrl}" style="color:#64748b">juddev.com</a></p>
        </div>
      </div>
      `
    );
    console.log(`✅ Newsletter envoyée à ${emails.length} abonné(s)`);
  } catch (err) {
    console.error('Newsletter notify error:', err.message);
  }
}

module.exports = router;
module.exports.notifySubscribers = notifySubscribers;
