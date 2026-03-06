import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { TbPlus, TbTrash, TbEdit } from 'react-icons/tb'
import {
    apiGetGroups,
    apiCreateGroup,
    apiDeleteGroup,
} from '@/services/PermissionService'
import type { PermissionGroupDTO } from './types'

const { Tr, Th, Td, THead, TBody } = Table

const PermissionGroupList = () => {
    const navigate = useNavigate()
    const [groups, setGroups] = useState<PermissionGroupDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [createOpen, setCreateOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<PermissionGroupDTO | null>(null)
    const [newGroupName, setNewGroupName] = useState('')
    const [newGroupDesc, setNewGroupDesc] = useState('')

    const fetchGroups = useCallback(async () => {
        setLoading(true)
        try {
            const data = await apiGetGroups()
            setGroups(data ?? [])
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถโหลดรายการกลุ่มสิทธิ์ได้
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [])

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

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <span className="text-gray-400">กำลังโหลด...</span>
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="flex justify-center py-8">
                            <span className="text-gray-400">ยังไม่มีกลุ่มสิทธิ์</span>
                        </div>
                    ) : (
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>ชื่อกลุ่ม</Th>
                                    <Th>คำอธิบาย</Th>
                                    <Th>จำนวนพนักงาน</Th>
                                    <Th className="w-[120px]">จัดการ</Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {groups.map((g) => (
                                    <Tr key={g.id}>
                                        <Td>
                                            <span className="font-semibold">{g.name}</span>
                                            {g.is_default && (
                                                <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                                    Default
                                                </span>
                                            )}
                                        </Td>
                                        <Td>
                                            <span className="text-gray-500">
                                                {g.description || '-'}
                                            </span>
                                        </Td>
                                        <Td>{g.staff_count} คน</Td>
                                        <Td>
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
                                        </Td>
                                    </Tr>
                                ))}
                            </TBody>
                        </Table>
                    )}
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
