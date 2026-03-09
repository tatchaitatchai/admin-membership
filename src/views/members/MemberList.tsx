import { useState, useEffect, useCallback, useMemo } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Switcher from '@/components/ui/Switcher'
import Tag from '@/components/ui/Tag'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'
import { TbPlus, TbEdit, TbSearch, TbStar, TbEye } from 'react-icons/tb'
import {
    apiListCustomers,
    apiCreateCustomer,
    apiUpdateCustomer,
    apiGetCustomerPoints,
} from '@/services/CustomerManagementService'
import type {
    CustomerListItem,
    CustomerPointsSummary,
} from '@/services/CustomerManagementService'
import { getErrorMessage } from '@/utils/errorHandler'

const MemberList = () => {
    const [customers, setCustomers] = useState<CustomerListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState('')

    // Toggle active
    const [toggleOpen, setToggleOpen] = useState(false)
    const [toggleTarget, setToggleTarget] = useState<CustomerListItem | null>(null)

    // Create / Edit dialog
    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<CustomerListItem | null>(null)
    const [formData, setFormData] = useState({
        customer_code: '',
        full_name: '',
        phone: '',
        email: '',
    })
    const [formSubmitting, setFormSubmitting] = useState(false)

    // Points detail dialog
    const [pointsOpen, setPointsOpen] = useState(false)
    const [pointsTarget, setPointsTarget] = useState<CustomerListItem | null>(null)
    const [pointsData, setPointsData] = useState<CustomerPointsSummary[]>([])
    const [pointsLoading, setPointsLoading] = useState(false)

    const fetchCustomers = useCallback(async () => {
        setLoading(true)
        try {
            const resp = await apiListCustomers({
                page: pageIndex,
                limit: pageSize,
                search: search || undefined,
            })
            setCustomers(resp.data ?? [])
            setTotal(resp.total)
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถโหลดรายการสมาชิกได้
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, search])

    useEffect(() => {
        fetchCustomers()
    }, [fetchCustomers])

    // ── Toggle Active ────────────────────────────────────────────

    const openToggleConfirm = (item: CustomerListItem) => {
        setToggleTarget(item)
        setToggleOpen(true)
    }

    const handleToggleConfirm = async () => {
        if (!toggleTarget) return
        try {
            await apiUpdateCustomer(toggleTarget.id, {
                is_active: !toggleTarget.is_active,
            })
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    เปลี่ยนสถานะสมาชิกเรียบร้อยแล้ว
                </Notification>,
            )
            setToggleOpen(false)
            setToggleTarget(null)
            fetchCustomers()
        } catch (err: any) {
            const errorMessage = await getErrorMessage(
                err,
                'ไม่สามารถเปลี่ยนสถานะได้',
            )
            toast.push(
                <Notification type="danger" title="Error">
                    {errorMessage}
                </Notification>,
            )
        }
    }

    // ── Create / Edit ────────────────────────────────────────────

    const openCreate = () => {
        setEditTarget(null)
        setFormData({ customer_code: '', full_name: '', phone: '', email: '' })
        setFormOpen(true)
    }

    const openEdit = (item: CustomerListItem) => {
        setEditTarget(item)
        setFormData({
            customer_code: item.customer_code || '',
            full_name: item.full_name || '',
            phone: item.phone || '',
            email: item.email || '',
        })
        setFormOpen(true)
    }

    const handleFormSubmit = async () => {
        if (!formData.full_name.trim()) {
            toast.push(
                <Notification type="warning" title="แจ้งเตือน">
                    กรุณากรอกชื่อสมาชิก
                </Notification>,
            )
            return
        }
        setFormSubmitting(true)
        try {
            if (editTarget) {
                await apiUpdateCustomer(editTarget.id, {
                    customer_code: formData.customer_code,
                    full_name: formData.full_name,
                    phone: formData.phone,
                    email: formData.email,
                })
                toast.push(
                    <Notification type="success" title="สำเร็จ">
                        แก้ไขข้อมูลสมาชิกเรียบร้อยแล้ว
                    </Notification>,
                )
            } else {
                await apiCreateCustomer({
                    customer_code: formData.customer_code || undefined,
                    full_name: formData.full_name,
                    phone: formData.phone || undefined,
                    email: formData.email || undefined,
                })
                toast.push(
                    <Notification type="success" title="สำเร็จ">
                        เพิ่มสมาชิกเรียบร้อยแล้ว
                    </Notification>,
                )
            }
            setFormOpen(false)
            fetchCustomers()
        } catch (err: any) {
            const errorMessage = await getErrorMessage(
                err,
                editTarget
                    ? 'ไม่สามารถแก้ไขข้อมูลได้'
                    : 'ไม่สามารถเพิ่มสมาชิกได้',
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

    // ── Points Detail ────────────────────────────────────────────

    const openPointsDetail = async (item: CustomerListItem) => {
        setPointsTarget(item)
        setPointsOpen(true)
        setPointsLoading(true)
        try {
            const resp = await apiGetCustomerPoints(item.id)
            setPointsData(resp.data ?? [])
        } catch (err: any) {
            const errorMessage = await getErrorMessage(
                err,
                'ไม่สามารถโหลดข้อมูลแต้มได้',
            )
            toast.push(
                <Notification type="danger" title="Error">
                    {errorMessage}
                </Notification>,
            )
        } finally {
            setPointsLoading(false)
        }
    }

    // ── Columns ──────────────────────────────────────────────────

    const columns: ColumnDef<CustomerListItem>[] = useMemo(
        () => [
            {
                header: 'รหัสสมาชิก',
                accessorKey: 'customer_code',
                cell: (props) => (
                    <span className="font-mono text-sm">
                        {props.row.original.customer_code || (
                            <span className="text-gray-400">-</span>
                        )}
                    </span>
                ),
            },
            {
                header: 'ชื่อ',
                accessorKey: 'full_name',
                cell: (props) => (
                    <span className="font-semibold">
                        {props.row.original.full_name || (
                            <span className="text-gray-400">ไม่ระบุ</span>
                        )}
                    </span>
                ),
            },
            {
                header: 'เบอร์โทร',
                accessorKey: 'phone',
                enableSorting: false,
                cell: (props) => (
                    <span>
                        {props.row.original.phone || (
                            <span className="text-gray-400">-</span>
                        )}
                    </span>
                ),
            },
            {
                header: 'อีเมล',
                accessorKey: 'email',
                enableSorting: false,
                cell: (props) => (
                    <span>
                        {props.row.original.email || (
                            <span className="text-gray-400">-</span>
                        )}
                    </span>
                ),
            },
            {
                header: 'แต้มสะสม',
                accessorKey: 'total_points',
                enableSorting: false,
                cell: (props) => {
                    const pts = props.row.original.total_points
                    return pts > 0 ? (
                        <Tag className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-0 gap-1">
                            <TbStar className="text-sm" />
                            {pts.toLocaleString()}
                        </Tag>
                    ) : (
                        <span className="text-gray-400">0</span>
                    )
                },
            },
            {
                header: 'สถานะ',
                accessorKey: 'is_active',
                enableSorting: false,
                cell: (props) => (
                    <Switcher
                        checked={props.row.original.is_active}
                        onChange={() =>
                            openToggleConfirm(props.row.original)
                        }
                    />
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
                                icon={<TbEye />}
                                title="ดูแต้มสะสม"
                                onClick={() => openPointsDetail(item)}
                            />
                            <Button
                                size="xs"
                                variant="plain"
                                icon={<TbEdit />}
                                title="แก้ไข"
                                onClick={() => openEdit(item)}
                            />
                        </div>
                    )
                },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    )

    // ── Pagination handlers ──────────────────────────────────────

    const handlePaginationChange = (page: number) => setPageIndex(page)
    const handleSelectChange = (value: number) => {
        setPageSize(value)
        setPageIndex(1)
    }
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        setPageIndex(1)
    }

    // ── Render ───────────────────────────────────────────────────

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3>จัดการสมาชิก</h3>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<TbPlus />}
                            onClick={openCreate}
                        >
                            เพิ่มสมาชิก
                        </Button>
                    </div>
                    <div className="flex justify-end">
                        <Input
                            className="max-w-[300px]"
                            size="sm"
                            placeholder="ค้นหาชื่อ, เบอร์, รหัส, อีเมล..."
                            prefix={<TbSearch className="text-lg" />}
                            value={search}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <DataTable
                        columns={columns}
                        data={customers}
                        loading={loading}
                        noData={!loading && customers.length === 0}
                        pagingData={{
                            total,
                            pageIndex,
                            pageSize,
                        }}
                        onPaginationChange={handlePaginationChange}
                        onSelectChange={handleSelectChange}
                    />
                </div>
            </AdaptiveCard>

            {/* ── Toggle Active Confirm ── */}
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
                            ? ' ระงับการใช้งาน'
                            : ' เปิดใช้งาน'}
                        {' '}สมาชิก{' '}
                        <strong>
                            {toggleTarget.full_name ||
                                toggleTarget.customer_code ||
                                `#${toggleTarget.id}`}
                        </strong>{' '}
                        หรือไม่?
                    </p>
                )}
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setToggleOpen(false)}>
                        ยกเลิก
                    </Button>
                    <Button variant="solid" onClick={handleToggleConfirm}>
                        ยืนยัน
                    </Button>
                </div>
            </Dialog>

            {/* ── Create / Edit Dialog ── */}
            <Dialog
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
                onRequestClose={() => setFormOpen(false)}
            >
                <h5 className="mb-4">
                    {editTarget ? 'แก้ไขสมาชิก' : 'เพิ่มสมาชิกใหม่'}
                </h5>
                <div className="flex flex-col gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            ชื่อ-นามสกุล <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="ชื่อ-นามสกุล"
                            value={formData.full_name}
                            onChange={(e) =>
                                setFormData((p) => ({
                                    ...p,
                                    full_name: e.target.value,
                                }))
                            }
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            รหัสสมาชิก
                        </label>
                        <Input
                            placeholder="รหัสสมาชิก (ไม่บังคับ)"
                            value={formData.customer_code}
                            onChange={(e) =>
                                setFormData((p) => ({
                                    ...p,
                                    customer_code: e.target.value,
                                }))
                            }
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            เบอร์โทร
                        </label>
                        <Input
                            placeholder="เบอร์โทร"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData((p) => ({
                                    ...p,
                                    phone: e.target.value,
                                }))
                            }
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            อีเมล
                        </label>
                        <Input
                            placeholder="อีเมล"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData((p) => ({
                                    ...p,
                                    email: e.target.value,
                                }))
                            }
                        />
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

            {/* ── Points Detail Dialog ── */}
            <Dialog
                isOpen={pointsOpen}
                onClose={() => setPointsOpen(false)}
                onRequestClose={() => setPointsOpen(false)}
                width={600}
            >
                <h5 className="mb-4">
                    แต้มสะสมของ{' '}
                    <strong>
                        {pointsTarget?.full_name ||
                            pointsTarget?.customer_code ||
                            `#${pointsTarget?.id}`}
                    </strong>
                </h5>
                {pointsLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <span className="text-gray-400">กำลังโหลด...</span>
                    </div>
                ) : pointsData.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <span className="text-gray-400">
                            ยังไม่มีแต้มสะสม
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
                        {pointsData.map((pt) => (
                            <div
                                key={pt.product_id}
                                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                            >
                                {pt.image_path ? (
                                    <img
                                        src={pt.image_path}
                                        alt={pt.product_name}
                                        className="w-10 h-10 rounded-lg object-cover border"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
                                        ไม่มีรูป
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                        {pt.product_name}
                                    </div>
                                    {pt.category_name && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {pt.category_name}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                                        <TbStar className="text-sm" />
                                        {pt.points.toLocaleString()}
                                    </div>
                                    {pt.points_to_redeem > 0 && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            แลกที่ {pt.points_to_redeem} แต้ม
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-400">
                                        สะสมรวม{' '}
                                        {pt.total_points.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex justify-end mt-4">
                    <Button onClick={() => setPointsOpen(false)}>ปิด</Button>
                </div>
            </Dialog>
        </Container>
    )
}

export default MemberList
