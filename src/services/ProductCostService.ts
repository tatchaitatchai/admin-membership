import ApiService from './ApiService'
import type { PaginatedResponse } from './StaffManagementService'

const API_PREFIX = 'api/v2/product-cost'

export type ProductIngredientItem = {
    id: number
    product_id: number
    product_name: string
    ingredient_id: number
    ingredient_name: string
    quantity: number
    recipe_unit: string
    cost_per_unit: number
    cost_unit: string
    conversion_factor: number
    ingredient_cost: number
    created_at: string
}

export type ProductCostSummary = {
    product_id: number
    product_name: string
    base_price: number
    total_cost: number
    profit: number
    margin_percent: number
    items?: ProductIngredientItem[]
}

export async function apiListProductsWithCost(params?: {
    page?: number
    limit?: number
    search?: string
}) {
    return ApiService.fetchData<PaginatedResponse<ProductCostSummary>>({
        url: API_PREFIX,
        method: 'get',
        params: params as Record<string, unknown>,
    })
}

export async function apiGetProductCostSummary(productId: number) {
    return ApiService.fetchData<ProductCostSummary>({
        url: `${API_PREFIX}/${productId}`,
        method: 'get',
    })
}

export async function apiAddProductIngredient(data: {
    product_id: number
    ingredient_id: number
    quantity: number
}) {
    return ApiService.fetchData<{ id: number }>({
        url: `${API_PREFIX}/items`,
        method: 'post',
        data,
    })
}

export async function apiUpdateProductIngredient(id: number, data: {
    quantity: number
}) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/items/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteProductIngredient(id: number) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/items/${id}`,
        method: 'delete',
    })
}
