// Production API Configuration - Permanent Cloud Backend
export const API_BASE_URL = 'https://smart-attandance-23d3de69093c.herokuapp.com';
export const STUDENT_LOGIN_URL = `${API_BASE_URL}/api/auth/student/login/`;

export function saveWebUser(user, token) {
  sessionStorage.setItem('web_user', JSON.stringify(user));
  sessionStorage.setItem('role', (user.role || '').toLowerCase());
  if (token) {
    const accessToken = typeof token === 'object' ? token.access : token;
    sessionStorage.setItem('access_token', accessToken);
  }
}
