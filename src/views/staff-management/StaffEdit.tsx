import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Tag from '@/components/ui/Tag'
import { TbArrowLeft, TbKey, TbLock } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    apiGetStaffDetail,
    apiUpdateStaff,
    apiListBranches,
} from '@/services/StaffManagementService'
import type { StaffDetailItem, BranchOption } from './types'
import ChangePinDialog from './components/ChangePinDialog'
import ChangePasswordDialog from './components/ChangePasswordDialog'
import { getErrorMessage } from '@/utils/errorHandler'

const schema = z.object({
    email: z.string().min(1, 'กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
    branch_id: z.number().nullable(),
    is_active: z.boolean(),
    can_access_bf: z.boolean(),
})

type FormSchema = z.infer<typeof schema>

const StaffEdit = () => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const staffId = Number(id)

    const [staffDetail, setStaffDetail] = useState<StaffDetailItem | null>(null)
    const [branches, setBranches] = useState<BranchOption[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [pinDialogOpen, setPinDialogOpen] = useState(false)
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<FormSchema>({
        defaultValues: {
            email: '',
            branch_id: null,
            is_active: true,
            can_access_bf: false,
        },
        resolver: zodResolver(schema),
    })

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [detail, branchList] = await Promise.all([
                    apiGetStaffDetail(staffId),
                    apiListBranches(),
                ])
                setStaffDetail(detail)
                setBranches(branchList ?? [])
                reset({
                    email: detail.email ?? '',
                    branch_id: detail.branch_id,
                    is_active: detail.is_active,
                    can_access_bf: detail.can_access_bf,
                })
            } catch {
                toast.push(
                    <Notification type="danger" title="Error">
                        ไม่สามารถโหลดข้อมูลพนักงานได้
                    </Notification>,
                )
                navigate('/staff-management')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [staffId, navigate, reset])

    const onSubmit = async (values: FormSchema) => {
        setSubmitting(true)
        try {
            await apiUpdateStaff(staffId, {
                email: values.email,
                branch_id: values.branch_id,
                is_active: values.is_active,
                can_access_bf: values.can_access_bf,
            })
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    บันทึกข้อมูลพนักงานแล้ว
                </Notification>,
            )
            navigate('/staff-management')
        } catch (err: any) {
            const errorMessage = await getErrorMessage(err, 'ไม่สามารถบันทึกข้อมูลได้')
            toast.push(
                <Notification type="danger" title="Error">
                    {errorMessage}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    const branchOptions = branches.map((b) => ({
        value: b.id,
        label: b.branch_name,
    }))

    if (loading) {
        return (
            <Container>
                <AdaptiveCard>
                    <div className="flex justify-center py-8">
                        <span className="text-gray-400">กำลังโหลด...</span>
                    </div>
                </AdaptiveCard>
            </Container>
        )
    }

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="plain"
                                size="sm"
                                icon={<TbArrowLeft />}
                                onClick={() => navigate('/staff-management')}
                            />
                            <h3>แก้ไขพนักงาน</h3>
                            {staffDetail?.is_store_master && (
                                <Tag className="bg-amber-100 text-amber-600 border-0 ml-2">
                                    เจ้าของร้าน
                                </Tag>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="default"
                                icon={<TbKey />}
                                onClick={() => setPinDialogOpen(true)}
                            >
                                เปลี่ยน PIN
                            </Button>
                            <Button
                                size="sm"
                                variant="default"
                                icon={<TbLock />}
                                onClick={() => setPasswordDialogOpen(true)}
                            >
                                เปลี่ยนรหัสผ่าน
                            </Button>
                        </div>
                    </div>

                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                            <FormItem
                                label="อีเมล"
                                invalid={Boolean(errors.email)}
                                errorMessage={errors.email?.message}
                            >
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="email"
                                            placeholder="example@email.com"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="สาขา"
                                invalid={Boolean(errors.branch_id)}
                                errorMessage={errors.branch_id?.message}
                            >
                                <Controller
                                    name="branch_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            placeholder="เลือกสาขา (ไม่บังคับ)"
                                            options={branchOptions}
                                            value={
                                                branchOptions.find(
                                                    (o) =>
                                                        o.value === field.value,
                                                ) ?? null
                                            }
                                            onChange={(opt) =>
                                                field.onChange(
                                                    opt?.value ?? null,
                                                )
                                            }
                                            isClearable
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 mt-2 mb-6">
                            <Controller
                                name="is_active"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex items-center gap-2">
                                        <Switcher
                                            checked={field.value}
                                            onChange={field.onChange}
                                        />
                                        <span>เปิดใช้งาน</span>
                                    </div>
                                )}
                            />
                            <Controller
                                name="can_access_bf"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex items-center gap-2">
                                        <Switcher
                                            checked={field.value}
                                            onChange={field.onChange}
                                        />
                                        <span>อนุญาตเข้าหลังบ้าน</span>
                                    </div>
                                )}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="solid"
                                type="submit"
                                loading={submitting}
                            >
                                บันทึก
                            </Button>
                            <Button
                                onClick={() => navigate('/staff-management')}
                            >
                                ยกเลิก
                            </Button>
                        </div>
                    </Form>
                </div>
            </AdaptiveCard>

            <ChangePinDialog
                isOpen={pinDialogOpen}
                staffId={staffId}
                onClose={() => setPinDialogOpen(false)}
            />

            <ChangePasswordDialog
                isOpen={passwordDialogOpen}
                staffId={staffId}
                onClose={() => setPasswordDialogOpen(false)}
            />
        </Container>
    )
}

export default StaffEdit
