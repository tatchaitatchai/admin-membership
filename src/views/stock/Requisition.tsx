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
    TbPlus,
    TbSearch,
    TbEye,
    TbTrash,
    TbX,
    TbRefresh,
} from 'react-icons/tb'
import {
    apiListRequisitions,
    apiGetRequisition,
    apiCreateRequisition,
    apiUpdateRequisitionStatus,
    apiDeleteRequisition,
} from '@/services/StockRequisitionService'
import type {
    StockRequisitionListItem,
    StockRequisitionDetail,
} from '@/services/StockRequisitionService'
import { apiListBranchesPaginated } from '@/services/BranchManagementService'
import type { BranchListItem } from '@/services/BranchManagementService'
import { apiListProducts } from '@/services/ProductService'
import type { ProductFields } from '@/views/products/types'
import { getErrorMessage } from '@/utils/errorHandler'

const STATUS_MAP: Record<string, { label: string; className: string }> = {
    CREATED: {
        label: 'รอดำเนินการ',
        className:
            'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-0',
    },
    SENT: {
        label: 'จัดส่งแล้ว',
        className:
            'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-0',
    },
    RECEIVED: {
        label: 'รับแล้ว',
        className:
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-0',
    },
    CANCELLED: {
        label: 'ยกเลิก',
        className:
            'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-0',
    },
}

const STATUS_OPTIONS = [
    { value: '', label: 'ทุกสถานะ' },
    { value: 'CREATED', label: 'รอดำเนินการ' },
    { value: 'SENT', label: 'จัดส่งแล้ว' },
    { value: 'RECEIVED', label: 'รับแล้ว' },
    { value: 'CANCELLED', label: 'ยกเลิก' },
]

const STATUS_TRANSITIONS: Record<string, { value: string; label: string }[]> = {
    CREATED: [
        { value: 'SENT', label: 'จัดส่ง' },
        { value: 'CANCELLED', label: 'ยกเลิก' },
    ],
    SENT: [
        { value: 'RECEIVED', label: 'รับแล้ว' },
        { value: 'CANCELLED', label: 'ยกเลิก' },
    ],
}

type CreateItem = { product_id: number; product_name: string; send_count: number }

const Requisition = () => {
    // ── List state ───────────────────────────────────────────────
    const [items, setItems] = useState<StockRequisitionListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState('')
    const [filterBranch, setFilterBranch] = useState<number | undefined>()
    const [filterStatus, setFilterStatus] = useState<string>('')

    // ── Branch & product options ─────────────────────────────────
    const [branches, setBranches] = useState<BranchListItem[]>([])
    const [products, setProducts] = useState<ProductFields[]>([])

    // ── Detail dialog ────────────────────────────────────────────
    const [detailOpen, setDetailOpen] = useState(false)
    const [detailData, setDetailData] = useState<StockRequisitionDetail | null>(null)
    const [detailLoading, setDetailLoading] = useState(false)

    // ── Status change ────────────────────────────────────────────
    const [statusOpen, setStatusOpen] = useState(false)
    const [statusTarget, setStatusTarget] = useState<StockRequisitionListItem | null>(null)
    const [statusValue, setStatusValue] = useState('')

    // ── Delete ───────────────────────────────────────────────────
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<StockRequisitionListItem | null>(null)

    // ── Create dialog ────────────────────────────────────────────
    const [createOpen, setCreateOpen] = useState(false)
    const [createSubmitting, setCreateSubmitting] = useState(false)
    const [createToBranch, setCreateToBranch] = useState<number | null>(null)
    const [createFromBranch, setCreateFromBranch] = useState<number | null>(null)
    const [createNote, setCreateNote] = useState('')
    const [createItems, setCreateItems] = useState<CreateItem[]>([])
    const [addProductId, setAddProductId] = useState<number | null>(null)
    const [addSendCount, setAddSendCount] = useState<number>(1)

    // ── Load branches & products ─────────────────────────────────
    useEffect(() => {
        ;(async () => {
            try {
                const resp = await apiListBranchesPaginated({ limit: 100 })
                setBranches(resp.data ?? [])
            } catch { /* ignore */ }
        })()
        ;(async () => {
            try {
                const resp = await apiListProducts({ limit: 100 })
                setProducts(resp.data ?? [])
            } catch { /* ignore */ }
        })()
    }, [])

    // ── Fetch list ───────────────────────────────────────────────
    const fetchList = useCallback(async () => {
        setLoading(true)
        try {
            const resp = await apiListRequisitions({
                page: pageIndex,
                limit: pageSize,
                search: search || undefined,
                branch_id: filterBranch,
                status: filterStatus || undefined,
            })
            setItems(resp.data ?? [])
            setTotal(resp.total)
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถโหลดรายการเบิกสินค้าได้
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, search, filterBranch, filterStatus])

    useEffect(() => {
        fetchList()
    }, [fetchList])

    // ── View detail ──────────────────────────────────────────────
    const openDetail = async (item: StockRequisitionListItem) => {
        setDetailOpen(true)
        setDetailLoading(true)
        setDetailData(null)
        try {
            const resp = await apiGetRequisition(item.id)
            setDetailData(resp)
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถโหลดรายละเอียดได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        } finally {
            setDetailLoading(false)
        }
    }

    // ── Status change ────────────────────────────────────────────
    const openStatusChange = (item: StockRequisitionListItem, newStatus: string) => {
        setStatusTarget(item)
        setStatusValue(newStatus)
        setStatusOpen(true)
    }

    const handleStatusConfirm = async () => {
        if (!statusTarget) return
        try {
            await apiUpdateRequisitionStatus(statusTarget.id, statusValue)
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    เปลี่ยนสถานะเรียบร้อยแล้ว
                </Notification>,
            )
            setStatusOpen(false)
            setStatusTarget(null)
            fetchList()
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถเปลี่ยนสถานะได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        }
    }

    // ── Delete ───────────────────────────────────────────────────
    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return
        try {
            await apiDeleteRequisition(deleteTarget.id)
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    ลบรายการเบิกสินค้าแล้ว
                </Notification>,
            )
            setDeleteOpen(false)
            setDeleteTarget(null)
            fetchList()
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถลบรายการได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        }
    }

    // ── Create ───────────────────────────────────────────────────
    const openCreate = () => {
        setCreateToBranch(null)
        setCreateFromBranch(null)
        setCreateNote('')
        setCreateItems([])
        setAddProductId(null)
        setAddSendCount(1)
        setCreateOpen(true)
    }

    const addItemToCreate = () => {
        if (!addProductId || addSendCount < 1) return
        if (createItems.some((i) => i.product_id === addProductId)) {
            toast.push(
                <Notification type="warning" title="แจ้งเตือน">
                    สินค้านี้ถูกเพิ่มแล้ว
                </Notification>,
            )
            return
        }
        const product = products.find((p) => p.id === addProductId)
        if (!product) return
        setCreateItems((prev) => [
            ...prev,
            {
                product_id: addProductId,
                product_name: product.product_name,
                send_count: addSendCount,
            },
        ])
        setAddProductId(null)
        setAddSendCount(1)
    }

    const removeItemFromCreate = (productId: number) => {
        setCreateItems((prev) => prev.filter((i) => i.product_id !== productId))
    }

    const handleCreateSubmit = async () => {
        if (!createToBranch) {
            toast.push(
                <Notification type="warning" title="แจ้งเตือน">
                    กรุณาเลือกสาขาปลายทาง
                </Notification>,
            )
            return
        }
        if (createItems.length === 0) {
            toast.push(
                <Notification type="warning" title="แจ้งเตือน">
                    กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ
                </Notification>,
            )
            return
        }
        setCreateSubmitting(true)
        try {
            await apiCreateRequisition({
                from_branch_id: createFromBranch,
                to_branch_id: createToBranch,
                note: createNote || undefined,
                items: createItems.map((i) => ({
                    product_id: i.product_id,
                    send_count: i.send_count,
                })),
            })
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    สร้างรายการเบิกสินค้าเรียบร้อยแล้ว
                </Notification>,
            )
            setCreateOpen(false)
            fetchList()
        } catch (err: any) {
            const msg = await getErrorMessage(err, 'ไม่สามารถสร้างรายการได้')
            toast.push(<Notification type="danger" title="Error">{msg}</Notification>)
        } finally {
            setCreateSubmitting(false)
        }
    }

    // ── Columns ──────────────────────────────────────────────────
    const columns: ColumnDef<StockRequisitionListItem>[] = useMemo(
        () => [
            {
                header: '#',
                accessorKey: 'id',
                cell: (props) => (
                    <span className="font-mono text-sm font-semibold">
                        #{props.row.original.id}
                    </span>
                ),
            },
            {
                header: 'สาขาปลายทาง',
                accessorKey: 'to_branch_name',
                cell: (props) => (
                    <span className="font-semibold">
                        {props.row.original.to_branch_name}
                    </span>
                ),
            },
            {
                header: 'สาขาต้นทาง',
                accessorKey: 'from_branch_name',
                enableSorting: false,
                cell: (props) => (
                    <span>
                        {props.row.original.from_branch_name || (
                            <span className="text-gray-400">-</span>
                        )}
                    </span>
                ),
            },
            {
                header: 'จำนวนรายการ',
                accessorKey: 'item_count',
                enableSorting: false,
                cell: (props) => (
                    <span>{props.row.original.item_count} รายการ</span>
                ),
            },
            {
                header: 'สถานะ',
                accessorKey: 'status',
                enableSorting: false,
                cell: (props) => {
                    const s = props.row.original.status
                    const info = STATUS_MAP[s] || {
                        label: s,
                        className: 'bg-gray-100 text-gray-600 border-0',
                    }
                    return <Tag className={info.className}>{info.label}</Tag>
                },
            },
            {
                header: 'วันที่สร้าง',
                accessorKey: 'created_at',
                cell: (props) => (
                    <span className="text-sm text-gray-500">
                        {new Date(props.row.original.created_at).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                ),
            },
            {
                header: 'จัดการ',
                id: 'action',
                enableSorting: false,
                cell: (props) => {
                    const row = props.row.original
                    const transitions = STATUS_TRANSITIONS[row.status] || []
                    const canDelete =
                        row.status === 'CREATED' || row.status === 'CANCELLED'
                    return (
                        <div className="flex gap-1 items-center">
                            <Button
                                size="xs"
                                variant="plain"
                                icon={<TbEye />}
                                title="ดูรายละเอียด"
                                onClick={() => openDetail(row)}
                            />
                            {transitions.map((t) => (
                                <Button
                                    key={t.value}
                                    size="xs"
                                    variant="plain"
                                    icon={<TbRefresh />}
                                    title={t.label}
                                    onClick={() =>
                                        openStatusChange(row, t.value)
                                    }
                                >
                                    {t.label}
                                </Button>
                            ))}
                            {canDelete && (
                                <Button
                                    size="xs"
                                    variant="plain"
                                    icon={<TbTrash />}
                                    className="text-red-500 hover:text-red-600"
                                    title="ลบ"
                                    onClick={() => {
                                        setDeleteTarget(row)
                                        setDeleteOpen(true)
                                    }}
                                />
                            )}
                        </div>
                    )
                },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    )

    // ── Helpers ──────────────────────────────────────────────────
    const branchOptions = useMemo(
        () => [
            { value: 0, label: 'ทุกสาขา' },
            ...branches.map((b) => ({ value: b.id, label: b.branch_name })),
        ],
        [branches],
    )

    const productOptions = useMemo(
        () =>
            products
                .filter((p) => p.is_active)
                .map((p) => ({ value: p.id, label: p.product_name })),
        [products],
    )

    const handlePaginationChange = (page: number) => setPageIndex(page)
    const handleSelectChange = (value: number) => {
        setPageSize(value)
        setPageIndex(1)
    }

    // ── Render ───────────────────────────────────────────────────
    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3>รายการขอเบิกสินค้า</h3>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<TbPlus />}
                            onClick={openCreate}
                        >
                            สร้างใบเบิก
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-2 md:items-center justify-between">
                        <div className="flex gap-2 flex-wrap">
                            <Select
                                className="min-w-[160px]"
                                size="sm"
                                options={branchOptions}
                                value={branchOptions.find(
                                    (o) => o.value === (filterBranch ?? 0),
                                )}
                                onChange={(opt: any) => {
                                    setFilterBranch(
                                        opt?.value ? opt.value : undefined,
                                    )
                                    setPageIndex(1)
                                }}
                            />
                            <Select
                                className="min-w-[160px]"
                                size="sm"
                                options={STATUS_OPTIONS}
                                value={STATUS_OPTIONS.find(
                                    (o) => o.value === filterStatus,
                                )}
                                onChange={(opt: any) => {
                                    setFilterStatus(opt?.value ?? '')
                                    setPageIndex(1)
                                }}
                            />
                        </div>
                        <Input
                            className="max-w-[300px]"
                            size="sm"
                            placeholder="ค้นหาสาขา, หมายเหตุ..."
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

            {/* ── Detail Dialog ── */}
            <Dialog
                isOpen={detailOpen}
                onClose={() => setDetailOpen(false)}
                onRequestClose={() => setDetailOpen(false)}
                width={600}
            >
                <h5 className="mb-4">
                    รายละเอียดใบเบิก #{detailData?.id}
                </h5>
                {detailLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <span className="text-gray-400">กำลังโหลด...</span>
                    </div>
                ) : detailData ? (
                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-500">สาขาปลายทาง:</span>{' '}
                                <strong>{detailData.to_branch_name}</strong>
                            </div>
                            <div>
                                <span className="text-gray-500">สาขาต้นทาง:</span>{' '}
                                <strong>{detailData.from_branch_name || '-'}</strong>
                            </div>
                            <div>
                                <span className="text-gray-500">สถานะ:</span>{' '}
                                <Tag className={STATUS_MAP[detailData.status]?.className || ''}>
                                    {STATUS_MAP[detailData.status]?.label || detailData.status}
                                </Tag>
                            </div>
                            <div>
                                <span className="text-gray-500">วันที่สร้าง:</span>{' '}
                                {new Date(detailData.created_at).toLocaleDateString('th-TH', {
                                    year: 'numeric', month: 'short', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                })}
                            </div>
                            {detailData.sent_by_name && (
                                <div>
                                    <span className="text-gray-500">ผู้ส่ง:</span>{' '}
                                    {detailData.sent_by_name}
                                </div>
                            )}
                            {detailData.received_by_name && (
                                <div>
                                    <span className="text-gray-500">ผู้รับ:</span>{' '}
                                    {detailData.received_by_name}
                                </div>
                            )}
                            {detailData.note && (
                                <div className="col-span-2">
                                    <span className="text-gray-500">หมายเหตุ:</span>{' '}
                                    {detailData.note}
                                </div>
                            )}
                        </div>
                        <h6 className="mt-2">รายการสินค้า</h6>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                                        <th className="px-3 py-2 text-left">สินค้า</th>
                                        <th className="px-3 py-2 text-right">จำนวนส่ง</th>
                                        <th className="px-3 py-2 text-right">จำนวนรับ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detailData.items?.map((item) => (
                                        <tr key={item.id} className="border-t border-gray-100 dark:border-gray-700">
                                            <td className="px-3 py-2 font-medium">{item.product_name}</td>
                                            <td className="px-3 py-2 text-right">{item.send_count}</td>
                                            <td className="px-3 py-2 text-right">{item.receive_count}</td>
                                        </tr>
                                    ))}
                                    {(!detailData.items || detailData.items.length === 0) && (
                                        <tr>
                                            <td colSpan={3} className="px-3 py-4 text-center text-gray-400">
                                                ไม่มีรายการ
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : null}
                <div className="flex justify-end mt-4">
                    <Button onClick={() => setDetailOpen(false)}>ปิด</Button>
                </div>
            </Dialog>

            {/* ── Status Change Confirm ── */}
            <Dialog
                isOpen={statusOpen}
                onClose={() => setStatusOpen(false)}
                onRequestClose={() => setStatusOpen(false)}
            >
                <h5 className="mb-4">ยืนยันการเปลี่ยนสถานะ</h5>
                {statusTarget && (
                    <p>
                        ต้องการเปลี่ยนสถานะใบเบิก <strong>#{statusTarget.id}</strong>{' '}
                        จาก{' '}
                        <Tag className={STATUS_MAP[statusTarget.status]?.className || ''}>
                            {STATUS_MAP[statusTarget.status]?.label}
                        </Tag>{' '}
                        เป็น{' '}
                        <Tag className={STATUS_MAP[statusValue]?.className || ''}>
                            {STATUS_MAP[statusValue]?.label}
                        </Tag>{' '}
                        หรือไม่?
                    </p>
                )}
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setStatusOpen(false)}>ยกเลิก</Button>
                    <Button variant="solid" onClick={handleStatusConfirm}>
                        ยืนยัน
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
                            ต้องการลบใบเบิก <strong>#{deleteTarget.id}</strong>{' '}
                            (สาขา {deleteTarget.to_branch_name}) หรือไม่?
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            การลบจะไม่สามารถกู้คืนได้
                        </p>
                    </>
                )}
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setDeleteOpen(false)}>ยกเลิก</Button>
                    <Button variant="solid" color="red" onClick={handleDeleteConfirm}>
                        ลบ
                    </Button>
                </div>
            </Dialog>

            {/* ── Create Dialog ── */}
            <Dialog
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                onRequestClose={() => setCreateOpen(false)}
                width={640}
            >
                <h5 className="mb-4">สร้างใบเบิกสินค้า</h5>
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                สาขาปลายทาง <span className="text-red-500">*</span>
                            </label>
                            <Select
                                size="sm"
                                placeholder="เลือกสาขา..."
                                options={branches.map((b) => ({
                                    value: b.id,
                                    label: b.branch_name,
                                }))}
                                value={
                                    createToBranch
                                        ? {
                                              value: createToBranch,
                                              label:
                                                  branches.find(
                                                      (b) =>
                                                          b.id ===
                                                          createToBranch,
                                                  )?.branch_name || '',
                                          }
                                        : null
                                }
                                onChange={(opt: any) =>
                                    setCreateToBranch(opt?.value ?? null)
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                สาขาต้นทาง (ไม่บังคับ)
                            </label>
                            <Select
                                size="sm"
                                isClearable
                                placeholder="เลือกสาขา..."
                                options={branches.map((b) => ({
                                    value: b.id,
                                    label: b.branch_name,
                                }))}
                                value={
                                    createFromBranch
                                        ? {
                                              value: createFromBranch,
                                              label:
                                                  branches.find(
                                                      (b) =>
                                                          b.id ===
                                                          createFromBranch,
                                                  )?.branch_name || '',
                                          }
                                        : null
                                }
                                onChange={(opt: any) =>
                                    setCreateFromBranch(opt?.value ?? null)
                                }
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            หมายเหตุ
                        </label>
                        <Input
                            size="sm"
                            placeholder="หมายเหตุ (ไม่บังคับ)"
                            value={createNote}
                            onChange={(e) => setCreateNote(e.target.value)}
                        />
                    </div>

                    {/* Add product row */}
                    <h6 className="mt-2">รายการสินค้า</h6>
                    <div className="flex gap-2 items-end">
                        <div className="flex-1">
                            <Select
                                size="sm"
                                placeholder="เลือกสินค้า..."
                                options={productOptions}
                                value={
                                    addProductId
                                        ? productOptions.find(
                                              (o) => o.value === addProductId,
                                          ) ?? null
                                        : null
                                }
                                onChange={(opt: any) =>
                                    setAddProductId(opt?.value ?? null)
                                }
                            />
                        </div>
                        <div className="w-24">
                            <Input
                                size="sm"
                                type="number"
                                min={1}
                                placeholder="จำนวน"
                                value={String(addSendCount)}
                                onChange={(e) =>
                                    setAddSendCount(
                                        Math.max(1, Number(e.target.value)),
                                    )
                                }
                            />
                        </div>
                        <Button
                            size="sm"
                            variant="solid"
                            icon={<TbPlus />}
                            onClick={addItemToCreate}
                        >
                            เพิ่ม
                        </Button>
                    </div>

                    {/* Items list */}
                    {createItems.length > 0 && (
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                                        <th className="px-3 py-2 text-left">สินค้า</th>
                                        <th className="px-3 py-2 text-right">จำนวน</th>
                                        <th className="px-3 py-2 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {createItems.map((item) => (
                                        <tr
                                            key={item.product_id}
                                            className="border-t border-gray-100 dark:border-gray-700"
                                        >
                                            <td className="px-3 py-2">
                                                {item.product_name}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                {item.send_count}
                                            </td>
                                            <td className="px-3 py-2">
                                                <Button
                                                    size="xs"
                                                    variant="plain"
                                                    icon={<TbX />}
                                                    className="text-red-500"
                                                    onClick={() =>
                                                        removeItemFromCreate(
                                                            item.product_id,
                                                        )
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setCreateOpen(false)}>ยกเลิก</Button>
                    <Button
                        variant="solid"
                        loading={createSubmitting}
                        onClick={handleCreateSubmit}
                    >
                        สร้างใบเบิก
                    </Button>
                </div>
            </Dialog>
        </Container>
    )
}

export default Requisition
