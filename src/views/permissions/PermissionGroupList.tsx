import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'
import { TbPlus, TbTrash, TbEdit, TbSearch } from 'react-icons/tb'
import {
    apiGetGroups,
    apiCreateGroup,
    apiDeleteGroup,
} from '@/services/PermissionService'
import type { PermissionGroupDTO } from './types'

const PermissionGroupList = () => {
    const navigate = useNavigate()
    const [groups, setGroups] = useState<PermissionGroupDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState('')
    const [createOpen, setCreateOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<PermissionGroupDTO | null>(null)
    const [newGroupName, setNewGroupName] = useState('')
    const [newGroupDesc, setNewGroupDesc] = useState('')

    const fetchGroups = useCallback(async () => {
        setLoading(true)
        try {
            const resp = await apiGetGroups({
                page: pageIndex,
                limit: pageSize,
                search: search || undefined,
            })
            setGroups(resp.data ?? [])
            setTotal(resp.total)
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถโหลดรายการกลุ่มสิทธิ์ได้
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, search])

    useEffect(() => {
        fetchGroups()
    }, [fetchGroups])

    const handleCreate = async () => {
        if (!newGroupName.trim()) return
        try {
            await apiCreateGroup({
                name: newGroupName.trim(),
                description: newGroupDesc.trim() || undefined,
            })
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    สร้างกลุ่มสิทธิ์แล้ว
                </Notification>,
            )
            setCreateOpen(false)
            setNewGroupName('')
            setNewGroupDesc('')
            fetchGroups()
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถสร้างกลุ่มสิทธิ์ได้
                </Notification>,
            )
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            await apiDeleteGroup(deleteTarget.id)
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    ลบกลุ่มสิทธิ์แล้ว
                </Notification>,
            )
            setDeleteOpen(false)
            setDeleteTarget(null)
            fetchGroups()
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถลบกลุ่มสิทธิ์ได้
                </Notification>,
            )
        }
    }

    const columns: ColumnDef<PermissionGroupDTO>[] = useMemo(
        () => [
            {
                header: 'ชื่อกลุ่ม',
                accessorKey: 'name',
                cell: (props) => (
                    <div>
                        <span className="font-semibold">
                            {props.row.original.name}
                        </span>
                        {props.row.original.is_default && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                Default
                            </span>
                        )}
                    </div>
                ),
            },
            {
                header: 'คำอธิบาย',
                accessorKey: 'description',
                enableSorting: false,
                cell: (props) => (
                    <span className="text-gray-500">
                        {props.row.original.description || '-'}
                    </span>
                ),
            },
            {
                header: 'จำนวนพนักงาน',
                accessorKey: 'staff_count',
                enableSorting: false,
                cell: (props) => (
                    <span>{props.row.original.staff_count} คน</span>
                ),
            },
            {
                header: 'จัดการ',
                id: 'action',
                enableSorting: false,
                cell: (props) => {
                    const g = props.row.original
                    return (
                        <div className="flex gap-2">
                            <Button
                                size="xs"
                                variant="plain"
                                icon={<TbEdit />}
                                onClick={() =>
                                    navigate(`/permissions/groups/${g.id}`)
                                }
                            />
                            <Button
                                size="xs"
                                variant="plain"
                                icon={<TbTrash />}
                                className="text-red-500 hover:text-red-600"
                                onClick={() => {
                                    setDeleteTarget(g)
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

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3>จัดการกลุ่มสิทธิ์</h3>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<TbPlus />}
                            onClick={() => setCreateOpen(true)}
                        >
                            สร้างกลุ่มใหม่
                        </Button>
                    </div>
                    <div className="flex justify-end">
                        <Input
                            className="max-w-[300px]"
                            size="sm"
                            placeholder="ค้นหาชื่อกลุ่ม..."
                            prefix={<TbSearch className="text-lg" />}
                            value={search}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <DataTable
                        columns={columns}
                        data={groups}
                        loading={loading}
                        noData={!loading && groups.length === 0}
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

            {/* Create Dialog */}
            <Dialog
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                onRequestClose={() => setCreateOpen(false)}
            >
                <h5 className="mb-4">สร้างกลุ่มสิทธิ์ใหม่</h5>
                <div className="flex flex-col gap-3">
                    <div>
                        <label className="text-sm font-medium mb-1 block">ชื่อกลุ่ม *</label>
                        <Input
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="เช่น Manager, Cashier"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">คำอธิบาย</label>
                        <Input
                            value={newGroupDesc}
                            onChange={(e) => setNewGroupDesc(e.target.value)}
                            placeholder="คำอธิบายเพิ่มเติม (ไม่บังคับ)"
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                        <Button onClick={() => setCreateOpen(false)}>ยกเลิก</Button>
                        <Button variant="solid" onClick={handleCreate}>
                            สร้าง
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onRequestClose={() => setDeleteOpen(false)}
            >
                <h5 className="mb-4">ยืนยันการลบ</h5>
                <p>
                    ต้องการลบกลุ่ม <strong>{deleteTarget?.name}</strong> หรือไม่?
                </p>
                <p className="text-sm text-gray-500 mt-1">
                    พนักงานในกลุ่มนี้จะถูกนำออกจากกลุ่มทั้งหมด
                </p>
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setDeleteOpen(false)}>ยกเลิก</Button>
                    <Button
                        variant="solid"
                        color="red"
                        onClick={handleDelete}
                    >
                        ลบ
                    </Button>
                </div>
            </Dialog>
        </Container>
    )
}

export default PermissionGroupList
