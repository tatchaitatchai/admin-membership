import { Navigate, Outlet } from 'react-router-dom'
import appConfig from '@/configs/app.config'
import { useAuth } from '@/auth'
import Loading from '@/components/shared/Loading'

const { authenticatedEntryPath } = appConfig

const PublicRoute = () => {
    const { status } = useAuth()

    if (status === 'unknown') {
        return (
            <div className="flex flex-auto flex-col h-[100vh]">
                <Loading loading={true} />
            </div>
        )
    }

    if (status === 'authenticated') {
        return <Navigate to={authenticatedEntryPath} replace />
    }

    return <Outlet />
}

export default PublicRoute
