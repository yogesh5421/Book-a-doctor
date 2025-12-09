// small helpers for auth token + user
export function saveAuth(data) {
  if (!data) return;
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
}
export function getToken() {
  return localStorage.getItem('token');
}
export function getUser() {
  const u = localStorage.getItem('user');
  try { return u ? JSON.parse(u) : null; } catch { return null; }
}
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}