import { useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'

export function usePermission() {
    const permissions = useAuthStore((s) => s.permissions)

    const hasPermission = useMemo(() => {
        return (code: string) => permissions.includes(code)
    }, [permissions])

    const hasAnyPermission = useMemo(() => {
        return (codes: string[]) => codes.some((c) => permissions.includes(c))
    }, [permissions])

    const hasAllPermissions = useMemo(() => {
        return (codes: string[]) => codes.every((c) => permissions.includes(c))
    }, [permissions])

    return { permissions, hasPermission, hasAnyPermission, hasAllPermissions }
}

export default usePermission
