export type ProductFields = {
    id: string
    name: string
    category: string
    price: number
    stock: number
    status: 'active' | 'inactive'
}

export type Filter = {
    category: string
    status: string
}

export type GetProductsResponse = {
    list: ProductFields[]
    total: number
}
