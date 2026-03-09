import ApiService from './ApiService'

const API_PREFIX = 'api/v2/customer-management'

export type CustomerListItem = {
    id: number
    customer_code: string
    full_name: string
    phone: string
    email: string
    is_active: boolean
    total_points: number
    created_at: string
    updated_at: string
}

export type CustomerDetail = {
    id: number
    customer_code: string
    full_name: string
    phone: string
    email: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export type CustomerPointsSummary = {
    product_id: number
    product_name: string
    category_name: string
    image_path: string
    points: number
    total_points: number
    points_to_redeem: number
}

export type PaginatedResponse = {
    data: CustomerListItem[]
    total: number
    page: number
    limit: number
    total_pages: number
}

export async function apiListCustomers(params?: {
    page?: number
    limit?: number
    search?: string
}) {
    return ApiService.fetchData<PaginatedResponse>({
        url: API_PREFIX,
        method: 'get',
        params: params as Record<string, unknown>,
    })
}

export async function apiGetCustomer(id: number) {
    return ApiService.fetchData<CustomerDetail>({
        url: `${API_PREFIX}/${id}`,
        method: 'get',
    })
}

export async function apiCreateCustomer(data: {
    customer_code?: string
    full_name: string
    phone?: string
    email?: string
}) {
    return ApiService.fetchData<{ id: number }>({
        url: API_PREFIX,
        method: 'post',
        data,
    })
}

export async function apiUpdateCustomer(
    id: number,
    data: {
        customer_code?: string
        full_name?: string
        phone?: string
        email?: string
        is_active?: boolean
    },
) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/${id}`,
        method: 'put',
        data,
    })
}

export async function apiGetCustomerPoints(customerId: number) {
    return ApiService.fetchData<{ data: CustomerPointsSummary[] }>({
        url: `${API_PREFIX}/${customerId}/points`,
        method: 'get',
    })
}
