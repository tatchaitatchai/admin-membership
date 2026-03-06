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
import { apiChangePin } from '@/services/StaffManagementService'

type Props = {
    isOpen: boolean
    staffId: number
    onClose: () => void
}

const schema = z.object({
    new_pin: z
        .string()
        .min(4, 'PIN อย่างน้อย 4 ตัว')
        .max(6, 'PIN ไม่เกิน 6 ตัว')
        .regex(/^\d+$/, 'PIN ต้องเป็นตัวเลขเท่านั้น'),
    confirm_pin: z.string().min(1, 'กรุณายืนยัน PIN'),
}).refine((data) => data.new_pin === data.confirm_pin, {
    message: 'PIN ไม่ตรงกัน',
    path: ['confirm_pin'],
})

type FormSchema = z.infer<typeof schema>

const ChangePinDialog = ({ isOpen, staffId, onClose }: Props) => {
    const [submitting, setSubmitting] = useState(false)

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<FormSchema>({
        defaultValues: { new_pin: '', confirm_pin: '' },
        resolver: zodResolver(schema),
    })

    const onSubmit = async (values: FormSchema) => {
        setSubmitting(true)
        try {
            await apiChangePin(staffId, { new_pin: values.new_pin })
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    เปลี่ยน PIN แล้ว
                </Notification>,
            )
            reset()
            onClose()
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'ไม่สามารถเปลี่ยน PIN ได้'
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
            <h5 className="mb-4">เปลี่ยน PIN</h5>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <FormItem
                    label="PIN ใหม่"
                    invalid={Boolean(errors.new_pin)}
                    errorMessage={errors.new_pin?.message}
                >
                    <Controller
                        name="new_pin"
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
                <FormItem
                    label="ยืนยัน PIN ใหม่"
                    invalid={Boolean(errors.confirm_pin)}
                    errorMessage={errors.confirm_pin?.message}
                >
                    <Controller
                        name="confirm_pin"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                placeholder="กรอก PIN อีกครั้ง"
                                maxLength={6}
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

export default ChangePinDialog
