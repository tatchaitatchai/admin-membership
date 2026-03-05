import { PiPlusBold } from 'react-icons/pi'

const mockRequisitions = [
    { id: 'REQ-001', date: '2025-02-20', branch: 'สาขาสยาม', items: 3, status: 'pending' },
    { id: 'REQ-002', date: '2025-02-19', branch: 'สาขาลาดพร้าว', items: 5, status: 'approved' },
    { id: 'REQ-003', date: '2025-02-18', branch: 'สาขาบางนา', items: 2, status: 'rejected' },
]

const statusStyle: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-600',
    approved: 'bg-emerald-100 text-emerald-600',
    rejected: 'bg-red-100 text-red-500',
}
const statusLabel: Record<string, string> = {
    pending: 'รอดำเนินการ',
    approved: 'อนุมัติแล้ว',
    rejected: 'ปฏิเสธ',
}

const Requisition = () => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="heading-text">ใบเบิกสินค้า</h3>
                    <p className="text-sm text-gray-500 mt-0.5">ทั้งหมด {mockRequisitions.length} รายการ</p>
                </div>
                <button className="btn btn-solid-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold">
                    <PiPlusBold /> สร้างใบเบิก
                </button>
            </div>

            <div className="card card-shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">เลขที่ใบเบิก</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">วันที่</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">สาขา</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">จำนวนรายการ</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">สถานะ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {mockRequisitions.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{r.id}</td>
                                    <td className="px-6 py-4 text-gray-500">{r.date}</td>
                                    <td className="px-6 py-4 text-gray-500">{r.branch}</td>
                                    <td className="px-6 py-4 text-gray-500">{r.items} รายการ</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusStyle[r.status]}`}>
                                            {statusLabel[r.status]}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Requisition
