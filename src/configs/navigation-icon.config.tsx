import {
    PiHouseLineDuotone,
    PiUsersDuotone,
    PiStorefrontDuotone,
    PiShoppingBagDuotone,
    PiShoppingCartDuotone,
    PiCubeDuotone,
    PiMegaphoneSimpleDuotone,
    PiShieldCheckDuotone,
    PiIdentificationCardDuotone,
    PiCalculatorDuotone,
    PiTagDuotone,
    PiStarDuotone,
} from 'react-icons/pi'
import type { JSX } from 'react'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    dashboard: <PiHouseLineDuotone />,
    members: <PiUsersDuotone />,
    branches: <PiStorefrontDuotone />,
    products: <PiShoppingBagDuotone />,
    orders: <PiShoppingCartDuotone />,
    stock: <PiCubeDuotone />,
    broadcast: <PiMegaphoneSimpleDuotone />,
    staffManagement: <PiIdentificationCardDuotone />,
    permissions: <PiShieldCheckDuotone />,
    costCalculation: <PiCalculatorDuotone />,
    promotions: <PiTagDuotone />,
    points: <PiStarDuotone />,
}

export default navigationIcon
