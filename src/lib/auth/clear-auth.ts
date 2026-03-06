import Cookies from 'js-cookie'
import { TOKEN_NAME_IN_STORAGE } from '@/constants/api.constant'

const AUTH_DEBUG = false

function debugLog(...args: unknown[]) {
    if (AUTH_DEBUG) {
        console.log('[AUTH:clear]', ...args)
    }
}

/**
 * Centralized utility to clear ALL auth-related state.
 * This is the single place that handles cleanup — never duplicate this logic.
 */
export function clearAllAuthState(): void {
    debugLog('Clearing all auth state...')

    localStorage.removeItem(TOKEN_NAME_IN_STORAGE)

    localStorage.removeItem('sessionUser')

    sessionStorage.removeItem(TOKEN_NAME_IN_STORAGE)

    Cookies.remove(TOKEN_NAME_IN_STORAGE, { path: '/' })
    Cookies.remove('sessionUser', { path: '/' })

    debugLog('All auth state cleared.')
}
