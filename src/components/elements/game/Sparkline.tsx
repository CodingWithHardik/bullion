import { cn } from "cn";
import { useId } from "react";

export function Sparkline({
    data,
    width,
    height,
    detailed = false,
    baseline,
    className,
}: {
    data: number[];
    width: number;
    height: number;
    detailed?: boolean;
    baseline?: number;
    className?: string;
}) {
    const gid = "g" + useId().replace(/[^a-zA-Z0-9]/g, "");
    if (data.length < 2) {
        return (
            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={cn("w-full text-white/20", className)}>
                <line x1="0" x2={width} y1={height / 2} y2={height / 2} stroke="currentColor" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
            </svg>
        )
    }

    const min = Math.min(...data, baseline ?? data[0]);
    const span = Math.max(...data, baseline ?? data[0]) - min || 1;
    const x = (i: number) => (i / (data.length - 1)) * width;
    const y = (v: number) => (detailed ? 8 : 2) + (1 - (v - min) / span) * (height - (detailed ? 8 : 2) * 2);
    const line = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className={cn("w-full", data[data.length - 1] >= (baseline ?? data[0]) ? "text-emerald-400" : "text-rose-400", className)}
        >
            {(detailed || baseline !== undefined) && (
                <>
                    <defs>
                        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1" >
                            <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
                            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={`${line} L${width},${height} L0,${height} Z`} fill={`url(#${gid})`} />
                    <line x1="0" x2={width} y1={y(baseline ?? data[0])} y2={y(baseline ?? data[0])} stroke="white" strokeOpacity="0.15" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                </>
            )}
            <path d={line} fill="none" stroke="currentColor" strokeWidth={detailed ? 2 : 1.5} vectorEffect="non-scaling-stroke" />
            {detailed && <circle cx={x(data.length - 1)} cy={y(data[data.length - 1])} r="4" fill="currentColor" />}
        </svg>
    )
}