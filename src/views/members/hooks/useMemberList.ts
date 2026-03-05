import { useMemberListStore } from '../store/memberListStore'
import type { MemberFields } from '../types'

// TODO: Replace mock data with real API call using SWR
// import useSWR from 'swr'
// import { apiGetMembersList } from '@/services/MemberService'

const mockMembers: MemberFields[] = [
    { id: '1', name: 'สมชาย ใจดี', phone: '081-234-5678', branch: 'สาขาสยาม', points: 1250, status: 'active' },
    { id: '2', name: 'วิชัย รักดี', phone: '082-345-6789', branch: 'สาขาลาดพร้าว', points: 890, status: 'active' },
    { id: '3', name: 'มานี สุขใจ', phone: '083-456-7890', branch: 'สาขาสยาม', points: 450, status: 'inactive' },
    { id: '4', name: 'สมหญิง มีสุข', phone: '084-567-8901', branch: 'สาขาบางนา', points: 2100, status: 'active' },
    { id: '5', name: 'ประสิทธิ์ ดีงาม', phone: '085-678-9012', branch: 'สาขาลาดพร้าว', points: 320, status: 'active' },
]

export default function useMemberList() {
    const {
        tableData,
        filterData,
        setTableData,
        selectedMember,
        setSelectedMember,
        setSelectAllMember,
        setFilterData,
    } = useMemberListStore((state) => state)

    // TODO: Replace with real API call
    // const { data, error, isLoading, mutate } = useSWR(
    //     ['/api/members', { ...tableData }],
    //     ([_, params]) => apiGetMembersList(params),
    //     { revalidateOnFocus: false },
    // )

    // Filter mock data based on search query
    const query = tableData.query?.toLowerCase() || ''
    const statusFilter = filterData.status

    let filtered = mockMembers.filter(
        (m) =>
            m.name.toLowerCase().includes(query) ||
            m.phone.includes(query),
    )

    if (statusFilter) {
        filtered = filtered.filter((m) => m.status === statusFilter)
    }

    // Sort
    if (tableData.sort?.key) {
        const { key, order } = tableData.sort
        filtered = [...filtered].sort((a, b) => {
            const aVal = a[key as keyof MemberFields]
            const bVal = b[key as keyof MemberFields]
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return order === 'asc' ? aVal - bVal : bVal - aVal
            }
            const aStr = String(aVal)
            const bStr = String(bVal)
            return order === 'asc'
                ? aStr.localeCompare(bStr)
                : bStr.localeCompare(aStr)
        })
    }

    // Paginate
    const pageSize = tableData.pageSize || 10
    const pageIndex = tableData.pageIndex || 1
    const total = filtered.length
    const paginated = filtered.slice(
        (pageIndex - 1) * pageSize,
        pageIndex * pageSize,
    )

    return {
        memberList: paginated,
        memberListTotal: total,
        error: null,
        isLoading: false,
        tableData,
        filterData,
        mutate: () => {},
        setTableData,
        selectedMember,
        setSelectedMember,
        setSelectAllMember,
        setFilterData,
    }
}
