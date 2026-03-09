import { useState, useEffect, useCallback, useMemo } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'
import { TbPlus, TbEdit, TbTrash, TbSearch } from 'react-icons/tb'
import {
    apiListIngredients,
    apiCreateIngredient,
    apiUpdateIngredient,
    apiDeleteIngredient,
} from '@/services/IngredientService'
import type { IngredientListItem } from '@/services/IngredientService'
import { getErrorMessage } from '@/utils/errorHandler'

const IngredientList = () => {
    const [items, setItems] = useState<IngredientListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState('')

    // ── Create / Edit dialog ─────────────────────────────────────
    const [formOpen, setFormOpen] = useState(false)
    const [formSubmitting, setFormSubmitting] = useState(false)
    const [editTarget, setEditTarget] = useState<IngredientListItem | null>(null)
    const [formName, setFormName] = useState('')
    const [formCostUnit, setFormCostUnit] = useState('')
    const [formCostPerUnit, setFormCostPerUnit] = useState('')
    const [formRecipeUnit, setFormRecipeUnit] = useState('')
    const [formConversionFactor, setFormConversionFactor] = useState('')

    // ── Delete dialog ────────────────────────────────────────────
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<IngredientListItem | null>(null)

    // ── Fetch ────────────────────────────────────────────────────
    const fetchList = useCallback(async () => {
        setLoading(true)
        try {
            const resp = await apiListIngredients({
                page: pageIndex,
                limit: pageSize,
                search: search || undefined,
            })
            setItems(resp.data ?? [])
            setTotal(resp.total)
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถโหลดรายการวัตถุดิบได้
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, search])

    useEffect(() => {
        fetchList()
    }, [fetchList])

    // ── Open form ────────────────────────────────────────────────
    const openCreate = () => {
        setEditTarget(null)
        setFormName('')
        setFormCostUnit('')
        setFormCostPerUnit('')
        setFormRecipeUnit('')
        setFormConversionFactor('')
        setFormOpen(true)
    }

    const openEdit = (item: IngredientListItem) => {
        setEditTarget(item)
        setFormName(item.ingredient_name)
        setFormCostUnit(item.cost_unit)
        setFormCostPerUnit(String(item.cost_per_unit))
        setFormRecipeUnit(item.recipe_unit)
        setFormConversionFactor(String(item.conversion_factor))
        setFormOpen(true)
    }

    // ── Submit form ──────────────────────────────────────────────
    const handleFormSubmit = async () => {
        const costPerUnitNum = Number(formCostPerUnit) || 0
        const conversionFactorNum = Number(formConversionFactor) || 0
        if (!formName.trim()) {
            toast.push(
                <Notification type="warning" title="แจ้งเตือน">
                    กรุณากรอกชื่อวัตถุดิบ
                </Notification>,
            )
            return
        }
        if (conversionFactorNum <= 0) {
            toast.push(
                <Notification type="warning" title="แจ้งเตือน">
                    อัตราแปลงต้องมากกว่า 0
                </Notification>,
            )
            return
        }
        setFormSubmitting(true)
        try {
            if (editTarget) {
                await apiUpdateIngredient(editTarget.id, {
                    ingredient_name: formName,
                    cost_unit: formCostUnit,
                    cost_per_unit: costPerUnitNum,
                    recipe_unit: formRecipeUnit,
                    conversion_factor: conversionFactorNum,
                })
                toast.push(
                    <Notification type="success" title="สำเร็จ">
                        แก้ไขวัตถุดิบเรียบร้อย
                    </Notification>,
                )
            } else {
                await apiCreateIngredient({
                    ingredient_name: formName,
                    cost_unit: formCostUnit,
                    cost_per_unit: costPerUnitNum,
                    recipe_unit: formRecipeUnit,
                    conversion_factor: conversionFactorNum,
                })
                toast.push(
                    <Notification type="success" title="สำเร็จ">
                        เพิ่มวัตถุดิบเรียบร้อย
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

    // ── Delete ───────────────────────────────────────────────────
    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return
        try {
            await apiDeleteIngredient(deleteTarget.id)
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    ลบวัตถุดิบแล้ว
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

    // ── Computed cost preview ────────────────────────────────────
    const previewCostPerRecipeUnit =
        Number(formConversionFactor) > 0
            ? Number(formCostPerUnit) / Number(formConversionFactor)
            : 0

    // ── Columns ──────────────────────────────────────────────────
    const columns: ColumnDef<IngredientListItem>[] = useMemo(
        () => [
            {
                header: 'ชื่อวัตถุดิบ',
                accessorKey: 'ingredient_name',
                cell: (props) => (
                    <span className="font-semibold">
                        {props.row.original.ingredient_name}
                    </span>
                ),
            },
            {
                header: 'หน่วยซื้อ',
                accessorKey: 'cost_unit',
                enableSorting: false,
            },
            {
                header: 'ราคา/หน่วยซื้อ',
                accessorKey: 'cost_per_unit',
                cell: (props) => (
                    <span className="font-semibold">
                        ฿{Number(props.row.original.cost_per_unit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </span>
                ),
            },
            {
                header: 'หน่วยสูตร',
                accessorKey: 'recipe_unit',
                enableSorting: false,
            },
            {
                header: 'อัตราแปลง',
                accessorKey: 'conversion_factor',
                enableSorting: false,
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            1 {row.cost_unit} = {row.conversion_factor} {row.recipe_unit}
                        </span>
                    )
                },
            },
            {
                header: 'ต้นทุน/หน่วยสูตร',
                id: 'cost_per_recipe_unit',
                enableSorting: false,
                cell: (props) => (
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                        ฿{Number(props.row.original.cost_per_recipe_unit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                        /{props.row.original.recipe_unit}
                    </span>
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
                        <h3>จัดการวัตถุดิบ</h3>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<TbPlus />}
                            onClick={openCreate}
                        >
                            เพิ่มวัตถุดิบ
                        </Button>
                    </div>
                    <div className="flex justify-end">
                        <Input
                            className="max-w-[300px]"
                            size="sm"
                            placeholder="ค้นหาชื่อวัตถุดิบ..."
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

            {/* ── Create / Edit Dialog ── */}
            <Dialog
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
                onRequestClose={() => setFormOpen(false)}
                width={520}
            >
                <h5 className="mb-4">
                    {editTarget ? 'แก้ไขวัตถุดิบ' : 'เพิ่มวัตถุดิบ'}
                </h5>
                <div className="flex flex-col gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            ชื่อวัตถุดิบ <span className="text-red-500">*</span>
                        </label>
                        <Input
                            size="sm"
                            placeholder="เช่น นมสด, น้ำเชื่อม, เมล็ดกาแฟ"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                หน่วยซื้อ <span className="text-red-500">*</span>
                            </label>
                            <Input
                                size="sm"
                                placeholder="เช่น ขวด, กก., ถุง"
                                value={formCostUnit}
                                onChange={(e) => setFormCostUnit(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                ราคา/หน่วยซื้อ (บาท) <span className="text-red-500">*</span>
                            </label>
                            <Input
                                size="sm"
                                type="number"
                                min={0}
                                step="0.01"
                                placeholder="0.00"
                                value={formCostPerUnit}
                                onChange={(e) =>
                                    setFormCostPerUnit(e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                หน่วยสูตร <span className="text-red-500">*</span>
                            </label>
                            <Input
                                size="sm"
                                placeholder="เช่น มล., กรัม, ชิ้น"
                                value={formRecipeUnit}
                                onChange={(e) =>
                                    setFormRecipeUnit(e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                อัตราแปลง <span className="text-red-500">*</span>
                            </label>
                            <Input
                                size="sm"
                                type="number"
                                min={0.0001}
                                step="0.01"
                                placeholder="เช่น 1000"
                                value={formConversionFactor}
                                onChange={(e) =>
                                    setFormConversionFactor(e.target.value)
                                }
                            />
                        </div>
                    </div>
                    {formCostUnit && formRecipeUnit && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm">
                            <p className="text-gray-600 dark:text-gray-300">
                                1 <strong>{formCostUnit}</strong> ={' '}
                                {formConversionFactor || '?'}{' '}
                                <strong>{formRecipeUnit}</strong>
                            </p>
                            <p className="text-blue-700 dark:text-blue-300 font-semibold mt-1">
                                ต้นทุน/หน่วยสูตร = ฿
                                {previewCostPerRecipeUnit.toLocaleString(
                                    undefined,
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 4,
                                    },
                                )}
                                /{formRecipeUnit}
                            </p>
                        </div>
                    )}
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
                            ต้องการลบวัตถุดิบ{' '}
                            <strong>{deleteTarget.ingredient_name}</strong>{' '}
                            หรือไม่?
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            หากวัตถุดิบนี้ถูกใช้ในสูตรสินค้า จะไม่สามารถลบได้
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
        </Container>
    )
}

export default IngredientList
