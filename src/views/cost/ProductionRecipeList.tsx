import { useState, useEffect, useCallback } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'
import Dialog from '@/components/ui/Dialog'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { TbSearch, TbPlus, TbEdit, TbTrash, TbEye } from 'react-icons/tb'
import {
    apiListProductionRecipes,
    apiCreateProductionRecipe,
    apiUpdateProductionRecipe,
    apiDeleteProductionRecipe,
    type ProductionRecipeListItem,
} from '@/services/ProductionRecipeService'
import { getErrorMessage } from '@/utils/errorHandler'
import ProductionRecipeDetail from './ProductionRecipeDetail'

const ProductionRecipeList = () => {
    const [items, setItems] = useState<ProductionRecipeListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')

    const [createOpen, setCreateOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [detailOpen, setDetailOpen] = useState(false)

    const [selectedRecipe, setSelectedRecipe] = useState<ProductionRecipeListItem | null>(null)
    const [formData, setFormData] = useState({
        recipe_name: '',
        output_quantity: '',
        output_unit: '',
    })
    const [submitting, setSubmitting] = useState(false)

    const fetchList = useCallback(async () => {
        setLoading(true)
        try {
            const resp = await apiListProductionRecipes({
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

    const openCreate = () => {
        setFormData({ recipe_name: '', output_quantity: '', output_unit: 'ลิตร' })
        setCreateOpen(true)
    }

    const openEdit = (recipe: ProductionRecipeListItem) => {
        setSelectedRecipe(recipe)
        setFormData({
            recipe_name: recipe.recipe_name,
            output_quantity: String(recipe.output_quantity),
            output_unit: recipe.output_unit,
        })
        setEditOpen(true)
    }

    const openDelete = (recipe: ProductionRecipeListItem) => {
        setSelectedRecipe(recipe)
        setDeleteOpen(true)
    }

    const openDetail = (recipe: ProductionRecipeListItem) => {
        setSelectedRecipe(recipe)
        setDetailOpen(true)
    }

    const handleCreate = async () => {
        if (!formData.recipe_name || !formData.output_quantity || !formData.output_unit) {
            toast.push(<Notification type="warning" title="แจ้งเตือน">กรุณากรอกข้อมูลให้ครบ</Notification>)
            return
        }
        setSubmitting(true)
        try {
            await apiCreateProductionRecipe({
                recipe_name: formData.recipe_name,
                output_quantity: Number(formData.output_quantity),
                output_unit: formData.output_unit,
            })
            toast.push(<Notification type="success" title="สำเร็จ">สร้างสูตรหม้อแล้ว</Notification>)
            setCreateOpen(false)
            fetchList()
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถสร้างได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = async () => {
        if (!selectedRecipe) return
        setSubmitting(true)
        try {
            await apiUpdateProductionRecipe(selectedRecipe.id, {
                recipe_name: formData.recipe_name || undefined,
                output_quantity: formData.output_quantity ? Number(formData.output_quantity) : undefined,
                output_unit: formData.output_unit || undefined,
            })
            toast.push(<Notification type="success" title="สำเร็จ">แก้ไขสูตรหม้อแล้ว</Notification>)
            setEditOpen(false)
            fetchList()
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถแก้ไขได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!selectedRecipe) return
        setSubmitting(true)
        try {
            await apiDeleteProductionRecipe(selectedRecipe.id)
            toast.push(<Notification type="success" title="สำเร็จ">ลบสูตรหม้อแล้ว</Notification>)
            setDeleteOpen(false)
            fetchList()
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถลบได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        } finally {
            setSubmitting(false)
        }
    }

    const columns: ColumnDef<ProductionRecipeListItem>[] = [
        {
            header: 'ชื่อสูตร',
            accessorKey: 'recipe_name',
            cell: ({ row }) => (
                <div className="font-medium">{row.original.recipe_name}</div>
            ),
        },
        {
            header: 'ปริมาณที่ได้',
            accessorKey: 'output_quantity',
            cell: ({ row }) => `${row.original.output_quantity} ${row.original.output_unit}`,
        },
        {
            header: 'ต้นทุนรวม',
            accessorKey: 'total_cost',
            cell: ({ row }) => `${row.original.total_cost.toFixed(2)} บาท`,
        },
        {
            header: 'ต้นทุนต่อหน่วย',
            accessorKey: 'cost_per_unit',
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold">{row.original.cost_per_unit.toFixed(2)} บาท/{row.original.output_unit}</div>
                </div>
            ),
        },
        {
            header: '',
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex gap-2 justify-end">
                    <Button
                        size="sm"
                        variant="plain"
                        icon={<TbEye />}
                        onClick={() => openDetail(row.original)}
                    >
                        จัดการส่วนผสม
                    </Button>
                    <Button
                        size="sm"
                        variant="plain"
                        icon={<TbEdit />}
                        onClick={() => openEdit(row.original)}
                    />
                    <Button
                        size="sm"
                        variant="plain"
                        icon={<TbTrash />}
                        onClick={() => openDelete(row.original)}
                    />
                </div>
            ),
        },
    ]

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-semibold">🍲 สูตรหม้อ / สูตรผลิต</h4>
                    <Button icon={<TbPlus />} onClick={openCreate}>
                        สร้างสูตรใหม่
                    </Button>
                </div>

                <div className="flex gap-2 mb-4">
                    <Input
                        placeholder="ค้นหาสูตร..."
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
                    onPaginationChange={(page) => setPageIndex(page)}
                    onSelectChange={(value) => {
                        setPageSize(value)
                        setPageIndex(1)
                    }}
                />
            </AdaptiveCard>

            {/* Create Dialog */}
            <Dialog isOpen={createOpen} onClose={() => setCreateOpen(false)}>
                <h5 className="text-lg font-semibold mb-4">สร้างสูตรหม้อใหม่</h5>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">ชื่อสูตร</label>
                        <Input
                            placeholder="เช่น ชาไทยหม้อใหญ่"
                            value={formData.recipe_name}
                            onChange={(e) => setFormData({ ...formData, recipe_name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">ปริมาณที่ได้</label>
                        <Input
                            type="number"
                            placeholder="เช่น 306.5"
                            value={formData.output_quantity}
                            onChange={(e) => setFormData({ ...formData, output_quantity: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">หน่วย</label>
                        <Input
                            placeholder="เช่น ลิตร, กก., ชิ้น"
                            value={formData.output_unit}
                            onChange={(e) => setFormData({ ...formData, output_unit: e.target.value })}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="plain" onClick={() => setCreateOpen(false)}>
                        ยกเลิก
                    </Button>
                    <Button variant="solid" onClick={handleCreate} disabled={submitting}>
                        สร้าง
                    </Button>
                </div>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog isOpen={editOpen} onClose={() => setEditOpen(false)}>
                <h5 className="text-lg font-semibold mb-4">แก้ไขสูตรหม้อ</h5>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">ชื่อสูตร</label>
                        <Input
                            value={formData.recipe_name}
                            onChange={(e) => setFormData({ ...formData, recipe_name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">ปริมาณที่ได้</label>
                        <Input
                            type="number"
                            value={formData.output_quantity}
                            onChange={(e) => setFormData({ ...formData, output_quantity: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">หน่วย</label>
                        <Input
                            value={formData.output_unit}
                            onChange={(e) => setFormData({ ...formData, output_unit: e.target.value })}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="plain" onClick={() => setEditOpen(false)}>
                        ยกเลิก
                    </Button>
                    <Button variant="solid" onClick={handleEdit} disabled={submitting}>
                        บันทึก
                    </Button>
                </div>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)}>
                <h5 className="text-lg font-semibold mb-4">ยืนยันการลบ</h5>
                <p className="mb-4">
                    ต้องการลบสูตร "{selectedRecipe?.recipe_name}" ใช่หรือไม่?
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="plain" onClick={() => setDeleteOpen(false)}>
                        ยกเลิก
                    </Button>
                    <Button variant="solid" onClick={handleDelete} disabled={submitting}>
                        ลบ
                    </Button>
                </div>
            </Dialog>

            {/* Detail Dialog */}
            {selectedRecipe && (
                <ProductionRecipeDetail
                    open={detailOpen}
                    recipeId={selectedRecipe.id}
                    recipeName={selectedRecipe.recipe_name}
                    onClose={() => {
                        setDetailOpen(false)
                        setSelectedRecipe(null)
                    }}
                    onSuccess={fetchList}
                />
            )}
        </Container>
    )
}

export default ProductionRecipeList
