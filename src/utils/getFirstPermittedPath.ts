import navigationConfig from '@/configs/navigation.config'
import type { NavigationTree } from '@/@types/navigation'
import appConfig from '@/configs/app.config'

/**
 * Walk the navigation tree and return the path of the first item
 * the user is allowed to see based on their permissions.
 * Falls back to appConfig.authenticatedEntryPath if nothing matches.
 */
export function getFirstPermittedPath(userPermissions: string[]): string {
    const find = (items: NavigationTree[]): string | null => {
        for (const item of items) {
            const hasAuthority =
                !item.authority ||
                item.authority.length === 0 ||
                item.authority.some((a) => userPermissions.includes(a))

            if (!hasAuthority) continue

            // If item has a direct path, use it
            if (item.path) return item.path

            // Otherwise check subMenu
            if (item.subMenu && item.subMenu.length > 0) {
                const sub = find(item.subMenu)
                if (sub) return sub
            }
        }
        return null
    }

    return find(navigationConfig) ?? appConfig.authenticatedEntryPath
}
