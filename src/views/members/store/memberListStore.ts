import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'
import type { MemberFields, Filter } from '../types'

export const initialTableData: TableQueries = {
    pageIndex: 1,
    pageSize: 10,
    query: '',
    sort: {
        order: '',
        key: '',
    },
}

export const initialFilterData: Filter = {
    status: '',
}

export type MemberListState = {
    tableData: TableQueries
    filterData: Filter
    selectedMember: Partial<MemberFields>[]
}

type MemberListAction = {
    setFilterData: (payload: Filter) => void
    setTableData: (payload: TableQueries) => void
    setSelectedMember: (checked: boolean, member: MemberFields) => void
    setSelectAllMember: (members: MemberFields[]) => void
}

const initialState: MemberListState = {
    tableData: initialTableData,
    filterData: initialFilterData,
    selectedMember: [],
}

export const useMemberListStore = create<MemberListState & MemberListAction>(
    (set) => ({
        ...initialState,
        setFilterData: (payload) => set(() => ({ filterData: payload })),
        setTableData: (payload) => set(() => ({ tableData: payload })),
        setSelectedMember: (checked, row) =>
            set((state) => {
                const prevData = state.selectedMember
                if (checked) {
                    return { selectedMember: [...prevData, row] }
                } else {
                    return {
                        selectedMember: prevData.filter(
                            (prev) => prev.id !== row.id,
                        ),
                    }
                }
            }),
        setSelectAllMember: (row) => set(() => ({ selectedMember: row })),
    }),
)
