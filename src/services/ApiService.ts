import http from './http'
import type { Options } from 'ky'

type FetchParam = {
    url: string
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete'
    data?: unknown
    params?: Record<string, unknown>
} & Omit<Options, 'method' | 'json' | 'searchParams'>

const ApiService = {
    fetchData<Response = unknown>(param: FetchParam): Promise<Response> {
        const { url, method = 'get', data, params, ...rest } = param
        return http(url, {
            method,
            ...(data !== undefined ? { json: data } : {}),
            ...(params ? { searchParams: params as Record<string, string> } : {}),
            ...rest,
        }).json<Response>()
    },
}

export default ApiService
