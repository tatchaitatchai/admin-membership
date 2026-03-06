export type ProductFields = {
    id: number
    product_name: string
    category_id: number | null
    category_name: string | null
    image_path: string | null
    is_active: boolean
    base_price: string
    created_at: string
}

export type ProductDetail = {
    id: number
    store_id: number
    product_name: string
    category_id: number | null
    image_path: string | null
    is_active: boolean
    sku: string | null
    barcode: string | null
    base_price: string
    created_at: string
    updated_at: string
}

export type CategoryOption = {
    id: number
    category_name: string
}

export type CreateProductPayload = {
    product_name: string
    category_id?: number | null
    image_path?: string | null
    base_price: number
    is_active?: boolean
}

export type UpdateProductPayload = {
    product_name?: string
    category_id?: number | null
    image_path?: string | null
    base_price?: number
    is_active?: boolean
}

export type Filter = {
    category: string
    status: string
}
