import ky from 'ky'
import {
    TOKEN_NAME_IN_STORAGE,
    TOKEN_TYPE,
    REQUEST_HEADER_AUTH_KEY,
} from '@/constants/api.constant'
import { useAuthStore } from '@/store/authStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const UNAUTHORIZED_CODES = [401, 419, 440]

const http = ky.create({
    prefixUrl: BASE_URL,
    timeout: 60000,
    hooks: {
        beforeRequest: [
            (request) => {
                const token =
                    localStorage.getItem(TOKEN_NAME_IN_STORAGE) ?? ''
                if (token) {
                    request.headers.set(
                        REQUEST_HEADER_AUTH_KEY,
                        `${TOKEN_TYPE}${token}`,
                    )
                }
            },
        ],
        afterResponse: [
            (_request, _options, response) => {
                if (UNAUTHORIZED_CODES.includes(response.status)) {
                    useAuthStore.getState().logout()
                }
                return response
            },
        ],
    },
})

export default http
