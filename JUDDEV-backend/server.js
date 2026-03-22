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
app.use('/api/faq', require('./routes/faq'));

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
        { id: 'member-1', name: 'NGUEYE NGUEYE DURAND YOURI', role: 'Directeur Général & CEO', initials: 'ND', photo: '', tags: ['Backend Development', 'Gestion de Projet', 'Architecture Système', 'Python'], socials: { linkedin: '#', github: '#', twitter: '#' }, order: 1 },
        { id: 'member-2', name: 'FOKOUA WOWO U STYVE', role: 'Directeur des Opérations & COO', initials: 'FS', photo: '', tags: ['Java Development', 'OOP Architecture', 'Gestion Opérationnelle', 'Java'], socials: { linkedin: '#', github: '#', twitter: '#' }, order: 2 },
        { id: 'member-3', name: 'JAYSON STANLEY DJEMETIO NINZAGO', role: 'Directeur Technique & CTO', initials: 'JS', photo: '', tags: ['UI/UX Design', 'Web Design', 'Direction Technique', 'React'], socials: { linkedin: '#', github: '#', behance: '#' }, order: 3 }
      ]);
      console.log('✅ Équipe initialisée');
    }
  } catch (e) {
    console.warn('⚠️  Auto-seed team:', e.message);
  }
}

async function seedServices() {
  try {
    const Service = require('./models/Service');
    const count = await Service.countDocuments();
    if (count === 0) {
      await Service.insertMany([
        { id: 'dev-web', title: 'Développement Web', subtitle: 'Maîtrisez votre présence en ligne', icon: '💻', image: 'images/dev1.jpg', shortDesc: 'Nous créons des sites et applications web modernes, performants et responsive qui captivent vos visiteurs et boostent votre croissance.', longDesc: 'Chez JUDDEV CORPORATION, nous concevons et développons des applications web de haute performance, alliant excellence technique et design soigné.', features: ['Sites vitrine & landing pages performants', 'Applications web complexes (SPA, PWA)', 'E-commerce et boutiques en ligne', 'API REST & GraphQL', 'Optimisation SEO technique avancée', 'Maintenance et évolutions'], technologies: ['React', 'Vue.js', 'Next.js', 'Node.js', 'PHP', 'Laravel', 'WordPress', 'PostgreSQL'], category: 'web', order: 1 },
        { id: 'dev-mobile', title: "Développement d'Applications Mobiles", subtitle: "Maîtriser l'innovation", icon: '📱', image: 'images/dev2.jpg', shortDesc: "Développement d'applications mobiles cross-platform et natives pour startups, entreprises et organismes gouvernementaux.", longDesc: 'JUDDEV CORPORATION développe des applications mobiles innovantes pour iOS et Android, alliant performance technique et expérience utilisateur optimale.', features: ['Applications iOS et Android cross-platform', 'Développement React Native & Flutter', 'Développement natif (Java, Swift, Kotlin)', 'Géolocalisation et cartographie', 'Notifications push en temps réel', 'Publication App Store & Google Play'], technologies: ['React Native', 'Flutter', 'Java', 'Kotlin', 'Swift', 'Firebase', 'Redux', 'SQLite'], category: 'mobile', order: 2 },
        { id: 'saas', title: 'Ingénierie des Produits SaaS', subtitle: 'Des solutions sur mesure à grande échelle', icon: '⚙️', image: 'images/dev3.jpg', shortDesc: 'Nous créons des plateformes SaaS personnalisées, robustes et scalables, servant des milliers d\'utilisateurs simultanément.', longDesc: 'Nous concevons et développons des produits SaaS complets, depuis l\'architecture système jusqu\'au déploiement en production.', features: ['Architecture multi-tenant sécurisée', 'Gestion des abonnements et facturation', 'Tableaux de bord et analytics avancés', 'API publique documentée', 'Haute disponibilité (99.9% uptime)', 'RGPD et conformité sécurité'], technologies: ['Vue.js', 'React', 'Node.js', 'Laravel', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'], category: 'cloud', order: 3 },
        { id: 'ux-design', title: 'Expérience Numérique & UI/UX', subtitle: "Design centré sur l'humain", icon: '🎨', image: 'images/dev4.jpg', shortDesc: "Nous créons des interfaces utilisateur intuitives et des expériences digitales engageantes qui convertissent les visiteurs en clients.", longDesc: 'Notre studio de design créé des interfaces numériques qui allient esthétique et fonctionnalité.', features: ['Research utilisateur & personas', "Architecture de l'information & user flows", 'Wireframing et prototypage interactif', 'Design System et bibliothèque UI', 'UI design haute fidélité', 'Tests d\'utilisabilité'], technologies: ['Figma', 'Adobe XD', 'Sketch', 'InVision', 'Webflow', 'Framer', 'Principle', 'Zeplin'], category: 'design', order: 4 },
        { id: 'cloud', title: 'Ingénierie du Cloud', subtitle: 'Infrastructure scalable et fiable', icon: '☁️', image: 'images/dev5.jpg', shortDesc: 'Notre équipe conçoit et gère des systèmes cloud sécurisés, garantissant fiabilité, performance et capacité évolutive maximale.', longDesc: 'JUDDEV CORPORATION vous accompagne dans votre migration et gestion cloud avec une expertise reconnue sur les principales plateformes.', features: ['Architecture cloud multi-région', 'Migration vers le cloud', 'Infrastructure as Code (Terraform)', 'CI/CD pipelines automatisés', 'Sécurité cloud et Zero Trust', 'Optimisation des coûts cloud'], technologies: ['AWS', 'Azure', 'GCP', 'Terraform', 'Docker', 'Kubernetes', 'Ansible', 'GitHub Actions'], category: 'cloud', order: 5 },
        { id: 'mvp', title: 'Développement MVP', subtitle: "De l'idée au produit rapidement", icon: '🚀', image: 'images/dev6.jpg', shortDesc: 'Nous transformons les idées à fort potentiel en produits Minimum Viable Product, prêts à déployer en un temps record.', longDesc: 'Notre service MVP est conçu pour les startups et entrepreneurs qui veulent valider leur idée rapidement sans compromettre la qualité.', features: ['Workshop de définition du MVP', 'Roadmap et priorisation produit', 'Design UX/UI complet en 1 semaine', 'Développement agile par sprints', 'Tests automatisés et QA', 'Support post-lancement 30 jours'], technologies: ['React', 'Next.js', 'Node.js', 'MongoDB', 'Firebase', 'Stripe', 'Vercel', 'Railway'], category: 'web', order: 6 },
        { id: 'marketing-digital', title: 'Marketing Digital & SEO', subtitle: 'Visibilité et croissance en ligne', icon: '📈', image: 'images/ia.jpg', shortDesc: 'Stratégies digitales complètes pour augmenter votre visibilité en ligne, attirer plus de prospects et convertir efficacement.', longDesc: 'Notre équipe marketing digital combine expertise technique et créativité pour propulser votre présence en ligne.', features: ['Audit SEO complet et technique', 'Campagnes Google Ads', 'Publicités Meta, LinkedIn, TikTok', 'Email marketing et automation', 'Analytics et reporting mensuel', 'Growth hacking'], technologies: ['Google Ads', 'Meta Ads', 'Google Analytics 4', 'SEMrush', 'Mailchimp', 'HubSpot', 'Hotjar', 'Zapier'], category: 'marketing', order: 7 },
        { id: 'ia-solutions', title: 'Solutions IA & Automatisation', subtitle: 'Intelligence artificielle au service de votre croissance', icon: '🤖', image: 'images/ia.jpg', shortDesc: "Intégration de l'IA et automatisation intelligente des processus métier pour maximiser votre productivité.", longDesc: "JUDDEV CORPORATION est à la pointe de l'intégration de l'intelligence artificielle dans les processus métier.", features: ["Intégration d'APIs IA (OpenAI, Anthropic)", 'Développement de chatbots intelligents', 'Automatisation de workflows métier', 'Analyse de données et prédictions ML', 'Traitement du langage naturel (NLP)', 'RAG et bases de connaissances IA'], technologies: ['Python', 'TensorFlow', 'PyTorch', 'OpenAI API', 'LangChain', 'Hugging Face', 'FastAPI', 'n8n'], category: 'ia', order: 8 },
        { id: 'desktop-app', title: 'Application Desktop', subtitle: 'Logiciels puissants pour Windows, Mac et Linux', icon: '🖥️', image: 'images/dev1.jpg', shortDesc: "Nous concevons et développons des applications desktop robustes, performantes et intuitives pour toutes les plateformes.", longDesc: "JUDDEV CORPORATION développe des applications de bureau sur mesure répondant aux besoins métier les plus exigeants. Qu'il s'agisse d'un outil de gestion interne, d'un logiciel de traitement de données ou d'une solution métier complète, nous utilisons les technologies modernes pour créer des applications desktop fiables, rapides et maintenables.", features: ['Applications Windows, Mac & Linux', 'Interfaces graphiques modernes (GUI)', 'Accès aux ressources système (fichiers, réseau, matériel)', 'Synchronisation avec des services cloud', 'Mise à jour automatique', 'Installation et packaging professionnel', 'Support et maintenance continue'], technologies: ['Electron', 'Python (PyQt, Tkinter)', 'C# (.NET / WPF)', 'Java (JavaFX)', 'Rust (Tauri)', 'C++'], category: 'desktop', order: 9 }
      ]);
      console.log('✅ Services initialisés');
    }
  } catch (e) { console.warn('⚠️  Auto-seed services:', e.message); }
}

async function seedRealisations() {
  try {
    const Realisation = require('./models/Realisation');
    const count = await Realisation.countDocuments();
    if (count === 0) {
      await Realisation.insertMany([
        { id: 'realisation-1', title: 'Plateforme E-commerce Premium', category: 'E-commerce', service: 'dev-web', sector: 'Commerce', image: 'images/dev1.jpg', images: ['images/dev1.jpg', 'images/dev2.jpg'], shortDesc: "Création d'une plateforme e-commerce complète avec gestion des stocks, paiements en ligne et interface d'administration avancée.", longDesc: "Ce projet ambitieux consistait à créer une plateforme e-commerce de nouvelle génération. L'interface utilisateur, entièrement repensée, offre une expérience d'achat fluide et intuitive. L'intégration de multiples moyens de paiement et un système de gestion des stocks en temps réel ont été des éléments clés du succès.", client: 'Client Confidentiel', year: '2025', technologies: ['React', 'Next.js', 'Node.js', 'MongoDB', 'Stripe', 'Redis', 'AWS'], url: '#', highlights: ['Taux de conversion +150%', 'Design responsive premium', 'SEO optimisé', '99.9% uptime'], order: 1 },
        { id: 'realisation-2', title: 'Application Mobile de Livraison', category: 'Mobile', service: 'dev-mobile', sector: 'Logistique', image: 'images/dev2.jpg', images: ['images/dev2.jpg', 'images/dev3.jpg'], shortDesc: 'Application mobile complète de gestion et suivi de livraisons en temps réel avec géolocalisation avancée.', longDesc: "Nous avons développé une solution mobile complète pour une startup logistique innovante. L'application comprend trois interfaces : app livreur, app client et dashboard administrateur. La technologie de géolocalisation en temps réel permet un suivi précis des colis.", client: 'StartupLog', year: '2025', technologies: ['React Native', 'Firebase', 'Google Maps API', 'Node.js', 'PostgreSQL'], url: '#', highlights: ['50 000+ utilisateurs', 'GPS en temps réel', 'Push notifications', 'Tournées optimisées -30%'], order: 2 },
        { id: 'realisation-3', title: 'Plateforme SaaS RH', category: 'SaaS', service: 'saas', sector: 'Ressources Humaines', image: 'images/dev3.jpg', images: ['images/dev3.jpg'], shortDesc: 'Solution SaaS complète de gestion des ressources humaines, couvrant le recrutement, la paie et l\'évaluation des performances.', longDesc: "Nous avons développé une plateforme SaaS RH complète destinée aux PME africaines. La solution couvre l'ensemble du cycle de vie employé : recrutement, onboarding, gestion de la paie, suivi des congés, évaluations de performance et reporting RH.", client: 'CorpRH', year: '2024', technologies: ['Vue.js', 'Laravel', 'MySQL', 'Redis', 'AWS S3', 'Stripe'], url: '#', highlights: ['200+ entreprises clientes', 'Multi-tenant sécurisé', 'Paie automatisée', 'Rapports avancés'], order: 3 },
        { id: 'realisation-4', title: "Refonte UI/UX d'une FinTech", category: 'Design', service: 'ux-design', sector: 'Finance', image: 'images/dev4.jpg', images: ['images/dev4.jpg'], shortDesc: "Refonte complète de l'interface utilisateur d'une application fintech, augmentant l'engagement de 200%.", longDesc: "FinCorp nous a confié la refonte totale de son application de gestion financière. Après une phase de recherche utilisateur approfondie, nous avons conçu un nouveau design system complet avec des composants réutilisables et des micro-interactions soignées.", client: 'FinCorp', year: '2025', technologies: ['Figma', 'Framer', 'React', 'Storybook'], url: '#', highlights: ['Engagement +200%', 'Design System complet', 'Note 4.8/5 stores', 'Support -60%'], order: 4 },
        { id: 'realisation-5', title: 'Infrastructure Cloud Sécurisée', category: 'Cloud', service: 'cloud', sector: 'Technologie', image: 'images/dev5.jpg', images: ['images/dev5.jpg'], shortDesc: "Mise en place d'une infrastructure cloud sécurisée, scalable et résiliente pour un groupe technologique international.", longDesc: "TechGroup nous a mandatés pour concevoir et déployer une infrastructure cloud enterprise sur AWS, capable de supporter leur croissance internationale. Nous avons conçu une architecture multi-régions avec failover automatique.", client: 'TechGroup International', year: '2024', technologies: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'Datadog', 'GitHub Actions'], url: '#', highlights: ['99.99% disponibilité', 'Déploiement 15min vs 3 jours', 'Coûts cloud -35%', 'Multi-régions'], order: 5 },
        { id: 'realisation-6', title: 'MVP Application Santé', category: 'MVP', service: 'mvp', sector: 'Santé', image: 'images/dev6.jpg', images: ['images/dev6.jpg', 'images/dev1.jpg'], shortDesc: "Développement MVP d'une application de téléconsultation et suivi médical patient, livré en 10 semaines.", longDesc: "HealthTech nous a sollicités pour développer leur MVP de téléconsultation médicale dans un délai très court. En 10 semaines, nous avons livré une application complète permettant aux patients de prendre des rendez-vous et effectuer des consultations vidéo sécurisées.", client: 'HealthTech Africa', year: '2025', technologies: ['React', 'Node.js', 'MongoDB', 'WebRTC', 'Firebase', 'AWS'], url: '#', highlights: ['Livré en 10 semaines', 'RGPD & HDS compliant', '500+ médecins', '10 000+ patients'], order: 6 }
      ]);
      console.log('✅ Réalisations initialisées');
    }
  } catch (e) { console.warn('⚠️  Auto-seed realisations:', e.message); }
}

async function seedArticles() {
  try {
    const Article = require('./models/Article');
    const count = await Article.countDocuments();
    if (count === 0) {
      await Article.insertMany([
        { id: 'article-1', title: "Comment l'IA révolutionne le développement web en 2025", category: 'Intelligence Artificielle', date: new Date('2026-03-15'), image: 'images/ia.jpg', shortDesc: "Découvrez comment l'intelligence artificielle transforme radicalement les pratiques de développement web.", content: "<h2>L'IA au cœur du développement moderne</h2><p>L'intelligence artificielle transforme chaque étape du cycle de développement. Des assistants de code comme GitHub Copilot aux outils de génération d'interfaces, l'IA change le quotidien des développeurs.</p><p>En 2025, plus de 60% des développeurs professionnels utilisent des outils d'IA au quotidien. Cette adoption massive améliore la productivité, la qualité du code et ouvre de nouvelles perspectives.</p><h2>Les outils IA qui changent la donne</h2><p>GitHub Copilot, Cursor, et Claude sont devenus des co-développeurs indispensables. Des outils comme v0.dev permettent de générer des composants UI complets à partir de descriptions textuelles.</p><blockquote>\"L'IA ne remplace pas les développeurs, elle les rend 10 fois plus productifs.\" - JAYSON STANLEY, CTO JUDDEV CORPORATION</blockquote>", author: 'JAYSON STANLEY', tags: ['IA', 'Web', 'Innovation', 'Développement', 'Productivité'], published: true },
        { id: 'article-2', title: "Les avantages d'une architecture microservices pour les startups", category: 'Architecture', date: new Date('2026-03-02'), image: 'images/dev3.jpg', shortDesc: "Pourquoi les startups en forte croissance devraient envisager d'adopter une architecture microservices dès le départ.", content: "<h2>Monolithe vs Microservices : le grand débat</h2><p>Pour les startups, la question de l'architecture est cruciale : monolithe ou microservices ? De nombreuses startups à fort potentiel de croissance bénéficient d'une architecture microservices dès le départ.</p><h2>Les avantages clés</h2><h3>Scalabilité indépendante</h3><p>Avec les microservices, vous pouvez scaler uniquement les composants qui en ont besoin. Si votre service de recherche est sous charge, vous le scalez indépendamment.</p><h3>Déploiements plus rapides</h3><p>Chaque service peut être déployé indépendamment, réduisant le risque de chaque déploiement.</p><blockquote>\"Le passage aux microservices nous a permis de réduire notre time-to-market de 40%.\" - NGUEYE DURAND, CEO JUDDEV</blockquote>", author: 'NGUEYE DURAND', tags: ['Architecture', 'Microservices', 'Backend', 'Startup', 'Cloud'], published: true },
        { id: 'article-3', title: 'React Native vs Flutter : quel choix pour votre app mobile ?', category: 'Mobile', date: new Date('2026-02-20'), image: 'images/dev2.jpg', shortDesc: 'Comparatif complet et objectif entre React Native et Flutter pour votre projet mobile.', content: "<h2>Le match du cross-platform mobile</h2><p>En 2025, le débat entre React Native et Flutter reste plus vif que jamais. React Native bénéficie d'un vaste écosystème JavaScript, tandis que Flutter offre des performances natives grâce à son moteur de rendu propriétaire.</p><h2>React Native</h2><p>Créé par Meta en 2015, React Native permet aux développeurs JavaScript de créer des applications mobiles natives en utilisant les composants UI natifs de chaque plateforme.</p><h2>Flutter</h2><p>Lancé par Google en 2018, Flutter dessine ses propres widgets avec son moteur graphique Skia/Impeller, offrant une interface identique sur iOS et Android.</p><blockquote>\"Notre choix dépend toujours du projet. React Native pour l'intégration OS, Flutter pour les performances max.\" - FOKOUA STYVE, COO JUDDEV</blockquote>", author: 'FOKOUA STYVE', tags: ['Mobile', 'React Native', 'Flutter', 'iOS', 'Android'], published: true },
        { id: 'article-4', title: 'Cloud computing : stratégie multicloud ou monocloud ?', category: 'Cloud', date: new Date('2026-02-10'), image: 'images/dev5.jpg', shortDesc: 'Analyse approfondie des avantages et inconvénients des approches multicloud vs monocloud.', content: "<h2>L'ère du cloud est là</h2><p>Une décision stratégique majeure se pose : faut-il concentrer son infrastructure chez un seul fournisseur (monocloud) ou diversifier sur plusieurs clouds (multicloud) ?</p><h2>Monocloud : simplicité et optimisation</h2><p>Opter pour un seul fournisseur présente de nombreux avantages : facturation simplifiée, intégration native entre services, une seule équipe à former.</p><h2>Multicloud : résilience et liberté</h2><p>La stratégie multicloud élimine le vendor lock-in, offre une résilience accrue et permet d'utiliser le meilleur de chaque fournisseur.</p><h2>Notre recommandation</h2><p>Commencez par une approche monocloud pour les startups et PME. Une fois atteint une certaine maturité opérationnelle, envisagez un cloud secondaire pour des services spécifiques.</p>", author: 'NGUEYE DURAND', tags: ['Cloud', 'AWS', 'Azure', 'GCP', 'Infrastructure', 'DevOps'], published: true },
        { id: 'article-5', title: "UX Design : les principes clés pour une expérience utilisateur optimale", category: 'Design', date: new Date('2026-02-01'), image: 'images/dev4.jpg', shortDesc: "Les fondamentaux incontournables du UX Design pour créer des interfaces intuitives et qui convertissent.", content: "<h2>Pourquoi l'UX Design est critique</h2><p>Dans un marché digital saturé, l'expérience utilisateur est le principal facteur de différenciation. Chaque dollar investi dans l'UX génère en moyenne 100 dollars de retour.</p><h2>Les principes fondamentaux</h2><h3>1. Centrez votre design sur l'utilisateur</h3><p>Le Human-Centered Design doit être au cœur de toute démarche UX. Commencez par comprendre vos utilisateurs : leurs besoins, douleurs et objectifs.</p><h3>2. Simplifiez</h3><p>La complexité est l'ennemi de l'expérience utilisateur. Chaque écran doit avoir un objectif clair.</p><h3>3. Cohérence et prévisibilité</h3><p>Les utilisateurs n'aiment pas les surprises. Un Design System bien construit est la clé.</p><blockquote>\"Le meilleur design, c'est celui que l'utilisateur ne remarque pas.\" - JAYSON STANLEY, CTO JUDDEV</blockquote>", author: 'JAYSON STANLEY', tags: ['UX Design', 'UI', 'Interface', 'Conversion'], published: true },
        { id: 'article-6', title: "Développement MVP : de l'idée au produit en 3 mois", category: 'Startup', date: new Date('2026-01-20'), image: 'images/dev6.jpg', shortDesc: "Guide complet pour développer un MVP efficace et le lancer rapidement sans brûler votre budget.", content: "<h2>Qu'est-ce qu'un MVP vraiment ?</h2><p>Un MVP est la version d'un produit qui permet de collecter le maximum d'apprentissages validés sur les clients avec le minimum d'effort. \"Minimum\" ne signifie pas \"médiocre\" : un MVP doit être utilisable par de vrais utilisateurs.</p><h2>Les 5 étapes pour un MVP réussi</h2><h3>1. Définir le problème (Semaine 1-2)</h3><p>Interviewez au minimum 20 clients potentiels avant de commencer.</p><h3>2. Prioriser le scope</h3><p>Soyez impitoyable : tout ce qui ne teste pas vos hypothèses clés doit être exclu.</p><h3>3. Développement agile (Semaine 3-10)</h3><p>Travaillez en sprints de 2 semaines avec des livraisons itératives.</p><h3>4. Lancement et apprentissage</h3><p>Lancez rapidement. La perfection est l'ennemi du lancement.</p><blockquote>\"Notre record : 6 semaines de la signature du contrat au lancement en production.\" - FOKOUA STYVE, COO JUDDEV</blockquote>", author: 'FOKOUA STYVE', tags: ['MVP', 'Startup', 'Lean Startup', 'Product', 'Agilité'], published: true }
      ]);
      console.log('✅ Articles initialisés');
    }
  } catch (e) { console.warn('⚠️  Auto-seed articles:', e.message); }
}

async function seedFormations() {
  try {
    const Formation = require('./models/Formation');
    const count = await Formation.countDocuments();
    if (count === 0) {
      await Formation.insertMany([
        { id: 'formation-web', title: 'Développement Web Full Stack', duration: '3 mois', level: 'Débutant à Avancé', price: 'Sur devis', description: 'Formation intensive et complète en développement web full stack couvrant les technologies frontend et backend les plus demandées du marché.', program: ['HTML5 & CSS3 avancé, Flexbox, Grid', 'JavaScript ES6+ et TypeScript', 'React.js et Next.js', 'Node.js, Express & REST APIs', 'Bases de données SQL & NoSQL', 'Git, GitHub et workflows CI/CD', 'Déploiement cloud (Vercel, Railway, AWS)', 'Projet final certifiant'], icon: '💻', order: 1 },
        { id: 'formation-mobile', title: 'Développement Mobile Cross-Platform', duration: '2 mois', level: 'Intermédiaire', price: 'Sur devis', description: "Maîtrisez le développement d'applications mobiles cross-platform avec React Native ou Flutter.", program: ['Fondamentaux React Native / Flutter', "Navigation et gestion d'état", 'Consommation d\'APIs REST', 'Stockage local et base de données mobile', 'Géolocalisation et APIs natives', 'Animations et UI avancée', 'Tests et débogage', 'Publication App Store & Google Play'], icon: '📱', order: 2 },
        { id: 'formation-uxui', title: 'UI/UX Design Professionnel', duration: '6 semaines', level: 'Tous niveaux', price: 'Sur devis', description: 'Devenez designer UI/UX professionnel. Maîtrisez les outils, méthodes et processus pour créer des interfaces engageantes.', program: ['Principes du design graphique', 'Figma : de débutant à expert', 'Design Thinking et UX Research', "Wireframing et architecture d'information", 'Prototypage interactif avancé', 'Design System et composants', "Tests d'utilisabilité", 'Portfolio et présentation clients'], icon: '🎨', order: 3 },
        { id: 'formation-cloud', title: 'Cloud Computing & DevOps', duration: '2 mois', level: 'Avancé', price: 'Sur devis', description: 'Maîtrisez les outils et pratiques DevOps modernes : AWS, Docker, Kubernetes, CI/CD et Infrastructure as Code.', program: ['AWS fondamentaux (EC2, S3, RDS, Lambda)', 'Conteneurisation avec Docker', 'Orchestration Kubernetes', 'CI/CD avec GitHub Actions', 'Infrastructure as Code avec Terraform', 'Monitoring et observabilité', 'Sécurité cloud et bonnes pratiques', 'Préparation certification AWS'], icon: '☁️', order: 4 },
        { id: 'formation-ia', title: 'Intelligence Artificielle & Machine Learning', duration: '3 mois', level: 'Intermédiaire à Avancé', price: 'Sur devis', description: "Plongez dans le monde de l'IA et du Machine Learning. De Python aux LLMs, devenez opérationnel sur les technologies IA les plus demandées.", program: ["Python pour la Data Science et l'IA", 'Machine Learning avec Scikit-learn', 'Deep Learning avec TensorFlow/PyTorch', 'Traitement du langage naturel (NLP)', 'LLMs et API OpenAI / Anthropic', 'LangChain et agents IA', 'Déploiement de modèles ML', 'Projets pratiques et portfolio'], icon: '🤖', order: 5 }
      ]);
      console.log('✅ Formations initialisées');
    }
  } catch (e) { console.warn('⚠️  Auto-seed formations:', e.message); }
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

async function seedDesktopService() {
  try {
    const Service = require('./models/Service');
    const exists = await Service.findOne({ id: 'desktop-app' });
    if (!exists) {
      await Service.create({
        id: 'desktop-app',
        title: 'Application Desktop',
        subtitle: 'Logiciels puissants pour Windows, Mac et Linux',
        icon: '🖥️',
        image: 'images/ordi9-removebg-preview.png',
        shortDesc: "Nous concevons et développons des applications desktop robustes, performantes et intuitives pour toutes les plateformes.",
        longDesc: "JUDDEV CORPORATION développe des applications de bureau sur mesure répondant aux besoins métier les plus exigeants. Qu'il s'agisse d'un outil de gestion interne, d'un logiciel de traitement de données ou d'une solution métier complète, nous utilisons les technologies modernes pour créer des applications desktop fiables, rapides et maintenables. Nos applications sont compatibles Windows, Mac et Linux, et peuvent se synchroniser avec des services cloud pour un usage hybride optimal.",
        features: ['Applications Windows, Mac & Linux', 'Interfaces graphiques modernes (GUI)', 'Accès aux ressources système (fichiers, réseau, matériel)', 'Synchronisation avec des services cloud', 'Mise à jour automatique', 'Installation et packaging professionnel', 'Support et maintenance continue'],
        technologies: ['Electron', 'Python (PyQt, Tkinter)', 'C# (.NET / WPF)', 'Java (JavaFX)', 'Rust (Tauri)', 'C++'],
        category: 'desktop',
        order: 9
      });
      console.log('✅ Service Application Desktop ajouté');
    }
  } catch (e) { console.warn('⚠️  Application Desktop seed:', e.message); }
}

async function seedFAQs() {
  try {
    const FAQ = require('./models/FAQ');
    const count = await FAQ.countDocuments();
    if (count === 0) {
      await FAQ.insertMany([
        { id: 'faq-1', question: 'Combien coûte un site web ou une application ?', answer: 'Le coût varie selon la complexité, les fonctionnalités et les délais de chaque projet. Chaque solution étant unique, nous établissons un devis personnalisé adapté à vos besoins et votre budget. Contactez-nous pour une estimation gratuite et sans engagement.', order: 1 },
        { id: 'faq-2', question: 'Comment se passe le processus de développement ?', answer: 'Nous suivons une approche en 4 étapes : <strong>1) Analyse des besoins</strong> et cahier des charges, <strong>2) Design & prototypage</strong> soumis à validation, <strong>3) Développement itératif</strong> avec points réguliers, <strong>4) Tests, livraison et formation</strong>.', order: 2 },
        { id: 'faq-3', question: 'Quels sont vos délais de livraison ?', answer: 'Les délais dépendent de la complexité : <strong>Site vitrine</strong> : 2-4 semaines · <strong>Application web</strong> : 4-12 semaines · <strong>Application mobile</strong> : 6-16 semaines · <strong>MVP</strong> : 8-12 semaines. Nous vous donnons un planning précis lors du devis.', order: 3 },
        { id: 'faq-4', question: 'Proposez-vous des contrats de maintenance ?', answer: 'Oui, nous proposons des contrats de maintenance mensuels qui incluent les mises à jour de sécurité, la surveillance des performances, les correctifs de bugs et un support prioritaire. Nos tarifs sont adaptés à la taille et aux besoins de chaque projet.', order: 4 },
        { id: 'faq-5', question: 'Travaillez-vous avec des clients hors Cameroun ?', answer: 'Absolument ! Nous collaborons avec des clients partout en Afrique et dans le monde. Nos outils de communication (Slack, Teams, Zoom) et notre méthodologie de travail à distance nous permettent de collaborer efficacement avec n\'importe quel fuseau horaire.', order: 5 },
        { id: 'faq-6', question: 'Quelle technologie utilisez-vous pour mes projets ?', answer: 'Nous choisissons la technologie la mieux adaptée à votre projet. Pour le web : React, Next.js, Node.js, Laravel. Pour le mobile : React Native, Flutter. Pour le cloud : AWS, GCP, Azure. Pour l\'IA : Python, TensorFlow, OpenAI API. Chaque choix est justifié et documenté.', order: 6 }
      ]);
      console.log('✅ FAQs initialisées');
    }
  } catch (e) { console.warn('⚠️  Auto-seed FAQs:', e.message); }
}

async function start() {
  try {
    const mongoURI = await getMongoURI();
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connecté');

    // Auto-create admin user if not exists
    await seedAdmin();
    await seedServices();
    await seedRealisations();
    await seedArticles();
    await seedFormations();
    await seedTeam();
    await seedPartners();
    await seedDesktopService();
    await seedFAQs();

    app.listen(PORT, () => {
      console.log(`\n🚀 JUDDEV Backend running on http://localhost:${PORT}`);
      console.log(`📱 Vitrine: http://localhost:${PORT}`);
      console.log(`🔧 Dashboard: http://localhost:${PORT}/admin/login.html`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
      console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
      console.log(`📧 SMTP configuré: ${process.env.SMTP_PASS && process.env.SMTP_PASS !== 'your_gmail_app_password_here' ? '✅ OUI (' + (process.env.SMTP_USER || '?') + ')' : '❌ NON (emails désactivés)'}\n`);

      // Keep-alive: ping toutes les 14 min pour éviter le sleep sur Render free tier
      if (process.env.NODE_ENV === 'production') {
        const siteUrl = process.env.FRONTEND_URL || `https://juddev-backend.onrender.com`;
        setInterval(async () => {
          try {
            await fetch(siteUrl + '/api/health');
            console.log('💓 Keep-alive ping OK');
          } catch (e) {
            console.warn('💓 Keep-alive ping failed:', e.message);
          }
        }, 14 * 60 * 1000);
        console.log('💓 Keep-alive activé (ping toutes les 14 min)');
      }
    });
  } catch (err) {
    console.error('❌ Erreur de démarrage:', err.message);
    process.exit(1);
  }
}

start();
