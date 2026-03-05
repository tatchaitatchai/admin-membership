import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import ProductListTable from './components/ProductListTable'
import ProductListActionTools from './components/ProductListActionTools'
import ProductListTableTools from './components/ProductListTableTools'

const ProductList = () => {
    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3>จัดการสินค้า</h3>
                        <ProductListActionTools />
                    </div>
                    <ProductListTableTools />
                    <ProductListTable />
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default ProductList
