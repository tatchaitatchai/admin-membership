export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated'

export type SignInCredential = {
    email: string
    password: string
    source?: string
}

export type SignInResponse = {
    session_token: string
    store_id: number
    branch_id?: number | null
    store_name: string
    expires_at: string
}

export type SessionInfo = {
    store_id: number
    store_name: string
    branch_id?: number | null
    branch_name?: string | null
    staff_id?: number | null
    staff_name?: string | null
    permissions: string[]
    expires_at: string
}

export type AuthRequestStatus = 'success' | 'failed' | ''

export type AuthResult = Promise<{
    status: AuthRequestStatus
    message: string
}>

export type User = {
    userId?: string | null
    avatar?: string | null
    userName?: string | null
    email?: string | null
    authority?: string[]
    storeId?: number | null
    storeName?: string | null
    branchId?: number | null
    branchName?: string | null
}

export type SignUpCredential = {
    userName: string
    email: string
    password: string
}

export type SignUpResponse = SignInResponse

export type ForgotPassword = {
    email: string
}

export type ResetPassword = {
    password: string
}

export type Token = {
    accessToken: string
    refereshToken?: string
}

export type OauthSignInCallbackPayload = {
    onSignIn: (tokens: Token, user?: User) => void
    redirect: () => void
}
