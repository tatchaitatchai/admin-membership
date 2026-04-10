import ApiService from './ApiService'
import type { PaginatedResponse } from './StaffManagementService'

const API_PREFIX = 'api/v2/production-recipes'

export type ProductionRecipeListItem = {
    id: number
    recipe_name: string
    output_quantity: number
    output_unit: string
    total_cost: number
    cost_per_unit: number
    created_at: string
}

export type ProductionRecipeIngredient = {
    id: number
    production_recipe_id: number
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

export type ProductionRecipeSummary = {
    id: number
    recipe_name: string
    output_quantity: number
    output_unit: string
    total_cost: number
    cost_per_unit: number
    items: ProductionRecipeIngredient[]
}

export async function apiListProductionRecipes(params?: {
    page?: number
    limit?: number
    search?: string
}) {
    return ApiService.fetchData<PaginatedResponse<ProductionRecipeListItem>>({
        url: API_PREFIX,
        method: 'get',
        params: params as Record<string, unknown>,
    })
}

export async function apiGetProductionRecipe(id: number) {
    return ApiService.fetchData<ProductionRecipeSummary>({
        url: `${API_PREFIX}/${id}`,
        method: 'get',
    })
}

export async function apiGetProductionRecipeSummary(id: number) {
    return ApiService.fetchData<ProductionRecipeSummary>({
        url: `${API_PREFIX}/${id}/summary`,
        method: 'get',
    })
}

export async function apiCreateProductionRecipe(data: {
    recipe_name: string
    output_quantity: number
    output_unit: string
}) {
    return ApiService.fetchData<{ id: number }>({
        url: API_PREFIX,
        method: 'post',
        data,
    })
}

export async function apiUpdateProductionRecipe(id: number, data: {
    recipe_name?: string
    output_quantity?: number
    output_unit?: string
}) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteProductionRecipe(id: number) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/${id}`,
        method: 'delete',
    })
}

export async function apiAddProductionRecipeIngredient(data: {
    production_recipe_id: number
    ingredient_id: number
    quantity: number
}) {
    return ApiService.fetchData<{ id: number }>({
        url: `${API_PREFIX}/items`,
        method: 'post',
        data,
    })
}

export async function apiUpdateProductionRecipeIngredient(id: number, data: {
    quantity: number
}) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/items/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteProductionRecipeIngredient(id: number) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/items/${id}`,
        method: 'delete',
    })
}
