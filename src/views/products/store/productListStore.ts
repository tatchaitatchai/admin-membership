import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'
import type { ProductFields, Filter } from '../types'

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
    category: '',
    status: '',
}

export type ProductListState = {
    tableData: TableQueries
    filterData: Filter
    selectedProduct: Partial<ProductFields>[]
}

type ProductListAction = {
    setFilterData: (payload: Filter) => void
    setTableData: (payload: TableQueries) => void
    setSelectedProduct: (checked: boolean, product: ProductFields) => void
    setSelectAllProduct: (products: ProductFields[]) => void
}

const initialState: ProductListState = {
    tableData: initialTableData,
    filterData: initialFilterData,
    selectedProduct: [],
}

export const useProductListStore = create<ProductListState & ProductListAction>(
    (set) => ({
        ...initialState,
        setFilterData: (payload) => set(() => ({ filterData: payload })),
        setTableData: (payload) => set(() => ({ tableData: payload })),
        setSelectedProduct: (checked, row) =>
            set((state) => {
                const prevData = state.selectedProduct
                if (checked) {
                    return { selectedProduct: [...prevData, row] }
                } else {
                    return {
                        selectedProduct: prevData.filter(
                            (prev) => prev.id !== row.id,
                        ),
                    }
                }
            }),
        setSelectAllProduct: (row) => set(() => ({ selectedProduct: row })),
    }),
)
