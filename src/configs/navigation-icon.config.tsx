import {
    PiHouseLineDuotone,
    PiUsersDuotone,
    PiStorefrontDuotone,
    PiShoppingBagDuotone,
    PiCubeDuotone,
    PiMegaphoneSimpleDuotone,
    PiShieldCheckDuotone,
    PiIdentificationCardDuotone,
} from 'react-icons/pi'
import type { JSX } from 'react'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    dashboard: <PiHouseLineDuotone />,
    members: <PiUsersDuotone />,
    branches: <PiStorefrontDuotone />,
    products: <PiShoppingBagDuotone />,
    stock: <PiCubeDuotone />,
    broadcast: <PiMegaphoneSimpleDuotone />,
    staffManagement: <PiIdentificationCardDuotone />,
    permissions: <PiShieldCheckDuotone />,
}

export default navigationIcon
