import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'
import Switcher from '@/components/ui/Switcher'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Tag from '@/components/ui/Tag'
import {
    TbArrowLeft,
    TbSearch,
    TbBuildingStore,
    TbPackage,
} from 'react-icons/tb'
import {
    apiBatchAssignBranchProducts,
    apiListProducts,
} from '@/services/ProductService'
import { apiListBranches } from '@/services/StaffManagementService'
import type { BranchOption } from '@/views/staff-management/types'
import type { ProductFields } from './types'
import { getErrorMessage } from '@/utils/errorHandler'

const BranchProductCreate = () => {
    const navigate = useNavigate()
    const [branches, setBranches] = useState<BranchOption[]>([])
    const [products, setProducts] = useState<ProductFields[]>([])
    const [submitting, setSubmitting] = useState(false)

    const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([])
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([])
    const [productSearch, setProductSearch] = useState('')
    const [onStock, setOnStock] = useState(0)
    const [reorderLevel, setReorderLevel] = useState(0)
    const [isActive, setIsActive] = useState(true)

    useEffect(() => {
        apiListBranches()
            .then((data) => setBranches(data ?? []))
            .catch(() => {})
        apiListProducts({ limit: 500 })
            .then((resp) => setProducts(resp.data ?? []))
            .catch(() => {})
    }, [])

    const filteredProducts = useMemo(() => {
        if (!productSearch.trim()) return products
        const q = productSearch.toLowerCase()
        return products.filter(
            (p) =>
                p.product_name.toLowerCase().includes(q) ||
                (p.category_name && p.category_name.toLowerCase().includes(q)),
        )
    }, [products, productSearch])

    const toggleBranch = (id: number) => {
        setSelectedBranchIds((prev) =>
            prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
        )
    }

    const toggleAllBranches = () => {
        if (selectedBranchIds.length === branches.length) {
            setSelectedBranchIds([])
        } else {
            setSelectedBranchIds(branches.map((b) => b.id))
        }
    }

    const toggleProduct = (id: number) => {
        setSelectedProductIds((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
        )
    }

    const toggleAllProducts = () => {
        const filteredIds = filteredProducts.map((p) => p.id)
        const allSelected = filteredIds.every((id) =>
            selectedProductIds.includes(id),
        )
        if (allSelected) {
            setSelectedProductIds((prev) =>
                prev.filter((id) => !filteredIds.includes(id)),
            )
        } else {
            setSelectedProductIds((prev) => [
                ...new Set([...prev, ...filteredIds]),
            ])
        }
    }

    const handleSubmit = async () => {
        if (selectedBranchIds.length === 0) {
            toast.push(
                <Notification type="warning" title="แจ้งเตือน">
                    กรุณาเลือกอย่างน้อย 1 สาขา
                </Notification>,
            )
            return
        }
        if (selectedProductIds.length === 0) {
            toast.push(
                <Notification type="warning" title="แจ้งเตือน">
                    กรุณาเลือกอย่างน้อย 1 สินค้า
                </Notification>,
            )
            return
        }

        setSubmitting(true)
        try {
            const resp = await apiBatchAssignBranchProducts({
                branch_ids: selectedBranchIds,
                product_ids: selectedProductIds,
                on_stock: onStock,
                reorder_level: reorderLevel,
                is_active: isActive,
            })
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    เพิ่มสินค้าสาขาแล้ว {resp.created} รายการ
                    {resp.skipped > 0 && ` (ข้าม ${resp.skipped} รายการที่มีอยู่แล้ว)`}
                </Notification>,
            )
            navigate('/products/branch-products')
        } catch (err: any) {
            const errorMessage = await getErrorMessage(
                err,
                'ไม่สามารถเพิ่มสินค้าสาขาได้',
            )
            toast.push(
                <Notification type="danger" title="Error">
                    {errorMessage}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    const totalPairs = selectedBranchIds.length * selectedProductIds.length

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="plain"
                            size="sm"
                            icon={<TbArrowLeft />}
                            onClick={() => navigate('/products/branch-products')}
                        />
                        <h3>เพิ่มสินค้าสาขา (Batch)</h3>
                    </div>

                    <p className="text-sm text-gray-500">
                        เลือกสาขาและสินค้าที่ต้องการ แล้วกดบันทึกทีเดียว
                        สินค้าที่ซ้ำจะถูกข้ามอัตโนมัติ
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Branch Selection */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h5 className="flex items-center gap-2">
                                    <TbBuildingStore className="text-lg" />
                                    เลือกสาขา
                                    {selectedBranchIds.length > 0 && (
                                        <Tag className="bg-blue-100 text-blue-600 border-0">
                                            {selectedBranchIds.length}
                                        </Tag>
                                    )}
                                </h5>
                                <Button
                                    size="xs"
                                    variant="plain"
                                    onClick={toggleAllBranches}
                                >
                                    {selectedBranchIds.length === branches.length
                                        ? 'ยกเลิกทั้งหมด'
                                        : 'เลือกทั้งหมด'}
                                </Button>
                            </div>
                            <div className="border rounded-lg dark:border-gray-600 max-h-[300px] overflow-y-auto">
                                {branches.length === 0 ? (
                                    <div className="p-4 text-center text-gray-400 text-sm">
                                        ไม่มีสาขา
                                    </div>
                                ) : (
                                    branches.map((branch) => (
                                        <label
                                            key={branch.id}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b last:border-b-0 dark:border-gray-600"
                                        >
                                            <Checkbox
                                                checked={selectedBranchIds.includes(
                                                    branch.id,
                                                )}
                                                onChange={() =>
                                                    toggleBranch(branch.id)
                                                }
                                            />
                                            <span className="font-medium">
                                                {branch.branch_name}
                                            </span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Product Selection */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h5 className="flex items-center gap-2">
                                    <TbPackage className="text-lg" />
                                    เลือกสินค้า
                                    {selectedProductIds.length > 0 && (
                                        <Tag className="bg-emerald-100 text-emerald-600 border-0">
                                            {selectedProductIds.length}
                                        </Tag>
                                    )}
                                </h5>
                                <Button
                                    size="xs"
                                    variant="plain"
                                    onClick={toggleAllProducts}
                                >
                                    {filteredProducts.length > 0 &&
                                    filteredProducts.every((p) =>
                                        selectedProductIds.includes(p.id),
                                    )
                                        ? 'ยกเลิกทั้งหมด'
                                        : 'เลือกทั้งหมด'}
                                </Button>
                            </div>
                            <Input
                                size="sm"
                                placeholder="ค้นหาสินค้า..."
                                prefix={
                                    <TbSearch className="text-lg" />
                                }
                                className="mb-2"
                                value={productSearch}
                                onChange={(e) =>
                                    setProductSearch(e.target.value)
                                }
                            />
                            <div className="border rounded-lg dark:border-gray-600 max-h-[300px] overflow-y-auto">
                                {filteredProducts.length === 0 ? (
                                    <div className="p-4 text-center text-gray-400 text-sm">
                                        ไม่พบสินค้า
                                    </div>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <label
                                            key={product.id}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b last:border-b-0 dark:border-gray-600"
                                        >
                                            <Checkbox
                                                checked={selectedProductIds.includes(
                                                    product.id,
                                                )}
                                                onChange={() =>
                                                    toggleProduct(product.id)
                                                }
                                            />
                                            <div className="flex items-center gap-3 min-w-0">
                                                {product.image_path ? (
                                                    <img
                                                        src={product.image_path}
                                                        alt={product.product_name}
                                                        className="w-8 h-8 rounded object-cover border flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex-shrink-0" />
                                                )}
                                                <div className="min-w-0">
                                                    <span className="font-medium block truncate">
                                                        {product.product_name}
                                                    </span>
                                                    {product.category_name && (
                                                        <span className="text-xs text-gray-400 block truncate">
                                                            {product.category_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="border rounded-lg p-4 dark:border-gray-600">
                        <h5 className="mb-3">ค่าเริ่มต้น</h5>
                        <p className="text-xs text-gray-400 mb-3">
                            กำหนดค่าเริ่มต้นสำหรับสินค้าสาขาที่สร้างใหม่
                            สามารถแก้ไขแยกแต่ละรายการได้ภายหลัง
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    จำนวนคงเหลือ
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    min="0"
                                    value={onStock || ''}
                                    onChange={(e) =>
                                        setOnStock(parseInt(e.target.value) || 0)
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    จุดสั่งซื้อ (Reorder Level)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    min="0"
                                    value={reorderLevel || ''}
                                    onChange={(e) =>
                                        setReorderLevel(
                                            parseInt(e.target.value) || 0,
                                        )
                                    }
                                />
                            </div>
                            <div className="flex items-end pb-2">
                                <div className="flex items-center gap-2">
                                    <Switcher
                                        checked={isActive}
                                        onChange={(val) => setIsActive(val)}
                                    />
                                    <span>เปิดขาย</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary & Actions */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2">
                        <div className="text-sm text-gray-500">
                            {totalPairs > 0 ? (
                                <span>
                                    จะสร้าง{' '}
                                    <strong className="text-gray-900 dark:text-gray-100">
                                        {totalPairs}
                                    </strong>{' '}
                                    รายการ ({selectedProductIds.length} สินค้า
                                    x {selectedBranchIds.length} สาขา)
                                </span>
                            ) : (
                                <span>เลือกสาขาและสินค้าเพื่อดำเนินการ</span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() =>
                                    navigate('/products/branch-products')
                                }
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                variant="solid"
                                loading={submitting}
                                disabled={totalPairs === 0}
                                onClick={handleSubmit}
                            >
                                บันทึก ({totalPairs} รายการ)
                            </Button>
                        </div>
                    </div>
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default BranchProductCreate
