import { useState, useEffect, useCallback } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { TbPlus, TbEdit, TbTrash, TbX } from 'react-icons/tb'
import {
    apiGetProductionRecipeSummary,
    apiAddProductionRecipeIngredient,
    apiUpdateProductionRecipeIngredient,
    apiDeleteProductionRecipeIngredient,
    type ProductionRecipeSummary,
    type ProductionRecipeIngredient,
} from '@/services/ProductionRecipeService'
import { apiListIngredients, type IngredientListItem } from '@/services/IngredientService'
import { getErrorMessage } from '@/utils/errorHandler'

type Props = {
    open: boolean
    recipeId: number | null
    recipeName: string
    onClose: () => void
    onSuccess: () => void
}

const ProductionRecipeDetail = ({ open, recipeId, recipeName, onClose, onSuccess }: Props) => {
    const [loading, setLoading] = useState(false)
    const [detailData, setDetailData] = useState<ProductionRecipeSummary | null>(null)
    
    const [ingredients, setIngredients] = useState<IngredientListItem[]>([])
    const [addIngredientId, setAddIngredientId] = useState<number | null>(null)
    const [addQuantity, setAddQuantity] = useState('')
    const [addSubmitting, setAddSubmitting] = useState(false)
    
    const [editOpen, setEditOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<ProductionRecipeIngredient | null>(null)
    const [editQuantity, setEditQuantity] = useState('')
    
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<ProductionRecipeIngredient | null>(null)

    useEffect(() => {
        if (open && recipeId) {
            loadData()
            loadIngredients()
        }
    }, [open, recipeId])

    const loadIngredients = async () => {
        try {
            const resp = await apiListIngredients({ limit: 200 })
            setIngredients(resp.data ?? [])
        } catch { /* ignore */ }
    }

    const loadData = async () => {
        if (!recipeId) return
        setLoading(true)
        try {
            const resp = await apiGetProductionRecipeSummary(recipeId)
            setDetailData(resp)
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถโหลดข้อมูลได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        } finally {
            setLoading(false)
        }
    }

    const handleAddIngredient = async () => {
        if (!recipeId || !addIngredientId || !addQuantity) return
        setAddSubmitting(true)
        try {
            await apiAddProductionRecipeIngredient({
                production_recipe_id: recipeId,
                ingredient_id: addIngredientId,
                quantity: Number(addQuantity),
            })
            toast.push(<Notification type="success" title="สำเร็จ">เพิ่มวัตถุดิบแล้ว</Notification>)
            setAddIngredientId(null)
            setAddQuantity('')
            loadData()
            onSuccess()
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถเพิ่มได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        } finally {
            setAddSubmitting(false)
        }
    }

    const openEditQuantity = (item: ProductionRecipeIngredient) => {
        setEditTarget(item)
        setEditQuantity(String(item.quantity))
        setEditOpen(true)
    }

    const handleEditQuantity = async () => {
        if (!editTarget) return
        try {
            await apiUpdateProductionRecipeIngredient(editTarget.id, {
                quantity: Number(editQuantity),
            })
            toast.push(<Notification type="success" title="สำเร็จ">แก้ไขแล้ว</Notification>)
            setEditOpen(false)
            loadData()
            onSuccess()
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถแก้ไขได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        }
    }

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return
        try {
            await apiDeleteProductionRecipeIngredient(deleteTarget.id)
            toast.push(<Notification type="success" title="สำเร็จ">ลบแล้ว</Notification>)
            setDeleteOpen(false)
            loadData()
            onSuccess()
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถลบได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        }
    }

    const ingredientOptions = ingredients.map((i) => ({
        value: i.id,
        label: `${i.ingredient_name} (${i.recipe_unit})`,
    }))

    return (
        <>
            <Dialog isOpen={open} onClose={onClose} width={800}>
                <div className="flex items-center justify-between mb-6">
                    <h5 className="text-lg font-semibold">จัดการส่วนผสม: {recipeName}</h5>
                    <Button size="sm" variant="plain" icon={<TbX />} onClick={onClose} />
                </div>

                {loading ? (
                    <div className="text-center py-8">กำลังโหลด...</div>
                ) : (
                    <div className="space-y-6">
                        {/* Recipe Summary */}
                        {detailData && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h6 className="font-semibold mb-2">สรุปสูตร</h6>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">ปริมาณที่ได้:</span>
                                        <div className="font-semibold">{detailData.output_quantity} {detailData.output_unit}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">ต้นทุนรวม:</span>
                                        <div className="font-semibold text-lg">{detailData.total_cost.toFixed(2)} บาท</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">ต้นทุนต่อ 1 {detailData.output_unit}:</span>
                                        <div className="font-semibold text-lg text-blue-600">{detailData.cost_per_unit.toFixed(2)} บาท</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Add Ingredient */}
                        <div>
                            <h6 className="font-semibold mb-3">เพิ่มวัตถุดิบ</h6>
                            <div className="flex gap-2">
                                <Select
                                    className="flex-1"
                                    options={ingredientOptions}
                                    value={ingredientOptions.find((o) => o.value === addIngredientId)}
                                    onChange={(opt) => setAddIngredientId(opt?.value || null)}
                                    placeholder="เลือกวัตถุดิบ"
                                />
                                <Input
                                    type="number"
                                    value={addQuantity}
                                    onChange={(e) => setAddQuantity(e.target.value)}
                                    placeholder="ปริมาณ"
                                    className="w-32"
                                />
                                <Button
                                    icon={<TbPlus />}
                                    onClick={handleAddIngredient}
                                    disabled={!addIngredientId || !addQuantity || addSubmitting}
                                >
                                    เพิ่ม
                                </Button>
                            </div>
                        </div>

                        {/* Ingredient List */}
                        <div>
                            <h6 className="font-semibold mb-3">รายการวัตถุดิบในสูตร</h6>
                            <div className="space-y-2">
                                {detailData?.items?.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        ยังไม่มีวัตถุดิบในสูตร กรุณาเพิ่มวัตถุดิบ
                                    </div>
                                )}
                                {detailData?.items?.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                        <div className="flex-1">
                                            <div className="font-medium">{item.ingredient_name}</div>
                                            <div className="text-sm text-gray-600">
                                                {item.quantity} {item.recipe_unit} × {(item.cost_per_unit / item.conversion_factor).toFixed(4)} = {item.ingredient_cost.toFixed(2)} บาท
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="plain"
                                                icon={<TbEdit />}
                                                onClick={() => openEditQuantity(item)}
                                            />
                                            <Button
                                                size="sm"
                                                variant="plain"
                                                icon={<TbTrash />}
                                                onClick={() => {
                                                    setDeleteTarget(item)
                                                    setDeleteOpen(true)
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* Edit Dialog */}
            <Dialog isOpen={editOpen} onClose={() => setEditOpen(false)}>
                <h5 className="text-lg font-semibold mb-4">แก้ไขปริมาณ</h5>
                <div className="mb-4">
                    <label className="block text-sm mb-2">ปริมาณ ({editTarget?.recipe_unit})</label>
                    <Input
                        type="number"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="plain" onClick={() => setEditOpen(false)}>ยกเลิก</Button>
                    <Button variant="solid" onClick={handleEditQuantity}>บันทึก</Button>
                </div>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)}>
                <h5 className="text-lg font-semibold mb-4">ยืนยันการลบ</h5>
                <p className="mb-4">ต้องการลบ "{deleteTarget?.ingredient_name}" ใช่หรือไม่?</p>
                <div className="flex justify-end gap-2">
                    <Button variant="plain" onClick={() => setDeleteOpen(false)}>ยกเลิก</Button>
                    <Button variant="solid" onClick={handleDeleteConfirm}>ลบ</Button>
                </div>
            </Dialog>
        </>
    )
}

export default ProductionRecipeDetail
