import useSWR from 'swr'
import { apiGetMembersList } from '@/services/MemberService'
import { useMemberListStore } from '../store/memberListStore'

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

    const { data, error, isLoading, mutate } = useSWR(
        ['/api/members', { ...tableData }],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, params]) => apiGetMembersList(params),
        { revalidateOnFocus: false },
    )

    const memberList = data?.members ?? []
    const total = data?.total ?? 0

    return {
        memberList,
        memberListTotal: total,
        error,
        isLoading,
        tableData,
        filterData,
        mutate,
        setTableData,
        selectedMember,
        setSelectedMember,
        setSelectAllMember,
        setFilterData,
    }
}
