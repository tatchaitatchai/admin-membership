import ApiService from './ApiService'
import type { PaginatedResponse } from './StaffManagementService'

const API_PREFIX = 'api/v2/order-management'

export type OrderListItem = {
    id: number
    branch_id: number
    branch_name: string
    customer_id: number | null
    customer_name: string | null
    customer_phone: string | null
    staff_id: number
    staff_email: string
    subtotal: number
    discount_total: number
    total_price: number
    status: string
    created_at: string
}

export type OrderManagementItem = {
    id: number
    product_id: number
    product_name: string
    quantity: number
    price: number
}

export type OrderManagementPayment = {
    id: number
    method: string
    amount: number
    paid_at: string
}

export type OrderManagementPromotion = {
    id: number
    promotion_id: number
    promotion_name: string
    discount_amount: number
}

export type CustomerGroupPointInfo = {
    group_id: number
    group_name: string
    points: number
}

export type OrderDetail = {
    id: number
    branch_id: number
    branch_name: string
    customer_id: number | null
    customer_name: string | null
    customer_phone: string | null
    customer_code: string | null
    staff_id: number
    staff_email: string
    subtotal: number
    discount_total: number
    total_price: number
    change_amount: number
    status: string
    cancel_reason: string | null
    cancelled_by: string | null
    cancelled_at: string | null
    created_at: string
    items: OrderManagementItem[]
    payments: OrderManagementPayment[]
    promotions: OrderManagementPromotion[]
    customer_points: CustomerGroupPointInfo[]
}

export async function apiListOrders(params?: {
    page?: number
    limit?: number
    search?: string
    branch_id?: number
    status?: string
}) {
    return ApiService.fetchData<PaginatedResponse<OrderListItem>>({
        url: API_PREFIX,
        method: 'get',
        params: params as Record<string, unknown>,
    })
}

export async function apiGetOrderDetail(id: number) {
    return ApiService.fetchData<OrderDetail>({
        url: `${API_PREFIX}/${id}`,
        method: 'get',
    })
}
