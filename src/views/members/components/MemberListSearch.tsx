import { useRef } from 'react'
import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'

type MemberListSearchProps = {
    onInputChange: (value: string) => void
}

const MemberListSearch = ({ onInputChange }: MemberListSearchProps) => {
    const inputRef = useRef<HTMLInputElement>(null)

    return (
        <DebouceInput
            ref={inputRef}
            placeholder="ค้นหาชื่อ, เบอร์โทร..."
            suffix={<TbSearch className="text-lg" />}
            onChange={(e) => onInputChange(e.target.value)}
        />
    )
}

export default MemberListSearch
