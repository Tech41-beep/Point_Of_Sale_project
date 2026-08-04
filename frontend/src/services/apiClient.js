const buildUrl = (path) => path.startsWith('/api') ? path : `/api${path}`;

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : {};
};

export const apiClient = {
  async get(path) {
    const response = await fetch(buildUrl(path), { credentials: 'include' });
    return parseResponse(response);
  },

  async post(path, body) {
    const response = await fetch(buildUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await parseResponse(response);
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  },
};
