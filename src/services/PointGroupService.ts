import ApiService from './ApiService'
import type { PaginatedResponse } from './StaffManagementService'

const API_PREFIX = 'api/v2/point-groups'

export type PointGroupListItem = {
    id: number
    group_name: string
    description: string
    is_active: boolean
    points_to_redeem: number
    product_count: number
    created_at: string
    updated_at: string
}

export type PointGroupDetail = {
    id: number
    store_id: number
    group_name: string
    description: string
    is_active: boolean
    points_to_redeem: number
    created_at: string
    updated_at: string
    products: PointGroupProductItem[]
}

export type PointGroupProductItem = {
    id: number
    product_id: number
    product_name: string
    image_path: string | null
    base_price: string
    created_at: string
}

export async function apiListPointGroups(params?: {
    page?: number
    limit?: number
    search?: string
}) {
    return ApiService.fetchData<PaginatedResponse<PointGroupListItem>>({
        url: API_PREFIX,
        method: 'get',
        params: params as Record<string, unknown>,
    })
}

export async function apiGetPointGroup(id: number) {
    return ApiService.fetchData<PointGroupDetail>({
        url: `${API_PREFIX}/${id}`,
        method: 'get',
    })
}

export async function apiCreatePointGroup(data: {
    group_name: string
    description?: string
    is_active?: boolean
    points_to_redeem?: number
}) {
    return ApiService.fetchData<{ id: number }>({
        url: API_PREFIX,
        method: 'post',
        data,
    })
}

export async function apiUpdatePointGroup(id: number, data: {
    group_name?: string
    description?: string
    is_active?: boolean
    points_to_redeem?: number
}) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeletePointGroup(id: number) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/${id}`,
        method: 'delete',
    })
}

export async function apiListGroupProducts(groupId: number) {
    return ApiService.fetchData<{ products: PointGroupProductItem[] }>({
        url: `${API_PREFIX}/${groupId}/products`,
        method: 'get',
    })
}

export async function apiAddProductsToGroup(groupId: number, productIds: number[]) {
    return ApiService.fetchData<{ added: number }>({
        url: `${API_PREFIX}/${groupId}/products`,
        method: 'post',
        data: { product_ids: productIds },
    })
}

export async function apiRemoveProductFromGroup(groupId: number, productId: number) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/${groupId}/products/${productId}`,
        method: 'delete',
    })
}
