import Cookies from 'js-cookie'
import { TOKEN_NAME_IN_STORAGE } from '@/constants/api.constant'

/**
 * Centralized utility to clear ALL auth-related state.
 * This is the single place that handles cleanup — never duplicate this logic.
 */
export function clearAllAuthState(): void {
    localStorage.removeItem(TOKEN_NAME_IN_STORAGE)
    localStorage.removeItem('sessionUser')
    sessionStorage.removeItem(TOKEN_NAME_IN_STORAGE)
    Cookies.remove(TOKEN_NAME_IN_STORAGE, { path: '/' })
    Cookies.remove('sessionUser', { path: '/' })
}
