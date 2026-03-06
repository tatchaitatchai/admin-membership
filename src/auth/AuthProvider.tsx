import { useRef, useImperativeHandle, useEffect } from 'react'
import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { useAuthStore } from '@/store/authStore'
import { apiSignIn } from '@/services/AuthService'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router-dom'
import type {
    SignInCredential,
    SignUpCredential,
    AuthResult,
    OauthSignInCallbackPayload,
    Token,
    User,
} from '@/@types/auth'
import type { ReactNode, Ref } from 'react'
import type { NavigateFunction } from 'react-router-dom'

type AuthProviderProps = { children: ReactNode }

export type IsolatedNavigatorRef = {
    navigate: NavigateFunction
}

const IsolatedNavigator = ({ ref }: { ref: Ref<IsolatedNavigatorRef> }) => {
    const navigate = useNavigate()

    useImperativeHandle(
        ref,
        () => ({
            navigate,
        }),
        [navigate],
    )

    return <></>
}

function AuthProvider({ children }: AuthProviderProps) {
    const status = useAuthStore((s) => s.status)
    const user = useAuthStore((s) => s.user)
    const initializeAuth = useAuthStore((s) => s.initializeAuth)
    const loginSuccess = useAuthStore((s) => s.loginSuccess)
    const logout = useAuthStore((s) => s.logout)

    const navigatorRef = useRef<IsolatedNavigatorRef>(null)

    useEffect(() => {
        initializeAuth()
    }, [initializeAuth])

    const authenticated = status === 'authenticated'

    const redirect = () => {
        const search = window.location.search
        const params = new URLSearchParams(search)
        const redirectUrl = params.get(REDIRECT_URL_KEY)

        navigatorRef.current?.navigate(
            redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath,
        )
    }

    const signIn = async (values: SignInCredential): AuthResult => {
        try {
            const resp = await apiSignIn({ ...values, source: 'web' })
            if (resp?.session_token) {
                const perms = resp.permissions ?? []
                loginSuccess(resp.session_token, {
                    userName: resp.store_name,
                    authority: perms,
                    storeId: resp.store_id,
                    storeName: resp.store_name,
                    branchId: resp.branch_id ?? undefined,
                }, perms)
                redirect()
                return {
                    status: 'success',
                    message: '',
                }
            }
            return {
                status: 'failed',
                message: 'Unable to sign in',
            }
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            let message = errors.toString()
            if (errors?.response) {
                try {
                    const body = await errors.response.json()
                    message = body?.error || body?.message || message
                } catch {
                    // ignore parse error
                }
            }
            return { status: 'failed', message }
        }
    }

    const signUp = async (_values: SignUpCredential): AuthResult => {
        return { status: 'failed', message: 'Not implemented' }
    }

    const signOut = () => {
        logout()
        navigatorRef.current?.navigate(appConfig.unAuthenticatedEntryPath)
    }

    const oAuthSignIn = (
        callback: (payload: OauthSignInCallbackPayload) => void,
    ) => {
        callback({
            onSignIn: (tokens: Token, user?: User) => {
                if (tokens.accessToken && user) {
                    loginSuccess(tokens.accessToken, user)
                }
            },
            redirect,
        })
    }

    return (
        <AuthContext.Provider
            value={{
                status,
                authenticated,
                user,
                signIn,
                signUp,
                signOut,
                oAuthSignIn,
            }}
        >
            {children}
            <IsolatedNavigator ref={navigatorRef} />
        </AuthContext.Provider>
    )
}

export default AuthProvider
