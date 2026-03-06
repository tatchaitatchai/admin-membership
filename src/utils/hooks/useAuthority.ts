import { useMemo } from 'react'
import isEmpty from 'lodash/isEmpty'

function useAuthority(
    userAuthority: string[] = [],
    authority: string[] = [],
    emptyCheck = false,
) {
    const roleMatched = useMemo(() => {
        return authority.some((role) => userAuthority.includes(role))
    }, [authority, userAuthority])

    if (isEmpty(authority) || typeof authority === 'undefined') {
        return !emptyCheck
    }

    if (isEmpty(userAuthority)) {
        return false
    }

    return roleMatched
}

export default useAuthority
