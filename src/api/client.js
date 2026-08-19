import { API_BASE_URL } from './config';

export function getAuthHeaders() {
  const token = sessionStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}
