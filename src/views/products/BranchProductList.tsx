import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Switcher from '@/components/ui/Switcher'
import Tag from '@/components/ui/Tag'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'
import { TbPlus, TbEdit, TbTrash, TbSearch } from 'react-icons/tb'
import {
    apiListBranchProducts,
    apiUpdateBranchProduct,
    apiDeleteBranchProduct,
} from '@/services/ProductService'
import type { BranchProductListItem } from '@/services/ProductService'
import { apiListBranches } from '@/services/StaffManagementService'
import type { BranchOption } from '@/views/staff-management/types'
import { getErrorMessage } from '@/utils/errorHandler'

const BranchProductList = () => {
    const navigate = useNavigate()
    const [items, setItems] = useState<BranchProductListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState('')
    const [branches, setBranches] = useState<BranchOption[]>([])
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null)

    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<BranchProductListItem | null>(null)

    const [editOpen, setEditOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<BranchProductListItem | null>(null)
    const [editStock, setEditStock] = useState(0)
    const [editReorder, setEditReorder] = useState(0)
    const [editActive, setEditActive] = useState(true)
    const [editSubmitting, setEditSubmitting] = useState(false)

    const [toggleOpen, setToggleOpen] = useState(false)
    const [toggleTarget, setToggleTarget] = useState<BranchProductListItem | null>(null)

    useEffect(() => {
        apiListBranches()
            .then((data) => setBranches(data ?? []))
            .catch(() => {})
    }, [])

    const fetchItems = useCallback(async () => {
        setLoading(true)
        try {
            const resp = await apiListBranchProducts({
                page: pageIndex,
                limit: pageSize,
                search: search || undefined,
                branch_id: selectedBranch ?? undefined,
            })
            setItems(resp.data ?? [])
            setTotal(resp.total)
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถโหลดรายการสินค้าสาขาได้
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, search, selectedBranch])

    useEffect(() => {
        fetchItems()
    }, [fetchItems])

    const openEdit = (item: BranchProductListItem) => {
        setEditTarget(item)
        setEditStock(item.on_stock)
        setEditReorder(item.reorder_level)
        setEditActive(item.is_active)
        setEditOpen(true)
    }

    const handleEditSubmit = async () => {
        if (!editTarget) return
        setEditSubmitting(true)
        try {
            await apiUpdateBranchProduct(editTarget.id, {
                on_stock: editStock,
                reorder_level: editReorder,
                is_active: editActive,
            })
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    บันทึกข้อมูลแล้ว
                </Notification>,
            )
            setEditOpen(false)
            setEditTarget(null)
            fetchItems()
        } catch (err: any) {
            const errorMessage = await getErrorMessage(err, 'ไม่สามารถบันทึกข้อมูลได้')
            toast.push(
                <Notification type="danger" title="Error">
                    {errorMessage}
                </Notification>,
            )
        } finally {
            setEditSubmitting(false)
        }
    }

    const handleToggleConfirm = async () => {
        if (!toggleTarget) return
        try {
            await apiUpdateBranchProduct(toggleTarget.id, {
                is_active: !toggleTarget.is_active,
            })
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    เปลี่ยนสถานะแล้ว
                </Notification>,
            )
            setToggleOpen(false)
            setToggleTarget(null)
            fetchItems()
        } catch (err: any) {
            const errorMessage = await getErrorMessage(err, 'ไม่สามารถเปลี่ยนสถานะได้')
            toast.push(
                <Notification type="danger" title="Error">
                    {errorMessage}
                </Notification>,
            )
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            await apiDeleteBranchProduct(deleteTarget.id)
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    ลบสินค้าสาขาแล้ว
                </Notification>,
            )
            setDeleteOpen(false)
            setDeleteTarget(null)
            fetchItems()
        } catch (err: any) {
            const errorMessage = await getErrorMessage(err, 'ไม่สามารถลบสินค้าสาขาได้')
            toast.push(
                <Notification type="danger" title="Error">
                    {errorMessage}
                </Notification>,
            )
        }
    }

    const branchOptions = useMemo(
        () => [
            { value: 0, label: 'ทุกสาขา' },
            ...branches.map((b) => ({ value: b.id, label: b.branch_name })),
        ],
        [branches],
    )

    const columns: ColumnDef<BranchProductListItem>[] = useMemo(
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
                            <div>
                                <span className="font-semibold block">
                                    {row.product_name}
                                </span>
                                {row.category_name && (
                                    <span className="text-xs text-gray-400">
                                        {row.category_name}
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                },
            },
            {
                header: 'สาขา',
                accessorKey: 'branch_name',
                enableSorting: false,
                cell: (props) => (
                    <Tag className="bg-indigo-100 text-indigo-600 border-0">
                        {props.row.original.branch_name}
                    </Tag>
                ),
            },
            {
                header: 'คงเหลือ',
                accessorKey: 'on_stock',
                cell: (props) => {
                    const row = props.row.original
                    const isLow = row.reorder_level > 0 && row.on_stock <= row.reorder_level
                    return (
                        <span
                            className={`font-semibold ${
                                row.on_stock === 0
                                    ? 'text-red-500'
                                    : isLow
                                      ? 'text-amber-500'
                                      : 'text-gray-900 dark:text-gray-100'
                            }`}
                        >
                            {row.on_stock.toLocaleString()}
                            {isLow && row.on_stock > 0 && (
                                <span className="text-xs ml-1">⚠</span>
                            )}
                        </span>
                    )
                },
            },
            {
                header: 'ราคา',
                accessorKey: 'base_price',
                cell: (props) => (
                    <span className="text-gray-700 dark:text-gray-300">
                        ฿{Number(props.row.original.base_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                        onChange={() => {
                            setToggleTarget(props.row.original)
                            setToggleOpen(true)
                        }}
                    />
                ),
            },
            {
                header: 'จัดการ',
                id: 'action',
                enableSorting: false,
                cell: (props) => {
                    const item = props.row.original
                    return (
                        <div className="flex gap-1">
                            <Button
                                size="xs"
                                variant="plain"
                                icon={<TbEdit />}
                                onClick={() => openEdit(item)}
                            />
                            <Button
                                size="xs"
                                variant="plain"
                                icon={<TbTrash />}
                                className="text-red-500 hover:text-red-600"
                                onClick={() => {
                                    setDeleteTarget(item)
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

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3>สินค้าสาขา</h3>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<TbPlus />}
                            onClick={() => navigate('/products/branch-products/create')}
                        >
                            เพิ่มสินค้าสาขา
                        </Button>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 justify-between">
                        <div className="w-full md:w-[250px]">
                            <Select
                                size="sm"
                                placeholder="เลือกสาขา"
                                options={branchOptions}
                                value={branchOptions.find(
                                    (o) => o.value === (selectedBranch ?? 0),
                                )}
                                onChange={(opt) => {
                                    setSelectedBranch(opt?.value === 0 ? null : (opt?.value ?? null))
                                    setPageIndex(1)
                                }}
                            />
                        </div>
                        <Input
                            className="max-w-[300px]"
                            size="sm"
                            placeholder="ค้นหาชื่อสินค้า..."
                            prefix={<TbSearch className="text-lg" />}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                                setPageIndex(1)
                            }}
                        />
                    </div>
                    <DataTable
                        columns={columns}
                        data={items}
                        loading={loading}
                        noData={!loading && items.length === 0}
                        pagingData={{
                            total,
                            pageIndex,
                            pageSize,
                        }}
                        onPaginationChange={(page) => setPageIndex(page)}
                        onSelectChange={(value) => {
                            setPageSize(value)
                            setPageIndex(1)
                        }}
                    />
                </div>
            </AdaptiveCard>

            {/* Edit Dialog */}
            <Dialog
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                onRequestClose={() => setEditOpen(false)}
            >
                <h5 className="mb-4">แก้ไขสินค้าสาขา</h5>
                {editTarget && (
                    <div className="flex flex-col gap-3">
                        <div className="text-sm text-gray-500">
                            <strong>{editTarget.product_name}</strong> — {editTarget.branch_name}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                จำนวนคงเหลือ
                            </label>
                            <Input
                                type="number"
                                min="0"
                                value={editStock}
                                onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                จุดสั่งซื้อ (Reorder Level)
                            </label>
                            <Input
                                type="number"
                                min="0"
                                value={editReorder}
                                onChange={(e) => setEditReorder(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switcher
                                checked={editActive}
                                onChange={(val) => setEditActive(val)}
                            />
                            <span>เปิดขาย</span>
                        </div>
                    </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setEditOpen(false)}>ยกเลิก</Button>
                    <Button
                        variant="solid"
                        loading={editSubmitting}
                        onClick={handleEditSubmit}
                    >
                        บันทึก
                    </Button>
                </div>
            </Dialog>

            {/* Toggle Confirm Dialog */}
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
                        {' '}สินค้า <strong>{toggleTarget.product_name}</strong>
                        {' '}ที่สาขา <strong>{toggleTarget.branch_name}</strong> หรือไม่?
                    </p>
                )}
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setToggleOpen(false)}>ยกเลิก</Button>
                    <Button variant="solid" onClick={handleToggleConfirm}>
                        ยืนยัน
                    </Button>
                </div>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onRequestClose={() => setDeleteOpen(false)}
            >
                <h5 className="mb-4">ยืนยันการลบ</h5>
                {deleteTarget && (
                    <>
                        <p>
                            ต้องการลบสินค้า <strong>{deleteTarget.product_name}</strong>
                            {' '}ออกจากสาขา <strong>{deleteTarget.branch_name}</strong> หรือไม่?
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            การลบจะไม่สามารถกู้คืนได้
                        </p>
                    </>
                )}
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

export default BranchProductList
