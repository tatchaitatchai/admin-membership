import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import Switcher from '@/components/ui/Switcher'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Tag from '@/components/ui/Tag'
import Select from '@/components/ui/Select'
import { TbArrowLeft, TbX } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    apiGetPromotion,
    apiUpdatePromotion,
} from '@/services/PromotionService'
import { apiListProducts } from '@/services/ProductService'
import type { ProductFields } from '@/views/products/types'
import { getErrorMessage } from '@/utils/errorHandler'

const schema = z.object({
    promotion_name: z.string().min(1, 'กรุณากรอกชื่อโปรโมชั่น'),
    is_active: z.boolean(),
    starts_at: z.string().nullable().optional(),
    ends_at: z.string().nullable().optional(),
    percent_discount: z.number().nullable().optional(),
    baht_discount: z.number().nullable().optional(),
    total_price_set_discount: z.number().nullable().optional(),
    old_price_set: z.number().nullable().optional(),
    count_condition_product: z.number().nullable().optional(),
})

type FormSchema = z.infer<typeof schema>

const TYPE_PERCENT = 'ลดเปอร์เซ็นต์'
const TYPE_BAHT = 'ลดบาท'
const TYPE_SET = 'ซื้อเป็นเซ็ต'
const TYPE_COUNT_PERCENT = 'ซื้อครบลดเปอร์เซ็นต์'
const TYPE_COUNT_BAHT = 'ซื้อครบลดบาท'

const PromotionEdit = () => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const promotionId = Number(id)

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [typeName, setTypeName] = useState('')
    const [products, setProducts] = useState<ProductFields[]>([])
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([])

    const showPercentDiscount = typeName === TYPE_PERCENT || typeName === TYPE_COUNT_PERCENT
    const showBahtDiscount = typeName === TYPE_BAHT || typeName === TYPE_COUNT_BAHT
    const showSetDiscount = typeName === TYPE_SET
    const showCountCondition = typeName === TYPE_COUNT_PERCENT || typeName === TYPE_COUNT_BAHT
    const showProducts = typeName === TYPE_SET || typeName === TYPE_COUNT_PERCENT || typeName === TYPE_COUNT_BAHT

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<FormSchema>({
        defaultValues: {
            promotion_name: '',
            is_active: true,
            starts_at: null,
            ends_at: null,
            percent_discount: null,
            baht_discount: null,
            total_price_set_discount: null,
            old_price_set: null,
            count_condition_product: null,
        },
        resolver: zodResolver(schema),
    })

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [detail, productResp] = await Promise.all([
                    apiGetPromotion(promotionId),
                    apiListProducts({ limit: 500 }),
                ])
                setProducts(productResp.data ?? [])
                setTypeName(detail.promotion_type_name)
                setSelectedProductIds(detail.products.map((p) => p.product_id))

                const formatDate = (d: string | null) => {
                    if (!d) return null
                    try {
                        return new Date(d).toISOString().slice(0, 16)
                    } catch {
                        return null
                    }
                }

                reset({
                    promotion_name: detail.promotion_name,
                    is_active: detail.is_active,
                    starts_at: formatDate(detail.starts_at),
                    ends_at: formatDate(detail.ends_at),
                    percent_discount: detail.config?.percent_discount ?? null,
                    baht_discount: detail.config?.baht_discount ?? null,
                    total_price_set_discount: detail.config?.total_price_set_discount ?? null,
                    old_price_set: detail.config?.old_price_set ?? null,
                    count_condition_product: detail.config?.count_condition_product ?? null,
                })
            } catch {
                toast.push(
                    <Notification type="danger" title="Error">
                        ไม่สามารถโหลดข้อมูลโปรโมชั่นได้
                    </Notification>,
                )
                navigate('/promotions')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [promotionId, navigate, reset])

    const onSubmit = async (values: FormSchema) => {
        setSubmitting(true)
        try {
            const config: Record<string, any> = {}
            if (showPercentDiscount && values.percent_discount != null) {
                config.percent_discount = values.percent_discount
            }
            if (showBahtDiscount && values.baht_discount != null) {
                config.baht_discount = values.baht_discount
            }
            if (showSetDiscount) {
                if (values.total_price_set_discount != null) config.total_price_set_discount = values.total_price_set_discount
                if (values.old_price_set != null) config.old_price_set = values.old_price_set
            }
            if (showCountCondition && values.count_condition_product != null) {
                config.count_condition_product = values.count_condition_product
            }

            await apiUpdatePromotion(promotionId, {
                promotion_name: values.promotion_name,
                is_active: values.is_active,
                starts_at: values.starts_at || null,
                ends_at: values.ends_at || null,
                config: Object.keys(config).length > 0 ? config : undefined,
                product_ids: showProducts ? selectedProductIds : undefined,
            })
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    บันทึกข้อมูลโปรโมชั่นแล้ว
                </Notification>,
            )
            navigate('/promotions')
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

    const productOptions = products
        .filter((p) => !selectedProductIds.includes(p.id))
        .map((p) => ({
            value: p.id,
            label: `${p.product_name} (฿${Number(p.base_price).toLocaleString()})`,
        }))

    const addProduct = (productId: number) => {
        if (!selectedProductIds.includes(productId)) {
            setSelectedProductIds([...selectedProductIds, productId])
        }
    }

    const removeProduct = (productId: number) => {
        setSelectedProductIds(selectedProductIds.filter((pid) => pid !== productId))
    }

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
                    <div className="flex items-center gap-2">
                        <Button
                            variant="plain"
                            size="sm"
                            icon={<TbArrowLeft />}
                            onClick={() => navigate('/promotions')}
                        />
                        <h3>แก้ไขโปรโมชั่น</h3>
                        <Tag className="bg-gray-100 text-gray-600 border-0 ml-2">
                            {typeName}
                        </Tag>
                    </div>

                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                            <FormItem
                                label="ชื่อโปรโมชั่น"
                                invalid={Boolean(errors.promotion_name)}
                                errorMessage={errors.promotion_name?.message}
                            >
                                <Controller
                                    name="promotion_name"
                                    control={control}
                                    render={({ field }) => (
                                        <Input placeholder="กรอกชื่อโปรโมชั่น" {...field} />
                                    )}
                                />
                            </FormItem>

                            <div />

                            <FormItem label="วันที่เริ่ม (ไม่บังคับ)">
                                <Controller
                                    name="starts_at"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="datetime-local"
                                            value={field.value ?? ''}
                                            onChange={(e) => field.onChange(e.target.value || null)}
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem label="วันที่สิ้นสุด (ไม่บังคับ)">
                                <Controller
                                    name="ends_at"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="datetime-local"
                                            value={field.value ?? ''}
                                            onChange={(e) => field.onChange(e.target.value || null)}
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>

                        {/* Config fields */}
                        <div className="border rounded-lg p-4 mt-2 mb-4 bg-gray-50 dark:bg-gray-800">
                            <h5 className="mb-3">ตั้งค่าโปรโมชั่น</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                {showPercentDiscount && (
                                    <FormItem label="ส่วนลด (%)">
                                        <Controller
                                            name="percent_discount"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    type="number"
                                                    placeholder="เช่น 10"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                                                />
                                            )}
                                        />
                                    </FormItem>
                                )}

                                {showBahtDiscount && (
                                    <FormItem label="ส่วนลด (บาท)">
                                        <Controller
                                            name="baht_discount"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    type="number"
                                                    placeholder="เช่น 20"
                                                    step="0.01"
                                                    min="0"
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                                                />
                                            )}
                                        />
                                    </FormItem>
                                )}

                                {showSetDiscount && (
                                    <>
                                        <FormItem label="ราคาเซ็ตพิเศษ (บาท)">
                                            <Controller
                                                name="total_price_set_discount"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        type="number"
                                                        placeholder="เช่น 199"
                                                        step="0.01"
                                                        min="0"
                                                        value={field.value ?? ''}
                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                                                    />
                                                )}
                                            />
                                        </FormItem>
                                        <FormItem label="ราคาเต็มของเซ็ต (บาท)">
                                            <Controller
                                                name="old_price_set"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        type="number"
                                                        placeholder="เช่น 299"
                                                        step="0.01"
                                                        min="0"
                                                        value={field.value ?? ''}
                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                                                    />
                                                )}
                                            />
                                        </FormItem>
                                    </>
                                )}

                                {showCountCondition && (
                                    <FormItem label="จำนวนชิ้นที่ต้องซื้อ">
                                        <Controller
                                            name="count_condition_product"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    type="number"
                                                    placeholder="เช่น 3"
                                                    min="1"
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                                                />
                                            )}
                                        />
                                    </FormItem>
                                )}
                            </div>
                        </div>

                        {/* Product selection */}
                        {showProducts && (
                            <div className="border rounded-lg p-4 mb-4">
                                <h5 className="mb-3">สินค้าในโปรโมชั่น</h5>
                                <Select
                                    placeholder="ค้นหาและเลือกสินค้า..."
                                    options={productOptions}
                                    value={null}
                                    onChange={(opt: any) => {
                                        if (opt?.value) addProduct(opt.value)
                                    }}
                                />
                                {selectedProductIds.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {selectedProductIds.map((pid) => {
                                            const product = products.find((p) => p.id === pid)
                                            if (!product) return null
                                            return (
                                                <Tag
                                                    key={pid}
                                                    className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
                                                >
                                                    {product.product_name}
                                                    <button
                                                        type="button"
                                                        className="ml-1 hover:text-red-500"
                                                        onClick={() => removeProduct(pid)}
                                                    >
                                                        <TbX className="w-3.5 h-3.5" />
                                                    </button>
                                                </Tag>
                                            )
                                        })}
                                    </div>
                                )}
                                {selectedProductIds.length === 0 && (
                                    <p className="text-sm text-gray-400 mt-2">
                                        ยังไม่ได้เลือกสินค้า
                                    </p>
                                )}
                            </div>
                        )}

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
                                        <span>เปิดใช้งาน</span>
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
                            <Button onClick={() => navigate('/promotions')}>
                                ยกเลิก
                            </Button>
                        </div>
                    </Form>
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default PromotionEdit
