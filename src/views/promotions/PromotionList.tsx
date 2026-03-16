import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Switcher from '@/components/ui/Switcher'
import Tag from '@/components/ui/Tag'
import Select from '@/components/ui/Select'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'
import { TbPlus, TbEdit, TbTrash, TbSearch } from 'react-icons/tb'
import {
    apiListPromotions,
    apiDeletePromotion,
    apiUpdatePromotion,
    apiListPromotionTypes,
} from '@/services/PromotionService'
import type { PromotionListItem, PromotionTypeOption } from '@/services/PromotionService'
import { getErrorMessage } from '@/utils/errorHandler'

const PromotionList = () => {
    const navigate = useNavigate()
    const [promotions, setPromotions] = useState<PromotionListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState<number | undefined>(undefined)
    const [promotionTypes, setPromotionTypes] = useState<PromotionTypeOption[]>([])
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<PromotionListItem | null>(null)
    const [toggleOpen, setToggleOpen] = useState(false)
    const [toggleTarget, setToggleTarget] = useState<PromotionListItem | null>(null)

    useEffect(() => {
        apiListPromotionTypes().then(setPromotionTypes).catch(() => {})
    }, [])

    const fetchPromotions = useCallback(async () => {
        setLoading(true)
        try {
            const resp = await apiListPromotions({
                page: pageIndex,
                limit: pageSize,
                search: search || undefined,
                type_id: typeFilter,
            })
            setPromotions(resp.data ?? [])
            setTotal(resp.total)
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถโหลดรายการโปรโมชั่นได้
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, search, typeFilter])

    useEffect(() => {
        fetchPromotions()
    }, [fetchPromotions])

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            await apiDeletePromotion(deleteTarget.id)
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    ลบโปรโมชั่นแล้ว
                </Notification>,
            )
            setDeleteOpen(false)
            setDeleteTarget(null)
            fetchPromotions()
        } catch (err: any) {
            const errorMessage = await getErrorMessage(err, 'ไม่สามารถลบโปรโมชั่นได้')
            toast.push(
                <Notification type="danger" title="Error">
                    {errorMessage}
                </Notification>,
            )
        }
    }

    const openToggleConfirm = (item: PromotionListItem) => {
        setToggleTarget(item)
        setToggleOpen(true)
    }

    const handleToggleConfirm = async () => {
        if (!toggleTarget) return
        try {
            await apiUpdatePromotion(toggleTarget.id, { is_active: !toggleTarget.is_active })
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    เปลี่ยนสถานะโปรโมชั่นเรียบร้อยแล้ว
                </Notification>,
            )
            setToggleOpen(false)
            setToggleTarget(null)
            fetchPromotions()
        } catch (err: any) {
            const errorMessage = await getErrorMessage(err, 'ไม่สามารถเปลี่ยนสถานะได้')
            toast.push(
                <Notification type="danger" title="Error">
                    {errorMessage}
                </Notification>,
            )
        }
    }

    const typeColorMap: Record<string, string> = {
        'ลดเปอร์เซ็นต์': 'bg-green-100 text-green-600',
        'ลดบาท': 'bg-blue-100 text-blue-600',
        'ซื้อเป็นเซ็ต': 'bg-purple-100 text-purple-600',
        'ซื้อครบลดเปอร์เซ็นต์': 'bg-orange-100 text-orange-600',
        'ซื้อครบลดบาท': 'bg-amber-100 text-amber-600',
    }

    const columns: ColumnDef<PromotionListItem>[] = useMemo(
        () => [
            {
                header: 'ชื่อโปรโมชั่น',
                accessorKey: 'promotion_name',
                cell: (props) => (
                    <span className="font-semibold">
                        {props.row.original.promotion_name}
                    </span>
                ),
            },
            {
                header: 'ประเภท',
                accessorKey: 'promotion_type_name',
                enableSorting: false,
                cell: (props) => {
                    const typeName = props.row.original.promotion_type_name
                    const colorClass = typeColorMap[typeName] || 'bg-gray-100 text-gray-600'
                    return (
                        <Tag className={`${colorClass} border-0`}>
                            {typeName}
                        </Tag>
                    )
                },
            },
            {
                header: 'สินค้า',
                accessorKey: 'product_count',
                enableSorting: false,
                cell: (props) => (
                    <span className="text-gray-600">
                        {props.row.original.product_count} รายการ
                    </span>
                ),
            },
            {
                header: 'สถานะ',
                accessorKey: 'is_active',
                enableSorting: false,
                cell: (props) => (
                    <Switcher
                        checked={props.row.original.is_active}
                        onChange={() => openToggleConfirm(props.row.original)}
                    />
                ),
            },
            {
                header: 'จัดการ',
                id: 'action',
                enableSorting: false,
                cell: (props) => {
                    const p = props.row.original
                    return (
                        <div className="flex gap-1">
                            <Button
                                size="xs"
                                variant="plain"
                                icon={<TbEdit />}
                                onClick={() => navigate(`/promotions/${p.id}/edit`)}
                            />
                            <Button
                                size="xs"
                                variant="plain"
                                icon={<TbTrash />}
                                className="text-red-500 hover:text-red-600"
                                onClick={() => {
                                    setDeleteTarget(p)
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

    const handlePaginationChange = (page: number) => {
        setPageIndex(page)
    }

    const handleSelectChange = (value: number) => {
        setPageSize(value)
        setPageIndex(1)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        setPageIndex(1)
    }

    const typeOptions = [
        { value: '', label: 'ทุกประเภท' },
        ...promotionTypes.map((t) => ({ value: String(t.id), label: t.name })),
    ]

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3>จัดการโปรโมชั่น</h3>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<TbPlus />}
                            onClick={() => navigate('/promotions/create')}
                        >
                            เพิ่มโปรโมชั่น
                        </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Select
                            className="min-w-[180px]"
                            size="sm"
                            placeholder="ประเภทโปรโมชั่น"
                            options={typeOptions}
                            value={typeOptions.find((o) => o.value === String(typeFilter ?? ''))}
                            onChange={(opt: any) => {
                                setTypeFilter(opt?.value ? Number(opt.value) : undefined)
                                setPageIndex(1)
                            }}
                        />
                        <Input
                            className="max-w-[300px]"
                            size="sm"
                            placeholder="ค้นหาชื่อโปรโมชั่น..."
                            prefix={<TbSearch className="text-lg" />}
                            value={search}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <DataTable
                        columns={columns}
                        data={promotions}
                        loading={loading}
                        noData={!loading && promotions.length === 0}
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

            <Dialog
                isOpen={toggleOpen}
                onClose={() => setToggleOpen(false)}
                onRequestClose={() => setToggleOpen(false)}
            >
                <h5 className="mb-4">ยืนยันการเปลี่ยนสถานะ</h5>
                {toggleTarget && (
                    <p>
                        ต้องการ
                        {toggleTarget.is_active ? ' ปิดการใช้งาน' : ' เปิดการใช้งาน'}
                        {' '}โปรโมชั่น <strong>{toggleTarget.promotion_name}</strong> หรือไม่?
                    </p>
                )}
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setToggleOpen(false)}>ยกเลิก</Button>
                    <Button variant="solid" onClick={handleToggleConfirm}>
                        ยืนยัน
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
                    ต้องการลบโปรโมชั่น <strong>{deleteTarget?.promotion_name}</strong> หรือไม่?
                </p>
                <p className="text-sm text-gray-500 mt-1">
                    การลบโปรโมชั่นจะไม่สามารถกู้คืนได้
                </p>
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

export default PromotionList
