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
    TbRefresh,
    TbShoppingCart,
    TbUser,
    TbBuildingStore,
    TbCalendar,
    TbCoins,
    TbX,
} from 'react-icons/tb'
import { apiListOrders, apiGetOrderDetail } from '@/services/OrderManagementService'
import type { OrderListItem, OrderDetail } from '@/services/OrderManagementService'
import { apiListBranchesPaginated } from '@/services/BranchManagementService'
import type { BranchListItem } from '@/services/BranchManagementService'
import { getErrorMessage } from '@/utils/errorHandler'

const STATUS_MAP: Record<string, { label: string; className: string }> = {
    PAID: {
        label: 'สำเร็จ',
        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-0',
    },
    CANCELLED: {
        label: 'ยกเลิก',
        className: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-0',
    },
    VOID: {
        label: 'โมฆะ',
        className: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300 border-0',
    },
    OPEN: {
        label: 'กำลังดำเนินการ',
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-0',
    },
}

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
    { value: '', label: 'ทุกสถานะ' },
    { value: 'PAID', label: 'สำเร็จ' },
    { value: 'CANCELLED', label: 'ยกเลิก' },
]

const PAYMENT_METHOD_MAP: Record<string, string> = {
    CASH: 'เงินสด',
    TRANSFER: 'โอนเงิน',
    QR: 'QR Code',
    CARD: 'บัตรเครดิต',
    OTHER: 'อื่นๆ',
}

const OrderList = () => {
    const [data, setData] = useState<OrderListItem[]>([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState('')
    const [branchFilter, setBranchFilter] = useState<number>(0)
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [branches, setBranches] = useState<BranchListItem[]>([])
    const [detailDialog, setDetailDialog] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null)
    const [detailLoading, setDetailLoading] = useState(false)

    // Fetch branches for filter
    const fetchBranches = useCallback(async () => {
        try {
            const resp = await apiListBranchesPaginated({ limit: 100 })
            setBranches(resp.data)
        } catch {
            // Non-critical
        }
    }, [])

    useEffect(() => {
        fetchBranches()
    }, [fetchBranches])

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const params: {
                page: number
                limit: number
                search?: string
                branch_id?: number
                status?: string
            } = { page: pageIndex, limit: pageSize }

            if (search) params.search = search
            if (branchFilter && branchFilter !== 0) params.branch_id = branchFilter
            if (statusFilter) params.status = statusFilter

            const resp = await apiListOrders(params)
            setData(resp.data || [])
            setTotal(resp.total || 0)
        } catch (err) {
            console.error('Error fetching orders:', err)
            const msg = await getErrorMessage(err, 'ไม่สามารถโหลดข้อมูลได้')
            toast.push(
                <Notification type="danger" title="Error">
                    {msg}
                </Notification>,
            )
            // Reset data on error
            setData([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, search, branchFilter, statusFilter])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleViewDetail = async (order: OrderListItem) => {
        setDetailLoading(true)
        setDetailDialog(true)
        try {
            const detail = await apiGetOrderDetail(order.id)
            setSelectedOrder(detail)
        } catch (err) {
            const msg = await getErrorMessage(err, 'ไม่สามารถโหลดข้อมูลได้')
            toast.push(
                <Notification type="danger" title="Error">
                    {msg}
                </Notification>,
            )
            setDetailDialog(false)
        } finally {
            setDetailLoading(false)
        }
    }

    const columns: ColumnDef<OrderListItem>[] = useMemo(
        () => [
            {
                header: 'เลขที่',
                accessorKey: 'id',
                cell: ({ row }) => (
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                        #{row.original.id}
                    </span>
                ),
            },
            {
                header: 'สาขา',
                accessorKey: 'branch_name',
            },
            {
                header: 'ลูกค้า',
                accessorKey: 'customer_name',
                cell: ({ row }) => (
                    <div>
                        {row.original.customer_name ? (
                            <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {row.original.customer_name}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {row.original.customer_phone}
                                </div>
                            </div>
                        ) : (
                            <span className="text-gray-400">ลูกค้าทั่วไป</span>
                        )}
                    </div>
                ),
            },
            {
                header: 'พนักงาน',
                accessorKey: 'staff_email',
            },
            {
                header: 'ยอดรวม',
                accessorKey: 'total_price',
                cell: ({ row }) => (
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                        ฿{row.original.total_price.toLocaleString('th-TH', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </span>
                ),
            },
            {
                header: 'สถานะ',
                accessorKey: 'status',
                cell: ({ row }) => {
                    const status = STATUS_MAP[row.original.status] || {
                        label: row.original.status,
                        className: 'bg-gray-100 text-gray-700',
                    }
                    return <Tag className={status.className}>{status.label}</Tag>
                },
            },
            {
                header: 'วันที่',
                accessorKey: 'created_at',
                cell: ({ row }) => {
                    const date = new Date(row.original.created_at)
                    return (
                        <div className="text-sm text-gray-500">
                            <div>{date.toLocaleDateString('th-TH')}</div>
                            <div className="text-xs">{date.toLocaleTimeString('th-TH')}</div>
                        </div>
                    )
                },
            },
            {
                header: '',
                id: 'actions',
                cell: ({ row }) => (
                    <Button
                        size="sm"
                        variant="plain"
                        icon={<TbEye />}
                        onClick={() => handleViewDetail(row.original)}
                    >
                        ดูรายละเอียด
                    </Button>
                ),
            },
        ],
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
    const handleBranchChange = (opt: any) => {
        setBranchFilter(opt?.value ?? 0)
        setPageIndex(1)
    }
    const handleStatusChange = (opt: any) => {
        setStatusFilter(opt?.value ?? '')
        setPageIndex(1)
    }

    const branchOptions = useMemo(
        () => [
            { value: 0, label: 'ทุกสาขา' },
            ...branches.map((b) => ({ value: b.id, label: b.branch_name })),
        ],
        [branches],
    )

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3>รายการคำสั่งซื้อ</h3>
                        <Button
                            variant="plain"
                            size="sm"
                            icon={<TbRefresh />}
                            onClick={fetchData}
                            loading={loading}
                        >
                            รีเฟรช
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <div className="flex-1 min-w-[200px]">
                            <Input
                                placeholder="ค้นหาเลขที่, ชื่อลูกค้า, เบอร์โทร..."
                                prefix={<TbSearch className="text-lg" />}
                                value={search}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <div className="w-48">
                            <Select
                                placeholder="กรองตามสาขา"
                                options={branchOptions as any}
                                value={branchOptions.find((o) => o.value === branchFilter) as any}
                                onChange={handleBranchChange}
                            />
                        </div>
                        <div className="w-40">
                            <Select
                                placeholder="กรองตามสถานะ"
                                options={STATUS_OPTIONS as any}
                                value={STATUS_OPTIONS.find((o: any) => o.value === statusFilter) as any}
                                onChange={handleStatusChange}
                            />
                        </div>
                    </div>
                    
                    {/* Error fallback */}
                    {!loading && data.length === 0 && total === 0 && search ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="text-gray-400 mb-2">
                                <TbSearch className="text-4xl mx-auto mb-2" />
                            </div>
                            <div className="text-gray-600 font-medium">ไม่พบรายการคำสั่งซื้อ</div>
                            <div className="text-gray-400 text-sm mt-1">
                                สำหรับคำค้นหา "{search}"
                            </div>
                            <Button 
                                variant="plain" 
                                size="sm" 
                                onClick={() => setSearch('')}
                                className="mt-3"
                            >
                                ล้างการค้นหา
                            </Button>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={data}
                            loading={loading}
                            noData={!loading && data.length === 0}
                            pagingData={{ total, pageIndex, pageSize }}
                            onPaginationChange={handlePaginationChange}
                            onSelectChange={handleSelectChange}
                        />
                    )}
                </div>
            </AdaptiveCard>

            {/* Detail Dialog */}
            <Dialog
                isOpen={detailDialog}
                onClose={() => setDetailDialog(false)}
                onRequestClose={() => setDetailDialog(false)}
                width={800}
            >
                <div className="flex items-center justify-between mb-4">
                    <h5 className="mb-0">รายละเอียดคำสั่งซื้อ #{selectedOrder?.id || ''}</h5>
                </div>
                {detailLoading ? (
                    <div className="py-12 text-center text-gray-400">กำลังโหลด...</div>
                ) : selectedOrder ? (
                    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                        {/* Header Info */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    <TbBuildingStore />
                                    สาขา
                                </div>
                                <div className="font-medium">{selectedOrder.branch_name}</div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    <TbCalendar />
                                    วันที่
                                </div>
                                <div className="font-medium">
                                    {new Date(selectedOrder.created_at).toLocaleString('th-TH')}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    <TbUser />
                                    พนักงานขาย
                                </div>
                                <div className="font-medium">{selectedOrder.staff_email}</div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    <TbShoppingCart />
                                    สถานะ
                                </div>
                                <div>
                                    <Tag
                                        className={
                                            STATUS_MAP[selectedOrder.status]?.className ||
                                            'bg-gray-100 text-gray-700'
                                        }
                                    >
                                        {STATUS_MAP[selectedOrder.status]?.label ||
                                            selectedOrder.status}
                                    </Tag>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        {selectedOrder.customer_id && (
                            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                    <TbUser />
                                    ข้อมูลลูกค้า
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">ชื่อ:</span>{' '}
                                        <span className="font-medium">
                                            {selectedOrder.customer_name}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">เบอร์โทร:</span>{' '}
                                        <span className="font-medium">
                                            {selectedOrder.customer_phone || '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">รหัสลูกค้า:</span>{' '}
                                        <span className="font-medium">
                                            {selectedOrder.customer_code || '-'}
                                        </span>
                                    </div>
                                </div>

                                {/* Customer Points */}
                                {selectedOrder.customer_points &&
                                    selectedOrder.customer_points.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                            <TbCoins />
                                            แต้มสะสมปัจจุบัน
                                        </h5>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedOrder.customer_points.map((pt) => (
                                                <Tag
                                                    key={pt.group_id}
                                                    className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-0"
                                                >
                                                    {pt.group_name}: {pt.points} แต้ม
                                                </Tag>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Order Items */}
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                <TbShoppingCart />
                                รายการสินค้า
                            </h4>
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">
                                            สินค้า
                                        </th>
                                        <th className="px-3 py-2 text-right text-gray-500 font-medium">
                                            จำนวน
                                        </th>
                                        <th className="px-3 py-2 text-right text-gray-500 font-medium">
                                            ราคา/ชิ้น
                                        </th>
                                        <th className="px-3 py-2 text-right text-gray-500 font-medium">
                                            รวม
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {selectedOrder.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-3 py-2">{item.product_name}</td>
                                            <td className="px-3 py-2 text-right">{item.quantity}</td>
                                            <td className="px-3 py-2 text-right">
                                                ฿{item.price.toLocaleString('th-TH', {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </td>
                                            <td className="px-3 py-2 text-right font-medium">
                                                ฿
                                                {(item.price * item.quantity).toLocaleString(
                                                    'th-TH',
                                                    { minimumFractionDigits: 2 },
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Payments */}
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                การชำระเงิน
                            </h4>
                            <div className="space-y-2">
                                {selectedOrder.payments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="text-gray-500">
                                            {PAYMENT_METHOD_MAP[payment.method] || payment.method}
                                        </span>
                                        <span className="font-medium">
                                            ฿
                                            {payment.amount.toLocaleString('th-TH', {
                                                minimumFractionDigits: 2,
                                            })}
                                        </span>
                                    </div>
                                ))}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">ยอดรวม:</span>
                                        <span className="font-medium">
                                            ฿
                                            {selectedOrder.subtotal.toLocaleString('th-TH', {
                                                minimumFractionDigits: 2,
                                            })}
                                        </span>
                                    </div>
                                    {selectedOrder.discount_total > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">ส่วนลด:</span>
                                            <span className="font-medium text-red-500">
                                                -฿
                                                {selectedOrder.discount_total.toLocaleString(
                                                    'th-TH',
                                                    { minimumFractionDigits: 2 },
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-base font-bold mt-1">
                                        <span>ยอดสุทธิ:</span>
                                        <span>
                                            ฿
                                            {selectedOrder.total_price.toLocaleString('th-TH', {
                                                minimumFractionDigits: 2,
                                            })}
                                        </span>
                                    </div>
                                    {selectedOrder.change_amount > 0 && (
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>เงินทอน:</span>
                                            <span>
                                                ฿
                                                {selectedOrder.change_amount.toLocaleString(
                                                    'th-TH',
                                                    { minimumFractionDigits: 2 },
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Promotions */}
                        {selectedOrder.promotions && selectedOrder.promotions.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                    โปรโมชั่นที่ใช้
                                </h4>
                                <div className="space-y-2">
                                    {selectedOrder.promotions.map((promo) => (
                                        <div
                                            key={promo.id}
                                            className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                                        >
                                            <span>{promo.promotion_name}</span>
                                            <span className="font-medium text-red-500">
                                                -฿
                                                {promo.discount_amount.toLocaleString('th-TH', {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cancel Info */}
                        {(selectedOrder.status === 'CANCELLED' || selectedOrder.status === 'VOID') &&
                            selectedOrder.cancel_reason && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">
                                    สาเหตุการยกเลิก
                                </h4>
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    {selectedOrder.cancel_reason}
                                </p>
                                {selectedOrder.cancelled_by && (
                                    <p className="text-xs text-red-500 mt-1">
                                        ยกเลิกโดย: {selectedOrder.cancelled_by}
                                        {selectedOrder.cancelled_at &&
                                            ` เมื่อ ${new Date(selectedOrder.cancelled_at).toLocaleString('th-TH')}`}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                ) : null}

                <div className="mt-6 text-right">
                    <Button variant="plain" onClick={() => setDetailDialog(false)}>
                        <TbX className="mr-1" />
                        ปิด
                    </Button>
                </div>
            </Dialog>
        </Container>
    )
}

export default OrderList
