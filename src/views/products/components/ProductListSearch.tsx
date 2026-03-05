import { useRef } from 'react'
import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'

type ProductListSearchProps = {
    onInputChange: (value: string) => void
}

const ProductListSearch = ({ onInputChange }: ProductListSearchProps) => {
    const inputRef = useRef<HTMLInputElement>(null)

    return (
        <DebouceInput
            ref={inputRef}
            placeholder="ค้นหาสินค้า..."
            suffix={<TbSearch className="text-lg" />}
            onChange={(e) => onInputChange(e.target.value)}
        />
    )
}

export default ProductListSearch
