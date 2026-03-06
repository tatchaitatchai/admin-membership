import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import PasswordInput from '@/components/shared/PasswordInput'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiChangePassword } from '@/services/StaffManagementService'

type Props = {
    isOpen: boolean
    staffId: number
    onClose: () => void
}

const schema = z.object({
    new_password: z.string().min(6, 'รหัสผ่านอย่างน้อย 6 ตัว'),
    confirm_password: z.string().min(1, 'กรุณายืนยันรหัสผ่าน'),
}).refine((data) => data.new_password === data.confirm_password, {
    message: 'รหัสผ่านไม่ตรงกัน',
    path: ['confirm_password'],
})

type FormSchema = z.infer<typeof schema>

const ChangePasswordDialog = ({ isOpen, staffId, onClose }: Props) => {
    const [submitting, setSubmitting] = useState(false)

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<FormSchema>({
        defaultValues: { new_password: '', confirm_password: '' },
        resolver: zodResolver(schema),
    })

    const onSubmit = async (values: FormSchema) => {
        setSubmitting(true)
        try {
            await apiChangePassword(staffId, {
                new_password: values.new_password,
            })
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    เปลี่ยนรหัสผ่านแล้ว
                </Notification>,
            )
            reset()
            onClose()
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'ไม่สามารถเปลี่ยนรหัสผ่านได้'
            toast.push(
                <Notification type="danger" title="Error">
                    {message}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            onRequestClose={handleClose}
        >
            <h5 className="mb-4">เปลี่ยนรหัสผ่าน</h5>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <FormItem
                    label="รหัสผ่านใหม่"
                    invalid={Boolean(errors.new_password)}
                    errorMessage={errors.new_password?.message}
                >
                    <Controller
                        name="new_password"
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
                    label="ยืนยันรหัสผ่านใหม่"
                    invalid={Boolean(errors.confirm_password)}
                    errorMessage={errors.confirm_password?.message}
                >
                    <Controller
                        name="confirm_password"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                placeholder="กรอกรหัสผ่านอีกครั้ง"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <div className="flex justify-end gap-2 mt-2">
                    <Button type="button" onClick={handleClose}>
                        ยกเลิก
                    </Button>
                    <Button
                        variant="solid"
                        type="submit"
                        loading={submitting}
                    >
                        บันทึก
                    </Button>
                </div>
            </Form>
        </Dialog>
    )
}

export default ChangePasswordDialog
