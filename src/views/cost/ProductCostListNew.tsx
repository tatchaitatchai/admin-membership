import { useState, useEffect, useCallback } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'
import { TbSearch, TbEye } from 'react-icons/tb'
import {
    apiListProductsWithCost,
    type ProductCostSummary,
} from '@/services/ProductCostService'
import ProductCostDetail from './ProductCostDetail'

const ProductCostList = () => {
    const [items, setItems] = useState<ProductCostSummary[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')

    const [detailOpen, setDetailOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string } | null>(null)

    const fetchList = useCallback(async () => {
        setLoading(true)
        try {
            const resp = await apiListProductsWithCost({
                page: pageIndex,
                limit: pageSize,
                search: search || undefined,
            })
            setItems(resp.data ?? [])
            setTotal(resp.total)
        } catch {
            setItems([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, search])

    useEffect(() => {
        fetchList()
    }, [fetchList])

    const handleSearch = () => {
        setSearch(searchInput)
        setPageIndex(1)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const openDetail = (product: ProductCostSummary) => {
        setSelectedProduct({ id: product.product_id, name: product.product_name })
        setDetailOpen(true)
    }

    const columns: ColumnDef<ProductCostSummary>[] = [
        {
            header: 'สินค้า',
            accessorKey: 'product_name',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.product_name}</div>
                    {row.original.cost_mode === 'BATCH' && row.original.recipe_name && (
                        <div className="text-xs text-gray-500">
                            🍲 {row.original.recipe_name}
                        </div>
                    )}
                </div>
            ),
        },
        {
            header: 'โหมด',
            accessorKey: 'cost_mode',
            cell: ({ row }) => (
                <span className={`text-xs px-2 py-1 rounded ${
                    row.original.cost_mode === 'BATCH' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-700'
                }`}>
                    {row.original.cost_mode === 'BATCH' ? 'หม้อ' : 'ปกติ'}
                </span>
            ),
        },
        {
            header: 'ราคาขาย',
            accessorKey: 'base_price',
            cell: ({ row }) => `${row.original.base_price.toFixed(2)} บาท`,
        },
        {
            header: 'ต้นทุน',
            accessorKey: 'total_cost',
            cell: ({ row }) => `${row.original.total_cost.toFixed(2)} บาท`,
        },
        {
            header: 'กำไร',
            accessorKey: 'profit',
            cell: ({ row }) => (
                <span className={row.original.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {row.original.profit.toFixed(2)} บาท
                </span>
            ),
        },
        {
            header: 'มาร์จิ้น',
            accessorKey: 'margin_percent',
            cell: ({ row }) => (
                <span className={row.original.margin_percent >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {row.original.margin_percent.toFixed(1)}%
                </span>
            ),
        },
        {
            header: '',
            id: 'actions',
            cell: ({ row }) => (
                <Button
                    size="sm"
                    variant="plain"
                    icon={<TbEye />}
                    onClick={() => openDetail(row.original)}
                >
                    ดูรายละเอียด
                </Button>
            ),
        },
    ]

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-semibold">ต้นทุนสินค้า</h4>
                </div>

                <div className="flex gap-2 mb-4">
                    <Input
                        placeholder="ค้นหาสินค้า..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                    />
                    <Button icon={<TbSearch />} onClick={handleSearch}>
                        ค้นหา
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    data={items}
                    loading={loading}
                    pagingData={{
                        total,
                        pageIndex,
                        pageSize,
                    }}
                    onPaginationChange={({ pageIndex, pageSize }) => {
                        setPageIndex(pageIndex)
                        setPageSize(pageSize)
                    }}
                />
            </AdaptiveCard>

            {selectedProduct && (
                <ProductCostDetail
                    open={detailOpen}
                    productId={selectedProduct.id}
                    productName={selectedProduct.name}
                    onClose={() => {
                        setDetailOpen(false)
                        setSelectedProduct(null)
                    }}
                    onSuccess={fetchList}
                />
            )}
        </Container>
    )
}

export default ProductCostList
