import { useState, useEffect, useCallback, useMemo } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import Tag from '@/components/ui/Tag'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'
import { TbPlus, TbEdit, TbTrash, TbSearch, TbPackage } from 'react-icons/tb'
import {
    apiListPointGroups,
    apiCreatePointGroup,
    apiUpdatePointGroup,
    apiDeletePointGroup,
    apiGetPointGroup,
    apiAddProductsToGroup,
    apiRemoveProductFromGroup,
} from '@/services/PointGroupService'
import type { PointGroupListItem, PointGroupProductItem } from '@/services/PointGroupService'
import { apiListProducts } from '@/services/ProductService'
import type { ProductFields } from '@/views/products/types'
import { getErrorMessage } from '@/utils/errorHandler'

const PointGroupList = () => {
    const [items, setItems] = useState<PointGroupListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState('')

    // ── Products master list ───────────────────────────────────────
    const [allProducts, setAllProducts] = useState<ProductFields[]>([])

    // ── Create / Edit group dialog ─────────────────────────────────
    const [formOpen, setFormOpen] = useState(false)
    const [formSubmitting, setFormSubmitting] = useState(false)
    const [editTarget, setEditTarget] = useState<PointGroupListItem | null>(null)
    const [formName, setFormName] = useState('')
    const [formDescription, setFormDescription] = useState('')
    const [formIsActive, setFormIsActive] = useState(true)
    const [formPointsToRedeem, setFormPointsToRedeem] = useState(10)

    // ── Delete dialog ──────────────────────────────────────────────
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<PointGroupListItem | null>(null)

    // ── Products dialog (manage products in group) ─────────────────
    const [productsOpen, setProductsOpen] = useState(false)
    const [productsGroupId, setProductsGroupId] = useState<number | null>(null)
    const [productsGroupName, setProductsGroupName] = useState('')
    const [groupProducts, setGroupProducts] = useState<PointGroupProductItem[]>([])
    const [productsLoading, setProductsLoading] = useState(false)
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([])
    const [addingProducts, setAddingProducts] = useState(false)

    // ── Fetch list ─────────────────────────────────────────────────
    const fetchList = useCallback(async () => {
        setLoading(true)
        try {
            const resp = await apiListPointGroups({
                page: pageIndex,
                limit: pageSize,
                search: search || undefined,
            })
            setItems(resp.data ?? [])
            setTotal(resp.total)
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถโหลดรายการกลุ่มสะสมแต้มได้
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, search])

    useEffect(() => {
        fetchList()
    }, [fetchList])

    useEffect(() => {
        apiListProducts({ limit: 500 })
            .then((resp) => setAllProducts(resp.data ?? []))
            .catch(() => {})
    }, [])

    // ── Open group form ────────────────────────────────────────────
    const openCreate = () => {
        setEditTarget(null)
        setFormName('')
        setFormDescription('')
        setFormIsActive(true)
        setFormPointsToRedeem(10)
        setFormOpen(true)
    }

    const openEdit = (item: PointGroupListItem) => {
        setEditTarget(item)
        setFormName(item.group_name)
        setFormDescription(item.description)
        setFormIsActive(item.is_active)
        setFormPointsToRedeem(item.points_to_redeem ?? 10)
        setFormOpen(true)
    }

    // ── Submit group form ──────────────────────────────────────────
    const handleFormSubmit = async () => {
        if (!formName.trim()) {
            toast.push(
                <Notification type="warning" title="แจ้งเตือน">
                    กรุณากรอกชื่อกลุ่ม
                </Notification>,
            )
            return
        }
        setFormSubmitting(true)
        try {
            if (editTarget) {
                await apiUpdatePointGroup(editTarget.id, {
                    group_name: formName,
                    description: formDescription,
                    is_active: formIsActive,
                    points_to_redeem: formPointsToRedeem,
                })
                toast.push(
                    <Notification type="success" title="สำเร็จ">
                        แก้ไขกลุ่มเรียบร้อย
                    </Notification>,
                )
            } else {
                await apiCreatePointGroup({
                    group_name: formName,
                    description: formDescription,
                    is_active: formIsActive,
                    points_to_redeem: formPointsToRedeem,
                })
                toast.push(
                    <Notification type="success" title="สำเร็จ">
                        เพิ่มกลุ่มเรียบร้อย
                    </Notification>,
                )
            }
            setFormOpen(false)
            fetchList()
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถบันทึกได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        } finally {
            setFormSubmitting(false)
        }
    }

    // ── Delete group ───────────────────────────────────────────────
    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return
        try {
            await apiDeletePointGroup(deleteTarget.id)
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    ลบกลุ่มแล้ว
                </Notification>,
            )
            setDeleteOpen(false)
            setDeleteTarget(null)
            fetchList()
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถลบได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        }
    }

    // ── Open products dialog ───────────────────────────────────────
    const openProductsDialog = async (group: PointGroupListItem) => {
        setProductsGroupId(group.id)
        setProductsGroupName(group.group_name)
        setGroupProducts([])
        setSelectedProductIds([])
        setProductsOpen(true)
        setProductsLoading(true)
        try {
            const detail = await apiGetPointGroup(group.id)
            setGroupProducts(detail.products ?? [])
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถโหลดสินค้าในกลุ่มได้
                </Notification>,
            )
        } finally {
            setProductsLoading(false)
        }
    }

    // ── Available products (not yet in this group) ─────────────────
    const assignedProductIds = useMemo(
        () => new Set(groupProducts.map((p) => p.product_id)),
        [groupProducts],
    )

    const availableProductOptions = useMemo(
        () =>
            allProducts
                .filter((p) => !assignedProductIds.has(p.id))
                .map((p) => ({
                    value: p.id,
                    label: `${p.product_name}${p.category_name ? ` (${p.category_name})` : ''}`,
                })),
        [allProducts, assignedProductIds],
    )

    // ── Add products to group ──────────────────────────────────────
    const handleAddProducts = async () => {
        if (!productsGroupId || selectedProductIds.length === 0) return
        setAddingProducts(true)
        try {
            const result = await apiAddProductsToGroup(productsGroupId, selectedProductIds)
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    เพิ่มสินค้า {result.added} รายการเข้ากลุ่มแล้ว
                </Notification>,
            )
            setSelectedProductIds([])
            // Refresh products in dialog
            const detail = await apiGetPointGroup(productsGroupId)
            setGroupProducts(detail.products ?? [])
            fetchList()
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถเพิ่มสินค้าได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        } finally {
            setAddingProducts(false)
        }
    }

    // ── Remove product from group ──────────────────────────────────
    const handleRemoveProduct = async (productId: number) => {
        if (!productsGroupId) return
        try {
            await apiRemoveProductFromGroup(productsGroupId, productId)
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    นำสินค้าออกจากกลุ่มแล้ว
                </Notification>,
            )
            const detail = await apiGetPointGroup(productsGroupId)
            setGroupProducts(detail.products ?? [])
            fetchList()
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถนำสินค้าออกได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        }
    }

    // ── Columns ────────────────────────────────────────────────────
    const columns: ColumnDef<PointGroupListItem>[] = useMemo(
        () => [
            {
                header: 'ชื่อกลุ่ม',
                accessorKey: 'group_name',
                cell: (props) => (
                    <span className="font-semibold">
                        {props.row.original.group_name}
                    </span>
                ),
            },
            {
                header: 'รายละเอียด',
                accessorKey: 'description',
                enableSorting: false,
                cell: (props) => (
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {props.row.original.description || '-'}
                    </span>
                ),
            },
            {
                header: 'แต้มที่ใช้แลก',
                accessorKey: 'points_to_redeem',
                cell: (props) => (
                    <Tag className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300 border-0">
                        {props.row.original.points_to_redeem} แต้ม
                    </Tag>
                ),
            },
            {
                header: 'จำนวนสินค้า',
                accessorKey: 'product_count',
                cell: (props) => (
                    <Tag className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 border-0">
                        {props.row.original.product_count} สินค้า
                    </Tag>
                ),
            },
            {
                header: 'สถานะ',
                accessorKey: 'is_active',
                enableSorting: false,
                cell: (props) => (
                    <Tag className={
                        props.row.original.is_active
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300 border-0'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 border-0'
                    }>
                        {props.row.original.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </Tag>
                ),
            },
            {
                header: 'จัดการ',
                id: 'action',
                enableSorting: false,
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex gap-1">
                            <Button
                                size="xs"
                                variant="plain"
                                icon={<TbPackage />}
                                title="จัดการสินค้าในกลุ่ม"
                                onClick={() => openProductsDialog(row)}
                            />
                            <Button
                                size="xs"
                                variant="plain"
                                icon={<TbEdit />}
                                onClick={() => openEdit(row)}
                            />
                            <Button
                                size="xs"
                                variant="plain"
                                icon={<TbTrash />}
                                className="text-red-500 hover:text-red-600"
                                onClick={() => {
                                    setDeleteTarget(row)
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

    const handlePaginationChange = (page: number) => setPageIndex(page)
    const handleSelectChange = (value: number) => {
        setPageSize(value)
        setPageIndex(1)
    }

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3>ตั้งค่าสะสมแต้ม</h3>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<TbPlus />}
                            onClick={openCreate}
                        >
                            เพิ่มกลุ่ม
                        </Button>
                    </div>
                    <div className="flex justify-end">
                        <Input
                            className="max-w-[300px]"
                            size="sm"
                            placeholder="ค้นหาชื่อกลุ่ม..."
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
                        pagingData={{ total, pageIndex, pageSize }}
                        onPaginationChange={handlePaginationChange}
                        onSelectChange={handleSelectChange}
                    />
                </div>
            </AdaptiveCard>

            {/* ── Create / Edit Group Dialog ── */}
            <Dialog
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
                onRequestClose={() => setFormOpen(false)}
                width={480}
            >
                <h5 className="mb-4">
                    {editTarget ? 'แก้ไขกลุ่มสะสมแต้ม' : 'เพิ่มกลุ่มสะสมแต้ม'}
                </h5>
                <div className="flex flex-col gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            ชื่อกลุ่ม <span className="text-red-500">*</span>
                        </label>
                        <Input
                            size="sm"
                            placeholder="เช่น กลุ่มกาแฟ, กลุ่มขนม"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            รายละเอียด
                        </label>
                        <Input
                            size="sm"
                            placeholder="คำอธิบายกลุ่ม (ไม่บังคับ)"
                            textArea
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            แต้มที่ใช้แลก <span className="text-red-500">*</span>
                        </label>
                        <Input
                            size="sm"
                            type="number"
                            placeholder="เช่น 10"
                            value={String(formPointsToRedeem)}
                            onChange={(e) => setFormPointsToRedeem(Number(e.target.value) || 0)}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            จำนวนแต้มที่ลูกค้าต้องสะสมครบเพื่อแลกสินค้าในกลุ่มนี้
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switcher
                            checked={formIsActive}
                            onChange={(val) => setFormIsActive(val)}
                        />
                        <span className="text-sm">เปิดใช้งาน</span>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setFormOpen(false)}>ยกเลิก</Button>
                    <Button
                        variant="solid"
                        loading={formSubmitting}
                        onClick={handleFormSubmit}
                    >
                        {editTarget ? 'บันทึก' : 'เพิ่ม'}
                    </Button>
                </div>
            </Dialog>

            {/* ── Delete Confirm ── */}
            <Dialog
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onRequestClose={() => setDeleteOpen(false)}
            >
                <h5 className="mb-4">ยืนยันการลบ</h5>
                {deleteTarget && (
                    <>
                        <p>
                            ต้องการลบกลุ่ม{' '}
                            <strong>{deleteTarget.group_name}</strong>{' '}
                            หรือไม่?
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            หากมีลูกค้าสะสมแต้มในกลุ่มนี้ จะไม่สามารถลบได้
                        </p>
                    </>
                )}
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setDeleteOpen(false)}>ยกเลิก</Button>
                    <Button
                        variant="solid"
                        color="red"
                        onClick={handleDeleteConfirm}
                    >
                        ลบ
                    </Button>
                </div>
            </Dialog>

            {/* ── Products in Group Dialog ── */}
            <Dialog
                isOpen={productsOpen}
                onClose={() => setProductsOpen(false)}
                onRequestClose={() => setProductsOpen(false)}
                width={640}
            >
                <h5 className="mb-4">
                    จัดการสินค้าในกลุ่ม: <span className="text-blue-600">{productsGroupName}</span>
                </h5>

                {/* Add products section */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        เพิ่มสินค้าเข้ากลุ่ม
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Select
                                size="sm"
                                isMulti
                                placeholder="เลือกสินค้า..."
                                options={availableProductOptions}
                                value={availableProductOptions.filter((o) =>
                                    selectedProductIds.includes(o.value),
                                )}
                                onChange={(opts) =>
                                    setSelectedProductIds(
                                        opts ? Array.from(opts).map((o) => o.value) : [],
                                    )
                                }
                                noOptionsMessage={() => 'ไม่มีสินค้าที่สามารถเพิ่มได้'}
                            />
                        </div>
                        <Button
                            size="sm"
                            variant="solid"
                            loading={addingProducts}
                            disabled={selectedProductIds.length === 0}
                            onClick={handleAddProducts}
                        >
                            เพิ่ม
                        </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        สินค้าที่อยู่ในกลุ่มอื่นแล้วจะไม่สามารถเพิ่มได้
                    </p>
                </div>

                {/* Current products list */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        สินค้าในกลุ่ม ({groupProducts.length} รายการ)
                    </label>
                    {productsLoading ? (
                        <div className="text-center py-4 text-gray-400">
                            กำลังโหลด...
                        </div>
                    ) : groupProducts.length === 0 ? (
                        <div className="text-center py-4 text-gray-400">
                            ยังไม่มีสินค้าในกลุ่มนี้
                        </div>
                    ) : (
                        <div className="max-h-[300px] overflow-y-auto border rounded-lg dark:border-gray-600">
                            {groupProducts.map((p) => (
                                <div
                                    key={p.product_id}
                                    className="flex items-center justify-between px-3 py-2 border-b last:border-b-0 dark:border-gray-600"
                                >
                                    <div className="flex items-center gap-2">
                                        {p.image_path ? (
                                            <img
                                                src={p.image_path}
                                                alt={p.product_name}
                                                className="w-8 h-8 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                <TbPackage className="text-gray-400" />
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-sm font-medium">
                                                {p.product_name}
                                            </span>
                                            <span className="text-xs text-gray-400 ml-2">
                                                ฿{Number(p.base_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        size="xs"
                                        variant="plain"
                                        icon={<TbTrash />}
                                        className="text-red-500 hover:text-red-600"
                                        onClick={() => handleRemoveProduct(p.product_id)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-4">
                    <Button onClick={() => setProductsOpen(false)}>ปิด</Button>
                </div>
            </Dialog>
        </Container>
    )
}

export default PointGroupList
