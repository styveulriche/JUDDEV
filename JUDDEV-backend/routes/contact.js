const express = require('express');
const ContactInfo = require('../models/ContactInfo');
const ContactMessage = require('../models/ContactMessage');
const auth = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

const router = express.Router();

// GET /api/contact/info - Public
router.get('/info', async (req, res) => {
  try {
    let info = await ContactInfo.findOne();
    if (!info) {
      info = await new ContactInfo({}).save();
    }
    res.json(info);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// PUT /api/contact/info - Protected
router.put('/info', auth, async (req, res) => {
  try {
    const { email, phone, address, hours, social } = req.body;
    let info = await ContactInfo.findOne();
    if (!info) {
      info = new ContactInfo({ email, phone, address, hours, social });
    } else {
      info.email = email || info.email;
      info.phone = phone || info.phone;
      info.address = address || info.address;
      info.hours = hours || info.hours;
      if (social) info.social = { ...info.social.toObject(), ...social };
    }
    await info.save();
    res.json(info);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// POST /api/contact/partner - Add a partner (admin)
router.post('/partner', auth, uploadImage.single('image'), async (req, res) => {
  try {
    const { name, url } = req.body;
    const image = req.file ? `/uploads/images/${req.file.filename}` : (req.body.image || '');
    let info = await ContactInfo.findOne();
    if (!info) info = new ContactInfo({});
    info.partners.push({ name: name || '', image, url: url || '#' });
    await info.save();
    res.status(201).json(info.partners);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// PUT /api/contact/partner/:index - Update a partner (admin)
router.put('/partner/:index', auth, uploadImage.single('image'), async (req, res) => {
  try {
    const idx = parseInt(req.params.index);
    let info = await ContactInfo.findOne();
    if (!info || !info.partners[idx]) return res.status(404).json({ message: 'Partenaire non trouvé.' });
    const { name, url } = req.body;
    if (name !== undefined) info.partners[idx].name = name;
    if (url !== undefined) info.partners[idx].url = url;
    if (req.file) info.partners[idx].image = `/uploads/images/${req.file.filename}`;
    info.markModified('partners');
    await info.save();
    res.json(info.partners);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// DELETE /api/contact/partner/:index - Remove a partner (admin)
router.delete('/partner/:index', auth, async (req, res) => {
  try {
    const idx = parseInt(req.params.index);
    let info = await ContactInfo.findOne();
    if (!info || !info.partners[idx]) return res.status(404).json({ message: 'Partenaire non trouvé.' });
    info.partners.splice(idx, 1);
    info.markModified('partners');
    await info.save();
    res.json(info.partners);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// POST /api/contact/message - Public (submit contact form)
router.post('/message', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Nom, email et message sont requis.' });
    }

    const msg = new ContactMessage({ name, email, phone, subject, message });
    await msg.save();

    // Send email notification via Brevo HTTP API
    if (process.env.BREVO_API_KEY) {
      const adminEmail = process.env.ADMIN_EMAIL || 'juddevcorporation03@gmail.com';
      const senderEmail = process.env.SMTP_USER || 'juddevcorporation03@gmail.com';
      fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'JUDDEV Site', email: senderEmail },
          to: [{ email: adminEmail }],
          subject: `Nouveau message: ${subject || 'Contact Site'}`,
          htmlContent: (() => {
            const siteUrl = process.env.FRONTEND_URL || '';
            const logoHtml = siteUrl ? `<img src="${siteUrl}/images/JUDDEVlogomenu.png" alt="JUDDEV" style="height:48px;margin-bottom:0.75rem;object-fit:contain;display:block;margin-left:auto;margin-right:auto" />` : '';
            return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0e1a;color:#e2e8f0;border-radius:12px;overflow:hidden"><div style="background:linear-gradient(135deg,#0066ff,#00d4ff);padding:2rem;text-align:center">${logoHtml}<h1 style="color:#fff;margin:0;font-size:1.4rem">JUDDEV CORPORATION</h1><p style="color:rgba(255,255,255,0.85);margin:0.5rem 0 0">Nouveau message de contact</p></div><div style="padding:2rem"><h2 style="color:#fff;margin-top:0">Message de ${name}</h2><p><strong style="color:#94a3b8">Email:</strong> <span style="color:#e2e8f0">${email}</span></p><p><strong style="color:#94a3b8">Téléphone:</strong> <span style="color:#e2e8f0">${phone || 'N/A'}</span></p><p><strong style="color:#94a3b8">Sujet:</strong> <span style="color:#e2e8f0">${subject || 'N/A'}</span></p><p><strong style="color:#94a3b8">Message:</strong></p><p style="white-space:pre-wrap;color:#e2e8f0;background:rgba(255,255,255,0.05);padding:1rem;border-radius:8px;border-left:3px solid #0066ff">${message}</p></div><div style="padding:1rem 2rem;background:rgba(0,0,0,0.2);text-align:center"><p style="color:#64748b;font-size:0.8rem;margin:0">© 2025 JUDDEV CORPORATION — Yaoundé, Cameroun</p></div></div>`;
          })()
        })
      }).then(r => {
        if (r.ok) console.log('[Contact] Email admin envoyé via Brevo');
        else r.json().then(e => console.error('[Contact] Brevo erreur:', JSON.stringify(e))).catch(() => {});
      }).catch(e => console.error('[Contact] Erreur envoi email admin:', e.message));
    }

    res.status(201).json({ message: 'Message envoyé avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur: ' + err.message });
  }
});

// GET /api/contact/messages - Protected
router.get('/messages', auth, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// PUT /api/contact/messages/:id/read - Protected
router.put('/messages/:id/read', auth, async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!msg) return res.status(404).json({ message: 'Message non trouvé.' });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// DELETE /api/contact/messages/:id - Protected
router.delete('/messages/:id', auth, async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message non trouvé.' });
    res.json({ message: 'Message supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
