import { create } from 'zustand'
import { TOKEN_NAME_IN_STORAGE } from '@/constants/api.constant'
import { clearAllAuthState } from '@/lib/auth/clear-auth'
import type { AuthStatus, User } from '@/@types/auth'

const AUTH_DEBUG = false

function debugLog(...args: unknown[]) {
    if (AUTH_DEBUG) {
        console.log('[AUTH:store]', ...args)
    }
}

const LOGOUT_CHANNEL = 'auth:logout'
let broadcastChannel: BroadcastChannel | null = null

try {
    broadcastChannel = new BroadcastChannel(LOGOUT_CHANNEL)
} catch {
    // BroadcastChannel not supported — fallback below
}

type AuthState = {
    status: AuthStatus
    user: User
    permissions: string[]
    initialized: boolean
}

type AuthAction = {
    initializeAuth: () => Promise<void>
    setUser: (payload: User) => void
    loginSuccess: (token: string, user: User, permissions?: string[]) => void
    logout: () => void
    resetAuth: () => void
}

const initialState: AuthState = {
    status: 'unknown',
    user: {
        avatar: '',
        userName: '',
        email: '',
        authority: [],
    },
    permissions: [],
    initialized: false,
}

let isLoggingOut = false

export const useAuthStore = create<AuthState & AuthAction>()((set, get) => ({
    ...initialState,

    initializeAuth: async () => {
        const { initialized, status } = get()
        if (initialized || status === 'authenticated') {
            debugLog('Already initialized or authenticated, skipping')
            return
        }

        debugLog('Initializing auth...')

        const token = localStorage.getItem(TOKEN_NAME_IN_STORAGE)
        if (!token) {
            debugLog('No token found → unauthenticated')
            set({ status: 'unauthenticated', initialized: true })
            return
        }

        try {
            const { default: http } = await import('@/services/http')
            const sessionInfo = await http
                .get('api/v2/auth/session')
                .json<{
                    store_id: number
                    store_name: string
                    branch_id?: number | null
                    branch_name?: string | null
                    staff_id?: number | null
                    staff_name?: string | null
                    permissions: string[]
                }>()

            debugLog('Session valid:', sessionInfo)

            const perms = sessionInfo.permissions ?? []

            set({
                status: 'authenticated',
                initialized: true,
                permissions: perms,
                user: {
                    userName: sessionInfo.store_name,
                    email: sessionInfo.staff_name ?? undefined,
                    authority: perms,
                    storeId: sessionInfo.store_id,
                    storeName: sessionInfo.store_name,
                    branchId: sessionInfo.branch_id ?? undefined,
                    branchName: sessionInfo.branch_name ?? undefined,
                },
            })
        } catch {
            debugLog('Session invalid → unauthenticated')
            clearAllAuthState()
            set({ status: 'unauthenticated', initialized: true })
        }
    },

    setUser: (payload) =>
        set((state) => ({
            user: { ...state.user, ...payload },
        })),

    loginSuccess: (token, user, permissions) => {
        debugLog('Login success, storing token')
        localStorage.setItem(TOKEN_NAME_IN_STORAGE, token)
        const perms = permissions ?? []
        set({
            status: 'authenticated',
            initialized: true,
            permissions: perms,
            user: { ...user, authority: perms },
        })
    },

    logout: () => {
        if (isLoggingOut) {
            debugLog('Logout already in progress, skipping')
            return
        }
        isLoggingOut = true
        debugLog('Logout triggered')

        const token = localStorage.getItem(TOKEN_NAME_IN_STORAGE)
        if (token) {
            import('@/services/http').then(({ default: http }) => {
                http.post('api/v2/auth/logout').catch(() => {
                })
            })
        }

        clearAllAuthState()

        set({ ...initialState, status: 'unauthenticated', initialized: true })

        try {
            broadcastChannel?.postMessage('logout')
        } catch {
            localStorage.setItem(LOGOUT_CHANNEL, Date.now().toString())
            localStorage.removeItem(LOGOUT_CHANNEL)
        }

        setTimeout(() => {
            isLoggingOut = false
        }, 100)
    },

    resetAuth: () => set(initialState),
}))

if (broadcastChannel) {
    broadcastChannel.onmessage = (event) => {
        if (event.data === 'logout') {
            debugLog('Logout received from another tab')
            clearAllAuthState()
            useAuthStore.setState({
                ...initialState,
                status: 'unauthenticated',
                initialized: true,
            })
            window.location.href = '/sign-in'
        }
    }
} else {
    // Fallback: listen for localStorage events (cross-tab)
    window.addEventListener('storage', (event) => {
        if (event.key === LOGOUT_CHANNEL && event.newValue) {
            debugLog('Logout received from another tab (localStorage fallback)')
            clearAllAuthState()
            useAuthStore.setState({
                ...initialState,
                status: 'unauthenticated',
                initialized: true,
            })
            window.location.href = '/sign-in'
        }
    })
}

// ─── Backward-compatible exports for Ecme theme ──────────
// These bridge the old API so Layout and other theme components keep working.
export const useSessionUser = useAuthStore

export const useToken = () => {
    const setToken = (token: string) => {
        if (token) {
            localStorage.setItem(TOKEN_NAME_IN_STORAGE, token)
        } else {
            localStorage.removeItem(TOKEN_NAME_IN_STORAGE)
        }
    }

    return {
        setToken,
        token: localStorage.getItem(TOKEN_NAME_IN_STORAGE),
    }
}
