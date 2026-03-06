import { create } from 'zustand'
import { TOKEN_NAME_IN_STORAGE } from '@/constants/api.constant'
import { clearAllAuthState } from '@/lib/auth/clear-auth'
import type { AuthStatus, User } from '@/@types/auth'

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
            return
        }

        const token = localStorage.getItem(TOKEN_NAME_IN_STORAGE)
        if (!token) {
            set({ status: 'unauthenticated', initialized: true })
            return
        }

        try {
            const { apiGetSession } = await import('@/services/AuthService')
            const sessionInfo = await apiGetSession()

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
            clearAllAuthState()
            set({ status: 'unauthenticated', initialized: true })
        }
    },

    setUser: (payload) =>
        set((state) => ({
            user: { ...state.user, ...payload },
        })),

    loginSuccess: (token, user, permissions) => {
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
        if (isLoggingOut) return
        isLoggingOut = true

        const token = localStorage.getItem(TOKEN_NAME_IN_STORAGE)

        clearAllAuthState()

        if (token) {
            import('@/services/AuthService').then(({ apiSignOutWithToken }) => {
                apiSignOutWithToken(token)
            })
        }

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
    window.addEventListener('storage', (event) => {
        if (event.key === LOGOUT_CHANNEL && event.newValue) {
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
