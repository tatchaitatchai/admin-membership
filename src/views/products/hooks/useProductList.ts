// This hook is deprecated. ProductList now fetches data directly.
// Kept for backward compatibility if any component still imports it.
export default function useProductList() {
    return {
        productList: [],
        productListTotal: 0,
        error: null,
        isLoading: false,
    }
}
