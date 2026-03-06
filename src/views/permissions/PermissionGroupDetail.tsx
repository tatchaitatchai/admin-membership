import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Dialog from '@/components/ui/Dialog'
import Switcher from '@/components/ui/Switcher'
import { TbArrowLeft, TbPlus, TbTrash, TbDeviceFloppy } from 'react-icons/tb'
import {
    apiGetGroupDetail,
    apiGetAllPermissions,
    apiUpdateGroup,
    apiSetGroupPermissions,
    apiAssignStaffToGroup,
    apiRemoveStaffFromGroup,
    apiGetStaffByStore,
} from '@/services/PermissionService'
import type { PermissionGroupDetail as GroupDetail, PermissionDTO, GroupStaffDTO } from './types'

type PermissionsByModule = Record<string, PermissionDTO[]>

const PermissionGroupDetail = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const groupId = Number(id)

    const [detail, setDetail] = useState<GroupDetail | null>(null)
    const [allPermissions, setAllPermissions] = useState<PermissionDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [groupName, setGroupName] = useState('')
    const [groupDesc, setGroupDesc] = useState('')
    const [selectedPermIds, setSelectedPermIds] = useState<Set<number>>(new Set())

    const [staffDialogOpen, setStaffDialogOpen] = useState(false)
    const [allStaff, setAllStaff] = useState<GroupStaffDTO[]>([])
    const [staffLoading, setStaffLoading] = useState(false)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const [groupData, permsData] = await Promise.all([
                apiGetGroupDetail(groupId),
                apiGetAllPermissions(),
            ])
            setDetail(groupData)
            setAllPermissions(permsData ?? [])
            setGroupName(groupData.name)
            setGroupDesc(groupData.description ?? '')
            setSelectedPermIds(new Set((groupData.permissions || []).map((p) => p.id)))
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถโหลดข้อมูลกลุ่มสิทธิ์ได้
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [groupId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const permsByModule: PermissionsByModule = {}
    allPermissions.forEach((p) => {
        if (!permsByModule[p.module]) {
            permsByModule[p.module] = []
        }
        permsByModule[p.module].push(p)
    })

    const togglePermission = (permId: number) => {
        setSelectedPermIds((prev) => {
            const next = new Set(prev)
            if (next.has(permId)) {
                next.delete(permId)
            } else {
                next.add(permId)
            }
            return next
        })
    }

    const toggleModule = (module: string) => {
        const modulePerms = permsByModule[module] || []
        const allSelected = modulePerms.every((p) => selectedPermIds.has(p.id))
        setSelectedPermIds((prev) => {
            const next = new Set(prev)
            modulePerms.forEach((p) => {
                if (allSelected) {
                    next.delete(p.id)
                } else {
                    next.add(p.id)
                }
            })
            return next
        })
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await apiUpdateGroup(groupId, {
                name: groupName.trim(),
                description: groupDesc.trim() || undefined,
            })

            await apiSetGroupPermissions(groupId, Array.from(selectedPermIds))

            toast.push(
                <Notification type="success" title="สำเร็จ">
                    บันทึกการเปลี่ยนแปลงแล้ว — พนักงานในกลุ่มนี้จะถูกดีดออกจากระบบ
                </Notification>,
            )
            fetchData()
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถบันทึกได้
                </Notification>,
            )
        } finally {
            setSaving(false)
        }
    }

    const handleOpenStaffDialog = async () => {
        setStaffDialogOpen(true)
        setStaffLoading(true)
        try {
            const data = await apiGetStaffByStore()
            setAllStaff(data ?? [])
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถโหลดรายชื่อพนักงานได้
                </Notification>,
            )
        } finally {
            setStaffLoading(false)
        }
    }

    const handleAssignStaff = async (staffId: number) => {
        try {
            await apiAssignStaffToGroup(groupId, staffId)
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    เพิ่มพนักงานในกลุ่มแล้ว
                </Notification>,
            )
            setStaffDialogOpen(false)
            fetchData()
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถเพิ่มพนักงานได้
                </Notification>,
            )
        }
    }

    const handleRemoveStaff = async (staffId: number) => {
        try {
            await apiRemoveStaffFromGroup(groupId, staffId)
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    นำพนักงานออกจากกลุ่มแล้ว
                </Notification>,
            )
            fetchData()
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถนำพนักงานออกได้
                </Notification>,
            )
        }
    }

    const moduleLabels: Record<string, string> = {
        dashboard: 'แดชบอร์ด',
        member: 'สมาชิก',
        product: 'สินค้า',
        order: 'รายการสั่งซื้อ',
        point: 'คะแนนสะสม',
        staff: 'พนักงาน',
        permission: 'สิทธิ์',
        report: 'รายงาน',
        setting: 'การตั้งค่า',
    }

    if (loading) {
        return (
            <Container>
                <div className="flex justify-center py-16">
                    <span className="text-gray-400">กำลังโหลด...</span>
                </div>
            </Container>
        )
    }

    if (!detail) {
        return (
            <Container>
                <div className="flex justify-center py-16">
                    <span className="text-gray-400">ไม่พบกลุ่มสิทธิ์</span>
                </div>
            </Container>
        )
    }

    const existingStaffIds = new Set((detail.staff || []).map((s) => s.staff_id))

    return (
        <Container>
            <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button
                        size="sm"
                        variant="plain"
                        icon={<TbArrowLeft />}
                        onClick={() => navigate('/permissions/groups')}
                    />
                    <h3>แก้ไขกลุ่มสิทธิ์</h3>
                </div>

                {/* Group Info */}
                <AdaptiveCard>
                    <div className="flex flex-col gap-3">
                        <h5>ข้อมูลกลุ่ม</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium mb-1 block">
                                    ชื่อกลุ่ม
                                </label>
                                <Input
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">
                                    คำอธิบาย
                                </label>
                                <Input
                                    value={groupDesc}
                                    onChange={(e) => setGroupDesc(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </AdaptiveCard>

                {/* Permissions */}
                <AdaptiveCard>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h5>สิทธิ์การใช้งาน</h5>
                            <span className="text-sm text-gray-500">
                                เลือก {selectedPermIds.size}/{allPermissions.length} สิทธิ์
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(permsByModule).map(([module, perms]) => {
                                const allChecked = perms.every((p) =>
                                    selectedPermIds.has(p.id),
                                )
                                const someChecked =
                                    !allChecked &&
                                    perms.some((p) => selectedPermIds.has(p.id))

                                return (
                                    <div
                                        key={module}
                                        className="border rounded-lg p-3 dark:border-gray-700"
                                    >
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b dark:border-gray-700">
                                            <Switcher
                                                checked={allChecked}
                                                onChange={() => toggleModule(module)}
                                            />
                                            <span className="font-semibold text-sm capitalize">
                                                {moduleLabels[module] || module}
                                            </span>
                                            {someChecked && (
                                                <span className="text-xs text-amber-500">
                                                    (บางส่วน)
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            {perms.map((p) => (
                                                <label
                                                    key={p.id}
                                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-1 py-0.5"
                                                >
                                                    <Checkbox
                                                        checked={selectedPermIds.has(
                                                            p.id,
                                                        )}
                                                        onChange={() =>
                                                            togglePermission(p.id)
                                                        }
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm">
                                                            {p.name}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {p.code}
                                                        </span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button
                                variant="solid"
                                icon={<TbDeviceFloppy />}
                                loading={saving}
                                onClick={handleSave}
                            >
                                บันทึก
                            </Button>
                        </div>
                    </div>
                </AdaptiveCard>

                {/* Staff in this group */}
                <AdaptiveCard>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h5>พนักงานในกลุ่ม ({(detail.staff || []).length} คน)</h5>
                            <Button
                                size="sm"
                                icon={<TbPlus />}
                                onClick={handleOpenStaffDialog}
                            >
                                เพิ่มพนักงาน
                            </Button>
                        </div>

                        {!detail.staff || detail.staff.length === 0 ? (
                            <div className="py-4 text-center text-gray-400">
                                ยังไม่มีพนักงานในกลุ่มนี้
                            </div>
                        ) : (
                            <div className="flex flex-col divide-y dark:divide-gray-700">
                                {detail.staff.map((s) => (
                                    <div
                                        key={s.staff_id}
                                        className="flex items-center justify-between py-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold">
                                                {(s.email ?? '?')[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium">
                                                    {s.email ?? `Staff #${s.staff_id}`}
                                                </span>
                                                {s.is_manager && (
                                                    <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                                                        Manager
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            size="xs"
                                            variant="plain"
                                            icon={<TbTrash />}
                                            className="text-red-500 hover:text-red-600"
                                            onClick={() =>
                                                handleRemoveStaff(s.staff_id)
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </AdaptiveCard>
            </div>

            {/* Assign Staff Dialog */}
            <Dialog
                isOpen={staffDialogOpen}
                onClose={() => setStaffDialogOpen(false)}
                onRequestClose={() => setStaffDialogOpen(false)}
            >
                <h5 className="mb-4">เพิ่มพนักงานเข้ากลุ่ม</h5>
                {staffLoading ? (
                    <div className="py-4 text-center text-gray-400">กำลังโหลด...</div>
                ) : allStaff.length === 0 ? (
                    <div className="py-4 text-center text-gray-400">
                        ไม่พบพนักงาน
                    </div>
                ) : (
                    <div className="flex flex-col divide-y dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                        {allStaff.map((s) => {
                            const alreadyInGroup = existingStaffIds.has(s.staff_id)
                            return (
                                <div
                                    key={s.staff_id}
                                    className="flex items-center justify-between py-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold">
                                            {(s.email ?? '?')[0]?.toUpperCase()}
                                        </div>
                                        <span className="text-sm">
                                            {s.email ?? `Staff #${s.staff_id}`}
                                        </span>
                                    </div>
                                    {alreadyInGroup ? (
                                        <span className="text-xs text-gray-400">
                                            อยู่ในกลุ่มแล้ว
                                        </span>
                                    ) : (
                                        <Button
                                            size="xs"
                                            variant="solid"
                                            onClick={() =>
                                                handleAssignStaff(s.staff_id)
                                            }
                                        >
                                            เพิ่ม
                                        </Button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </Dialog>
        </Container>
    )
}

export default PermissionGroupDetail
