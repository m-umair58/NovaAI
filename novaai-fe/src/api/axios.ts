import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60_000,
})

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
)

export default api