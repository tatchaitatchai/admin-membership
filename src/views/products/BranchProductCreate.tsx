import { useState, useEffect, useMemo } from 'react'
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
import { TbArrowLeft } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    apiCreateBranchProduct,
    apiListProducts,
    apiListBranchProducts,
} from '@/services/ProductService'
import { apiListBranches } from '@/services/StaffManagementService'
import type { BranchOption } from '@/views/staff-management/types'
import type { ProductFields } from './types'
import { getErrorMessage } from '@/utils/errorHandler'

const schema = z.object({
    branch_id: z.number({ required_error: 'กรุณาเลือกสาขา' }).min(1, 'กรุณาเลือกสาขา'),
    product_id: z.number({ required_error: 'กรุณาเลือกสินค้า' }).min(1, 'กรุณาเลือกสินค้า'),
    on_stock: z.number().min(0, 'จำนวนต้องไม่ต่ำกว่า 0'),
    reorder_level: z.number().min(0, 'จุดสั่งซื้อต้องไม่ต่ำกว่า 0'),
    is_active: z.boolean(),
})

type FormSchema = z.infer<typeof schema>

const BranchProductCreate = () => {
    const navigate = useNavigate()
    const [branches, setBranches] = useState<BranchOption[]>([])
    const [products, setProducts] = useState<ProductFields[]>([])
    const [submitting, setSubmitting] = useState(false)

    const [existingProductIds, setExistingProductIds] = useState<Set<number>>(new Set())
    const [loadingProducts, setLoadingProducts] = useState(false)

    const {
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormSchema>({
        defaultValues: {
            branch_id: 0,
            product_id: 0,
            on_stock: 0,
            reorder_level: 0,
            is_active: true,
        },
        resolver: zodResolver(schema),
    })

    const watchedBranchId = watch('branch_id')

    useEffect(() => {
        apiListBranches()
            .then((data) => setBranches(data ?? []))
            .catch(() => {})
        apiListProducts({ limit: 500 })
            .then((resp) => setProducts(resp.data ?? []))
            .catch(() => {})
    }, [])

    useEffect(() => {
        if (watchedBranchId && watchedBranchId > 0) {
            setLoadingProducts(true)
            apiListBranchProducts({ branch_id: watchedBranchId, limit: 500 })
                .then((resp) => {
                    const ids = new Set((resp.data ?? []).map((item) => item.product_id))
                    setExistingProductIds(ids)
                })
                .catch(() => setExistingProductIds(new Set()))
                .finally(() => setLoadingProducts(false))
            setValue('product_id', 0)
        } else {
            setExistingProductIds(new Set())
        }
    }, [watchedBranchId, setValue])

    const onSubmit = async (values: FormSchema) => {
        setSubmitting(true)
        try {
            await apiCreateBranchProduct({
                branch_id: values.branch_id,
                product_id: values.product_id,
                on_stock: values.on_stock,
                reorder_level: values.reorder_level,
                is_active: values.is_active,
            })
            toast.push(
                <Notification type="success" title="สำเร็จ">
                    เพิ่มสินค้าสาขาแล้ว
                </Notification>,
            )
            navigate('/products/branch-products')
        } catch (err: any) {
            const errorMessage = await getErrorMessage(err, 'ไม่สามารถเพิ่มสินค้าสาขาได้')
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

    const productOptions = useMemo(
        () =>
            products
                .filter((p) => !existingProductIds.has(p.id))
                .map((p) => ({
                    value: p.id,
                    label: `${p.product_name}${p.category_name ? ` (${p.category_name})` : ''}`,
                })),
        [products, existingProductIds],
    )

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="plain"
                            size="sm"
                            icon={<TbArrowLeft />}
                            onClick={() => navigate('/products/branch-products')}
                        />
                        <h3>เพิ่มสินค้าสาขา</h3>
                    </div>

                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
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
                                            placeholder="เลือกสาขา"
                                            options={branchOptions}
                                            value={branchOptions.find(
                                                (o) => o.value === field.value,
                                            ) ?? null}
                                            onChange={(opt) =>
                                                field.onChange(opt?.value ?? 0)
                                            }
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="สินค้าหลัก"
                                invalid={Boolean(errors.product_id)}
                                errorMessage={errors.product_id?.message}
                            >
                                <Controller
                                    name="product_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            placeholder={
                                                watchedBranchId > 0
                                                    ? loadingProducts
                                                        ? 'กำลังโหลด...'
                                                        : 'เลือกสินค้า'
                                                    : 'กรุณาเลือกสาขาก่อน'
                                            }
                                            isDisabled={!watchedBranchId || watchedBranchId === 0}
                                            isLoading={loadingProducts}
                                            noOptionsMessage={() => 'สินค้าทั้งหมดถูกเพิ่มในสาขานี้แล้ว'}
                                            options={productOptions}
                                            value={productOptions.find(
                                                (o) => o.value === field.value,
                                            ) ?? null}
                                            onChange={(opt) =>
                                                field.onChange(opt?.value ?? 0)
                                            }
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="จำนวนคงเหลือ"
                                invalid={Boolean(errors.on_stock)}
                                errorMessage={errors.on_stock?.message}
                            >
                                <Controller
                                    name="on_stock"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            min="0"
                                            value={field.value || ''}
                                            onChange={(e) =>
                                                field.onChange(parseInt(e.target.value) || 0)
                                            }
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="จุดสั่งซื้อ (Reorder Level)"
                                invalid={Boolean(errors.reorder_level)}
                                errorMessage={errors.reorder_level?.message}
                            >
                                <Controller
                                    name="reorder_level"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            min="0"
                                            value={field.value || ''}
                                            onChange={(e) =>
                                                field.onChange(parseInt(e.target.value) || 0)
                                            }
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>

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
                                loading={submitting}
                            >
                                บันทึก
                            </Button>
                            <Button
                                onClick={() => navigate('/products/branch-products')}
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

export default BranchProductCreate
