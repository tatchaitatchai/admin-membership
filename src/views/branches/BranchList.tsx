import { useState, useEffect, useCallback } from 'react'
import {
    TbPlus,
    TbMapPin,
    TbEdit,
    TbTrash,
    TbUsers,
    TbPackage,
    TbSearch,
} from 'react-icons/tb'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Switcher from '@/components/ui/Switcher'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Pagination from '@/components/ui/Pagination'
import {
    apiListBranchesPaginated,
    apiCreateBranch,
    apiUpdateBranch,
    apiDeleteBranch,
} from '@/services/BranchManagementService'
import type { BranchListItem } from '@/services/BranchManagementService'
import { getErrorMessage } from '@/utils/errorHandler'

const BranchList = () => {
    const [items, setItems] = useState<BranchListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize] = useState(12)
    const [search, setSearch] = useState('')

    // Create dialog
    const [createOpen, setCreateOpen] = useState(false)
    const [createName, setCreateName] = useState('')
    const [createActive, setCreateActive] = useState(true)
    const [createSubmitting, setCreateSubmitting] = useState(false)

    // Edit dialog
    const [editOpen, setEditOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<BranchListItem | null>(null)
    const [editName, setEditName] = useState('')
    const [editActive, setEditActive] = useState(true)
    const [editSubmitting, setEditSubmitting] = useState(false)

    // Delete dialog (hard confirm)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<BranchListItem | null>(null)
    const [deleteConfirmText, setDeleteConfirmText] = useState('')
    const [deleteSubmitting, setDeleteSubmitting] = useState(false)

    // Toggle active confirm
    const [toggleOpen, setToggleOpen] = useState(false)
    const [toggleTarget, setToggleTarget] = useState<BranchListItem | null>(null)

    const fetchItems = useCallback(async () => {
        setLoading(true)
        try {
            const resp = await apiListBranchesPaginated({
                page: pageIndex,
                limit: pageSize,
                search: search || undefined,
            })
            setItems(resp.data ?? [])
            setTotal(resp.total)
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถโหลดรายการสาขาได้
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, search])

    useEffect(() => {
        fetchItems()
    }, [fetchItems])

    // --- Create ---
    const handleCreate = async () => {
        if (!createName.trim()) return
        setCreateSubmitting(true)
        try {
            await apiCreateBranch({
                branch_name: createName.trim(),
                is_active: createActive,
            })
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    เพิ่มสาขาแล้ว
                </Notification>,
            )
            setCreateOpen(false)
            setCreateName('')
            setCreateActive(true)
            fetchItems()
        } catch (err: any) {
            const errorMessage = await getErrorMessage(err, 'ไม่สามารถเพิ่มสาขาได้')
            toast.push(
                <Notification type="danger" title="Error">
                    {errorMessage}
                </Notification>,
            )
        } finally {
            setCreateSubmitting(false)
        }
    }

    // --- Edit ---
    const openEdit = (item: BranchListItem) => {
        setEditTarget(item)
        setEditName(item.branch_name)
        setEditActive(item.is_active)
        setEditOpen(true)
    }

    const handleEdit = async () => {
        if (!editTarget || !editName.trim()) return
        setEditSubmitting(true)
        try {
            await apiUpdateBranch(editTarget.id, {
                branch_name: editName.trim(),
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

    // --- Toggle Active ---
    const handleToggleConfirm = async () => {
        if (!toggleTarget) return
        try {
            await apiUpdateBranch(toggleTarget.id, {
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

    // --- Delete (hard confirm) ---
    const openDelete = (item: BranchListItem) => {
        setDeleteTarget(item)
        setDeleteConfirmText('')
        setDeleteOpen(true)
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleteSubmitting(true)
        try {
            await apiDeleteBranch(deleteTarget.id)
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    ลบสาขาแล้ว
                </Notification>,
            )
            setDeleteOpen(false)
            setDeleteTarget(null)
            fetchItems()
        } catch (err: any) {
            const errorMessage = await getErrorMessage(err, 'ไม่สามารถลบสาขาได้')
            toast.push(
                <Notification type="danger" title="Error">
                    {errorMessage}
                </Notification>,
            )
        } finally {
            setDeleteSubmitting(false)
        }
    }

    const canDelete =
        deleteTarget != null &&
        deleteConfirmText.trim() === deleteTarget.branch_name.trim()

    const totalPages = Math.ceil(total / pageSize)

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3>จัดการสาขา</h3>
                        <div className="flex items-center gap-2">
                            <Input
                                className="max-w-[250px]"
                                size="sm"
                                placeholder="ค้นหาสาขา..."
                                prefix={<TbSearch className="text-lg" />}
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                    setPageIndex(1)
                                }}
                            />
                            <Button
                                variant="solid"
                                size="sm"
                                icon={<TbPlus />}
                                onClick={() => {
                                    setCreateName('')
                                    setCreateActive(true)
                                    setCreateOpen(true)
                                }}
                            >
                                เพิ่มสาขา
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10 text-gray-400">
                            กำลังโหลด...
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex justify-center py-10 text-gray-400">
                            ไม่พบข้อมูลสาขา
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {items.map((b) => (
                                    <Card key={b.id} className="relative">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                                <TbMapPin className="text-xl" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                        b.is_active
                                                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                            : 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-400'
                                                    }`}
                                                >
                                                    {b.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                                </span>
                                            </div>
                                        </div>

                                        <h6 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                                            {b.branch_name}
                                        </h6>

                                        {b.is_shift_opened && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 mb-2">
                                                กะเปิดอยู่
                                            </span>
                                        )}

                                        <div className="flex flex-col gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-4">
                                            <span className="flex items-center gap-1.5">
                                                <TbUsers className="text-sm" /> พนักงาน{' '}
                                                {b.staff_count} คน
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <TbPackage className="text-sm" /> สินค้า{' '}
                                                {b.product_count} รายการ
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                                            <div className="flex items-center gap-1.5">
                                                <Switcher
                                                    checked={b.is_active}
                                                    onChange={() => {
                                                        setToggleTarget(b)
                                                        setToggleOpen(true)
                                                    }}
                                                />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="xs"
                                                    variant="plain"
                                                    icon={<TbEdit />}
                                                    onClick={() => openEdit(b)}
                                                />
                                                <Button
                                                    size="xs"
                                                    variant="plain"
                                                    className="text-red-500 hover:text-red-600"
                                                    icon={<TbTrash />}
                                                    onClick={() => openDelete(b)}
                                                />
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center mt-2">
                                    <Pagination
                                        currentPage={pageIndex}
                                        total={total}
                                        pageSize={pageSize}
                                        onChange={(page) => setPageIndex(page)}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </AdaptiveCard>

            {/* Create Dialog */}
            <Dialog
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                onRequestClose={() => setCreateOpen(false)}
            >
                <h5 className="mb-4">เพิ่มสาขาใหม่</h5>
                <div className="flex flex-col gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            ชื่อสาขา
                        </label>
                        <Input
                            placeholder="เช่น สาขาสยาม"
                            value={createName}
                            onChange={(e) => setCreateName(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Switcher
                            checked={createActive}
                            onChange={(val) => setCreateActive(val)}
                        />
                        <span>เปิดใช้งาน</span>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setCreateOpen(false)}>ยกเลิก</Button>
                    <Button
                        variant="solid"
                        loading={createSubmitting}
                        disabled={!createName.trim()}
                        onClick={handleCreate}
                    >
                        เพิ่มสาขา
                    </Button>
                </div>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                onRequestClose={() => setEditOpen(false)}
            >
                <h5 className="mb-4">แก้ไขสาขา</h5>
                {editTarget && (
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                ชื่อสาขา
                            </label>
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switcher
                                checked={editActive}
                                onChange={(val) => setEditActive(val)}
                            />
                            <span>เปิดใช้งาน</span>
                        </div>
                    </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setEditOpen(false)}>ยกเลิก</Button>
                    <Button
                        variant="solid"
                        loading={editSubmitting}
                        disabled={!editName.trim()}
                        onClick={handleEdit}
                    >
                        บันทึก
                    </Button>
                </div>
            </Dialog>

            {/* Toggle Active Confirm */}
            <Dialog
                isOpen={toggleOpen}
                onClose={() => setToggleOpen(false)}
                onRequestClose={() => setToggleOpen(false)}
            >
                <h5 className="mb-4">ยืนยันการเปลี่ยนสถานะ</h5>
                {toggleTarget && (
                    <p>
                        ต้องการ
                        {toggleTarget.is_active
                            ? ' ปิดใช้งาน'
                            : ' เปิดใช้งาน'}
                        {' '}สาขา{' '}
                        <strong>{toggleTarget.branch_name}</strong> หรือไม่?
                    </p>
                )}
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setToggleOpen(false)}>ยกเลิก</Button>
                    <Button variant="solid" onClick={handleToggleConfirm}>
                        ยืนยัน
                    </Button>
                </div>
            </Dialog>

            {/* Hard Delete Confirm Dialog */}
            <Dialog
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onRequestClose={() => setDeleteOpen(false)}
            >
                <h5 className="mb-4 text-red-600">⚠️ ลบสาขา</h5>
                {deleteTarget && (
                    <div className="flex flex-col gap-3">
                        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-3">
                            <p className="text-sm text-red-700 dark:text-red-400 font-medium mb-1">
                                การดำเนินการนี้ไม่สามารถย้อนกลับได้!
                            </p>
                            <p className="text-xs text-red-600 dark:text-red-400">
                                สาขา <strong>{deleteTarget.branch_name}</strong>{' '}
                                และข้อมูลที่เกี่ยวข้องจะถูกลบอย่างถาวร
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                พิมพ์ชื่อสาขา{' '}
                                <strong className="text-red-600">
                                    {deleteTarget.branch_name}
                                </strong>{' '}
                                เพื่อยืนยัน
                            </label>
                            <Input
                                placeholder={deleteTarget.branch_name}
                                value={deleteConfirmText}
                                onChange={(e) =>
                                    setDeleteConfirmText(e.target.value)
                                }
                            />
                            {deleteConfirmText.trim() !== '' &&
                                !canDelete && (
                                    <p className="text-xs text-red-500 mt-1">
                                        ชื่อสาขาไม่ตรง กรุณาพิมพ์ให้ถูกต้อง
                                    </p>
                                )}
                        </div>
                    </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setDeleteOpen(false)}>ยกเลิก</Button>
                    <Button
                        variant="solid"
                        color="red"
                        loading={deleteSubmitting}
                        disabled={!canDelete}
                        onClick={handleDelete}
                    >
                        ลบสาขาถาวร
                    </Button>
                </div>
            </Dialog>
        </Container>
    )
}

export default BranchList
