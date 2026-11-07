import { cn } from "cn"

export function PickPreview() {
    const STOCKS = [
        { symbol: "TSLA", price: "50.48", change: "+4.59%", up: true, active: false },
        { symbol: "AMZN", price: "378.27", change: "+1.59%", up: true, active: true },
        { symbol: "NFLX", price: "894.19", change: "-0.39%", up: false, active: false },
    ]
    return (
        <div className="flex mb-6 min-h-52 flex-col gap-2.5 rounded-2xl border border-white/80 bg-[#0a0b0c] p-4 font-mono" aria-hidden="true">
            {STOCKS.map((s) => (
                <div
                    key={s.symbol}
                    className={cn(
                        "grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-[10px] border px-3 py-2.5 text-[13px]",
                        s.active ? "border-green-700/35 bg-[3ddc97]/7" : "border-transparent"
                    )}
                >
                    <span className="font-bold tracking-[0.02em]">{s.symbol}</span>
                    <span className="text-[#4ddc97]">{s.price}</span>
                    <span className={s.up ? "text-green-500" : "text-red-500"}>{s.up ? "↑" : "↓"} {s.change}</span>
                </div>
            ))}
        </div>
    )
}