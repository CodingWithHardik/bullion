import { fmt, ScoreEntry } from "@/lib/game";
import { cn } from "cn";
import { tone } from "./tone";

export function Leaderboard({ scores }: { scores: ScoreEntry[] }) {
    if (scores.length === 0) return null;
    return (
        <div className="mt-6 text-left">
            <h3 className="mb-2 text-xs uppercase font-semibold tracking-wider text-muted-foreground 2xl:text-sm">Hall of Fame</h3>
            <ol className="divide-y divide-white/5 rounded-xl border border-white/10">
            {
                scores.map((s, i) => (
                    <li key={s.at} className="grid grid-cols-[1.5rem_1fr_auto_auto] items-center px-3 py-2 text-sm gap-3 tabular-nums 2xl:text-base">
                        <span className={cn("font-bold", i === 0 ? "text-red-400" : "text-muted-foreground")}>{i + 1}</span>
                        <span className="text-white truncate">{s.name}</span>
                        <span>{fmt.money(s.netWorth)}</span>
                        <span className={cn("w-16 text-right", tone(s.returnPct))}>{fmt.pct(s.returnPct)}</span>
                    </li>
                ))
            }
            </ol>
        </div>
    )
}