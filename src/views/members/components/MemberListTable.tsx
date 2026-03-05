import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'
import { TbPencil, TbTrash } from 'react-icons/tb'
import DataTable from '@/components/shared/DataTable'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { MemberFields } from '../types'
import type { TableQueries } from '@/@types/common'
import useMemberList from '../hooks/useMemberList'
import Dropdown from '@/components/ui/Dropdown'
import EllipsisButton from '@/components/shared/EllipsisButton'

const NameColumn = ({ row }: { row: MemberFields }) => {
    return (
        <span className="font-semibold text-gray-900 dark:text-gray-100">
            {row.name}
        </span>
    )
}

const StatusColumn = ({ row }: { row: MemberFields }) => {
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

const MemberListTable = () => {
    const navigate = useNavigate()
    const {
        memberList,
        memberListTotal,
        tableData,
        isLoading,
        setTableData,
        setSelectAllMember,
        setSelectedMember,
        selectedMember,
    } = useMemberList()

    const handleEdit = (member: MemberFields) => {
        navigate(`/members/edit/${member.id}`)
    }

    const handleDelete = (member: MemberFields) => {
        // TODO: Implement delete confirmation dialog
        console.log('Delete member:', member.id)
    }

    const columns: ColumnDef<MemberFields>[] = useMemo(
        () => [
            {
                header: 'ชื่อ',
                accessorKey: 'name',
                cell: (props) => {
                    const row = props.row.original
                    return <NameColumn row={row} />
                },
            },
            {
                header: 'เบอร์โทร',
                accessorKey: 'phone',
                cell: (props) => {
                    return (
                        <span className="text-gray-500">
                            {props.row.original.phone}
                        </span>
                    )
                },
            },
            {
                header: 'สาขา',
                accessorKey: 'branch',
                cell: (props) => {
                    return (
                        <span className="text-gray-500">
                            {props.row.original.branch}
                        </span>
                    )
                },
            },
            {
                header: 'แต้ม',
                accessorKey: 'points',
                cell: (props) => {
                    return (
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {props.row.original.points.toLocaleString()}
                        </span>
                    )
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
        if (selectedMember.length > 0) {
            setSelectAllMember([])
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

    const handleRowSelect = (checked: boolean, row: MemberFields) => {
        setSelectedMember(checked, row)
    }

    const handleAllRowSelect = (
        checked: boolean,
        rows: Row<MemberFields>[],
    ) => {
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            setSelectAllMember(originalRows)
        } else {
            setSelectAllMember([])
        }
    }

    return (
        <DataTable
            selectable
            columns={columns}
            data={memberList}
            noData={!isLoading && memberList.length === 0}
            skeletonAvatarColumns={[0]}
            skeletonAvatarProps={{ width: 28, height: 28 }}
            loading={isLoading}
            pagingData={{
                total: memberListTotal,
                pageIndex: tableData.pageIndex as number,
                pageSize: tableData.pageSize as number,
            }}
            checkboxChecked={(row) =>
                selectedMember.some((selected) => selected.id === row.id)
            }
            onPaginationChange={handlePaginationChange}
            onSelectChange={handleSelectChange}
            onSort={handleSort}
            onCheckBoxChange={handleRowSelect}
            onIndeterminateCheckBoxChange={handleAllRowSelect}
        />
    )
}

export default MemberListTable
