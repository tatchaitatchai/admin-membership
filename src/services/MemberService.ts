import ApiService from './ApiService'
import type { TableQueries } from '@/@types/common'
import type { GetMembersResponse, MemberFields } from '@/views/members/types'

export async function apiGetMembersList(params: TableQueries) {
    return ApiService.fetchData<{ data: GetMembersResponse }>({
        url: 'api/v1/members',
        method: 'get',
        params: {
            page: params.pageIndex,
            limit: params.pageSize,
            query: params.query,
            sort_key: params.sort?.key,
            sort_order: params.sort?.order,
        },
    })
}

export async function apiGetMember(id: string) {
    return ApiService.fetchData<{ data: MemberFields }>({
        url: `api/v1/members/${id}`,
        method: 'get',
    })
}

export async function apiCreateMember(data: Partial<MemberFields>) {
    return ApiService.fetchData<{ data: MemberFields }>({
        url: 'api/v1/members',
        method: 'post',
        data,
    })
}

export async function apiUpdateMember(id: string, data: Partial<MemberFields>) {
    return ApiService.fetchData<{ data: MemberFields }>({
        url: `api/v1/members/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteMember(id: string) {
    return ApiService.fetchData<{ message: string }>({
        url: `api/v1/members/${id}`,
        method: 'delete',
    })
}
