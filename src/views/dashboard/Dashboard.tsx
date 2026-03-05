import { useState } from 'react'
import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import {
    PiCurrencyDollarDuotone,
    PiShoppingCartDuotone,
    PiEyeDuotone,
    PiTrendUpDuotone,
    PiTrendDownDuotone,
} from 'react-icons/pi'

const chartSeries = [{ name: 'ยอดขาย', data: [220, 280, 250, 310, 290, 340, 300, 380, 330, 420, 370, 480] }]

const chartOptions: ApexOptions = {
    chart: { type: 'line', toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'Inter, sans-serif' },
    stroke: { curve: 'smooth', width: 3 },
    colors: ['#2a85ff'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.15, opacityTo: 0, stops: [0, 100] } },
    xaxis: {
        categories: ['01 Jun', '02 Jun', '03 Jun', '04 Jun', '05 Jun', '06 Jun', '07 Jun', '08 Jun', '09 Jun', '10 Jun', '11 Jun', '12 Jun'],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#a3a3a3', fontSize: '12px' } },
    },
    yaxis: { labels: { style: { colors: '#a3a3a3', fontSize: '12px' } } },
    grid: { borderColor: '#f5f5f5', strokeDashArray: 4 },
    tooltip: { theme: 'light' },
    dataLabels: { enabled: false },
    legend: { show: false },
}

const donutOptions: ApexOptions = {
    chart: { type: 'radialBar', fontFamily: 'Inter, sans-serif' },
    plotOptions: {
        radialBar: {
            hollow: { size: '65%' },
            dataLabels: { name: { show: false }, value: { fontSize: '20px', fontWeight: 700, color: '#171717', offsetY: 8 } },
            track: { background: '#f5f5f5' },
        },
    },
    colors: ['#2a85ff'],
    labels: ['เป้าหมาย'],
}

const statCards = [
    { title: 'Total profit', value: '$82,373.21', change: '+3.4%', up: true, icon: <PiCurrencyDollarDuotone className="text-2xl" />, iconBg: 'bg-[rgba(42,133,255,0.1)] text-[#2a85ff]' },
    { title: 'Total order', value: '7,234', change: '-2.8%', up: false, icon: <PiShoppingCartDuotone className="text-2xl" />, iconBg: 'bg-[rgba(5,235,118,0.14)] text-[#10b981]' },
    { title: 'Impression', value: '3.1M', change: '+4.6%', up: true, icon: <PiEyeDuotone className="text-2xl" />, iconBg: 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b]' },
]

const topProducts = [
    { name: 'ขนมปังช็อกโกแลต', sold: 1249, change: +15.2 },
    { name: 'ครัวซองต์เนย', sold: 1145, change: +13.9 },
    { name: 'เค้กส้ม', sold: 1073, change: +9.5 },
    { name: 'คุกกี้ชิพ', sold: 1022, change: +2.3 },
    { name: 'โดนัทน้ำตาล', sold: 992, change: -0.7 },
    { name: 'มัฟฟินบลูเบอร์รี่', sold: 987, change: -1.1 },
]

const Dashboard = () => {
    const [_period, setPeriod] = useState('monthly')

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Left: stat cards + chart */}
                <div className="xl:col-span-2 flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {statCards.map((s) => (
                            <div key={s.title} className="card card-shadow p-5 flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-400 mb-1 font-semibold">{s.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 truncate">{s.value}</p>
                                    <p className={`text-xs font-semibold mt-1.5 flex items-center gap-1 ${s.up ? 'text-emerald-500' : 'text-red-400'}`}>
                                        {s.up ? <PiTrendUpDuotone /> : <PiTrendDownDuotone />}
                                        {s.change} from last month
                                    </p>
                                </div>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
                                    {s.icon}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="card card-shadow">
                        <div className="flex items-center justify-between px-5 pt-5 pb-2">
                            <h6 className="font-bold text-gray-900">Overview</h6>
                            <select
                                className="text-xs font-semibold text-gray-500 bg-gray-100 border-0 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
                                onChange={(e) => setPeriod(e.target.value)}
                            >
                                <option value="monthly">Monthly</option>
                                <option value="weekly">Weekly</option>
                                <option value="daily">Daily</option>
                            </select>
                        </div>
                        <ReactApexChart options={chartOptions} series={chartSeries} type="area" height={260} />
                    </div>
                </div>

                {/* Right: sales target + top products */}
                <div className="flex flex-col gap-4">
                    <div className="card card-shadow p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="font-bold text-gray-900">Sales target</h6>
                            <select className="text-xs font-semibold text-gray-500 bg-gray-100 border-0 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer">
                                <option>Monthly</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-4">
                            <ReactApexChart options={donutOptions} series={[75]} type="radialBar" height={120} width={120} />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">1.3K <span className="text-sm font-medium text-gray-400">/ 1.8K Units</span></p>
                                <p className="text-xs text-gray-400 mt-1">Made this month year</p>
                            </div>
                        </div>
                    </div>

                    <div className="card card-shadow">
                        <div className="flex items-center justify-between px-5 py-4">
                            <h6 className="font-bold text-gray-900">Top product</h6>
                            <button className="text-xs font-bold text-[#2a85ff] hover:underline">View all</button>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {topProducts.map((p) => (
                                <div key={p.name} className="flex items-center justify-between px-5 py-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <PiEyeDuotone className="text-gray-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                                            <p className="text-xs text-gray-400">Sold: {p.sold.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold flex-shrink-0 ml-2 ${p.change >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                                        {p.change >= 0 ? '+' : ''}{p.change}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
