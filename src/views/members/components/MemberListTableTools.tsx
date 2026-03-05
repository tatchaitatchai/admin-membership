import useMemberList from '../hooks/useMemberList'
import MemberListSearch from './MemberListSearch'
import MemberListTableFilter from './MemberListTableFilter'
import cloneDeep from 'lodash/cloneDeep'

const MemberListTableTools = () => {
    const { tableData, setTableData } = useMemberList()

    const handleInputChange = (val: string) => {
        const newTableData = cloneDeep(tableData)
        newTableData.query = val
        newTableData.pageIndex = 1
        setTableData(newTableData)
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <MemberListSearch onInputChange={handleInputChange} />
            <MemberListTableFilter />
        </div>
    )
}

export default MemberListTableTools
