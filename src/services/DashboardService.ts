import ApiService from './ApiService'

const API_PREFIX = 'api/v2/dashboard'

export type DashboardSummary = {
    today_sales: number
    today_orders: number
    month_sales: number
    month_orders: number
    prev_month_sales: number
    prev_month_orders: number
    new_customers_month: number
    prev_new_customers_month: number
}

export type DailySalesPoint = {
    date: string
    total_sales: number
    order_count: number
}

export type TopProductItem = {
    product_id: number
    product_name: string
    total_qty: number
    total_sales: number
}

export type PaymentMethodBreakdown = {
    method: string
    amount: number
    count: number
}

export type BranchSalesItem = {
    branch_id: number
    branch_name: string
    total_sales: number
    order_count: number
}

export type CancelledOrderStats = {
    this_month_count: number
    this_month_value: number
    prev_month_count: number
    prev_month_value: number
}

export type StaffCancelItem = {
    staff_id: number
    staff_email: string
    cancel_count: number
    cancel_value: number
}

export type StockDiscrepancyItem = {
    branch_name: string
    product_name: string
    expected_stock: number
    actual_stock: number
    difference: number
    counted_at: string
}

export type CashDiscrepancyItem = {
    branch_name: string
    shift_id: number
    expected: number
    actual: number
    difference: number
    closed_at: string
    closed_by_email: string
}

export type FraudAlertSection = {
    cancelled_orders: CancelledOrderStats
    top_cancel_staff: StaffCancelItem[] | null
    stock_discrepancies: StockDiscrepancyItem[] | null
    cash_discrepancies: CashDiscrepancyItem[] | null
}

export type DashboardResponse = {
    summary: DashboardSummary
    sales_chart: DailySalesPoint[] | null
    top_products: TopProductItem[] | null
    payment_breakdown: PaymentMethodBreakdown[] | null
    branch_sales: BranchSalesItem[] | null
    fraud_alerts: FraudAlertSection
}

export async function apiGetDashboard() {
    return ApiService.fetchData<DashboardResponse>({
        url: API_PREFIX,
        method: 'get',
    })
}
