import ApiService from './ApiService'
import type { PaginatedResponse } from './StaffManagementService'
import type {
    ProductFields,
    ProductDetail,
    CategoryOption,
    CreateProductPayload,
    UpdateProductPayload,
} from '@/views/products/types'

const API_PREFIX = 'api/v2/product-management'

export async function apiListProducts(params?: {
    page?: number
    limit?: number
    search?: string
}) {
    return ApiService.fetchData<PaginatedResponse<ProductFields>>({
        url: API_PREFIX,
        method: 'get',
        params: params as Record<string, unknown>,
    })
}

export async function apiGetProduct(productId: number) {
    return ApiService.fetchData<ProductDetail>({
        url: `${API_PREFIX}/${productId}`,
        method: 'get',
    })
}

export async function apiCreateProduct(data: CreateProductPayload) {
    return ApiService.fetchData<{ id: number }>({
        url: API_PREFIX,
        method: 'post',
        data,
    })
}

export async function apiUpdateProduct(productId: number, data: UpdateProductPayload) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/${productId}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteProduct(productId: number) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/${productId}`,
        method: 'delete',
    })
}

export async function apiListCategories() {
    const resp = await ApiService.fetchData<{ categories: CategoryOption[] }>({
        url: `${API_PREFIX}/categories`,
        method: 'get',
    })
    return resp.categories ?? []
}

// --- Category Management ---
const CATEGORY_API_PREFIX = 'api/v2/category-management'

export type CategoryListItem = {
    id: number
    category_name: string
    product_count: number
    created_at: string
}

export async function apiListCategoriesPaginated(params?: {
    page?: number
    limit?: number
    search?: string
}) {
    return ApiService.fetchData<PaginatedResponse<CategoryListItem>>({
        url: CATEGORY_API_PREFIX,
        method: 'get',
        params: params as Record<string, unknown>,
    })
}

export async function apiGetCategory(categoryId: number) {
    return ApiService.fetchData<CategoryListItem>({
        url: `${CATEGORY_API_PREFIX}/${categoryId}`,
        method: 'get',
    })
}

export async function apiCreateCategory(data: { category_name: string }) {
    return ApiService.fetchData<{ id: number }>({
        url: CATEGORY_API_PREFIX,
        method: 'post',
        data,
    })
}

export async function apiUpdateCategory(categoryId: number, data: { category_name: string }) {
    return ApiService.fetchData<{ message: string }>({
        url: `${CATEGORY_API_PREFIX}/${categoryId}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteCategory(categoryId: number) {
    return ApiService.fetchData<{ message: string }>({
        url: `${CATEGORY_API_PREFIX}/${categoryId}`,
        method: 'delete',
    })
}

export async function apiUploadProductImage(file: File): Promise<{ file_path: string; file_url: string }> {
    const formData = new FormData()
    formData.append('image', file)

    const token = localStorage.getItem('token') ?? ''
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

    const response = await fetch(`${baseUrl}/${API_PREFIX}/upload-image`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    })

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to upload image')
    }

    return response.json()
}
