import useProductList from '../hooks/useProductList'
import ProductListSearch from './ProductListSearch'
import ProductListTableFilter from './ProductListTableFilter'
import cloneDeep from 'lodash/cloneDeep'

const ProductListTableTools = () => {
    const { tableData, setTableData } = useProductList()

    const handleInputChange = (val: string) => {
        const newTableData = cloneDeep(tableData)
        newTableData.query = val
        newTableData.pageIndex = 1
        setTableData(newTableData)
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <ProductListSearch onInputChange={handleInputChange} />
            <ProductListTableFilter />
        </div>
    )
}

export default ProductListTableTools
