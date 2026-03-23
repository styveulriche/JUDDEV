/* ============================================================
   JUDDEV CORPORATION - Main JavaScript
   Handles: Loader, Navbar, Scroll Animations, Devis Popup, etc.
   ============================================================ */

'use strict';

// ============================================================
// PAGE LOADER
// ============================================================
(function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  document.body.classList.add('loading');

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('fade-out');
      document.body.classList.remove('loading');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 600);
    }, 1200);
  });
})();

// ============================================================
// NAVBAR
// ============================================================
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.querySelector('.navbar-hamburger');
  const mobileNav = document.querySelector('.navbar-mobile');
  if (!navbar) return;

  // Scroll effect
  function handleNavbarScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // Hamburger toggle
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && !mobileNav.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // Active link highlight
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-links a, .navbar-mobile a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

// ============================================================
// SMOOTH SCROLL
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ============================================================
// SCROLL ANIMATIONS (IntersectionObserver)
// ============================================================
(function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
})();

// Auto-add reveal classes to common elements
(function autoReveal() {
  const selectors = [
    '.service-card',
    '.realisation-card',
    '.blog-card',
    '.team-card',
    '.value-card',
    '.info-card',
    '.formation-card',
    '.highlight-card',
    '.process-step'
  ];

  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      if (!el.classList.contains('reveal') && !el.classList.contains('reveal-left') && !el.classList.contains('reveal-right') && !el.classList.contains('reveal-scale')) {
        el.classList.add('reveal');
        const delay = Math.min(i * 0.1, 0.8);
        el.style.transitionDelay = delay + 's';
      }
    });
  });

  // Section titles from left
  document.querySelectorAll('.section-title, .section-header').forEach(el => {
    if (!el.classList.contains('reveal-left')) {
      el.classList.add('reveal-left');
    }
  });

  // Re-observe all
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => observer.observe(el));
})();

// ============================================================
// DEVIS MODAL
// ============================================================
(function initDevisModal() {
  const modal = document.getElementById('devis-modal');
  if (!modal) return;

  const backdrop = modal.querySelector('.modal-backdrop');
  const closeBtn = modal.querySelector('.modal-close');
  const form = modal.querySelector('#devis-form');

  function openModal(formationTitle) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (formationTitle) {
      setTimeout(() => {
        const sel = document.getElementById('formation-select');
        if (sel) {
          // Try to match existing option
          const opt = Array.from(sel.options).find(o => o.value === formationTitle || o.text === formationTitle);
          if (opt) {
            sel.value = opt.value;
          } else {
            // Add a temporary option for this formation
            const newOpt = document.createElement('option');
            newOpt.value = formationTitle;
            newOpt.text = formationTitle;
            newOpt.setAttribute('data-temp', '1');
            // Remove previous temp option if any
            sel.querySelectorAll('[data-temp]').forEach(o => o.remove());
            sel.appendChild(newOpt);
            sel.value = formationTitle;
          }
        }
      }, 50);
    }
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Open triggers
  document.querySelectorAll('[data-modal="devis"], .btn-devis, .btn-devis-nav, [href="#devis"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  // Close triggers
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Form submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('.modal-submit');
      const originalHTML = submitBtn.innerHTML;

      // Collect all form fields BEFORE closing
      const allInputs = [...form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], select, textarea')];
      const name     = allInputs[0]?.value || '';
      const email    = allInputs[1]?.value || '';
      const phone    = allInputs[2]?.value || '';
      const company  = allInputs[3]?.value || '';
      const service  = allInputs[4]?.value || '';
      const budget   = allInputs[5]?.value || '';
      const desc     = allInputs[6]?.value || allInputs[7]?.value || '';

      const msgBody = [
        company ? `Entreprise: ${company}` : '',
        service ? `Service souhaité: ${service}` : '',
        budget  ? `Budget: ${budget}` : '',
        `\nDescription du projet:\n${desc}`
      ].filter(Boolean).join('\n');

      const API = typeof JUDDEV_CONFIG !== 'undefined' ? JUDDEV_CONFIG.API_URL : 'http://localhost:5000/api';
      const formTypeField = form.querySelector('input[name="form-type"]');
      const formType = formTypeField ? formTypeField.value : 'DEVIS';

      // Close immediately — don't wait for server
      closeModal();
      form.reset();
      showNotification('success', 'Demande envoyée !', 'Votre demande a été reçue. Nous vous contacterons dans les 24h.');

      // Send in background
      fetch(API + '/contact/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject: `[${formType}] ${service || 'Demande'}`, message: msgBody })
      }).catch(() => {});
    });
  }

  // Expose for external use
  window.openDevisModal = openModal;
  window.closeDevisModal = closeModal;
})();

// ============================================================
// NOTIFICATION SYSTEM
// ============================================================
function showNotification(type, title, message) {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <span class="notification-icon">${icons[type] || icons.info}</span>
    <div>
      <div class="notification-title">${title}</div>
      <div class="notification-msg">${message}</div>
    </div>
  `;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add('show'), 50);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 400);
  }, 4500);
}

// ============================================================
// FAQ ACCORDION
// ============================================================
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  // Close all
  document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
  // Toggle current
  if (!isOpen) item.classList.add('open');
}

// ============================================================
// CAROUSEL (Blog page)
// ============================================================
function initCarousel(carouselEl) {
  if (!carouselEl) return;

  const track = carouselEl.querySelector('.carousel-track');
  const slides = carouselEl.querySelectorAll('.carousel-slide');
  const dots = carouselEl.querySelectorAll('.carousel-dot');
  const prevBtn = carouselEl.querySelector('.carousel-prev');
  const nextBtn = carouselEl.querySelector('.carousel-next');

  if (!track || !slides.length) return;

  let current = 0;
  let autoplayTimer;
  let isDragging = false;
  let startX = 0;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAutoplay() {
    autoplayTimer = setInterval(next, 5000);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoplay(); prev(); startAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoplay(); next(); startAutoplay(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { stopAutoplay(); goTo(i); startAutoplay(); });
  });

  // Touch/swipe support
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    stopAutoplay();
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
    startAutoplay();
  }, { passive: true });

  // Init
  goTo(0);
  startAutoplay();

  // Pause on hover
  carouselEl.addEventListener('mouseenter', stopAutoplay);
  carouselEl.addEventListener('mouseleave', startAutoplay);
}

// Initialize carousels
document.querySelectorAll('.carousel').forEach(initCarousel);

// ============================================================
// FILTER SYSTEM (Realisations page)
// ============================================================
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const filterableItems = document.querySelectorAll('[data-category], [data-service]');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.filter-bar');
      group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterType = btn.dataset.filterType || 'category';
      const filterValue = btn.dataset.filter;

      filterableItems.forEach(item => {
        const itemValue = item.dataset[filterType] || item.dataset.category;
        if (filterValue === 'all' || itemValue === filterValue || (item.dataset.category === filterValue) || (item.dataset.service === filterValue)) {
          item.style.display = '';
          item.style.animation = 'fadeInUp 0.4s ease both';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

initFilters();

// ============================================================
// DYNAMIC PAGE LOADING (service-detail, realisation-detail, article-detail)
// ============================================================
function getURLParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Service Detail Page
function loadServiceDetail() {
  const container = document.getElementById('service-detail-content');
  if (!container) return;

  const id = getURLParam('id');
  if (!id || typeof JUDDEV_DATA === 'undefined') {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Service introuvable.</p><a href="services.html" class="btn btn-primary" style="margin-top:1rem">Voir tous les services</a></div>';
    return;
  }

  const service = getServiceById(id);
  if (!service) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Service introuvable.</p><a href="services.html" class="btn btn-primary" style="margin-top:1rem">Voir tous les services</a></div>';
    return;
  }

  // Update page title & breadcrumb
  document.title = `${service.title} - JUDDEV CORPORATION`;
  const heroTitle = document.getElementById('page-hero-title');
  const heroSubtitle = document.getElementById('page-hero-subtitle');
  const breadcrumbCurrent = document.getElementById('breadcrumb-current');
  if (heroTitle) heroTitle.textContent = service.title;
  if (heroSubtitle) heroSubtitle.textContent = service.subtitle;
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = service.title;

  // Related services
  const related = JUDDEV_DATA.services.filter(s => s.id !== id).slice(0, 3);

  container.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="grid-2" style="gap:4rem;align-items:center">
          <div class="reveal-left">
            <div style="font-size:4rem;margin-bottom:1.5rem">${service.icon}</div>
            <h2 class="section-title" style="text-align:left;margin-bottom:1rem">${service.title}</h2>
            <p style="color:var(--accent-cyan);font-size:1.1rem;font-weight:600;margin-bottom:1.5rem">${service.subtitle}</p>
            <p style="color:var(--text-muted);line-height:1.9;font-size:1.05rem">${service.longDesc}</p>
          </div>
          <div class="reveal-right">
            <img src="${service.image}" alt="${service.title}" style="border-radius:var(--radius-xl);width:100%;aspect-ratio:4/3;object-fit:cover;border:1px solid var(--border-color);box-shadow:var(--shadow-xl)" onerror="this.style.background='linear-gradient(135deg,#0066ff22,#00d4ff22)';this.alt=''"  />
          </div>
        </div>
      </div>
    </section>

    <section class="section" style="background:var(--bg-secondary);border-top:1px solid var(--border-color);border-bottom:1px solid var(--border-color)">
      <div class="container">
        <div class="grid-2" style="gap:4rem">
          <div class="reveal">
            <h2 class="section-title" style="text-align:left;margin-bottom:2rem">Ce que nous <span>faisons</span></h2>
            <div class="feature-list">
              ${service.features.map(f => `<div class="feature-item"><i class="fas fa-check-circle"></i> ${f}</div>`).join('')}
            </div>
          </div>
          <div class="reveal stagger-2">
            <h3 style="font-size:1.5rem;color:var(--text-primary);margin-bottom:1.5rem">Technologies utilisées</h3>
            <div class="tech-stack" style="margin-bottom:2rem">
              ${service.technologies.map(t => `<span class="tech-badge">${t}</span>`).join('')}
            </div>
            <h3 style="font-size:1.5rem;color:var(--text-primary);margin-bottom:1.5rem">Notre Processus</h3>
            <div style="display:flex;flex-direction:column;gap:1rem">
              ${['Analyse & Découverte', 'Conception & Design', 'Développement & Tests', 'Livraison & Suivi'].map((step, i) => `
                <div style="display:flex;align-items:center;gap:1rem;padding:1rem;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-lg)">
                  <div style="width:36px;height:36px;border-radius:50%;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;color:white;flex-shrink:0">${i + 1}</div>
                  <span style="font-weight:600;color:var(--text-primary)">${step}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section reveal">
      <div class="container">
        <h2 class="cta-title">Intéressé par ce service ?</h2>
        <p class="cta-subtitle">Discutons de votre projet et trouvons la meilleure solution pour vos besoins spécifiques.</p>
        <div class="cta-buttons">
          <button class="btn btn-primary" onclick="window.openDevisModal && window.openDevisModal()">
            <i class="fas fa-paper-plane"></i> Demander un Devis
          </button>
          <a href="contact.html" class="btn btn-outline">
            <i class="fas fa-phone"></i> Nous Contacter
          </a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header reveal-left">
          <span class="section-badge">AUTRES SERVICES</span>
          <h2 class="section-title">Services <span>Connexes</span></h2>
        </div>
        <div class="grid-3">
          ${related.map((s, i) => `
            <a href="service-detail.html?id=${s.id}" class="service-card reveal stagger-${i + 1}" style="text-decoration:none">
              <span class="service-card-icon">${s.icon}</span>
              <div>
                <div class="service-card-title">${s.title}</div>
                <div class="service-card-subtitle">${s.subtitle}</div>
              </div>
              <p class="service-card-desc">${s.shortDesc}</p>
              <span class="service-card-link">Voir les détails <i class="fas fa-arrow-right"></i></span>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
  `;

  // Trigger animations
  setTimeout(() => {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
      }, { threshold: 0.1 });
      observer.observe(el);
    });
  }, 100);
}

// Realisation Detail Page
async function loadRealisationDetail() {
  const container = document.getElementById('realisation-detail-content');
  if (!container) return;

  const id = getURLParam('id');
  if (!id) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Réalisation introuvable.</p><a href="realisations.html" class="btn btn-primary" style="margin-top:1rem">Voir toutes les réalisations</a></div>';
    return;
  }

  let project = null;
  try {
    const API = typeof JUDDEV_CONFIG !== 'undefined' ? JUDDEV_CONFIG.API_URL : 'http://localhost:5000/api';
    const res = await fetch(`${API}/realisations/${id}`);
    if (res.ok) {
      project = await res.json();
      if (!project.images || !project.images.length) project.images = [project.image].filter(Boolean);
      if (!project.highlights) project.highlights = [];
      if (!project.technologies) project.technologies = [];
      if (!project.longDesc) project.longDesc = project.description || project.shortDesc || '';
    }
  } catch(e) {}

  if (!project && typeof JUDDEV_DATA !== 'undefined') {
    project = getRealisationById(id);
  }

  if (!project) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Réalisation introuvable.</p><a href="realisations.html" class="btn btn-primary" style="margin-top:1rem">Voir toutes les réalisations</a></div>';
    return;
  }

  document.title = `${project.title} - JUDDEV CORPORATION`;
  const heroTitle = document.getElementById('page-hero-title');
  const breadcrumbCurrent = document.getElementById('breadcrumb-current');
  if (heroTitle) heroTitle.textContent = project.title;
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = project.title;

  const related = typeof JUDDEV_DATA !== 'undefined' ? JUDDEV_DATA.realisations.filter(r => r.id !== id).slice(0, 3) : [];
  const service = typeof getServiceById === 'function' ? getServiceById(project.service) : null;

  container.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="project-layout">
          <div>
            <div class="reveal">
              <div class="image-gallery">
                <div class="gallery-main">
                  <img src="${project.images[0] || project.image}" alt="${project.title}" onerror="this.style.background='linear-gradient(135deg,#0066ff22,#00d4ff22)'" />
                </div>
                ${project.images.slice(1).map(img => `
                  <div class="gallery-thumb">
                    <img src="${img}" alt="${project.title}" onerror="this.style.background='linear-gradient(135deg,#0066ff22,#00d4ff22)'" />
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="article-content reveal" style="margin-top:2rem">
              <h2>Description du projet</h2>
              <p>${project.longDesc}</p>

              <h3>Points forts</h3>
              <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;margin:1rem 0">
                ${project.highlights.map(h => `
                  <div class="highlight-card">
                    <div class="highlight-icon"><i class="fas fa-star"></i></div>
                    <span style="font-weight:600;color:var(--text-primary)">${h}</span>
                  </div>
                `).join('')}
              </div>

              <h3>Technologies utilisées</h3>
              <div class="tech-stack" style="margin-top:1rem">
                ${project.technologies.map(t => `<span class="tech-badge">${t}</span>`).join('')}
              </div>

              <div style="margin-top:2rem;display:flex;gap:1rem;flex-wrap:wrap">
                <a href="${project.url && project.url !== '#' ? project.url : '#'}" ${project.url && project.url !== '#' ? 'target="_blank"' : ''} class="btn btn-primary" ${!project.url || project.url === '#' ? 'style="opacity:0.5;cursor:default"' : ''}>
                  <i class="fas fa-external-link-alt"></i> Visiter le projet
                </a>
                <a href="${project.youtubeUrl || '#'}" ${project.youtubeUrl ? 'target="_blank"' : ''} class="btn btn-outline" style="border-color:#ff0000;color:#ff4444${!project.youtubeUrl ? ';opacity:0.5;cursor:default' : ''}">
                  <i class="fab fa-youtube"></i> Voir la démo YouTube
                </a>
              </div>
            </div>
          </div>

          <div class="project-sidebar">
            <div class="project-info-card reveal stagger-2">
              <div class="project-info-header">
                <h3>Informations Projet</h3>
              </div>
              <div class="project-info-body">
                <div class="project-info-row">
                  <span class="project-info-label">Client</span>
                  <span class="project-info-value">${project.client}</span>
                </div>
                <div class="project-info-row">
                  <span class="project-info-label">Année</span>
                  <span class="project-info-value">${project.year}</span>
                </div>
                <div class="project-info-row">
                  <span class="project-info-label">Catégorie</span>
                  <span class="project-info-value">${project.category}</span>
                </div>
                <div class="project-info-row">
                  <span class="project-info-label">Secteur</span>
                  <span class="project-info-value">${project.sector}</span>
                </div>
                ${service ? `
                <div class="project-info-row">
                  <span class="project-info-label">Service</span>
                  <a href="service-detail.html?id=${service.id}" class="project-info-value" style="color:var(--accent-light)">${service.title}</a>
                </div>` : ''}
              </div>
            </div>
            <div style="margin-top:1.5rem">
              <button class="btn btn-primary" style="width:100%" onclick="window.openDevisModal && window.openDevisModal()">
                <i class="fas fa-paper-plane"></i> Projet similaire ?
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" style="background:var(--bg-secondary);border-top:1px solid var(--border-color)">
      <div class="container">
        <div class="section-header reveal-left">
          <h2 class="section-title">Autres <span>Réalisations</span></h2>
        </div>
        <div class="grid-3">
          ${related.map((r, i) => `
            <a href="realisation-detail.html?id=${r.id}" class="realisation-card reveal stagger-${i + 1}" style="text-decoration:none">
              <div class="realisation-card-img">
                <img src="${r.image}" alt="${r.title}" onerror="this.style.background='linear-gradient(135deg,#0066ff22,#00d4ff22)'" />
                <div class="realisation-card-overlay">
                  <span class="overlay-btn">Voir la Réalisation</span>
                </div>
              </div>
              <div class="realisation-card-body">
                <span class="category-tag">${r.category}</span>
                <h3 class="realisation-card-title">${r.title}</h3>
                <p class="realisation-card-desc">${r.shortDesc}</p>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
  `;

  setTimeout(() => {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
      }, { threshold: 0.1 });
      observer.observe(el);
    });
  }, 100);
}

// Article Detail Page
async function loadArticleDetail() {
  const container = document.getElementById('article-detail-content');
  if (!container) return;

  const id = getURLParam('id');
  if (!id) {
    container.innerHTML = '<div class="empty-state"><p>Article introuvable.</p><a href="blog.html" class="btn btn-primary" style="margin-top:1rem">Voir tous les articles</a></div>';
    return;
  }

  // Cache d'abord (affichage instantané), sinon fetch API (nouvel article)
  let article = (typeof getArticleById === 'function') ? getArticleById(id) : null;
  if (!article) {
    try {
      const res = await fetch(JUDDEV_CONFIG.API_URL + '/articles/' + id);
      if (res.ok) article = await res.json();
    } catch (e) {}
  }

  if (!article) {
    container.innerHTML = '<div class="empty-state"><p>Article introuvable.</p><a href="blog.html" class="btn btn-primary" style="margin-top:1rem">Voir tous les articles</a></div>';
    return;
  }

  document.title = `${article.title} - JUDDEV Blog`;
  const heroTitle = document.getElementById('page-hero-title');
  const breadcrumbCurrent = document.getElementById('breadcrumb-current');
  if (heroTitle) heroTitle.textContent = article.title;
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = article.category;

  // Hero bg
  const heroBg = document.getElementById('page-hero-img');
  if (heroBg) heroBg.src = article.image;

  const recent = JUDDEV_DATA.articles.filter(a => a.id !== id).slice(0, 4);
  const related = JUDDEV_DATA.articles.filter(a => a.id !== id).slice(0, 3);

  container.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="article-layout">
          <div>
            <div class="article-content reveal">
              <div style="margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1px solid var(--border-color)">
                <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:1rem">
                  <span class="category-tag">${article.category}</span>
                  <span style="font-size:0.875rem;color:var(--text-dim)">${formatDate(article.date)}</span>
                </div>
                <h1 style="font-size:clamp(1.5rem,3vw,2.25rem);font-weight:800;color:var(--text-primary);margin-bottom:1rem;line-height:1.3">${article.title}</h1>
                <div style="display:flex;align-items:center;gap:0.75rem">
                  <div class="author-avatar">${getAuthorInitials(article.author)}</div>
                  <div>
                    <div style="font-weight:700;font-size:0.875rem;color:var(--text-primary)">${article.author}</div>
                    <div style="font-size:0.75rem;color:var(--text-dim)">JUDDEV CORPORATION</div>
                  </div>
                </div>
              </div>
              <img src="${article.image}" alt="${article.title}" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:var(--radius-lg);margin-bottom:2rem" onerror="this.style.display='none'" />
              ${article.content}
              <div style="margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--border-color)">
                <strong style="font-size:0.875rem;color:var(--text-secondary)">Tags :</strong>
                <div class="tags-cloud" style="margin-top:0.75rem">
                  ${article.tags.map(t => `<span class="tag">${t}</span>`).join('')}
                </div>
              </div>
            </div>

            <div id="comments-section" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-xl);padding:2rem;margin-top:2rem">
              <h3 style="font-size:1.25rem;font-weight:700;color:var(--text-primary);margin-bottom:1.5rem">💬 Commentaires</h3>
              <div id="comments-list" style="margin-bottom:2rem"></div>
              <form id="comment-form">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
                  <input id="comment-name" class="form-input" placeholder="Votre nom *" required />
                  <input id="comment-email" class="form-input" type="email" placeholder="Votre email (optionnel)" />
                </div>
                <textarea id="comment-text" class="form-input" rows="4" placeholder="Votre commentaire..." required style="width:100%;margin-bottom:1rem"></textarea>
                <button type="submit" class="btn btn-primary" id="comment-submit-btn">Envoyer le commentaire</button>
              </form>
            </div>
          </div>

          <div class="article-sidebar">
            <div class="sidebar-widget reveal stagger-2">
              <h3 class="sidebar-widget-title">Articles récents</h3>
              ${recent.map(a => `
                <div class="recent-article-item" onclick="location.href='article-detail.html?id=${a.id}'">
                  <div class="recent-article-thumb">
                    <img src="${a.image}" alt="${a.title}" onerror="this.style.background='var(--bg-secondary)'" />
                  </div>
                  <div>
                    <div class="recent-article-title">${a.title}</div>
                    <div class="recent-article-date">${formatDate(a.date)}</div>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="sidebar-widget reveal stagger-3">
              <h3 class="sidebar-widget-title">Catégories</h3>
              <div style="display:flex;flex-direction:column;gap:0.5rem">
                ${[...new Set(JUDDEV_DATA.articles.map(a => a.category))].map(cat => `
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.04)">
                    <span style="color:var(--text-muted);font-size:0.875rem">${cat}</span>
                    <span style="background:rgba(0,102,255,0.1);border:1px solid rgba(0,102,255,0.2);border-radius:20px;padding:0.15rem 0.6rem;font-size:0.75rem;color:var(--accent-light)">${JUDDEV_DATA.articles.filter(a => a.category === cat).length}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="sidebar-widget reveal stagger-4">
              <h3 class="sidebar-widget-title">Tags</h3>
              <div class="tags-cloud">
                ${[...new Set(JUDDEV_DATA.articles.flatMap(a => a.tags))].map(t => `<a href="#" class="tag">${t}</a>`).join('')}
              </div>
            </div>

            <div class="sidebar-widget reveal stagger-5" style="background:linear-gradient(135deg,rgba(0,102,255,0.1),rgba(0,212,255,0.05));border-color:rgba(0,102,255,0.25)">
              <h3 style="font-size:1.1rem;font-weight:700;color:var(--text-primary);margin-bottom:1rem">Besoin d'un projet ?</h3>
              <p style="font-size:0.875rem;color:var(--text-muted);margin-bottom:1.25rem">Transformons votre idée en réalité numérique.</p>
              <button class="btn btn-primary btn-sm" style="width:100%" onclick="window.openDevisModal && window.openDevisModal()">Demander un Devis</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" style="background:var(--bg-secondary);border-top:1px solid var(--border-color)">
      <div class="container">
        <div class="section-header reveal-left">
          <h2 class="section-title">Articles <span>Connexes</span></h2>
        </div>
        <div class="grid-3">
          ${related.map((a, i) => `
            <a href="article-detail.html?id=${a.id}" class="blog-card reveal stagger-${i + 1}" style="text-decoration:none">
              <div class="blog-card-img">
                <img src="${a.image}" alt="${a.title}" onerror="this.style.background='var(--bg-secondary)'" />
              </div>
              <div class="blog-card-body">
                <div class="blog-card-meta">
                  <span class="blog-card-category">${a.category}</span>
                  <span class="blog-card-date">${formatDate(a.date)}</span>
                </div>
                <h3 class="blog-card-title">${a.title}</h3>
                <p class="blog-card-excerpt">${a.shortDesc}</p>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
  `;

  // Contenu chargé async — forcer visible directement (pas d'IntersectionObserver)
  container.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    el.classList.add('visible');
  });

  // Load comments for this article
  loadArticleComments(id);

  // Comment form submission
  const commentForm = document.getElementById('comment-form');
  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('comment-name').value.trim();
      const email = document.getElementById('comment-email').value.trim();
      const text = document.getElementById('comment-text').value.trim();
      const btn = document.getElementById('comment-submit-btn');
      btn.disabled = true;
      btn.textContent = 'Envoi...';
      try {
        const res = await fetch(JUDDEV_CONFIG.API_URL + '/articles/' + id + '/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, text })
        });
        if (res.ok) {
          commentForm.reset();
          showNotification('success', 'Commentaire envoyé !', 'Votre commentaire a été publié.');
          loadArticleComments(id);
        } else {
          const data = await res.json().catch(() => ({}));
          showNotification('error', 'Erreur', data.message || 'Impossible d\'envoyer le commentaire.');
        }
      } catch (err) {
        showNotification('error', 'Erreur réseau', 'Veuillez réessayer.');
      }
      btn.disabled = false;
      btn.textContent = 'Envoyer le commentaire';
    });
  }
}

function renderComments(comments) {
  const list = document.getElementById('comments-list');
  if (!list) return;
  if (!comments || !comments.length) {
    list.innerHTML = '<p style="color:var(--text-muted);font-size:0.875rem">Aucun commentaire pour l\'instant. Soyez le premier !</p>';
    return;
  }
  list.innerHTML = comments.map(c => `
    <div style="padding:1rem;background:var(--bg-secondary);border-radius:var(--radius-lg);margin-bottom:1rem;border:1px solid var(--border-color)">
      <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem">
        <div style="width:2rem;height:2rem;border-radius:50%;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;color:#fff;flex-shrink:0">${(c.name||'?')[0].toUpperCase()}</div>
        <div>
          <div style="font-weight:600;font-size:0.875rem;color:var(--text-primary)">${escapeHtml(c.name)}</div>
          <div style="font-size:0.75rem;color:var(--text-dim)">${new Date(c.date).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })}</div>
        </div>
      </div>
      <p style="color:var(--text-secondary);font-size:0.875rem;line-height:1.6;white-space:pre-wrap;margin:0">${escapeHtml(c.text)}</p>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function loadArticleComments(articleId) {
  try {
    const res = await fetch(JUDDEV_CONFIG.API_URL + '/articles/' + articleId);
    if (res.ok) {
      const data = await res.json();
      renderComments(data.comments || []);
    }
  } catch (e) { /* silent */ }
}

// Auto-initialize detail pages
document.addEventListener('DOMContentLoaded', () => {
  loadServiceDetail();
  loadRealisationDetail();
  loadArticleDetail();
});

// ============================================================
// COUNTER ANIMATION
// ============================================================
function animateCounter(el) {
  const target = parseInt(el.dataset.target || el.textContent, 10);
  const duration = 2000;
  const start = performance.now();
  const suffix = el.dataset.suffix || '';

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// Init counters on scroll
document.querySelectorAll('.counter').forEach(el => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(el);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  observer.observe(el);
});

// ============================================================
// BACK TO TOP
// ============================================================
(function initBackToTop() {
  const btn = document.createElement('button');
  btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
  btn.style.cssText = `
    position:fixed;bottom:2rem;right:2rem;z-index:500;
    width:44px;height:44px;border-radius:50%;
    background:var(--gradient-primary);color:white;
    display:flex;align-items:center;justify-content:center;
    border:none;cursor:pointer;
    box-shadow:0 0 20px rgba(0,102,255,0.4);
    transition:all 0.3s ease;
    opacity:0;transform:translateY(10px);
    font-size:1rem;
  `;
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.style.opacity = '1';
      btn.style.transform = 'translateY(0)';
    } else {
      btn.style.opacity = '0';
      btn.style.transform = 'translateY(10px)';
    }
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  btn.addEventListener('mouseenter', () => btn.style.transform = 'translateY(-3px) scale(1.1)');
  btn.addEventListener('mouseleave', () => btn.style.transform = 'translateY(0) scale(1)');
})();

// ============================================================
// DARK / LIGHT MODE - Apply saved theme immediately
// ============================================================
(function initTheme() {
  const saved = localStorage.getItem('juddev_theme') || 'dark';
  if (saved === 'light') {
    document.documentElement.classList.add('light-mode');
  }
})();

// ============================================================
// AUTO-INJECT NAVBAR CONTROLS (theme + lang) & FOOTER LOGO
// ============================================================
(function injectUIControls() {
  function inject() {
    // --- Navbar Controls ---
    if (!document.getElementById('theme-toggle')) {
      const navbarCta = document.querySelector('.navbar-cta');
      if (navbarCta) {
        const controls = document.createElement('div');
        controls.className = 'navbar-controls';
        controls.innerHTML = `
          <button class="theme-toggle-btn" id="theme-toggle" title="Changer le thème">
            <i class="fas fa-sun"></i>
          </button>
          <div class="lang-switcher">
            <button class="lang-btn lang-active" id="lang-fr">FR</button>
            <button class="lang-btn" id="lang-en">EN</button>
          </div>
        `;
        navbarCta.insertAdjacentElement('afterend', controls);
      }
    }

    // --- Footer Logo ---
    const footerLogoLink = document.querySelector('footer .footer-logo');
    if (footerLogoLink && !footerLogoLink.previousElementSibling?.classList.contains('footer-logo-img')) {
      const img = document.createElement('img');
      img.src = 'images/JUDDEV.jpg';
      img.className = 'footer-logo-img';
      img.alt = 'JUDDEV CORPORATION Logo';
      img.loading = 'lazy';
      img.onerror = function() { this.style.display = 'none'; };
      footerLogoLink.parentElement.insertBefore(img, footerLogoLink);
    }

    // --- Mobile Nav Controls ---
    const mobileNav = document.querySelector('.navbar-mobile');
    if (mobileNav && !document.getElementById('theme-toggle-m')) {
      const mobileCtrl = document.createElement('div');
      mobileCtrl.className = 'mobile-nav-controls';
      mobileCtrl.innerHTML = `
        <button class="theme-toggle-btn" id="theme-toggle-m" title="Changer le thème">
          <i class="fas fa-sun"></i>
        </button>
        <div class="lang-switcher">
          <button class="lang-btn lang-active" id="lang-fr-m">FR</button>
          <button class="lang-btn" id="lang-en-m">EN</button>
        </div>
      `;
      mobileNav.appendChild(mobileCtrl);
    }

    // --- Wire up controls ---
    function applyTheme(next) {
      if (next === 'light') {
        document.documentElement.classList.add('light-mode');
      } else {
        document.documentElement.classList.remove('light-mode');
      }
      localStorage.setItem('juddev_theme', next);
      const cls = next === 'light' ? 'fas fa-moon' : 'fas fa-sun';
      const ic1 = document.getElementById('theme-toggle')?.querySelector('i');
      const ic2 = document.getElementById('theme-toggle-m')?.querySelector('i');
      if (ic1) ic1.className = cls;
      if (ic2) ic2.className = cls;
      const t1 = document.getElementById('theme-toggle');
      const t2 = document.getElementById('theme-toggle-m');
      const title = next === 'light' ? 'Mode sombre' : 'Mode clair';
      if (t1) t1.title = title;
      if (t2) t2.title = title;
    }

    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      const current = localStorage.getItem('juddev_theme') || 'dark';
      const icon = themeBtn.querySelector('i');
      if (icon) icon.className = current === 'light' ? 'fas fa-moon' : 'fas fa-sun';
      themeBtn.title = current === 'light' ? 'Mode sombre' : 'Mode clair';
      themeBtn.addEventListener('click', () => {
        const next = (localStorage.getItem('juddev_theme') || 'dark') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    }

    const themeBtnM = document.getElementById('theme-toggle-m');
    if (themeBtnM) {
      const curM = localStorage.getItem('juddev_theme') || 'dark';
      const iconM = themeBtnM.querySelector('i');
      if (iconM) iconM.className = curM === 'light' ? 'fas fa-moon' : 'fas fa-sun';
      themeBtnM.addEventListener('click', () => {
        const next = (localStorage.getItem('juddev_theme') || 'dark') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    }

    const frBtn = document.getElementById('lang-fr');
    const enBtn = document.getElementById('lang-en');
    if (frBtn) frBtn.addEventListener('click', () => { if (typeof JUDDEV_I18N !== 'undefined') JUDDEV_I18N.setLang('fr'); });
    if (enBtn) enBtn.addEventListener('click', () => { if (typeof JUDDEV_I18N !== 'undefined') JUDDEV_I18N.setLang('en'); });

    const frBtnM = document.getElementById('lang-fr-m');
    const enBtnM = document.getElementById('lang-en-m');
    if (frBtnM) frBtnM.addEventListener('click', () => { if (typeof JUDDEV_I18N !== 'undefined') JUDDEV_I18N.setLang('fr'); });
    if (enBtnM) enBtnM.addEventListener('click', () => { if (typeof JUDDEV_I18N !== 'undefined') JUDDEV_I18N.setLang('en'); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();

// ============================================================
// SOCIAL LINKS — apply from API data to footer + contact page
// ============================================================
(function initSocialLinks() {
  const PLATFORM_MAP = {
    linkedin:  { ariaLabel: 'LinkedIn',   iconClass: 'fa-linkedin-in' },
    youtube:   { ariaLabel: 'YouTube',    iconClass: 'fa-youtube' },
    whatsapp:  { ariaLabel: 'WhatsApp',   iconClass: 'fa-whatsapp' },
    facebook:  { ariaLabel: 'Facebook',   iconClass: 'fa-facebook-f' },
    twitter:   { ariaLabel: 'Twitter',    iconClass: 'fa-twitter' },
    github:    { ariaLabel: 'GitHub',     iconClass: 'fa-github' },
    instagram: { ariaLabel: 'Instagram',  iconClass: 'fa-instagram' }
  };

  function applyLinks(social) {
    if (!social) return;
    Object.entries(PLATFORM_MAP).forEach(([key, meta]) => {
      const url = social[key];
      if (!url || url === '#' || url === '') return;

      // Footer social links (aria-label)
      document.querySelectorAll(`.footer-social a[aria-label="${meta.ariaLabel}"]`).forEach(a => {
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      });

      // Contact page social-link-card (find by icon class)
      document.querySelectorAll('.social-link-card').forEach(card => {
        if (card.querySelector(`.${meta.iconClass}`)) {
          card.href = url;
          card.target = '_blank';
          card.rel = 'noopener noreferrer';
        }
      });
    });
  }

  function init() {
    // Apply immediately from cached/default data if available
    if (typeof JUDDEV_DATA !== 'undefined' && JUDDEV_DATA.contacts?.social) {
      applyLinks(JUDDEV_DATA.contacts.social);
    }
    // Re-apply when API data arrives
    document.addEventListener('juddev:dataUpdated', (e) => {
      if (e.detail?.contacts?.social) applyLinks(e.detail.contacts.social);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
