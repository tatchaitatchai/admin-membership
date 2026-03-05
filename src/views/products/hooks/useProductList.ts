import { useProductListStore } from '../store/productListStore'
import type { ProductFields } from '../types'

// TODO: Replace mock data with real API call using SWR
// import useSWR from 'swr'
// import { apiGetProductsList } from '@/services/ProductService'

const mockProducts: ProductFields[] = [
    { id: '1', name: 'ขนมปังช็อกโกแลต', category: 'ขนมปัง', price: 45, stock: 120, status: 'active' },
    { id: '2', name: 'ครัวซองต์เนย', category: 'ขนมปัง', price: 55, stock: 85, status: 'active' },
    { id: '3', name: 'เค้กส้ม', category: 'เค้ก', price: 180, stock: 30, status: 'active' },
    { id: '4', name: 'คุกกี้ชิพ', category: 'คุกกี้', price: 35, stock: 200, status: 'active' },
    { id: '5', name: 'โดนัทน้ำตาล', category: 'โดนัท', price: 40, stock: 0, status: 'inactive' },
    { id: '6', name: 'มัฟฟินบลูเบอร์รี่', category: 'มัฟฟิน', price: 60, stock: 45, status: 'active' },
]

export default function useProductList() {
    const {
        tableData,
        filterData,
        setTableData,
        selectedProduct,
        setSelectedProduct,
        setSelectAllProduct,
        setFilterData,
    } = useProductListStore((state) => state)

    const query = tableData.query?.toLowerCase() || ''
    const categoryFilter = filterData.category
    const statusFilter = filterData.status

    let filtered = mockProducts.filter(
        (p) =>
            p.name.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query),
    )

    if (categoryFilter) {
        filtered = filtered.filter((p) => p.category === categoryFilter)
    }

    if (statusFilter) {
        filtered = filtered.filter((p) => p.status === statusFilter)
    }

    if (tableData.sort?.key) {
        const { key, order } = tableData.sort
        filtered = [...filtered].sort((a, b) => {
            const aVal = a[key as keyof ProductFields]
            const bVal = b[key as keyof ProductFields]
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return order === 'asc' ? aVal - bVal : bVal - aVal
            }
            const aStr = String(aVal)
            const bStr = String(bVal)
            return order === 'asc'
                ? aStr.localeCompare(bStr)
                : bStr.localeCompare(aStr)
        })
    }

    const pageSize = tableData.pageSize || 10
    const pageIndex = tableData.pageIndex || 1
    const total = filtered.length
    const paginated = filtered.slice(
        (pageIndex - 1) * pageSize,
        pageIndex * pageSize,
    )

    return {
        productList: paginated,
        productListTotal: total,
        error: null,
        isLoading: false,
        tableData,
        filterData,
        mutate: () => {},
        setTableData,
        selectedProduct,
        setSelectedProduct,
        setSelectAllProduct,
        setFilterData,
    }
}
