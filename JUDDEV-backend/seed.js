require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Service = require('./models/Service');
const Realisation = require('./models/Realisation');
const Article = require('./models/Article');
const Formation = require('./models/Formation');
const ContactInfo = require('./models/ContactInfo');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/juddev';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connecté');

    // ---- ADMIN USER ----
    const adminEmail = process.env.ADMIN_EMAIL || 'juddevcorporation03@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'SLACKMWjuddev03';

    const existingUser = await User.findOne({ email: adminEmail });
    if (!existingUser) {
      await User.create({ email: adminEmail, password: adminPassword, role: 'admin' });
      console.log('✅ Admin créé:', adminEmail);
    } else {
      // Update password in case it changed
      existingUser.password = adminPassword;
      await existingUser.save();
      console.log('✅ Admin mis à jour:', adminEmail);
    }

    // ---- SERVICES ----
    const services = [
      { id: 'dev-web', title: 'Développement Web', subtitle: 'Maîtrisez votre présence en ligne', icon: '<i class="fas fa-code"></i>', image: 'images/dev1.jpg', shortDesc: 'Nous créons des sites et applications web modernes, performants et responsive qui captivent vos visiteurs et boostent votre croissance.', longDesc: 'Chez JUDDEV CORPORATION, nous concevons et développons des applications web de haute performance, alliant excellence technique et design soigné.', features: ['Sites vitrine & landing pages performants', 'Applications web complexes (SPA, PWA)', 'E-commerce et boutiques en ligne', 'API REST & GraphQL', 'Intégration CMS (WordPress, Strapi)', 'Optimisation SEO technique avancée'], technologies: ['React', 'Vue.js', 'Next.js', 'Node.js', 'PHP', 'Laravel', 'WordPress', 'PostgreSQL'], category: 'web', order: 1 },
      { id: 'dev-mobile', title: "Développement d'Applications Mobiles", subtitle: "Maîtriser l'innovation", icon: '<i class="fas fa-mobile-alt"></i>', image: 'images/dev2.jpg', shortDesc: "Développement d'applications mobiles cross-platform et natives pour startups, entreprises et organismes.", longDesc: 'JUDDEV CORPORATION développe des applications mobiles innovantes pour iOS et Android, alliant performance technique et expérience utilisateur optimale.', features: ['Applications iOS et Android cross-platform', 'Développement React Native & Flutter', 'Développement natif (Java, Swift, Kotlin)', 'Géolocalisation et cartographie', 'Notifications push en temps réel', 'Publication App Store & Google Play'], technologies: ['React Native', 'Flutter', 'Java', 'Kotlin', 'Swift', 'Firebase', 'Redux', 'SQLite'], category: 'mobile', order: 2 },
      { id: 'saas', title: 'Ingénierie des Produits SaaS', subtitle: 'Des solutions sur mesure à grande échelle', icon: '<i class="fas fa-layer-group"></i>', image: 'images/dev3.jpg', shortDesc: 'Nous créons des plateformes SaaS personnalisées, robustes et scalables, servant des milliers d\'utilisateurs simultanément.', longDesc: 'Nous concevons et développons des produits SaaS complets, depuis l\'architecture système jusqu\'au déploiement en production.', features: ['Architecture multi-tenant sécurisée', 'Gestion des abonnements et facturation', 'Tableaux de bord et analytics avancés', 'API publique documentée', 'Haute disponibilité (99.9% uptime)'], technologies: ['Vue.js', 'React', 'Node.js', 'Laravel', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'], category: 'cloud', order: 3 },
      { id: 'ux-design', title: 'Expérience Numérique & UI/UX', subtitle: "Design centré sur l'humain", icon: '<i class="fas fa-pen-nib"></i>', image: 'images/dev4.jpg', shortDesc: "Nous créons des interfaces utilisateur intuitives et des expériences digitales engageantes qui convertissent.", longDesc: 'Notre studio de design créé des interfaces numériques qui allient esthétique et fonctionnalité.', features: ['Research utilisateur & personas', 'Wireframing et prototypage interactif', 'Design System et bibliothèque UI', 'UI design haute fidélité', 'Micro-interactions et animations'], technologies: ['Figma', 'Adobe XD', 'Sketch', 'InVision', 'Webflow', 'Framer', 'Principle', 'Zeplin'], category: 'design', order: 4 },
      { id: 'cloud', title: 'Ingénierie du Cloud', subtitle: 'Infrastructure scalable et fiable', icon: '<i class="fas fa-cloud"></i>', image: 'images/dev5.jpg', shortDesc: 'Notre équipe conçoit et gère des systèmes cloud sécurisés, garantissant fiabilité et performance maximale.', longDesc: 'JUDDEV CORPORATION vous accompagne dans votre migration et gestion cloud avec une expertise reconnue.', features: ['Architecture cloud multi-région', 'Infrastructure as Code (Terraform, Ansible)', 'CI/CD pipelines automatisés', 'Monitoring et observabilité', 'Sécurité cloud et Zero Trust'], technologies: ['AWS', 'Azure', 'GCP', 'Terraform', 'Docker', 'Kubernetes', 'Ansible', 'GitHub Actions'], category: 'cloud', order: 5 },
      { id: 'mvp', title: 'Développement MVP', subtitle: "De l'idée au produit rapidement", icon: '<i class="fas fa-rocket"></i>', image: 'images/dev6.jpg', shortDesc: "Nous transformons les idées à fort potentiel en produits MVP, prêts à déployer en un temps record.", longDesc: 'Notre service MVP est conçu pour les startups et entrepreneurs qui veulent valider leur idée rapidement.', features: ['Workshop de définition du MVP', 'Design UX/UI complet en 1 semaine', 'Développement agile par sprints', 'Intégration paiements et authentification', 'Déploiement et mise en production'], technologies: ['React', 'Next.js', 'Node.js', 'MongoDB', 'Firebase', 'Stripe', 'Vercel', 'Railway'], category: 'web', order: 6 },
      { id: 'marketing-digital', title: 'Marketing Digital & SEO', subtitle: 'Visibilité et croissance en ligne', icon: '<i class="fas fa-chart-line"></i>', image: 'images/ia.jpg', shortDesc: 'Stratégies digitales complètes pour augmenter votre visibilité en ligne et convertir efficacement.', longDesc: 'Notre équipe marketing digital combine expertise technique et créativité pour propulser votre présence en ligne.', features: ['Audit SEO complet et technique', 'Campagnes Google Ads', 'Publicités Meta, LinkedIn, TikTok', 'Email marketing et automation', 'Analytics et reporting mensuel'], technologies: ['Google Ads', 'Meta Ads', 'Google Analytics 4', 'SEMrush', 'Mailchimp', 'HubSpot', 'Hotjar', 'Zapier'], category: 'marketing', order: 7 },
      { id: 'ia-solutions', title: 'Solutions IA & Automatisation', subtitle: "Intelligence artificielle au service de votre croissance", icon: '<i class="fas fa-brain"></i>', image: 'images/ia.jpg', shortDesc: "Intégration de l'IA et automatisation intelligente des processus métier pour maximiser votre productivité.", longDesc: 'JUDDEV CORPORATION est à la pointe de l\'intégration de l\'intelligence artificielle dans les processus métier.', features: ["Intégration d'APIs IA (OpenAI, Anthropic)", 'Développement de chatbots intelligents', 'Automatisation de workflows métier', 'Traitement du langage naturel (NLP)', 'Systèmes de recommandation'], technologies: ['Python', 'TensorFlow', 'PyTorch', 'OpenAI API', 'LangChain', 'Hugging Face', 'FastAPI', 'n8n'], category: 'ia', order: 8 }
    ];

    for (const s of services) {
      await Service.findOneAndUpdate({ id: s.id }, s, { upsert: true, new: true });
    }
    console.log('✅ Services créés/mis à jour:', services.length);

    // ---- REALISATIONS ----
    const realisations = [
      { id: 'realisation-1', title: 'Plateforme E-commerce Premium', category: 'E-commerce', service: 'dev-web', sector: 'Commerce', image: 'images/dev1.jpg', images: ['images/dev1.jpg'], shortDesc: 'Plateforme e-commerce complète avec gestion stocks, paiements en ligne et interface d\'administration.', longDesc: 'Ce projet ambitieux consistait à créer une plateforme e-commerce de nouvelle génération. Architecture microservices, +150% taux de conversion.', client: 'Client Confidentiel', year: '2025', technologies: ['React', 'Next.js', 'Node.js', 'MongoDB', 'Stripe', 'Redis', 'AWS'], url: '#', highlights: ['Taux de conversion +150%', 'Design responsive premium', 'SEO optimisé', '99.9% uptime'], order: 1 },
      { id: 'realisation-2', title: 'Application Mobile de Livraison', category: 'Mobile', service: 'dev-mobile', sector: 'Logistique', image: 'images/dev2.jpg', images: ['images/dev2.jpg'], shortDesc: 'Application mobile complète de gestion et suivi de livraisons en temps réel avec géolocalisation avancée.', longDesc: 'Solution mobile complète pour une startup logistique. Trois interfaces: livreur, client, dashboard admin. 50,000+ utilisateurs actifs.', client: 'StartupLog', year: '2025', technologies: ['React Native', 'Firebase', 'Google Maps API', 'Node.js', 'PostgreSQL'], url: '#', highlights: ['50 000+ utilisateurs', 'GPS en temps réel', 'Push notifications', 'Tournées optimisées -30%'], order: 2 },
      { id: 'realisation-3', title: 'Plateforme SaaS RH', category: 'SaaS', service: 'saas', sector: 'Ressources Humaines', image: 'images/dev3.jpg', images: ['images/dev3.jpg'], shortDesc: 'Solution SaaS complète de gestion RH couvrant recrutement, paie et évaluation des performances.', longDesc: 'Plateforme SaaS RH pour PME africaines. 200+ entreprises clientes, 15,000 employés actifs.', client: 'CorpRH', year: '2024', technologies: ['Vue.js', 'Laravel', 'MySQL', 'Redis', 'AWS S3', 'Stripe'], url: '#', highlights: ['200+ entreprises clientes', 'Multi-tenant sécurisé', 'Paie automatisée', 'Rapports avancés'], order: 3 },
      { id: 'realisation-4', title: 'Refonte UI/UX d\'une FinTech', category: 'Design', service: 'ux-design', sector: 'Finance', image: 'images/dev4.jpg', images: ['images/dev4.jpg'], shortDesc: 'Refonte complète de l\'interface d\'une application fintech, augmentant l\'engagement de 200%.', longDesc: 'Refonte totale de l\'application FinCorp. Recherche utilisateur, nouveau design system, micro-interactions. Engagement +200%.', client: 'FinCorp', year: '2025', technologies: ['Figma', 'Framer', 'React', 'Storybook'], url: '#', highlights: ['Engagement +200%', 'Design System complet', 'Note 4.8/5 stores', 'Support -60%'], order: 4 },
      { id: 'realisation-5', title: 'Infrastructure Cloud Sécurisée', category: 'Cloud', service: 'cloud', sector: 'Technologie', image: 'images/dev5.jpg', images: ['images/dev5.jpg'], shortDesc: 'Infrastructure cloud sécurisée, scalable et résiliente pour un groupe technologique international.', longDesc: 'Architecture cloud enterprise sur AWS multi-régions. 99.99% uptime, déploiement 15min vs 3 jours.', client: 'TechGroup International', year: '2024', technologies: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'Datadog', 'GitHub Actions'], url: '#', highlights: ['99.99% disponibilité', 'Déploiement 15min vs 3 jours', 'Coûts cloud -35%', 'Multi-régions'], order: 5 },
      { id: 'realisation-6', title: 'MVP Application Santé', category: 'MVP', service: 'mvp', sector: 'Santé', image: 'images/dev6.jpg', images: ['images/dev6.jpg'], shortDesc: 'MVP d\'une application de téléconsultation et suivi médical, livré en 10 semaines.', longDesc: 'MVP de téléconsultation médicale en 10 semaines. RGPD-compliant, 500+ médecins, 10,000+ patients.', client: 'HealthTech Africa', year: '2025', technologies: ['React', 'Node.js', 'MongoDB', 'WebRTC', 'Firebase', 'AWS'], url: '#', highlights: ['Livré en 10 semaines', 'RGPD & HDS compliant', '500+ médecins', '10 000+ patients'], order: 6 }
    ];

    for (const r of realisations) {
      await Realisation.findOneAndUpdate({ id: r.id }, r, { upsert: true, new: true });
    }
    console.log('✅ Réalisations créées/mises à jour:', realisations.length);

    // ---- ARTICLES ----
    const articles = [
      { id: 'article-1', title: "Comment l'IA révolutionne le développement web en 2025", category: 'Intelligence Artificielle', date: new Date('2026-03-15'), image: 'images/ia.jpg', shortDesc: "Découvrez comment l'intelligence artificielle transforme radicalement les pratiques de développement web.", content: '<h2>L\'IA au cœur du développement moderne</h2><p>L\'intelligence artificielle n\'est plus une technologie du futur : elle est aujourd\'hui au cœur des pratiques de développement web les plus avancées. Des assistants de code comme GitHub Copilot aux outils de génération d\'interfaces, l\'IA transforme chaque étape du cycle de développement.</p><h2>Les outils IA qui changent la donne</h2><p>GitHub Copilot, Cursor, Claude sont devenus des co-développeurs indispensables. Des outils comme v0.dev permettent de générer des composants UI complets à partir de descriptions textuelles.</p><blockquote>"L\'IA ne remplace pas les développeurs, elle les rend 10 fois plus productifs." - JAYSON STANLEY, CTO JUDDEV</blockquote><h2>L\'avenir du développement web avec l\'IA</h2><p>Les perspectives pour 2026 sont ambitieuses. Chez JUDDEV CORPORATION, nous intégrons ces technologies de pointe dans nos processus.</p>', author: 'JAYSON STANLEY', tags: ['IA', 'Web', 'Innovation', 'Développement', 'Productivité'] },
      { id: 'article-2', title: "Les avantages d'une architecture microservices pour les startups", category: 'Architecture', date: new Date('2026-03-02'), image: 'images/dev3.jpg', shortDesc: 'Pourquoi les startups en forte croissance devraient envisager une architecture microservices.', content: '<h2>Monolithe vs Microservices</h2><p>L\'un des débats les plus animés dans le monde du développement est la question de l\'architecture. Pour les startups, cette décision est cruciale.</p><h3>1. Scalabilité indépendante</h3><p>Avec les microservices, vous pouvez scaler uniquement les composants qui en ont besoin.</p><h3>2. Déploiements plus rapides</h3><p>Chaque service peut être déployé indépendamment, réduisant le risque de chaque déploiement.</p><blockquote>"Pour notre plateforme SaaS, le passage aux microservices nous a permis de réduire notre time-to-market de 40%." - NGUEYE DURAND, CEO JUDDEV</blockquote>', author: 'NGUEYE DURAND', tags: ['Architecture', 'Microservices', 'Backend', 'Startup', 'Cloud'] },
      { id: 'article-3', title: 'React Native vs Flutter : quel choix pour votre app mobile ?', category: 'Mobile', date: new Date('2026-02-20'), image: 'images/dev2.jpg', shortDesc: 'Comparatif complet entre React Native et Flutter pour votre projet mobile.', content: '<h2>Le match du cross-platform mobile</h2><p>Choisir le bon framework pour son application mobile est une décision stratégique. En 2025, React Native et Flutter restent les deux alternatives majeures.</p><h2>React Native : la maturité JavaScript</h2><p>Créé par Meta, React Native permet aux développeurs JavaScript de créer des applications mobiles natives. Vaste communauté, fort écosystème npm.</p><h2>Flutter : les performances de Dart</h2><p>Lancé par Google, Flutter offre des performances exceptionnelles grâce à son moteur graphique propriétaire Skia/Impeller.</p><blockquote>"Notre choix dépend toujours du projet et de l\'équipe." - FOKOUA STYVE, COO JUDDEV</blockquote>', author: 'FOKOUA STYVE', tags: ['Mobile', 'React Native', 'Flutter', 'iOS', 'Android'] },
      { id: 'article-4', title: 'Cloud computing : stratégie multicloud ou monocloud ?', category: 'Cloud', date: new Date('2026-02-10'), image: 'images/dev5.jpg', shortDesc: 'Analyse des avantages des approches multicloud vs monocloud.', content: '<h2>L\'ère du cloud est là</h2><p>Le cloud computing est devenu incontournable. La décision monocloud vs multicloud est stratégique.</p><h2>Approche monocloud : simplicité</h2><p>Un seul fournisseur (AWS, Azure ou GCP) : facturation simplifiée, moins de complexité opérationnelle.</p><h2>Approche multicloud : résilience</h2><p>Plusieurs fournisseurs : élimination du vendor lock-in, utilisation du "best of breed" de chaque fournisseur.</p>', author: 'NGUEYE DURAND', tags: ['Cloud', 'AWS', 'Azure', 'GCP', 'Infrastructure'] },
      { id: 'article-5', title: 'UX Design : les principes clés pour une expérience optimale', category: 'Design', date: new Date('2026-02-01'), image: 'images/dev4.jpg', shortDesc: 'Les fondamentaux du UX Design pour créer des interfaces intuitives et engageantes.', content: '<h2>Pourquoi l\'UX Design est critique</h2><p>Dans un marché digital saturé, l\'expérience utilisateur est devenue le principal facteur de différenciation. Chaque dollar investi dans l\'UX génère en moyenne 100 dollars de retour.</p><h2>Les principes fondamentaux</h2><h3>1. Centrez votre design sur l\'utilisateur</h3><p>Le Human-Centered Design doit être au cœur de toute démarche UX.</p><h3>2. Simplifiez</h3><p>La complexité est l\'ennemi de l\'expérience utilisateur.</p><blockquote>"Le meilleur design, c\'est celui que l\'utilisateur ne remarque pas." - JAYSON STANLEY, CTO JUDDEV</blockquote>', author: 'JAYSON STANLEY', tags: ['UX Design', 'UI', 'Expérience utilisateur', 'Conversion'] },
      { id: 'article-6', title: "Développement MVP : de l'idée au produit en 3 mois", category: 'Startup', date: new Date('2026-01-20'), image: 'images/dev6.jpg', shortDesc: 'Guide complet pour développer un MVP efficace et le lancer rapidement.', content: '<h2>Qu\'est-ce qu\'un MVP ?</h2><p>Le MVP (Minimum Viable Product) est la version d\'un produit permettant de collecter le maximum d\'apprentissages validés avec le minimum d\'effort.</p><h2>Les 5 étapes pour un MVP réussi</h2><h3>1. Définir le problème (Semaine 1-2)</h3><p>Avant d\'écrire une ligne de code, clarifiez le problème. Interviewez au minimum 20 clients potentiels.</p><h3>2. Prioriser le scope (Semaine 2-3)</h3><p>Utilisez la matrice Valeur/Effort pour identifier les fonctionnalités essentielles.</p><blockquote>"Notre record : 6 semaines de la signature au lancement en production." - FOKOUA STYVE, COO</blockquote>', author: 'FOKOUA STYVE', tags: ['MVP', 'Startup', 'Lean Startup', 'Product'] }
    ];

    for (const a of articles) {
      await Article.findOneAndUpdate({ id: a.id }, a, { upsert: true, new: true });
    }
    console.log('✅ Articles créés/mis à jour:', articles.length);

    // ---- FORMATIONS ----
    const formations = [
      { id: 'formation-web', title: 'Développement Web Full Stack', duration: '3 mois', level: 'Débutant à Avancé', price: 'Sur devis', description: 'Formation intensive en développement web full stack couvrant les technologies les plus demandées.', program: ['HTML5 & CSS3 avancé, Flexbox, Grid', 'JavaScript ES6+ et TypeScript', 'React.js et Next.js', 'Node.js, Express & REST APIs', 'Bases de données SQL & NoSQL', 'Git, GitHub et workflows CI/CD', 'Déploiement cloud (Vercel, Railway, AWS)', 'Projet final certifiant'], icon: '💻', order: 1 },
      { id: 'formation-mobile', title: 'Développement Mobile Cross-Platform', duration: '2 mois', level: 'Intermédiaire', price: 'Sur devis', description: 'Maîtrisez le développement d\'applications mobiles avec React Native ou Flutter.', program: ['Fondamentaux React Native / Flutter', 'Navigation et gestion d\'état', 'Consommation d\'APIs REST', 'Stockage local et base de données mobile', 'Géolocalisation et APIs natives', 'Animations et UI avancée', 'Tests et débogage', 'Publication App Store & Google Play'], icon: '📱', order: 2 },
      { id: 'formation-uxui', title: 'UI/UX Design Professionnel', duration: '6 semaines', level: 'Tous niveaux', price: 'Sur devis', description: 'Devenez designer UI/UX professionnel. Maîtrisez les outils, méthodes et processus.', program: ['Principes du design graphique', 'Figma : de débutant à expert', 'Design Thinking et UX Research', 'Wireframing et architecture d\'information', 'Prototypage interactif avancé', 'Design System et composants', 'Tests d\'utilisabilité', 'Portfolio et présentation clients'], icon: '🎨', order: 3 },
      { id: 'formation-cloud', title: 'Cloud Computing & DevOps', duration: '2 mois', level: 'Avancé', price: 'Sur devis', description: 'Maîtrisez les outils DevOps modernes : AWS, Docker, Kubernetes, CI/CD.', program: ['AWS fondamentaux (EC2, S3, RDS, Lambda)', 'Conteneurisation avec Docker', 'Orchestration Kubernetes', 'CI/CD avec GitHub Actions', 'Infrastructure as Code avec Terraform', 'Monitoring et observabilité', 'Sécurité cloud et bonnes pratiques', 'Préparation certification AWS'], icon: '☁️', order: 4 },
      { id: 'formation-ia', title: 'Intelligence Artificielle & Machine Learning', duration: '3 mois', level: 'Intermédiaire à Avancé', price: 'Sur devis', description: 'Plongez dans le monde de l\'IA et du ML. Devenez opérationnel sur les technologies IA.', program: ['Python pour la Data Science et l\'IA', 'Machine Learning avec Scikit-learn', 'Deep Learning avec TensorFlow/PyTorch', 'Traitement du langage naturel (NLP)', 'LLMs et API OpenAI / Anthropic', 'LangChain et agents IA', 'Déploiement de modèles ML', 'Projets pratiques et portfolio'], icon: '🤖', order: 5 }
    ];

    for (const f of formations) {
      await Formation.findOneAndUpdate({ id: f.id }, f, { upsert: true, new: true });
    }
    console.log('✅ Formations créées/mises à jour:', formations.length);

    // ---- CONTACT INFO ----
    let contactInfo = await ContactInfo.findOne();
    if (!contactInfo) {
      await new ContactInfo({
        email: 'contact@juddev.com',
        phone: '+237 6XX XXX XXX',
        address: 'Yaoundé, Cameroun',
        hours: 'Lun - Ven: 8h00 - 18h00',
        social: { linkedin: '#', twitter: '#', github: '#', instagram: '#' }
      }).save();
      console.log('✅ Contact info créé');
    } else {
      console.log('✅ Contact info déjà existant');
    }

    console.log('\n🎉 Seed terminé avec succès!');
    console.log('📧 Admin:', process.env.ADMIN_EMAIL || 'juddevcorporation03@gmail.com');
    console.log('🔑 Password:', process.env.ADMIN_PASSWORD || 'SLACKMWjuddev03');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur seed:', err.message);
    process.exit(1);
  }
}

seed();
