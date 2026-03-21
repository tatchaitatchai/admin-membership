import ApiService from './ApiService'
import type { PaginatedResponse } from './StaffManagementService'

const API_PREFIX = 'api/v2/ingredients'

export type IngredientListItem = {
    id: number
    product_id: number | null
    product_name: string | null
    ingredient_name: string
    cost_unit: string
    cost_per_unit: number
    recipe_unit: string
    conversion_factor: number
    cost_per_recipe_unit: number
    created_at: string
    updated_at: string
}

export async function apiListIngredients(params?: {
    page?: number
    limit?: number
    search?: string
}) {
    return ApiService.fetchData<PaginatedResponse<IngredientListItem>>({
        url: API_PREFIX,
        method: 'get',
        params: params as Record<string, unknown>,
    })
}

export async function apiGetIngredient(id: number) {
    return ApiService.fetchData<IngredientListItem>({
        url: `${API_PREFIX}/${id}`,
        method: 'get',
    })
}

export async function apiCreateIngredient(data: {
    product_id?: number | null
    ingredient_name: string
    cost_unit: string
    cost_per_unit: number
    recipe_unit: string
    conversion_factor: number
}) {
    return ApiService.fetchData<{ id: number }>({
        url: API_PREFIX,
        method: 'post',
        data,
    })
}

export async function apiUpdateIngredient(id: number, data: {
    product_id?: number | null
    ingredient_name?: string
    cost_unit?: string
    cost_per_unit?: number
    recipe_unit?: string
    conversion_factor?: number
}) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteIngredient(id: number) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/${id}`,
        method: 'delete',
    })
}
