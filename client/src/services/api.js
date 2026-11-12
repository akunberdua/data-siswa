const API_BASE = '/api';

export const tokenStorage = {
  get: () => localStorage.getItem('sipendik_token'),
  set: (token) => localStorage.setItem('sipendik_token', token),
  remove: () => localStorage.removeItem('sipendik_token'),
};

export const userStorage = {
  get: () => {
    try {
      const u = localStorage.getItem('sipendik_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  set: (user) => localStorage.setItem('sipendik_user', JSON.stringify(user)),
  remove: () => localStorage.removeItem('sipendik_user'),
};

async function request(endpoint, options = {}) {
  const token = tokenStorage.get();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Terjadi kesalahan pada server');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  auth: {
    register: (payload) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    login: (payload) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    me: () => request('/auth/me'),
  },
  student: {
    getProfile: () => request('/student/profile'),
    updateProfile: (payload) =>
      request('/student/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
  },
  admin: {
    getStudents: (params = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, val);
        }
      });
      const query = searchParams.toString();
      return request(`/admin/students${query ? `?${query}` : ''}`);
    },
    getStudentById: (id) => request(`/admin/students/${id}`),
    updateStatus: (id, payload) =>
      request(`/admin/students/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    deleteStudent: (id) =>
      request(`/admin/students/${id}`, {
        method: 'DELETE',
      }),
  },
};

/**
 * Helper untuk mengompres gambar sebelum diunggah agar hemat memori & cepat disimpan
 */
export function compressImage(file, maxWidth = 1200, maxHeight = 900, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file.type.match(/image.*/)) {
      return reject(new Error('File yang dipilih bukan gambar'));
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

