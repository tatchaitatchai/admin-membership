import { useState, useEffect, useRef } from 'react'
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
import { TbArrowLeft, TbUpload, TbX } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    apiCreateProduct,
    apiListCategories,
    apiUploadProductImage,
} from '@/services/ProductService'
import type { CategoryOption } from './types'
import { getErrorMessage } from '@/utils/errorHandler'

const schema = z.object({
    product_name: z.string().min(1, 'กรุณากรอกชื่อสินค้า'),
    category_id: z.number().nullable(),
    base_price: z.number().min(0, 'ราคาต้องไม่ต่ำกว่า 0'),
    points_to_redeem: z.number().min(0, 'พ้อยต้องไม่ต่ำกว่า 0').nullable(),
    is_active: z.boolean(),
})

type FormSchema = z.infer<typeof schema>

const ProductCreate = () => {
    const navigate = useNavigate()
    const [categories, setCategories] = useState<CategoryOption[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<FormSchema>({
        defaultValues: {
            product_name: '',
            category_id: null,
            base_price: 0,
            points_to_redeem: null,
            is_active: true,
        },
        resolver: zodResolver(schema),
    })

    useEffect(() => {
        apiListCategories()
            .then((data) => setCategories(data ?? []))
            .catch(() => {})
    }, [])

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            toast.push(
                <Notification type="danger" title="Error">
                    รองรับเฉพาะไฟล์ JPG, PNG, WebP
                </Notification>,
            )
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.push(
                <Notification type="danger" title="Error">
                    ขนาดไฟล์ต้องไม่เกิน 5MB
                </Notification>,
            )
            return
        }

        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }

    const removeImage = () => {
        setImageFile(null)
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview)
            setImagePreview(null)
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const onSubmit = async (values: FormSchema) => {
        setSubmitting(true)
        try {
            let imagePath: string | undefined
            if (imageFile) {
                setUploading(true)
                const uploadResult = await apiUploadProductImage(imageFile)
                imagePath = uploadResult.file_url
                setUploading(false)
            }

            await apiCreateProduct({
                product_name: values.product_name,
                category_id: values.category_id,
                base_price: values.base_price,
                points_to_redeem: values.points_to_redeem,
                is_active: values.is_active,
                image_path: imagePath ?? null,
            })
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    เพิ่มสินค้าแล้ว
                </Notification>,
            )
            navigate('/products')
        } catch (err: any) {
            setUploading(false)
            const errorMessage = await getErrorMessage(err, 'ไม่สามารถเพิ่มสินค้าได้')
            toast.push(
                <Notification type="danger" title="Error">
                    {errorMessage}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    const categoryOptions = categories.map((c) => ({
        value: c.id,
        label: c.category_name,
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
                            onClick={() => navigate('/products')}
                        />
                        <h3>เพิ่มสินค้า</h3>
                    </div>

                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                            <FormItem
                                label="ชื่อสินค้า"
                                invalid={Boolean(errors.product_name)}
                                errorMessage={errors.product_name?.message}
                            >
                                <Controller
                                    name="product_name"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            placeholder="กรอกชื่อสินค้า"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="หมวดหมู่"
                                invalid={Boolean(errors.category_id)}
                                errorMessage={errors.category_id?.message}
                            >
                                <Controller
                                    name="category_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            placeholder="เลือกหมวดหมู่ (ไม่บังคับ)"
                                            options={categoryOptions}
                                            value={categoryOptions.find(
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
                                label="ราคา (บาท)"
                                invalid={Boolean(errors.base_price)}
                                errorMessage={errors.base_price?.message}
                            >
                                <Controller
                                    name="base_price"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                            value={field.value || ''}
                                            onChange={(e) =>
                                                field.onChange(
                                                    parseFloat(e.target.value) || 0,
                                                )
                                            }
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="พ้อยที่ต้องแลก"
                                invalid={Boolean(errors.points_to_redeem)}
                                errorMessage={errors.points_to_redeem?.message}
                            >
                                <Controller
                                    name="points_to_redeem"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            placeholder="ไม่ระบุ = ไม่สามารถแลกได้"
                                            min="0"
                                            value={field.value ?? ''}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                field.onChange(
                                                    val === '' ? null : parseInt(val, 10) || 0,
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>

                        <FormItem label="รูปภาพสินค้า">
                            <div className="flex items-start gap-4">
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-32 h-32 rounded-lg object-cover border"
                                        />
                                        <button
                                            type="button"
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                                            onClick={removeImage}
                                        >
                                            <TbX className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <TbUpload className="w-6 h-6" />
                                        <span className="text-xs">อัพโหลดรูป</span>
                                    </button>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleImageSelect}
                                />
                                <div className="text-xs text-gray-400 mt-2">
                                    <p>รองรับ JPG, PNG, WebP</p>
                                    <p>ขนาดไม่เกิน 5MB</p>
                                </div>
                            </div>
                        </FormItem>

                        <div className="flex items-center gap-2 mt-2 mb-6">
                            <Controller
                                name="is_active"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex items-center gap-2">
                                        <Switcher
                                            checked={field.value}
                                            onChange={field.onChange}
                                        />
                                        <span>เปิดขาย</span>
                                    </div>
                                )}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="solid"
                                type="submit"
                                loading={submitting || uploading}
                            >
                                {uploading ? 'กำลังอัพโหลดรูป...' : 'บันทึก'}
                            </Button>
                            <Button onClick={() => navigate('/products')}>
                                ยกเลิก
                            </Button>
                        </div>
                    </Form>
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default ProductCreate
