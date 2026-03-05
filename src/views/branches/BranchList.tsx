import { TbPlus, TbMapPin, TbPhone, TbUser } from 'react-icons/tb'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useNavigate } from 'react-router-dom'

const mockBranches = [
    { id: '1', name: 'สาขาสยาม', address: '999 ถ.พระราม 1 ปทุมวัน กรุงเทพฯ', phone: '02-111-2222', manager: 'สมชาย ใจดี', status: 'open' },
    { id: '2', name: 'สาขาลาดพร้าว', address: '1234 ถ.ลาดพร้าว จตุจักร กรุงเทพฯ', phone: '02-333-4444', manager: 'วิชัย รักดี', status: 'open' },
    { id: '3', name: 'สาขาบางนา', address: '567 ถ.บางนา-ตราด บางนา กรุงเทพฯ', phone: '02-555-6666', manager: 'มานี สุขใจ', status: 'closed' },
]

const BranchList = () => {
    const navigate = useNavigate()

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3>จัดการสาขา</h3>
                        <Button
                            variant="solid"
                            icon={<TbPlus className="text-xl" />}
                            onClick={() => navigate('/branches/create')}
                        >
                            เพิ่มสาขา
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {mockBranches.map((b) => (
                            <Card key={b.id}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                        <TbMapPin className="text-xl" />
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${b.status === 'open' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                                        {b.status === 'open' ? 'เปิด' : 'ปิด'}
                                    </span>
                                </div>
                                <h6 className="font-bold text-gray-900 dark:text-gray-100 mb-1">{b.name}</h6>
                                <p className="text-xs text-gray-400 mb-3 leading-relaxed">{b.address}</p>
                                <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                                    <span className="flex items-center gap-1.5">
                                        <TbPhone className="text-sm" /> {b.phone}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <TbUser className="text-sm" /> {b.manager}
                                    </span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default BranchList
