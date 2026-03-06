import ApiService from './ApiService'
import type { PaginatedResponse } from './StaffManagementService'

const API_PREFIX = 'api/v2/branch-management'

export type BranchListItem = {
    id: number
    branch_name: string
    is_active: boolean
    is_shift_opened: boolean
    staff_count: number
    product_count: number
    created_at: string
    updated_at: string
}

export type BranchDetail = BranchListItem & {
    store_id: number
}

export async function apiListBranchesPaginated(params?: {
    page?: number
    limit?: number
    search?: string
}) {
    return ApiService.fetchData<PaginatedResponse<BranchListItem>>({
        url: API_PREFIX,
        method: 'get',
        params: params as Record<string, unknown>,
    })
}

export async function apiGetBranch(branchId: number) {
    return ApiService.fetchData<BranchDetail>({
        url: `${API_PREFIX}/${branchId}`,
        method: 'get',
    })
}

export async function apiCreateBranch(data: {
    branch_name: string
    is_active?: boolean
}) {
    return ApiService.fetchData<{ id: number }>({
        url: API_PREFIX,
        method: 'post',
        data,
    })
}

export async function apiUpdateBranch(branchId: number, data: {
    branch_name?: string
    is_active?: boolean
}) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/${branchId}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteBranch(branchId: number) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/${branchId}`,
        method: 'delete',
    })
}
