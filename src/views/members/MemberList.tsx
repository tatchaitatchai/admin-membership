import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import MemberListTable from './components/MemberListTable'
import MemberListActionTools from './components/MemberListActionTools'
import MemberListTableTools from './components/MemberListTableTools'

const MemberList = () => {
    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3>จัดการสมาชิก</h3>
                        <MemberListActionTools />
                    </div>
                    <MemberListTableTools />
                    <MemberListTable />
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default MemberList
