import ApiService from './ApiService'
import type { PaginatedResponse } from './StaffManagementService'

const API_PREFIX = 'api/v2/promotion-management'

export type PromotionTypeOption = {
    id: number
    name: string
    detail: string
}

export type PromotionListItem = {
    id: number
    promotion_name: string
    promotion_type_id: number
    promotion_type_name: string
    is_active: boolean
    starts_at: string | null
    ends_at: string | null
    product_count: number
    created_at: string
}

export type PromotionConfig = {
    id: number
    percent_discount: number | null
    baht_discount: number | null
    total_price_set_discount: number | null
    old_price_set: number | null
    count_condition_product: number | null
    product_id: number | null
}

export type PromotionProduct = {
    id: number
    product_id: number
    product_name: string
    base_price: number
}

export type PromotionBranch = {
    branch_id: number
    branch_name: string
}

export type PromotionDetail = {
    id: number
    store_id: number
    promotion_name: string
    promotion_type_id: number
    promotion_type_name: string
    is_active: boolean
    starts_at: string | null
    ends_at: string | null
    created_at: string
    updated_at: string
    config: PromotionConfig | null
    products: PromotionProduct[]
    branches: PromotionBranch[]
}

export type CreatePromotionPayload = {
    promotion_name: string
    promotion_type_id: number
    is_active?: boolean
    starts_at?: string | null
    ends_at?: string | null
    config?: {
        percent_discount?: number | null
        baht_discount?: number | null
        total_price_set_discount?: number | null
        old_price_set?: number | null
        count_condition_product?: number | null
        product_id?: number | null
    }
    product_ids?: number[]
}

export type UpdatePromotionPayload = {
    promotion_name?: string
    is_active?: boolean
    starts_at?: string | null
    ends_at?: string | null
    config?: {
        percent_discount?: number | null
        baht_discount?: number | null
        total_price_set_discount?: number | null
        old_price_set?: number | null
        count_condition_product?: number | null
        product_id?: number | null
    }
    product_ids?: number[]
}

export async function apiListPromotions(params?: {
    page?: number
    limit?: number
    search?: string
    type_id?: number
}) {
    return ApiService.fetchData<PaginatedResponse<PromotionListItem>>({
        url: API_PREFIX,
        method: 'get',
        params: params as Record<string, unknown>,
    })
}

export async function apiGetPromotion(id: number) {
    return ApiService.fetchData<PromotionDetail>({
        url: `${API_PREFIX}/${id}`,
        method: 'get',
    })
}

export async function apiCreatePromotion(data: CreatePromotionPayload) {
    return ApiService.fetchData<{ id: number }>({
        url: API_PREFIX,
        method: 'post',
        data,
    })
}

export async function apiUpdatePromotion(id: number, data: UpdatePromotionPayload) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeletePromotion(id: number) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/${id}`,
        method: 'delete',
    })
}

export async function apiListPromotionTypes() {
    const resp = await ApiService.fetchData<{ promotion_types: PromotionTypeOption[] }>({
        url: `${API_PREFIX}/types`,
        method: 'get',
    })
    return resp.promotion_types ?? []
}
