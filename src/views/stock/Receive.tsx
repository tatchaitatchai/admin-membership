import { PiPlusBold } from 'react-icons/pi'

const mockReceives = [
    { id: 'RCV-001', date: '2025-02-20', sender: 'ซัพพลายเออร์ A', branch: 'คลังกลาง', product: 'ขนมปังช็อกโกแลต', qty: 200 },
    { id: 'RCV-002', date: '2025-02-18', sender: 'ซัพพลายเออร์ B', branch: 'คลังกลาง', product: 'ครัวซองต์เนย', qty: 150 },
]

const Receive = () => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="heading-text">รับสินค้า</h3>
                    <p className="text-sm text-gray-500 mt-0.5">ทั้งหมด {mockReceives.length} รายการ</p>
                </div>
                <button className="btn btn-solid-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold">
                    <PiPlusBold /> บันทึกรับสินค้า
                </button>
            </div>

            <div className="card card-shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">เลขที่</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">วันที่</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">ผู้ส่ง</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">รับที่</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">สินค้า</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">จำนวน</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {mockReceives.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{r.id}</td>
                                    <td className="px-6 py-4 text-gray-500">{r.date}</td>
                                    <td className="px-6 py-4 text-gray-500">{r.sender}</td>
                                    <td className="px-6 py-4 text-gray-500">{r.branch}</td>
                                    <td className="px-6 py-4 text-gray-500">{r.product}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">{r.qty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Receive
