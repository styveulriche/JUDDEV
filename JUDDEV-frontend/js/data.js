/* ============================================================
   JUDDEV CORPORATION - Site Data
   All data for services, realisations, blog articles, formations
   Stored in localStorage under 'JUDDEV_DATA' key
   ============================================================ */

const JUDDEV_DATA_DEFAULT = {
  services: [
    {
      id: 'dev-web',
      title: 'Développement Web',
      subtitle: 'Maîtrisez votre présence en ligne',
      icon: '<i class="fas fa-code"></i>',
      image: 'images/dev1.jpg',
      shortDesc: 'Nous créons des sites et applications web modernes, performants et responsive qui captivent vos visiteurs et boostent votre croissance.',
      longDesc: 'Chez JUDDEV CORPORATION, nous concevons et développons des applications web de haute performance, alliant excellence technique et design soigné. Notre équipe maîtrise les dernières technologies pour vous offrir des solutions scalables, sécurisées et optimisées pour le référencement. Que vous ayez besoin d\'un site vitrine élégant, d\'une plateforme e-commerce robuste ou d\'une application web complexe, nous transformons votre vision en réalité numérique. Chaque projet bénéficie d\'une approche sur mesure, d\'une architecture solide et d\'une maintenance proactive pour garantir la pérennité de votre investissement.',
      features: [
        'Sites vitrine & landing pages performants',
        'Applications web complexes (SPA, PWA)',
        'E-commerce et boutiques en ligne',
        'API REST & GraphQL',
        'Intégration CMS (WordPress, Strapi)',
        'Optimisation SEO technique avancée',
        'Performance & Core Web Vitals',
        'Tests et assurance qualité',
        'Maintenance et évolutions'
      ],
      technologies: ['React', 'Vue.js', 'Next.js', 'Node.js', 'Python', 'Java', 'WordPress', 'PostgreSQL'],
      category: 'web'
    },
    {
      id: 'dev-mobile',
      title: 'Développement d\'Applications Mobiles',
      subtitle: 'Maîtriser l\'innovation',
      icon: '<i class="fas fa-mobile-alt"></i>',
      image: 'images/dev2.jpg',
      shortDesc: 'Développement d\'applications mobiles cross-platform et natives pour startups, entreprises et organismes gouvernementaux.',
      longDesc: 'JUDDEV CORPORATION développe des applications mobiles innovantes pour iOS et Android, alliant performance technique et expérience utilisateur optimale. Notre expertise couvre le développement cross-platform avec React Native et Flutter, ainsi que le développement natif pour des besoins spécifiques. Nous accompagnons nos clients de la conception à la publication sur les stores, en passant par le développement, les tests et le déploiement. Nos applications sont conçues pour être scalables, sécurisées et maintenues dans le temps. Nous intégrons les meilleures pratiques de l\'industrie pour garantir des applications performantes sur tous les appareils.',
      features: [
        'Applications iOS et Android cross-platform',
        'Développement React Native & Flutter',
        'Développement natif (Java, Swift, Kotlin)',
        'Intégration d\'APIs et services tiers',
        'Géolocalisation et cartographie',
        'Notifications push en temps réel',
        'Mode hors-ligne et synchronisation',
        'Publication App Store & Google Play',
        'Support et maintenance continue'
      ],
      technologies: ['React Native', 'Flutter', 'Java', 'Kotlin', 'Swift', 'Firebase', 'Redux', 'SQLite'],
      category: 'mobile'
    },
    {
      id: 'saas',
      title: 'Ingénierie des Produits SaaS',
      subtitle: 'Des solutions sur mesure à grande échelle',
      icon: '<i class="fas fa-layer-group"></i>',
      image: 'images/dev3.jpg',
      shortDesc: 'Nous créons des plateformes SaaS personnalisées, robustes et scalables, servant des milliers d\'utilisateurs simultanément.',
      longDesc: 'Nous concevons et développons des produits SaaS complets, depuis l\'architecture système jusqu\'au déploiement en production. Notre approche multi-tenant garantit l\'isolation des données et la scalabilité. Nous intégrons les meilleures pratiques DevOps pour des déploiements continus et une haute disponibilité. Nos équipes maîtrisent les architectures microservices, les systèmes de paiement, la gestion des abonnements et les tableaux de bord analytics. Chaque produit est conçu pour grandir avec votre base d\'utilisateurs, avec des performances optimales même sous forte charge.',
      features: [
        'Architecture multi-tenant sécurisée',
        'Gestion des abonnements et facturation',
        'Tableaux de bord et analytics avancés',
        'API publique documentée',
        'Système de rôles et permissions',
        'Intégrations et webhooks',
        'Haute disponibilité (99.9% uptime)',
        'Monitoring et alerting en temps réel',
        'RGPD et conformité sécurité'
      ],
      technologies: ['Vue.js', 'React', 'Node.js', 'Spring Boot', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
      category: 'cloud'
    },
    {
      id: 'ux-design',
      title: 'Expérience Numérique & UI/UX',
      subtitle: 'Design centré sur l\'humain',
      icon: '<i class="fas fa-pen-nib"></i>',
      image: 'images/dev4.jpg',
      shortDesc: 'Nous créons des interfaces utilisateur intuitives et des expériences digitales engageantes qui convertissent les visiteurs en clients.',
      longDesc: 'Notre studio de design créé des interfaces numériques qui allient esthétique et fonctionnalité. Nous pratiquons une approche Human-Centered Design, en commençant par comprendre vos utilisateurs avant de concevoir. Notre processus inclut la recherche utilisateur, l\'architecture de l\'information, le prototypage interactif et les tests d\'utilisabilité. Nous créons des design systems cohérents qui accélèrent le développement et garantissent une expérience uniforme. Chaque interface est optimisée pour la conversion et l\'engagement utilisateur, avec un soin particulier pour l\'accessibilité et la performance.',
      features: [
        'Research utilisateur & personas',
        'Architecture de l\'information & user flows',
        'Wireframing et prototypage interactif',
        'Design System et bibliothèque UI',
        'UI design haute fidélité',
        'Micro-interactions et animations',
        'Tests d\'utilisabilité et A/B testing',
        'Audit UX et recommandations',
        'Handoff développeurs optimisé'
      ],
      technologies: ['Figma', 'Adobe XD', 'Sketch', 'InVision', 'Webflow', 'Framer', 'Principle', 'Zeplin'],
      category: 'design'
    },
    {
      id: 'cloud',
      title: 'Ingénierie du Cloud',
      subtitle: 'Infrastructure scalable et fiable',
      icon: '<i class="fas fa-cloud"></i>',
      image: 'images/dev5.jpg',
      shortDesc: 'Notre équipe conçoit et gère des systèmes cloud sécurisés, garantissant fiabilité, performance et capacité évolutive maximale.',
      longDesc: 'JUDDEV CORPORATION vous accompagne dans votre migration et gestion cloud avec une expertise reconnue sur les principales plateformes (AWS, Azure, GCP). Nous concevons des architectures résilientes, automatisons les déploiements et mettons en place des pratiques DevOps modernes. Notre approche Infrastructure as Code garantit la reproductibilité et la traçabilité de votre infrastructure. Nous assurons la sécurité de vos données avec des pratiques Zero Trust, des audits réguliers et une surveillance proactive. Notre équipe certifiée est disponible pour accompagner vos équipes et assurer la montée en compétence.',
      features: [
        'Architecture cloud multi-région',
        'Migration vers le cloud (lift & shift, re-architecture)',
        'Infrastructure as Code (Terraform, Ansible)',
        'CI/CD pipelines automatisés',
        'Monitoring et observabilité',
        'Sécurité cloud et Zero Trust',
        'Optimisation des coûts cloud',
        'Disaster Recovery Planning',
        'Formation et accompagnement équipes'
      ],
      technologies: ['AWS', 'Azure', 'GCP', 'Terraform', 'Docker', 'Kubernetes', 'Ansible', 'GitHub Actions'],
      category: 'cloud'
    },
    {
      id: 'mvp',
      title: 'Développement MVP',
      subtitle: 'De l\'idée au produit rapidement',
      icon: '<i class="fas fa-rocket"></i>',
      image: 'images/dev6.jpg',
      shortDesc: 'Nous transformons les idées à fort potentiel en produits Minimum Viable Product, prêts à déployer en un temps record.',
      longDesc: 'Notre service MVP est conçu pour les startups et entrepreneurs qui veulent valider leur idée rapidement sans compromettre la qualité. Nous avons développé une méthodologie éprouvée qui permet de passer de l\'idée au produit fonctionnel en 4 à 12 semaines. Notre équipe pluridisciplinaire (design, développement, product) travaille en sprints agiles pour itérer rapidement. Nous priorisons les fonctionnalités essentielles, utilisons des stack technologiques éprouvées pour minimiser les risques, et documentons tout pour faciliter les futures évolutions. À la livraison, vous disposez d\'un produit testé, déployé et prêt à accueillir vos premiers utilisateurs.',
      features: [
        'Workshop de définition du MVP (2-3 jours)',
        'Roadmap et priorisation produit',
        'Design UX/UI complet en 1 semaine',
        'Développement agile par sprints',
        'Intégration paiements et authentification',
        'Tests automatisés et QA',
        'Déploiement et mise en production',
        'Documentation technique complète',
        'Support post-lancement 30 jours'
      ],
      technologies: ['React', 'Next.js', 'Node.js', 'MongoDB', 'Firebase', 'Stripe', 'Vercel', 'Railway'],
      category: 'web'
    },
    {
      id: 'marketing-digital',
      title: 'Marketing Digital & SEO',
      subtitle: 'Visibilité et croissance en ligne',
      icon: '<i class="fas fa-chart-line"></i>',
      image: 'images/ia.jpg',
      shortDesc: 'Stratégies digitales complètes pour augmenter votre visibilité en ligne, attirer plus de prospects et convertir efficacement.',
      longDesc: 'Notre équipe marketing digital combine expertise technique et créativité pour propulser votre présence en ligne. Nous concevons des stratégies multicanales personnalisées qui génèrent un ROI mesurable. Notre approche data-driven s\'appuie sur l\'analyse des données pour optimiser continuellement les performances. Du SEO technique à la publicité payante, en passant par le content marketing et les réseaux sociaux, nous couvrons tous les leviers de la croissance digitale. Chaque stratégie est adaptée à votre secteur, vos objectifs et votre budget.',
      features: [
        'Audit SEO complet et technique',
        'Stratégie de contenu et rédaction SEO',
        'Campagnes Google Ads (Search, Display, YouTube)',
        'Publicités Meta, LinkedIn, TikTok',
        'Email marketing et automation',
        'Social media management',
        'Analytics et reporting mensuel',
        'Conversion Rate Optimization (CRO)',
        'Stratégie de growth hacking'
      ],
      technologies: ['Google Ads', 'Meta Ads', 'Google Analytics 4', 'SEMrush', 'Mailchimp', 'HubSpot', 'Hotjar', 'Zapier'],
      category: 'marketing'
    },
    {
      id: 'ia-solutions',
      title: 'Solutions IA & Automatisation',
      subtitle: 'Intelligence artificielle au service de votre croissance',
      icon: '<i class="fas fa-brain"></i>',
      image: 'images/ia.jpg',
      shortDesc: 'Intégration de l\'IA et automatisation intelligente des processus métier pour maximiser votre productivité et créer un avantage compétitif.',
      longDesc: 'JUDDEV CORPORATION est à la pointe de l\'intégration de l\'intelligence artificielle dans les processus métier. Nous développons des solutions d\'automatisation intelligentes, des chatbots IA, des systèmes de recommandation et des outils d\'analyse prédictive. Nous intégrons les modèles de langage les plus avancés (GPT-4, Claude, Llama) dans vos applications existantes. Notre expertise couvre le machine learning, le traitement du langage naturel, la vision par ordinateur et l\'automatisation des workflows. Nous accompagnons les entreprises dans leur transformation IA avec une approche éthique et responsable.',
      features: [
        'Intégration d\'APIs IA (OpenAI, Anthropic)',
        'Développement de chatbots intelligents',
        'Automatisation de workflows métier',
        'Analyse de données et prédictions ML',
        'Traitement du langage naturel (NLP)',
        'Vision par ordinateur',
        'Systèmes de recommandation',
        'RAG et bases de connaissances IA',
        'Formation et accompagnement équipes'
      ],
      technologies: ['Python', 'TensorFlow', 'PyTorch', 'OpenAI API', 'LangChain', 'Hugging Face', 'FastAPI', 'n8n'],
      category: 'ia'
    },
    {
      id: 'desktop-app',
      title: 'Application Desktop',
      subtitle: 'Logiciels puissants pour Windows, Mac et Linux',
      icon: '<i class="fas fa-desktop"></i>',
      image: 'images/ordi9-removebg-preview.png',
      shortDesc: 'Nous concevons et développons des applications desktop robustes, performantes et intuitives pour toutes les plateformes.',
      longDesc: 'JUDDEV CORPORATION développe des applications de bureau sur mesure répondant aux besoins métier les plus exigeants. Qu\'il s\'agisse d\'un outil de gestion interne, d\'un logiciel de traitement de données ou d\'une solution métier complète, nous utilisons les technologies modernes pour créer des applications desktop fiables, rapides et maintenables. Nos applications sont compatibles Windows, Mac et Linux, et peuvent se synchroniser avec des services cloud pour un usage hybride optimal.',
      features: [
        'Applications Windows, Mac & Linux',
        'Interfaces graphiques modernes (GUI)',
        'Accès aux ressources système (fichiers, réseau, matériel)',
        'Synchronisation avec des services cloud',
        'Mise à jour automatique',
        'Installation et packaging professionnel',
        'Support et maintenance continue'
      ],
      technologies: ['Electron', 'Python (PyQt, Tkinter)', 'C# (.NET / WPF)', 'Java (JavaFX)', 'Rust (Tauri)', 'C++'],
      category: 'desktop'
    },
    {
      id: 'cybersecurite',
      title: 'Cybersécurité',
      subtitle: 'Protégez votre infrastructure numérique',
      icon: '<i class="fas fa-shield-halved"></i>',
      image: 'images/ia.jpg',
      shortDesc: 'Audit, protection et surveillance de vos systèmes informatiques contre les cybermenaces pour garantir la sécurité de vos données.',
      longDesc: 'JUDDEV CORPORATION vous accompagne dans la sécurisation de votre infrastructure numérique. Notre équipe d\'experts en cybersécurité effectue des audits complets, identifie les vulnérabilités et met en place des mesures de protection robustes. Nous proposons des solutions adaptées à chaque entreprise, de la PME aux grandes organisations, pour garantir la confidentialité, l\'intégrité et la disponibilité de vos données. Notre approche proactive inclut la surveillance continue, la réponse aux incidents et la formation de vos équipes.',
      features: [
        'Audit de sécurité et tests d\'intrusion (pentesting)',
        'Analyse des vulnérabilités et gestion des risques',
        'Mise en place de politiques de sécurité (RGPD, ISO 27001)',
        'Sécurisation des applications web et mobiles',
        'Protection contre les ransomwares et malwares',
        'Authentification forte et gestion des accès (IAM)',
        'Surveillance SOC et détection d\'intrusions (IDS/IPS)',
        'Formation et sensibilisation des équipes',
        'Réponse aux incidents et plan de reprise (PRA/PCA)'
      ],
      technologies: ['Kali Linux', 'Metasploit', 'Burp Suite', 'Wireshark', 'Nessus', 'OWASP', 'Splunk', 'CrowdStrike'],
      category: 'securite'
    }
  ],

  realisations: [
    {
      id: 'realisation-1',
      title: 'Plateforme E-commerce Premium',
      category: 'E-commerce',
      service: 'dev-web',
      sector: 'Commerce',
      image: 'images/dev1.jpg',
      images: ['images/dev1.jpg', 'images/dev2.jpg', 'images/service2.PNG'],
      shortDesc: 'Création d\'une plateforme e-commerce complète avec gestion des stocks, paiements en ligne et interface d\'administration avancée.',
      longDesc: 'Ce projet ambitieux consistait à créer une plateforme e-commerce de nouvelle génération pour un acteur majeur du commerce en ligne. Nous avons conçu une architecture microservices robuste capable de gérer des milliers de commandes simultanées. L\'interface utilisateur, entièrement repensée, offre une expérience d\'achat fluide et intuitive sur tous les supports. L\'intégration de multiples moyens de paiement (Stripe, PayPal, mobile money africain) et un système de gestion des stocks en temps réel ont été des éléments clés du succès. Le résultat : une augmentation de 150% du taux de conversion et une réduction de 40% du taux d\'abandon de panier.',
      client: 'Client Confidentiel',
      year: '2025',
      technologies: ['React', 'Next.js', 'Node.js', 'MongoDB', 'Stripe', 'Redis', 'AWS'],
      url: '#',
      highlights: ['Taux de conversion +150%', 'Design responsive premium', 'SEO optimisé', '99.9% uptime']
    },
    {
      id: 'realisation-2',
      title: 'Application Mobile de Livraison',
      category: 'Mobile',
      service: 'dev-mobile',
      sector: 'Logistique',
      image: 'images/dev2.jpg',
      images: ['images/dev2.jpg', 'images/dev3.jpg'],
      shortDesc: 'Application mobile complète de gestion et suivi de livraisons en temps réel avec géolocalisation avancée.',
      longDesc: 'Nous avons développé une solution mobile complète pour une startup logistique innovante. L\'application comprend trois interfaces distinctes : une app livreur, une app client et un dashboard administrateur web. La technologie de géolocalisation en temps réel permet un suivi précis des colis, et le système de notifications push informe automatiquement les clients à chaque étape. L\'algorithme d\'optimisation des tournées réduit les coûts de carburant de 30%. L\'application a été lancée avec succès sur iOS et Android, et compte aujourd\'hui plus de 50,000 utilisateurs actifs.',
      client: 'StartupLog',
      year: '2025',
      technologies: ['React Native', 'Firebase', 'Google Maps API', 'Node.js', 'PostgreSQL'],
      url: '#',
      highlights: ['50 000+ utilisateurs', 'GPS en temps réel', 'Push notifications', 'Tournées optimisées -30%']
    },
    {
      id: 'realisation-3',
      title: 'Plateforme SaaS RH',
      category: 'SaaS',
      service: 'saas',
      sector: 'Ressources Humaines',
      image: 'images/dev3.jpg',
      images: ['images/dev3.jpg', 'images/service4.PNG'],
      shortDesc: 'Solution SaaS complète de gestion des ressources humaines, couvrant le recrutement, la paie et l\'évaluation des performances.',
      longDesc: 'CorpRH nous a mandatés pour développer une plateforme SaaS RH complète destinée aux PME africaines. La solution couvre l\'ensemble du cycle de vie employé : recrutement, onboarding, gestion de la paie, suivi des congés, évaluations de performance et reporting RH. L\'architecture multi-tenant permet à des centaines d\'entreprises d\'utiliser la plateforme en toute isolation des données. Les tableaux de bord interactifs offrent des insights précieux sur la masse salariale et les performances. La plateforme gère aujourd\'hui plus de 200 entreprises clientes et 15,000 employés actifs.',
      client: 'CorpRH',
      year: '2024',
      technologies: ['Vue.js', 'Node.js', 'MySQL', 'Redis', 'AWS S3', 'Stripe'],
      url: '#',
      highlights: ['200+ entreprises clientes', 'Multi-tenant sécurisé', 'Paie automatisée', 'Rapports avancés']
    },
    {
      id: 'realisation-4',
      title: 'Refonte UI/UX d\'une FinTech',
      category: 'Design',
      service: 'ux-design',
      sector: 'Finance',
      image: 'images/dev4.jpg',
      images: ['images/dev4.jpg', 'images/service5.PNG'],
      shortDesc: 'Refonte complète de l\'interface utilisateur d\'une application fintech, augmentant l\'engagement de 200%.',
      longDesc: 'FinCorp nous a confié la refonte totale de son application de gestion financière. Après une phase de recherche utilisateur approfondie (interviews, tests usabilité, analyse des parcours), nous avons identifié les principaux points de friction. Nous avons conçu un nouveau design system complet avec des composants réutilisables, des micro-interactions soignées et une navigation repensée. Le résultat : une interface épurée et intuitive qui a conduit à une augmentation de 200% de l\'engagement utilisateur, une réduction de 60% du nombre de tickets support liés à l\'interface, et une note de 4.8/5 sur les stores.',
      client: 'FinCorp',
      year: '2025',
      technologies: ['Figma', 'Framer', 'React', 'Storybook'],
      url: '#',
      highlights: ['Engagement +200%', 'Design System complet', 'Note 4.8/5 stores', 'Support -60%']
    },
    {
      id: 'realisation-5',
      title: 'Infrastructure Cloud Sécurisée',
      category: 'Cloud',
      service: 'cloud',
      sector: 'Technologie',
      image: 'images/dev5.jpg',
      images: ['images/dev5.jpg'],
      shortDesc: 'Mise en place d\'une infrastructure cloud sécurisée, scalable et résiliente pour un groupe technologique international.',
      longDesc: 'TechGroup nous a mandatés pour concevoir et déployer une infrastructure cloud enterprise sur AWS, capable de supporter leur croissance internationale. Nous avons conçu une architecture multi-régions avec failover automatique, garantissant une disponibilité de 99.99%. L\'Infrastructure as Code avec Terraform permet des déploiements reproductibles et tracés. Le monitoring centralisé avec Datadog et les alertes intelligentes garantissent une réactivité maximale. La mise en place d\'une pipeline CI/CD complète a réduit le temps de déploiement de 3 jours à 15 minutes. Les coûts cloud ont été optimisés de 35% grâce à l\'auto-scaling et la gestion intelligente des ressources.',
      client: 'TechGroup International',
      year: '2024',
      technologies: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'Datadog', 'GitHub Actions'],
      url: '#',
      highlights: ['99.99% disponibilité', 'Déploiement 15min vs 3 jours', 'Coûts cloud -35%', 'Multi-régions']
    },
    {
      id: 'realisation-6',
      title: 'MVP Application Santé',
      category: 'MVP',
      service: 'mvp',
      sector: 'Santé',
      image: 'images/dev6.jpg',
      images: ['images/dev6.jpg', 'images/dev1.jpg'],
      shortDesc: 'Développement MVP d\'une application de téléconsultation et suivi médical patient, livré en 10 semaines.',
      longDesc: 'HealthTech nous a sollicités pour développer leur MVP de téléconsultation médicale dans un délai très court. Après 2 jours de workshop produit, nous avons défini le scope MVP et commencé le développement en parallèle avec le design. En 10 semaines, nous avons livré une application complète permettant aux patients de prendre des rendez-vous, effectuer des consultations vidéo sécurisées, accéder à leur dossier médical et suivre leurs ordonnances. La plateforme est entièrement RGPD-compliant et certifiée HDS (Hébergeur de Données de Santé). Elle a accueilli plus de 500 médecins et 10,000 patients lors de son lancement.',
      client: 'HealthTech Africa',
      year: '2025',
      technologies: ['React', 'Node.js', 'MongoDB', 'WebRTC', 'Firebase', 'AWS'],
      url: '#',
      highlights: ['Livré en 10 semaines', 'RGPD & HDS compliant', '500+ médecins', '10 000+ patients']
    }
  ],

  articles: [


    {
      id: 'article-1',
      title: "Comment l'IA revolutionne le developpement web en 2025",
      category: "Intelligence Artificielle",
      date: '2026-03-15',
      image: 'images/ia.jpg',
      shortDesc: "Decouvrez comment l'IA transforme les pratiques de developpement web, accelere la production et change le role du developpeur moderne.",
      content: `<h2>L'IA au coeur du developpement moderne</h2><p>L'intelligence artificielle est devenue un outil quotidien pour les equipes produit, frontend, backend, QA et DevOps. De la generation de composants a l'assistance au debugging, elle intervient sur presque tout le cycle de vie logiciel.</p><p>Cette adoption massive s'explique par un benefice immediat : aller plus vite sur les taches repetitives sans sacrifier la qualite quand les equipes gardent un vrai cadre de validation.</p><h2>Les usages les plus utiles aujourd'hui</h2><ul><li><strong>Generation de base de code :</strong> structures de projets, CRUD, integrations d'API et composants recurrents.</li><li><strong>Assistance a la revue :</strong> reperage plus rapide d'erreurs et de dettes techniques.</li><li><strong>Documentation :</strong> resumes techniques, README et explications sur du code legacy.</li><li><strong>Tests :</strong> generation d'exemples de tests et de cas limites.</li></ul><p>Chez JUDDEV, nous utilisons l'IA comme un accelerateur de production, jamais comme un substitut au jugement technique.</p>`,
      author: 'JAYSON STANLEY',
      tags: ['IA', 'Web', 'Innovation', 'Developpement', 'Productivite']
    },


    {
      id: 'article-2',
      title: "Les avantages d'une architecture microservices pour les startups",
      category: "Architecture",
      date: '2026-03-02',
      image: 'images/dev3.jpg',
      shortDesc: "Pourquoi les startups en forte croissance regardent de pres les microservices, et dans quels cas cette architecture devient vraiment pertinente.",
      content: `<h2>Un choix d'architecture qui engage la croissance</h2><p>Le choix d'architecture influence la vitesse de livraison, la capacite a recruter, la qualite des deploiements et la maniere dont le produit evoluera sous charge.</p><h2>Les avantages concrets</h2><p>Les microservices permettent une scalabilite ciblee, des deploiements plus surs et une meilleure separation des domaines fonctionnels.</p><h2>Les couts caches</h2><p>Ils introduisent aussi une complexite reelle : supervision distribuee, pannes reseau, contrats d'API et pipelines plus exigeants.</p><p>La bonne architecture n'est pas la plus a la mode. C'est celle qui accompagne la croissance sans creer une complexite prematuree.</p>`,
      author: 'NGUEYE DURAND',
      tags: ['Architecture', 'Microservices', 'Backend', 'Startup', 'Cloud']
    },


    {
      id: 'article-3',
      title: "React Native vs Flutter : quel choix pour votre app mobile ?",
      category: "Mobile",
      date: '2026-02-20',
      image: 'images/dev2.jpg',
      shortDesc: "Comparatif clair entre React Native et Flutter pour choisir le bon framework mobile selon votre equipe, votre budget et vos objectifs produit.",
      content: `<h2>Deux frameworks solides, deux logiques differentes</h2><p>React Native et Flutter sont aujourd'hui les deux grandes references du mobile cross-platform.</p><h2>Quand React Native est pertinent</h2><p>Si votre equipe maitrise deja JavaScript et React, vous gagnerez vite en execution.</p><h2>Quand Flutter prend l'avantage</h2><p>Si vous visez une interface tres personnalisee et un rendu tres controle, Flutter est souvent un excellent choix.</p><p>Le bon framework est surtout celui que votre equipe saura executer correctement dans le temps.</p>`,
      author: 'FOKOUA STYVE',
      tags: ['Mobile', 'React Native', 'Flutter', 'iOS', 'Android', 'Cross-platform']
    },


    {
      id: 'article-4',
      title: "Cloud computing : strategie multicloud ou monocloud ?",
      category: "Cloud",
      date: '2026-02-10',
      image: 'images/dev5.jpg',
      shortDesc: "Monocloud ou multicloud : analyse des benefices, des couts caches et du bon niveau de complexite a adopter selon votre maturite technique.",
      content: `<h2>Le debat ne porte plus sur le cloud, mais sur la strategie cloud</h2><p>Le monocloud reste souvent la solution la plus rationnelle pour les startups et les PME. Il simplifie la facturation, la supervision et la montee en competence des equipes.</p><p>Le multicloud devient utile quand des enjeux precis apparaissent : resilience, conformite ou besoin d'eviter un lock-in trop fort.</p><p>Il vaut mieux une infrastructure simple, observee et robuste qu'une architecture dispersee difficile a operer.</p>`,
      author: 'NGUEYE DURAND',
      tags: ['Cloud', 'AWS', 'Azure', 'GCP', 'Infrastructure', 'DevOps']
    },


    {
      id: 'article-5',
      title: "UX Design : les principes cles pour une experience utilisateur optimale",
      category: "Design",
      date: '2026-02-01',
      image: 'images/dev4.jpg',
      shortDesc: "Les fondamentaux du UX Design pour creer des interfaces claires, accessibles, engageantes et orientees resultats.",
      content: `<h2>L'UX ne concerne pas seulement l'apparence</h2><p>Une bonne experience utilisateur reduit l'effort mental et aide l'utilisateur a avancer sans hesitation.</p><h2>Les principes qui comptent</h2><ul><li>clarte</li><li>simplicite</li><li>coherence</li><li>accessibilite</li></ul><p>Le meilleur design est celui qui aide l'utilisateur a atteindre son but de la maniere la plus fluide possible.</p>`,
      author: 'JAYSON STANLEY',
      tags: ['UX Design', 'UI', 'Interface', 'Experience utilisateur', 'Conversion']
    },


    {
      id: 'article-6',
      title: "Developpement MVP : de l'idee au produit en 3 mois",
      category: "Startup",
      date: '2026-01-20',
      image: 'images/dev6.jpg',
      shortDesc: "Guide pratique pour construire un MVP utile, apprendre vite du marche et lancer sans gaspiller temps ni budget.",
      content: `<h2>Un MVP n'est pas un produit bacle</h2><p>Le MVP sert a tester un vrai probleme avec une version simple, utile et mesurable.</p><h2>Les etapes essentielles</h2><p>Definir le probleme, prioriser sans pitie, livrer vite et apprendre du terrain.</p><h2>Les erreurs frequentes</h2><p>Vouloir tout inclure, retarder le lancement et negliger les retours utilisateurs.</p>`,
      author: 'FOKOUA STYVE',
      tags: ['MVP', 'Startup', 'Lean Startup', 'Product', 'Agilite']
    },


    {
      id: 'article-cybersecurite',
      title: "La cybersecurite devient critique",
      category: "Securite",
      date: '2026-03-28',
      image: 'images/dev7.PNG',
      shortDesc: "Les cyberattaques se multiplient et touchent desormais toutes les tailles d'entreprises. Renforcer sa cybersecurite est devenu une necessite operationnelle.",
      content: `<h2>Une menace devenue structurelle</h2><p>PME, administrations, e-commerce et SaaS sont exposes a des attaques plus frequentes et plus ciblees.</p><h2>Les menaces les plus courantes</h2><p>Phishing, ransomwares, APIs exposees et dependances non mises a jour font partie des points d'entree classiques.</p><h2>Les 5 piliers d'une securite solide</h2><ul><li>identifier</li><li>proteger</li><li>detecter</li><li>repondre</li><li>retablir</li></ul><p>La cybersecurite n'est pas un achat ponctuel mais une discipline continue.</p>`,
      author: 'NGUEYE NGUEYE DURAND',
      tags: ['Securite', 'Cybersecurite', 'Ransomware', 'Phishing', 'API']
    },


    {
      id: 'article-tech-afrique',
      title: "La tech en Afrique monte en puissance",
      category: "Innovation",
      date: '2026-03-20',
      image: 'images/a-propos.jpeg',
      shortDesc: "L'ecosysteme technologique africain accelere : talents, innovation locale, fintech, sante, education et infrastructures numeriques redessinent le continent.",
      content: `<h2>Une dynamique devenue impossible a ignorer</h2><p>Le continent voit emerger une nouvelle generation d'entrepreneurs, d'ingenieurs et d'acteurs de la formation qui construisent des solutions pensees pour leurs realites locales.</p><h2>Pourquoi cette croissance compte</h2><p>La technologie repond a des besoins concrets : paiement mobile, logistique, telemedecine, education a distance et digitalisation des PME.</p><p>L'Afrique devient un espace d'innovation a part entiere.</p>`,
      author: 'JAYSON STANLEY DJEMETIO',
      tags: ['Afrique', 'Tech', 'Innovation', 'Startup', 'Fintech']
    },


    {
      id: 'article-ia-confiance',
      title: "Peut-on faire confiance a l'intelligence artificielle ?",
      category: "Intelligence Artificielle",
      date: '2026-03-10',
      image: 'images/ia.jpg',
      shortDesc: "L'IA influence deja nos decisions, nos outils et nos metiers. La vraie question est de savoir dans quelles conditions on peut lui faire confiance.",
      content: `<h2>La question n'est plus theorique</h2><p>L'IA intervient deja dans des domaines sensibles : recrutement, credit, fraude, sante ou tri de candidatures.</p><h2>Pourquoi la confiance est difficile</h2><p>Les modeles peuvent produire des erreurs importantes, des biais injustes et des decisions difficiles a expliquer.</p><h2>Les criteres d'une IA digne de confiance</h2><ul><li>transparence</li><li>explicabilite</li><li>robustesse</li><li>supervision humaine</li><li>protection des donnees</li></ul><p>Faire confiance a l'IA, c'est surtout construire les garde-fous qui empechent cette confiance de devenir aveugle.</p>`,
      author: 'NGUEYE NGUEYE DURAND',
      tags: ['IA', 'Ethique', 'Biais', 'Innovation', 'Technologie']
    },


    {
      id: 'article-cloud-devops',
      title: "C'est quoi le Cloud et le DevOps ?",
      category: "Cloud",
      date: '2026-02-25',
      image: 'images/dev3.jpg',
      shortDesc: "Cloud et DevOps sont au coeur des logiciels modernes. Voici ce qu'ils changent concretement dans la maniere de construire, deployer et faire evoluer un produit.",
      content: `<h2>Le cloud, simplement</h2><p>Le cloud permet d'utiliser des ressources informatiques a la demande via internet.</p><h2>Le DevOps, au-dela des outils</h2><p>DevOps est une culture de collaboration pour livrer plus vite, plus souvent et avec plus de fiabilite.</p><h2>Les pratiques incontournables</h2><ul><li>CI/CD</li><li>Infrastructure as Code</li><li>Conteneurisation</li><li>Observabilite</li></ul><p>Comprendre le cloud et le DevOps, c'est comprendre pourquoi les logiciels modernes peuvent evoluer en continu.</p>`,
      author: 'FOKOUA STYVE',
      tags: ['Cloud', 'DevOps', 'AWS', 'Infrastructure', 'CI/CD']
    },


    {
      id: 'article-ia-developpement',
      title: "IA et developpement logiciel",
      category: "Intelligence Artificielle",
      date: '2026-02-15',
      image: 'images/dev7.PNG',
      shortDesc: "L'IA accelere la production logicielle, mais elle redefinit aussi les competences les plus precieuses chez les developpeurs et les equipes techniques.",
      content: `<h2>Une nouvelle etape pour le metier de developpeur</h2><p>L'IA generative change profondement la production logicielle : code, refactorings, tests, documentation et revue technique.</p><h2>Ce qu'elle ne remplace pas</h2><p>La comprehension metier, les arbitrages d'architecture, l'analyse des risques et le sens du produit restent fondamentalement humains.</p><h2>Les competences qui montent</h2><ul><li>architecture logicielle</li><li>revue de code</li><li>qualite logicielle</li><li>securite applicative</li><li>communication produit</li></ul>`,
      author: 'JAYSON STANLEY DJEMETIO',
      tags: ['IA', 'Developpement', 'Copilot', 'Productivite', 'Innovation']
    },


    {
      id: 'article-securite-logicielle',
      title: "La securite logicielle",
      category: "Securite",
      date: '2026-02-05',
      image: 'images/dev1.jpg',
      shortDesc: "Construire un logiciel securise ne releve pas du bonus. C'est une exigence de conception, de developpement et d'exploitation.",
      content: `<h2>La securite commence dans le code</h2><p>Beaucoup d'incidents proviennent d'erreurs classiques : validation insuffisante, authentification fragile, secrets mal geres ou dependances vulnerables.</p><h2>Les vulnerabilites a surveiller</h2><ul><li>injection</li><li>XSS</li><li>authentification defaillante</li><li>exposition de secrets</li></ul><h2>Le reflexe Security by Default</h2><p>Validation stricte, permissions minimales, journalisation utile et dependances a jour doivent etre presentes des le debut.</p>`,
      author: 'NGUEYE NGUEYE DURAND',
      tags: ['Securite', 'OWASP', 'SQL Injection', 'XSS', 'Developpement']
    },
    {
      id: 'formation-mobile',
      title: 'Développement Mobile Cross-Platform',
      duration: '2 mois',
      level: 'Intermédiaire',
      price: 'Sur devis',
      description: 'Maîtrisez le développement d\'applications mobiles cross-platform avec React Native ou Flutter pour créer des apps iOS et Android professionnelles.',
      program: [
        'Fondamentaux React Native / Flutter',
        'Navigation et gestion d\'état',
        'Consommation d\'APIs REST',
        'Stockage local et base de données mobile',
        'Géolocalisation et APIs natives',
        'Animations et UI avancée',
        'Tests et débogage',
        'Publication App Store & Google Play'
      ],
      icon: '<i class="fas fa-mobile-alt"></i>'
    },
    {
      id: 'formation-uxui',
      title: 'UI/UX Design Professionnel',
      duration: '6 semaines',
      level: 'Tous niveaux',
      price: 'Sur devis',
      description: 'Devenez designer UI/UX professionnel. Maîtrisez les outils, méthodes et processus pour créer des interfaces engageantes et des expériences mémorables.',
      program: [
        'Principes du design graphique',
        'Figma : de débutant à expert',
        'Design Thinking et UX Research',
        'Wireframing et architecture d\'information',
        'Prototypage interactif avancé',
        'Design System et composants',
        'Tests d\'utilisabilité',
        'Portfolio et présentation clients'
      ],
      icon: '<i class="fab fa-figma"></i>'
    },
    {
      id: 'formation-cloud',
      title: 'Cloud Computing & DevOps',
      duration: '2 mois',
      level: 'Avancé',
      price: 'Sur devis',
      description: 'Maîtrisez les outils et pratiques DevOps modernes : AWS, Docker, Kubernetes, CI/CD et Infrastructure as Code pour des déploiements modernes et fiables.',
      program: [
        'AWS fondamentaux (EC2, S3, RDS, Lambda)',
        'Conteneurisation avec Docker',
        'Orchestration Kubernetes',
        'CI/CD avec GitHub Actions',
        'Infrastructure as Code avec Terraform',
        'Monitoring et observabilité',
        'Sécurité cloud et bonnes pratiques',
        'Préparation certification AWS'
      ],
      icon: '<i class="fab fa-aws"></i>'
    },
    {
      id: 'formation-ia',
      title: 'Intelligence Artificielle & Machine Learning',
      duration: '3 mois',
      level: 'Intermédiaire à Avancé',
      price: 'Sur devis',
      description: 'Plongez dans le monde de l\'IA et du Machine Learning. De Python aux LLMs en passant par le Deep Learning, devenez opérationnel sur les technologies IA les plus demandées.',
      program: [
        'Python pour la Data Science et l\'IA',
        'Machine Learning avec Scikit-learn',
        'Deep Learning avec TensorFlow/PyTorch',
        'Traitement du langage naturel (NLP)',
        'LLMs et API OpenAI / Anthropic',
        'LangChain et agents IA',
        'Déploiement de modèles ML',
        'Projets pratiques et portfolio'
      ],
      icon: '<i class="fas fa-brain"></i>'
    }
  ],

  contacts: {
    email: 'contact@juddev.com',
    phone: '+237 6XX XXX XXX',
    address: 'Yaoundé, Cameroun',
    hours: 'Lun - Ven: 8h00 - 18h00',
    social: {
      linkedin: '#',
      twitter: '#',
      github: '#',
      instagram: '#'
    }
  }
};

// ============================================================
// DATA MANAGEMENT - API + LocalStorage sync
// ============================================================
const _API_BASE = (typeof JUDDEV_CONFIG !== 'undefined') ? JUDDEV_CONFIG.API_URL : 'http://localhost:5000/api';
const _DATA_VERSION = '3.3'; // Merge default articles with API

function getJUDDEVData() {
  try {
    // Clear cache if version mismatch (e.g., emoji → FA icons migration)
    const storedVersion = localStorage.getItem('JUDDEV_DATA_VERSION');
    if (storedVersion !== _DATA_VERSION) {
      localStorage.removeItem('JUDDEV_DATA');
      localStorage.setItem('JUDDEV_DATA_VERSION', _DATA_VERSION);
    }
    const stored = localStorage.getItem('JUDDEV_DATA');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        services: parsed.services || JUDDEV_DATA_DEFAULT.services,
        realisations: parsed.realisations || JUDDEV_DATA_DEFAULT.realisations,
        articles: parsed.articles || JUDDEV_DATA_DEFAULT.articles,
        formations: parsed.formations || JUDDEV_DATA_DEFAULT.formations,
        contacts: parsed.contacts || JUDDEV_DATA_DEFAULT.contacts
      };
    }
  } catch (e) {
    console.warn('Error reading JUDDEV_DATA from localStorage:', e);
  }
  return JUDDEV_DATA_DEFAULT;
}

function saveJUDDEVData(data) {
  try {
    localStorage.setItem('JUDDEV_DATA', JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Error saving JUDDEV_DATA to localStorage:', e);
    return false;
  }
}

function resetJUDDEVData() {
  localStorage.removeItem('JUDDEV_DATA');
}

// Initialize data (sync - from localStorage or defaults)
const JUDDEV_DATA = getJUDDEVData();

// Async API fetch - updates data and re-renders page after load
async function syncFromAPI() {
  try {
    const [servicesRes, realisationsRes, articlesRes, formationsRes, contactRes] = await Promise.all([
      fetch(_API_BASE + '/services'),
      fetch(_API_BASE + '/realisations'),
      fetch(_API_BASE + '/articles'),
      fetch(_API_BASE + '/formations'),
      fetch(_API_BASE + '/contact/info')
    ]);

    if (!servicesRes.ok) return; // Backend not available

    const [services, realisations, articles, formations, contactInfo] = await Promise.all([
      servicesRes.json(),
      realisationsRes.json(),
      articlesRes.json(),
      formationsRes.json(),
      contactRes.json()
    ]);

    // Update in-memory data
    if (services.length) JUDDEV_DATA.services = services;
    if (realisations.length) JUDDEV_DATA.realisations = realisations;
    if (articles.length) {
      // Merge: keep default articles not yet in the database
      const apiIds = new Set(articles.map(a => a.id));
      const defaultOnly = JUDDEV_DATA_DEFAULT.articles.filter(a => !apiIds.has(a.id));
      JUDDEV_DATA.articles = [...articles, ...defaultOnly];
    }
    if (formations.length) JUDDEV_DATA.formations = formations;
    if (contactInfo) JUDDEV_DATA.contacts = contactInfo;

    // Cache in localStorage
    saveJUDDEVData(JUDDEV_DATA);

    // Notify pages that data has been updated
    document.dispatchEvent(new CustomEvent('juddev:dataUpdated', { detail: JUDDEV_DATA }));
  } catch (e) {
    // API not available - use cached/default data silently
    console.info('JUDDEV API not available, using cached data.');
  }
}

// Ping immédiat pour réveiller Render dès la première page (sans attendre les données)
fetch(_API_BASE + '/health').catch(() => {});

// Start API sync after page loads (non-blocking)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(syncFromAPI, 500));
} else {
  setTimeout(syncFromAPI, 500);
}

// Auto-refresh disabled to prevent page reload annoyance (data synced on page load)

// Helper functions
function getServiceById(id) {
  return JUDDEV_DATA.services.find(s => s.id === id) || null;
}

function getRealisationById(id) {
  return JUDDEV_DATA.realisations.find(r => r.id === id) || null;
}

function getArticleById(id) {
  return JUDDEV_DATA.articles.find(a => a.id === id) || null;

}

function getFormationById(id) {
  return JUDDEV_DATA.formations.find(f => f.id === id) || null;
}

function getRealisationsByService(serviceId) {
  return JUDDEV_DATA.realisations.filter(r => r.service === serviceId);
}

function getRecentArticles(count = 3) {
  return [...JUDDEV_DATA.articles]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, count);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const lang = (typeof JUDDEV_I18N !== 'undefined' ? JUDDEV_I18N.currentLang : null) ||
               localStorage.getItem('juddev_lang') || 'fr';
  return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

function getAuthorInitials(name) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('');
}
