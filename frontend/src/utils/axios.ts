import axios from 'axios'
import { API_ROUTE } from './const'
import { useSessionStore } from '@/stores/SessionStore'

const sessionStore = useSessionStore()

const api = axios.create({
    baseURL: API_ROUTE,
    timeout: 10000,
})

api.interceptors.request.use(
    (config) => {
        const token = sessionStore.token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

export default api
