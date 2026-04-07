/* ============================================================
   JUDDEV CORPORATION - Dashboard JavaScript
   Full CRUD management via Backend API
   ============================================================ */

'use strict';

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuth()) return;

  // Update user info in sidebar
  const user = JSON.parse(localStorage.getItem('juddev_user') || '{}');
  const avatarEl = document.querySelector('.sidebar-footer-avatar');
  const userNameEl = document.querySelector('.sidebar-footer-user > div > div:first-child');
  if (user.email && userNameEl) {
    userNameEl.textContent = user.email.split('@')[0];
  }

  initNavigation();
  await loadDashboardStats();
  updateSyncTime();
});

function updateSyncTime() {
  const el = document.getElementById('sync-time');
  if (el) el.textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(type, title, message) {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info', warning: 'fa-triangle-exclamation' };
  const colors = { success: '#22c55e', error: '#ef4444', info: '#3b82f6', warning: '#f59e0b' };

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.style.cssText = `
    position:fixed;top:1.5rem;right:1.5rem;z-index:9999;
    background:var(--bg-card);border:1px solid var(--border-color);
    border-radius:0.75rem;padding:1rem 1.25rem;
    display:flex;align-items:flex-start;gap:0.75rem;min-width:280px;max-width:380px;
    box-shadow:0 10px 40px rgba(0,0,0,0.5);
    animation:toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
  `;
  toast.innerHTML = `
    <style>@keyframes toastIn{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}</style>
    <i class="fas ${icons[type] || icons.info}" style="color:${colors[type] || colors.info};font-size:1.1rem;margin-top:0.1rem;flex-shrink:0"></i>
    <div style="flex:1">
      <div style="font-weight:600;font-size:0.875rem;color:var(--text-primary);margin-bottom:0.2rem">${title}</div>
      <div style="font-size:0.8rem;color:var(--text-muted)">${message}</div>
    </div>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:0.9rem;flex-shrink:0">
      <i class="fas fa-xmark"></i>
    </button>
  `;
  document.body.appendChild(toast);
  setTimeout(() => { if (toast.parentElement) toast.remove(); }, 5000);
}

// ============================================================
// NAVIGATION
// ============================================================
function initNavigation() {
  const hamburger = document.getElementById('sidebar-hamburger');
  const sidebar = document.querySelector('.sidebar');

  // Create backdrop overlay for mobile sidebar
  const overlay = document.createElement('div');
  overlay.id = 'sidebar-overlay';
  overlay.style.cssText = `
    display:none;position:fixed;inset:0;
    background:rgba(0,0,0,0.55);z-index:99;
    backdrop-filter:blur(2px);cursor:pointer;
  `;
  document.body.appendChild(overlay);

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  if (hamburger && sidebar) {
    hamburger.addEventListener('click', () => {
      if (sidebar.classList.contains('open')) closeSidebar();
      else openSidebar();
    });
  }

  overlay.addEventListener('click', closeSidebar);

  const closeBtn = document.getElementById('sidebar-close');
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);

  document.querySelectorAll('[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.section);
      if (window.innerWidth <= 900) closeSidebar();
    });
  });
}

async function navigateTo(sectionId) {
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
  if (activeLink) activeLink.classList.add('active');

  document.querySelectorAll('.section-view').forEach(s => s.classList.remove('active'));
  const section = document.getElementById(`section-${sectionId}`);
  if (section) section.classList.add('active');

  const titles = {
    'dashboard': 'Tableau de Bord',
    'services': 'Services',
    'realisations': 'Réalisations',
    'articles': 'Articles de Blog',
    'formations': 'Formations',
    'contacts': 'Contacts & Infos',
    'partenaires': 'Gestion des Partenaires',
    'messages': 'Messages Reçus',
    'team': 'Gestion de l\'Équipe',
    'faq': 'FAQ - Questions Fréquentes',
    'newsletter': 'Abonnés Newsletter',
    'commentaires': 'Commentaires Articles'
  };
  const titleEl = document.getElementById('topbar-title');
  if (titleEl) titleEl.textContent = titles[sectionId] || sectionId;

  // Load section data
  switch (sectionId) {
    case 'dashboard': await loadDashboardStats(); break;
    case 'services': await loadServices(); break;
    case 'realisations': await loadRealisations(); break;
    case 'articles': await loadArticles(); break;
    case 'formations': await loadFormations(); break;
    case 'contacts': await loadContacts(); break;
    case 'partenaires': await loadPartenaires(); break;
    case 'messages': await loadMessages(); break;
    case 'newsletter': await loadNewsletter(); break;
    case 'commentaires': await loadAllComments(); break;
    case 'team': await loadTeam(); break;
    case 'faq': await loadFAQ(); break;
  }
}

// ============================================================
// DASHBOARD STATS
// ============================================================
async function loadDashboardStats() {
  const section = document.getElementById('section-dashboard');
  if (!section) return;

  section.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:200px">
    <div style="text-align:center"><i class="fas fa-circle-notch fa-spin" style="font-size:2rem;color:var(--accent-blue)"></i>
    <p style="color:var(--text-muted);margin-top:1rem">Chargement...</p></div></div>`;

  try {
    const [services, realisations, articles, formations, messages] = await Promise.all([
      apiGet('/services').catch(() => []),
      apiGet('/realisations').catch(() => []),
      apiGet('/articles').catch(() => []),
      apiGet('/formations').catch(() => []),
      apiGet('/contact/messages').catch(() => [])
    ]);

    const unread = (messages || []).filter(m => !m.read).length;
    const stats = [
      { icon: 'fa-gears', label: 'Services', count: (services||[]).length, color: '#0066ff', section: 'services' },
      { icon: 'fa-trophy', label: 'Réalisations', count: (realisations||[]).length, color: '#00d4ff', section: 'realisations' },
      { icon: 'fa-newspaper', label: 'Articles', count: (articles||[]).length, color: '#8b5cf6', section: 'articles' },
      { icon: 'fa-graduation-cap', label: 'Formations', count: (formations||[]).length, color: '#22c55e', section: 'formations' },
      { icon: 'fa-envelope', label: 'Messages', count: (messages||[]).length, color: '#f59e0b', section: 'messages', badge: unread }
    ];

    // Update nav badges
    const badgeMap = { services: services?.length, realisations: realisations?.length, articles: articles?.length, messages: unread };
    Object.entries(badgeMap).forEach(([key, val]) => {
      const badge = document.getElementById(`badge-${key}`);
      if (badge) badge.textContent = val || 0;
    });

    section.innerHTML = `
      <div style="margin-bottom:2rem">
        <h2 style="font-size:1.5rem;font-weight:700;color:var(--text-primary);margin-bottom:0.25rem">
          Bonjour, <span style="background:var(--gradient-primary);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">JUDDEV Admin</span> 👋
        </h2>
        <p style="color:var(--text-muted);font-size:0.875rem">Bienvenue dans votre espace d'administration</p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1rem;margin-bottom:2rem">
        ${stats.map(s => `
          <div onclick="navigateTo('${s.section}')" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:1rem;padding:1.5rem;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden"
               onmouseover="this.style.borderColor='${s.color}';this.style.transform='translateY(-2px)'"
               onmouseout="this.style.borderColor='var(--border-color)';this.style.transform='translateY(0)'">
            <div style="width:44px;height:44px;border-radius:0.75rem;background:${s.color}20;display:flex;align-items:center;justify-content:center;margin-bottom:1rem">
              <i class="fas ${s.icon}" style="color:${s.color};font-size:1.1rem"></i>
            </div>
            <div style="font-size:2rem;font-weight:800;color:var(--text-primary);line-height:1">${s.count}</div>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.25rem">${s.label}</div>
            ${s.badge ? `<div style="position:absolute;top:1rem;right:1rem;background:${s.color};color:white;border-radius:999px;min-width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;padding:0 0.35rem">${s.badge}</div>` : ''}
          </div>
        `).join('')}
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem">
        <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:1rem;padding:1.5rem">
          <h3 style="font-size:1rem;font-weight:700;color:var(--text-primary);margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem">
            <i class="fas fa-bolt" style="color:var(--accent-blue)"></i> Actions Rapides
          </h3>
          <div style="display:flex;flex-direction:column;gap:0.5rem">
            ${[
              {icon:'fa-plus',label:'Ajouter un Service',section:'services'},
              {icon:'fa-plus',label:'Ajouter un Article',section:'articles'},
              {icon:'fa-plus',label:'Ajouter une Réalisation',section:'realisations'},
              {icon:'fa-envelope',label:'Voir les Messages',section:'messages'}
            ].map(a => `
              <button onclick="navigateTo('${a.section}')" style="background:rgba(0,102,255,0.05);border:1px solid var(--border-color);border-radius:0.5rem;padding:0.65rem 1rem;color:var(--text-muted);font-size:0.8rem;cursor:pointer;text-align:left;display:flex;align-items:center;gap:0.6rem;transition:all 0.2s;font-family:inherit"
                onmouseover="this.style.background='rgba(0,102,255,0.12)';this.style.color='var(--text-primary)'"
                onmouseout="this.style.background='rgba(0,102,255,0.05)';this.style.color='var(--text-muted)'">
                <i class="fas ${a.icon}" style="color:var(--accent-blue)"></i> ${a.label}
              </button>
            `).join('')}
          </div>
        </div>

        <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:1rem;padding:1.5rem">
          <h3 style="font-size:1rem;font-weight:700;color:var(--text-primary);margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem">
            <i class="fas fa-circle-info" style="color:var(--accent-cyan)"></i> Système
          </h3>
          <div style="display:flex;flex-direction:column;gap:0.75rem">
            <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:0.5rem;border-bottom:1px solid rgba(255,255,255,0.04)">
              <span style="font-size:0.8rem;color:var(--text-muted)">API Backend</span>
              <span style="font-size:0.75rem;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);color:#4ade80;border-radius:999px;padding:0.15rem 0.6rem;font-weight:600">✓ Connecté</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:0.5rem;border-bottom:1px solid rgba(255,255,255,0.04)">
              <span style="font-size:0.8rem;color:var(--text-muted)">Base de données</span>
              <span style="font-size:0.75rem;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);color:#4ade80;border-radius:999px;padding:0.15rem 0.6rem;font-weight:600">✓ MongoDB</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:0.8rem;color:var(--text-muted)">Dernière synchro</span>
              <span style="font-size:0.75rem;color:var(--text-muted)">${new Date().toLocaleString('fr-FR')}</span>
            </div>
          </div>
          <div style="margin-top:1rem">
            <a href="http://localhost:5000" target="_blank" style="display:flex;align-items:center;gap:0.5rem;background:var(--gradient-primary);color:white;border-radius:0.5rem;padding:0.6rem 1rem;text-decoration:none;font-size:0.8rem;font-weight:600">
              <i class="fas fa-arrow-up-right-from-square"></i> Voir le site vitrine
            </a>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    section.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--text-muted)">
      <i class="fas fa-triangle-exclamation" style="font-size:2rem;color:var(--accent-blue);margin-bottom:1rem"></i>
      <p>Erreur de chargement. Vérifiez que le backend est démarré.</p>
      <p style="font-size:0.8rem;margin-top:0.5rem">${err.message}</p>
    </div>`;
  }
}

// ============================================================
// GENERIC LIST VIEW BUILDER
// ============================================================
function buildListSection(containerId, { title, addLabel, onAdd, items, renderItem }) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
      <h2 style="font-size:1.25rem;font-weight:700;color:var(--text-primary)">${title}</h2>
      <button onclick="${onAdd}()" class="btn-add" style="background:var(--gradient-primary);border:none;color:white;padding:0.65rem 1.25rem;border-radius:0.5rem;font-size:0.85rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:0.5rem;font-family:inherit">
        <i class="fas fa-plus"></i> ${addLabel}
      </button>
    </div>
    <div id="${containerId}-list" style="display:flex;flex-direction:column;gap:0.75rem">
      ${items.length === 0 ? `<div style="text-align:center;padding:3rem;color:var(--text-muted);border:1px dashed var(--border-color);border-radius:1rem">Aucun élément. Cliquez sur "Ajouter" pour commencer.</div>` : items.map(renderItem).join('')}
    </div>
  `;
}

function itemCard(opts) {
  const { image, title, subtitle, badge, onEdit, onDelete, extra = '' } = opts;
  const imgHtml = image
    ? `<img src="${resolveImageUrl(image)}" style="width:56px;height:56px;object-fit:cover;border-radius:0.5rem;flex-shrink:0" onerror="this.style.background='var(--bg-secondary)';this.src=''" />`
    : `<div style="width:56px;height:56px;background:rgba(0,102,255,0.1);border-radius:0.5rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.5rem">${opts.icon || '📄'}</div>`;

  return `
    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:0.75rem;padding:1rem;display:flex;align-items:center;gap:1rem;transition:border-color 0.2s"
         onmouseover="this.style.borderColor='rgba(0,102,255,0.4)'" onmouseout="this.style.borderColor='var(--border-color)'">
      ${imgHtml}
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;color:var(--text-primary);font-size:0.9rem;margin-bottom:0.2rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${title}</div>
        <div style="font-size:0.78rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${subtitle || ''}</div>
        ${extra}
      </div>
      ${badge ? `<span style="background:rgba(0,102,255,0.1);border:1px solid rgba(0,102,255,0.2);color:var(--accent-light);border-radius:999px;padding:0.2rem 0.65rem;font-size:0.72rem;font-weight:600;flex-shrink:0">${badge}</span>` : ''}
      <div style="display:flex;gap:0.5rem;flex-shrink:0">
        <button onclick="${onEdit}" style="background:rgba(0,102,255,0.1);border:1px solid rgba(0,102,255,0.2);color:var(--accent-light);border-radius:0.375rem;padding:0.45rem 0.7rem;cursor:pointer;font-size:0.8rem;transition:all 0.2s;font-family:inherit"
          onmouseover="this.style.background='rgba(0,102,255,0.2)'" onmouseout="this.style.background='rgba(0,102,255,0.1)'">
          <i class="fas fa-pen"></i>
        </button>
        <button onclick="${onDelete}" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171;border-radius:0.375rem;padding:0.45rem 0.7rem;cursor:pointer;font-size:0.8rem;transition:all 0.2s;font-family:inherit"
          onmouseover="this.style.background='rgba(239,68,68,0.2)'" onmouseout="this.style.background='rgba(239,68,68,0.1)'">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;
}

// ============================================================
// CONFIRMATION MODAL
// ============================================================
function confirmDelete(itemLabel, onConfirm) {
  let modal = document.getElementById('confirm-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'confirm-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:1rem';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div style="position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(4px)" onclick="closeConfirm()"></div>
    <div style="position:relative;background:var(--bg-card);border:1px solid rgba(239,68,68,0.3);border-radius:1.25rem;width:100%;max-width:420px;padding:2rem;box-shadow:0 25px 80px rgba(0,0,0,0.6);text-align:center">
      <div style="width:56px;height:56px;background:rgba(239,68,68,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem">
        <i class="fas fa-triangle-exclamation" style="color:#f87171;font-size:1.5rem"></i>
      </div>
      <h3 style="font-size:1.1rem;font-weight:700;color:var(--text-primary);margin-bottom:0.5rem">Confirmer la suppression</h3>
      <p style="color:var(--text-muted);font-size:0.875rem;margin-bottom:1.5rem">
        Vous êtes sur le point de supprimer <strong style="color:var(--text-primary)">${itemLabel}</strong>.<br/>
        Cette action est <strong style="color:#f87171">irréversible</strong>.
      </p>
      <div style="display:flex;gap:0.75rem;justify-content:center">
        <button onclick="closeConfirm()" style="background:rgba(255,255,255,0.05);border:1px solid var(--border-color);color:var(--text-muted);padding:0.65rem 1.5rem;border-radius:0.5rem;cursor:pointer;font-family:inherit;font-size:0.875rem">
          Annuler
        </button>
        <button id="confirm-delete-btn" style="background:linear-gradient(135deg,#ef4444,#dc2626);border:none;color:white;padding:0.65rem 1.5rem;border-radius:0.5rem;cursor:pointer;font-weight:600;font-family:inherit;font-size:0.875rem;display:flex;align-items:center;gap:0.5rem">
          <i class="fas fa-trash"></i> Supprimer
        </button>
      </div>
    </div>
  `;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  document.getElementById('confirm-delete-btn').onclick = () => { closeConfirm(); onConfirm(); };
}

function closeConfirm() {
  const modal = document.getElementById('confirm-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

// ============================================================
// MODAL SYSTEM
// ============================================================
function openModal(title, bodyHTML, onSubmit, submitLabel = 'Sauvegarder') {
  let modal = document.getElementById('dash-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'dash-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:1000;display:flex;align-items:flex-start;justify-content:center;padding:1rem;overflow-y:auto';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px)" onclick="closeModal()"></div>
    <div style="position:relative;background:var(--bg-card);border:1px solid var(--border-color);border-radius:1.25rem;width:100%;max-width:640px;margin:auto;padding:2rem;box-shadow:0 25px 80px rgba(0,0,0,0.6)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem">
        <h2 style="font-size:1.1rem;font-weight:700;color:var(--text-primary)">${title}</h2>
        <button onclick="closeModal()" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:var(--text-muted);width:32px;height:32px;border-radius:0.5rem;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit">
          <i class="fas fa-xmark"></i>
        </button>
      </div>
      <form id="dash-form" onsubmit="return false">
        ${bodyHTML}
        <div style="display:flex;gap:0.75rem;margin-top:1.5rem;justify-content:flex-end">
          <button type="button" onclick="closeModal()" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:var(--text-muted);padding:0.65rem 1.25rem;border-radius:0.5rem;cursor:pointer;font-family:inherit;font-size:0.85rem">
            Annuler
          </button>
          <button type="button" id="modal-submit-btn" ${onSubmit ? `onclick="${onSubmit}()"` : ''} style="background:var(--gradient-primary);border:none;color:white;padding:0.65rem 1.5rem;border-radius:0.5rem;cursor:pointer;font-weight:600;font-family:inherit;font-size:0.85rem;display:flex;align-items:center;gap:0.5rem"><i class="fas fa-check"></i> ${submitLabel}</button>
        </div>
      </form>
    </div>
  `;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('dash-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

function formField(label, input, hint = '') {
  return `<div style="margin-bottom:1rem">
    <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--text-secondary);margin-bottom:0.4rem">${label}</label>
    ${input}
    ${hint ? `<div style="font-size:0.73rem;color:var(--text-dim);margin-top:0.25rem">${hint}</div>` : ''}
  </div>`;
}

const inputStyle = 'width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.65rem 0.85rem;color:var(--text-primary);font-family:inherit;font-size:0.875rem;outline:none;transition:border-color 0.2s';
const textareaStyle = inputStyle + ';resize:vertical;min-height:80px';

// ============================================================
// SERVICES
// ============================================================
let allServices = [];

async function loadServices() {
  const section = document.getElementById('section-services');
  if (!section) return;
  section.innerHTML = `<div style="text-align:center;padding:2rem"><i class="fas fa-circle-notch fa-spin" style="color:var(--accent-blue);font-size:1.5rem"></i></div>`;

  try {
    allServices = await apiGet('/services') || [];
    renderServices();
  } catch (err) {
    section.innerHTML = `<p style="color:var(--text-muted)">Erreur: ${err.message}</p>`;
  }
}

function renderServices() {
  buildListSection('section-services', {
    title: `Services <span style="font-size:0.8rem;font-weight:400;color:var(--text-muted)">(${allServices.length})</span>`,
    addLabel: 'Nouveau Service',
    onAdd: 'showAddService',
    items: allServices,
    renderItem: (s) => itemCard({
      image: s.image, icon: s.icon,
      title: `${s.icon || ''} ${s.title}`,
      subtitle: s.subtitle,
      badge: s.category,
      onEdit: `editService('${s.id}')`,
      onDelete: `deleteService('${s.id}')`
    })
  });
}

function getServiceForm(s = {}) {
  return `
    <div class="dash-form-grid-2">
      ${formField('Titre *', `<input id="s-title" style="${inputStyle}" value="${s.title||''}" placeholder="Ex: Développement Web" required />`)}
      ${formField('Sous-titre', `<input id="s-subtitle" style="${inputStyle}" value="${s.subtitle||''}" placeholder="Ex: Maîtrisez votre présence en ligne" />`)}
    </div>
    <div class="dash-form-grid-2">
      ${formField('Icône (emoji)', `<input id="s-icon" style="${inputStyle}" value="${s.icon||'⚙️'}" placeholder="💻" />`)}
      ${formField('Catégorie', `<input id="s-category" list="s-category-list" style="${inputStyle}" value="${s.category||'web'}" placeholder="web, mobile, cloud, design, desktop, ia, marketing..." /><datalist id="s-category-list"><option value="web">Web</option><option value="mobile">Mobile</option><option value="cloud">Cloud/SaaS</option><option value="design">Design</option><option value="ia">IA & Automatisation</option><option value="marketing">Marketing Digital</option><option value="desktop">Application Desktop</option><option value="autre">Autre</option></datalist>`)}
    </div>
    ${formField('Image', `<input type="file" id="s-image" accept="image/*" style="${inputStyle};padding:0.5rem" />${s.image ? `<div style="margin-top:0.5rem"><img src="${resolveImageUrl(s.image)}" style="height:60px;border-radius:0.375rem;object-fit:cover" onerror="this.style.display='none'" /></div>` : ''}`, 'Laissez vide pour garder l\'image actuelle')}
    ${formField('Description courte *', `<textarea id="s-shortdesc" style="${textareaStyle};min-height:60px" placeholder="Description courte...">${s.shortDesc||''}</textarea>`)}
    ${formField('Description longue', `<textarea id="s-longdesc" style="${textareaStyle}" placeholder="Description détaillée...">${s.longDesc||''}</textarea>`)}
    ${formField('Fonctionnalités', `<textarea id="s-features" style="${textareaStyle};min-height:80px" placeholder="Une fonctionnalité par ligne...">${(s.features||[]).join('\n')}</textarea>`, 'Une fonctionnalité par ligne')}
    ${formField('Technologies', `<input id="s-techs" style="${inputStyle}" value="${(s.technologies||[]).join(', ')}" placeholder="React, Node.js, MongoDB..." />`, 'Séparées par des virgules')}
  `;
}

function showAddService() {
  openModal('➕ Nouveau Service', getServiceForm(), 'saveNewService');
}

function saveNewService() {
  const fd = new FormData();
  fd.append('title', document.getElementById('s-title').value);
  fd.append('subtitle', document.getElementById('s-subtitle').value);
  fd.append('icon', document.getElementById('s-icon').value);
  fd.append('category', document.getElementById('s-category').value);
  fd.append('shortDesc', document.getElementById('s-shortdesc').value);
  fd.append('longDesc', document.getElementById('s-longdesc').value);
  fd.append('features', document.getElementById('s-features').value);
  fd.append('technologies', document.getElementById('s-techs').value);
  const imgFile = document.getElementById('s-image').files[0];
  if (imgFile) fd.append('image', imgFile);
  closeModal();
  apiPostForm('/services', fd).then(async () => {
    showToast('success', 'Service créé', 'Le service a été ajouté avec succès.');
    await loadServices(); updateSyncTime();
  }).catch(err => showToast('error', 'Erreur', err.message));
}

function editService(id) {
  const s = allServices.find(x => x.id === id);
  if (!s) return;
  openModal('✏️ Modifier le Service', getServiceForm(s), `() => saveEditService('${id}')`);
  // Fix the onclick since we can't pass function directly
  document.getElementById('modal-submit-btn').onclick = () => saveEditService(id);
}

function saveEditService(id) {
  const fd = new FormData();
  fd.append('title', document.getElementById('s-title').value);
  fd.append('subtitle', document.getElementById('s-subtitle').value);
  fd.append('icon', document.getElementById('s-icon').value);
  fd.append('category', document.getElementById('s-category').value);
  fd.append('shortDesc', document.getElementById('s-shortdesc').value);
  fd.append('longDesc', document.getElementById('s-longdesc').value);
  fd.append('features', document.getElementById('s-features').value);
  fd.append('technologies', document.getElementById('s-techs').value);
  const imgFile = document.getElementById('s-image').files[0];
  if (imgFile) fd.append('image', imgFile);
  closeModal();
  apiPutForm('/services/' + id, fd).then(async () => {
    showToast('success', 'Service mis à jour', 'Les modifications ont été sauvegardées.');
    await loadServices(); updateSyncTime();
  }).catch(err => showToast('error', 'Erreur', err.message));
}

function deleteService(id) {
  const s = allServices.find(x => x.id === id);
  confirmDelete(s ? s.title : 'ce service', async () => {
    try {
      await apiDelete('/services/' + id);
      showToast('success', 'Supprimé', 'Service supprimé.');
      await loadServices();
    } catch (err) { showToast('error', 'Erreur', err.message); }
  });
}

// ============================================================
// REALISATIONS
// ============================================================
let allRealisations = [];

async function loadRealisations() {
  const section = document.getElementById('section-realisations');
  if (!section) return;
  section.innerHTML = `<div style="text-align:center;padding:2rem"><i class="fas fa-circle-notch fa-spin" style="color:var(--accent-blue);font-size:1.5rem"></i></div>`;

  try {
    allRealisations = await apiGet('/realisations') || [];
    buildListSection('section-realisations', {
      title: `Réalisations <span style="font-size:0.8rem;font-weight:400;color:var(--text-muted)">(${allRealisations.length})</span>`,
      addLabel: 'Nouvelle Réalisation',
      onAdd: 'showAddRealisation',
      items: allRealisations,
      renderItem: (r) => itemCard({
        image: r.image, title: r.title,
        subtitle: `${r.client || ''} · ${r.year || ''} · ${r.sector || ''}${r.updatedAt ? ` · <span style="color:var(--accent-cyan)"><i class="fas fa-pen-to-square"></i> modifié ${new Date(r.updatedAt).toLocaleString('fr-FR', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span>` : ''}`,
        badge: r.category,
        onEdit: `editRealisation('${r.id}')`, onDelete: `deleteRealisation('${r.id}')`
      })
    });
  } catch (err) {
    section.innerHTML = `<p style="color:var(--text-muted)">Erreur: ${err.message}</p>`;
  }
}

function getRealisationForm(r = {}) {
  return `
    <div class="dash-form-grid-2">
      ${formField('Titre *', `<input id="r-title" style="${inputStyle}" value="${escapeHtml(r.title)}" required />`)}
      ${formField('Catégorie', `<input id="r-category" list="r-category-list" style="${inputStyle}" value="${escapeHtml(r.category)}" placeholder="E-commerce, Mobile, Desktop..." /><datalist id="r-category-list"><option value="E-commerce"></option><option value="Mobile"></option><option value="SaaS"></option><option value="Web App"></option><option value="Site Vitrine"></option><option value="UI/UX Design"></option><option value="IA / ML"></option><option value="Cloud"></option><option value="Application Desktop"></option><option value="MVP"></option><option value="Autre"></option></datalist>`)}
    </div>
    <div class="dash-form-grid-3">
      ${formField('Client', `<input id="r-client" style="${inputStyle}" value="${escapeHtml(r.client)}" />`)}
      ${formField('Année', `<input id="r-year" style="${inputStyle}" value="${escapeHtml(r.year)}" placeholder="2025" />`)}
      ${formField('Secteur', `<select id="r-sector" style="${inputStyle}"><option value="">-- Choisir --</option><option value="Commerce" ${r.sector==='Commerce'?'selected':''}>Commerce</option><option value="Finance" ${r.sector==='Finance'?'selected':''}>Finance</option><option value="Santé" ${r.sector==='Santé'?'selected':''}>Santé</option><option value="Éducation" ${r.sector==='Éducation'?'selected':''}>Éducation</option><option value="Immobilier" ${r.sector==='Immobilier'?'selected':''}>Immobilier</option><option value="Logistique" ${r.sector==='Logistique'?'selected':''}>Logistique</option><option value="Agriculture" ${r.sector==='Agriculture'?'selected':''}>Agriculture</option><option value="Tourisme" ${r.sector==='Tourisme'?'selected':''}>Tourisme</option><option value="Industrie" ${r.sector==='Industrie'?'selected':''}>Industrie</option><option value="ONG / Associatif" ${r.sector==='ONG / Associatif'?'selected':''}>ONG / Associatif</option><option value="Tech & Startups" ${r.sector==='Tech & Startups'?'selected':''}>Tech & Startups</option><option value="Autre" ${r.sector==='Autre'?'selected':''}>Autre</option></select>`)}
    </div>
    ${r.updatedAt ? `<div style="font-size:0.75rem;color:var(--accent-cyan);margin-bottom:0.5rem"><i class="fas fa-clock"></i> Dernière modification : ${new Date(r.updatedAt).toLocaleString('fr-FR')}</div>` : ''}
    ${formField('Image principale', `<input type="file" id="r-image" accept="image/*" style="${inputStyle};padding:0.5rem" />${r.image ? `<div style="margin-top:0.5rem"><img src="${resolveImageUrl(r.image)}" style="height:60px;border-radius:0.375rem;object-fit:cover" onerror="this.style.display='none'" /></div>` : ''}`)}
    ${formField('Description courte', `<textarea id="r-shortdesc" style="${textareaStyle};min-height:60px">${escapeHtml(r.shortDesc)}</textarea>`)}
    ${formField('Description longue', `<textarea id="r-longdesc" style="${textareaStyle}">${escapeHtml(r.longDesc)}</textarea>`)}
    ${formField('Points forts', `<textarea id="r-highlights" style="${textareaStyle};min-height:60px" placeholder="Un point par ligne...">${escapeHtml((r.highlights||[]).join('\n'))}</textarea>`, 'Un point fort par ligne')}
    ${formField('Technologies', `<input id="r-techs" style="${inputStyle}" value="${escapeHtml((r.technologies||[]).join(', '))}" placeholder="React, Node.js..." />`)}
    <div class="dash-form-grid-2">
      ${formField('URL du site', `<input id="r-url" style="${inputStyle}" value="${escapeHtml(r.url)}" placeholder="https://..." />`)}
      ${formField('URL YouTube', `<input id="r-youtube" style="${inputStyle}" value="${escapeHtml(r.youtubeUrl)}" placeholder="https://youtube.com/..." />`)}
    </div>
    <div class="dash-form-grid-2">
      ${formField('Bouton "Visiter le site"', `<select id="r-showsite" style="${inputStyle}"><option value="true" ${r.showSiteBtn!==false?'selected':''}>Visible</option><option value="false" ${r.showSiteBtn===false?'selected':''}>Masqué</option></select>`, 'Affiche le bouton si une URL est renseignée')}
      ${formField('Bouton "Voir la vidéo"', `<select id="r-showyoutube" style="${inputStyle}"><option value="false" ${!r.showYoutubeBtn?'selected':''}>Masqué</option><option value="true" ${r.showYoutubeBtn?'selected':''}>Visible</option></select>`, 'Affiche le bouton si une URL YouTube est renseignée')}
    </div>
  `;
}

function showAddRealisation() {
  openModal('➕ Nouvelle Réalisation', getRealisationForm(), 'saveNewRealisation');
}

function saveNewRealisation() {
  const fd = new FormData();
  fd.append('title', document.getElementById('r-title').value);
  fd.append('category', document.getElementById('r-category').value);
  fd.append('client', document.getElementById('r-client').value);
  fd.append('year', document.getElementById('r-year').value);
  fd.append('sector', document.getElementById('r-sector').value);
  fd.append('shortDesc', document.getElementById('r-shortdesc').value);
  fd.append('longDesc', document.getElementById('r-longdesc').value);
  fd.append('highlights', document.getElementById('r-highlights').value);
  fd.append('technologies', document.getElementById('r-techs').value);
  fd.append('url', document.getElementById('r-url').value);
  fd.append('youtubeUrl', document.getElementById('r-youtube').value);
  fd.append('showSiteBtn', document.getElementById('r-showsite').value);
  fd.append('showYoutubeBtn', document.getElementById('r-showyoutube').value);
  const imgFile = document.getElementById('r-image').files[0];
  if (imgFile) fd.append('image', imgFile);
  closeModal();
  apiPostForm('/realisations', fd).then(async () => {
    showToast('success', 'Réalisation créée', 'La réalisation a été ajoutée.');
    await loadRealisations();
  }).catch(err => showToast('error', 'Erreur', err.message));
}

function editRealisation(id) {
  const r = allRealisations.find(x => x.id === id);
  if (!r) return;
  openModal('✏️ Modifier la Réalisation', getRealisationForm(r), '');
  document.getElementById('modal-submit-btn').onclick = () => saveEditRealisation(id);
}

function saveEditRealisation(id) {
  const fd = new FormData();
  fd.append('title', document.getElementById('r-title').value);
  fd.append('category', document.getElementById('r-category').value);
  fd.append('client', document.getElementById('r-client').value);
  fd.append('year', document.getElementById('r-year').value);
  fd.append('sector', document.getElementById('r-sector').value);
  fd.append('shortDesc', document.getElementById('r-shortdesc').value);
  fd.append('longDesc', document.getElementById('r-longdesc').value);
  fd.append('highlights', document.getElementById('r-highlights').value);
  fd.append('technologies', document.getElementById('r-techs').value);
  fd.append('url', document.getElementById('r-url').value);
  fd.append('youtubeUrl', document.getElementById('r-youtube').value);
  fd.append('showSiteBtn', document.getElementById('r-showsite').value);
  fd.append('showYoutubeBtn', document.getElementById('r-showyoutube').value);
  const imgFile = document.getElementById('r-image').files[0];
  if (imgFile) fd.append('image', imgFile);
  closeModal();
  apiPutForm('/realisations/' + id, fd).then(async () => {
    showToast('success', 'Réalisation mise à jour', 'Modifications sauvegardées.');
    await loadRealisations();
  }).catch(err => showToast('error', 'Erreur', err.message));
}

function deleteRealisation(id) {
  const r = allRealisations.find(x => x.id === id);
  confirmDelete(r ? r.title : 'cette réalisation', async () => {
    try {
      await apiDelete('/realisations/' + id);
      showToast('success', 'Supprimé', 'Réalisation supprimée.');
      await loadRealisations();
    } catch (err) { showToast('error', 'Erreur', err.message); }
  });
}

// ============================================================
// ARTICLES
// ============================================================
let allArticles = [];
let articleMode = 'manual'; // 'manual' | 'pdf'

async function loadArticles() {
  const section = document.getElementById('section-articles');
  if (!section) return;
  section.innerHTML = `<div style="text-align:center;padding:2rem"><i class="fas fa-circle-notch fa-spin" style="color:var(--accent-blue);font-size:1.5rem"></i></div>`;

  try {
    allArticles = await apiGet('/articles') || [];
    buildListSection('section-articles', {
      title: `Articles de Blog <span style="font-size:0.8rem;font-weight:400;color:var(--text-muted)">(${allArticles.length})</span>`,
      addLabel: 'Nouvel Article',
      onAdd: 'showAddArticle',
      items: allArticles,
      renderItem: (a) => itemCard({
        image: a.image, title: a.title,
        subtitle: `${a.author || ''} · ${new Date(a.date).toLocaleDateString('fr-FR')}${a.updatedAt ? ` · <span style="color:var(--accent-cyan)"><i class="fas fa-pen-to-square"></i> modifié ${new Date(a.updatedAt).toLocaleString('fr-FR', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span>` : ''}`,
        badge: a.category,
        extra: `
          ${a.sourceType === 'pdf' ? '<span style="font-size:0.7rem;color:#f59e0b;margin-top:0.3rem;display:block"><i class="fas fa-file-pdf"></i> PDF</span>' : ''}
          <button onclick="viewArticleComments('${a.id}')" style="margin-top:0.5rem;background:rgba(0,102,255,0.1);border:1px solid rgba(0,102,255,0.2);color:var(--accent-light);border-radius:0.375rem;padding:0.25rem 0.6rem;cursor:pointer;font-size:0.72rem;font-family:inherit">
            <i class="fas fa-comments"></i> Commentaires ${a.comments && a.comments.length ? `(${a.comments.length})` : ''}
          </button>
        `,
        onEdit: `editArticle('${a.id}')`, onDelete: `deleteArticle('${a.id}')`
      })
    });
  } catch (err) {
    section.innerHTML = `<p style="color:var(--text-muted)">Erreur: ${err.message}</p>`;
  }
}

function showAddArticle() {
  articleMode = 'manual';
  openModal('➕ Nouvel Article de Blog', getArticleForm(), '');
  document.getElementById('modal-submit-btn').onclick = saveNewArticle;
}

function getArticleForm(a = {}) {
  return `
    <!-- Mode Toggle -->
    <div style="display:flex;background:rgba(0,0,0,0.2);border-radius:0.625rem;padding:0.25rem;margin-bottom:1.25rem;border:1px solid var(--border-color)">
      <button type="button" id="mode-manual" onclick="switchArticleMode('manual')"
        style="flex:1;padding:0.5rem;border-radius:0.375rem;border:none;font-family:inherit;font-size:0.82rem;font-weight:600;cursor:pointer;transition:all 0.2s;background:var(--gradient-primary);color:white">
        ✏️ Saisie Manuelle
      </button>
      <button type="button" id="mode-pdf" onclick="switchArticleMode('pdf')"
        style="flex:1;padding:0.5rem;border-radius:0.375rem;border:none;font-family:inherit;font-size:0.82rem;font-weight:600;cursor:pointer;transition:all 0.2s;background:none;color:var(--text-muted)">
        📄 Importer un PDF
      </button>
    </div>

    <!-- Common fields (always required) -->
    ${formField('Titre *', `<input id="a-title" style="${inputStyle}" value="${escapeHtml(a.title)}" placeholder="Titre de l'article" required />`)}
    ${formField('Image de couverture * <span style="color:var(--accent-blue);font-size:0.72rem">(obligatoire)</span>', `<input type="file" id="a-image" accept="image/*" style="${inputStyle};padding:0.5rem" />${a.image ? `<div style="margin-top:0.5rem"><img src="${resolveImageUrl(a.image)}" style="height:60px;border-radius:0.375rem;object-fit:cover" onerror="this.style.display='none'" /></div>` : ''}`)}
    <div class="dash-form-grid-2">
      ${formField('Catégorie', `<select id="a-category" style="${inputStyle}"><option value="">-- Choisir --</option><option value="Intelligence Artificielle" ${a.category==='Intelligence Artificielle'?'selected':''}>Intelligence Artificielle</option><option value="Architecture" ${a.category==='Architecture'?'selected':''}>Architecture</option><option value="Mobile" ${a.category==='Mobile'?'selected':''}>Mobile</option><option value="Cloud" ${a.category==='Cloud'?'selected':''}>Cloud</option><option value="Design" ${a.category==='Design'?'selected':''}>Design</option><option value="Startup" ${a.category==='Startup'?'selected':''}>Startup</option><option value="Développement Web" ${a.category==='Développement Web'?'selected':''}>Développement Web</option><option value="Sécurité" ${a.category==='Sécurité'?'selected':''}>Sécurité</option><option value="DevOps" ${a.category==='DevOps'?'selected':''}>DevOps</option><option value="Innovation" ${a.category==='Innovation'?'selected':''}>Innovation</option><option value="Autre" ${a.category==='Autre'?'selected':''}>Autre</option></select>`)}
      ${formField('Auteur', `<input id="a-author" style="${inputStyle}" value="${escapeHtml(a.author)}" placeholder="JAYSON STANLEY" />`)}
    </div>
    ${a.updatedAt ? `<div style="font-size:0.75rem;color:var(--accent-cyan);margin-bottom:0.5rem"><i class="fas fa-clock"></i> Dernière modification : ${new Date(a.updatedAt).toLocaleString('fr-FR')}</div>` : ''}
    ${formField('Tags', `<div style="display:flex;flex-wrap:wrap;gap:0.5rem;padding:0.75rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem">${['IA','Web','Mobile','Cloud','Design','Innovation','Startup','Architecture','DevOps','Sécurité','Machine Learning','Afrique','Éthique','Fintech','CI/CD','Infrastructure','Cybersécurité','OWASP','Productivité','Développement','Technologie'].map(tag=>`<label style="display:flex;align-items:center;gap:0.35rem;padding:0.3rem 0.65rem;border:1px solid rgba(255,255,255,0.1);border-radius:999px;cursor:pointer;font-size:0.78rem;color:var(--text-muted);background:rgba(255,255,255,0.03)"><input type="checkbox" name="a-tag" value="${tag}" ${(a.tags||[]).includes(tag)?'checked':''} style="accent-color:var(--accent-blue);width:13px;height:13px" />${tag}</label>`).join('')}</div>`, 'Cochez les tags correspondants')}
    ${formField('Description courte', `<textarea id="a-shortdesc" style="${textareaStyle};min-height:60px" placeholder="Résumé de l'article...">${escapeHtml(a.shortDesc)}</textarea>`)}

    <!-- Manual mode content -->
    <div id="manual-section">
      <div style="margin-bottom:0.85rem">
        <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:0.5rem">Contenu de l'article *</label>
        <div style="display:flex;flex-wrap:wrap;gap:0.4rem;padding:0.5rem 0.75rem;background:rgba(0,0,0,0.15);border-radius:0.5rem 0.5rem 0 0;border:1px solid var(--border-color);border-bottom:none">
          <button type="button" onclick="insertArticleFormat('<h2>','</h2>')" title="Grand titre (H2)" style="padding:0.3rem 0.65rem;border-radius:0.35rem;border:1px solid var(--border-color);background:rgba(0,102,255,0.1);color:var(--text-primary);font-size:0.8rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.15s">H1 Grand titre</button>
          <button type="button" onclick="insertArticleFormat('<h3>','</h3>')" title="Petit titre (H3)" style="padding:0.3rem 0.65rem;border-radius:0.35rem;border:1px solid var(--border-color);background:rgba(0,102,255,0.08);color:var(--text-primary);font-size:0.75rem;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.15s">H2 Petit titre</button>
          <button type="button" onclick="insertArticleFormat('<p>','</p>')" title="Paragraphe" style="padding:0.3rem 0.65rem;border-radius:0.35rem;border:1px solid var(--border-color);background:rgba(255,255,255,0.05);color:var(--text-muted);font-size:0.78rem;cursor:pointer;font-family:inherit;transition:all 0.15s">¶ Texte</button>
          <button type="button" onclick="insertArticleFormat('<ul>\\n<li>','</li>\\n</ul>')" title="Liste à puces" style="padding:0.3rem 0.65rem;border-radius:0.35rem;border:1px solid var(--border-color);background:rgba(255,255,255,0.05);color:var(--text-muted);font-size:0.78rem;cursor:pointer;font-family:inherit;transition:all 0.15s">• Liste</button>
          <button type="button" onclick="insertArticleFormat('<blockquote>','</blockquote>')" title="Citation" style="padding:0.3rem 0.65rem;border-radius:0.35rem;border:1px solid var(--border-color);background:rgba(255,255,255,0.05);color:var(--text-muted);font-size:0.78rem;cursor:pointer;font-family:inherit;transition:all 0.15s">❝ Citation</button>
          <button type="button" onclick="insertArticleFormat('<strong>','</strong>')" title="Texte en gras" style="padding:0.3rem 0.65rem;border-radius:0.35rem;border:1px solid var(--border-color);background:rgba(255,255,255,0.05);color:var(--text-muted);font-size:0.78rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.15s">G Gras</button>
        </div>
        <textarea id="a-content" style="${textareaStyle};min-height:200px;border-radius:0 0 0.5rem 0.5rem" placeholder="Sélectionnez du texte puis cliquez un bouton de format, ou cliquez un bouton puis tapez votre texte...">${a.content||''}</textarea>
        <p style="font-size:0.72rem;color:var(--text-dim);margin-top:0.3rem"><i class="fas fa-info-circle"></i> Sélectionnez du texte puis cliquez un bouton pour formater. Sans sélection, la balise est insérée à la position du curseur.</p>
      </div>
    </div>

    <!-- PDF mode content -->
    <div id="pdf-section" style="display:none">
      <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:0.75rem;padding:1rem;margin-bottom:1rem">
        <p style="font-size:0.82rem;color:#fbbf24;margin-bottom:0.5rem;font-weight:600"><i class="fas fa-circle-info"></i> Comment ça marche ?</p>
        <p style="font-size:0.8rem;color:var(--text-muted);line-height:1.6">Le système va extraire automatiquement le texte de votre PDF et le formater en contenu HTML pour votre article. Vous devrez toujours ajouter le titre et l'image.</p>
      </div>
      ${formField('Fichier PDF *', `<input type="file" id="a-pdf" accept=".pdf" style="${inputStyle};padding:0.5rem" />`, 'Taille max: 50MB')}
    </div>
  `;
}

function insertArticleFormat(tagOpen, tagClose) {
  const ta = document.getElementById('a-content');
  if (!ta) return;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const selected = ta.value.substring(start, end);
  const placeholder = selected || 'Votre texte ici';
  const insertion = tagOpen + placeholder + tagClose;
  ta.value = ta.value.substring(0, start) + insertion + ta.value.substring(end);
  // Place cursor right after inserted text
  const cursorPos = start + tagOpen.length + placeholder.length + tagClose.length;
  ta.setSelectionRange(cursorPos, cursorPos);
  ta.focus();
}

function switchArticleMode(mode) {
  articleMode = mode;
  const manualBtn = document.getElementById('mode-manual');
  const pdfBtn = document.getElementById('mode-pdf');
  const manualSection = document.getElementById('manual-section');
  const pdfSection = document.getElementById('pdf-section');

  if (mode === 'manual') {
    manualBtn.style.background = 'var(--gradient-primary)';
    manualBtn.style.color = 'white';
    pdfBtn.style.background = 'none';
    pdfBtn.style.color = 'var(--text-muted)';
    if (manualSection) manualSection.style.display = 'block';
    if (pdfSection) pdfSection.style.display = 'none';
  } else {
    pdfBtn.style.background = 'var(--gradient-primary)';
    pdfBtn.style.color = 'white';
    manualBtn.style.background = 'none';
    manualBtn.style.color = 'var(--text-muted)';
    if (manualSection) manualSection.style.display = 'none';
    if (pdfSection) pdfSection.style.display = 'block';
  }
}

function saveNewArticle() {
  const fd = new FormData();
  fd.append('title', document.getElementById('a-title').value);
  fd.append('category', document.getElementById('a-category').value);
  fd.append('author', document.getElementById('a-author').value);
  fd.append('tags', [...document.querySelectorAll('input[name="a-tag"]:checked')].map(cb => cb.value).join(', '));
  fd.append('shortDesc', document.getElementById('a-shortdesc').value);
  const imgFile = document.getElementById('a-image')?.files[0];
  if (imgFile) fd.append('image', imgFile);
  let endpoint = '/articles';
  if (articleMode === 'pdf') {
    const pdfFile = document.getElementById('a-pdf')?.files[0];
    if (!pdfFile) { showToast('error', 'Fichier manquant', 'Veuillez sélectionner un fichier PDF.'); return; }
    fd.append('pdfFile', pdfFile);
    endpoint = '/articles/from-pdf';
  } else {
    fd.append('content', document.getElementById('a-content')?.value || '');
    fd.append('sourceType', 'manual');
  }
  closeModal();
  apiPostForm(endpoint, fd).then(async () => {
    showToast('success', 'Article créé', articleMode === 'pdf' ? 'Article créé depuis le PDF.' : 'Article créé avec succès.');
    await loadArticles(); updateSyncTime();
  }).catch(err => showToast('error', 'Erreur', err.message));
}

function editArticle(id) {
  const a = allArticles.find(x => x.id === id);
  if (!a) return;
  articleMode = 'manual';
  openModal('✏️ Modifier l\'Article', getArticleForm(a), '');
  document.getElementById('modal-submit-btn').onclick = () => saveEditArticle(id);
}

function saveEditArticle(id) {
  const fd = new FormData();
  fd.append('title', document.getElementById('a-title').value);
  fd.append('category', document.getElementById('a-category').value);
  fd.append('author', document.getElementById('a-author').value);
  fd.append('tags', [...document.querySelectorAll('input[name="a-tag"]:checked')].map(cb => cb.value).join(', '));
  fd.append('shortDesc', document.getElementById('a-shortdesc').value);
  fd.append('content', document.getElementById('a-content')?.value || '');
  const imgFile = document.getElementById('a-image')?.files[0];
  if (imgFile) fd.append('image', imgFile);
  closeModal();
  apiPutForm('/articles/' + id, fd).then(async () => {
    showToast('success', 'Article mis à jour', 'Modifications sauvegardées.');
    await loadArticles();
  }).catch(err => showToast('error', 'Erreur', err.message));
}

function deleteArticle(id) {
  const a = allArticles.find(x => x.id === id);
  confirmDelete(a ? a.title : 'cet article', async () => {
    try {
      await apiDelete('/articles/' + id);
      showToast('success', 'Supprimé', 'Article supprimé.');
      await loadArticles();
    } catch (err) { showToast('error', 'Erreur', err.message); }
  });
}

async function viewArticleComments(articleId) {
  const a = allArticles.find(x => x.id === articleId);
  let article;
  try {
    article = await apiGet('/articles/' + articleId);
  } catch (e) {
    showToast('error', 'Erreur', 'Impossible de charger les commentaires.');
    return;
  }
  const comments = article.comments || [];
  const content = comments.length === 0
    ? '<p style="color:var(--text-muted);text-align:center;padding:1rem">Aucun commentaire pour cet article.</p>'
    : comments.map((c, i) => `
      <div style="padding:1rem;background:var(--bg-secondary);border-radius:0.5rem;margin-bottom:0.75rem;border:1px solid var(--border-color)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem">
          <div>
            <span style="font-weight:600;font-size:0.875rem;color:var(--text-primary)">${c.name}</span>
            ${c.email ? `<span style="font-size:0.75rem;color:var(--text-dim);margin-left:0.5rem">${c.email}</span>` : ''}
            <div style="font-size:0.75rem;color:var(--text-dim)">${new Date(c.date).toLocaleDateString('fr-FR')}</div>
          </div>
          <button onclick="deleteComment('${articleId}','${c._id}')" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171;border-radius:0.375rem;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.75rem">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <p style="color:var(--text-secondary);font-size:0.875rem;line-height:1.5;margin:0;white-space:pre-wrap">${c.text}</p>
      </div>
    `).join('');
  openModal(`💬 Commentaires — ${a ? a.title : articleId}`, content, '');
  document.getElementById('modal-submit-btn').style.display = 'none';
}

async function deleteComment(articleId, commentId) {
  try {
    await apiDelete(`/articles/${articleId}/comments/${commentId}`);
    showToast('success', 'Supprimé', 'Commentaire supprimé.');
    closeModal();
    await loadArticles();
  } catch (err) {
    showToast('error', 'Erreur', err.message);
  }
}

// ============================================================
// FORMATIONS
// ============================================================
let allFormations = [];

async function loadFormations() {
  const section = document.getElementById('section-formations');
  if (!section) return;
  section.innerHTML = `<div style="text-align:center;padding:2rem"><i class="fas fa-circle-notch fa-spin" style="color:var(--accent-blue);font-size:1.5rem"></i></div>`;

  try {
    allFormations = await apiGet('/formations') || [];
    buildListSection('section-formations', {
      title: `Formations <span style="font-size:0.8rem;font-weight:400;color:var(--text-muted)">(${allFormations.length})</span>`,
      addLabel: 'Nouvelle Formation',
      onAdd: 'showAddFormation',
      items: allFormations,
      renderItem: (f) => itemCard({
        icon: f.icon, title: `${f.icon || '📚'} ${f.title}`,
        subtitle: `${f.duration || ''} · ${f.level || ''} · ${f.price || ''}${f.updatedAt ? ` · <span style="color:var(--accent-cyan)"><i class="fas fa-pen-to-square"></i> modifié ${new Date(f.updatedAt).toLocaleString('fr-FR', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span>` : ''}`,
        onEdit: `editFormation('${f.id}')`, onDelete: `deleteFormation('${f.id}')`
      })
    });
  } catch (err) {
    section.innerHTML = `<p style="color:var(--text-muted)">Erreur: ${err.message}</p>`;
  }
}

function getFormationForm(f = {}) {
  return `
    <div class="dash-form-grid-2">
      ${formField('Titre *', `<input id="f-title" style="${inputStyle}" value="${escapeHtml(f.title)}" required />`)}
      ${formField('Icône (emoji)', `<input id="f-icon" style="${inputStyle}" value="${escapeHtml(f.icon||'📚')}" />`)}
    </div>
    <div class="dash-form-grid-3">
      ${formField('Durée', `<input id="f-duration" style="${inputStyle}" value="${escapeHtml(f.duration)}" placeholder="3 mois" />`)}
      ${formField('Niveau', `<input id="f-level" style="${inputStyle}" value="${escapeHtml(f.level)}" placeholder="Débutant à Avancé" />`)}
      ${formField('Prix', `<input id="f-price" style="${inputStyle}" value="${escapeHtml(f.price||'Sur devis')}" placeholder="Sur devis" />`)}
    </div>
    ${f.updatedAt ? `<div style="font-size:0.75rem;color:var(--accent-cyan);margin-bottom:0.5rem"><i class="fas fa-clock"></i> Dernière modification : ${new Date(f.updatedAt).toLocaleString('fr-FR')}</div>` : ''}
    ${formField('Description', `<textarea id="f-description" style="${textareaStyle};min-height:80px">${escapeHtml(f.description)}</textarea>`)}
    ${formField('Programme', `<textarea id="f-program" style="${textareaStyle}" placeholder="Un module par ligne...">${escapeHtml((f.program||[]).join('\n'))}</textarea>`, 'Un module par ligne')}
  `;
}

function showAddFormation() {
  openModal('➕ Nouvelle Formation', getFormationForm(), '');
  document.getElementById('modal-submit-btn').onclick = saveNewFormation;
}

function saveNewFormation() {
  const data = {
    title: document.getElementById('f-title').value,
    icon: document.getElementById('f-icon').value,
    duration: document.getElementById('f-duration').value,
    level: document.getElementById('f-level').value,
    price: document.getElementById('f-price').value,
    description: document.getElementById('f-description').value,
    program: document.getElementById('f-program').value.split('\n').filter(Boolean)
  };
  closeModal();
  apiPost('/formations', data).then(async () => {
    showToast('success', 'Formation créée', 'La formation a été ajoutée.');
    await loadFormations();
  }).catch(err => showToast('error', 'Erreur', err.message));
}

function editFormation(id) {
  const f = allFormations.find(x => x.id === id);
  if (!f) return;
  openModal('✏️ Modifier la Formation', getFormationForm(f), '');
  document.getElementById('modal-submit-btn').onclick = () => saveEditFormation(id);
}

function saveEditFormation(id) {
  const data = {
    title: document.getElementById('f-title').value,
    icon: document.getElementById('f-icon').value,
    duration: document.getElementById('f-duration').value,
    level: document.getElementById('f-level').value,
    price: document.getElementById('f-price').value,
    description: document.getElementById('f-description').value,
    program: document.getElementById('f-program').value.split('\n').filter(Boolean)
  };
  closeModal();
  apiPut('/formations/' + id, data).then(async () => {
    showToast('success', 'Formation mise à jour', 'Modifications sauvegardées.');
    await loadFormations();
  }).catch(err => showToast('error', 'Erreur', err.message));
}

function deleteFormation(id) {
  const f = allFormations.find(x => x.id === id);
  confirmDelete(f ? f.title : 'cette formation', async () => {
    try {
      await apiDelete('/formations/' + id);
      showToast('success', 'Supprimé', 'Formation supprimée.');
      await loadFormations();
    } catch (err) { showToast('error', 'Erreur', err.message); }
  });
}

// ============================================================
// CONTACTS & INFO
// ============================================================
async function loadContacts() {
  const section = document.getElementById('section-contacts');
  if (!section) return;
  section.innerHTML = `<div style="text-align:center;padding:2rem"><i class="fas fa-circle-notch fa-spin" style="color:var(--accent-blue);font-size:1.5rem"></i></div>`;

  try {
    const info = await apiPublicGet('/contact/info');
    section.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem">
        <h2 style="font-size:1.25rem;font-weight:700;color:var(--text-primary)">Informations de Contact</h2>
        <button onclick="saveContactInfo()" style="background:var(--gradient-primary);border:none;color:white;padding:0.65rem 1.25rem;border-radius:0.5rem;font-size:0.85rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:0.5rem;font-family:inherit">
          <i class="fas fa-floppy-disk"></i> Sauvegarder
        </button>
      </div>
      <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:1rem;padding:1.5rem">
        <div class="dash-form-grid-2" style="margin-bottom:1rem">
          ${formField('<i class="fas fa-envelope" style="color:var(--accent-blue)"></i> Email', `<input id="c-email" style="${inputStyle}" value="${info.email||''}" type="email" />`)}
          ${formField('<i class="fas fa-phone" style="color:var(--accent-blue)"></i> Téléphone', `<input id="c-phone" style="${inputStyle}" value="${info.phone||''}" />`)}
          ${formField('<i class="fas fa-location-dot" style="color:var(--accent-blue)"></i> Adresse', `<input id="c-address" style="${inputStyle}" value="${info.address||''}" />`)}
          ${formField('<i class="fas fa-clock" style="color:var(--accent-blue)"></i> Horaires', `<input id="c-hours" style="${inputStyle}" value="${info.hours||''}" />`)}
        </div>
        <h3 style="font-size:0.9rem;font-weight:700;color:var(--text-primary);margin-bottom:1rem">Réseaux Sociaux</h3>
        <div class="dash-form-grid-2">
          ${formField('<i class="fab fa-linkedin" style="color:#0077b5"></i> LinkedIn', `<input id="c-linkedin" style="${inputStyle}" value="${info.social?.linkedin||''}" placeholder="https://linkedin.com/..." />`)}
          ${formField('<i class="fab fa-twitter" style="color:#1da1f2"></i> Twitter/X', `<input id="c-twitter" style="${inputStyle}" value="${info.social?.twitter||''}" placeholder="https://x.com/..." />`)}
          ${formField('<i class="fab fa-facebook" style="color:#1877f2"></i> Facebook', `<input id="c-facebook" style="${inputStyle}" value="${info.social?.facebook||''}" placeholder="https://facebook.com/..." />`)}
          ${formField('<i class="fab fa-youtube" style="color:#ff0000"></i> YouTube', `<input id="c-youtube" style="${inputStyle}" value="${info.social?.youtube||''}" placeholder="https://youtube.com/..." />`)}
          ${formField('<i class="fab fa-whatsapp" style="color:#25d366"></i> WhatsApp', `<input id="c-whatsapp" style="${inputStyle}" value="${info.social?.whatsapp||''}" placeholder="https://wa.me/..." />`)}
          ${formField('<i class="fab fa-github" style="color:#6e5494"></i> GitHub', `<input id="c-github" style="${inputStyle}" value="${info.social?.github||''}" placeholder="https://github.com/..." />`)}
          ${formField('<i class="fab fa-instagram" style="color:#e4405f"></i> Instagram', `<input id="c-instagram" style="${inputStyle}" value="${info.social?.instagram||''}" placeholder="https://instagram.com/..." />`)}
        </div>
      </div>

      <div style="background:rgba(0,102,255,0.05);border:1px solid rgba(0,102,255,0.2);border-radius:0.75rem;padding:1rem;margin-top:1.5rem;display:flex;align-items:center;gap:0.75rem">
        <i class="fas fa-handshake" style="color:var(--accent-blue);font-size:1.1rem;flex-shrink:0"></i>
        <span style="font-size:0.85rem;color:var(--text-muted)">La gestion des logos partenaires a été déplacée dans la section <strong style="color:var(--text-primary)">Partenaires</strong> dans le menu de gauche.</span>
      </div>
    `;
  } catch (err) {
    section.innerHTML = `<p style="color:var(--text-muted)">Erreur: ${err.message}</p>`;
  }
}

async function saveContactInfo() {
  try {
    await apiPut('/contact/info', {
      email: document.getElementById('c-email')?.value,
      phone: document.getElementById('c-phone')?.value,
      address: document.getElementById('c-address')?.value,
      hours: document.getElementById('c-hours')?.value,
      social: {
        linkedin: document.getElementById('c-linkedin')?.value || '',
        twitter: document.getElementById('c-twitter')?.value || '',
        facebook: document.getElementById('c-facebook')?.value || '',
        youtube: document.getElementById('c-youtube')?.value || '',
        whatsapp: document.getElementById('c-whatsapp')?.value || '',
        github: document.getElementById('c-github')?.value || '',
        instagram: document.getElementById('c-instagram')?.value || ''
      }
    });
    showToast('success', 'Sauvegardé', 'Informations de contact mises à jour.');
    updateSyncTime();
  } catch (err) {
    showToast('error', 'Erreur', err.message);
  }
}

// ============================================================
// PARTENAIRES (section dédiée)
// ============================================================
let allPartners = [];

async function loadPartenaires() {
  const section = document.getElementById('section-partenaires');
  if (!section) return;
  section.innerHTML = `<div style="text-align:center;padding:2rem"><i class="fas fa-circle-notch fa-spin" style="color:var(--accent-blue);font-size:1.5rem"></i></div>`;

  try {
    const info = await apiPublicGet('/contact/info');
    allPartners = info.partners || [];

    section.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
        <h2 style="font-size:1.25rem;font-weight:700;color:var(--text-primary)">Partenaires <span style="font-size:0.8rem;font-weight:400;color:var(--text-muted)">(${allPartners.length} logos)</span></h2>
        <button onclick="showAddPartner()" style="background:var(--gradient-primary);border:none;color:white;padding:0.65rem 1.25rem;border-radius:0.5rem;font-size:0.85rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:0.5rem;font-family:inherit">
          <i class="fas fa-plus"></i> Ajouter un Partenaire
        </button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1rem">
        ${allPartners.length === 0
          ? '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted);border:1px dashed var(--border-color);border-radius:1rem">Aucun partenaire. Cliquez sur "Ajouter" pour commencer.</div>'
          : allPartners.map((p, idx) => `
            <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:0.75rem;padding:1.25rem;text-align:center;position:relative;transition:border-color 0.2s"
                 onmouseover="this.style.borderColor='rgba(0,102,255,0.4)'" onmouseout="this.style.borderColor='var(--border-color)'">
              <div style="height:80px;display:flex;align-items:center;justify-content:center;margin-bottom:0.75rem">
                ${p.image
                  ? `<img src="${resolveImageUrl(p.image)}" alt="${p.name||''}" style="max-width:100%;max-height:80px;object-fit:contain" onerror="this.style.display='none'" />`
                  : `<div style="width:60px;height:60px;background:rgba(0,102,255,0.1);border-radius:0.5rem;display:flex;align-items:center;justify-content:center"><i class="fas fa-handshake" style="color:var(--accent-blue);font-size:1.5rem"></i></div>`
                }
              </div>
              <div style="font-size:0.8rem;font-weight:600;color:var(--text-primary);margin-bottom:0.25rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.name||'Partenaire'}</div>
              ${p.url && p.url !== '#' ? `<a href="${p.url}" target="_blank" style="font-size:0.7rem;color:var(--accent-light);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block">${p.url.replace(/^https?:\/\//, '')}</a>` : ''}
              <div style="display:flex;gap:0.4rem;margin-top:0.75rem;justify-content:center">
                <button onclick="editPartner(${idx})" style="flex:1;background:rgba(0,102,255,0.1);border:1px solid rgba(0,102,255,0.2);color:var(--accent-light);border-radius:0.375rem;padding:0.4rem;cursor:pointer;font-size:0.78rem;font-family:inherit">
                  <i class="fas fa-pen"></i> Modifier
                </button>
                <button onclick="deletePartner(${idx})" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171;border-radius:0.375rem;padding:0.4rem 0.6rem;cursor:pointer;font-size:0.78rem;font-family:inherit">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          `).join('')
        }
      </div>
    `;
  } catch (err) {
    section.innerHTML = `<p style="color:var(--text-muted)">Erreur: ${err.message}</p>`;
  }
}

function getPartnerForm(p = {}) {
  return `
    ${formField('Nom du partenaire *', `<input id="p-name" style="${inputStyle}" value="${p.name||''}" placeholder="Ex: MTN Cameroun" required />`)}
    ${formField('Logo (image)', `<input type="file" id="p-image" accept="image/*" style="${inputStyle};padding:0.5rem" />${p.image ? `<div style="margin-top:0.5rem"><img src="${resolveImageUrl(p.image)}" style="height:60px;object-fit:contain;border-radius:0.375rem" onerror="this.style.display='none'" /></div>` : ''}`, 'PNG avec fond transparent recommandé')}
    ${formField('URL du site partenaire', `<input id="p-url" style="${inputStyle}" value="${p.url||''}" placeholder="https://..." />`)}
  `;
}

function showAddPartner() {
  openModal('➕ Ajouter un Partenaire', getPartnerForm(), '');
  document.getElementById('modal-submit-btn').onclick = saveNewPartner;
}

function saveNewPartner() {
  const fd = new FormData();
  fd.append('name', document.getElementById('p-name').value);
  fd.append('url', document.getElementById('p-url').value || '#');
  const imgFile = document.getElementById('p-image').files[0];
  if (imgFile) fd.append('image', imgFile);
  closeModal();
  apiPostForm('/contact/partner', fd).then(async () => {
    showToast('success', 'Partenaire ajouté', 'Le logo a été ajouté.');
    await loadPartenaires();
  }).catch(err => showToast('error', 'Erreur', err.message));
}

function editPartner(idx) {
  const p = allPartners[idx];
  if (!p) return;
  openModal('✏️ Modifier le Partenaire', getPartnerForm(p), '');
  document.getElementById('modal-submit-btn').onclick = () => saveEditPartner(idx);
}

function saveEditPartner(idx) {
  const fd = new FormData();
  fd.append('name', document.getElementById('p-name').value);
  fd.append('url', document.getElementById('p-url').value || '#');
  const imgFile = document.getElementById('p-image').files[0];
  if (imgFile) fd.append('image', imgFile);
  closeModal();
  apiPutForm('/contact/partner/' + idx, fd).then(async () => {
    showToast('success', 'Partenaire modifié', 'Modifications sauvegardées.');
    await loadPartenaires();
  }).catch(err => showToast('error', 'Erreur', err.message));
}

function deletePartner(idx) {
  const p = allPartners[idx];
  confirmDelete(p ? (p.name || 'ce partenaire') : 'ce partenaire', async () => {
    try {
      await apiDelete('/contact/partner/' + idx);
      showToast('success', 'Supprimé', 'Partenaire supprimé.');
      await loadPartenaires();
    } catch (err) { showToast('error', 'Erreur', err.message); }
  });
}

// ============================================================
// MESSAGES
// ============================================================
let allMessages = [];

async function loadMessages() {
  const section = document.getElementById('section-messages');
  if (!section) return;
  section.innerHTML = `<div style="text-align:center;padding:2rem"><i class="fas fa-circle-notch fa-spin" style="color:var(--accent-blue);font-size:1.5rem"></i></div>`;

  try {
    allMessages = await apiGet('/contact/messages') || [];
    const unread = allMessages.filter(m => !m.read).length;

    // Update badge
    const badge = document.getElementById('badge-messages');
    if (badge) badge.textContent = unread;

    const unreadMsgs = allMessages.filter(m => !m.read);
    const readMsgs = allMessages.filter(m => m.read);

    function renderMessageCard(m) {
      return `
        <div id="msg-${m._id}" class="msg-card${m.read ? '' : ' unread'}">
          <div class="msg-card-inner">
            <div class="msg-card-body">
              <div class="msg-card-header">
                <div class="msg-card-avatar">${m.name ? m.name[0].toUpperCase() : '?'}</div>
                <div>
                  <div class="msg-card-name">${escapeHtml(m.name || 'Anonyme')}</div>
                  <div class="msg-card-email">${escapeHtml(m.email || '')}${m.phone ? ' · ' + escapeHtml(m.phone) : ''}</div>
                </div>
                ${!m.read ? '<span class="msg-card-badge-new">NOUVEAU</span>' : ''}
              </div>
              ${m.subject ? `<div class="msg-card-subject">Sujet : ${escapeHtml(m.subject)}</div>` : ''}
              <div class="msg-card-text">${escapeHtml(m.message || '').replace(/\n/g, '<br>')}</div>
              <div class="msg-card-date">${new Date(m.createdAt).toLocaleString('fr-FR')}</div>
            </div>
            <div class="msg-card-actions">
              ${!m.read ? `<button onclick="markMessageRead('${m._id}')" class="msg-action-btn read" title="Marquer comme lu"><i class="fas fa-check"></i></button>` : ''}
              <a href="mailto:${m.email}" class="msg-action-btn reply" title="Répondre par email"><i class="fas fa-reply"></i></a>
              <button onclick="deleteMessage('${m._id}')" class="msg-action-btn delete" title="Supprimer"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        </div>
      `;
    }

    section.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
        <h2 style="font-size:1.25rem;font-weight:700;color:var(--text-primary)">
          Messages Reçus
          ${unread > 0 ? `<span style="background:var(--accent-blue);color:white;border-radius:999px;padding:0.1rem 0.5rem;font-size:0.75rem;font-weight:600;margin-left:0.5rem">${unread} non lu${unread>1?'s':''}</span>` : ''}
        </h2>
      </div>
      ${allMessages.length === 0
        ? `<div style="text-align:center;padding:3rem;color:var(--text-muted);border:1px dashed var(--border-color);border-radius:1rem">
            <i class="fas fa-inbox" style="font-size:2rem;margin-bottom:1rem;display:block"></i>
            Aucun message reçu pour l'instant.
           </div>`
        : `
          ${unreadMsgs.length > 0 ? `
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem">
              <div style="height:2px;flex:1;background:linear-gradient(to right,var(--accent-blue),transparent)"></div>
              <span style="font-size:0.78rem;font-weight:700;color:var(--accent-blue);text-transform:uppercase;letter-spacing:0.08em;white-space:nowrap">
                <i class="fas fa-circle-dot" style="margin-right:0.35rem"></i>Non lus (${unreadMsgs.length})
              </span>
              <div style="height:2px;flex:1;background:linear-gradient(to left,var(--accent-blue),transparent)"></div>
            </div>
            ${unreadMsgs.map(renderMessageCard).join('')}
          ` : ''}
          ${readMsgs.length > 0 ? `
            <div style="display:flex;align-items:center;gap:0.75rem;margin:${unreadMsgs.length > 0 ? '1.5rem' : '0'} 0 1rem">
              <div style="height:1px;flex:1;background:var(--border-color)"></div>
              <span style="font-size:0.78rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;white-space:nowrap">
                <i class="fas fa-check-double" style="margin-right:0.35rem"></i>Lus (${readMsgs.length})
              </span>
              <div style="height:1px;flex:1;background:var(--border-color)"></div>
            </div>
            ${readMsgs.map(renderMessageCard).join('')}
          ` : ''}
        `}
    `;
  } catch (err) {
    section.innerHTML = `<p style="color:var(--text-muted)">Erreur: ${err.message}</p>`;
  }
}

async function loadNewsletter() {
  const section = document.getElementById('section-newsletter');
  if (!section) return;
  section.innerHTML = `<div style="text-align:center;padding:2rem"><i class="fas fa-circle-notch fa-spin" style="color:var(--accent-blue);font-size:1.5rem"></i></div>`;

  try {
    const subscribers = await apiGet('/newsletter/subscribers') || [];

    const badge = document.getElementById('badge-newsletter');
    if (badge) badge.textContent = subscribers.length;

    section.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
        <h2 style="font-size:1.25rem;font-weight:700;color:var(--text-primary)">
          <i class="fas fa-paper-plane" style="color:var(--accent-blue);margin-right:0.5rem"></i>
          Abonnés Newsletter
          <span style="background:rgba(0,102,255,0.15);color:var(--accent-light);border-radius:999px;padding:0.15rem 0.6rem;font-size:0.75rem;font-weight:600;margin-left:0.5rem">${subscribers.length} abonné${subscribers.length > 1 ? 's' : ''}</span>
        </h2>
      </div>

      ${subscribers.length === 0
        ? `<div style="text-align:center;padding:3rem;color:var(--text-muted);border:1px dashed var(--border-color);border-radius:1rem">
            <i class="fas fa-paper-plane" style="font-size:2rem;margin-bottom:1rem;display:block;opacity:0.4"></i>
            Aucun abonné pour l'instant.
           </div>`
        : `<div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:0.75rem;overflow:hidden">
            <div style="display:grid;grid-template-columns:1fr auto auto;gap:0;background:var(--bg-secondary);padding:0.6rem 1rem;border-bottom:1px solid var(--border-color)">
              <div style="font-size:0.72rem;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.06em">Email</div>
              <div style="font-size:0.72rem;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.06em;padding-right:1rem">Date</div>
              <div></div>
            </div>
            ${subscribers.map((s, i) => `
              <div style="display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:0;padding:0.75rem 1rem;${i < subscribers.length-1 ? 'border-bottom:1px solid var(--border-color)' : ''}">
                <div>
                  <div style="font-size:0.875rem;color:var(--text-primary);font-weight:500">${escapeHtml(s.email)}</div>
                </div>
                <div style="font-size:0.73rem;color:var(--text-dim);padding-right:1rem">${new Date(s.createdAt).toLocaleDateString('fr-FR')}</div>
                <button onclick="deleteSubscriber('${s._id}')" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171;border-radius:0.375rem;padding:0.35rem 0.6rem;cursor:pointer;font-size:0.75rem;font-family:inherit" title="Supprimer">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            `).join('')}
           </div>`
      }
    `;
  } catch (err) {
    section.innerHTML = `<p style="color:var(--text-muted)">Erreur: ${err.message}</p>`;
  }
}

async function deleteSubscriber(id) {
  confirmDelete('cet abonné', async () => {
    try {
      await apiDelete('/newsletter/subscribers/' + id);
      await loadNewsletter();
      showToast('success', 'Supprimé', 'Abonné supprimé.');
    } catch (err) {
      showToast('error', 'Erreur', err.message);
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ============================================================
// COMMENTAIRES
// ============================================================
async function loadAllComments() {
  const section = document.getElementById('section-commentaires');
  if (!section) return;
  section.innerHTML = `<div style="text-align:center;padding:2rem"><i class="fas fa-circle-notch fa-spin" style="color:var(--accent-blue);font-size:1.5rem"></i></div>`;

  try {
    const comments = await apiGet('/articles/comments') || [];
    const badge = document.getElementById('badge-commentaires');
    if (badge) badge.textContent = comments.length || '0';

    if (!comments.length) {
      section.innerHTML = `
        <div class="section-header"><h2 class="section-title">Commentaires <span>Articles</span></h2></div>
        <div class="empty-state"><i class="fas fa-comments" style="font-size:2rem;color:var(--text-dim);margin-bottom:1rem"></i><p>Aucun commentaire pour l'instant.</p></div>`;
      return;
    }

    section.innerHTML = `
      <div class="section-header"><h2 class="section-title">Commentaires <span style="font-size:0.8rem;font-weight:400;color:var(--text-muted)">(${comments.length})</span></h2></div>
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        ${comments.map(c => `
          <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:0.75rem;padding:1rem 1.25rem;display:flex;gap:1rem;align-items:flex-start">
            <div style="width:2.5rem;height:2.5rem;border-radius:50%;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;color:#fff;flex-shrink:0">${(c.name||'?')[0].toUpperCase()}</div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;flex-wrap:wrap;align-items:center;gap:0.5rem;margin-bottom:0.35rem">
                <span style="font-weight:600;font-size:0.875rem;color:var(--text-primary)">${escapeHtml(c.name)}</span>
                ${c.email ? `<span style="font-size:0.75rem;color:var(--text-dim)">&lt;${escapeHtml(c.email)}&gt;</span>` : ''}
                <span style="font-size:0.72rem;color:var(--text-dim)">${new Date(c.date).toLocaleDateString('fr-FR', {day:'2-digit',month:'long',year:'numeric'})}</span>
              </div>
              <div style="font-size:0.78rem;color:#1a7aff;margin-bottom:0.5rem;background:rgba(0,102,255,0.08);display:inline-block;padding:0.15rem 0.6rem;border-radius:999px">
                <i class="fas fa-newspaper"></i> ${escapeHtml(c.articleTitle)}
              </div>
              <p style="color:var(--text-secondary);font-size:0.875rem;line-height:1.5;margin:0;white-space:pre-wrap">${escapeHtml(c.text)}</p>
            </div>
            <button onclick="deleteCommentFromSection('${c.articleId}','${c.commentId}')"
              style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171;border-radius:0.5rem;padding:0.4rem 0.7rem;cursor:pointer;font-size:0.8rem;flex-shrink:0;font-family:inherit"
              title="Supprimer ce commentaire">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `).join('')}
      </div>`;
  } catch (err) {
    section.innerHTML = `<p style="color:var(--text-muted)">Erreur: ${err.message}</p>`;
  }
}

async function deleteCommentFromSection(articleId, commentId) {
  confirmDelete('ce commentaire', async () => {
    try {
      await apiDelete(`/articles/${articleId}/comments/${commentId}`);
      showToast('success', 'Supprimé', 'Commentaire supprimé.');
      await loadAllComments();
    } catch (err) {
      showToast('error', 'Erreur', err.message);
    }
  });
}

async function markMessageRead(id) {
  try {
    await apiPut('/contact/messages/' + id + '/read', {});
    await loadMessages();
  } catch (err) {
    showToast('error', 'Erreur', err.message);
  }
}

function deleteMessage(id) {
  confirmDelete('ce message', async () => {
    try {
      await apiDelete('/contact/messages/' + id);
      await loadMessages();
      showToast('success', 'Supprimé', 'Message supprimé.');
    } catch (err) { showToast('error', 'Erreur', err.message); }
  });
}

// ============================================================
// TEAM MANAGEMENT
// ============================================================
let allTeamMembers = [];

async function loadTeam() {
  const section = document.getElementById('section-team');
  if (!section) return;
  section.innerHTML = `<div style="text-align:center;padding:2rem"><i class="fas fa-circle-notch fa-spin" style="color:var(--accent-blue);font-size:1.5rem"></i></div>`;

  try {
    allTeamMembers = await apiGet('/team') || [];
    buildListSection('section-team', {
      title: `Équipe <span style="font-size:0.8rem;font-weight:400;color:var(--text-muted)">(${allTeamMembers.length} membres)</span>`,
      addLabel: 'Nouveau Membre',
      onAdd: 'showAddTeamMember',
      items: allTeamMembers,
      renderItem: (m) => itemCard({
        image: m.photo,
        icon: m.initials || '👤',
        title: m.name,
        subtitle: m.role,
        badge: m.tags?.[0] || '',
        onEdit: `editTeamMember('${m.id}')`,
        onDelete: `deleteTeamMember('${m.id}')`
      })
    });
  } catch (err) {
    section.innerHTML = `<p style="color:var(--text-muted)">Erreur: ${err.message}</p>`;
  }
}

function getTeamForm(m = {}) {
  return `
    <div class="dash-form-grid-2">
      ${formField('Nom complet *', `<input id="t-name" style="${inputStyle}" value="${m.name||''}" required />`)}
      ${formField('Initiales', `<input id="t-initials" style="${inputStyle}" value="${m.initials||''}" placeholder="JS" maxlength="3" />`)}
    </div>
    ${formField('Rôle / Poste', `<input id="t-role" style="${inputStyle}" value="${m.role||''}" placeholder="Ex: Directeur Technique & CTO" />`)}
    ${formField('Photo', `<input type="file" id="t-photo" accept="image/*" style="${inputStyle};padding:0.5rem" />${m.photo ? `<div style="margin-top:0.5rem"><img src="${resolveImageUrl(m.photo)}" style="height:60px;width:60px;border-radius:50%;object-fit:cover" onerror="this.style.display='none'" /></div>` : ''}`, 'Laissez vide pour afficher les initiales')}
    ${formField('Compétences (tags)', `<input id="t-tags" style="${inputStyle}" value="${(m.tags||[]).join(', ')}" placeholder="React, Node.js, UI/UX..." />`, 'Séparées par des virgules')}
    <h4 style="font-size:0.8rem;font-weight:700;color:var(--text-secondary);margin-bottom:0.75rem;margin-top:0.5rem">Réseaux sociaux</h4>
    <div class="dash-form-grid-2">
      ${formField('<i class="fab fa-linkedin" style="color:#0077b5"></i> LinkedIn', `<input id="t-linkedin" style="${inputStyle}" value="${m.socials?.linkedin||''}" placeholder="https://linkedin.com/..." />`)}
      ${formField('<i class="fab fa-github" style="color:#6e5494"></i> GitHub', `<input id="t-github" style="${inputStyle}" value="${m.socials?.github||''}" placeholder="https://github.com/..." />`)}
      ${formField('<i class="fas fa-globe" style="color:#0099cc"></i> Portfolio', `<input id="t-portfolio" style="${inputStyle}" value="${m.socials?.portfolio||''}" placeholder="https://portfolio.com/..." />`)}
      ${formField('<i class="fab fa-youtube" style="color:#ff0000"></i> YouTube', `<input id="t-youtube" style="${inputStyle}" value="${m.socials?.youtube||''}" placeholder="https://youtube.com/..." />`)}
    </div>
    ${formField('Ordre d\'affichage', `<input id="t-order" type="number" style="${inputStyle}" value="${m.order||0}" min="0" />`)}
  `;
}

function showAddTeamMember() {
  openModal('➕ Nouveau Membre', getTeamForm(), '');
  document.getElementById('modal-submit-btn').onclick = saveNewTeamMember;
}

function saveNewTeamMember() {
  const fd = new FormData();
  fd.append('name', document.getElementById('t-name').value);
  fd.append('initials', document.getElementById('t-initials').value);
  fd.append('role', document.getElementById('t-role').value);
  fd.append('tags', document.getElementById('t-tags').value);
  fd.append('linkedin', document.getElementById('t-linkedin').value);
  fd.append('github', document.getElementById('t-github').value);
  fd.append('portfolio', document.getElementById('t-portfolio').value);
  fd.append('youtube', document.getElementById('t-youtube').value);
  fd.append('order', document.getElementById('t-order').value);
  const photo = document.getElementById('t-photo').files[0];
  if (photo) fd.append('photo', photo);
  closeModal();
  apiPostForm('/team', fd).then(async () => {
    showToast('success', 'Membre ajouté', 'Le membre a été ajouté à l\'équipe.');
    await loadTeam();
  }).catch(err => showToast('error', 'Erreur', err.message));
}

function editTeamMember(id) {
  const m = allTeamMembers.find(x => x.id === id);
  if (!m) return;
  openModal('✏️ Modifier le Membre', getTeamForm(m), '');
  document.getElementById('modal-submit-btn').onclick = () => saveEditTeamMember(id);
}

function saveEditTeamMember(id) {
  const fd = new FormData();
  fd.append('name', document.getElementById('t-name').value);
  fd.append('initials', document.getElementById('t-initials').value);
  fd.append('role', document.getElementById('t-role').value);
  fd.append('tags', document.getElementById('t-tags').value);
  fd.append('linkedin', document.getElementById('t-linkedin').value);
  fd.append('github', document.getElementById('t-github').value);
  fd.append('portfolio', document.getElementById('t-portfolio').value);
  fd.append('youtube', document.getElementById('t-youtube').value);
  fd.append('order', document.getElementById('t-order').value);
  const photo = document.getElementById('t-photo').files[0];
  if (photo) fd.append('photo', photo);
  closeModal();
  apiPutForm('/team/' + id, fd).then(async () => {
    showToast('success', 'Membre mis à jour', 'Les modifications ont été sauvegardées.');
    await loadTeam();
  }).catch(err => showToast('error', 'Erreur', err.message));
}

function deleteTeamMember(id) {
  const m = (typeof allTeam !== 'undefined' ? allTeam : []).find(x => x.id === id);
  confirmDelete(m ? m.name : 'ce membre', async () => {
    try {
      await apiDelete('/team/' + id);
      showToast('success', 'Supprimé', 'Membre supprimé.');
      await loadTeam();
    } catch (err) { showToast('error', 'Erreur', err.message); }
  });
}

// ============================================================
// FAQ MANAGEMENT
// ============================================================
let allFAQs = [];

async function loadFAQ() {
  const section = document.getElementById('section-faq');
  if (!section) return;
  section.innerHTML = `<div style="text-align:center;padding:2rem"><i class="fas fa-circle-notch fa-spin" style="color:var(--accent-blue);font-size:1.5rem"></i></div>`;

  try {
    allFAQs = await apiGet('/faq') || [];

    section.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
        <h2 style="font-size:1.25rem;font-weight:700;color:var(--text-primary)">Questions Fréquentes (FAQ)</h2>
        <button onclick="openFAQModal()" style="background:var(--gradient-primary);border:none;color:white;border-radius:0.5rem;padding:0.6rem 1.2rem;cursor:pointer;font-size:0.85rem;font-weight:600;display:flex;align-items:center;gap:0.5rem;font-family:inherit">
          <i class="fas fa-plus"></i> Ajouter une question
        </button>
      </div>
      ${allFAQs.length === 0
        ? `<div style="text-align:center;padding:3rem;color:var(--text-muted);border:1px dashed var(--border-color);border-radius:1rem">
            <i class="fas fa-circle-question" style="font-size:2rem;margin-bottom:1rem;display:block"></i>
            Aucune question FAQ pour l'instant.
           </div>`
        : allFAQs.map(f => `
          <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:0.75rem;padding:1.25rem;margin-bottom:0.75rem">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem">
              <div style="flex:1">
                <div style="font-weight:600;color:var(--text-primary);margin-bottom:0.5rem;font-size:0.95rem">${escapeHtml(f.question)}</div>
                <div style="font-size:0.82rem;color:var(--text-muted);line-height:1.6">${f.answer}</div>
              </div>
              <div style="display:flex;gap:0.5rem;flex-shrink:0">
                <button onclick="openFAQModal('${f.id}')" style="background:rgba(0,102,255,0.1);border:1px solid rgba(0,102,255,0.2);color:var(--accent-light);border-radius:0.375rem;padding:0.4rem 0.7rem;cursor:pointer;font-size:0.78rem;font-family:inherit">
                  <i class="fas fa-pen"></i>
                </button>
                <button onclick="deleteFAQ('${f.id}')" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171;border-radius:0.375rem;padding:0.4rem 0.7rem;cursor:pointer;font-size:0.78rem;font-family:inherit">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
    `;
  } catch (err) {
    section.innerHTML = `<p style="color:var(--text-muted)">Erreur: ${err.message}</p>`;
  }
}

function openFAQModal(id) {
  const f = id ? allFAQs.find(x => x.id === id) : null;
  const isEdit = !!f;

  const inputStyle = `width:100%;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:0.5rem;padding:0.65rem 0.875rem;color:var(--text-primary);font-size:0.875rem;font-family:inherit;outline:none;box-sizing:border-box`;

  openModal(isEdit ? 'Modifier la Question FAQ' : 'Nouvelle Question FAQ', `
    <div style="display:flex;flex-direction:column;gap:1rem">
      <div>
        <label style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.4rem;display:block">Question *</label>
        <input id="faq-q" type="text" style="${inputStyle}" value="${isEdit ? escapeHtml(f.question) : ''}" placeholder="Ex: Combien coûte un site web ?" />
      </div>
      <div>
        <label style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.4rem;display:block">Réponse * <span style="font-size:0.7rem;color:var(--text-dim)">(HTML autorisé pour la mise en forme)</span></label>
        <textarea id="faq-a" rows="5" style="${inputStyle};resize:vertical">${isEdit ? f.answer : ''}</textarea>
      </div>
      <div>
        <label style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.4rem;display:block">Ordre d'affichage</label>
        <input id="faq-order" type="number" style="${inputStyle}" value="${isEdit ? f.order : allFAQs.length + 1}" min="1" />
      </div>
    </div>
    <button onclick="${isEdit ? `saveFAQEdit('${id}')` : 'saveFAQNew()'}" style="margin-top:1.5rem;width:100%;background:var(--gradient-primary);border:none;color:white;border-radius:0.5rem;padding:0.75rem;cursor:pointer;font-size:0.9rem;font-weight:600;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:0.5rem" id="faq-save-btn">
      <i class="fas fa-check"></i> Sauvegarder
    </button>
  `);
}

function saveFAQNew() {
  const data = {
    question: document.getElementById('faq-q').value,
    answer: document.getElementById('faq-a').value,
    order: parseInt(document.getElementById('faq-order').value) || 0
  };
  closeModal();
  apiPost('/faq', data).then(async () => {
    showToast('success', 'FAQ créée', 'La question a été ajoutée.');
    await loadFAQ();
  }).catch(err => showToast('error', 'Erreur', err.message));
}

function saveFAQEdit(id) {
  const data = {
    question: document.getElementById('faq-q').value,
    answer: document.getElementById('faq-a').value,
    order: parseInt(document.getElementById('faq-order').value) || 0
  };
  closeModal();
  apiPut('/faq/' + id, data).then(async () => {
    showToast('success', 'FAQ mise à jour', 'Les modifications ont été sauvegardées.');
    await loadFAQ();
  }).catch(err => showToast('error', 'Erreur', err.message));
}

function deleteFAQ(id) {
  const f = allFAQs.find(x => x.id === id);
  confirmDelete(f ? f.question.substring(0, 50) + '...' : 'cette question', async () => {
    try {
      await apiDelete('/faq/' + id);
      showToast('success', 'Supprimé', 'Question FAQ supprimée.');
      await loadFAQ();
    } catch (err) { showToast('error', 'Erreur', err.message); }
  });
}
