import { cloneElement } from 'react'
import type { CommonProps } from '@/@types/common'

type SideProps = CommonProps

const Side = ({ children, ...rest }: SideProps) => {
    return (
        <div className="flex h-full p-6 bg-white dark:bg-gray-800">
            <div className="flex flex-col justify-center items-center flex-1">
                <div className="w-full xl:max-w-[450px] px-8 max-w-[380px]">
                    {children
                        ? cloneElement(children as React.ReactElement, {
                              ...rest,
                          })
                        : null}
                </div>
            </div>
            <div className="lg:flex flex-col flex-1 justify-center items-center hidden rounded-3xl relative xl:max-w-[520px] 2xl:max-w-[720px] overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)',
                }}
            >
                <div className="flex flex-col items-center gap-8 px-10 text-center z-10">
                    <img
                        src="/img/logo/posme-icon.png"
                        alt="POS ME"
                        className="w-32 h-32 rounded-3xl shadow-2xl"
                    />
                    <div>
                        <h1 className="text-white text-4xl font-bold tracking-tight">
                            POS <span className="text-orange-400">ME</span>
                        </h1>
                        <p className="text-blue-100 text-lg mt-2 font-medium">
                            Manager
                        </p>
                    </div>
                    <p className="text-blue-200 text-base max-w-[320px] leading-relaxed">
                        ระบบจัดการร้านค้าครบวงจร
                        สะดวก รวดเร็ว ใช้งานง่าย
                    </p>
                </div>
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full" />
                    <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white rounded-full" />
                    <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-white rounded-full" />
                </div>
            </div>
        </div>
    )
}

export default Side
