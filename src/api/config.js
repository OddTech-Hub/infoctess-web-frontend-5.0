// Set this to your production backend URL (e.g., Render / DigitalOcean) or localhost
export const API_BASE_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8000'
    : 'http://127.0.0.1:8000'
);

export const STUDENT_LOGIN_URL = `${API_BASE_URL}/api/auth/student/login/`;

export function saveWebUser(user, token) {
  sessionStorage.setItem('web_user', JSON.stringify(user));
  sessionStorage.setItem('role', (user.role || '').toLowerCase());
  if (token) {
    const accessToken = typeof token === 'object' ? token.access : token;
    sessionStorage.setItem('access_token', accessToken);
  }
}
