import { cn } from "cn";

export function Star({ label, value, sub, className }: { label: string; value: string; sub?: string; className?: string }) {
    return (
        <div className="min-w-0">
            <span className="block text-[11px] uppercase tracking-wider text-muted-foreground 2xl:text-sm">{label}</span>
            <span className={cn("block text-sm font-semibold tabular-nums text-white sm:text-base 2xl:text-2xl truncate", className)}>{value}</span>
            {sub && <span className={cn("block text-xs tabular-nums 2xl:text-sm")}>{sub}</span>}
        </div>
    )
}