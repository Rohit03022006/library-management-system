import axios from 'axios'
const API_BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }
  
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => {
    console.log('Sending registration data:', userData);
    return api.post('/auth/register', userData)
      .then(response => {
        console.log('Registration response:', response);
        return response;
      })
      .catch(error => {
        console.error('Registration error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      });
  }
}
export const booksAPI = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  create: (bookData) => {
    if (bookData instanceof FormData) {
      return api.post('/books', bookData)
    }
    return api.post('/books', bookData)
  },
  update: (id, bookData) => api.put(`/books/${id}`, bookData),
  delete: (id) => api.delete(`/books/${id}`),
  updateCover: (id, formData) => api.patch(`/books/${id}/cover`, formData),
  search: (params) => api.get('/books/search', { params }),
  getAnalytics: () => api.get('/books/analytics/overview'),
  getQRCode: (id) => api.get(`/books/${id}/qr-code`, { responseType: 'blob' }),
}

export const borrowAPI = {
  getAll: (params) => api.get('/borrow', { params }),
  borrow: (data) => api.post('/borrow', data),
  return: (borrowId) => api.patch(`/borrow/${borrowId}/return`),
}

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  activate: (id) => api.patch(`/users/${id}/activate`),
  deactivate: (id) => api.patch(`/users/${id}/deactivate`),
  getQRCode: (id) => api.get(`/users/${id}/qr-code`, { responseType: 'blob' }),
  register: (userData) => api.post('/auth/register', userData),
}

export default api