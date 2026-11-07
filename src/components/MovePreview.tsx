export function MovePreview() {
    return (
        <div className="flex mb-6 min-h-52 flex-col gap-2.5 rounded-2xl border border-white/80 bg-[#0a0b0c] p-4 font-mono" aria-hidden="true">
            <div className="flex justify-between border-b border-white/8 pb-2.5 text-[15px]">
                <span className="font-bold tracking-[0.02em]">AMZN</span>
                <span className="text-green-500">378.72</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
                <span className="text-gray-400">Quantity</span>
                <div className="flex items-center gap-3">
                    <span className="grid h-6.5 w-6.5 place-items-center rounded-lg border border-white/8 text-gray-400">-</span>
                    <span className="min-w-6 text-center">10</span>
                    <span className="grid h-6.5 w-6.5 place-items-center rounded-lg border border-white/8 text-gray-400">+</span>
                </div>
            </div>
            <div className="mt-auto grid grid-cols-2 gap-2.5">
                <span className="rounded-[10px] border border-green-500/40 bg-green-500/14 py-2.5 text-center text-[13px] font-bold text-green-500">Buy</span>
                <span className="rounded-[10px] border border-red-500/40 bg-red-500/14 py-2.5 text-center text-[13px] font-bold text-red-500">Sell</span>
            </div>
        </div>
    )
}