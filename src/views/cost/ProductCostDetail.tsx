import { useState, useEffect, useCallback } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Segment from '@/components/ui/Segment'
import { TbPlus, TbEdit, TbTrash, TbX } from 'react-icons/tb'
import {
    apiGetProductCostSummary,
    apiAddProductIngredient,
    apiUpdateProductIngredient,
    apiDeleteProductIngredient,
    apiUpsertCostProfile,
    type ProductCostSummary,
    type ProductIngredientItem,
} from '@/services/ProductCostService'
import {
    apiListProductionRecipes,
    apiGetProductionRecipeSummary,
    type ProductionRecipeListItem,
    type ProductionRecipeSummary,
} from '@/services/ProductionRecipeService'
import { apiListIngredients, type IngredientListItem } from '@/services/IngredientService'
import { getErrorMessage } from '@/utils/errorHandler'

type Props = {
    open: boolean
    productId: number | null
    productName: string
    onClose: () => void
    onSuccess: () => void
}

const ProductCostDetail = ({ open, productId, productName, onClose, onSuccess }: Props) => {
    const [loading, setLoading] = useState(false)
    const [costMode, setCostMode] = useState<'DIRECT' | 'BATCH'>('DIRECT')
    const [detailData, setDetailData] = useState<ProductCostSummary | null>(null)
    
    // BATCH mode state
    const [recipes, setRecipes] = useState<ProductionRecipeListItem[]>([])
    const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null)
    const [recipeSummary, setRecipeSummary] = useState<ProductionRecipeSummary | null>(null)
    const [baseUsageQty, setBaseUsageQty] = useState('')
    
    // Ingredients
    const [ingredients, setIngredients] = useState<IngredientListItem[]>([])
    const [addIngredientId, setAddIngredientId] = useState<number | null>(null)
    const [addQuantity, setAddQuantity] = useState('')
    const [addSubmitting, setAddSubmitting] = useState(false)
    
    // Edit
    const [editOpen, setEditOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<ProductIngredientItem | null>(null)
    const [editQuantity, setEditQuantity] = useState('')
    
    // Delete
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<ProductIngredientItem | null>(null)

    useEffect(() => {
        if (open && productId) {
            loadData()
            loadIngredients()
            loadRecipes()
        }
    }, [open, productId])

    const loadIngredients = async () => {
        try {
            const resp = await apiListIngredients({ limit: 200 })
            setIngredients(resp.data ?? [])
        } catch { /* ignore */ }
    }

    const loadRecipes = async () => {
        try {
            const resp = await apiListProductionRecipes({ limit: 200 })
            setRecipes(resp.data ?? [])
        } catch { /* ignore */ }
    }

    const loadData = async () => {
        if (!productId) return
        setLoading(true)
        try {
            const resp = await apiGetProductCostSummary(productId)
            setDetailData(resp)
            setCostMode(resp.cost_mode || 'DIRECT')
            if (resp.production_recipe_id) {
                setSelectedRecipeId(resp.production_recipe_id)
                loadRecipeSummary(resp.production_recipe_id)
            }
            setBaseUsageQty(String(resp.base_usage_qty || 0))
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถโหลดข้อมูลได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        } finally {
            setLoading(false)
        }
    }

    const loadRecipeSummary = async (recipeId: number) => {
        try {
            const resp = await apiGetProductionRecipeSummary(recipeId)
            setRecipeSummary(resp)
        } catch { /* ignore */ }
    }

    const handleModeChange = (val: string | number) => {
        const mode = val as 'DIRECT' | 'BATCH'
        setCostMode(mode)
        if (mode === 'DIRECT') {
            setSelectedRecipeId(null)
            setRecipeSummary(null)
            setBaseUsageQty('0')
        }
    }

    const handleRecipeChange = (val: string | number) => {
        const recipeId = Number(val)
        setSelectedRecipeId(recipeId)
        if (recipeId) {
            loadRecipeSummary(recipeId)
        } else {
            setRecipeSummary(null)
        }
    }

    const handleSaveProfile = async () => {
        if (!productId) return
        try {
            await apiUpsertCostProfile({
                product_id: productId,
                cost_mode: costMode,
                production_recipe_id: costMode === 'BATCH' ? selectedRecipeId || undefined : undefined,
                base_usage_qty: Number(baseUsageQty) || 0,
            })
            toast.push(<Notification type="success" title="สำเร็จ">บันทึกโปรไฟล์ต้นทุนแล้ว</Notification>)
            loadData()
            onSuccess()
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถบันทึกได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        }
    }

    const handleAddIngredient = async () => {
        if (!productId || !addIngredientId || !addQuantity) return
        setAddSubmitting(true)
        try {
            await apiAddProductIngredient({
                product_id: productId,
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

    const openEditQuantity = (item: ProductIngredientItem) => {
        setEditTarget(item)
        setEditQuantity(String(item.quantity))
        setEditOpen(true)
    }

    const handleEditQuantity = async () => {
        if (!editTarget) return
        try {
            await apiUpdateProductIngredient(editTarget.id, {
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
            await apiDeleteProductIngredient(deleteTarget.id)
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

    const recipeOptions = recipes.map((r) => ({
        value: r.id,
        label: `${r.recipe_name} (${r.output_quantity} ${r.output_unit})`,
    }))

    return (
        <>
            <Dialog isOpen={open} onClose={onClose} width={900}>
                <div className="flex items-center justify-between mb-6">
                    <h5 className="text-lg font-semibold">ต้นทุนสินค้า: {productName}</h5>
                    <Button size="sm" variant="plain" icon={<TbX />} onClick={onClose} />
                </div>

                {loading ? (
                    <div className="text-center py-8">กำลังโหลด...</div>
                ) : (
                    <div className="space-y-6">
                        {/* Mode Toggle */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">โหมดคำนวณต้นทุน</label>
                            <Segment
                                value={costMode}
                                onChange={(val) => handleModeChange(val[0])}
                            >
                                <Segment.Item value="DIRECT">สูตรปกติ (Direct)</Segment.Item>
                                <Segment.Item value="BATCH">สูตรแบบหม้อ (Batch)</Segment.Item>
                            </Segment>
                        </div>

                        {costMode === 'BATCH' && (
                            <>
                                {/* Recipe Selection */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2">เลือกสูตรหม้อ</label>
                                    <Select
                                        options={recipeOptions}
                                        value={recipeOptions.find((o) => o.value === selectedRecipeId)}
                                        onChange={(opt) => handleRecipeChange(opt?.value || 0)}
                                        placeholder="เลือกสูตรหม้อ"
                                    />
                                </div>

                                {recipeSummary && (
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                        <h6 className="font-semibold">สรุปสูตร: {recipeSummary.recipe_name}</h6>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">ต้นทุนรวมหม้อ:</span>
                                                <div className="font-semibold">{recipeSummary.total_cost.toFixed(2)} บาท</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">ปริมาณที่ได้:</span>
                                                <div className="font-semibold">{recipeSummary.output_quantity} {recipeSummary.output_unit}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">ต้นทุนต่อ 1 {recipeSummary.output_unit}:</span>
                                                <div className="font-semibold">{recipeSummary.cost_per_unit.toFixed(2)} บาท</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Base Usage Quantity */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2">ปริมาณที่ใช้</label>
                                    <Input
                                        type="number"
                                        value={baseUsageQty}
                                        onChange={(e) => setBaseUsageQty(e.target.value)}
                                        placeholder="เช่น 1 หรือ 1.5"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        ถ้าขวด 1 ลิตร ใส่ 1 / ถ้าขวด 1.5 ลิตร ใส่ 1.5
                                    </p>
                                </div>

                                <Button onClick={handleSaveProfile} variant="solid">
                                    บันทึกโปรไฟล์
                                </Button>
                            </>
                        )}

                        {/* Add Ingredient/Packaging */}
                        <div className="border-t pt-4">
                            <h6 className="font-semibold mb-3">
                                {costMode === 'BATCH' ? 'บรรจุภัณฑ์ / เพิ่มเติม' : 'วัตถุดิบในสูตร'}
                            </h6>
                            <div className="flex gap-2 mb-4">
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

                            {/* Ingredient List */}
                            <div className="space-y-2">
                                {detailData?.items?.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                        <div className="flex-1">
                                            <div className="font-medium">{item.ingredient_name}</div>
                                            <div className="text-sm text-gray-600">
                                                {item.quantity} {item.recipe_unit} × {(item.cost_per_unit / item.conversion_factor).toFixed(2)} = {item.ingredient_cost.toFixed(2)} บาท
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

                        {/* Cost Summary */}
                        {detailData && (
                            <div className="border-t pt-4 space-y-2">
                                <h6 className="font-semibold mb-3">สรุปต้นทุน</h6>
                                {costMode === 'BATCH' && (
                                    <>
                                        <div className="flex justify-between text-sm">
                                            <span>ต้นทุนจากสูตรหลัก:</span>
                                            <span className="font-semibold">{detailData.batch_base_cost.toFixed(2)} บาท</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>ต้นทุนบรรจุภัณฑ์:</span>
                                            <span className="font-semibold">{detailData.packaging_cost.toFixed(2)} บาท</span>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between text-base font-semibold border-t pt-2">
                                    <span>ต้นทุนรวม:</span>
                                    <span>{detailData.total_cost.toFixed(2)} บาท</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>ราคาขาย:</span>
                                    <span>{detailData.base_price.toFixed(2)} บาท</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>กำไร:</span>
                                    <span className={detailData.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        {detailData.profit.toFixed(2)} บาท ({detailData.margin_percent.toFixed(1)}%)
                                    </span>
                                </div>
                            </div>
                        )}
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

export default ProductCostDetail
