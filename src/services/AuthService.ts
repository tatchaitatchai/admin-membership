import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'
import type {
    SignInCredential,
    SignInResponse,
    SessionInfo,
    ForgotPassword,
    ResetPassword,
} from '@/@types/auth'

export async function apiSignIn(data: SignInCredential) {
    return ApiService.fetchData<SignInResponse>({
        url: endpointConfig.signIn,
        method: 'post',
        data,
    })
}

export async function apiGetSession() {
    return ApiService.fetchData<SessionInfo>({
        url: endpointConfig.session,
        method: 'get',
    })
}

export async function apiSignOut() {
    return ApiService.fetchData({
        url: endpointConfig.signOut,
        method: 'post',
    })
}

export async function apiForgotPassword<T>(data: ForgotPassword) {
    return ApiService.fetchData<T>({
        url: endpointConfig.forgotPassword,
        method: 'post',
        data,
    })
}

export async function apiResetPassword<T>(data: ResetPassword) {
    return ApiService.fetchData<T>({
        url: endpointConfig.resetPassword,
        method: 'post',
        data,
    })
}
