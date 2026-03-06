import classNames from 'classnames'
import { APP_NAME } from '@/constants/app.constant'
import type { CommonProps } from '@/@types/common'

interface LogoProps extends CommonProps {
    type?: 'full' | 'streamline'
    mode?: 'light' | 'dark'
    imgClass?: string
    logoWidth?: number | string
}

const Logo = (props: LogoProps) => {
    const {
        type = 'full',
        className,
        imgClass,
        style,
        logoWidth = 'auto',
    } = props

    return (
        <div
            className={classNames('logo', className)}
            style={{
                ...style,
                ...{ width: logoWidth },
            }}
        >
            <div className={classNames('flex items-center gap-2', imgClass)}>
                <img
                    className="rounded-lg"
                    src="/img/logo/posme-icon.png"
                    alt={`${APP_NAME} logo`}
                    style={{ height: 32, width: 32 }}
                />
                {type === 'full' && (
                    <span className="font-bold text-lg heading-text whitespace-nowrap">
                        POS <span className="text-orange-500">ME</span>
                    </span>
                )}
            </div>
        </div>
    )
}

export default Logo
