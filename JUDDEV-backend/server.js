require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================================
// STATIC FILES
// ============================================================
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve the admin dashboard at /admin
app.use('/admin', express.static(path.join(__dirname, '../JUDDEV-dashboard')));

// Serve the vitrine frontend at root
app.use(express.static(path.join(__dirname, '../JUDDEV-frontend')));

// ============================================================
// API ROUTES
// ============================================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/realisations', require('./routes/realisations'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/formations', require('./routes/formations'));
app.use('/api/contact', require('./routes/contact'));

// API Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'JUDDEV API is running', timestamp: new Date().toISOString() });
});

// ============================================================
// SPA FALLBACK for admin and frontend routes
// ============================================================
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../JUDDEV-dashboard/index.html'));
});

app.get('/admin', (req, res) => {
  res.redirect('/admin/login.html');
});

// ============================================================
// 404 HANDLER
// ============================================================
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'Route API non trouvée.' });
  }
  // For frontend routes, serve index.html
  res.sendFile(path.join(__dirname, '../JUDDEV-frontend/index.html'));
});

// ============================================================
// ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Fichier trop volumineux.' });
  }
  res.status(500).json({ message: err.message || 'Erreur serveur interne.' });
});

// ============================================================
// DATABASE CONNECTION & START
// ============================================================
async function getMongoURI() {
  // If a URI is provided in .env, use it directly
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('localhost')) {
    return process.env.MONGODB_URI;
  }

  // Try to connect to local MongoDB first
  try {
    const net = require('net');
    await new Promise((resolve, reject) => {
      const socket = net.createConnection({ port: 27017, host: '127.0.0.1' });
      socket.on('connect', () => { socket.destroy(); resolve(); });
      socket.on('error', reject);
      setTimeout(() => { socket.destroy(); reject(new Error('timeout')); }, 1500);
    });
    return process.env.MONGODB_URI || 'mongodb://localhost:27017/juddev';
  } catch {
    // Local MongoDB not available – fallback to mongodb-memory-server
    console.log('⚠️  MongoDB local non disponible. Démarrage du serveur embarqué...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri() + 'juddev';
      console.log('✅ MongoDB embarqué démarré (données non persistantes - installez MongoDB pour la production)');
      return uri;
    } catch (memErr) {
      // Neither local nor embedded MongoDB available
      console.error('❌ MongoDB non disponible. Installez MongoDB: https://www.mongodb.com/try/download/community');
      process.exit(1);
    }
  }
}

async function seedAdmin() {
  try {
    const User = require('./models/User');
    const adminEmail = process.env.ADMIN_EMAIL || 'juddevcorporation03@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'SLACKMWjuddev03';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      await User.create({ email: adminEmail, password: adminPassword, role: 'admin' });
      console.log('✅ Admin créé:', adminEmail);
    }
  } catch (e) {
    console.warn('⚠️  Auto-seed admin:', e.message);
  }
}

async function start() {
  try {
    const mongoURI = await getMongoURI();
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connecté');

    // Auto-create admin user if not exists
    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`\n🚀 JUDDEV Backend running on http://localhost:${PORT}`);
      console.log(`📱 Vitrine: http://localhost:${PORT}`);
      console.log(`🔧 Dashboard: http://localhost:${PORT}/admin/login.html`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
      console.log(`❤️  Health: http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error('❌ Erreur de démarrage:', err.message);
    process.exit(1);
  }
}

start();
