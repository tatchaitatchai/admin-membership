import { useState, useEffect, useCallback, useMemo } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Select from '@/components/ui/Select'
import Tag from '@/components/ui/Tag'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'
import {
    TbSearch,
    TbEye,
    TbPlus,
    TbTrash,
    TbX,
    TbEdit,
} from 'react-icons/tb'
import {
    apiListProductsWithCost,
    apiGetProductCostSummary,
    apiAddProductIngredient,
    apiUpdateProductIngredient,
    apiDeleteProductIngredient,
} from '@/services/ProductCostService'
import type {
    ProductCostSummary,
    ProductIngredientItem,
} from '@/services/ProductCostService'
import { apiListIngredients } from '@/services/IngredientService'
import type { IngredientListItem } from '@/services/IngredientService'
import { getErrorMessage } from '@/utils/errorHandler'

const ProductCostList = () => {
    // ── List state ───────────────────────────────────────────────
    const [items, setItems] = useState<ProductCostSummary[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState('')

    // ── Detail / Recipe dialog ───────────────────────────────────
    const [detailOpen, setDetailOpen] = useState(false)
    const [detailLoading, setDetailLoading] = useState(false)
    const [detailData, setDetailData] = useState<ProductCostSummary | null>(null)

    // ── Add ingredient to recipe ─────────────────────────────────
    const [ingredients, setIngredients] = useState<IngredientListItem[]>([])
    const [addIngredientId, setAddIngredientId] = useState<number | null>(null)
    const [addQuantity, setAddQuantity] = useState('')
    const [addSubmitting, setAddSubmitting] = useState(false)

    // ── Edit quantity dialog ─────────────────────────────────────
    const [editOpen, setEditOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<ProductIngredientItem | null>(null)
    const [editQuantity, setEditQuantity] = useState('')

    // ── Delete confirm ───────────────────────────────────────────
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<ProductIngredientItem | null>(null)

    // ── Load ingredients ─────────────────────────────────────────
    useEffect(() => {
        ;(async () => {
            try {
                const resp = await apiListIngredients({ limit: 200 })
                setIngredients(resp.data ?? [])
            } catch { /* ignore */ }
        })()
    }, [])

    // ── Fetch list ───────────────────────────────────────────────
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
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถโหลดรายการได้
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, search])

    useEffect(() => {
        fetchList()
    }, [fetchList])

    // ── Open detail (recipe) ─────────────────────────────────────
    const openDetail = async (productId: number) => {
        setDetailOpen(true)
        setDetailLoading(true)
        setDetailData(null)
        setAddIngredientId(null)
        setAddQuantity('')
        try {
            const resp = await apiGetProductCostSummary(productId)
            setDetailData(resp)
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถโหลดข้อมูลได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        } finally {
            setDetailLoading(false)
        }
    }

    const refreshDetail = async () => {
        if (!detailData) return
        try {
            const resp = await apiGetProductCostSummary(detailData.product_id)
            setDetailData(resp)
        } catch { /* ignore */ }
    }

    // ── Add ingredient ───────────────────────────────────────────
    const handleAddIngredient = async () => {
        const qty = Number(addQuantity) || 0
        if (!detailData || !addIngredientId || qty <= 0) return
        setAddSubmitting(true)
        try {
            await apiAddProductIngredient({
                product_id: detailData.product_id,
                ingredient_id: addIngredientId,
                quantity: qty,
            })
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    เพิ่มวัตถุดิบในสูตรแล้ว
                </Notification>,
            )
            setAddIngredientId(null)
            setAddQuantity('')
            await refreshDetail()
            fetchList()
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถเพิ่มวัตถุดิบได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        } finally {
            setAddSubmitting(false)
        }
    }

    // ── Edit quantity ────────────────────────────────────────────
    const openEditQuantity = (item: ProductIngredientItem) => {
        setEditTarget(item)
        setEditQuantity(String(item.quantity))
        setEditOpen(true)
    }

    const handleEditQuantity = async () => {
        if (!editTarget) return
        const qty = Number(editQuantity) || 0
        if (qty <= 0) return
        try {
            await apiUpdateProductIngredient(editTarget.id, {
                quantity: qty,
            })
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    แก้ไขปริมาณเรียบร้อย
                </Notification>,
            )
            setEditOpen(false)
            await refreshDetail()
            fetchList()
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถแก้ไขได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        }
    }

    // ── Delete ingredient from recipe ────────────────────────────
    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return
        try {
            await apiDeleteProductIngredient(deleteTarget.id)
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    ลบวัตถุดิบจากสูตรแล้ว
                </Notification>,
            )
            setDeleteOpen(false)
            setDeleteTarget(null)
            await refreshDetail()
            fetchList()
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถลบได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        }
    }

    // ── Ingredient options (filter out already used) ─────────────
    const ingredientOptions = useMemo(() => {
        const usedIds = new Set(
            detailData?.items?.map((i) => i.ingredient_id) ?? [],
        )
        return ingredients
            .filter((i) => !usedIds.has(i.id))
            .map((i) => ({
                value: i.id,
                label: `${i.ingredient_name} (${i.recipe_unit})`,
            }))
    }, [ingredients, detailData])

    // ── Columns ──────────────────────────────────────────────────
    const columns: ColumnDef<ProductCostSummary>[] = useMemo(
        () => [
            {
                header: 'สินค้า',
                accessorKey: 'product_name',
                cell: (props) => (
                    <span className="font-semibold">
                        {props.row.original.product_name}
                    </span>
                ),
            },
            {
                header: 'ราคาขาย',
                accessorKey: 'base_price',
                cell: (props) => (
                    <span className="font-semibold">
                        ฿{Number(props.row.original.base_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                ),
            },
            {
                header: 'ต้นทุนวัตถุดิบ',
                accessorKey: 'total_cost',
                cell: (props) => {
                    const cost = props.row.original.total_cost
                    return (
                        <span className={`font-semibold ${cost > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`}>
                            ฿{Number(cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    )
                },
            },
            {
                header: 'กำไร',
                accessorKey: 'profit',
                cell: (props) => {
                    const profit = props.row.original.profit
                    const isPositive = profit >= 0
                    return (
                        <span className={`font-semibold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            ฿{Number(profit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    )
                },
            },
            {
                header: 'กำไร %',
                accessorKey: 'margin_percent',
                enableSorting: false,
                cell: (props) => {
                    const margin = props.row.original.margin_percent
                    let color = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                    if (margin < 20) color = 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                    else if (margin < 40) color = 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                    return (
                        <Tag className={`${color} border-0`}>
                            {margin.toFixed(1)}%
                        </Tag>
                    )
                },
            },
            {
                header: 'จัดการ',
                id: 'action',
                enableSorting: false,
                cell: (props) => (
                    <Button
                        size="xs"
                        variant="plain"
                        icon={<TbEye />}
                        title="ดูสูตร/คำนวณต้นทุน"
                        onClick={() =>
                            openDetail(props.row.original.product_id)
                        }
                    >
                        ดูสูตร
                    </Button>
                ),
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
                        <h3>คำนวณต้นทุนสินค้า</h3>
                    </div>
                    <div className="flex justify-end">
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
                        pagingData={{ total, pageIndex, pageSize }}
                        onPaginationChange={handlePaginationChange}
                        onSelectChange={handleSelectChange}
                    />
                </div>
            </AdaptiveCard>

            {/* ── Recipe Detail Dialog ── */}
            <Dialog
                isOpen={detailOpen}
                onClose={() => setDetailOpen(false)}
                onRequestClose={() => setDetailOpen(false)}
                width={700}
            >
                <h5 className="mb-4">
                    สูตรต้นทุน: {detailData?.product_name}
                </h5>
                {detailLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <span className="text-gray-400">กำลังโหลด...</span>
                    </div>
                ) : detailData ? (
                    <div className="flex flex-col gap-4">
                        {/* Summary cards */}
                        <div className="grid grid-cols-4 gap-3">
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                                <p className="text-xs text-gray-500">ราคาขาย</p>
                                <p className="font-bold text-lg">
                                    ฿{Number(detailData.base_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                                <p className="text-xs text-gray-500">ต้นทุน</p>
                                <p className="font-bold text-lg text-orange-600 dark:text-orange-400">
                                    ฿{Number(detailData.total_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
                                <p className="text-xs text-gray-500">กำไร</p>
                                <p className={`font-bold text-lg ${detailData.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    ฿{Number(detailData.profit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                                <p className="text-xs text-gray-500">% กำไร</p>
                                <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                                    {detailData.margin_percent.toFixed(1)}%
                                </p>
                            </div>
                        </div>

                        {/* Add ingredient row */}
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">
                                    เพิ่มวัตถุดิบ
                                </label>
                                <Select
                                    size="sm"
                                    placeholder="เลือกวัตถุดิบ..."
                                    options={ingredientOptions}
                                    value={
                                        addIngredientId
                                            ? ingredientOptions.find(
                                                  (o) =>
                                                      o.value ===
                                                      addIngredientId,
                                              ) ?? null
                                            : null
                                    }
                                    onChange={(opt: any) =>
                                        setAddIngredientId(opt?.value ?? null)
                                    }
                                />
                            </div>
                            <div className="w-28">
                                <label className="block text-sm font-medium mb-1">
                                    ปริมาณ
                                </label>
                                <Input
                                    size="sm"
                                    type="number"
                                    min={0.01}
                                    step="0.01"
                                    placeholder="จำนวน"
                                    value={addQuantity}
                                    onChange={(e) =>
                                        setAddQuantity(e.target.value)
                                    }
                                />
                            </div>
                            <Button
                                size="sm"
                                variant="solid"
                                icon={<TbPlus />}
                                loading={addSubmitting}
                                onClick={handleAddIngredient}
                            >
                                เพิ่ม
                            </Button>
                        </div>

                        {/* Ingredient table */}
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                                        <th className="px-3 py-2 text-left">วัตถุดิบ</th>
                                        <th className="px-3 py-2 text-right">ปริมาณ</th>
                                        <th className="px-3 py-2 text-left">หน่วย</th>
                                        <th className="px-3 py-2 text-right">ต้นทุน/หน่วย</th>
                                        <th className="px-3 py-2 text-right">ต้นทุนรวม</th>
                                        <th className="px-3 py-2 w-20"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detailData.items?.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-t border-gray-100 dark:border-gray-700"
                                        >
                                            <td className="px-3 py-2 font-medium">
                                                {item.ingredient_name}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                {item.quantity}
                                            </td>
                                            <td className="px-3 py-2 text-gray-500">
                                                {item.recipe_unit}
                                            </td>
                                            <td className="px-3 py-2 text-right text-gray-500">
                                                ฿{(item.cost_per_unit / item.conversion_factor).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                            </td>
                                            <td className="px-3 py-2 text-right font-semibold text-orange-600 dark:text-orange-400">
                                                ฿{Number(item.ingredient_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="xs"
                                                        variant="plain"
                                                        icon={<TbEdit />}
                                                        onClick={() =>
                                                            openEditQuantity(
                                                                item,
                                                            )
                                                        }
                                                    />
                                                    <Button
                                                        size="xs"
                                                        variant="plain"
                                                        icon={<TbX />}
                                                        className="text-red-500"
                                                        onClick={() => {
                                                            setDeleteTarget(item)
                                                            setDeleteOpen(true)
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!detailData.items ||
                                        detailData.items.length === 0) && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-3 py-6 text-center text-gray-400"
                                            >
                                                ยังไม่มีวัตถุดิบในสูตร — เพิ่มด้านบน
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : null}
                <div className="flex justify-end mt-4">
                    <Button onClick={() => setDetailOpen(false)}>ปิด</Button>
                </div>
            </Dialog>

            {/* ── Edit Quantity Dialog ── */}
            <Dialog
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                onRequestClose={() => setEditOpen(false)}
            >
                <h5 className="mb-4">แก้ไขปริมาณ</h5>
                {editTarget && (
                    <div className="flex flex-col gap-3">
                        <p>
                            วัตถุดิบ:{' '}
                            <strong>{editTarget.ingredient_name}</strong>
                        </p>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                ปริมาณ ({editTarget.recipe_unit})
                            </label>
                            <Input
                                size="sm"
                                type="number"
                                min={0.01}
                                step="0.01"
                                value={editQuantity}
                                onChange={(e) =>
                                    setEditQuantity(e.target.value)
                                }
                            />
                        </div>
                    </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setEditOpen(false)}>ยกเลิก</Button>
                    <Button variant="solid" onClick={handleEditQuantity}>
                        บันทึก
                    </Button>
                </div>
            </Dialog>

            {/* ── Delete from recipe confirm ── */}
            <Dialog
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onRequestClose={() => setDeleteOpen(false)}
            >
                <h5 className="mb-4">ยืนยันการลบ</h5>
                {deleteTarget && (
                    <p>
                        ต้องการลบ{' '}
                        <strong>{deleteTarget.ingredient_name}</strong>{' '}
                        ออกจากสูตรหรือไม่?
                    </p>
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
        </Container>
    )
}

export default ProductCostList
