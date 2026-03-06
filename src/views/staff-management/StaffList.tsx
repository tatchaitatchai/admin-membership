import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Switcher from '@/components/ui/Switcher'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'
import { TbPlus, TbEdit, TbTrash, TbSearch } from 'react-icons/tb'
import { apiListStaff, apiDeleteStaff, apiUpdateStaff } from '@/services/StaffManagementService'
import type { StaffListItem } from './types'

const StaffList = () => {
    const navigate = useNavigate()
    const [staff, setStaff] = useState<StaffListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState('')
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<StaffListItem | null>(null)
    const [toggleOpen, setToggleOpen] = useState(false)
    const [toggleTarget, setToggleTarget] = useState<{ item: StaffListItem; field: 'is_active' | 'can_access_bf' } | null>(null)

    const fetchStaff = useCallback(async () => {
        setLoading(true)
        try {
            const resp = await apiListStaff({
                page: pageIndex,
                limit: pageSize,
                search: search || undefined,
            })
            setStaff(resp.data ?? [])
            setTotal(resp.total)
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถโหลดรายการพนักงานได้
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, search])

    useEffect(() => {
        fetchStaff()
    }, [fetchStaff])

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            await apiDeleteStaff(deleteTarget.id)
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    ลบพนักงานแล้ว
                </Notification>,
            )
            setDeleteOpen(false)
            setDeleteTarget(null)
            fetchStaff()
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถลบพนักงานได้
                </Notification>,
            )
        }
    }

    const openToggleConfirm = (item: StaffListItem, field: 'is_active' | 'can_access_bf') => {
        setToggleTarget({ item, field })
        setToggleOpen(true)
    }

    const handleToggleConfirm = async () => {
        if (!toggleTarget) return
        const { item, field } = toggleTarget
        const payload = field === 'is_active'
            ? { is_active: !item.is_active }
            : { can_access_bf: !item.can_access_bf }
        try {
            await apiUpdateStaff(item.id, payload)
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    เปลี่ยนสถานะเรียบร้อยแล้ว
                </Notification>,
            )
            setToggleOpen(false)
            setToggleTarget(null)
            fetchStaff()
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถเปลี่ยนสถานะได้
                </Notification>,
            )
        }
    }

    const columns: ColumnDef<StaffListItem>[] = useMemo(
        () => [
            {
                header: 'อีเมล',
                accessorKey: 'email',
                cell: (props) => (
                    <span className="font-semibold">
                        {props.row.original.email || '-'}
                    </span>
                ),
            },
            {
                header: 'สาขา',
                accessorKey: 'branch_name',
                enableSorting: false,
                cell: (props) => (
                    <span className="text-gray-500">
                        {props.row.original.branch_name || 'ไม่ระบุสาขา'}
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
                        onChange={() => openToggleConfirm(props.row.original, 'is_active')}
                        disabled={props.row.original.is_store_master}
                    />
                ),
            },
            {
                header: 'เข้าหลังบ้าน',
                accessorKey: 'can_access_bf',
                enableSorting: false,
                cell: (props) => (
                    <Switcher
                        checked={props.row.original.can_access_bf}
                        onChange={() => openToggleConfirm(props.row.original, 'can_access_bf')}
                        disabled={props.row.original.is_store_master}
                    />
                ),
            },
            {
                header: 'บทบาท',
                accessorKey: 'is_store_master',
                enableSorting: false,
                cell: (props) =>
                    props.row.original.is_store_master ? (
                        <Tag className="bg-amber-100 text-amber-600 border-0">
                            เจ้าของร้าน
                        </Tag>
                    ) : (
                        <Tag className="bg-blue-100 text-blue-600 border-0">
                            พนักงาน
                        </Tag>
                    ),
            },
            {
                header: 'จัดการ',
                id: 'action',
                enableSorting: false,
                cell: (props) => {
                    const s = props.row.original
                    return (
                        <div className="flex gap-1">
                            <Button
                                size="xs"
                                variant="plain"
                                icon={<TbEdit />}
                                onClick={() =>
                                    navigate(`/staff-management/${s.id}/edit`)
                                }
                            />
                            {!s.is_store_master && (
                                <Button
                                    size="xs"
                                    variant="plain"
                                    icon={<TbTrash />}
                                    className="text-red-500 hover:text-red-600"
                                    onClick={() => {
                                        setDeleteTarget(s)
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

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3>จัดการพนักงาน</h3>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<TbPlus />}
                            onClick={() => navigate('/staff-management/create')}
                        >
                            เพิ่มพนักงาน
                        </Button>
                    </div>
                    <div className="flex justify-end">
                        <Input
                            className="max-w-[300px]"
                            size="sm"
                            placeholder="ค้นหาอีเมล..."
                            prefix={<TbSearch className="text-lg" />}
                            value={search}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <DataTable
                        columns={columns}
                        data={staff}
                        loading={loading}
                        noData={!loading && staff.length === 0}
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
                        {toggleTarget.field === 'is_active'
                            ? toggleTarget.item.is_active ? ' ปิดใช้งาน' : ' เปิดใช้งาน'
                            : toggleTarget.item.can_access_bf ? ' ปิดสิทธิ์เข้าหลังบ้าน' : ' เปิดสิทธิ์เข้าหลังบ้าน'}
                        {' '}พนักงาน <strong>{toggleTarget.item.email}</strong> หรือไม่?
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
                    ต้องการลบพนักงาน <strong>{deleteTarget?.email}</strong> หรือไม่?
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

export default StaffList
