import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import PasswordInput from '@/components/shared/PasswordInput'
import { TbArrowLeft } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiCreateStaff, apiListBranches } from '@/services/StaffManagementService'
import type { BranchOption } from './types'
import { getErrorMessage } from '@/utils/errorHandler'

const schema = z.object({
    email: z.string().min(1, 'กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
    password: z.string().min(6, 'รหัสผ่านอย่างน้อย 6 ตัว'),
    pin: z
        .string()
        .min(4, 'PIN อย่างน้อย 4 ตัว')
        .max(4, 'PIN ไม่เกิน 4 ตัว')
        .regex(/^\d+$/, 'PIN ต้องเป็นตัวเลขเท่านั้น'),
    branch_id: z.number().nullable(),
    is_active: z.boolean(),
    can_access_bf: z.boolean(),
})

type FormSchema = z.infer<typeof schema>

const StaffCreate = () => {
    const navigate = useNavigate()
    const [branches, setBranches] = useState<BranchOption[]>([])
    const [submitting, setSubmitting] = useState(false)

    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<FormSchema>({
        defaultValues: {
            email: '',
            password: '',
            pin: '',
            branch_id: null,
            is_active: true,
            can_access_bf: false,
        },
        resolver: zodResolver(schema),
    })

    useEffect(() => {
        apiListBranches()
            .then((data) => setBranches(data ?? []))
            .catch(() => {})
    }, [])

    const onSubmit = async (values: FormSchema) => {
        setSubmitting(true)
        try {
            await apiCreateStaff({
                email: values.email,
                password: values.password,
                pin: values.pin,
                branch_id: values.branch_id,
                is_active: values.is_active,
                can_access_bf: values.can_access_bf,
            })
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    เพิ่มพนักงานแล้ว
                </Notification>,
            )
            navigate('/staff-management')
        } catch (err: any) {
            const errorMessage = await getErrorMessage(err, 'ไม่สามารถเพิ่มพนักงานได้')
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

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="plain"
                            size="sm"
                            icon={<TbArrowLeft />}
                            onClick={() => navigate('/staff-management')}
                        />
                        <h3>เพิ่มพนักงาน</h3>
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
                                            value={branchOptions.find(
                                                (o) => o.value === field.value,
                                            ) ?? null}
                                            onChange={(opt) =>
                                                field.onChange(opt?.value ?? null)
                                            }
                                            isClearable
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="รหัสผ่าน"
                                invalid={Boolean(errors.password)}
                                errorMessage={errors.password?.message}
                            >
                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
                                        <PasswordInput
                                            placeholder="อย่างน้อย 6 ตัว"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="PIN"
                                invalid={Boolean(errors.pin)}
                                errorMessage={errors.pin?.message}
                            >
                                <Controller
                                    name="pin"
                                    control={control}
                                    render={({ field }) => (
                                        <PasswordInput
                                            placeholder="4 หลัก (ตัวเลขเท่านั้น)"
                                            maxLength={4}
                                            {...field}
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
        </Container>
    )
}

export default StaffCreate
