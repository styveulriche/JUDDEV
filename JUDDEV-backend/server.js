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
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/team', require('./routes/team'));

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
async function getInMemoryURI() {
  console.log('⚠️  Démarrage du serveur MongoDB embarqué...');
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri() + 'juddev';
  console.log('✅ MongoDB embarqué démarré (données non persistantes)');
  return uri;
}

async function getMongoURI() {
  // Try Atlas URI with a short connection timeout
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('localhost')) {
    try {
      const testConn = mongoose.createConnection(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      });
      await testConn.asPromise();
      await testConn.close();
      console.log('✅ MongoDB Atlas accessible');
      return process.env.MONGODB_URI;
    } catch (atlasErr) {
      console.warn('⚠️  MongoDB Atlas inaccessible: ' + atlasErr.message.split('\n')[0]);
    }
  }

  // Try local MongoDB
  try {
    const net = require('net');
    await new Promise((resolve, reject) => {
      const socket = net.createConnection({ port: 27017, host: '127.0.0.1' });
      socket.on('connect', () => { socket.destroy(); resolve(); });
      socket.on('error', reject);
      setTimeout(() => { socket.destroy(); reject(new Error('timeout')); }, 1500);
    });
    console.log('✅ MongoDB local disponible');
    return 'mongodb://localhost:27017/juddev';
  } catch {
    try {
      return await getInMemoryURI();
    } catch (memErr) {
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

async function seedTeam() {
  try {
    const Team = require('./models/Team');
    const count = await Team.countDocuments();
    if (count === 0) {
      await Team.insertMany([
        { id: 'member-1', name: 'NGUEYE NGUEYE DURAND YOURI', role: 'Directeur Général & CEO', initials: 'ND', photo: '', tags: ['Backend Development', 'Gestion de Projet', 'Architecture Système', 'Node.js'], socials: { linkedin: '#', github: '#', twitter: '#' }, order: 1 },
        { id: 'member-2', name: 'FOKOUA WOWO U STYVE', role: 'Directeur des Opérations & COO', initials: 'FS', photo: '', tags: ['Java Development', 'OOP Architecture', 'Gestion Opérationnelle', 'Mobile Dev'], socials: { linkedin: '#', github: '#', twitter: '#' }, order: 2 },
        { id: 'member-3', name: 'JAYSON STANLEY DJEMETIO NINZAGO', role: 'Directeur Technique & CTO', initials: 'JS', photo: '', tags: ['UI/UX Design', 'Web Design', 'Direction Technique', 'React'], socials: { linkedin: '#', github: '#', behance: '#' }, order: 3 }
      ]);
      console.log('✅ Équipe initialisée');
    }
  } catch (e) {
    console.warn('⚠️  Auto-seed team:', e.message);
  }
}

async function seedPartners() {
  try {
    const ContactInfo = require('./models/ContactInfo');
    let info = await ContactInfo.findOne();
    if (!info) info = new ContactInfo({});
    if (!info.partners || info.partners.length === 0) {
      info.partners = [
        { name: 'Partenaire 1', image: 'images/partenaire1.png', url: '#' },
        { name: 'Partenaire 2', image: 'images/partenaire2.png', url: '#' },
        { name: 'Partenaire 3', image: 'images/partenaire3.png', url: '#' },
        { name: 'Partenaire 4', image: 'images/partenaire4.png', url: '#' },
        { name: 'Partenaire 5', image: 'images/partenaire5.png', url: '#' },
        { name: 'Partenaire 6', image: 'images/partenaire6.png', url: '#' },
      ];
      await info.save();
      console.log('✅ Partenaires initialisés');
    }
  } catch (e) {
    console.warn('⚠️  Auto-seed partners:', e.message);
  }
}

async function start() {
  try {
    const mongoURI = await getMongoURI();
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connecté');

    // Auto-create admin user if not exists
    await seedAdmin();
    await seedTeam();
    await seedPartners();

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
