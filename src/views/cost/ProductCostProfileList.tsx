import { useState, useEffect, useCallback } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Dialog from '@/components/ui/Dialog'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { TbSearch, TbSettings, TbPlus, TbX } from 'react-icons/tb'
import {
    apiListProductsWithCost,
    apiGetCostProfile,
    apiUpsertCostProfile,
    type ProductCostSummary,
    type ProductCostProfile,
} from '@/services/ProductCostService'
import {
    apiListProductionRecipes,
    apiGetProductionRecipeSummary,
    type ProductionRecipeListItem,
    type ProductionRecipeSummary,
} from '@/services/ProductionRecipeService'
import { getErrorMessage } from '@/utils/errorHandler'

const ProductCostProfileList = () => {
    const [products, setProducts] = useState<ProductCostSummary[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<ProductCostSummary | null>(null)
    const [costMode, setCostMode] = useState<'DIRECT' | 'BATCH'>('DIRECT')
    const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null)
    const [baseUsageQty, setBaseUsageQty] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Recipe data
    const [recipes, setRecipes] = useState<ProductionRecipeListItem[]>([])
    const [recipeSummary, setRecipeSummary] = useState<ProductionRecipeSummary | null>(null)

    useEffect(() => {
        fetchProducts()
        fetchRecipes()
    }, [search])

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const resp = await apiListProductsWithCost({
                limit: 200,
                search: search || undefined,
            })
            setProducts(resp.data ?? [])
        } catch {
            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    const fetchRecipes = async () => {
        try {
            const resp = await apiListProductionRecipes({ limit: 200 })
            setRecipes(resp.data ?? [])
        } catch { /* ignore */ }
    }

    const handleSearch = () => {
        setSearch(searchInput)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const openDialog = async (product: ProductCostSummary) => {
        setSelectedProduct(product)
        setDialogOpen(true)
        
        // Load existing profile
        try {
            const profile = await apiGetCostProfile(product.product_id)
            setCostMode(profile.cost_mode)
            setSelectedRecipeId(profile.production_recipe_id || null)
            setBaseUsageQty(String(profile.base_usage_qty || 0))
            
            if (profile.production_recipe_id) {
                loadRecipeSummary(profile.production_recipe_id)
            }
        } catch {
            // No profile yet, use defaults
            setCostMode('DIRECT')
            setSelectedRecipeId(null)
            setBaseUsageQty('0')
            setRecipeSummary(null)
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

    const validateForm = (): string | null => {
        if (!selectedProduct) return 'กรุณาเลือกสินค้า'
        if (!costMode) return 'กรุณาเลือกวิธีคิดต้นทุน'
        
        if (costMode === 'BATCH') {
            if (!selectedRecipeId) return 'กรุณาเลือกสูตรหม้อ'
            const qty = Number(baseUsageQty)
            if (!baseUsageQty || isNaN(qty)) return 'กรุณาระบุปริมาณที่ใช้จากสูตร'
            if (qty <= 0) return 'ปริมาณที่ใช้ต้องมากกว่า 0'
        }
        
        return null
    }

    const handleSave = async () => {
        const error = validateForm()
        if (error) {
            toast.push(<Notification type="warning" title="แจ้งเตือน">{error}</Notification>)
            return
        }

        if (!selectedProduct) return

        setSubmitting(true)
        try {
            await apiUpsertCostProfile({
                product_id: selectedProduct.product_id,
                cost_mode: costMode,
                production_recipe_id: costMode === 'BATCH' ? selectedRecipeId || undefined : undefined,
                base_usage_qty: costMode === 'BATCH' ? Number(baseUsageQty) : 0,
            })
            toast.push(<Notification type="success" title="สำเร็จ">บันทึกการตั้งค่าต้นทุนแล้ว</Notification>)
            setDialogOpen(false)
            fetchProducts()
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถบันทึกได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        } finally {
            setSubmitting(false)
        }
    }

    const recipeOptions = recipes.map((r) => ({
        value: r.id,
        label: `${r.recipe_name} (${r.output_quantity} ${r.output_unit})`,
    }))

    const calculateBaseCost = () => {
        if (!recipeSummary || !baseUsageQty) return 0
        return recipeSummary.cost_per_unit * Number(baseUsageQty)
    }

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h4 className="text-xl font-semibold">⚙️ ตั้งค่าต้นทุนสินค้า</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            กำหนดวิธีคิดต้นทุนสำหรับแต่ละสินค้า (สูตรปกติ หรือ สูตรแบบหม้อ)
                        </p>
                    </div>
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

                {loading ? (
                    <div className="text-center py-8">กำลังโหลด...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.map((product) => (
                            <div
                                key={product.product_id}
                                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h5 className="font-semibold">{product.product_name}</h5>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {product.cost_mode === 'BATCH' && product.recipe_name ? (
                                                <span className="inline-flex items-center gap-1 text-purple-600">
                                                    🍲 {product.recipe_name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">สูตรปกติ</span>
                                            )}
                                        </div>
                                    </div>
                                    <span
                                        className={`text-xs px-2 py-1 rounded ${
                                            product.cost_mode === 'BATCH'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {product.cost_mode === 'BATCH' ? 'หม้อ' : 'ปกติ'}
                                    </span>
                                </div>
                                
                                <div className="space-y-1 text-sm mb-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">ต้นทุน:</span>
                                        <span className="font-semibold">{product.total_cost.toFixed(2)} บาท</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">ราคาขาย:</span>
                                        <span>{product.base_price.toFixed(2)} บาท</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">กำไร:</span>
                                        <span className={product.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            {product.profit.toFixed(2)} ({product.margin_percent.toFixed(1)}%)
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    size="sm"
                                    variant="solid"
                                    icon={<TbSettings />}
                                    onClick={() => openDialog(product)}
                                    block
                                >
                                    ตั้งค่าวิธีคิดต้นทุน
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && products.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        ไม่พบสินค้า
                    </div>
                )}
            </AdaptiveCard>

            {/* Config Dialog */}
            <Dialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} width={700}>
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-lg font-semibold">
                        ตั้งค่าต้นทุน: {selectedProduct?.product_name}
                    </h5>
                    <Button 
                        size="sm" 
                        variant="plain" 
                        icon={<TbX />} 
                        onClick={() => setDialogOpen(false)} 
                    />
                </div>

                <div className="space-y-6">
                    {/* Cost Mode Selector */}
                    <div>
                        <label className="block text-sm font-semibold mb-3">วิธีคิดต้นทุน</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="costMode"
                                    value="DIRECT"
                                    checked={costMode === 'DIRECT'}
                                    onChange={(e) => handleModeChange(e.target.value)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">สูตรปกติ</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="costMode"
                                    value="BATCH"
                                    checked={costMode === 'BATCH'}
                                    onChange={(e) => handleModeChange(e.target.value)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">สูตรแบบหม้อ</span>
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {costMode === 'DIRECT'
                                ? 'ถ้าสินค้านี้คิดต้นทุนจากวัตถุดิบตรง ๆ ให้เลือก "สูตรปกติ"'
                                : 'ถ้าสินค้านี้ใช้ของที่ต้ม/ผสมเป็นหม้อก่อน ให้เลือก "สูตรแบบหม้อ"'}
                        </p>
                    </div>

                    {/* DIRECT Mode Info */}
                    {costMode === 'DIRECT' && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h6 className="font-semibold mb-2">📝 สูตรปกติ</h6>
                            <p className="text-sm text-gray-700">
                                สินค้านี้จะคิดต้นทุนจากวัตถุดิบที่เพิ่มในหน้า "คำนวณต้นทุน (รายชิ้น)" โดยตรง
                            </p>
                        </div>
                    )}

                    {/* BATCH Mode Config */}
                    {costMode === 'BATCH' && (
                        <>
                            {/* Recipe Selector */}
                            <div>
                                <label className="block text-sm font-semibold mb-2">สูตรหม้อ</label>
                                <Select
                                    options={recipeOptions}
                                    value={recipeOptions.find((o) => o.value === selectedRecipeId)}
                                    onChange={(opt) => handleRecipeChange(opt?.value || 0)}
                                    placeholder="เลือกสูตรหม้อ"
                                />
                            </div>

                            {/* Recipe Summary */}
                            {recipeSummary && (
                                <div className="bg-purple-50 p-4 rounded-lg space-y-2">
                                    <h6 className="font-semibold">📊 สรุปสูตร: {recipeSummary.recipe_name}</h6>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">ปริมาณที่ได้จากหม้อ:</span>
                                            <div className="font-semibold">
                                                {recipeSummary.output_quantity} {recipeSummary.output_unit}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">ต้นทุนรวมหม้อ:</span>
                                            <div className="font-semibold">{recipeSummary.total_cost.toFixed(2)} บาท</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">ต้นทุนต่อ 1 {recipeSummary.output_unit}:</span>
                                            <div className="font-semibold text-lg text-purple-600">
                                                {recipeSummary.cost_per_unit.toFixed(2)} บาท
                                            </div>
                                        </div>
                                        {baseUsageQty && Number(baseUsageQty) > 0 && (
                                            <div>
                                                <span className="text-gray-600">ต้นทุนจากสูตรหลัก:</span>
                                                <div className="font-semibold text-lg text-green-600">
                                                    {calculateBaseCost().toFixed(2)} บาท
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Base Usage Quantity */}
                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    ปริมาณที่ใช้จากสูตร ({recipeSummary?.output_unit || 'หน่วย'})
                                </label>
                                <Input
                                    type="number"
                                    value={baseUsageQty}
                                    onChange={(e) => setBaseUsageQty(e.target.value)}
                                    placeholder="เช่น 1 หรือ 1.5"
                                    step="0.01"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    💡 ถ้าขวด 1 ลิตร ให้ใส่ 1 / ถ้าขวด 1.5 ลิตร ให้ใส่ 1.5
                                </p>
                            </div>

                            {/* Note */}
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <h6 className="font-semibold mb-2">📦 หมายเหตุ</h6>
                                <p className="text-sm text-gray-700">
                                    ขวด ฝา และต้นทุนเสริมอื่น ๆ ยังเพิ่มได้จากหน้า "คำนวณต้นทุนสินค้า" ตามปกติ
                                </p>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="plain" onClick={() => setDialogOpen(false)}>
                        ยกเลิก
                    </Button>
                    <Button variant="solid" onClick={handleSave} disabled={submitting}>
                        {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
                    </Button>
                </div>
            </Dialog>
        </Container>
    )
}

export default ProductCostProfileList
