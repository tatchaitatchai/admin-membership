import { PiPlusBold } from 'react-icons/pi'

const mockWithdrawals = [
    { id: 'WD-001', date: '2025-02-20', from: 'คลังกลาง', to: 'สาขาสยาม', product: 'ขนมปังช็อกโกแลต', qty: 50 },
    { id: 'WD-002', date: '2025-02-19', from: 'คลังกลาง', to: 'สาขาลาดพร้าว', product: 'ครัวซองต์เนย', qty: 30 },
    { id: 'WD-003', date: '2025-02-18', from: 'คลังกลาง', to: 'สาขาบางนา', product: 'เค้กส้ม', qty: 15 },
]

const Withdraw = () => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="heading-text">เบิกสินค้า</h3>
                    <p className="text-sm text-gray-500 mt-0.5">ทั้งหมด {mockWithdrawals.length} รายการ</p>
                </div>
                <button className="btn btn-solid-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold">
                    <PiPlusBold /> เบิกสินค้า
                </button>
            </div>

            <div className="card card-shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">เลขที่</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">วันที่</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">จาก</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">ไปยัง</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">สินค้า</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">จำนวน</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {mockWithdrawals.map((w) => (
                                <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{w.id}</td>
                                    <td className="px-6 py-4 text-gray-500">{w.date}</td>
                                    <td className="px-6 py-4 text-gray-500">{w.from}</td>
                                    <td className="px-6 py-4 text-gray-500">{w.to}</td>
                                    <td className="px-6 py-4 text-gray-500">{w.product}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">{w.qty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Withdraw
