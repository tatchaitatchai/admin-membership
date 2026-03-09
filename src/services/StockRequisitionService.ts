import ApiService from './ApiService'
import type { PaginatedResponse } from './StaffManagementService'

const API_PREFIX = 'api/v2/stock-requisitions'

export type StockRequisitionListItem = {
    id: number
    from_branch_id: number | null
    from_branch_name: string | null
    to_branch_id: number
    to_branch_name: string
    status: string
    note: string | null
    item_count: number
    created_at: string
    updated_at: string
}

export type StockRequisitionItemResp = {
    id: number
    product_id: number
    product_name: string
    send_count: number
    receive_count: number
}

export type StockRequisitionDetail = {
    id: number
    from_branch_id: number | null
    from_branch_name: string | null
    to_branch_id: number
    to_branch_name: string
    status: string
    sent_by_name: string | null
    received_by_name: string | null
    sent_at: string | null
    received_at: string | null
    note: string | null
    items: StockRequisitionItemResp[]
    created_at: string
    updated_at: string
}

export async function apiListRequisitions(params?: {
    page?: number
    limit?: number
    search?: string
    branch_id?: number
    status?: string
}) {
    return ApiService.fetchData<PaginatedResponse<StockRequisitionListItem>>({
        url: API_PREFIX,
        method: 'get',
        params: params as Record<string, unknown>,
    })
}

export async function apiGetRequisition(id: number) {
    return ApiService.fetchData<StockRequisitionDetail>({
        url: `${API_PREFIX}/${id}`,
        method: 'get',
    })
}

export async function apiCreateRequisition(data: {
    from_branch_id?: number | null
    to_branch_id: number
    note?: string
    items: { product_id: number; send_count: number }[]
}) {
    return ApiService.fetchData<{ id: number }>({
        url: API_PREFIX,
        method: 'post',
        data,
    })
}

export async function apiUpdateRequisitionStatus(id: number, status: string) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/${id}/status`,
        method: 'put',
        data: { status },
    })
}

export async function apiDeleteRequisition(id: number) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/${id}`,
        method: 'delete',
    })
}
