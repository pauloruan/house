import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080"
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/"
    }
    return Promise.reject(error)
  }
)

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080"

export function proxifyAvatar(url: string | null | undefined): string {
  if (!url) return ""
  if (url.startsWith("https://lh3.googleusercontent.com/")) {
    return `${API_BASE}/avatar?url=${encodeURIComponent(url)}`
  }
  return url
}
