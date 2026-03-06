import { useState, useEffect, useCallback, useMemo } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Tag from '@/components/ui/Tag'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'
import { TbPlus, TbEdit, TbTrash, TbSearch } from 'react-icons/tb'
import {
    apiListCategoriesPaginated,
    apiCreateCategory,
    apiUpdateCategory,
    apiDeleteCategory,
} from '@/services/ProductService'
import type { CategoryListItem } from '@/services/ProductService'
import { getErrorMessage } from '@/utils/errorHandler'

const CategoryList = () => {
    const [categories, setCategories] = useState<CategoryListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState('')

    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<CategoryListItem | null>(null)
    const [formValue, setFormValue] = useState('')
    const [formSubmitting, setFormSubmitting] = useState(false)

    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<CategoryListItem | null>(null)

    const fetchCategories = useCallback(async () => {
        setLoading(true)
        try {
            const resp = await apiListCategoriesPaginated({
                page: pageIndex,
                limit: pageSize,
                search: search || undefined,
            })
            setCategories(resp.data ?? [])
            setTotal(resp.total)
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถโหลดรายการหมวดหมู่ได้
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, search])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    const openCreate = () => {
        setEditTarget(null)
        setFormValue('')
        setFormOpen(true)
    }

    const openEdit = (item: CategoryListItem) => {
        setEditTarget(item)
        setFormValue(item.category_name)
        setFormOpen(true)
    }

    const handleFormSubmit = async () => {
        if (!formValue.trim()) {
            toast.push(
                <Notification type="warning" title="แจ้งเตือน">
                    กรุณากรอกชื่อหมวดหมู่
                </Notification>,
            )
            return
        }

        setFormSubmitting(true)
        try {
            if (editTarget) {
                await apiUpdateCategory(editTarget.id, { category_name: formValue.trim() })
                toast.push(
                    <Notification type="success" title="สำเร็จ">
                        แก้ไขหมวดหมู่แล้ว
                    </Notification>,
                )
            } else {
                await apiCreateCategory({ category_name: formValue.trim() })
                toast.push(
                    <Notification type="success" title="สำเร็จ">
                        เพิ่มหมวดหมู่แล้ว
                    </Notification>,
                )
            }
            setFormOpen(false)
            setFormValue('')
            setEditTarget(null)
            fetchCategories()
        } catch (err: any) {
            const errorMessage = await getErrorMessage(
                err,
                editTarget ? 'ไม่สามารถแก้ไขหมวดหมู่ได้' : 'ไม่สามารถเพิ่มหมวดหมู่ได้',
            )
            toast.push(
                <Notification type="danger" title="Error">
                    {errorMessage}
                </Notification>,
            )
        } finally {
            setFormSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            await apiDeleteCategory(deleteTarget.id)
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    ลบหมวดหมู่แล้ว
                </Notification>,
            )
            setDeleteOpen(false)
            setDeleteTarget(null)
            fetchCategories()
        } catch (err: any) {
            const errorMessage = await getErrorMessage(err, 'ไม่สามารถลบหมวดหมู่ได้')
            toast.push(
                <Notification type="danger" title="Error">
                    {errorMessage}
                </Notification>,
            )
        }
    }

    const columns: ColumnDef<CategoryListItem>[] = useMemo(
        () => [
            {
                header: 'ชื่อหมวดหมู่',
                accessorKey: 'category_name',
                cell: (props) => (
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {props.row.original.category_name}
                    </span>
                ),
            },
            {
                header: 'จำนวนสินค้า',
                accessorKey: 'product_count',
                enableSorting: false,
                cell: (props) => (
                    <Tag className="bg-blue-100 text-blue-600 border-0">
                        {props.row.original.product_count} รายการ
                    </Tag>
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
                        <h3>หมวดหมู่สินค้า</h3>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<TbPlus />}
                            onClick={openCreate}
                        >
                            เพิ่มหมวดหมู่
                        </Button>
                    </div>
                    <div className="flex justify-end">
                        <Input
                            className="max-w-[300px]"
                            size="sm"
                            placeholder="ค้นหาหมวดหมู่..."
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
                        data={categories}
                        loading={loading}
                        noData={!loading && categories.length === 0}
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

            <Dialog
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
                onRequestClose={() => setFormOpen(false)}
            >
                <h5 className="mb-4">
                    {editTarget ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่'}
                </h5>
                <Input
                    placeholder="ชื่อหมวดหมู่"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleFormSubmit()
                    }}
                    autoFocus
                />
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setFormOpen(false)}>ยกเลิก</Button>
                    <Button
                        variant="solid"
                        loading={formSubmitting}
                        onClick={handleFormSubmit}
                    >
                        บันทึก
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
                    ต้องการลบหมวดหมู่ <strong>{deleteTarget?.category_name}</strong> หรือไม่?
                </p>
                {deleteTarget && deleteTarget.product_count > 0 && (
                    <p className="text-sm text-amber-600 mt-1">
                        หมวดหมู่นี้มีสินค้า {deleteTarget.product_count} รายการ
                    </p>
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

export default CategoryList
