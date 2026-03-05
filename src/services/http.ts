import ky from 'ky'
import {
    TOKEN_NAME_IN_STORAGE,
    TOKEN_TYPE,
    REQUEST_HEADER_AUTH_KEY,
} from '@/constants/api.constant'
import { useSessionUser } from '@/store/authStore'
import appConfig from '@/configs/app.config'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const unauthorizedCodes = [401, 419, 440]

const http = ky.create({
    prefixUrl: BASE_URL,
    timeout: 60000,
    hooks: {
        beforeRequest: [
            (request) => {
                const storage = appConfig.accessTokenPersistStrategy
                let token = ''
                if (storage === 'localStorage') {
                    token = localStorage.getItem(TOKEN_NAME_IN_STORAGE) ?? ''
                } else if (storage === 'sessionStorage') {
                    token = sessionStorage.getItem(TOKEN_NAME_IN_STORAGE) ?? ''
                }
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
                if (unauthorizedCodes.includes(response.status)) {
                    localStorage.removeItem(TOKEN_NAME_IN_STORAGE)
                    sessionStorage.removeItem(TOKEN_NAME_IN_STORAGE)
                    useSessionUser.getState().setUser({})
                    useSessionUser.getState().setSessionSignedIn(false)
                }
                return response
            },
        ],
    },
})

export default http
