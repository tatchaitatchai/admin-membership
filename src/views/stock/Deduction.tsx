import { PiPlusBold } from 'react-icons/pi'

const mockDeductions = [
    { id: 'DED-001', date: '2025-02-20', branch: 'สาขาสยาม', product: 'ขนมปังช็อกโกแลต', qty: 5, reason: 'สินค้าเสีย' },
    { id: 'DED-002', date: '2025-02-19', branch: 'สาขาลาดพร้าว', product: 'เค้กส้ม', qty: 2, reason: 'หมดอายุ' },
]

const Deduction = () => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="heading-text">ตัดสต็อก</h3>
                    <p className="text-sm text-gray-500 mt-0.5">ทั้งหมด {mockDeductions.length} รายการ</p>
                </div>
                <button className="btn btn-solid-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold">
                    <PiPlusBold /> บันทึกตัดสต็อก
                </button>
            </div>

            <div className="card card-shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">เลขที่</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">วันที่</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">สาขา</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">สินค้า</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">จำนวน</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">เหตุผล</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {mockDeductions.map((d) => (
                                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{d.id}</td>
                                    <td className="px-6 py-4 text-gray-500">{d.date}</td>
                                    <td className="px-6 py-4 text-gray-500">{d.branch}</td>
                                    <td className="px-6 py-4 text-gray-500">{d.product}</td>
                                    <td className="px-6 py-4 font-semibold text-red-400">{d.qty}</td>
                                    <td className="px-6 py-4 text-gray-500">{d.reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Deduction
