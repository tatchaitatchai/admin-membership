import ApiService from './ApiService'
import type {
    StaffListItem,
    StaffDetailItem,
    CreateStaffPayload,
    UpdateStaffPayload,
    ChangePinPayload,
    ChangePasswordPayload,
    BranchOption,
} from '@/views/staff-management/types'

const API_PREFIX = 'api/v2/staff-management'

export type PaginatedResponse<T> = {
    data: T[]
    total: number
    page: number
    limit: number
    total_pages: number
}

export async function apiListStaff(params?: {
    page?: number
    limit?: number
    search?: string
}) {
    return ApiService.fetchData<PaginatedResponse<StaffListItem>>({
        url: API_PREFIX,
        method: 'get',
        params: params as Record<string, unknown>,
    })
}

export async function apiGetStaffDetail(staffId: number) {
    return ApiService.fetchData<StaffDetailItem>({
        url: `${API_PREFIX}/${staffId}`,
        method: 'get',
    })
}

export async function apiCreateStaff(data: CreateStaffPayload) {
    return ApiService.fetchData<{ id: number }>({
        url: API_PREFIX,
        method: 'post',
        data,
    })
}

export async function apiUpdateStaff(staffId: number, data: UpdateStaffPayload) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/${staffId}`,
        method: 'put',
        data,
    })
}

export async function apiChangePin(staffId: number, data: ChangePinPayload) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/${staffId}/pin`,
        method: 'put',
        data,
    })
}

export async function apiChangePassword(staffId: number, data: ChangePasswordPayload) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/${staffId}/password`,
        method: 'put',
        data,
    })
}

export async function apiDeleteStaff(staffId: number) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/${staffId}`,
        method: 'delete',
    })
}

export async function apiListBranches() {
    const resp = await ApiService.fetchData<{ branches: BranchOption[] }>({
        url: 'api/v2/branches',
        method: 'get',
    })
    return resp.branches ?? []
}
