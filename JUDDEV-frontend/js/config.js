/* ============================================================
   JUDDEV CORPORATION - Frontend Configuration
   Update API_URL when deploying to production
   ============================================================ */

const JUDDEV_CONFIG = {
  // Backend API URL - update this for production deployment
  API_URL: 'http://localhost:5000/api',
  UPLOADS_URL: 'http://localhost:5000/uploads',

  // Helper to resolve image URLs
  getImageUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/uploads/')) return 'http://localhost:5000' + path;
    return path; // local relative path (e.g., images/dev1.jpg)
  }
};
