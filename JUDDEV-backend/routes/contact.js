const express = require('express');
const ContactInfo = require('../models/ContactInfo');
const ContactMessage = require('../models/ContactMessage');
const auth = require('../middleware/auth');

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

// POST /api/contact/message - Public (submit contact form)
router.post('/message', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Nom, email et message sont requis.' });
    }

    const msg = new ContactMessage({ name, email, phone, subject, message });
    await msg.save();

    // Optional: send email notification
    if (process.env.SMTP_PASS && process.env.SMTP_PASS !== 'your_gmail_app_password_here') {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT),
          secure: false,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });
        await transporter.sendMail({
          from: `"JUDDEV Site" <${process.env.SMTP_USER}>`,
          to: process.env.ADMIN_EMAIL,
          subject: `Nouveau message: ${subject || 'Contact Site'}`,
          html: `<h2>Nouveau message de ${name}</h2><p><strong>Email:</strong> ${email}</p><p><strong>Téléphone:</strong> ${phone || 'N/A'}</p><p><strong>Sujet:</strong> ${subject || 'N/A'}</p><p><strong>Message:</strong></p><p>${message}</p>`
        });
      } catch (emailErr) {
        console.error('Email error:', emailErr.message);
      }
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
