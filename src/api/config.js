export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://web-production-00f6a2.up.railway.app';
export const STUDENT_LOGIN_URL = `${API_BASE_URL}/api/auth/rep/login/`;

export function saveWebUser(user, token) {
  sessionStorage.setItem('web_user', JSON.stringify(user));
  if (token) {
    const accessToken = typeof token === 'object' ? token.access : token;
    sessionStorage.setItem('access_token', accessToken);
  }
}
