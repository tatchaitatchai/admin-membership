import { useState } from 'react'
import { TbFilter } from 'react-icons/tb'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Select from '@/components/ui/Select'
import useMemberList from '../hooks/useMemberList'

const statusOptions = [
    { value: '', label: 'ทั้งหมด' },
    { value: 'active', label: 'ใช้งาน' },
    { value: 'inactive', label: 'ไม่ใช้งาน' },
]

const MemberListTableFilter = () => {
    const [dialogIsOpen, setIsOpen] = useState(false)
    const { filterData, setFilterData, setTableData, tableData } = useMemberList()
    const [tempStatus, setTempStatus] = useState(filterData.status)

    const openDialog = () => {
        setTempStatus(filterData.status)
        setIsOpen(true)
    }

    const onDialogClose = () => {
        setIsOpen(false)
    }

    const onSubmit = () => {
        setFilterData({ status: tempStatus })
        setTableData({ ...tableData, pageIndex: 1 })
        setIsOpen(false)
    }

    const onReset = () => {
        setTempStatus('')
    }

    return (
        <>
            <Button icon={<TbFilter />} onClick={openDialog}>
                Filter
            </Button>
            <Dialog
                isOpen={dialogIsOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <h4 className="mb-4">ค้นหา</h4>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        สถานะ
                    </label>
                    <Select
                        placeholder="เลือกสถานะ"
                        options={statusOptions}
                        value={statusOptions.find(
                            (opt) => opt.value === tempStatus,
                        )}
                        onChange={(opt) => setTempStatus(opt?.value || '')}
                    />
                </div>
                <div className="flex justify-end items-center gap-2 mt-4">
                    <Button type="button" onClick={onReset}>
                        Reset
                    </Button>
                    <Button variant="solid" onClick={onSubmit}>
                        Apply
                    </Button>
                </div>
            </Dialog>
        </>
    )
}

export default MemberListTableFilter
