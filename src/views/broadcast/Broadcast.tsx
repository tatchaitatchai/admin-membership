import { useState } from 'react'
import { PiPaperPlaneTiltDuotone } from 'react-icons/pi'

const Broadcast = () => {
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        await new Promise((r) => setTimeout(r, 1000))
        setLoading(false)
        setSent(true)
        setTitle('')
        setMessage('')
        setTimeout(() => setSent(false), 3000)
    }

    return (
        <div className="flex flex-col gap-4 max-w-2xl">
            <div>
                <h3 className="heading-text">ส่ง Broadcast</h3>
                <p className="text-sm text-gray-500 mt-0.5">ส่งข้อความแจ้งเตือนไปยังสมาชิกทุกคน</p>
            </div>

            <div className="card card-shadow p-6">
                {sent && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-medium">
                        ✓ ส่งข้อความสำเร็จแล้ว
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">หัวข้อ</label>
                        <input
                            type="text"
                            className="input input-md"
                            placeholder="หัวข้อข้อความ..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">ข้อความ</label>
                        <textarea
                            className="input input-md min-h-[120px] resize-none"
                            placeholder="เนื้อหาข้อความ..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-solid-primary flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold self-start disabled:opacity-60"
                    >
                        <PiPaperPlaneTiltDuotone className="text-base" />
                        {loading ? 'กำลังส่ง...' : 'ส่งข้อความ'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Broadcast
