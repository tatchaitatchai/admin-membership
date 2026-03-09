import { useState, useEffect, useCallback, useMemo } from 'react'
import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Spinner from '@/components/ui/Spinner'
import {
    PiCurrencyDollarDuotone,
    PiShoppingCartDuotone,
    PiUserPlusDuotone,
    PiTrendUpDuotone,
    PiTrendDownDuotone,
    PiReceiptDuotone,
    PiWarningDuotone,
    PiUserMinusDuotone,
    PiCubeDuotone,
    PiVaultDuotone,
    PiShoppingBagDuotone,
    PiStorefrontDuotone,
} from 'react-icons/pi'
import { apiGetDashboard } from '@/services/DashboardService'
import type { DashboardResponse } from '@/services/DashboardService'

const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmtShort = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
    return fmt(n)
}

const pctChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0
    return ((curr - prev) / prev) * 100
}

const Dashboard = () => {
    const [data, setData] = useState<DashboardResponse | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchDashboard = useCallback(async () => {
        setLoading(true)
        try {
            const resp = await apiGetDashboard()
            setData(resp)
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    ไม่สามารถโหลดข้อมูล Dashboard ได้
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDashboard()
    }, [fetchDashboard])

    // ── Chart data ───────────────────────────────────────────────
    const salesChartSeries = useMemo(() => {
        if (!data?.sales_chart) return [{ name: 'ยอดขาย', data: [] as number[] }]
        return [{ name: 'ยอดขาย', data: data.sales_chart.map((d) => d.total_sales) }]
    }, [data])

    const salesChartCategories = useMemo(() => {
        if (!data?.sales_chart) return [] as string[]
        return data.sales_chart.map((d) => {
            const dt = new Date(d.date)
            return `${dt.getDate()}/${dt.getMonth() + 1}`
        })
    }, [data])

    const salesChartOptions: ApexOptions = useMemo(
        () => ({
            chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'Inter, sans-serif' },
            stroke: { curve: 'smooth', width: 2.5 },
            colors: ['#6366f1'],
            fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0.02, stops: [0, 100] } },
            xaxis: {
                categories: salesChartCategories,
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: { style: { colors: '#a3a3a3', fontSize: '11px' }, rotate: 0 },
                tickAmount: 10,
            },
            yaxis: {
                labels: {
                    style: { colors: '#a3a3a3', fontSize: '11px' },
                    formatter: (v: number) => `฿${fmtShort(v)}`,
                },
            },
            grid: { borderColor: '#f1f1f4', strokeDashArray: 3 },
            tooltip: {
                theme: 'light',
                y: { formatter: (v: number) => `฿${fmt(v)}` },
            },
            dataLabels: { enabled: false },
            legend: { show: false },
        }),
        [salesChartCategories],
    )

    // Payment donut
    const paymentDonutOptions: ApexOptions = useMemo(
        () => ({
            chart: { type: 'donut', fontFamily: 'Inter, sans-serif' },
            colors: ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'],
            labels: data?.payment_breakdown?.map((p) => p.method) ?? [],
            legend: { position: 'bottom', fontSize: '12px' },
            dataLabels: { enabled: false },
            plotOptions: { pie: { donut: { size: '65%' } } },
            tooltip: {
                y: { formatter: (v: number) => `฿${fmt(v)}` },
            },
        }),
        [data],
    )
    const paymentDonutSeries = useMemo(
        () => data?.payment_breakdown?.map((p) => p.amount) ?? [],
        [data],
    )

    // Branch bar chart
    const branchBarOptions: ApexOptions = useMemo(
        () => ({
            chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
            plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: '60%' } },
            colors: ['#6366f1'],
            xaxis: {
                labels: {
                    style: { colors: '#a3a3a3', fontSize: '11px' },
                    formatter: (v: string) => `฿${fmtShort(Number(v))}`,
                },
            },
            yaxis: { labels: { style: { fontSize: '12px' } } },
            grid: { borderColor: '#f1f1f4', strokeDashArray: 3 },
            dataLabels: { enabled: false },
            tooltip: { y: { formatter: (v: number) => `฿${fmt(v)}` } },
        }),
        [],
    )
    const branchBarSeries = useMemo(() => {
        if (!data?.branch_sales) return [{ data: [] as { x: string; y: number }[] }]
        return [
            {
                data: data.branch_sales.map((b) => ({
                    x: b.branch_name,
                    y: b.total_sales,
                })),
            },
        ]
    }, [data])

    // ── Summary cards config ─────────────────────────────────────
    const summaryCards = useMemo(() => {
        if (!data) return []
        const s = data.summary
        return [
            {
                title: 'ยอดขายวันนี้',
                value: `฿${fmt(s.today_sales)}`,
                sub: `${s.today_orders} ออเดอร์`,
                icon: <PiCurrencyDollarDuotone className="text-2xl" />,
                iconBg: 'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/20',
            },
            {
                title: 'ยอดขายเดือนนี้',
                value: `฿${fmtShort(s.month_sales)}`,
                change: pctChange(s.month_sales, s.prev_month_sales),
                sub: `${s.month_orders} ออเดอร์`,
                icon: <PiReceiptDuotone className="text-2xl" />,
                iconBg: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/20',
            },
            {
                title: 'จำนวนออเดอร์เดือนนี้',
                value: s.month_orders.toLocaleString(),
                change: pctChange(s.month_orders, s.prev_month_orders),
                icon: <PiShoppingCartDuotone className="text-2xl" />,
                iconBg: 'bg-amber-50 text-amber-500 dark:bg-amber-500/20',
            },
            {
                title: 'สมาชิกใหม่เดือนนี้',
                value: s.new_customers_month.toLocaleString(),
                change: pctChange(s.new_customers_month, s.prev_new_customers_month),
                icon: <PiUserPlusDuotone className="text-2xl" />,
                iconBg: 'bg-sky-50 text-sky-500 dark:bg-sky-500/20',
            },
        ]
    }, [data])

    // ── Fraud stats ──────────────────────────────────────────────
    const cancelChangePercent = useMemo(() => {
        if (!data) return 0
        const c = data.fraud_alerts.cancelled_orders
        return pctChange(c.this_month_count, c.prev_month_count)
    }, [data])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Spinner size={40} />
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center h-[60vh] text-gray-400">
                ไม่สามารถโหลดข้อมูลได้
            </div>
        )
    }

    const fraud = data.fraud_alerts

    return (
        <div className="flex flex-col gap-4">
            {/* ── Row 1: Summary Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {summaryCards.map((card) => (
                    <div
                        key={card.title}
                        className="card card-shadow p-5 flex items-center justify-between gap-3"
                    >
                        <div className="min-w-0">
                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-semibold">
                                {card.title}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                                {card.value}
                            </p>
                            {card.change !== undefined && (
                                <p
                                    className={`text-xs font-semibold mt-1 flex items-center gap-1 ${card.change >= 0 ? 'text-emerald-500' : 'text-red-400'}`}
                                >
                                    {card.change >= 0 ? (
                                        <PiTrendUpDuotone />
                                    ) : (
                                        <PiTrendDownDuotone />
                                    )}
                                    {card.change >= 0 ? '+' : ''}
                                    {card.change.toFixed(1)}% จากเดือนก่อน
                                </p>
                            )}
                            {card.sub && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {card.sub}
                                </p>
                            )}
                        </div>
                        <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${card.iconBg}`}
                        >
                            {card.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Row 2: Sales Chart + Payment Breakdown ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 card card-shadow">
                    <div className="flex items-center justify-between px-5 pt-5 pb-1">
                        <h6 className="font-bold text-gray-900 dark:text-gray-100">
                            ยอดขายรายวัน (30 วัน)
                        </h6>
                    </div>
                    <ReactApexChart
                        options={salesChartOptions}
                        series={salesChartSeries}
                        type="area"
                        height={280}
                    />
                </div>
                <div className="card card-shadow p-5">
                    <h6 className="font-bold text-gray-900 dark:text-gray-100 mb-3">
                        ช่องทางชำระเงิน
                    </h6>
                    {paymentDonutSeries.length > 0 ? (
                        <ReactApexChart
                            options={paymentDonutOptions}
                            series={paymentDonutSeries}
                            type="donut"
                            height={280}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
                            ยังไม่มีข้อมูล
                        </div>
                    )}
                </div>
            </div>

            {/* ── Row 3: Top Products + Branch Sales ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Top Products */}
                <div className="card card-shadow">
                    <div className="flex items-center gap-2 px-5 py-4">
                        <PiShoppingBagDuotone className="text-lg text-indigo-500" />
                        <h6 className="font-bold text-gray-900 dark:text-gray-100">
                            สินค้าขายดีเดือนนี้
                        </h6>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {(data.top_products ?? []).map((p, i) => (
                            <div
                                key={p.product_id}
                                className="flex items-center justify-between px-5 py-3"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                        {i + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                            {p.product_name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            ขาย {p.total_qty.toLocaleString()} ชิ้น
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex-shrink-0 ml-2">
                                    ฿{fmt(p.total_sales)}
                                </span>
                            </div>
                        ))}
                        {(!data.top_products || data.top_products.length === 0) && (
                            <div className="px-5 py-8 text-center text-gray-400 text-sm">
                                ยังไม่มีข้อมูล
                            </div>
                        )}
                    </div>
                </div>

                {/* Branch Sales */}
                <div className="card card-shadow">
                    <div className="flex items-center gap-2 px-5 py-4">
                        <PiStorefrontDuotone className="text-lg text-indigo-500" />
                        <h6 className="font-bold text-gray-900 dark:text-gray-100">
                            ยอดขายแยกสาขา (เดือนนี้)
                        </h6>
                    </div>
                    {branchBarSeries[0].data.length > 0 ? (
                        <ReactApexChart
                            options={branchBarOptions}
                            series={branchBarSeries}
                            type="bar"
                            height={Math.max(180, (data.branch_sales?.length ?? 0) * 50)}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
                            ยังไม่มีข้อมูล
                        </div>
                    )}
                </div>
            </div>

            {/* ── Row 4: Fraud Detection ── */}
            <div className="mt-2">
                <div className="flex items-center gap-2 mb-3">
                    <PiWarningDuotone className="text-xl text-red-500" />
                    <h5 className="font-bold text-gray-900 dark:text-gray-100">
                        ตรวจจับพฤติกรรมผิดปกติ
                    </h5>
                </div>

                {/* Fraud summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
                    <div className="card card-shadow p-4 border-l-4 border-red-400">
                        <p className="text-xs text-gray-400 font-semibold mb-1">
                            ออเดอร์ยกเลิก (เดือนนี้)
                        </p>
                        <p className="text-2xl font-bold text-red-500">
                            {fraud.cancelled_orders.this_month_count}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            มูลค่า ฿{fmt(fraud.cancelled_orders.this_month_value)}
                        </p>
                        <p
                            className={`text-xs font-semibold mt-1 flex items-center gap-1 ${cancelChangePercent > 0 ? 'text-red-400' : 'text-emerald-500'}`}
                        >
                            {cancelChangePercent > 0 ? (
                                <PiTrendUpDuotone />
                            ) : (
                                <PiTrendDownDuotone />
                            )}
                            {cancelChangePercent > 0 ? '+' : ''}
                            {cancelChangePercent.toFixed(1)}% จากเดือนก่อน
                        </p>
                    </div>
                    <div className="card card-shadow p-4 border-l-4 border-red-400">
                        <p className="text-xs text-gray-400 font-semibold mb-1">
                            ออเดอร์ยกเลิก (เดือนก่อน)
                        </p>
                        <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                            {fraud.cancelled_orders.prev_month_count}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            มูลค่า ฿{fmt(fraud.cancelled_orders.prev_month_value)}
                        </p>
                    </div>
                    <div className="card card-shadow p-4 border-l-4 border-amber-400">
                        <p className="text-xs text-gray-400 font-semibold mb-1">
                            สต็อกส่วนต่างผิดปกติ
                        </p>
                        <p className="text-2xl font-bold text-amber-500">
                            {fraud.stock_discrepancies?.length ?? 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            รายการ (2 เดือนล่าสุด)
                        </p>
                    </div>
                    <div className="card card-shadow p-4 border-l-4 border-orange-400">
                        <p className="text-xs text-gray-400 font-semibold mb-1">
                            เงินสดส่วนต่างผิดปกติ
                        </p>
                        <p className="text-2xl font-bold text-orange-500">
                            {fraud.cash_discrepancies?.length ?? 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            กะที่มีส่วนต่าง (2 เดือนล่าสุด)
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {/* Top cancel staff */}
                    <div className="card card-shadow">
                        <div className="flex items-center gap-2 px-5 py-4">
                            <PiUserMinusDuotone className="text-lg text-red-500" />
                            <h6 className="font-bold text-gray-900 dark:text-gray-100">
                                พนักงานที่ยกเลิกออเดอร์บ่อย
                            </h6>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                                        <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">
                                            พนักงาน
                                        </th>
                                        <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">
                                            ครั้ง
                                        </th>
                                        <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500">
                                            มูลค่ารวม
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(fraud.top_cancel_staff ?? []).map((s) => (
                                        <tr
                                            key={s.staff_id}
                                            className="border-t border-gray-100 dark:border-gray-700"
                                        >
                                            <td className="px-5 py-2.5 font-medium">
                                                {s.staff_email}
                                            </td>
                                            <td className="px-3 py-2.5 text-right">
                                                <span className="inline-flex items-center justify-center min-w-[28px] h-6 rounded-full bg-red-50 text-red-500 text-xs font-bold dark:bg-red-500/20">
                                                    {s.cancel_count}
                                                </span>
                                            </td>
                                            <td className="px-5 py-2.5 text-right font-semibold text-red-500">
                                                ฿{fmt(s.cancel_value)}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!fraud.top_cancel_staff ||
                                        fraud.top_cancel_staff.length === 0) && (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="px-5 py-6 text-center text-gray-400"
                                            >
                                                ไม่มีรายการ
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Stock discrepancies */}
                    <div className="card card-shadow">
                        <div className="flex items-center gap-2 px-5 py-4">
                            <PiCubeDuotone className="text-lg text-amber-500" />
                            <h6 className="font-bold text-gray-900 dark:text-gray-100">
                                สต็อกส่วนต่าง (นับสต็อกปิดกะ)
                            </h6>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                                        <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">
                                            สาขา
                                        </th>
                                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">
                                            สินค้า
                                        </th>
                                        <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">
                                            คาดหวัง
                                        </th>
                                        <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">
                                            จริง
                                        </th>
                                        <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">
                                            ส่วนต่าง
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(fraud.stock_discrepancies ?? []).map(
                                        (item, i) => (
                                            <tr
                                                key={i}
                                                className="border-t border-gray-100 dark:border-gray-700"
                                            >
                                                <td className="px-5 py-2.5 text-xs">
                                                    {item.branch_name}
                                                </td>
                                                <td className="px-3 py-2.5 font-medium">
                                                    {item.product_name}
                                                </td>
                                                <td className="px-3 py-2.5 text-right">
                                                    {item.expected_stock}
                                                </td>
                                                <td className="px-3 py-2.5 text-right">
                                                    {item.actual_stock}
                                                </td>
                                                <td
                                                    className={`px-3 py-2.5 text-right font-bold ${item.difference < 0 ? 'text-red-500' : 'text-emerald-500'}`}
                                                >
                                                    {item.difference > 0
                                                        ? '+'
                                                        : ''}
                                                    {item.difference}
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                    {(!fraud.stock_discrepancies ||
                                        fraud.stock_discrepancies.length ===
                                            0) && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-5 py-6 text-center text-gray-400"
                                            >
                                                ไม่มีรายการ
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Cash discrepancies — full width */}
                <div className="card card-shadow mt-4">
                    <div className="flex items-center gap-2 px-5 py-4">
                        <PiVaultDuotone className="text-lg text-orange-500" />
                        <h6 className="font-bold text-gray-900 dark:text-gray-100">
                            เงินสดส่วนต่าง (ปิดกะ)
                        </h6>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50">
                                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">
                                        สาขา
                                    </th>
                                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">
                                        กะ #
                                    </th>
                                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">
                                        ยอดคาดหวัง
                                    </th>
                                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">
                                        ยอดจริง
                                    </th>
                                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">
                                        ส่วนต่าง
                                    </th>
                                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">
                                        ปิดโดย
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {(fraud.cash_discrepancies ?? []).map((item, i) => (
                                    <tr
                                        key={i}
                                        className="border-t border-gray-100 dark:border-gray-700"
                                    >
                                        <td className="px-5 py-2.5">
                                            {item.branch_name}
                                        </td>
                                        <td className="px-3 py-2.5 text-xs text-gray-500">
                                            #{item.shift_id}
                                        </td>
                                        <td className="px-3 py-2.5 text-right">
                                            ฿{fmt(item.expected)}
                                        </td>
                                        <td className="px-3 py-2.5 text-right">
                                            ฿{fmt(item.actual)}
                                        </td>
                                        <td
                                            className={`px-3 py-2.5 text-right font-bold ${item.difference < 0 ? 'text-red-500' : item.difference > 0 ? 'text-emerald-500' : ''}`}
                                        >
                                            {item.difference > 0 ? '+' : ''}฿
                                            {fmt(item.difference)}
                                        </td>
                                        <td className="px-5 py-2.5 text-xs text-gray-500">
                                            {item.closed_by_email}
                                        </td>
                                    </tr>
                                ))}
                                {(!fraud.cash_discrepancies ||
                                    fraud.cash_discrepancies.length === 0) && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-6 text-center text-gray-400"
                                        >
                                            ไม่มีรายการ
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
