const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ai-contract-review-pwy5.onrender.com/api' : 'http://localhost:5000/api');

async function getHeaders(token) {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  async uploadContract(file, token) {
    const headers = await getHeaders(token);
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/contracts`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error?.message || 'Failed to upload contract');
    }

    return res.json();
  },

  async listContracts(token) {
    const headers = await getHeaders(token);
    const res = await fetch(`${API_BASE}/contracts`, { headers });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error?.message || 'Failed to list contracts');
    }
    return res.json();
  },

  async getContract(contractId, token) {
    const headers = await getHeaders(token);
    const res = await fetch(`${API_BASE}/contracts/${contractId}`, { headers });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error?.message || 'Failed to fetch contract');
    }
    return res.json();
  },

  async deleteContract(contractId, token) {
    const headers = await getHeaders(token);
    const res = await fetch(`${API_BASE}/contracts/${contractId}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error?.message || 'Failed to delete contract');
    }
    return res.json();
  },

  async getReview(contractId, token) {
    const headers = await getHeaders(token);
    const res = await fetch(`${API_BASE}/contracts/${contractId}/review`, { headers });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error?.message || 'Failed to fetch review');
    }
    return res.json();
  },

  async retryReview(contractId, token) {
    const headers = await getHeaders(token);
    const res = await fetch(`${API_BASE}/contracts/${contractId}/review`, {
      method: 'POST',
      headers,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error?.message || 'Failed to retry review');
    }
    return res.json();
  },

  async getChatHistory(contractId, token) {
    const headers = await getHeaders(token);
    const res = await fetch(`${API_BASE}/contracts/${contractId}/chat`, { headers });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error?.message || 'Failed to fetch chat history');
    }
    return res.json();
  },

  async streamChat(contractId, question, token, { onToken, onCitation, onComplete, onError }) {
    const headers = await getHeaders(token);
    headers['Content-Type'] = 'application/json';

    try {
      const res = await fetch(`${API_BASE}/contracts/${contractId}/chat/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error?.message || 'Failed to start chat stream');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const match = block.match(/event:\s*(\w+)\ndata:\s*(.*)/s);
          if (match) {
            const [, event, dataStr] = match;
            try {
              const data = JSON.parse(dataStr);
              if (event === 'token' && onToken) {
                onToken(data.text);
              } else if (event === 'citation' && onCitation) {
                onCitation(data);
              } else if (event === 'message_complete' && onComplete) {
                onComplete(data);
              } else if (event === 'error' && onError) {
                onError(new Error(data.message || 'Stream error'));
              }
            } catch (e) {
              console.error('Error parsing SSE data', e);
            }
          }
        }
      }
    } catch (err) {
      if (onError) onError(err);
    }
  },
};
