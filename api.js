const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const isApiConfigured = Boolean(API_URL);

async function request(path, { method = 'GET', body, token } = {}) {
  if (!API_URL) {
    const err = new Error('Backend not configured. Set EXPO_PUBLIC_API_URL in mobile/.env.');
    err.setup = true;
    throw err;
  }
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and that the backend is running.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status}).`);
    err.setup = res.status === 503;
    throw err;
  }
  return data;
}

export const generateContent = (token, payload) =>
  request('/api/generate', { method: 'POST', body: payload, token });

export const listProjects = async (token) => (await request('/api/projects', { token })).projects;

export const createProject = async (token, project) =>
  (await request('/api/projects', { method: 'POST', body: project, token })).project;

export const deleteProject = (token, id) =>
  request(`/api/projects/${id}`, { method: 'DELETE', token });
