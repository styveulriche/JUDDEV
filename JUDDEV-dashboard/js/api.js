/* ============================================================
   JUDDEV CORPORATION - Dashboard API Helper
   ============================================================ */

const API_URL = 'http://localhost:5000/api';
const UPLOADS_URL = 'http://localhost:5000';

function getToken() {
  return localStorage.getItem('juddev_token');
}

function getAuthHeaders() {
  return { 'Authorization': 'Bearer ' + getToken() };
}

function getJSONHeaders() {
  return {
    'Authorization': 'Bearer ' + getToken(),
    'Content-Type': 'application/json'
  };
}

function checkAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem('juddev_token');
  localStorage.removeItem('juddev_user');
  window.location.href = 'login.html';
}

function resolveImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/uploads/')) return UPLOADS_URL + path;
  if (path.startsWith('images/')) return '../JUDDEV-frontend/' + path;
  return path;
}

async function apiGet(endpoint) {
  const res = await fetch(API_URL + endpoint, {
    headers: getAuthHeaders()
  });
  if (res.status === 401) { logout(); return null; }
  if (!res.ok) throw new Error('Erreur API: ' + res.status);
  return res.json();
}

async function apiPublicGet(endpoint) {
  const res = await fetch(API_URL + endpoint);
  if (!res.ok) throw new Error('Erreur API: ' + res.status);
  return res.json();
}

async function apiPost(endpoint, data) {
  const res = await fetch(API_URL + endpoint, {
    method: 'POST',
    headers: getJSONHeaders(),
    body: JSON.stringify(data)
  });
  if (res.status === 401) { logout(); return null; }
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Erreur API');
  return result;
}

async function apiPut(endpoint, data) {
  const res = await fetch(API_URL + endpoint, {
    method: 'PUT',
    headers: getJSONHeaders(),
    body: JSON.stringify(data)
  });
  if (res.status === 401) { logout(); return null; }
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Erreur API');
  return result;
}

async function apiDelete(endpoint) {
  const res = await fetch(API_URL + endpoint, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (res.status === 401) { logout(); return null; }
  if (!res.ok) {
    const result = await res.json();
    throw new Error(result.message || 'Erreur API');
  }
  return res.json();
}

async function apiPostForm(endpoint, formData) {
  const res = await fetch(API_URL + endpoint, {
    method: 'POST',
    headers: getAuthHeaders(), // No Content-Type - let browser set it with boundary
    body: formData
  });
  if (res.status === 401) { logout(); return null; }
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Erreur API');
  return result;
}

async function apiPutForm(endpoint, formData) {
  const res = await fetch(API_URL + endpoint, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData
  });
  if (res.status === 401) { logout(); return null; }
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Erreur API');
  return result;
}
