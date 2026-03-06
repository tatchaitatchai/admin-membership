import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth'
import Loading from '@/components/shared/Loading'

const { unAuthenticatedEntryPath } = appConfig

const ProtectedRoute = () => {
    const { status } = useAuth()
    const { pathname } = useLocation()

    if (status === 'unknown') {
        return (
            <div className="flex flex-auto flex-col h-[100vh]">
                <Loading loading={true} />
            </div>
        )
    }

    if (status === 'unauthenticated') {
        const getPathName =
            pathname === '/'
                ? ''
                : `?${REDIRECT_URL_KEY}=${pathname}`

        return (
            <Navigate
                replace
                to={`${unAuthenticatedEntryPath}${getPathName}`}
            />
        )
    }

    return <Outlet />
}

export default ProtectedRoute
