import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Switcher from '@/components/ui/Switcher'
import Tag from '@/components/ui/Tag'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'
import { TbPlus, TbEdit, TbTrash, TbSearch } from 'react-icons/tb'
import {
    apiListProducts,
    apiDeleteProduct,
    apiUpdateProduct,
} from '@/services/ProductService'
import type { ProductFields } from './types'
import { getErrorMessage } from '@/utils/errorHandler'

const ProductList = () => {
    const navigate = useNavigate()
    const [products, setProducts] = useState<ProductFields[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState('')
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<ProductFields | null>(null)
    const [toggleOpen, setToggleOpen] = useState(false)
    const [toggleTarget, setToggleTarget] = useState<ProductFields | null>(null)

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const resp = await apiListProducts({
                page: pageIndex,
                limit: pageSize,
                search: search || undefined,
            })
            setProducts(resp.data ?? [])
            setTotal(resp.total)
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถโหลดรายการสินค้าได้
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, search])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            await apiDeleteProduct(deleteTarget.id)
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    ลบสินค้าแล้ว
                </Notification>,
            )
            setDeleteOpen(false)
            setDeleteTarget(null)
            fetchProducts()
        } catch (err: any) {
            const errorMessage = await getErrorMessage(err, 'ไม่สามารถลบสินค้าได้')
            toast.push(
                <Notification type="danger" title="Error">
                    {errorMessage}
                </Notification>,
            )
        }
    }

    const openToggleConfirm = (item: ProductFields) => {
        setToggleTarget(item)
        setToggleOpen(true)
    }

    const handleToggleConfirm = async () => {
        if (!toggleTarget) return
        try {
            await apiUpdateProduct(toggleTarget.id, { is_active: !toggleTarget.is_active })
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    เปลี่ยนสถานะสินค้าเรียบร้อยแล้ว
                </Notification>,
            )
            setToggleOpen(false)
            setToggleTarget(null)
            fetchProducts()
        } catch (err: any) {
            const errorMessage = await getErrorMessage(err, 'ไม่สามารถเปลี่ยนสถานะได้')
            toast.push(
                <Notification type="danger" title="Error">
                    {errorMessage}
                </Notification>,
            )
        }
    }

    const columns: ColumnDef<ProductFields>[] = useMemo(
        () => [
            {
                header: 'สินค้า',
                accessorKey: 'product_name',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center gap-3">
                            {row.image_path ? (
                                <img
                                    src={row.image_path}
                                    alt={row.product_name}
                                    className="w-10 h-10 rounded-lg object-cover border"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
                                    ไม่มีรูป
                                </div>
                            )}
                            <span className="font-semibold">
                                {row.product_name}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: 'หมวดหมู่',
                accessorKey: 'category_name',
                enableSorting: false,
                cell: (props) => (
                    <span>
                        {props.row.original.category_name ? (
                            <Tag className="bg-blue-100 text-blue-600 border-0">
                                {props.row.original.category_name}
                            </Tag>
                        ) : (
                            <span className="text-gray-400">ไม่ระบุ</span>
                        )}
                    </span>
                ),
            },
            {
                header: 'ราคา',
                accessorKey: 'base_price',
                cell: (props) => (
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                        ฿{Number(props.row.original.base_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                ),
            },
            {
                header: 'ต้นทุน',
                accessorKey: 'cost_price',
                cell: (props) => (
                    <span className="text-gray-600 dark:text-gray-300">
                        ฿{Number(props.row.original.cost_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                ),
            },
            {
                header: 'สถานะ',
                accessorKey: 'is_active',
                enableSorting: false,
                cell: (props) => (
                    <Switcher
                        checked={props.row.original.is_active}
                        onChange={() => openToggleConfirm(props.row.original)}
                    />
                ),
            },
            {
                header: 'จัดการ',
                id: 'action',
                enableSorting: false,
                cell: (props) => {
                    const p = props.row.original
                    return (
                        <div className="flex gap-1">
                            <Button
                                size="xs"
                                variant="plain"
                                icon={<TbEdit />}
                                onClick={() => navigate(`/products/${p.id}/edit`)}
                            />
                            <Button
                                size="xs"
                                variant="plain"
                                icon={<TbTrash />}
                                className="text-red-500 hover:text-red-600"
                                onClick={() => {
                                    setDeleteTarget(p)
                                    setDeleteOpen(true)
                                }}
                            />
                        </div>
                    )
                },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    )

    const handlePaginationChange = (page: number) => {
        setPageIndex(page)
    }

    const handleSelectChange = (value: number) => {
        setPageSize(value)
        setPageIndex(1)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        setPageIndex(1)
    }

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3>จัดการสินค้าหลัก</h3>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<TbPlus />}
                            onClick={() => navigate('/products/create')}
                        >
                            เพิ่มสินค้า
                        </Button>
                    </div>
                    <div className="flex justify-end">
                        <Input
                            className="max-w-[300px]"
                            size="sm"
                            placeholder="ค้นหาชื่อสินค้า..."
                            prefix={<TbSearch className="text-lg" />}
                            value={search}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <DataTable
                        columns={columns}
                        data={products}
                        loading={loading}
                        noData={!loading && products.length === 0}
                        pagingData={{
                            total,
                            pageIndex,
                            pageSize,
                        }}
                        onPaginationChange={handlePaginationChange}
                        onSelectChange={handleSelectChange}
                    />
                </div>
            </AdaptiveCard>

            <Dialog
                isOpen={toggleOpen}
                onClose={() => setToggleOpen(false)}
                onRequestClose={() => setToggleOpen(false)}
            >
                <h5 className="mb-4">ยืนยันการเปลี่ยนสถานะ</h5>
                {toggleTarget && (
                    <p>
                        ต้องการ
                        {toggleTarget.is_active ? ' ปิดการขาย' : ' เปิดการขาย'}
                        {' '}สินค้า <strong>{toggleTarget.product_name}</strong> หรือไม่?
                    </p>
                )}
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setToggleOpen(false)}>ยกเลิก</Button>
                    <Button variant="solid" onClick={handleToggleConfirm}>
                        ยืนยัน
                    </Button>
                </div>
            </Dialog>

            <Dialog
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onRequestClose={() => setDeleteOpen(false)}
            >
                <h5 className="mb-4">ยืนยันการลบ</h5>
                <p>
                    ต้องการลบสินค้า <strong>{deleteTarget?.product_name}</strong> หรือไม่?
                </p>
                <p className="text-sm text-gray-500 mt-1">
                    การลบสินค้าจะไม่สามารถกู้คืนได้
                </p>
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setDeleteOpen(false)}>ยกเลิก</Button>
                    <Button variant="solid" color="red" onClick={handleDelete}>
                        ลบ
                    </Button>
                </div>
            </Dialog>
        </Container>
    )
}

export default ProductList
