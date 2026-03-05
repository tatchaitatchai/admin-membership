import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'
import { TbPencil, TbTrash } from 'react-icons/tb'
import DataTable from '@/components/shared/DataTable'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { ProductFields } from '../types'
import type { TableQueries } from '@/@types/common'
import useProductList from '../hooks/useProductList'
import Dropdown from '@/components/ui/Dropdown'
import EllipsisButton from '@/components/shared/EllipsisButton'

const NameColumn = ({ row }: { row: ProductFields }) => {
    return (
        <span className="font-semibold text-gray-900 dark:text-gray-100">
            {row.name}
        </span>
    )
}

const StockColumn = ({ row }: { row: ProductFields }) => {
    return (
        <span
            className={`font-semibold ${
                row.stock === 0 ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'
            }`}
        >
            {row.stock.toLocaleString()}
        </span>
    )
}

const StatusColumn = ({ row }: { row: ProductFields }) => {
    const isActive = row.status === 'active'
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isActive
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-gray-100 text-gray-500'
            }`}
        >
            {isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
        </span>
    )
}

const ActionColumn = ({
    onEdit,
    onDelete,
}: {
    onEdit: () => void
    onDelete: () => void
}) => {
    return (
        <div className="flex items-center">
            <Dropdown
                placement="bottom-end"
                renderTitle={<EllipsisButton />}
            >
                <Dropdown.Item eventKey="edit" onClick={onEdit}>
                    <span className="text-lg">
                        <TbPencil />
                    </span>
                    <span>แก้ไข</span>
                </Dropdown.Item>
                <Dropdown.Item eventKey="delete" onClick={onDelete}>
                    <span className="text-lg text-red-500">
                        <TbTrash />
                    </span>
                    <span className="text-red-500">ลบ</span>
                </Dropdown.Item>
            </Dropdown>
        </div>
    )
}

const ProductListTable = () => {
    const navigate = useNavigate()
    const {
        productList,
        productListTotal,
        tableData,
        isLoading,
        setTableData,
        setSelectAllProduct,
        setSelectedProduct,
        selectedProduct,
    } = useProductList()

    const handleEdit = (product: ProductFields) => {
        navigate(`/products/edit/${product.id}`)
    }

    const handleDelete = (product: ProductFields) => {
        // TODO: Implement delete confirmation dialog
        console.log('Delete product:', product.id)
    }

    const columns: ColumnDef<ProductFields>[] = useMemo(
        () => [
            {
                header: 'ชื่อสินค้า',
                accessorKey: 'name',
                cell: (props) => {
                    return <NameColumn row={props.row.original} />
                },
            },
            {
                header: 'หมวดหมู่',
                accessorKey: 'category',
                cell: (props) => {
                    return (
                        <span className="text-gray-500">
                            {props.row.original.category}
                        </span>
                    )
                },
            },
            {
                header: 'ราคา',
                accessorKey: 'price',
                cell: (props) => {
                    return (
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            ฿{props.row.original.price.toLocaleString()}
                        </span>
                    )
                },
            },
            {
                header: 'สต็อก',
                accessorKey: 'stock',
                cell: (props) => {
                    return <StockColumn row={props.row.original} />
                },
            },
            {
                header: 'สถานะ',
                accessorKey: 'status',
                cell: (props) => {
                    return <StatusColumn row={props.row.original} />
                },
            },
            {
                header: 'จัดการ',
                id: 'action',
                cell: (props) => (
                    <ActionColumn
                        onEdit={() => handleEdit(props.row.original)}
                        onDelete={() => handleDelete(props.row.original)}
                    />
                ),
            },
        ],
        [],
    )

    const handleSetTableData = (data: TableQueries) => {
        setTableData(data)
        if (selectedProduct.length > 0) {
            setSelectAllProduct([])
        }
    }

    const handlePaginationChange = (page: number) => {
        const newTableData = cloneDeep(tableData)
        newTableData.pageIndex = page
        handleSetTableData(newTableData)
    }

    const handleSelectChange = (value: number) => {
        const newTableData = cloneDeep(tableData)
        newTableData.pageSize = Number(value)
        newTableData.pageIndex = 1
        handleSetTableData(newTableData)
    }

    const handleSort = (sort: OnSortParam) => {
        const newTableData = cloneDeep(tableData)
        newTableData.sort = sort
        handleSetTableData(newTableData)
    }

    const handleRowSelect = (checked: boolean, row: ProductFields) => {
        setSelectedProduct(checked, row)
    }

    const handleAllRowSelect = (
        checked: boolean,
        rows: Row<ProductFields>[],
    ) => {
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            setSelectAllProduct(originalRows)
        } else {
            setSelectAllProduct([])
        }
    }

    return (
        <DataTable
            selectable
            columns={columns}
            data={productList}
            noData={!isLoading && productList.length === 0}
            skeletonAvatarColumns={[0]}
            skeletonAvatarProps={{ width: 28, height: 28 }}
            loading={isLoading}
            pagingData={{
                total: productListTotal,
                pageIndex: tableData.pageIndex as number,
                pageSize: tableData.pageSize as number,
            }}
            checkboxChecked={(row) =>
                selectedProduct.some((selected) => selected.id === row.id)
            }
            onPaginationChange={handlePaginationChange}
            onSelectChange={handleSelectChange}
            onSort={handleSort}
            onCheckBoxChange={handleRowSelect}
            onIndeterminateCheckBoxChange={handleAllRowSelect}
        />
    )
}

export default ProductListTable
